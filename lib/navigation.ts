import type { NavItem } from "@/lib/types";

export const navigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/cards", label: "Cartoes", icon: "credit-card" },
  { href: "/fixed-expenses", label: "Fixos", icon: "receipt" },
  { href: "/planning", label: "Planejamento", icon: "chart-pie" },
  { href: "/settings", label: "Configuracoes", icon: "settings" },
];
