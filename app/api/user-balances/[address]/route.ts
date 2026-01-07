
import { NextResponse } from "next/server";

// CONFIGURATION
const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";

// QUERY DEFINITIONS
const ROUTER_QUERY = `
  query {
    router {
      state {
        virtual_balance_address
      }
    }
  }
`;

const CHAINS_QUERY = `
  query {
    chains {
      all_evm_chains {
        chain_uid
      }
    }
  }
`;

const BALANCE_QUERY = `
  query Balances($chain_uid: String!, $queries: [SmartQueryInput!]!) {
    cw_multicall(chain_uid: $chain_uid) {
      smart_queries(queries: $queries) {
        results {
          success
        }
      }
    }
  }
`;

// TYPES
interface Chain {
  chain_uid: string;
  display_name?: string;
  icon?: string;
}

interface TokenBalance {
  token_id: string;
  amount: string;
}

interface ChainBalanceResponse {
  chain_uid: string;
  balances: TokenBalance[];
}

// HELPER: GENERIC FETCHER
async function fetchGraphQL(query: string, variables = {}) {
  const response = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText} - ${JSON.stringify(json)}`);
  }

  if (json.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    // STEP 1: Get Virtual Router Address
    console.log("1️⃣ Fetching Router State...");
    const routerData = await fetchGraphQL(ROUTER_QUERY);
    const virtualAddress = routerData.router.state.virtual_balance_address;
    console.log("✅ Router Address:", virtualAddress);

    // STEP 2: Get All Available Chains
    console.log("2️⃣ Fetching Chain List...");
    const chainsData = await fetchGraphQL(CHAINS_QUERY);
    const chains: Chain[] = chainsData.chains.all_evm_chains;
    console.log(`✅ Found ${chains.length} chains`);
    
    // STEP 3: Fetch Balances for ALL chains in Parallel
    console.log("3️⃣ Fetching Balances...");
    const balancePromises = chains.map(async (chain) => {
      const variables = {
        chain_uid: "neuron",
        queries: [
          {
            contract_address: virtualAddress,
            msg: {
              get_user_balances: {
                user: {
                  chain_uid: chain.chain_uid,
                  address: address,
                },
                pagination: {
                  skip: 0,
                  limit: 10,
                },
              },
            },
          },
        ],
      };

      try {
        const response = await fetch(GQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: BALANCE_QUERY, variables }),
            cache: 'no-store'
        });
        
        const json = await response.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));

        const results = json.data.cw_multicall.smart_queries.results;
        
        let balances: TokenBalance[] = [];
        if (results && results.length > 0 && results[0].success) {
          const data = results[0].success;
          
          // Index.js assumes 'data' is already the object with balances.
          // We will strictly follow that.
          if (data && data.balances) {
            balances = data.balances.map((b: any) => ({
              token_id: b.token_id,
              amount: b.amount
            }));
          } else {
             // Fallback: Check if it LOOKS like base64 string, just in case index.js environment was different
             // But avoiding atob crash.
             if (typeof data === 'string') {
                 console.warn(`[${chain.chain_uid}] Received string success data, likely base64. Ensure msg was correct.`);
             }
          }
        }

        return {
          chain_uid: chain.chain_uid,
          name: chain.display_name || chain.chain_uid,
          balances: balances
        };
      } catch (err) {
        console.error(`Failed to fetch for ${chain.chain_uid}:`, err);
        return {
          chain_uid: chain.chain_uid,
          name: chain.display_name || chain.chain_uid,
          balances: []
        };
      }
    });

    const results = await Promise.all(balancePromises);
    console.log("✅ Done fetching balances.");
    return NextResponse.json(results);

  } catch (error: any) {
    console.error("❌ API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
