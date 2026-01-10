"use client";

import * as React from "react";
import { useConnect } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Image from "next/image";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect();

  const handleConnect = (connector: any) => {
    connect({ connector });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the application.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="flex flex-col gap-3">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-between h-14 px-4"
                onClick={() => handleConnect(connector)}
                disabled={isPending}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative flex items-center justify-center">
                    {connector.icon ? (
                      <img
                        src={connector.icon}
                        alt={connector.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Wallet className="w-6 h-6" />
                    )}
                  </div>
                  <span className="font-medium text-base">
                    {connector.name}
                  </span>
                </div>
                {isPending && (
                  <span className="text-xs text-muted-foreground">
                    Connecting...
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
