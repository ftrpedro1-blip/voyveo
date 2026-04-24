export const BA_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const MAX_PINNED_GALLERIES = 3;
export const PIN_STORAGE_KEY = "voy-veo:pinned-galleries";

export const icons = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
  building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16M6 21V7l6-4 6 4v14"/><path d="M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="14" rx="2.5"/><path d="m7 13 2.8-3 3.1 3.4 2.1-2.1L18 14"/><circle cx="8.2" cy="8.2" r="1.2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 12h6M8 15h5"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11Z"/><circle cx="12" cy="10" r="2.1"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11Z"/><circle cx="12" cy="10" r="2.1" fill="currentColor" stroke="none"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 14.8 8.8 21 9.7 16.5 14.1 17.6 20.3 12 17.3 6.4 20.3 7.5 14.1 3 9.7 9.2 8.8 12 3z"/></svg>'
};

export const tabItems = [
  ["home", icons.card, "Destacadas"],
  ["map", icons.map, "Mapa"],
  ["list", icons.calendar, "Agenda"]
];

export const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Mi\u00e9rcoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "S\u00e1bado",
  sunday: "Domingo"
};

export const weekdayToKey = {
  friday: "friday",
  monday: "monday",
  saturday: "saturday",
  sunday: "sunday",
  thursday: "thursday",
  tuesday: "tuesday",
  wednesday: "wednesday"
};
