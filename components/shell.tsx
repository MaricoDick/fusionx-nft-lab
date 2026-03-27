"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/lab", label: "实验室" },
  { href: "/collection", label: "藏品" },
  { href: "/guide", label: "玩法" }
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">FX</div>
          <div className="brand-copy">
            <strong>FusionX NFT Lab</strong>
            <span>Gentle fusion on Base</span>
          </div>
        </div>
        <div className="header-actions">
          <nav className="nav-pills" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </header>

      <main className="content-stack">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
            {item.label}
          </Link>
        ))}
      </nav>

      <footer className="mini-footer">
        FusionX NFT Lab · Base Mini App · Burn 3 NFTs to unlock a higher-tier form.
      </footer>
    </div>
  );
}
