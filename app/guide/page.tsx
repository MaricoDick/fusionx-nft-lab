import { Shell } from "@/components/shell";
import { guidePanels } from "@/lib/content";

export default function GuidePage() {
  return (
    <Shell>
      <section className="page-header">
        <span className="eyebrow">Guidebook</span>
        <h1>FusionX keeps the rules clear without turning the app into a noisy dashboard.</h1>
        <p>
          The Mini App breaks the loop into a simple flow: connect your wallet, mint base NFTs, pick three matching NFTs, and wait for the upgraded onchain outcome.
        </p>
      </section>

      <section className="guide-grid">
        {guidePanels.map((panel) => (
          <article key={panel.title} className="soft-card">
            <span className="card-kicker">{panel.kicker}</span>
            <h2>{panel.title}</h2>
            <p>{panel.description}</p>
          </article>
        ))}
      </section>
    </Shell>
  );
}
