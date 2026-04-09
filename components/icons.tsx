type IconName =
  | "grid"
  | "credit-card"
  | "receipt"
  | "chart-pie"
  | "settings"
  | "bell"
  | "user";

export function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "grid":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
      );
    case "credit-card":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5zM3 9h18V6.5a.5.5 0 0 0-.5-.5h-17a.5.5 0 0 0-.5.5zm4 6h6v2H7z" />
        </svg>
      );
    case "receipt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5zm3 5v2h6V8zm0 4v2h6v-2z" />
        </svg>
      );
    case "chart-pie":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 3a9 9 0 1 0 9 9h-9zm2 0v8h8A9 9 0 0 0 13 3" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m19.4 13 .1-1-.1-1 2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6H9l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5-.1 1 .1 1-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h6l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a5 5 0 0 0-5 5v2.4c0 .7-.2 1.4-.6 2L5 15h14l-1.4-2.6c-.4-.6-.6-1.3-.6-2V8a5 5 0 0 0-5-5m0 18a2.5 2.5 0 0 0 2.3-1.5H9.7A2.5 2.5 0 0 0 12 21" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12m0 2c-4.1 0-7.5 2.2-7.5 5v1h15v-1c0-2.8-3.4-5-7.5-5" />
        </svg>
      );
    default:
      return null;
  }
}
