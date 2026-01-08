
import { NextResponse } from "next/server";
import { getSdk } from "@euclidprotocol/graphql-codegen/dist/src/node";
import { GraphQLClient } from "graphql-request";

const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";
const client = new GraphQLClient(GQL_ENDPOINT);
const sdk = getSdk(client);

interface TokenMetadata {
    tokenId: string;
    displayName: string;
    image: string;
    price: string;
    coinDecimal: number;
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
    // 1. Fetch router state
    const routerStateRes = await sdk.CODEGEN_GENERATED_ROUTER_STATE();
    const virtualBalanceAddress =
      routerStateRes.router.state.virtual_balance_address;

    // 2. Fetch all available EVM chains
    const chainsRes = await sdk.CODEGEN_GENERATED_CHAINS_ALL_CHAINS();
    const allChains = chainsRes.chains.all_chains;
    const evmChains = allChains.filter((c) =>
      c.factory_address.startsWith("0x"),
    );

    // Fetch token metadata
    // We try/catch this separately in case it fails, or just let it fail the request?
    // The user example awaits it directly.
    const tokenMetadataRes =
      await sdk.CODEGEN_GENERATED_TOKEN_TOKEN_METADATAS();
    const tokenMetadatas = tokenMetadataRes.token.token_metadatas;
    // Map token metadata by tokenId for easy lookup
    const tokenMap = new Map<string, any>(tokenMetadatas.map((t) => [t.tokenId, t]));

    // Construct batch queries
    const queries = evmChains.map((chain) => {
      const msg = {
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
      };

      return {
        contract_address: virtualBalanceAddress,
        msg: msg,
      };
    });

    const multicallRes =
      await sdk.CODEGEN_GENERATED_CW_MULTICALL_SMART_QUERIES({
        chain_uid: "neuron",
        cw_multicall_smart_queries_queries: queries,
      });

    // 4. Format the response
    const results = multicallRes.cw_multicall.smart_queries.results;

    const formattedResponse = results.map((res, index) => {
      const chain = evmChains[index];
      const baseInfo = {
        display_name: chain.display_name,
        chain_uid: chain.chain_uid,
        chain_img: chain.logo,
      };

      if (res.error) {
        return {
          ...baseInfo,
          error: res.error,
          balances: []
        };
      }

      if (res.success && res.success.balances) {
        const enhancedBalances = res.success.balances.map((bal: any) => {
          const meta = tokenMap.get(bal.token_id);
          return {
            ...bal,
            displayName: meta?.displayName, // Changed prompt's 'displayName' to match interface if needed but user prompt had camelCase
            image: meta?.image,
            price: meta?.price,
            decimals: meta?.coinDecimal, // User prompt mapped coinDecimal to decimals
          };
        });

        // If balances are empty, include the raw response to debug potential hidden errors
        if (enhancedBalances.length === 0) {
          return {
            ...baseInfo,
            balances: [],
            raw_error_check: res,
          };
        }

        return {
          ...baseInfo,
          balances: enhancedBalances,
        };
      }

      return { ...baseInfo, error: "Unknown error or empty response", balances: [] };
    });

    return NextResponse.json(formattedResponse, {
        headers: {
            'Cache-Control': 'no-store, max-age=0'
        }
    });

  } catch (error: any) {
    console.error("Error fetching balances:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
