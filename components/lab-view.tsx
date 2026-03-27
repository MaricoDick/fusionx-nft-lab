"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { fusionAbi, fusionContract } from "@/lib/contracts";
import { getTierLabel, summarizeByTier } from "@/lib/fusion";
import { trackTransaction } from "@/utils/track";
import { wagmiConfig } from "@/app/wagmi";

type TokenRecord = {
  tokenId: number;
  tier: number;
};

const scanWindow = Array.from({ length: 36 }, (_, index) => BigInt(index + 1));

export function LabView() {
  const { address, isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [successNote, setSuccessNote] = useState<string>("");
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: nextId } = useReadContract({
    ...fusionContract,
    abi: fusionAbi,
    functionName: "nextId",
    query: {
      refetchInterval: 8000
    }
  });

  const tokenIds = useMemo(() => {
    const upperBound = Number(nextId ?? BigInt(1)) - 1;
    if (upperBound <= 0) {
      return [];
    }

    const count = Math.min(upperBound, scanWindow.length);
    return scanWindow.slice(0, count);
  }, [nextId]);

  const { data: tokenReads, refetch } = useReadContracts({
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
      const ownerResult = tokenReads[index * 2];
      const tierResult = tokenReads[index * 2 + 1];
      const owner = ownerResult?.result as string | undefined;
      const tier = Number(tierResult?.result ?? BigInt(0));

      if (owner?.toLowerCase() === normalized && tier > 0) {
        items.push({ tokenId: Number(tokenIds[index]), tier });
      }
    }

    return items.sort((a, b) => a.tokenId - b.tokenId);
  }, [address, tokenIds, tokenReads]);

  const currentTierTokens = useMemo(
    () => ownedTokens.filter((token) => token.tier === selectedTier),
    [ownedTokens, selectedTier]
  );

  const summary = useMemo(() => summarizeByTier(ownedTokens), [ownedTokens]);

  useEffect(() => {
    setSelectedTokens([]);
  }, [selectedTier, address]);

  const toggleToken = (tokenId: number) => {
    setFeedback("");
    setSuccessNote("");
    setSelectedTokens((current) => {
      if (current.includes(tokenId)) {
        return current.filter((item) => item !== tokenId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, tokenId];
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
      trackTransaction("app-001", "FusionX NFT Lab", address, txHash);
      setFeedback("");
      setSuccessNote(`Mint confirmed: ${txHash}`);
      await refetch();
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
      trackTransaction("app-001", "FusionX NFT Lab", address, txHash);
      setFeedback("");
      setSuccessNote(`Fusion confirmed: ${txHash}`);
      setSelectedTokens([]);
      await refetch();
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
                onClick={() => setSelectedTier(tier)}
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
