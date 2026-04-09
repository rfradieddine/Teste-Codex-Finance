import Link from "next/link";
import { type ReactNode } from "react";
import { navigation } from "@/lib/navigation";
import { Icon } from "@/components/icons";
import { logoutAppAction } from "@/app/security-actions";
import { buildMonthRoute, shiftMonthKey } from "@/lib/months";

type AppShellProps = {
  currentPath: string;
  monthKey: string;
  monthLabel: string;
  closingInfo: string;
  children: ReactNode;
};

export function AppShell({ currentPath, monthKey, monthLabel, closingInfo, children }: AppShellProps) {
  const previousMonthHref = buildMonthRoute(currentPath, shiftMonthKey(monthKey, -1));
  const nextMonthHref = buildMonthRoute(currentPath, shiftMonthKey(monthKey, 1));

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
          <Link className="quick-action" href={buildMonthRoute("/cards", monthKey)}>
            <span className="quick-action-plus">+</span>
            Lancar semana
          </Link>

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
            <Link className="icon-button" href={previousMonthHref} aria-label="Mes anterior">
              <span aria-hidden="true">{"<"}</span>
            </Link>
            <button className="tab-button active" type="button">
              {monthLabel}
            </button>
            <Link className="icon-button" href={nextMonthHref} aria-label="Proximo mes">
              <span aria-hidden="true">{">"}</span>
            </Link>
            <p className="topbar-caption">{closingInfo}</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notificacoes">
              <Icon name="bell" />
            </button>
            <form action={logoutAppAction}>
              <button className="icon-button" type="submit" aria-label="Bloquear app">
                <Icon name="user" />
              </button>
            </form>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
