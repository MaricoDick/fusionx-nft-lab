import Link from "next/link";
import { Shell } from "@/components/shell";
import { homeHighlights, fusionSteps, probabilityRows } from "@/lib/content";

export default function HomePage() {
  return (
    <Shell>
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Fusion Rituals On Base</span>
          <h1>让闲置 NFT 在温柔的实验室里，慢慢长成更稀有的形态。</h1>
          <p>
            FusionX NFT Lab 是一个偏轻游戏化的 NFT 合成 Mini App。你可以铸造基础实验体，选择 3
            枚同阶 NFT 进行燃烧融合，并在链上概率控制下获得更高阶成果。
          </p>
          <div className="hero-actions">
            <Link href="/lab" className="button button-primary">
              进入合成实验室
            </Link>
            <Link href="/guide" className="button button-secondary">
              查看玩法说明
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-blue" />
          <div className="orb orb-yellow" />
          <div className="glass-panel">
            <p>Fusion Contract</p>
            <strong>0x6287...02cd</strong>
            <span>ERC721 + Burn / Mint</span>
          </div>
        </div>
      </section>

      <section className="grid-two">
        {homeHighlights.map((item) => (
          <article key={item.title} className="soft-card">
            <span className="card-kicker">{item.kicker}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="soft-card">
        <div className="section-heading">
          <div>
            <span className="card-kicker">Fusion Loop</span>
            <h2>一次合成，包含三个温和步骤</h2>
          </div>
          <Link href="/collection" className="text-link">
            去看我的藏品
          </Link>
        </div>
        <div className="steps-grid">
          {fusionSteps.map((step) => (
            <div key={step.title} className="step-card">
              <span>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="soft-card">
        <div className="section-heading">
          <div>
            <span className="card-kicker">Onchain Chances</span>
            <h2>不同阶级拥有不同合成成功率</h2>
          </div>
          <Link href="/lab" className="button button-accent button-inline">
            立即试试看
          </Link>
        </div>
        <div className="probability-list">
          {probabilityRows.map((row) => (
            <div key={row.tier} className="probability-row">
              <div>
                <strong>{row.tier}</strong>
                <p>{row.detail}</p>
              </div>
              <span>{row.rate}</span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
