
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MockChainData } from "@/lib/mock-data";
import { formatCompactNumber } from "@/lib/utils";

interface ChainCardProps {
  chain: MockChainData;
}

export function ChainCard({ chain }: ChainCardProps) {
  const isEmpty = chain.balances.length === 0;

  return (
    <Card className={`h-full flex flex-col ${isEmpty ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold capitalize flex items-center gap-2">
            {/* Placeholder Icon */}
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
              {chain.name[0]}
            </div>
            {chain.name}
          </CardTitle>
          <Badge variant={isEmpty ? "secondary" : "default"}>
            {isEmpty ? "Empty" : `${chain.balances.length} Tokens`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isEmpty ? (
          <div className="h-[100px] flex items-center justify-center text-sm text-muted-foreground italic">
            No assets found
          </div>
        ) : (
          <ScrollArea className="h-[150px] pr-4">
            <div className="space-y-2">
              {chain.balances.map((token, idx) => (
                <div
                  key={`${token.token_id}-${idx}`}
                  className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 py-2"
                >
                  <span className="font-medium text-foreground">{token.token_id}</span>
                  <span className="text-muted-foreground font-mono">{formatCompactNumber(token.amount)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
