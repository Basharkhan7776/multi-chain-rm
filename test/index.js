// CONFIGURATION
const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";
const USER_WALLET = "0x887e4aac216674d2c432798f851c1ea5d505b2e1"; // The address you provided

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

// HELPER: GENERIC FETCHER
async function fetchGraphQL(query, variables = {}) {
  const response = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
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

// MAIN EXECUTION
async function getAllData() {
  console.log(`🚀 Starting fetch for wallet: ${USER_WALLET}\n`);

  try {
    // STEP 1: Get Virtual Router Address
    console.log("1️⃣  Fetching Router State...");
    const routerData = await fetchGraphQL(ROUTER_QUERY);
    const virtualAddress = routerData.router.state.virtual_balance_address;
    console.log(`   ✅ Router Address: ${virtualAddress}`);

    // STEP 2: Get All Available Chains
    console.log("\n2️⃣  Fetching Chain List...");
    const chainsData = await fetchGraphQL(CHAINS_QUERY);
    const chains = chainsData.chains.all_evm_chains.map((c) => c.chain_uid);
    console.log(`   ✅ Found ${chains.length} chains: ${chains.join(", ")}`);

    // STEP 3: Fetch Balances for ALL chains in Parallel
    console.log("\n3️⃣  Fetching Balances across all chains...");
    
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
                  address: USER_WALLET,
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
        // If a chain fails, return empty balances as per instructions
        return {
          chain_uid: chainUid,
          balances: []
        };
      }
    });

    const results = await Promise.all(balancePromises);

    // PROCESS & DISPLAY RESULTS
    console.log("\n📊 FINAL RESULTS:");
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
  }
}

// Run it
getAllData();
