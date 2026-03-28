"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { fusionAbi, fusionContract } from "@/lib/contracts";
import { NFT_SCAN_LIMIT } from "@/lib/env";

export type OwnedToken = {
  tokenId: number;
  tier: number;
};

type SortMode = "tokenId" | "tierThenId";

type UseOwnedTokensOptions = {
  sortBy?: SortMode;
  refetchIntervalMs?: number;
};

const DEFAULT_REFETCH_INTERVAL_MS = 10000;

const toSafeNumber = (value: bigint | undefined) => {
  if (value === undefined || value <= 0n) return 0;

  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
  return Number(value > maxSafe ? maxSafe : value);
};

const buildTokenIdRange = (upperBound: number) =>
  Array.from({ length: upperBound }, (_, index) => BigInt(index + 1));

export function useOwnedTokens(options: UseOwnedTokensOptions = {}) {
  const { sortBy = "tokenId", refetchIntervalMs = DEFAULT_REFETCH_INTERVAL_MS } = options;
  const warnedScanLimitRef = useRef(false);
  const { address, isConnected } = useAccount();

  const { data: supplyReads } = useReadContracts({
    contracts: [
      {
        ...fusionContract,
        abi: fusionAbi,
        functionName: "nextId"
      },
      {
        ...fusionContract,
        abi: fusionAbi,
        functionName: "totalSupply"
      }
    ],
    allowFailure: true,
    query: {
      refetchInterval: refetchIntervalMs
    }
  });

  const nextId = supplyReads?.[0]?.result as bigint | undefined;
  const totalSupply = supplyReads?.[1]?.result as bigint | undefined;

  const maxTokenId = useMemo(() => {
    const nextIdValue = toSafeNumber(nextId);
    if (nextIdValue > 0) {
      return nextIdValue - 1;
    }

    return toSafeNumber(totalSupply);
  }, [nextId, totalSupply]);

  const scanUpperBound = useMemo(() => {
    if (maxTokenId <= 0) return 0;
    if (NFT_SCAN_LIMIT <= 0) return maxTokenId;
    return Math.min(maxTokenId, NFT_SCAN_LIMIT);
  }, [maxTokenId]);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !warnedScanLimitRef.current &&
      NFT_SCAN_LIMIT > 0 &&
      maxTokenId > NFT_SCAN_LIMIT
    ) {
      warnedScanLimitRef.current = true;
      console.warn(
        `[nft] NEXT_PUBLIC_NFT_SCAN_LIMIT=${NFT_SCAN_LIMIT} is active. Only tokenId range 1..${NFT_SCAN_LIMIT} will be scanned.`
      );
    }
  }, [maxTokenId]);

  const tokenIds = useMemo(() => buildTokenIdRange(scanUpperBound), [scanUpperBound]);

  const { data: tokenReads, refetch, isFetching } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) => [
      {
        ...fusionContract,
        abi: fusionAbi,
        functionName: "ownerOf",
        args: [tokenId]
      },
      {
        ...fusionContract,
        abi: fusionAbi,
        functionName: "tierOf",
        args: [tokenId]
      }
    ]),
    allowFailure: true,
    query: {
      enabled: tokenIds.length > 0,
      refetchInterval: refetchIntervalMs
    }
  });

  const ownedTokens = useMemo<OwnedToken[]>(() => {
    if (!address || !tokenReads?.length) return [];

    const normalizedAddress = address.toLowerCase();
    const tokens: OwnedToken[] = [];

    for (let index = 0; index < tokenIds.length; index += 1) {
      const owner = tokenReads[index * 2]?.result as string | undefined;
      const tier = Number(tokenReads[index * 2 + 1]?.result ?? 0n);

      if (owner?.toLowerCase() === normalizedAddress && tier > 0) {
        tokens.push({ tokenId: Number(tokenIds[index]), tier });
      }
    }

    if (sortBy === "tierThenId") {
      return tokens.sort((a, b) => a.tier - b.tier || a.tokenId - b.tokenId);
    }

    return tokens.sort((a, b) => a.tokenId - b.tokenId);
  }, [address, sortBy, tokenIds, tokenReads]);

  return {
    address,
    isConnected,
    isFetchingOwnedTokens: isFetching,
    maxTokenId,
    ownedTokens,
    refetchOwnedTokens: refetch
  };
}
