import { useQuery } from "@tanstack/react-query";

async function fetchChains(): Promise<string[]> {
  const res = await fetch("/api/chains");
  if (!res.ok) {
    throw new Error("Failed to fetch chains");
  }
  return res.json();
}

export function useChains() {
  return useQuery({
    queryKey: ["chains"],
    queryFn: fetchChains,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
