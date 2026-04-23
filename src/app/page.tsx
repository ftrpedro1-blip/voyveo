import Script from "next/script";

export default function HomePage() {
  const mapConfig = {
    mapAttribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "\u00a9 OpenStreetMap",
    mapTileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  };

  return (
    <>
      <script
        id="voy-veo-config"
        dangerouslySetInnerHTML={{
          __html: `window.VOY_VEO_CONFIG=${JSON.stringify(mapConfig)};`
        }}
      />
      <div className="ambient" />
      <div className="device">
        <header className="appHeader">
          <button className="brandPill" data-route="home" aria-label="Ir al inicio">
            <span className="brandMark" aria-hidden="true">
              <i />
              <b />
            </span>
            <strong>Voy Veo</strong>
          </button>
          <button className="locationPill" type="button" aria-label="Ciudad actual: Buenos Aires">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            <span>Buenos Aires</span>
          </button>
          <button className="sectionPill" id="topAction" type="button" aria-label="Sección actual">
            <span id="screenTitle">Destacadas</span>
          </button>
        </header>
        <main id="app" tabIndex={-1} />
        <nav className="tabBar" aria-label="Navegación principal">
          <button data-route="home" />
          <button data-route="list" />
          <button data-route="map" />
        </nav>
      </div>
      <Script src="/client/app.js" type="module" strategy="afterInteractive" />
    </>
  );
}
