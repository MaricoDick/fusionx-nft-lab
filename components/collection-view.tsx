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
        <h1>你的实验体、进阶体和稀有成果，都按柔和的方式陈列在这里。</h1>
        <p>
          这个页面专注查看持仓，不把信息塞进复杂图表。每一枚 NFT 都能看到 tier 与 token id，方便你决定下一步合成策略。
        </p>
      </section>

      <section className="collection-grid">
        <article className="collection-panel">
          <div className="collection-header">
            <div>
              <span className="card-kicker">Owned Tokens</span>
              <h2>我的 NFT</h2>
            </div>
            <div className="collection-count">{ownedTokens.length}</div>
          </div>

          {!isConnected ? (
            <p className="helper-text">连接钱包后，这里会显示你在 FusionX 合约里的 NFT。</p>
          ) : ownedTokens.length === 0 ? (
            <p className="helper-text">你还没有持有 NFT，先去实验室 mint 一枚基础体吧。</p>
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
          <h2>当前分布</h2>
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
