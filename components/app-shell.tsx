import Link from "next/link";
import { type ReactNode } from "react";
import { navigation } from "@/lib/navigation";
import { Icon } from "@/components/icons";

type AppShellProps = {
  currentPath: string;
  monthLabel: string;
  closingInfo: string;
  children: ReactNode;
};

export function AppShell({ currentPath, monthLabel, closingInfo, children }: AppShellProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-block">
            <p className="brand-title">FinFlow</p>
            <p className="brand-subtitle">Personal Finance OS</p>
          </div>

          <nav className="nav-list" aria-label="Navegacao principal">
            {navigation.map((item) => (
              <Link
                key={item.href}
                className={currentPath === item.href ? "nav-item active" : "nav-item"}
                href={item.href}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="quick-action" type="button">
            <span className="quick-action-plus">+</span>
            Lancar semana
          </button>

          <div className="profile-card">
            <div className="profile-avatar">RS</div>
            <div>
              <p className="profile-name">Rafael</p>
              <p className="profile-email">finflow@local.app</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="tab-button active" type="button">
              {monthLabel}
            </button>
            <p className="topbar-caption">{closingInfo}</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notificacoes">
              <Icon name="bell" />
            </button>
            <button className="icon-button" type="button" aria-label="Perfil">
              <Icon name="user" />
            </button>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
