import fs from "node:fs";
import path from "node:path";

const TODAY = "2026-04-23";
const DB_PATH = path.join(process.cwd(), "data", "voy-veo-db.json");

const emptyWeekly = () => ({
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null
});

const block = (open, close) => [{ open, close }];

const weekly = (days) => ({
  monday: days.monday ?? [],
  tuesday: days.tuesday ?? [],
  wednesday: days.wednesday ?? [],
  thursday: days.thursday ?? [],
  friday: days.friday ?? [],
  saturday: days.saturday ?? [],
  sunday: days.sunday ?? []
});

const repairMojibake = (value) => {
  if (typeof value !== "string" || !/[ÃÂâ]/.test(value)) return value;
  return Buffer.from(value, "latin1").toString("utf8");
};

const sanitize = (value) => {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitize(entry)]));
  }
  return repairMojibake(value);
};

const verified = ({
  hours,
  weeklyHours,
  sourceSelected,
  websiteText = "",
  mapsText = "",
  instagramText = "",
  facebookText = "",
  guideText = "",
  verifiedCount = 2,
  conflict = false,
  notes = []
}) => ({
  hours,
  weekly_hours: weeklyHours,
  hours_status: "verified",
  hours_source_selected: sourceSelected,
  hours_last_checked_at: TODAY,
  hours_website_text: websiteText,
  hours_google_maps_text: mapsText,
  hours_instagram_text: instagramText,
  hours_facebook_text: facebookText,
  hours_guide_text: guideText,
  hours_conflict: conflict,
  hours_verified_sources_count: verifiedCount,
  hours_review_notes: notes
});

const verify = ({
  websiteText = "",
  mapsText = "",
  instagramText = "",
  facebookText = "",
  guideText = "",
  notes = []
}) => ({
  hours: "Verificar antes de visitar",
  weekly_hours: emptyWeekly(),
  hours_status: "verify",
  hours_source_selected: "Verificar antes de visitar",
  hours_last_checked_at: TODAY,
  hours_website_text: websiteText,
  hours_google_maps_text: mapsText,
  hours_instagram_text: instagramText,
  hours_facebook_text: facebookText,
  hours_guide_text: guideText,
  hours_conflict: true,
  hours_verified_sources_count: 0,
  hours_review_notes: notes
});

