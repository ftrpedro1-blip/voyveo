import { BA_TIME_ZONE, MAX_PINNED_GALLERIES, PIN_STORAGE_KEY, dayLabels, icons, tabItems, weekdayToKey } from "./config.js";

const app = document.querySelector("#app");
const topAction = document.querySelector("#topAction");
const tabs = [...document.querySelectorAll(".tabBar button")];

const state = {
  activeAdminMode: "galleries",
  agendaStatus: "current",
  db: { galleries: [], exhibitions: [], artists: [], meta: {} },
  map: null,
  pinnedGalleryIds: readPinnedGalleries(),
  selectedAdminExhibitionId: null,
  selectedAdminGalleryId: null,
  selectedMapSlug: null,
  typeFilter: "all"
};

const runtimeConfig = window.VOY_VEO_CONFIG || {};
const mapTileUrl = runtimeConfig.mapTileUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const mapAttribution = runtimeConfig.mapAttribution || "\u00a9 OpenStreetMap";

tabs.forEach((tab, index) => {
  const [route, icon, label] = tabItems[index];
  tab.dataset.route = route;
  tab.innerHTML = `${icon}<span>${label}</span>`;
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageFallback() {
  return '<div class="imageFallback logoPlaceholder"><span><i></i><b></b></span></div>';
}

function imageBlock(url, label = "Voy Veo", priority = false) {
  if (!url) return `<div class="dataPlaceholder logoPlaceholder"><span><i></i><b></b></span></div>`;
  return `
    <div class="dataImage">
      ${imageFallback()}
      <img
        src="${escapeHtml(url)}"
        alt="${escapeHtml(label)}"
        loading="${priority ? "eager" : "lazy"}"
        fetchpriority="${priority ? "high" : "auto"}"
        decoding="async"
        onload="this.parentElement.classList.add('imageLoaded')"
        onerror="this.parentElement.classList.add('imageFailed')"
      >
    </div>`;
}

function setChrome(screenTitle, action = "") {
  topAction.innerHTML = action ? `${action}<span id="screenTitle">${escapeHtml(screenTitle)}</span>` : `<span id="screenTitle">${escapeHtml(screenTitle)}</span>`;
  topAction.disabled = !action;
  document.body.dataset.hasAction = action ? "true" : "false";
}

function setActive(route) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.route === route));
}

function routeTo(route) {
  const next = () => {
    location.hash = route;
  };
  if (document.startViewTransition) document.startViewTransition(next);
  else next();
}

function galleryFor(exhibition) {
  return state.db.galleries.find((gallery) => gallery.id === exhibition.gallery_id);
}

function artistsFor(exhibition) {
  return (exhibition.artist_ids || [])
    .map((id) => state.db.artists.find((artist) => artist.id === id)?.name)
    .filter(Boolean);
}

