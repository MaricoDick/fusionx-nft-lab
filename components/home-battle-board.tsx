"use client";

import { useMemo, useState } from "react";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { fusionAbi, fusionContract } from "@/lib/contracts";
import { wagmiConfig } from "@/app/wagmi";
import { getTierLabel } from "@/lib/fusion";
import { trackTransaction } from "@/utils/track";
import { useOwnedTokens } from "@/lib/use-owned-tokens";

const opponentSquad = [
  { name: "Sun Sprout", tier: 2, mood: "Sunny shield" },
  { name: "Cloud Puff", tier: 2, mood: "Wind dodge" },
  { name: "Berry Blink", tier: 2, mood: "Candy crit" }
];

const howToPlay = [
  {
    step: "1",
    title: "Drag three NFTs into formation",
    description: "Move your creatures into the three player slots. All three need to match in tier before battle can begin."
  },
  {
    step: "2",
    title: "Set your wager mood",
    description: "Use the slider and input to set this round's wager value. It is a front-end battle signal, not a separate onchain bet."
  },
  {
    step: "3",
    title: "Tap Start Battle",
    description: "The primary CTA sends a direct `fuse()` contract call, burns the trio, and waits for the onchain result."
  }
];

const battleFeed = [
  { player: "0x48A1...1c92", move: "Tier 1 fusion", result: "Win · Minted Tier 2", pot: "32.4 XP" },
  { player: "0x8f21...0ae4", move: "Tier 2 fusion", result: "Miss · Burned trio", pot: "21.8 XP" },
  { player: "0x2Bd9...77d1", move: "Tier 3 fusion", result: "Win · Minted Tier 4", pot: "57.6 XP" }
];

