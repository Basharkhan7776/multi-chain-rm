import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Chain } from "@/lib/types";
import {
  formatCompactNumber,
  formatCurrency,
  getAdjustedAmount,
  formatCardTokenAmount,
  formatDetailedBalance,
} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChainCardProps {
  chain: Chain;
}

export function ChainCard({ chain }: ChainCardProps) {
  const isEmpty = chain.balances.length === 0;

  // Calculate Total Value
  const totalValue = chain.balances.reduce((acc, token) => {
    if (token.price) {
      // Default to 18 decimals if undefined, or use token.decimals
      const decimals = token.decimals ?? 18;
      const adjustedAmount = getAdjustedAmount(token.amount, decimals);
      return acc + adjustedAmount * parseFloat(token.price);
    }
    return acc;
  }, 0);

  const CardContentComponent = (
    <Card
      className={`h-full flex flex-col ${isEmpty ? "opacity-60" : ""} ${
        !isEmpty
          ? "hover:scale-[1.02] transition-transform cursor-pointer"
          : "cursor-default"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold capitalize flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={chain.chain_img} alt={chain.display_name} />
              <AvatarFallback className="text-xs">
                {chain.display_name[0]}
              </AvatarFallback>
            </Avatar>
            {chain.display_name}
          </CardTitle>
          <div className="text-right">
            <div className="text-sm font-bold">
              {formatCurrency(totalValue)}
            </div>
            <Badge
              variant={isEmpty ? "secondary" : "outline"}
              className="text-[10px] h-5"
            >
              {isEmpty ? "Empty" : `${chain.balances.length} Tokens`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isEmpty ? (
          <div className="h-[100px] flex items-center justify-center text-sm text-muted-foreground italic">
            No assets found
          </div>
        ) : (
          <ScrollArea className="h-[150px] pr-4">
            <div className="space-y-3">
              {chain.balances.slice(0, 3).map((token, idx) => (
                <div
                  key={`${token.token_id}-${idx}`}
                  className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 py-2 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    {token.image ? (
                      <Avatar className="h-5 w-5 shrink-0">
                        <AvatarImage
                          src={token.image}
                          alt={token.displayName || token.token_id}
                        />
                        <AvatarFallback className="text-[10px]">
                          {token.token_id[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] shrink-0">
                        {token.token_id[0]}
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground leading-none truncate">
                        {token.displayName || token.token_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-foreground font-mono font-medium">
                      {formatCardTokenAmount(
                        token.amount,
                        token.decimals ?? 18
                      )}
                    </span>
                    {token.price && (
                      <span className="text-xs text-muted-foreground">
                        ${parseFloat(token.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {chain.balances.length > 3 && (
                <div className="text-xs text-center text-muted-foreground py-2">
                  + {chain.balances.length - 3} more tokens...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );

  if (isEmpty) {
    return <div className="h-full">{CardContentComponent}</div>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="h-full">{CardContentComponent}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-7xl w-full max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chain.chain_img} alt={chain.display_name} />
              <AvatarFallback>{chain.display_name[0]}</AvatarFallback>
            </Avatar>
            {chain.display_name} Assets
          </DialogTitle>
          <div className="text-muted-foreground">
            Total Value:{" "}
            <span className="text-foreground font-bold">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] rounded-md border p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chain.balances.map((token, idx) => {
                const price = token.price ? parseFloat(token.price) : 0;
                const decimals = token.decimals ?? 18;
                const adjustedAmount = getAdjustedAmount(
                  token.amount,
                  decimals
                );
                const value = price * adjustedAmount;

                return (
                  <TableRow key={`${token.token_id}-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {token.image ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={token.image}
                              alt={token.displayName || token.token_id}
                            />
                            <AvatarFallback>{token.token_id[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                            {token.token_id[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold">
                            {token.displayName || token.token_id}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {token.token_id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {price > 0 ? formatCurrency(price) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatDetailedBalance(adjustedAmount)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(value)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
