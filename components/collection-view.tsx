"use client";

import { useMemo } from "react";
import { getTierLabel, summarizeByTier } from "@/lib/fusion";
import { useOwnedTokens } from "@/lib/use-owned-tokens";

export function CollectionView() {
  const { isConnected, ownedTokens } = useOwnedTokens({
    sortBy: "tierThenId"
  });

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
