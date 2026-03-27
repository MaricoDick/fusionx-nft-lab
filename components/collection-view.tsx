"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { fusionAbi, fusionContract } from "@/lib/contracts";
import { getTierLabel, summarizeByTier } from "@/lib/fusion";

type TokenRecord = {
  tokenId: number;
  tier: number;
};

const maxScan = Array.from({ length: 36 }, (_, index) => BigInt(index + 1));

export function CollectionView() {
  const { address, isConnected } = useAccount();

  const { data: nextId } = useReadContract({
    ...fusionContract,
    abi: fusionAbi,
    functionName: "nextId",
    query: { refetchInterval: 8000 }
  });

  const tokenIds = useMemo(() => {
    const upperBound = Number(nextId ?? BigInt(1)) - 1;
    if (upperBound <= 0) {
      return [];
    }

    return maxScan.slice(0, Math.min(maxScan.length, upperBound));
  }, [nextId]);

  const { data: tokenReads } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) => [
      { ...fusionContract, abi: fusionAbi, functionName: "ownerOf", args: [tokenId] },
      { ...fusionContract, abi: fusionAbi, functionName: "tierOf", args: [tokenId] }
    ]),
    allowFailure: true,
    query: {
      enabled: tokenIds.length > 0,
      refetchInterval: 10000
    }
  });

  const ownedTokens = useMemo<TokenRecord[]>(() => {
    if (!address || !tokenReads?.length) {
      return [];
    }

    const normalized = address.toLowerCase();
    const items: TokenRecord[] = [];

    for (let index = 0; index < tokenIds.length; index += 1) {
      const owner = tokenReads[index * 2]?.result as string | undefined;
      const tier = Number(tokenReads[index * 2 + 1]?.result ?? BigInt(0));
      if (owner?.toLowerCase() === normalized && tier > 0) {
        items.push({ tokenId: Number(tokenIds[index]), tier });
      }
    }

    return items.sort((a, b) => a.tier - b.tier || a.tokenId - b.tokenId);
  }, [address, tokenIds, tokenReads]);

  const grouped = useMemo(() => summarizeByTier(ownedTokens), [ownedTokens]);

  return (
    <>
      <section className="page-header">
        <span className="eyebrow">Collection</span>
        <h1>Your base creatures, upgraded forms, and rare outcomes are all laid out here in one soft gallery.</h1>
        <p>
          This page is focused on holdings, not charts. Each NFT shows its tier and token id so you can decide your next fusion strategy quickly.
        </p>
      </section>

      <section className="collection-grid">
        <article className="collection-panel">
          <div className="collection-header">
            <div>
              <span className="card-kicker">Owned Tokens</span>
              <h2>My NFTs</h2>
            </div>
            <div className="collection-count">{ownedTokens.length}</div>
          </div>

          {!isConnected ? (
            <p className="helper-text">Connect your wallet to see the NFTs you hold in the FusionX contract.</p>
          ) : ownedTokens.length === 0 ? (
            <p className="helper-text">You do not hold any NFTs yet. Head to the lab and mint a base one first.</p>
          ) : (
            <div className="token-list">
              {ownedTokens.map((token) => (
                <div key={token.tokenId} className="token-row">
                  <div>
                    <strong>Token #{token.tokenId}</strong>
                    <p>{getTierLabel(token.tier)}</p>
                  </div>
                  <span>{token.tier}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="collection-panel">
          <span className="card-kicker">Tier Summary</span>
          <h2>Current distribution</h2>
          <div className="status-stack">
            {grouped.map((item) => (
              <div key={item.tier} className="status-row">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
