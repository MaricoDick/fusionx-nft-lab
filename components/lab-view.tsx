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
      setFeedback("请先连接钱包后再铸造。");
      return;
    }

    try {
      setFeedback("正在发送 mint 交易...");
      setSuccessNote("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "mint"
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction("app-00X", "FusionX NFT Lab", address, txHash);
      setFeedback("");
      setSuccessNote(`Mint 成功，交易哈希：${txHash}`);
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Mint 失败，请稍后重试。");
    }
  };

  const onFuse = async () => {
    if (!isConnected || !address) {
      setFeedback("请先连接钱包后再尝试合成。");
      return;
    }

    if (selectedTokens.length !== 3) {
      setFeedback("请选择 3 枚同阶 NFT 进行合成。");
      return;
    }

    try {
      setFeedback("正在发送 fuse 交易...");
      setSuccessNote("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "fuse",
        args: [[BigInt(selectedTokens[0]), BigInt(selectedTokens[1]), BigInt(selectedTokens[2])]]
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction("app-00X", "FusionX NFT Lab", address, txHash);
      setFeedback("");
      setSuccessNote(`Fusion 交易已确认：${txHash}`);
      setSelectedTokens([]);
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Fusion 失败，请稍后重试。");
    }
  };

  return (
    <>
      <section className="page-header">
        <span className="eyebrow">Lab Console</span>
        <h1>在轻盈的实验台上，挑选三枚同阶藏品，等待概率开花。</h1>
        <p>
          合约已经部署在 Base 上。每次合成会燃烧三枚同阶 NFT，成功时铸造更高 tier，失败时则只保留实验记录。
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="status-card">
          <div className="lab-topbar">
            <div>
              <span className="card-kicker">Wallet</span>
              <h2>实验状态</h2>
            </div>
            <div className="wallet-chip">
              <span className="wallet-dot" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "未连接"}
            </div>
          </div>

          <div className="lab-summary">
            <div className="summary-tile">
              <span>持有总数</span>
              <strong>{ownedTokens.length}</strong>
            </div>
            <div className="summary-tile">
              <span>当前筛选</span>
              <strong>{getTierLabel(selectedTier)}</strong>
            </div>
            <div className="summary-tile">
              <span>已选择</span>
              <strong>{selectedTokens.length} / 3</strong>
            </div>
          </div>

          <div className="inline-actions">
            <button type="button" className="button button-primary" onClick={onMint} disabled={isPending}>
              Mint 初始 NFT
            </button>
            <button type="button" className="button button-accent" onClick={onFuse} disabled={isPending}>
              开始融合
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
            <h2>选择要参与合成的 NFT</h2>
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
              <p className="token-empty">当前 tier 暂时没有可用于合成的 NFT。</p>
            )}
          </div>

          <p className="helper-text">
            合成规则：3 枚 Tier 1 成功率 80%，Tier 2 成功率 70%，Tier 3 成功率 60%，Tier 4 为最高阶不可继续合成。
          </p>

          {feedback ? <div className="notice">{feedback}</div> : null}
          {successNote ? <div className="notice success">{successNote}</div> : null}
        </article>

        <article className="inventory-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">Inventory Overview</span>
              <h2>你的分层收藏</h2>
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
