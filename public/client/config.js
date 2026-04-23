export const BA_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const MAX_PINNED_GALLERIES = 3;
export const PIN_STORAGE_KEY = "voy-veo:pinned-galleries";

export const icons = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
  building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16M6 21V7l6-4 6 4v14"/><path d="M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.8C7 4.36 7.36 4 7.8 4h8.4c.44 0 .8.36.8.8v14.1l-5-2.7-5 2.7V4.8z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 14.8 8.8 21 9.7 16.5 14.1 17.6 20.3 12 17.3 6.4 20.3 7.5 14.1 3 9.7 9.2 8.8 12 3z"/></svg>'
};

export const tabItems = [
  ["home", icons.star, "Destacadas"],
  ["map", icons.map, "Mapa"],
  ["list", icons.list, "Agenda"]
];

export const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
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