const hoursById = {
  "cassia-house": verified({
    hours: "Lun a Mar, Jue a Dom 15:00–20:00",
    weeklyHours: weekly({
      monday: block("15:00", "20:00"),
      tuesday: block("15:00", "20:00"),
      wednesday: [],
      thursday: block("15:00", "20:00"),
      friday: block("15:00", "20:00"),
      saturday: block("15:00", "20:00"),
      sunday: block("15:00", "20:00")
    }),
    sourceSelected: "web oficial + guía cultural",
    websiteText: "LUN - MAR, JUE - DOM | 15 - 20hs",
    guideText: "Lunes, Martes y Jueves a Domingo de 15 a 20 hs.",
    verifiedCount: 2
  }),
  "hache": verified({
    hours: "Lun a Vie 14:00–19:00",
    weeklyHours: weekly({
      monday: block("14:00", "19:00"),
      tuesday: block("14:00", "19:00"),
      wednesday: block("14:00", "19:00"),
      thursday: block("14:00", "19:00"),
      friday: block("14:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "web oficial + directorio cultural",
    websiteText: "Lunes a viernes de 14 a 19 h. Consultar por otros horarios.",
    guideText: "Lunes a viernes de 14 a 19 h",
    mapsText: "Lunes a viernes 14:00 - 19:00",
    verifiedCount: 3
  }),
  "nora-fisch": verified({
    hours: "Mar a Sáb 14:00–19:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("14:00", "19:00"),
      wednesday: block("14:00", "19:00"),
      thursday: block("14:00", "19:00"),
      friday: block("14:00", "19:00"),
      saturday: block("14:00", "19:00"),
      sunday: []
    }),
    sourceSelected: "web oficial + directorio de mapas",
    websiteText: "Martes a sábados de 14 a 19 hs.",
    guideText: "Martes a sábados de 14 a 19 hs.",
    mapsText: "Tuesday 14:00 - 19:00 ... Saturday 14:00 - 19:00",
    verifiedCount: 3
  }),
  "miranda-bosch": verified({
    hours: "Lun a Vie 13:00–19:00",
    weeklyHours: weekly({
      monday: block("13:00", "19:00"),
      tuesday: block("13:00", "19:00"),
      wednesday: block("13:00", "19:00"),
      thursday: block("13:00", "19:00"),
      friday: block("13:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "web oficial + directorio público",
    websiteText: "Lun/Vie: 13:00 — 19:00",
    guideText: "Lunes a Viernes de 14 a 18hs",
    mapsText: "Lunes 13:00 - 19:00 ... Viernes 13:00 - 19:00",
    verifiedCount: 2,
    conflict: true,
    notes: ["Cancillería publica una franja distinta (14 a 18 h). Se priorizó el sitio oficial."]
  }),
  "ruth-benzacar": verified({
    hours: "Mar a Sáb 14:00–19:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("14:00", "19:00"),
      wednesday: block("14:00", "19:00"),
      thursday: block("14:00", "19:00"),
      friday: block("14:00", "19:00"),
      saturday: block("14:00", "19:00"),
      sunday: []
    }),
    sourceSelected: "web oficial + guía cultural",
    websiteText: "Martes a sábado 14 a 19 hs. Feriados y días no laborales: solicitar cita previa.",
    guideText: "De martes a sábado, de 14:00 a 19:00 horas",
    verifiedCount: 2,
    notes: ["La sede cargada en VoyVeo corresponde a Villa Crespo."]
  }),
  "barro": verify({
    websiteText: "Galería cerrada por montaje. Visitas con cita previa.",
    guideText: "Lunes a viernes de 12 a 18 hs. Sábados de 15 a 18 hs.",
    mapsText: "Tuesday 12:00 - 18:00 / Saturday 15:00 - 19:00",
    notes: ["La web oficial indica visitas con cita previa, mientras directorios públicos muestran horario abierto fijo."]
  }),
  "gachi-prieto": verified({
    hours: "Mar a Sáb 14:00–19:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("14:00", "19:00"),
      wednesday: block("14:00", "19:00"),
      thursday: block("14:00", "19:00"),
      friday: block("14:00", "19:00"),
      saturday: block("14:00", "19:00"),
      sunday: []
    }),
    sourceSelected: "web oficial",
    websiteText: "Martes a sábados de 14 a 19hs.",
    guideText: "Lunes a sábado de 14:00 a 19:00",
    verifiedCount: 2,
    conflict: true,
    notes: ["Un directorio público suma apertura los lunes. Se priorizó el horario publicado por la galería."]
  }),
  "praxis": verified({
    hours: "Lun a Vie 10:30–19:30 · Sáb 10:30–14:00",
    weeklyHours: weekly({
      monday: block("10:30", "19:30"),
      tuesday: block("10:30", "19:30"),
      wednesday: block("10:30", "19:30"),
      thursday: block("10:30", "19:30"),
      friday: block("10:30", "19:30"),
      saturday: block("10:30", "14:00"),
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Lunes a viernes de 10.30 a 19.30 h. / sábados 10.30 a 14 h.",
    mapsText: "Monday 10:30 - 19:30 ... Saturday 10:30 - 14:00",
    verifiedCount: 2,
    notes: ["El sitio oficial de contacto no publica horarios; se tomaron dos guías públicas coincidentes."]
  }),
  "galeria-del-infinito": verified({
    hours: "Lun a Vie 11:00–17:00",
    weeklyHours: weekly({
      monday: block("11:00", "17:00"),
      tuesday: block("11:00", "17:00"),
      wednesday: block("11:00", "17:00"),
      thursday: block("11:00", "17:00"),
      friday: block("11:00", "17:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "web oficial",
    websiteText: "lunes a viernes de 11 a 17 hs.",
    guideText: "Lunes a viernes de 11 a 18 hs.",
    verifiedCount: 2,
    conflict: true,
    notes: ["Las guías públicas muestran cierre a las 18 h, pero el sitio oficial vigente publica 11 a 17 h."]
  }),
  "centro-de-edicion": verify({
    websiteText: "Sin horario general visible en la página de contacto. El taller publica franjas puntuales.",
    guideText: "Lunes a viernes de 9 a 16 h. con cita previa.",
    notes: ["Se detectó horario en Meridiano y franjas de taller en el sitio, pero no una pauta general inequívoca para visitas públicas."]
  }),
  "cecilia-caballero": verified({
    hours: "Lun a Vie 14:30–19:00",
    weeklyHours: weekly({
      monday: block("14:30", "19:00"),
      tuesday: block("14:30", "19:00"),
      wednesday: block("14:30", "19:00"),
      thursday: block("14:30", "19:00"),
      friday: block("14:30", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Lunes a viernes, de 14:30 a 19 h",
    facebookText: "Lunes a viernes, de 14:30 a 19:00h",
    verifiedCount: 2,
    notes: ["La franja se tomó de guías culturales coincidentes; el sitio oficial no expone el horario en el snippet público."]
  }),
  "rubbers": verified({
    hours: "Lun a Vie 14:00–18:00",
    weeklyHours: weekly({
      monday: block("14:00", "18:00"),
      tuesday: block("14:00", "18:00"),
      wednesday: block("14:00", "18:00"),
      thursday: block("14:00", "18:00"),
      friday: block("14:00", "18:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Lunes a Viernes 14 a 18 hs",
    facebookText: "Lunes a viernes de 14:00 a 18:00",
    mapsText: "lunes 11:00 - 20:00 / sábado 11:00 - 13:30",
    verifiedCount: 2,
    conflict: true,
    notes: ["Cylex muestra una franja distinta; dos guías culturales recientes coinciden en 14 a 18 h."]
  }),
  "the-white-lodge": verified({
    hours: "Lun a Vie 15:00–19:00",
    weeklyHours: weekly({
      monday: block("15:00", "19:00"),
      tuesday: block("15:00", "19:00"),
      wednesday: block("15:00", "19:00"),
      thursday: block("15:00", "19:00"),
      friday: block("15:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "web oficial + directorio cultural",
    websiteText: "Lunes a viernes de 15 a 19 hs.",
    guideText: "Lunes a viernes de 15 a 19 h",
    verifiedCount: 2,
    conflict: true,
    notes: ["El Ojo del Arte publica 16 a 20 h. Se priorizó la franja vigente en la sede oficial."]
  }),
  "cosmocosa": verified({
    hours: "Lun a Vie 14:00–19:00",
    weeklyHours: weekly({
      monday: block("14:00", "19:00"),
      tuesday: block("14:00", "19:00"),
      wednesday: block("14:00", "19:00"),
      thursday: block("14:00", "19:00"),
      friday: block("14:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "web oficial + Meridiano",
    websiteText: "Puede visitarnos de lunes a viernes de 14 a 19 hs. Otros horarios con cita previa.",
    guideText: "Lunes a viernes de 14 a 19h u en otros horarios con cita previa.",
    verifiedCount: 2
  }),
  "phuyu": verified({
    hours: "Lun a Vie 15:00–19:00",
    weeklyHours: weekly({
      monday: block("15:00", "19:00"),
      tuesday: block("15:00", "19:00"),
      wednesday: block("15:00", "19:00"),
      thursday: block("15:00", "19:00"),
      friday: block("15:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Lunes a viernes de 15 a 19 hs.",
    mapsText: "Lunes a viernes de 15 a 19 hs.",
    verifiedCount: 2,
    notes: ["La web pública de contacto no muestra horario, pero dos directorios culturales coinciden."]
  }),
  "grasa": verify({
    websiteText: "Visitas con cita previa.",
    guideText: "Martes a sábados de 14 a 19 hs.",
    notes: ["Las fuentes públicas difieren entre visitas con cita y franja abierta fija."]
  }),
  "van-riel": verified({
    hours: "Lun a Vie 15:00–19:00",
    weeklyHours: weekly({
      monday: block("15:00", "19:00"),
      tuesday: block("15:00", "19:00"),
      wednesday: block("15:00", "19:00"),
      thursday: block("15:00", "19:00"),
      friday: block("15:00", "19:00"),
      saturday: [],
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Lunes a viernes de 15 a 19 h",
    mapsText: "lunes a viernes de 15 a 20 hs",
    verifiedCount: 2,
    conflict: true,
    notes: ["Un directorio histórico publica 15 a 20 h. Se priorizaron dos fuentes más recientes que coinciden en 15 a 19 h."]
  }),
  "w-galeria": verified({
    hours: "Mar a Sáb 12:00–18:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("12:00", "18:00"),
      wednesday: block("12:00", "18:00"),
      thursday: block("12:00", "18:00"),
      friday: block("12:00", "18:00"),
      saturday: block("12:00", "18:00"),
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Martes a sábado de 12 a 18hs",
    mapsText: "Tuesday: 12:00–6:00 PM ... Saturday: 12:00–6:00 PM",
    verifiedCount: 3,
    notes: ["Meridiano agrega lunes con cita previa; VoyVeo publica el horario general de atención."]
  }),
  "pasto": verified({
    hours: "Mar a Sáb 15:00–20:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("15:00", "20:00"),
      wednesday: block("15:00", "20:00"),
      thursday: block("15:00", "20:00"),
      friday: block("15:00", "20:00"),
      saturday: block("15:00", "20:00"),
      sunday: []
    }),
    sourceSelected: "guías públicas coincidentes",
    guideText: "Martes a sábado de 15 a 20 hs.",
    verifiedCount: 2
  }),
  "piedras": verify({
    websiteText: "Miércoles a sábado 14-19h o con cita previa",
    mapsText: "Wednesday 16:00 - 19:00 / Friday 16:00 - 19:00",
    guideText: "Dirección anterior y sin horario explícito en fuentes secundarias recientes",
    notes: ["El sitio oficial publica 14 a 19 h, pero directorios externos recuperan una sede y franja anteriores. Se recomienda verificar antes de visitar."]
  }),
  "mnba": verified({
    hours: "Mar a Vie 11:00–19:30 · Sáb y Dom 10:00–19:30",
    weeklyHours: weekly({
      monday: [],
      tuesday: block("11:00", "19:30"),
      wednesday: block("11:00", "19:30"),
      thursday: block("11:00", "19:30"),
      friday: block("11:00", "19:30"),
      saturday: block("10:00", "19:30"),
      sunday: block("10:00", "19:30")
    }),
    sourceSelected: "web oficial + Google Arts & Culture",
    websiteText: "Martes a viernes, de 11.00 a 19.30. Sábados y domingos, de 10.00 a 19.30.",
    guideText: "Martes a viernes de 11 a 20. Sábados y domingos de 10 a 20.",
    mapsText: "Tuesday 11:00 – 19:30 ... Sunday 10:00 – 19:30",
    verifiedCount: 3
  }),
  "moderno": verified({
    hours: "Lun, Mié a Vie 11:00–19:00 · Sáb y Dom 11:00–20:00",
    weeklyHours: weekly({
      monday: block("11:00", "19:00"),
      tuesday: [],
      wednesday: block("11:00", "19:00"),
      thursday: block("11:00", "19:00"),
      friday: block("11:00", "19:00"),
      saturday: block("11:00", "20:00"),
      sunday: block("11:00", "20:00")
    }),
    sourceSelected: "web oficial + GCBA",
    websiteText: "Lunes, miércoles, jueves y viernes: 11:00 a 19:00. Sábados, domingos y feriados: 11:00 a 20:00. Martes cerrado.",
    guideText: "Lunes a viernes, 11 a 19 h | Sábados, domingos y feriados, 11 a 20 h | Martes cerrado.",
    verifiedCount: 2
  }),
  "decorativo": verified({
    hours: "Mié a Dom 13:00–19:00",
    weeklyHours: weekly({
      monday: [],
      tuesday: [],
      wednesday: block("13:00", "19:00"),
      thursday: block("13:00", "19:00"),
      friday: block("13:00", "19:00"),
      saturday: block("13:00", "19:00"),
      sunday: block("13:00", "19:00")
    }),
    sourceSelected: "web oficial + guía turística",
    websiteText: "Miércoles a domingos, de 13 a 19 hs. Último ingreso 18:30 hs.",
    guideText: "Miércoles a domingos, de 13 a 19 hs.",
    mapsText: "miércoles: 13:00–19:00 ... domingo: 13:00–19:00",
    verifiedCount: 3
  }),
  "sivori": verified({
    hours: "Lun, Mié a Vie 11:00–19:00 · Sáb y Dom 11:00–20:00",
    weeklyHours: weekly({
      monday: block("11:00", "19:00"),
      tuesday: [],
      wednesday: block("11:00", "19:00"),
      thursday: block("11:00", "19:00"),
      friday: block("11:00", "19:00"),
      saturday: block("11:00", "20:00"),
      sunday: block("11:00", "20:00")
    }),
    sourceSelected: "web oficial + GCBA",
    websiteText: "Lunes, miércoles, jueves y viernes de 11 a 19 h. Sábados, domingos y feriados de 11 a 20 h. Martes cerrado.",
    guideText: "Lunes, miércoles, jueves y viernes de 11 a 19 h. Sábados, domingos y feriados de 11 a 20 h.",
    verifiedCount: 2
  }),
  "jose-hernandez": verified({
    hours: "Lun, Mié a Vie 11:00–19:00 · Sáb y Dom 11:00–20:00",
    weeklyHours: weekly({
      monday: block("11:00", "19:00"),
      tuesday: [],
      wednesday: block("11:00", "19:00"),
      thursday: block("11:00", "19:00"),
      friday: block("11:00", "19:00"),
      saturday: block("11:00", "20:00"),
      sunday: block("11:00", "20:00")
    }),
    sourceSelected: "web oficial + Google Arts & Culture",
    websiteText: "Lunes, miércoles, jueves y viernes de 11 a 19 h. Sábados, domingos y feriados de 11 a 20 h. Martes cerrado.",
    guideText: "Lunes, miércoles, jueves y viernes de 11 a 19 h | Sábados, domingos y feriados de 11 a 20 h | Martes cerrado.",
    mapsText: "Monday 11:00–19:00 ... Sunday 11:00–20:00",
    verifiedCount: 3,
    conflict: true,
    notes: ["Algunas guías turísticas antiguas muestran otra franja. Se priorizó el horario oficial más reciente."]
  }),
  "palais": verify({
    websiteText: "El Palais publica 14 a 21 h en Viamonte 525 para su sede institucional.",
    guideText: "La muestra Inercia en Perú 222 / Manzana de las Luces publica miércoles a domingos 11 a 18 h o 12 a 19 h según la página.",
    notes: ["Las páginas oficiales distinguen sede institucional y sede expositiva actual, con franjas distintas dentro del mismo ecosistema. Se recomienda verificar antes de visitar."]
  })
};

const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8").replace(/^\uFEFF/, ""));

db.galleries = db.galleries.map((gallery) => {
  const resolved = hoursById[gallery.id];
  if (!resolved) return gallery;
  return sanitize({
    ...gallery,
    ...resolved,
    hours_last_checked_at: TODAY,
    fecha_ultima_revision: TODAY,
    last_checked_at: TODAY
  });
});

fs.writeFileSync(DB_PATH, `${JSON.stringify(sanitize(db), null, 2)}\n`, "utf8");
console.log(`Horarios reconciliados para ${Object.keys(hoursById).length} espacios.`);
