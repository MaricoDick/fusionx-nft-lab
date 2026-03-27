import { Shell } from "@/components/shell";
import { guidePanels } from "@/lib/content";

export default function GuidePage() {
  return (
    <Shell>
      <section className="page-header">
        <span className="eyebrow">Guidebook</span>
        <h1>FusionX 的玩法，不靠吵闹的仪表盘，也能很清楚。</h1>
        <p>
          这个 Mini App
          把操作拆成简单流程：连接钱包、铸造初始体、挑选三枚同阶 NFT 合成，并在成功时获得更高阶 NFT。
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