function todayInBuenosAires() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: BA_TIME_ZONE,
    year: "numeric"
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${date.year}-${date.month}-${date.day}`;
}

function buenosAiresClock() {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: BA_TIME_ZONE,
    weekday: "long"
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    dayKey: weekdayToKey[String(date.weekday || "").toLowerCase()],
    minuteOfDay: Number(date.hour === "24" ? 0 : date.hour) * 60 + Number(date.minute || 0)
  };
}

function statusFor(exhibition) {
  const today = todayInBuenosAires();
  if (exhibition.start_date && exhibition.start_date > today) return "upcoming";
  if (exhibition.end_date && exhibition.end_date < today) return "past";
  return exhibition.status || "current";
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateRange(exhibition) {
  if (exhibition.date_text) return exhibition.date_text;
  if (!exhibition.start_date && !exhibition.end_date) return "Fechas por revisar";
  if (!exhibition.end_date) return `Desde ${formatDate(exhibition.start_date)}`;
  return `${formatDate(exhibition.start_date)} - ${formatDate(exhibition.end_date)}`;
}

function periodLabel(period) {
  return `${period.open} - ${period.close}`;
}

function todayHours(gallery) {
  const weekly = gallery?.weekly_hours;
  const clock = buenosAiresClock();
  if (!weekly || !clock.dayKey || !Object.keys(weekly).length || weekly[clock.dayKey] === null || typeof weekly[clock.dayKey] === "undefined") {
    return {
      state: "unknown",
      status: "Por confirmar",
      todayLabel: "Horario sujeto a confirmación"
    };
  }
  const periods = Array.isArray(weekly[clock.dayKey]) ? weekly[clock.dayKey] : [];
  if (!periods.length) return { state: "closed", status: "Cerrado", todayLabel: "Cerrado" };
  const minuteOfDay = clock.minuteOfDay;
  const active = periods.find((period) => {
    const [openHour, openMinute] = String(period.open).split(":").map(Number);
    const [closeHour, closeMinute] = String(period.close).split(":").map(Number);
    const open = openHour * 60 + openMinute;
    const close = closeHour * 60 + closeMinute;
    return minuteOfDay >= open && minuteOfDay < close;
  });
  const label = periods.map(periodLabel).join(" / ");
  return {
    state: active ? "open" : "closed",
    status: active ? "Abierto" : "Cerrado",
    todayLabel: active ? `Hoy hasta ${active.close}` : `Hoy ${label}`
  };
}

function todayHoursMarkup(gallery) {
  const hours = todayHours(gallery);
  return `
    <div class="todayHours ${hours.state}">
      <span><i></i>Hoy</span>
      <strong>${escapeHtml(hours.status)}</strong>
      <small>${escapeHtml(hours.todayLabel)}</small>
    </div>`;
}

function weeklyHoursMarkup(gallery) {
  const weekly = gallery?.weekly_hours;
  if (!weekly || !Object.keys(weekly).length) return "";
  return `
    <div class="weeklyHours">
      ${Object.entries(dayLabels)
        .map(([day, label]) => {
          const periods = weekly[day];
          const text = periods === null || typeof periods === "undefined" ? "Por confirmar" : periods.length ? periods.map(periodLabel).join(" / ") : "Cerrado";
          return `<span><b>${label}</b><em>${escapeHtml(text)}</em></span>`;
        })
        .join("")}
    </div>`;
}

function readPinnedGalleries() {
  try {
    return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePinnedGalleries() {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(state.pinnedGalleryIds.slice(0, MAX_PINNED_GALLERIES)));
}

function showToast(message) {
  let toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function togglePinnedGallery(galleryId) {
  if (state.pinnedGalleryIds.includes(galleryId)) {
    state.pinnedGalleryIds = state.pinnedGalleryIds.filter((id) => id !== galleryId);
    savePinnedGalleries();
    return true;
  }
  if (state.pinnedGalleryIds.length >= MAX_PINNED_GALLERIES) {
    showToast(`Podés fijar hasta ${MAX_PINNED_GALLERIES} galerías`);
    return false;
  }
  state.pinnedGalleryIds = [...state.pinnedGalleryIds, galleryId];
  savePinnedGalleries();
  return true;
}

function institutionLabel(record) {
  return record?.institution_type === "national_museum" ? "Museo de arte" : "Galería";
}

function isPublicGallery(gallery) {
  return Boolean(gallery?.public_visible || gallery?.is_house_gallery);
}

function isPublicExhibition(exhibition) {
  return Boolean(exhibition?.public_visible && isPublicGallery(galleryFor(exhibition)));
}

function visibleInstitutions() {
  return [...state.db.galleries]
    .filter(isPublicGallery)
    .filter((gallery) => state.typeFilter === "all" || gallery.institution_type === state.typeFilter)
    .sort((a, b) => Number(b.is_house_gallery) - Number(a.is_house_gallery) || (b.featured_rank || 0) - (a.featured_rank || 0) || a.name.localeCompare(b.name));
}

function visibleExhibitions(status = state.agendaStatus) {
  return [...state.db.exhibitions]
    .filter(isPublicExhibition)
    .filter((exhibition) => statusFor(exhibition) === status)
    .filter((exhibition) => {
      const gallery = galleryFor(exhibition);
      return state.typeFilter === "all" || gallery?.institution_type === state.typeFilter;
    })
    .sort((a, b) => {
      const ga = galleryFor(a);
      const gb = galleryFor(b);
      const cassiaDelta = Number(Boolean(gb?.is_house_gallery)) - Number(Boolean(ga?.is_house_gallery));
      const pinA = state.pinnedGalleryIds.includes(a.gallery_id) ? state.pinnedGalleryIds.indexOf(a.gallery_id) : 99;
      const pinB = state.pinnedGalleryIds.includes(b.gallery_id) ? state.pinnedGalleryIds.indexOf(b.gallery_id) : 99;
      const dateA = status === "current" ? a.end_date || "9999-99-99" : a.start_date || "9999-99-99";
      const dateB = status === "current" ? b.end_date || "9999-99-99" : b.start_date || "9999-99-99";
      return cassiaDelta || pinA - pinB || dateA.localeCompare(dateB) || (b.featured_rank || 0) - (a.featured_rank || 0);
    });
}

function featuredExhibitions() {
  return [...state.db.exhibitions]
    .filter(isPublicExhibition)
    .sort((a, b) => {
      const pastDelta = Number(statusFor(a) === "past") - Number(statusFor(b) === "past");
      const cassiaDelta = Number(Boolean(galleryFor(b)?.is_house_gallery)) - Number(Boolean(galleryFor(a)?.is_house_gallery));
      const dateA = a.end_date || a.start_date || "";
      const dateB = b.end_date || b.start_date || "";
      return pastDelta || cassiaDelta || dateB.localeCompare(dateA) || (b.featured_rank || 0) - (a.featured_rank || 0);
    })
    .slice(0, 5);
}

function currentExhibitionForGallery(gallery) {
  return [...state.db.exhibitions]
    .filter((exhibition) => exhibition.gallery_id === gallery?.id && isPublicExhibition(exhibition))
    .sort((a, b) => {
      const pastDelta = Number(statusFor(a) === "past") - Number(statusFor(b) === "past");
      const dateA = a.end_date || a.start_date || "";
      const dateB = b.end_date || b.start_date || "";
      return pastDelta || dateB.localeCompare(dateA) || (b.featured_rank || 0) - (a.featured_rank || 0);
    })[0];
}

function exhibitionImage(exhibition) {
  return exhibition?.image_url || galleryFor(exhibition)?.image_url || "";
}

function emptyState(message) {
  return `<div class="emptyState">${escapeHtml(message)}</div>`;
}

function typeFilterMarkup() {
  return `
    <div class="typeFilter">
      <button data-type="all" class="${state.typeFilter === "all" ? "active" : ""}">Todo</button>
      <button data-type="gallery" class="${state.typeFilter === "gallery" ? "active" : ""}">Galerías</button>
      <button data-type="national_museum" class="${state.typeFilter === "national_museum" ? "active" : ""}">Museos</button>
    </div>`;
}

function bindTypeFilter(callback) {
  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.typeFilter = button.dataset.type;
      callback();
    });
  });
}

function renderFeatured() {
  setChrome("Destacadas");
  setActive("home");
  app.innerHTML = `
    <section class="simpleScreen">
      <div class="cardStack featuredStack">
        ${featuredExhibitions()
          .map((exhibition) => {
            const gallery = galleryFor(exhibition);
            return `
              <a class="showCard featuredCard" href="#exhibition/${exhibition.slug}">
                ${imageBlock(exhibitionImage(exhibition), exhibition.title, true)}
                <div class="showContent">
                  <div>
                    <h2>${escapeHtml(exhibition.title)}</h2>
                    <p>${escapeHtml(artistsFor(exhibition).join(", ") || "Artista/s por revisar")}</p>
                  </div>
                  <small>${escapeHtml(gallery?.name || "Institución por revisar")} / ${escapeHtml(formatDateRange(exhibition))}</small>
                </div>
              </a>`;
          })
          .join("")}
      </div>
    </section>`;
}

function renderAgenda() {
  setChrome("Agenda");
  setActive("list");
  app.innerHTML = `
    <section class="agendaControls">
      <div class="segmented">
        <button data-status="current" class="${state.agendaStatus === "current" ? "active" : ""}">Actuales</button>
        <button data-status="upcoming" class="${state.agendaStatus === "upcoming" ? "active" : ""}">Próximas</button>
      </div>
      ${typeFilterMarkup()}
    </section>
    <section class="listGroup">
      ${visibleExhibitions()
        .map((exhibition) => {
          const gallery = galleryFor(exhibition);
          const pinned = state.pinnedGalleryIds.includes(exhibition.gallery_id);
          return `
            <article class="agendaItem">
              <a class="showRow" href="#exhibition/${exhibition.slug}">
                ${imageBlock(exhibitionImage(exhibition), exhibition.title)}
                <div>
                  <h3>${escapeHtml(exhibition.title)}</h3>
                  <p>${escapeHtml(artistsFor(exhibition).join(", ") || "Artista/s por revisar")}</p>
                  <small>${escapeHtml(gallery?.name || "Institución por revisar")} · ${escapeHtml(formatDateRange(exhibition))}</small>
                </div>
              </a>
              <button class="pinButton ${pinned ? "active" : ""}" data-pin-gallery="${exhibition.gallery_id}" aria-label="Fijar galería">${icons.pin}</button>
            </article>`;
        })
        .join("") || emptyState("No hay resultados para este filtro.")}
    </section>
    <div class="toast" id="toast" role="status"></div>`;

  document.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      state.agendaStatus = button.dataset.status;
      renderAgenda();
    });
  });
  bindTypeFilter(renderAgenda);
  document.querySelectorAll("[data-pin-gallery]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (togglePinnedGallery(button.dataset.pinGallery)) renderAgenda();
    });
  });
}

function mapOverlayMarkup(gallery) {
  if (!gallery) return "";
  const exhibition = currentExhibitionForGallery(gallery);
  const hours = todayHours(gallery);
  return `
    <a class="mapOverlay" id="mapOverlay" href="#gallery/${gallery.slug}">
      ${imageBlock(exhibition ? exhibitionImage(exhibition) : gallery.image_url, gallery.name)}
      <div>
        <span class="eyebrow">${institutionLabel(gallery)}</span>
        <h2>${escapeHtml(gallery.name)}</h2>
        <p>${escapeHtml(gallery.address || "Dirección por revisar")}</p>
        <small class="hoursInline ${hours.state}">Hoy: ${escapeHtml(hours.status)} · ${escapeHtml(hours.todayLabel)}</small>
        <small>${escapeHtml(exhibition ? `${exhibition.title} · ${formatDateRange(exhibition)}` : "Próxima programación")}</small>
        <span class="mapOverlayAction">Abrir ficha</span>
      </div>
    </a>`;
}

function popupMarkup(gallery) {
  const exhibition = currentExhibitionForGallery(gallery);
  return `
    <a class="leafletPopup" href="#gallery/${gallery.slug}">
      <strong>${escapeHtml(gallery.name)}</strong>
      <span>${escapeHtml(exhibition?.title || "Próxima programación")}</span>
    </a>`;
}

function renderMap() {
  setChrome("Mapa");
  setActive("map");
  if (state.map) {
    state.map.remove();
    state.map = null;
  }
  const galleries = visibleInstitutions().filter((gallery) => Number.isFinite(gallery.lat) && Number.isFinite(gallery.lng));
  const selected = galleries.find((gallery) => gallery.slug === state.selectedMapSlug) || galleries.find((gallery) => gallery.is_house_gallery) || galleries[0];
  app.innerHTML = `
    <section class="mapScreen">
      <div class="mapFilters">${typeFilterMarkup()}</div>
      <div class="mapScene realMapScene">
        <div id="baMap" class="leafletMap" aria-label="Mapa de instituciones culturales de Buenos Aires"></div>
        <div class="mapTint"></div>
      </div>
      <div class="selectedMapCard">${mapOverlayMarkup(selected)}</div>
      <footer class="mapCredit"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">${escapeHtml(mapAttribution)}</a></footer>
    </section>`;
  bindTypeFilter(renderMap);
  initializeMap(galleries, selected);
}

function initializeMap(galleries, selected) {
  if (!window.L || !galleries.length) return;
  const L = window.L;
  const map = L.map("baMap", {
    attributionControl: false,
    maxZoom: 18,
    minZoom: 11,
    preferCanvas: true,
    scrollWheelZoom: true,
    tap: true,
    zoomControl: false
  }).setView([-34.6037, -58.3816], 12);
  state.map = map;
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer(mapTileUrl, {
    detectRetina: false,
    keepBuffer: 2,
    maxZoom: 19,
    updateWhenIdle: true,
    updateWhenZooming: false
  }).addTo(map);

  const bounds = [];
  galleries.forEach((gallery) => {
    const icon = L.divIcon({
      className: `vvMarker ${gallery.institution_type === "national_museum" ? "museum" : ""} ${gallery.is_house_gallery ? "house" : ""} ${selected?.slug === gallery.slug ? "selected" : ""}`,
      html: "<span></span>",
      iconAnchor: [22, 42],
      iconSize: [44, 44],
      popupAnchor: [0, -36]
    });
    const marker = L.marker([gallery.lat, gallery.lng], { icon, title: gallery.name }).addTo(map);
    marker.bindPopup(popupMarkup(gallery), { closeButton: false, offset: [0, -4] });
    marker.on("click", () => {
      state.selectedMapSlug = gallery.slug;
      document.querySelector(".selectedMapCard").innerHTML = mapOverlayMarkup(gallery);
      marker.openPopup();
    });
    bounds.push([gallery.lat, gallery.lng]);
  });
  if (bounds.length > 1) map.fitBounds(bounds, { maxZoom: 13, padding: [34, 34] });
  setTimeout(() => map.invalidateSize(), 80);
}

function renderGallery(slug) {
  const gallery = visibleInstitutions().find((item) => item.slug === slug) || visibleInstitutions()[0];
  setChrome(gallery?.name || "Institución", icons.arrow);
  setActive("");
  if (!gallery) {
    app.innerHTML = emptyState("Institución no disponible públicamente.");
    return;
  }
  const exhibition = currentExhibitionForGallery(gallery);
  app.innerHTML = `
    <section class="detailHeader">
      ${imageBlock(gallery.image_url, gallery.name, true)}
      <span class="eyebrow">${institutionLabel(gallery)}</span>
      <h1>${escapeHtml(gallery.name)}</h1>
      <p>${escapeHtml(gallery.address || "Dirección por revisar")}</p>
      ${todayHoursMarkup(gallery)}
      ${weeklyHoursMarkup(gallery)}
    </section>
    <section class="detailInfo">
      <div>
        <span>Web oficial</span>
        <p>${gallery.website ? `<a href="${escapeHtml(gallery.website)}" target="_blank" rel="noreferrer">${escapeHtml(gallery.website)}</a>` : "Pendiente"}</p>
      </div>
      <div>
        <span>Instagram</span>
        <p>${gallery.instagram ? `<a href="${escapeHtml(gallery.instagram)}" target="_blank" rel="noreferrer">${escapeHtml(gallery.instagram)}</a>` : "Pendiente"}</p>
      </div>
      <div>
        <span>Descripción</span>
        <p>${escapeHtml(gallery.description || "Descripción por revisar")}</p>
      </div>
    </section>
    <section class="listGroup">${exhibition ? detailRow(exhibition) : emptyState("Sin exhibición confirmada")}</section>`;
}

function detailRow(exhibition) {
  const gallery = galleryFor(exhibition);
  return `
    <a class="showRow" href="#exhibition/${exhibition.slug}">
      ${imageBlock(exhibitionImage(exhibition), exhibition.title)}
      <div>
        <h3>${escapeHtml(exhibition.title)}</h3>
        <p>${escapeHtml(artistsFor(exhibition).join(", ") || "Artista/s por revisar")}</p>
        <small>${escapeHtml(gallery?.name || "Institución por revisar")} · ${escapeHtml(formatDateRange(exhibition))}</small>
      </div>
    </a>`;
}

function renderExhibition(slug) {
  const exhibition = state.db.exhibitions.find((item) => item.slug === slug && isPublicExhibition(item)) || featuredExhibitions()[0];
  setChrome("Exhibición", icons.arrow);
  setActive("");
  if (!exhibition) {
    app.innerHTML = emptyState("Exhibición no disponible públicamente.");
    return;
  }
  const gallery = galleryFor(exhibition);
  app.innerHTML = `
    <section class="detailHeader">
      ${imageBlock(exhibitionImage(exhibition), exhibition.title, true)}
      <span class="eyebrow">${escapeHtml(gallery?.name || "Institución")}</span>
      <h1>${escapeHtml(exhibition.title)}</h1>
      <p>${escapeHtml(artistsFor(exhibition).join(", ") || "Artista/s por revisar")}</p>
      <small>${escapeHtml(formatDateRange(exhibition))}</small>
    </section>
    <section class="detailInfo">
      <div>
        <span>Institución</span>
        <strong>${escapeHtml(gallery?.name || "Institución por revisar")}</strong>
      </div>
      <div>
        <span>Dirección</span>
        <strong>${escapeHtml(gallery?.address || "Por revisar")}</strong>
      </div>
      <div>
        <span>Sobre la exhibición</span>
        <p>${escapeHtml(exhibition.description || "Texto pendiente de revisión editorial.")}</p>
      </div>
      <div class="linkGrid">
        ${gallery?.website ? `<a href="${escapeHtml(gallery.website)}" target="_blank" rel="noreferrer">Web oficial</a>` : ""}
        ${gallery?.instagram ? `<a href="${escapeHtml(gallery.instagram)}" target="_blank" rel="noreferrer">Instagram</a>` : ""}
        <a href="#map" data-map-target="${escapeHtml(gallery?.slug || "")}">Ver en mapa</a>
      </div>
    </section>`;
  document.querySelector("[data-map-target]")?.addEventListener("click", (event) => {
    state.selectedMapSlug = event.currentTarget.dataset.mapTarget;
  });
}

function sourceSummary(record) {
  return `
    <div class="sourcePanel">
      <span><strong>Fecha última revisión</strong>${escapeHtml(record.fecha_ultima_revision || record.last_checked_at || "Pendiente")}</span>
      <span><strong>Fuente exhibición</strong>${escapeHtml(record.fuente_exhibicion || "Pendiente")}</span>
      <span><strong>Fuente imagen</strong>${escapeHtml(record.fuente_imagen || "Pendiente")}</span>
      <span><strong>Conflicto detectado</strong>${record.conflicto_detectado ? "Sí" : "No"}</span>
      <span><strong>Confianza</strong>${escapeHtml(record.confidence_score ?? 0)}</span>
      <span><strong>Publicado</strong>${escapeHtml(record.published_summary || "Pendiente")}</span>
      <a href="${escapeHtml(record.source_website_url || "#")}" target="_blank" rel="noreferrer"><strong>Web oficial</strong>${escapeHtml(record.source_website_url || "Pendiente")}</a>
      <a href="${escapeHtml(record.source_instagram_url || "#")}" target="_blank" rel="noreferrer"><strong>Instagram</strong>${escapeHtml(record.source_instagram_url || "Pendiente")}</a>
    </div>`;
}

function renderAdmin() {
  setChrome("Admin", icons.arrow);
  setActive("admin");
  const galleries = [...state.db.galleries].sort((a, b) => Number(b.is_house_gallery) - Number(a.is_house_gallery) || a.name.localeCompare(b.name));
  const exhibitions = [...state.db.exhibitions].sort((a, b) => (b.featured_rank || 0) - (a.featured_rank || 0));
  state.selectedAdminGalleryId ||= galleries[0]?.id;
  state.selectedAdminExhibitionId ||= exhibitions[0]?.id;
  const gallery = galleries.find((item) => item.id === state.selectedAdminGalleryId);
  const exhibition = exhibitions.find((item) => item.id === state.selectedAdminExhibitionId);

  app.innerHTML = `
    <section class="adminHero">
      <span class="adminIcon">${icons.shield}</span>
      <h1>Editor manual.</h1>
      <p>Fuentes, confianza y datos publicados.</p>
    </section>
    <div class="adminActions">
      <button data-mode="galleries" class="${state.activeAdminMode === "galleries" ? "selected" : ""}">${icons.building}<span>Instituciones</span></button>
      <button data-mode="exhibitions" class="${state.activeAdminMode === "exhibitions" ? "selected" : ""}">${icons.star}<span>Exhibiciones</span></button>
    </div>
    <section id="adminEditor">
      ${
        state.activeAdminMode === "galleries"
          ? `
            <div class="adminPicker">${galleries
              .map((record) => `<button type="button" data-gallery-pick="${record.id}" class="${record.id === gallery?.id ? "selected" : ""}"><span>${escapeHtml(record.name)}</span><small>${institutionLabel(record)}</small></button>`)
              .join("")}</div>
            ${gallery ? sourceSummary(gallery) : ""}
            ${gallery ? galleryForm(gallery) : emptyState("Sin instituciones")}`
          : `
            <div class="adminPicker">${exhibitions
              .map((record) => `<button type="button" data-exhibition-pick="${record.id}" class="${record.id === exhibition?.id ? "selected" : ""}"><span>${escapeHtml(record.title)}</span><small>${escapeHtml(galleryFor(record)?.name || "")}</small></button>`)
              .join("")}</div>
            ${exhibition ? sourceSummary(exhibition) : ""}
            ${exhibition ? exhibitionForm(exhibition) : emptyState("Sin exhibiciones")}`
      }
    </section>`;

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeAdminMode = button.dataset.mode;
      renderAdmin();
    });
  });
  document.querySelectorAll("[data-gallery-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAdminGalleryId = button.dataset.galleryPick;
      renderAdmin();
    });
  });
  document.querySelectorAll("[data-exhibition-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAdminExhibitionId = button.dataset.exhibitionPick;
      renderAdmin();
    });
  });
  bindAdminForms();
}

function galleryForm(gallery) {
  return `
    <form class="editForm recordForm" data-type="gallery" data-id="${gallery.id}">
      <h2>${escapeHtml(gallery.name)}</h2>
      <label>Nombre<input name="name" value="${escapeHtml(gallery.name)}"></label>
      <label>Dirección<input name="address" value="${escapeHtml(gallery.address || "")}"></label>
      <label>Tipo<select name="institution_type"><option value="gallery" ${gallery.institution_type === "gallery" ? "selected" : ""}>Galería</option><option value="national_museum" ${gallery.institution_type === "national_museum" ? "selected" : ""}>Museo de arte</option></select></label>
      <label>Web oficial<input name="source_website_url" value="${escapeHtml(gallery.source_website_url || gallery.website || "")}"></label>
      <label>Instagram oficial<input name="source_instagram_url" value="${escapeHtml(gallery.source_instagram_url || gallery.instagram || "")}"></label>
      <label>Último chequeo<input name="last_checked_at" value="${escapeHtml(gallery.last_checked_at || "")}"></label>
      <label>Confianza<input name="confidence_score" type="number" step="0.01" min="0" max="1" value="${escapeHtml(gallery.confidence_score ?? 0)}"></label>
      <label>Imagen<input name="image_url" value="${escapeHtml(gallery.image_url || "")}"></label>
      <label>Horario publicado<input name="hours" value="${escapeHtml(gallery.hours || "")}"></label>
      <label>Fecha última revisión<input name="fecha_ultima_revision" value="${escapeHtml(gallery.fecha_ultima_revision || "")}"></label>
      <label>Fuente exhibición<input name="fuente_exhibicion" value="${escapeHtml(gallery.fuente_exhibicion || "")}"></label>
      <label>Notas revisión<input name="review_notes" value="${escapeHtml((gallery.review_notes || []).join(", "))}"></label>
      <label class="checkLine"><input name="public_visible" type="checkbox" ${gallery.public_visible ? "checked" : ""}> Visible públicamente</label>
      <label class="checkLine"><input name="needs_review" type="checkbox" ${gallery.needs_review ? "checked" : ""}> Pendiente de revisión</label>
      <button type="submit">${icons.check}<span>Guardar</span></button>
    </form>`;
}

function exhibitionForm(exhibition) {
  return `
    <form class="editForm recordForm" data-type="exhibition" data-id="${exhibition.id}">
      <h2>${escapeHtml(exhibition.title)}</h2>
      <label>Título<input name="title" value="${escapeHtml(exhibition.title || "")}"></label>
      <label>Institución<select name="gallery_id">${state.db.galleries.map((gallery) => `<option value="${gallery.id}" ${gallery.id === exhibition.gallery_id ? "selected" : ""}>${escapeHtml(gallery.name)}</option>`).join("")}</select></label>
      <div class="twoCols"><label>Inicio<input name="start_date" type="date" value="${escapeHtml(exhibition.start_date || "")}"></label><label>Fin<input name="end_date" type="date" value="${escapeHtml(exhibition.end_date || "")}"></label></div>
      <label>Texto de fechas<input name="date_text" value="${escapeHtml(exhibition.date_text || "")}"></label>
      <label>Artistas<input name="artist_names" value="${escapeHtml(artistsFor(exhibition).join(", "))}"></label>
      <label>Estado<select name="status"><option value="current" ${exhibition.status === "current" ? "selected" : ""}>Actual</option><option value="upcoming" ${exhibition.status === "upcoming" ? "selected" : ""}>Próxima</option><option value="past" ${exhibition.status === "past" ? "selected" : ""}>Pasada</option></select></label>
      <label>Imagen<input name="image_url" value="${escapeHtml(exhibition.image_url || "")}"></label>
      <label>Descripción<textarea name="description" rows="3">${escapeHtml(exhibition.description || "")}</textarea></label>
      <label>Fuente exhibición<input name="fuente_exhibicion" value="${escapeHtml(exhibition.fuente_exhibicion || "")}"></label>
      <label>Último chequeo<input name="last_checked_at" value="${escapeHtml(exhibition.last_checked_at || "")}"></label>
      <label>Confianza<input name="confidence_score" type="number" step="0.01" min="0" max="1" value="${escapeHtml(exhibition.confidence_score ?? 0)}"></label>
      <label>Notas revisión<input name="review_notes" value="${escapeHtml((exhibition.review_notes || []).join(", "))}"></label>
      <label class="checkLine"><input name="public_visible" type="checkbox" ${exhibition.public_visible ? "checked" : ""}> Visible públicamente</label>
      <label class="checkLine"><input name="needs_review" type="checkbox" ${exhibition.needs_review ? "checked" : ""}> Pendiente de revisión</label>
      <button type="submit">${icons.check}<span>Guardar</span></button>
    </form>`;
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const reviewNotes = String(data.review_notes || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (form.dataset.type === "gallery") {
    const original = state.db.galleries.find((item) => item.id === form.dataset.id);
    return {
      ...original,
      name: data.name,
      address: data.address,
      institution_type: data.institution_type,
      website: data.source_website_url,
      source_website_url: data.source_website_url,
      instagram: data.source_instagram_url,
      source_instagram_url: data.source_instagram_url,
      last_checked_at: data.last_checked_at,
      confidence_score: Number(data.confidence_score || 0),
      image_url: data.image_url,
      hours: data.hours,
      fecha_ultima_revision: data.fecha_ultima_revision,
      fuente_exhibicion: data.fuente_exhibicion,
      review_notes: reviewNotes,
      public_visible: Boolean(data.public_visible),
      public_visibility_status: Boolean(data.public_visible) ? "publicada" : "incompleta",
      needs_review: Boolean(data.needs_review)
    };
  }
  const original = state.db.exhibitions.find((item) => item.id === form.dataset.id);
  const artistNames = String(data.artist_names || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const artistIds = artistNames.map((name) => {
    const existing = state.db.artists.find((artist) => artist.name.toLowerCase() === name.toLowerCase());
    return existing?.id || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });
  return {
    ...original,
    title: data.title,
    gallery_id: data.gallery_id,
    start_date: data.start_date,
    end_date: data.end_date,
    date_text: data.date_text,
    artist_ids: artistIds,
    artist_records: artistNames.map((name, index) => ({ id: artistIds[index], name, needs_review: [] })),
    status: data.status,
    image_url: data.image_url,
    description: data.description,
    fuente_exhibicion: data.fuente_exhibicion,
    last_checked_at: data.last_checked_at,
    confidence_score: Number(data.confidence_score || 0),
    review_notes: reviewNotes,
    public_visible: Boolean(data.public_visible),
    public_visibility_status: Boolean(data.public_visible) ? "publicada" : "incompleta",
    needs_review: Boolean(data.needs_review)
  };
}

function bindAdminForms() {
  document.querySelectorAll(".recordForm").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = serializeForm(form);
      const type = form.dataset.type === "gallery" ? "galleries" : "exhibitions";
      const response = await fetch(`/api/${type}/${form.dataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        alert("No se pudo guardar.");
        return;
      }
      await loadDb();
      renderAdmin();
    });
  });
}

async function loadDb() {
  const response = await fetch("/api/db", { cache: "no-store" });
  state.db = await response.json();
}

async function render() {
  if (!state.db.galleries.length) await loadDb();
  const hash = location.hash.replace(/^#/, "") || "home";
  const [route, slug] = hash.split("/");
  document.body.dataset.screen = route;
  if (route !== "map" && state.map) {
    state.map.remove();
    state.map = null;
  }
  if (route === "map") renderMap();
  else if (route === "list") renderAgenda();
  else if (route === "gallery") renderGallery(slug);
  else if (route === "exhibition") renderExhibition(slug);
  else if (route === "admin") renderAdmin();
  else renderFeatured();
  app.classList.remove("viewReady");
  requestAnimationFrame(() => app.classList.add("viewReady"));
  app.focus({ preventScroll: true });
}

document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.route)));
topAction.addEventListener("click", () => {
  if (document.body.dataset.hasAction === "true") history.back();
});
window.addEventListener("hashchange", render);
render();
