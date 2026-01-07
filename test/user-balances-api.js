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

// Simple In-Memory Cache
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchGraphQL(query, variables = {}) {
  const response = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} - ${JSON.stringify(json)}`);
  }

  if (json.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

export async function GET(request, { params }) {
  const { address } = params;

  // Check Cache
  const cachedData = cache.get(address);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedData.data);
  }

  try {
    // 1. Get Virtual Router Address
    const routerData = await fetchGraphQL(ROUTER_QUERY);
    const virtualAddress = routerData.router.state.virtual_balance_address;

    // 2. Get All Available Chains
    const chainsData = await fetchGraphQL(CHAINS_QUERY);
    const chains = chainsData.chains.all_evm_chains.map((c) => c.chain_uid);

    // 3. Fetch Balances for ALL chains in Parallel
    const balancePromises = chains.map(async (chainUid) => {
      const variables = {
        chain_uid: "neuron",
        queries: [
          {
            contract_address: virtualAddress,
            msg: {
              get_user_balances: {
                user: {
                  chain_uid: chainUid,
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
        const result = await fetchGraphQL(BALANCE_QUERY, variables);
        const results = result.cw_multicall.smart_queries.results;
        
        let balances = [];
        if (results && results.length > 0 && results[0].success) {
          const data = results[0].success;
          if (data && data.balances) {
            balances = data.balances.map(b => ({
              token_id: b.token_id,
              amount: b.amount
            }));
          }
        }

        return {
          chain_uid: chainUid,
          balances: balances
        };
      } catch (err) {
        return {
          chain_uid: chainUid,
          balances: []
        };
      }
    });

    const finalResults = await Promise.all(balancePromises);

    // Update Cache
    cache.set(address, {
      timestamp: Date.now(),
      data: finalResults,
    });

    return NextResponse.json(finalResults);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
