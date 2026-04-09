export default function GlobalLoading() {
  return (
    <main className="route-loading-shell">
      <section className="route-loading-panel">
        <div className="route-loading-bar route-loading-bar-lg" />
        <div className="route-loading-grid">
          <div className="route-loading-column">
            <div className="route-loading-card route-loading-card-tall" />
            <div className="route-loading-card" />
            <div className="route-loading-card" />
          </div>
          <div className="route-loading-column">
            <div className="route-loading-card route-loading-card-medium" />
            <div className="route-loading-card" />
            <div className="route-loading-card route-loading-card-small" />
          </div>
        </div>
      </section>
    </main>
  );
}