export function HomeBattleBoard() {
  const { address, isConnected, ownedTokens, refetchOwnedTokens } = useOwnedTokens({
    sortBy: "tierThenId"
  });
  const { writeContractAsync, isPending } = useWriteContract();
  const [battlePlan, setBattlePlan] = useState(25);
  const [draggedTokenId, setDraggedTokenId] = useState<number | null>(null);
  const [formation, setFormation] = useState<Array<number | null>>([null, null, null]);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const assignedIds = useMemo(() => formation.filter((item): item is number => item !== null), [formation]);

  const availableTokens = useMemo(
    () => ownedTokens.filter((token) => !assignedIds.includes(token.tokenId)),
    [assignedIds, ownedTokens]
  );

  const formationTokens = useMemo(
    () => formation.map((tokenId) => ownedTokens.find((token) => token.tokenId === tokenId) ?? null),
    [formation, ownedTokens]
  );

  const fusionTier = useMemo(() => {
    if (formationTokens.some((token) => token === null)) return null;
    const tiers = formationTokens.map((token) => token?.tier ?? 0);
    return tiers.every((tier) => tier === tiers[0]) ? tiers[0] : null;
  }, [formationTokens]);

  const jackpot = useMemo(() => {
    const basePot = 128;
    return `${(basePot + battlePlan * 1.6).toFixed(1)} XP`;
  }, [battlePlan]);

  const placeToken = (slotIndex: number, tokenId: number) => {
    setMessage("");
    setSuccessMessage("");
    setFormation((current) => {
      const next = [...current];
      const previousIndex = next.findIndex((item) => item === tokenId);
      if (previousIndex >= 0) next[previousIndex] = null;
      next[slotIndex] = tokenId;
      return next;
    });
  };

  const clearSlot = (slotIndex: number) => {
    setFormation((current) => {
      const next = [...current];
      next[slotIndex] = null;
      return next;
    });
  };

  const onMint = async () => {
    if (!isConnected || !address) {
      setMessage("Connect your wallet first, then mint more creatures for your squad.");
      return;
    }

    try {
      setMessage("Minting a fresh base creature...");
      setSuccessMessage("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "mint"
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction(address, txHash, "mint");
      setMessage("");
      setSuccessMessage(`Mint confirmed: ${txHash}`);
      await refetchOwnedTokens();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mint failed. Please try again.");
    }
  };

  const onBattle = async () => {
    if (!isConnected || !address) {
      setMessage("Connect your wallet before starting a battle.");
      return;
    }

    if (assignedIds.length !== 3 || !fusionTier) {
      setMessage("Place 3 NFTs of the same tier before starting the battle.");
      return;
    }

    try {
      setMessage("Battle request is going onchain. Submitting `fuse()` now...");
      setSuccessMessage("");
      const txHash = await writeContractAsync({
        ...fusionContract,
        abi: fusionAbi,
        functionName: "fuse",
        args: [[BigInt(assignedIds[0]), BigInt(assignedIds[1]), BigInt(assignedIds[2])]]
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      trackTransaction(address, txHash, "fuse");
      setFormation([null, null, null]);
      setMessage("");
      setSuccessMessage(`Battle confirmed: ${txHash}`);
      await refetchOwnedTokens();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Battle failed. Please try again.");
    }
  };

  return (
    <div className="battle-home">
      <section className="battle-stage">
        <div className="battle-stage__header">
          <div>
            <span className="eyebrow">Play Now</span>
            <h1>Drag a three-NFT squad onto the field and jump straight into an onchain fusion battle.</h1>
            <p>
              The homepage is now the main arena. Formation, wager controls, opponent preview, and the primary battle CTA all live here, and the main button directly triggers <code>fuse()</code>.
            </p>
          </div>
          <div className="battle-pot">
            <span>Current jackpot</span>
            <strong>{jackpot}</strong>
            <small>Calculated live from your round setup</small>
          </div>
        </div>

        <div className="battle-board">
          <article className="arena-panel arena-panel--player">
            <div className="arena-panel__title">
              <h2>My formation</h2>
              <button type="button" className="button button-secondary" onClick={onMint} disabled={isPending}>
                Mint Creature
              </button>
            </div>

            <div className="formation-grid">
              {formationTokens.map((token, index) => (
                <div
                  key={`slot-${index + 1}`}
                  className={`formation-slot ${token ? "filled" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const payload = Number(event.dataTransfer.getData("text/plain") || draggedTokenId);
                    if (payload) placeToken(index, payload);
                  }}
                >
                  <span className="formation-slot__index">Slot {index + 1}</span>
                  {token ? (
                    <>
                      <strong>#{token.tokenId}</strong>
                      <p>{getTierLabel(token.tier)}</p>
                      <button type="button" className="chip-button" onClick={() => clearSlot(index)}>
                        Remove
                      </button>
                    </>
                  ) : (
                    <p>Drop an NFT here</p>
                  )}
                </div>
              ))}
            </div>

            <div className="token-deck">
              {availableTokens.length > 0 ? (
                availableTokens.map((token) => (
                  <button
                    key={token.tokenId}
                    type="button"
                    draggable
                    className="battle-token"
                    onDragStart={(event) => {
                      setDraggedTokenId(token.tokenId);
                      event.dataTransfer.setData("text/plain", String(token.tokenId));
                    }}
                    onClick={() => {
                      const openIndex = formation.findIndex((item) => item === null);
                      if (openIndex >= 0) placeToken(openIndex, token.tokenId);
                    }}
                  >
                    <span className="battle-token__spark" />
                    <strong>#{token.tokenId}</strong>
                    <small>{getTierLabel(token.tier)}</small>
                  </button>
                ))
              ) : (
                <div className="empty-state-card">
                  <strong>No battle-ready NFTs yet</strong>
                  <p>Use “Mint Creature” first, then drag your new NFT squad into the arena.</p>
                </div>
              )}
            </div>
          </article>

          <article className="arena-panel arena-panel--enemy">
            <div className="arena-panel__title">
              <h2>Opponent zone</h2>
              <span className="soft-badge">Mock rival</span>
            </div>
            <div className="opponent-grid">
              {opponentSquad.map((opponent) => (
                <div key={opponent.name} className="opponent-card">
                  <span className="opponent-card__glow" />
                  <strong>{opponent.name}</strong>
                  <p>{getTierLabel(opponent.tier)}</p>
                  <small>{opponent.mood}</small>
                </div>
              ))}
            </div>

            <div className="bet-panel">
              <div className="bet-panel__title">
                <h3>Wager Module</h3>
                <span>{battlePlan} XP</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={battlePlan}
                onChange={(event) => setBattlePlan(Number(event.target.value))}
              />
              <input
                type="number"
                min="5"
                max="100"
                step="5"
                value={battlePlan}
                onChange={(event) => setBattlePlan(Number(event.target.value || 0))}
                className="bet-input"
              />
              <p className="bet-note">
                The current contract does not expose a standalone bet function, so this module is a front-end battle signal. The real onchain action remains the <code>fuse()</code> transaction below.
              </p>
            </div>

            <button
              type="button"
              className="button button-battle"
              onClick={onBattle}
              disabled={isPending || assignedIds.length !== 3 || !fusionTier}
            >
              Start Battle
            </button>

            <div className="battle-status">
              <div className="battle-status__row">
                <span>Wallet</span>
                <strong>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</strong>
              </div>
              <div className="battle-status__row">
                <span>Squad status</span>
                <strong>{fusionTier ? `${getTierLabel(fusionTier)} ready` : "Waiting for 3 matching NFTs"}</strong>
              </div>
              <div className="battle-status__row">
                <span>Onchain path</span>
                <strong>writeContract → fuse()</strong>
              </div>
            </div>

            {message ? <div className="notice">{message}</div> : null}
            {successMessage ? <div className="notice success">{successMessage}</div> : null}
          </article>
        </div>
      </section>

      <section className="battle-info-grid">
        <article className="arena-info-card">
          <div className="arena-info-card__title">
            <span className="eyebrow">How To Play</span>
            <h2>How to play</h2>
          </div>
          <div className="play-steps">
            {howToPlay.map((item) => (
              <div key={item.step} className="play-step-card">
                <span>{item.step}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="arena-info-card">
          <div className="arena-info-card__title">
            <span className="eyebrow">Jackpot</span>
            <h2>Current jackpot</h2>
          </div>
          <div className="jackpot-card">
            <strong>{jackpot}</strong>
            <p>This pool is a live battle-display value that shifts with your current wager setting.</p>
          </div>
        </article>

        <article className="arena-info-card">
          <div className="arena-info-card__title">
            <span className="eyebrow">Recent Battles</span>
            <h2>Recent battle log</h2>
          </div>
          <div className="battle-feed">
            {battleFeed.map((item) => (
              <div key={`${item.player}-${item.move}`} className="battle-feed__row">
                <div>
                  <strong>{item.player}</strong>
                  <p>{item.move}</p>
                </div>
                <div>
                  <strong>{item.result}</strong>
                  <p>{item.pot}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
