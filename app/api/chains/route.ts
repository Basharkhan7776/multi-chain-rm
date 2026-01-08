import { NextResponse } from "next/server";
import { getSdk } from "@euclidprotocol/graphql-codegen/dist/src/node";
import { GraphQLClient } from "graphql-request";

const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";
const client = new GraphQLClient(GQL_ENDPOINT);
const sdk = getSdk(client as any);

export async function GET() {
  try {
    const chainsRes = await sdk.CODEGEN_GENERATED_CHAINS_ALL_CHAINS();
    const allChains = chainsRes.chains.all_chains;
    
    // Filter for EVM chains as per existing logic
    const evmChains = allChains.filter((c) =>
      c.factory_address.startsWith("0x"),
    );

    const chainList = evmChains.map(c => c.display_name).sort();

    return NextResponse.json(chainList, {
        headers: {
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
    });

  } catch (error: any) {
    console.error("Error fetching chains:", error);
    return NextResponse.json({ error: "Failed to fetch chains" }, { status: 500 });
  }
}
