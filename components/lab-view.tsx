"use client";

import { useMemo, useState } from "react";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { fusionAbi, fusionContract } from "@/lib/contracts";
import { getTierLabel, summarizeByTier } from "@/lib/fusion";
import { trackTransaction } from "@/utils/track";
import { wagmiConfig } from "@/app/wagmi";
import { useOwnedTokens } from "@/lib/use-owned-tokens";

export function LabView() {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [selectedTokensByScope, setSelectedTokensByScope] = useState<Record<string, number[]>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [successNote, setSuccessNote] = useState<string>("");
  const { writeContractAsync, isPending } = useWriteContract();
  const { address, isConnected, ownedTokens, refetchOwnedTokens } = useOwnedTokens({
    sortBy: "tokenId"
  });
  const selectionScope = `${address ?? "disconnected"}:${selectedTier}`;
  const selectedTokens = selectedTokensByScope[selectionScope] ?? [];

  const currentTierTokens = useMemo(
    () => ownedTokens.filter((token) => token.tier === selectedTier),
    [ownedTokens, selectedTier]
  );

  const summary = useMemo(() => summarizeByTier(ownedTokens), [ownedTokens]);

  const toggleToken = (tokenId: number) => {
    setFeedback("");
    setSuccessNote("");
    setSelectedTokensByScope((current) => {
      const scoped = current[selectionScope] ?? [];

      if (scoped.includes(tokenId)) {
        return { ...current, [selectionScope]: scoped.filter((item) => item !== tokenId) };
      }

      if (scoped.length >= 3) {
        return current;
      }

      return { ...current, [selectionScope]: [...scoped, tokenId] };
    });
  };

  const onMint = async () => {
    if (!isConnected || !address) {
      setFeedback("Connect your wallet before minting.");
      return;
    }

    try {
      setFeedback("Submitting mint transaction...");
      setSuccessNote("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "mint"
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction(address, txHash, "mint");
      setFeedback("");
      setSuccessNote(`Mint confirmed: ${txHash}`);
      await refetchOwnedTokens();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Mint failed. Please try again.");
    }
  };

  const onFuse = async () => {
    if (!isConnected || !address) {
      setFeedback("Connect your wallet before fusing.");
      return;
    }

    if (selectedTokens.length !== 3) {
      setFeedback("Select 3 NFTs of the same tier to fuse.");
      return;
    }

    try {
      setFeedback("Submitting fusion transaction...");
      setSuccessNote("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "fuse",
        args: [[BigInt(selectedTokens[0]), BigInt(selectedTokens[1]), BigInt(selectedTokens[2])]]
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction(address, txHash, "fuse");
      setFeedback("");
      setSuccessNote(`Fusion confirmed: ${txHash}`);
      setSelectedTokensByScope((current) => ({ ...current, [selectionScope]: [] }));
      await refetchOwnedTokens();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Fusion failed. Please try again.");
    }
  };

  return (
    <>
      <section className="page-header">
        <span className="eyebrow">Lab Console</span>
        <h1>Pick three matching NFTs on a calmer control panel and wait for the onchain odds to bloom.</h1>
        <p>
          The contract is already live on Base. Every fusion burns three NFTs of the same tier, then mints a higher tier if the probability check succeeds.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="status-card">
          <div className="lab-topbar">
            <div>
              <span className="card-kicker">Wallet</span>
              <h2>Lab status</h2>
            </div>
            <div className="wallet-chip">
              <span className="wallet-dot" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </div>
          </div>

          <div className="lab-summary">
            <div className="summary-tile">
              <span>Total held</span>
              <strong>{ownedTokens.length}</strong>
            </div>
            <div className="summary-tile">
              <span>Current filter</span>
              <strong>{getTierLabel(selectedTier)}</strong>
            </div>
            <div className="summary-tile">
              <span>Selected</span>
              <strong>{selectedTokens.length} / 3</strong>
            </div>
          </div>

          <div className="inline-actions">
            <button type="button" className="button button-primary" onClick={onMint} disabled={isPending}>
              Mint Base NFT
            </button>
            <button type="button" className="button button-accent" onClick={onFuse} disabled={isPending}>
              Start Fusion
            </button>
          </div>

          <div className="tier-badges">
            {[1, 2, 3, 4].map((tier) => (
              <button
                key={tier}
                type="button"
                className={`button ${selectedTier === tier ? "button-primary" : "button-secondary"}`}
                onClick={() => {
                  setSelectedTier(tier);
                  const nextScope = `${address ?? "disconnected"}:${tier}`;
                  setSelectedTokensByScope((current) => ({ ...current, [nextScope]: [] }));
                }}
              >
                {getTierLabel(tier)}
              </button>
            ))}
          </div>

          <div>
            <span className="card-kicker">Tier Selection</span>
            <h2>Select the NFTs you want to fuse</h2>
            {currentTierTokens.length > 0 ? (
              <div className="selection-grid">
                {currentTierTokens.map((token) => {
                  const active = selectedTokens.includes(token.tokenId);
                  return (
                    <button
                      key={token.tokenId}
                      type="button"
                      className={`token-button ${active ? "active" : ""}`}
                      onClick={() => toggleToken(token.tokenId)}
                    >
                      <strong>#{token.tokenId}</strong>
                      <span>{getTierLabel(token.tier)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="token-empty">No NFTs are available for this tier right now.</p>
            )}
          </div>

          <p className="helper-text">
            Fusion rules: Tier 1 succeeds at 80%, Tier 2 at 70%, Tier 3 at 60%, and Tier 4 is the final class.
          </p>

          {feedback ? <div className="notice">{feedback}</div> : null}
          {successNote ? <div className="notice success">{successNote}</div> : null}
        </article>

        <article className="inventory-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">Inventory Overview</span>
              <h2>Your tier spread</h2>
            </div>
          </div>
          <div className="status-stack">
            {summary.map((item) => (
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
