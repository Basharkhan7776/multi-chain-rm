"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConnectButton } from "@/components/wallet/connect-button";
import { setAddress, setIsConnected } from "@/lib/store/features/wallet-slice";
import { useAppDispatch } from "@/lib/store/store";
import { useAccount } from "wagmi";
import { FadeIn } from "@/components/shared/fade-in";
import { motion } from "framer-motion";

import { Suspense } from "react";
import ColorBends from "@/components/ColorBends";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
// ... imports

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAccount();
  const [inputAddress, setInputAddress] = useState<boolean>(false);
  const [manualAddress, setManualAddress] = useState("");

  const handleManualSubmit = () => {
    const addr = manualAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      toast.error("Please enter a valid EVM address");
      return;
    }
    dispatch(setAddress(addr));
    dispatch(setIsConnected(true));
    router.push("/dashboard");
  };

  // Handle query param
  useEffect(() => {
    const addrParam = searchParams.get("addr");
    if (addrParam) {
      dispatch(setAddress(addrParam));
      dispatch(setIsConnected(true));
      router.push("/dashboard");
    }
  }, [searchParams, dispatch, router]);

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      dispatch(setAddress(address));
      dispatch(setIsConnected(true));
      router.push("/dashboard");
    }
  }, [isConnected, address, dispatch, router]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <ColorBends
          rotation={54}
          autoRotate={0}
          speed={0.1}
          scale={3}
          mouseInfluence={0}
        />
      </div>
      <FadeIn duration={0.6} className="w-full max-w-2xl z-10">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center space-y-2"
          >
            {inputAddress ? (
              <>
                <Input
                  placeholder="0x..."
                  className="w-44 px-4 py-3 text-base font-medium text-center"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleManualSubmit();
                  }}
                  autoFocus
                />
                <div className="flex space-x-2 w-44 justify-between">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setInputAddress(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    className="flex-1 text-base font-medium"
                    onClick={handleManualSubmit}
                    disabled={!manualAddress}
                  >
                    Submit
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ConnectButton />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-44 px-6 py-3 text-base font-medium"
                  onClick={() => setInputAddress(true)}
                >
                  Manual Input
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </FadeIn>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
