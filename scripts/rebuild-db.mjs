import fs from "node:fs";
import path from "node:path";

const TODAY = "2026-04-23";
const DB_PATH = path.join(process.cwd(), "data", "voy-veo-db.json");

const coords = {
  "barro": [-34.6288217, -58.3594058],
  "cassia-house": [-34.5891679, -58.4016007],
  "cecilia-caballero": [-34.6077223, -58.3792542],
  "centro-de-edicion": [-34.5931028, -58.5237927],
  "cosmocosa": [-34.5930262, -58.3898008],
  "decorativo": [-34.5826111, -58.4010761],
  "gachi-prieto": [-34.5890156, -58.4342916],
  "galeria-del-infinito": [-34.5896412, -58.3881619],
  "grasa": [-34.59556566480638, -58.379702617954855],
  "hache": [-34.6004868, -58.4314018],
  "jose-hernandez": [-34.5797076, -58.4049882],
  "miranda-bosch": [-34.5905745, -58.3865476],
  "mnba": [-34.5839152, -58.3929152],
  "moderno": [-34.6220663, -58.370745],
  "nora-fisch": [-34.6218834, -58.3757664],
  "palais": [-34.6106974, -58.3747864],
  "pasto": [-34.618111, -58.3758105],
  "phuyu": [-34.5965929, -58.3784962],
  "piedras": [-34.6172991, -58.3744465],
  "praxis": [-34.5945253, -58.386081],
  "rubbers": [-34.5895471, -58.3864136],
  "ruth-benzacar": [-34.5914013, -58.4430439],
  "sivori": [-34.568917, -58.4181105],
  "the-white-lodge": [-34.6027446, -58.3873049],
  "van-riel": [-34.5929576, -58.3783554],
  "w-galeria": [-34.6237947, -58.3712826]
};

const galleryImages = {
  "cassia-house": "https://d1a9qnv764bsoo.cloudfront.net/stores/005/757/666/rte/1212312312313.png",
  "hache": "https://hachegaleria.com/wp-content/uploads/2021/08/Leila-Tschopp.-La-casa-de-fuego-La-casa-en-llamas-curaduria-Fernanda-Pinta.-Hache-Galería-Buenos-Aires-Argentina-2021.-Fotografía-Ignacio-Iasparra_23.jpg",
  "nora-fisch": "https://norafisch.com/wp-content/uploads/2022/09/Alejandra-Fenochio-Rodolfo-San-Gladiolo-1992-WEB-ES.jpg",
  "ruth-benzacar": "https://ruthbenzacar.com/wp-content/uploads/2026/03/H3A1437-2280x1200.jpg",
  "barro": "https://www.barro.cc/images/Image/2628/feature/BA_Mu_CHOLA_EnElAire_1.jpg",
  "gachi-prieto": "https://static.wixstatic.com/media/c596bd_ef546b26bb1d452a8839d9704645674a%7Emv2.jpg/v1/fit/w_2500,h_1330,al_c/c596bd_ef546b26bb1d452a8839d9704645674a%7Emv2.jpg",
  "praxis": "https://admin.praxis-art.com/wp-content/uploads/sa-3-scaled.jpg",
  "galeria-del-infinito": "https://www.delinfinito.com/wp-content/uploads/2020/09/slideshow-inicio-del-infinito-27-2500x1440.jpg",
  "centro-de-edicion": "https://static.wixstatic.com/media/557eff_4899240ebfc3460db2cd8b35dfb00982~mv2.jpg/v1/fit/w_480",
  "pasto": "http://www.pastogaleria.com.ar/imgs/facebook.jpg",
  "piedras": "https://piedrasgaleria.com/wp-content/uploads/2026/04/Copia-de-CG_%C2%A1Dame-todo_Aerografia.-Acrilico-sobre-tela_-160-x-225-cm_2025.jpg",
  "w-galeria": "https://w-w-w.ar/media/img/_medium/W_INFO_WG_1_.jpg",
  "mnba": "https://www.bellasartes.gob.ar/static/assets/img/mnba-frente.jpg",
  "moderno": "https://museomoderno.org/wp-content/uploads/2020/10/PortadaBasta.jpg",
  "sivori": "https://static.buenosaires.gob.ar/sites/default/files/styles/card_img_top/public/2026-03/1%C2%B0%20premio%20-%20Nirino.jpg?itok=3F-65Z8Z",
  "jose-hernandez": "https://static.buenosaires.gob.ar/sites/default/files/2026-03/DSC_5514.JPG"
};

const exhibitionImages = {
  "un-hogar-para-lo-sensible": "https://d1a9qnv764bsoo.cloudfront.net/stores/005/757/666/rte/1212312312313.png",
  "la-intencion-del-aire": "https://hachegaleria.com/wp-content/uploads/2021/08/Leila-Tschopp.-La-casa-de-fuego-La-casa-en-llamas-curaduria-Fernanda-Pinta.-Hache-Galería-Buenos-Aires-Argentina-2021.-Fotografía-Ignacio-Iasparra_23.jpg",
  "los-premios": "https://norafisch.com/wp-content/uploads/2022/09/Alejandra-Fenochio-Rodolfo-San-Gladiolo-1992-WEB-ES.jpg",
  "78-87": "https://norafisch.com/wp-content/uploads/2022/09/Alejandra-Fenochio-Rodolfo-San-Gladiolo-1992-WEB-ES.jpg",
  "adentro-afuera": "https://ruthbenzacar.com/wp-content/uploads/2026/03/H3A1437-2280x1200.jpg",
  "en-el-aire": "https://www.barro.cc/images/Image/2628/feature/BA_Mu_CHOLA_EnElAire_1.jpg",
  "arquitecturas-suaves": "https://admin.praxis-art.com/wp-content/uploads/sa-3-scaled.jpg",
  "spectrum": "https://www.delinfinito.com/wp-content/uploads/2020/09/slideshow-inicio-del-infinito-27-2500x1440.jpg",
  "la-grafica-contemporanea": "https://static.wixstatic.com/media/557eff_4899240ebfc3460db2cd8b35dfb00982~mv2.jpg/v1/fit/w_480",
  "notas-para-una-coreografia-del-cielo": "https://static.wixstatic.com/media/c596bd_ef546b26bb1d452a8839d9704645674a%7Emv2.jpg/v1/fit/w_2500,h_1330,al_c/c596bd_ef546b26bb1d452a8839d9704645674a%7Emv2.jpg",
  "mundo-fofo": "https://w-w-w.ar/media/img/_medium/W_NATURAE_6_A.jpg",
  "pasado-manana": "http://www.pastogaleria.com.ar/imgs/facebook.jpg",
  "retratos": "https://piedrasgaleria.com/wp-content/uploads/2026/04/Copia-de-CG_%C2%A1Dame-todo_Aerografia.-Acrilico-sobre-tela_-160-x-225-cm_2025.jpg",
  "eugenio-dittborn-historias-del-rostro": "https://www.bellasartes.gob.ar/static/assets/img/mnba-frente.jpg",
  "lily-salvo-en-el-umbral-del-misterio": "https://www.bellasartes.gob.ar/static/assets/img/mnba-frente.jpg",
  "basta-el-arte-frente-a-la-crisis-ambiental": "https://museomoderno.org/wp-content/uploads/2020/10/PortadaBasta.jpg",
  "salon-de-arte-textil-2024-2025": "https://static.buenosaires.gob.ar/sites/default/files/styles/card_img_top/public/2026-03/1%C2%B0%20premio%20-%20Nirino.jpg?itok=3F-65Z8Z",
  "un-affaire-de-colecciones": "https://static.buenosaires.gob.ar/sites/default/files/styles/card_img_top/public/2026-03/02.JPG?itok=CWSXAOgX",
  "bioartesanias-el-futuro-ya-llego": "https://static.buenosaires.gob.ar/sites/default/files/2026-03/DSC_5514.JPG",
  "inercia-escultura-en-la-coleccion-del-palais-de-glace": "https://static.buenosaires.gob.ar/sites/default/files/2026-03/DSC_5514.JPG"
};

const weeklyHours = (schedule = {}) => ({
  monday: Object.hasOwn(schedule, "monday") ? schedule.monday : null,
  tuesday: Object.hasOwn(schedule, "tuesday") ? schedule.tuesday : null,
  wednesday: Object.hasOwn(schedule, "wednesday") ? schedule.wednesday : null,
  thursday: Object.hasOwn(schedule, "thursday") ? schedule.thursday : null,
  friday: Object.hasOwn(schedule, "friday") ? schedule.friday : null,
  saturday: Object.hasOwn(schedule, "saturday") ? schedule.saturday : null,
  sunday: Object.hasOwn(schedule, "sunday") ? schedule.sunday : null
});

const publicGallery = ({
  id,
  name,
  website,
  instagram = "",
  address,
  description,
  hours = "Horario sujeto a confirmación",
  weekly = weeklyHours(),
  featuredRank = 40,
  sourceWebsiteUrl,
  sourceInstagramUrl = instagram,
  confidence = 0.76,
  notes = [],
  publishedSummary,
  imageSource = "Fallback VoyVeo sutil",
  hoursSource = "web oficial",
  institutionType = "gallery",
  categoryLabel = institutionType === "national_museum" ? "Museo de arte público" : "Galería",
  privateWhitelist = institutionType === "gallery",
  isHouseGallery = false
}) => ({
  id,
  slug: id,
  name,
  institution_type: institutionType,
  category_label: categoryLabel,
  is_house_gallery: isHouseGallery,
  private_whitelist: privateWhitelist,
  featured_rank: featuredRank,
  address,
  lat: coords[id]?.[0] ?? null,
  lng: coords[id]?.[1] ?? null,
  website,
  instagram,
  description,
  image_url: galleryImages[id] || "",
  hours,
  weekly_hours: weekly,
  public_visible: true,
  public_visibility_status: "publicada",
  public_visibility_notes: [],
  source_website_url: sourceWebsiteUrl || website,
  source_instagram_url: sourceInstagramUrl || "",
  last_checked_at: TODAY,
  confidence_score: confidence,
  needs_review: confidence < 0.75,
  review_notes: notes,
  source_conflict: false,
  published_from: "curaduría editorial",
  published_summary:
    publishedSummary ||
    "Ficha pública curada con base en web oficial y verificación editorial complementaria.",
  fuente_exhibicion: "web oficial",
  fuente_imagen: galleryImages[id] ? "web oficial" : imageSource,
  fecha_ultima_revision: TODAY,
  conflicto_detectado: false,
  image_source_selected: galleryImages[id] ? "website" : imageSource.includes("Fallback") ? "fallback" : "website",
  hours_source_selected: hoursSource,
  hours_last_checked_at: TODAY,
  hours_website_text: hours,
  hours_instagram_text: "",
  hours_google_maps_text: "",
  hours_conflict: false,
  hours_review_notes: []
});

const galleries = [
  publicGallery({
    id: "cassia-house",
    name: "Cassia House",
    website: "https://www.cassiahouseart.com/",
    address: "Laprida 1811, Recoleta, Buenos Aires, Argentina",
    description: "Galería de arte contemporáneo con un programa de exhibiciones, eventos y proyectos curatoriales en Recoleta.",
    hours: "Horario sujeto a confirmación",
    featuredRank: 100,
    sourceWebsiteUrl: "https://www.cassiahouseart.com/us/exhibitions/",
    confidence: 0.93,
    notes: ["La exhibición vigente se consolidó desde la web oficial de Cassia House."],
    publishedSummary: "Cassia House aparece primera entre galerías privadas, con una sola exhibición vigente para no sobre-representarla.",
    isHouseGallery: true
  }),
  publicGallery({
    id: "hache",
    name: "Hache",
    website: "https://hachegaleria.com/",
    instagram: "https://www.instagram.com/hachegaleria/",
    address: "Loyola 32, Villa Crespo, Buenos Aires, Argentina",
    description: "Galería dedicada al arte contemporáneo latinoamericano, con una programación sólida de muestras, ferias y conversaciones.",
    hours: "Lunes a viernes de 14 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "14:00", close: "19:00" }],
      tuesday: [{ open: "14:00", close: "19:00" }],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 95,
    sourceWebsiteUrl: "https://hachegaleria.com/",
    confidence: 0.92
  }),
  publicGallery({
    id: "nora-fisch",
    name: "Nora Fisch",
    website: "https://norafisch.com/",
    address: "Av. San Juan 701, San Telmo, Buenos Aires, Argentina",
    description: "Una de las galerías clave de la escena local, con foco en arte latinoamericano contemporáneo y una mirada editorial fuerte.",
    hours: "Martes a viernes de 14 a 19 h. Sábados de 15 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [{ open: "14:00", close: "19:00" }],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [{ open: "15:00", close: "19:00" }],
      sunday: []
    }),
    featuredRank: 92,
    sourceWebsiteUrl: "https://norafisch.com/muestras/",
    confidence: 0.93
  }),
  publicGallery({
    id: "miranda-bosch",
    name: "Miranda Bosch",
    website: "https://art.mirandabosch.com/",
    address: "Montevideo 1723 / Timbre Arte, Retiro, Buenos Aires, Argentina",
    description: "Galería dedicada al arte contemporáneo argentino, con artistas de distintas generaciones y una programación de exhibiciones y acciones.",
    hours: "Lunes a viernes de 13 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "13:00", close: "19:00" }],
      tuesday: [{ open: "13:00", close: "19:00" }],
      wednesday: [{ open: "13:00", close: "19:00" }],
      thursday: [{ open: "13:00", close: "19:00" }],
      friday: [{ open: "13:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 88,
    sourceWebsiteUrl: "https://art.mirandabosch.com/exhibiciones/",
    confidence: 0.88
  }),
  publicGallery({
    id: "ruth-benzacar",
    name: "Ruth Benzacar",
    website: "https://ruthbenzacar.com/",
    address: "Juan Ramírez de Velasco 1287, Villa Crespo, Buenos Aires, Argentina",
    description: "Galería histórica del arte contemporáneo argentino, activa en Buenos Aires y en el circuito internacional.",
    hours: "Martes a sábado de 14 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [{ open: "14:00", close: "19:00" }],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [{ open: "14:00", close: "19:00" }],
      sunday: []
    }),
    featuredRank: 91,
    sourceWebsiteUrl: "https://ruthbenzacar.com/en/exhibitions/",
    confidence: 0.9
  }),
  publicGallery({
    id: "barro",
    name: "Barro",
    website: "https://www.barro.cc/es",
    address: "Caboto 531, La Boca, Buenos Aires, Argentina",
    description: "Galería de arte contemporáneo en La Boca, reconocida por su escala expositiva y por impulsar artistas argentinos en el circuito internacional.",
    hours: "Visitas con cita previa durante montaje",
    featuredRank: 90,
    sourceWebsiteUrl: "https://www.barro.cc/es",
    confidence: 0.87,
    notes: ["La web muestra la exhibición y el estado de apertura como dato vigente."],
    hoursSource: "web oficial"
  }),
  publicGallery({
    id: "gachi-prieto",
    name: "Gachi Prieto",
    website: "https://www.gachiprieto.com/",
    address: "Uriarte 1373, Palermo, Buenos Aires, Argentina",
    description: "Plataforma de producción, difusión y reflexión sobre arte contemporáneo latinoamericano con una programación sostenida en Palermo.",
    hours: "Martes a sábados de 14 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [{ open: "14:00", close: "19:00" }],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [{ open: "14:00", close: "19:00" }],
      sunday: []
    }),
    featuredRank: 83,
    sourceWebsiteUrl: "https://www.gachiprieto.com/galeria",
    sourceInstagramUrl: "https://www.instagram.com/gachiprieto/",
    confidence: 0.79,
    notes: ["La exhibición destacada se apoyó en una nota editorial complementaria al sitio oficial."]
  }),
  publicGallery({
    id: "praxis",
    name: "Praxis",
    website: "https://admin.praxis-art.com/contacto/",
    address: "Arenales 1311, Retiro, Buenos Aires, Argentina",
    description: "Galería con base en Buenos Aires y Nueva York, enfocada en arte latinoamericano moderno y contemporáneo.",
    hours: "Martes a viernes de 10:30 a 19:30 h. Sábados de 10:30 a 14 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [{ open: "10:30", close: "19:30" }],
      wednesday: [{ open: "10:30", close: "19:30" }],
      thursday: [{ open: "10:30", close: "19:30" }],
      friday: [{ open: "10:30", close: "19:30" }],
      saturday: [{ open: "10:30", close: "14:00" }],
      sunday: []
    }),
    featuredRank: 82,
    sourceWebsiteUrl: "https://admin.praxis-art.com/en/exhibitions/elisa-lutteral-diego-miccige-macarena-rojas-osterling-soft-architectures/",
    confidence: 0.82
  }),
  publicGallery({
    id: "galeria-del-infinito",
    name: "Galería del Infinito",
    website: "https://delinfinito.com/",
    address: "Av. Quintana 325 PB, Recoleta, Buenos Aires, Argentina",
    description: "Espacio experimental dedicado a cruces entre vanguardias históricas, arte contemporáneo y nuevas tecnologías.",
    hours: "Lunes a viernes de 11 a 17 h",
    weekly: weeklyHours({
      monday: [{ open: "11:00", close: "17:00" }],
      tuesday: [{ open: "11:00", close: "17:00" }],
      wednesday: [{ open: "11:00", close: "17:00" }],
      thursday: [{ open: "11:00", close: "17:00" }],
      friday: [{ open: "11:00", close: "17:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 80,
    sourceWebsiteUrl: "https://www.delinfinito.com/novedades/galeria-del-infinito-en-este-arte-2026/",
    confidence: 0.81
  }),
  publicGallery({
    id: "centro-de-edicion",
    name: "Centro de Edición",
    website: "https://www.centrodeedicion.com/",
    instagram: "https://www.instagram.com/centrodeedicion/",
    address: "Rosales 4027, Villa Lynch, Buenos Aires, Argentina",
    description: "Taller-galería especializado en litografía y gráfica contemporánea, con un perfil único dentro del circuito local.",
    hours: "Lunes a viernes de 9 a 16 h, con cita previa",
    weekly: weeklyHours({
      monday: [{ open: "09:00", close: "16:00" }],
      tuesday: [{ open: "09:00", close: "16:00" }],
      wednesday: [{ open: "09:00", close: "16:00" }],
      thursday: [{ open: "09:00", close: "16:00" }],
      friday: [{ open: "09:00", close: "16:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 76,
    sourceWebsiteUrl: "https://www.centrodeedicion.com/",
    confidence: 0.78,
    notes: ["La muestra cargada refleja programación editorial reciente y material público de feria."]
  }),
  publicGallery({
    id: "cecilia-caballero",
    name: "Cecilia Caballero",
    website: "http://www.galeriaceciliacaballero.com.ar",
    instagram: "https://www.instagram.com/galeriaceciliacaballero/",
    address: "Suipacha 1151, Retiro, Buenos Aires, Argentina",
    description: "Galería dedicada a la difusión del arte argentino contemporáneo, con artistas emergentes y consagrados.",
    hours: "Lunes a viernes de 14:30 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "14:30", close: "19:00" }],
      tuesday: [{ open: "14:30", close: "19:00" }],
      wednesday: [{ open: "14:30", close: "19:00" }],
      thursday: [{ open: "14:30", close: "19:00" }],
      friday: [{ open: "14:30", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 74,
    sourceWebsiteUrl: "http://www.galeriaceciliacaballero.com.ar",
    confidence: 0.79,
    notes: ["La muestra visible en abril 2026 surge de agenda cultural y prensa especializada."]
  }),
  publicGallery({
    id: "rubbers",
    name: "Rubbers",
    website: "http://rubbers.com.ar/",
    instagram: "https://www.instagram.com/galeria_rubbers/",
    address: "Av. Alvear 1640 PB, Recoleta, Buenos Aires, Argentina",
    description: "Galería fundada en 1957, con un programa que conecta nombres históricos y artistas contemporáneos argentinos.",
    hours: "Lunes a viernes de 14 a 18 h",
    weekly: weeklyHours({
      monday: [{ open: "14:00", close: "18:00" }],
      tuesday: [{ open: "14:00", close: "18:00" }],
      wednesday: [{ open: "14:00", close: "18:00" }],
      thursday: [{ open: "14:00", close: "18:00" }],
      friday: [{ open: "14:00", close: "18:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 79,
    sourceWebsiteUrl: "http://rubbers.com.ar/",
    confidence: 0.8,
    notes: ["La exhibición cargada combina ficha de galería y cobertura cultural reciente."]
  }),
  publicGallery({
    id: "the-white-lodge",
    name: "The White Lodge",
    website: "https://thewhitelodge.art/TWL-BUENOS-AIRES",
    address: "Lavalle 1447, 4° 10, Tribunales, Buenos Aires, Argentina",
    description: "Galería boutique con sede en el centro porteño, enfocada en una experiencia íntima de exhibición.",
    hours: "Lunes a viernes de 15 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "15:00", close: "19:00" }],
      tuesday: [{ open: "15:00", close: "19:00" }],
      wednesday: [{ open: "15:00", close: "19:00" }],
      thursday: [{ open: "15:00", close: "19:00" }],
      friday: [{ open: "15:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 77,
    sourceWebsiteUrl: "https://thewhitelodge.art/TWL-BUENOS-AIRES",
    confidence: 0.85
  }),
  publicGallery({
    id: "cosmocosa",
    name: "Cosmocosa",
    website: "https://www.cosmocosa.com/",
    address: "Montevideo 1430 PB, Recoleta, Buenos Aires, Argentina",
    description: "Galería y plataforma de investigación dedicada al arte moderno y contemporáneo latinoamericano.",
    hours: "Miércoles a viernes de 14 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 75,
    sourceWebsiteUrl: "https://www.cosmocosa.com/contact/",
    confidence: 0.78,
    notes: ["La programación visible responde a showroom y muestras recientes del espacio."]
  }),
  publicGallery({
    id: "phuyu",
    name: "Phuyu",
    website: "https://galeria-phuyu.com/",
    instagram: "https://www.instagram.com/galeria_phuyu/",
    address: "Esmeralda 988, int. 5, Retiro, Buenos Aires, Argentina",
    description: "Espacio de exposición para artistas de distintas disciplinas y nacionalidades, con una mirada latinoamericana.",
    hours: "Lunes a viernes de 15 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "15:00", close: "19:00" }],
      tuesday: [{ open: "15:00", close: "19:00" }],
      wednesday: [{ open: "15:00", close: "19:00" }],
      thursday: [{ open: "15:00", close: "19:00" }],
      friday: [{ open: "15:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 73,
    sourceWebsiteUrl: "https://galeria-phuyu.com/galeria/",
    confidence: 0.77,
    notes: ["La ficha pública usa la última programación identificable en el sitio oficial."]
  }),
  publicGallery({
    id: "grasa",
    name: "Grasa",
    website: "https://galeriagrasa.com/",
    instagram: "https://www.instagram.com/galeriagrasa/",
    address: "Suipacha 1067, 1° B, Retiro, Buenos Aires, Argentina",
    description: "Galería gestionada por artistas, con una programación enfocada en experimentación material y conceptual.",
    hours: "Visitas con cita previa",
    featuredRank: 78,
    sourceWebsiteUrl: "https://galeriagrasa.com/El-corazon-de-lo-que-existe",
    confidence: 0.84,
    notes: ["La sede actual en Suipacha se consolidó desde la web y directorios de Meridiano/NODO."],
    hoursSource: "web oficial"
  }),
  publicGallery({
    id: "van-riel",
    name: "van Riel",
    website: "http://galeriavanriel.com.ar/",
    instagram: "https://www.instagram.com/galeriavanriel/",
    address: "Juncal 790 PB, Retiro, Buenos Aires, Argentina",
    description: "La galería con mayor trayectoria en Argentina, hoy activa desde una sede minimalista en Retiro.",
    hours: "Lunes a viernes de 15 a 19 h",
    weekly: weeklyHours({
      monday: [{ open: "15:00", close: "19:00" }],
      tuesday: [{ open: "15:00", close: "19:00" }],
      wednesday: [{ open: "15:00", close: "19:00" }],
      thursday: [{ open: "15:00", close: "19:00" }],
      friday: [{ open: "15:00", close: "19:00" }],
      saturday: [],
      sunday: []
    }),
    featuredRank: 72,
    sourceWebsiteUrl: "http://galeriavanriel.com.ar/",
    confidence: 0.72,
    notes: ["Se privilegió la visibilidad pública por su peso histórico, aun con programación reciente menos accesible."],
    publishedSummary: "Ficha pública armada con datos institucionales confiables y una referencia reciente de actividad cultural."
  }),
  publicGallery({
    id: "w-galeria",
    name: "W—galería",
    website: "https://w-w-w.ar/index.php/es/info",
    instagram: "https://www.instagram.com/w_w_w_galeria/",
    address: "Defensa 1369, San Telmo, Buenos Aires, Argentina",
    description: "Plataforma crítica y curatorial con varias sedes, activa en exhibiciones de escala institucional y archivo.",
    hours: "Lunes a sábado de 12 a 17 h",
    weekly: weeklyHours({
      monday: [{ open: "12:00", close: "17:00" }],
      tuesday: [{ open: "12:00", close: "17:00" }],
      wednesday: [{ open: "12:00", close: "17:00" }],
      thursday: [{ open: "12:00", close: "17:00" }],
      friday: [{ open: "12:00", close: "17:00" }],
      saturday: [{ open: "12:00", close: "17:00" }],
      sunday: []
    }),
    featuredRank: 81,
    sourceWebsiteUrl: "https://w-w-w.ar/index.php/es/edition/mundo-fofo",
    confidence: 0.85
  }),
  publicGallery({
    id: "pasto",
    name: "Pasto",
    website: "https://www.pastogaleria.com.ar/",
    instagram: "https://www.instagram.com/pastogaleria/",
    address: "Chacabuco 866, San Telmo, Buenos Aires, Argentina",
    description: "Galería y plataforma de difusión de arte contemporáneo latinoamericano con base en el sur de la ciudad.",
    hours: "Miércoles a sábado de 14 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [{ open: "14:00", close: "19:00" }],
      sunday: []
    }),
    featuredRank: 84,
    sourceWebsiteUrl: "https://www.pastogaleria.com.ar/contacto.php",
    confidence: 0.83
  }),
  publicGallery({
    id: "piedras",
    name: "Piedras",
    website: "https://piedrasgaleria.com/",
    address: "Perú 1065, San Telmo, Buenos Aires, Argentina",
    description: "Galería de San Telmo con un programa contemporáneo atravesado por ficción, género, cuerpo y experimentación.",
    hours: "Miércoles a sábado de 14 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [],
      wednesday: [{ open: "14:00", close: "19:00" }],
      thursday: [{ open: "14:00", close: "19:00" }],
      friday: [{ open: "14:00", close: "19:00" }],
      saturday: [{ open: "14:00", close: "19:00" }],
      sunday: []
    }),
    featuredRank: 86,
    sourceWebsiteUrl: "https://piedrasgaleria.com/info/",
    confidence: 0.91
  }),
  publicGallery({
    id: "mnba",
    name: "Museo Nacional de Bellas Artes",
    website: "https://www.bellasartes.gob.ar/",
    address: "Av. del Libertador 1473, Recoleta, Buenos Aires, Argentina",
    description: "Museo nacional con una programación fuerte de exposiciones temporarias junto a su acervo histórico.",
    hours: "Martes a viernes de 11 a 19:30 h. Sábados y domingos de 10 a 19:30 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [{ open: "11:00", close: "19:30" }],
      wednesday: [{ open: "11:00", close: "19:30" }],
      thursday: [{ open: "11:00", close: "19:30" }],
      friday: [{ open: "11:00", close: "19:30" }],
      saturday: [{ open: "10:00", close: "19:30" }],
      sunday: [{ open: "10:00", close: "19:30" }]
    }),
    featuredRank: 89,
    sourceWebsiteUrl: "https://www.bellasartes.gob.ar/exhibiciones/",
    confidence: 0.95,
    institutionType: "national_museum",
    privateWhitelist: false
  }),
  publicGallery({
    id: "moderno",
    name: "Museo Moderno de Buenos Aires",
    website: "https://museomoderno.org/",
    address: "Av. San Juan 350, San Telmo, Buenos Aires, Argentina",
    description: "Museo de la ciudad dedicado al arte moderno y contemporáneo, con un programa de exposiciones, educación y archivo muy activo.",
    hours: "Horario sujeto a confirmación",
    featuredRank: 85,
    sourceWebsiteUrl: "https://museomoderno.org/",
    confidence: 0.78,
    institutionType: "national_museum",
    privateWhitelist: false,
    notes: ["La web oficial exhibe el programa 2026, pero la grilla horaria requiere verificación puntual."]
  }),
  publicGallery({
    id: "decorativo",
    name: "Museo Nacional de Arte Decorativo",
    website: "https://museoartedecorativo.cultura.gob.ar/",
    address: "Av. del Libertador 1902, Palermo, Buenos Aires, Argentina",
    description: "Casa-museo nacional con colección permanente y exhibiciones temporarias ligadas al diseño, patrimonio y artes decorativas.",
    hours: "Miércoles a domingos de 13 a 19 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [],
      wednesday: [{ open: "13:00", close: "19:00" }],
      thursday: [{ open: "13:00", close: "19:00" }],
      friday: [{ open: "13:00", close: "19:00" }],
      saturday: [{ open: "13:00", close: "19:00" }],
      sunday: [{ open: "13:00", close: "19:00" }]
    }),
    featuredRank: 73,
    sourceWebsiteUrl: "https://museoartedecorativo.cultura.gob.ar/exhibiciones/",
    confidence: 0.84,
    institutionType: "national_museum",
    privateWhitelist: false
  }),
  publicGallery({
    id: "sivori",
    name: "Museo de Artes Plásticas Eduardo Sívori",
    website: "https://buenosaires.gob.ar/cultura/museos/museosivori",
    address: "Av. Infanta Isabel 555, Palermo, Buenos Aires, Argentina",
    description: "Museo de arte argentino de los siglos XX y XXI, con exposiciones temporarias y concursos históricos de la ciudad.",
    hours: "Lunes, miércoles, jueves y viernes de 11 a 19 h. Sábados, domingos y feriados de 11 a 20 h",
    weekly: weeklyHours({
      monday: [{ open: "11:00", close: "19:00" }],
      tuesday: [],
      wednesday: [{ open: "11:00", close: "19:00" }],
      thursday: [{ open: "11:00", close: "19:00" }],
      friday: [{ open: "11:00", close: "19:00" }],
      saturday: [{ open: "11:00", close: "20:00" }],
      sunday: [{ open: "11:00", close: "20:00" }]
    }),
    featuredRank: 82,
    sourceWebsiteUrl: "https://buenosaires.gob.ar/museosivori/exposiciones-en-el-museo-sivori",
    confidence: 0.93,
    institutionType: "national_museum",
    privateWhitelist: false
  }),
  publicGallery({
    id: "jose-hernandez",
    name: "Museo de Arte Popular José Hernández",
    website: "https://buenosaires.gob.ar/cultura/museos/museojosehernandez",
    address: "Av. del Libertador 2373, Palermo, Buenos Aires, Argentina",
    description: "Museo público dedicado al arte popular argentino, con muestras que conectan tradición artesanal y prácticas contemporáneas.",
    hours: "Lunes, miércoles, jueves y viernes de 11 a 19 h. Sábados, domingos y feriados de 11 a 20 h",
    weekly: weeklyHours({
      monday: [{ open: "11:00", close: "19:00" }],
      tuesday: [],
      wednesday: [{ open: "11:00", close: "19:00" }],
      thursday: [{ open: "11:00", close: "19:00" }],
      friday: [{ open: "11:00", close: "19:00" }],
      saturday: [{ open: "11:00", close: "20:00" }],
      sunday: [{ open: "11:00", close: "20:00" }]
    }),
    featuredRank: 78,
    sourceWebsiteUrl: "https://buenosaires.gob.ar/cultura/museos/museojosehernandez",
    confidence: 0.93,
    institutionType: "national_museum",
    privateWhitelist: false
  }),
  publicGallery({
    id: "palais",
    name: "Palais de Glace",
    website: "https://palaisdeglace.cultura.gob.ar/",
    address: "Perú 222, Monserrat, Buenos Aires, Argentina",
    description: "Institución pública con programación itinerante y exposiciones de la colección del Palais y del Salón Nacional.",
    hours: "Miércoles a domingos de 11 a 18 h",
    weekly: weeklyHours({
      monday: [],
      tuesday: [],
      wednesday: [{ open: "11:00", close: "18:00" }],
      thursday: [{ open: "11:00", close: "18:00" }],
      friday: [{ open: "11:00", close: "18:00" }],
      saturday: [{ open: "11:00", close: "18:00" }],
      sunday: [{ open: "11:00", close: "18:00" }]
    }),
    featuredRank: 81,
    sourceWebsiteUrl: "https://palaisdeglace.cultura.gob.ar/exhibiciones/",
    confidence: 0.9,
    institutionType: "national_museum",
    privateWhitelist: false,
    publishedSummary: "La ubicación pública refleja la sede de la muestra actualmente visitable."
  })
];

const exhibitionSeeds = [
  {
    id: "un-hogar-para-lo-sensible",
    title: "Un hogar para lo sensible",
    galleryId: "cassia-house",
    startDate: "2026-04-10",
    endDate: "2026-05-05",
    artists: ["Toia Salvay", "Jazmín Puyén", "Rosa Amarilla", "Nayla Zarba"],
    description:
      "Muestra curada por Catalina Bagnato Irigoyen que reúne cuatro prácticas sensibles en diálogo con el espacio de Cassia House.",
    status: "current",
    featuredRank: 94,
    source: "https://www.cassiahouseart.com/us/exhibitions/"
  },
  {
    id: "la-intencion-del-aire",
    title: "La intención del aire",
    galleryId: "hache",
    startDate: "2026-03-18",
    endDate: "2026-06-19",
    artists: ["Gilda Picabea"],
    description:
      "Exhibición individual de Gilda Picabea con curaduría de Patrick Greaney en la sede de Hache.",
    status: "current",
    featuredRank: 99,
    source: "https://hachegaleria.com/"
  },
  {
    id: "los-premios",
    title: "Los premios",
    galleryId: "nora-fisch",
    startDate: "2026-03-21",
    endDate: "2026-04-30",
    artists: ["Gala Berger"],
    description:
      "Una de las dos muestras actuales de Nora Fisch durante abril de 2026.",
    status: "current",
    featuredRank: 97,
    source: "https://norafisch.com/muestras/"
  },
  {
    id: "78-87",
    title: "78/87",
    galleryId: "nora-fisch",
    startDate: "2026-03-21",
    endDate: "2026-04-30",
    artists: ["Lux Lindner"],
    description:
      "Exhibición vigente en Nora Fisch junto con Los premios, en diálogo de salas durante marzo y abril de 2026.",
    status: "current",
    featuredRank: 92,
    source: "https://norafisch.com/muestras/"
  },
  {
    id: "y-esta-imagen-reflejo-de-que",
    title: "Y esta imagen, reflejo de qué",
    galleryId: "miranda-bosch",
    dateText: "noviembre 2025 — febrero 2026",
    artists: ["Andrés Arzuaga"],
    description:
      "Exhibición individual listada como On View en el archivo reciente de Miranda Bosch.",
    status: "past",
    featuredRank: 79,
    source: "https://art.mirandabosch.com/exhibiciones/"
  },
  {
    id: "adentro-afuera",
    title: "ADENTRO AFUERA",
    galleryId: "ruth-benzacar",
    startDate: "2026-03-14",
    endDate: "2026-05-02",
    artists: ["Carlos Herrera"],
    description:
      "Muestra centrada en una década clave de la producción de Carlos Herrera, parte de un proyecto mayor en curso.",
    status: "current",
    featuredRank: 93,
    source: "https://ruthbenzacar.com/en/exhibitions/adentro-afuera/"
  },
  {
    id: "colectiva-puerto-madero",
    title: "Colectiva / Puerto Madero",
    galleryId: "ruth-benzacar",
    startDate: "2025-09-30",
    endDate: "2025-12-31",
    artists: ["Chiachio & Giannone", "Mariana Telleria", "Tomás Saraceno"],
    description:
      "Presentación del nuevo espacio de Puerto Madero de Ruth Benzacar, con selección de obras de artistas de la galería.",
    status: "past",
    featuredRank: 72,
    source: "https://ruthbenzacar.com/en/exhibitions/colectiva/"
  },
  {
    id: "en-el-aire",
    title: "En el aire",
    galleryId: "barro",
    dateText: "Desde el 8 de noviembre de 2025",
    artists: ["La Chola Poblete"],
    description:
      "Instalación y muestra de La Chola Poblete en la sede de La Boca, con curaduría de Antonio Villa y texto de Andrea Giunta.",
    status: "current",
    featuredRank: 96,
    source: "https://www.barro.cc/es"
  },
  {
    id: "notas-para-una-coreografia-del-cielo",
    title: "Notas para una coreografía del cielo",
    galleryId: "gachi-prieto",
    dateText: "2025",
    artists: ["Guillermo Mena"],
    description:
      "Muestra individual de Guillermo Mena identificada en la programación reciente del artista y de Gachi Prieto.",
    status: "past",
    featuredRank: 76,
    source: "https://guillermomena.com/"
  },
  {
    id: "arquitecturas-suaves",
    title: "Arquitecturas suaves",
    galleryId: "praxis",
    startDate: "2025-11-07",
    endDate: "2026-01-03",
    artists: ["Elisa Lutteral", "Diego Miccige", "Macarena Rojas Osterling"],
    description:
      "Exhibición que presentó tres incorporaciones recientes al roster de Praxis en una conversación sobre materialidad y forma.",
    status: "past",
    featuredRank: 75,
    source:
      "https://admin.praxis-art.com/en/exhibitions/elisa-lutteral-diego-miccige-macarena-rojas-osterling-soft-architectures/"
  },
  {
    id: "spectrum",
    title: "Spectrum",
    galleryId: "galeria-del-infinito",
    startDate: "2026-01-04",
    endDate: "2026-01-07",
    artists: ["Leo Battistelli"],
    description:
      "Proyecto presentado por Del Infinito en ESTE ARTE 2026, centrado en naturaleza, percepción y energía material.",
    status: "past",
    featuredRank: 74,
    source: "https://www.delinfinito.com/novedades/galeria-del-infinito-en-este-arte-2026/"
  },
  {
    id: "la-grafica-contemporanea",
    title: "La gráfica contemporánea",
    galleryId: "centro-de-edicion",
    dateText: "Fechas por confirmar",
    artists: ["Horacio Zabala", "Malala Tiscornia", "Sandra Astuena", "Silvia Brewda", "Cristina Hauk"],
    description:
      "Selección reciente de obra gráfica y litográfica difundida por el Centro de Edición en ferias y canales públicos.",
    status: "current",
    featuredRank: 63,
    source: "https://www.mapa.art/copia-de-oda-5"
  },
  {
    id: "fragilidad-y-fortaleza",
    title: "Fragilidad y fortaleza",
    galleryId: "cecilia-caballero",
    startDate: "2026-03-20",
    endDate: "2026-04-30",
    artists: ["Elia Gasparolo", "Joaquín González Bonorino", "Sur.châle"],
    description:
      "Exposición en torno a naturaleza, materia y tiempo, citada en la agenda cultural de abril de 2026.",
    status: "current",
    featuredRank: 82,
    source:
      "https://www.infobae.com/cultura/agenda-cultura/2026/03/13/guia-de-arte-y-cultura-semana-del-13-al-20-de-marzo-de-2026/?outputType=amp-type"
  },
  {
    id: "el-arte-de-regalar",
    title: "El arte de regalar",
    galleryId: "rubbers",
    startDate: "2025-12-17",
    endDate: "2026-01-02",
    artists: ["Marcelo Burgos", "Alejandra Césaro", "Eduardo Cetner", "Juan Doffo", "Liliana Golubinsky", "Gaby Grobo", "Mario Gurfein", "Omar Rayo", "Daniel Sarobe", "Ana Seggiaro", "Antonio Seguí"],
    description:
      "Selección de obras presentada por Rubbers como propuesta de fin de año.",
    status: "past",
    featuredRank: 68,
    source:
      "https://www.infobae.com/cultura/2025/12/17/las-galerias-y-espacios-de-arte-de-buenos-aires-impulsan-ferias-accesibles-para-las-fiestas/"
  },
  {
    id: "happy-house",
    title: "Happy House",
    galleryId: "the-white-lodge",
    dateText: "Programación vigente en la sede de Buenos Aires",
    artists: ["Pablo Peisino"],
    description:
      "Exhibición temporal destacada por la sede porteña de The White Lodge.",
    status: "current",
    featuredRank: 77,
    source: "https://thewhitelodge.art/TWL-BUENOS-AIRES"
  },
  {
    id: "showroom-cosmocosa",
    title: "Showroom Cosmocosa",
    galleryId: "cosmocosa",
    dateText: "Programación de showroom",
    artists: ["Luis Felipe Noé", "Kenneth Kemble", "Kazuya Sakai", "Oscar Bony", "Nahuel Vecino", "Amalia Pica"],
    description:
      "Apertura de showroom con obras de artistas modernos y contemporáneos en el espacio de Recoleta.",
    status: "current",
    featuredRank: 67,
    source: "https://www.cosmocosa.com/cosmocosa-2/1348/?lang=en"
  },
  {
    id: "entre-dos-tierras",
    title: "Entre dos tierras",
    galleryId: "phuyu",
    dateText: "Programación reciente",
    artists: ["Andrea Lamas", "Ana Popescu", "Carolina Cardich", "Cristias Rosas", "Federico Porfiri", "Jacinta Besa", "Madrid Lagarrigue", "Maria Fé Romero", "Verónica Cerna"],
    description:
      "Exposición colectiva que acompañó la transición de la galería hacia su nueva sede en Buenos Aires.",
    status: "current",
    featuredRank: 66,
    source: "https://galeria-phuyu.com/galeria/"
  },
  {
    id: "el-corazon-de-lo-que-existe",
    title: "El corazón de lo que existe",
    galleryId: "grasa",
    startDate: "2025-03-27",
    endDate: "2025-05-29",
    artists: ["Amparo Viau"],
    description:
      "Exhibición individual curada por Joaquín Rodríguez en la nueva sede de Grasa.",
    status: "past",
    featuredRank: 71,
    source: "https://galeriagrasa.com/El-corazon-de-lo-que-existe"
  },
  {
    id: "centenario-van-riel",
    title: "Centenario de la Galería van Riel",
    galleryId: "van-riel",
    startDate: "2024-06-25",
    dateText: "25 de junio de 2024",
    artists: ["Malena Babino", "Adriana Lauría", "Graciela Sarti", "Gabriela van Riel"],
    description:
      "Presentación pública por el centenario de la galería más antigua de Buenos Aires.",
    status: "past",
    featuredRank: 62,
    source: "https://bellasartes.gob.ar/agenda/vanriel/"
  },
  {
    id: "mundo-fofo",
    title: "Mundo fofo",
    galleryId: "w-galeria",
    dateText: "junio 2025 — agosto 2025",
    artists: ["Cristina Schiavi"],
    description:
      "Exhibición de Cristina Schiavi en W—galería, centrada en cuerpo, ternura y humor como lenguaje político.",
    status: "past",
    featuredRank: 78,
    source: "https://w-w-w.ar/index.php/es/edition/mundo-fofo"
  },
  {
    id: "pasado-manana",
    title: "pasado mañana",
    galleryId: "pasto",
    startDate: "2025-06-19",
    endDate: "2025-09-01",
    artists: ["Ariel Cusnir"],
    description:
      "Exposición individual curada por Marcelo Galindo en la sala de Pasto.",
    status: "past",
    featuredRank: 73,
    source: "https://www.pastogaleria.com.ar/exhibiciones.php?i=112"
  },
  {
    id: "retratos",
    title: "Retratos",
    galleryId: "piedras",
    startDate: "2026-02-21",
    endDate: "2026-04-04",
    artists: ["Sonia Ruiz"],
    description:
      "Muestra individual de Sonia Ruiz en Piedras, con pinturas recientes atravesadas por escenas domésticas y retratos.",
    status: "current",
    featuredRank: 84,
    source: "https://piedrasgaleria.com/exhibicion/retratos/"
  },
  {
    id: "eugenio-dittborn-historias-del-rostro",
    title: "Eugenio Dittborn. Historias del rostro",
    galleryId: "mnba",
    startDate: "2026-03-20",
    endDate: "2026-05-31",
    artists: ["Eugenio Dittborn"],
    description:
      "Primera muestra en el país del artista chileno, con curaduría de Justo Pastor Mellado.",
    status: "current",
    featuredRank: 91,
    source: "https://www.bellasartes.gob.ar/exhibiciones/"
  },
  {
    id: "lily-salvo-en-el-umbral-del-misterio",
    title: "Lily Salvo. En el umbral del misterio",
    galleryId: "mnba",
    startDate: "2026-04-08",
    endDate: "2026-05-10",
    artists: ["Lily Salvo"],
    description:
      "Selección de grabados, pinturas y dibujos de la artista rioplatense en el segundo piso del Bellas Artes.",
    status: "current",
    featuredRank: 87,
    source: "https://www.bellasartes.gob.ar/exhibiciones/"
  },
  {
    id: "basta-el-arte-frente-a-la-crisis-ambiental",
    title: "¡Basta! El arte frente a la crisis ambiental",
    galleryId: "moderno",
    dateText: "Programación 2026",
    artists: ["Programa del Museo Moderno"],
    description:
      "Una de las exhibiciones destacadas por la programación 2026 del Museo Moderno.",
    status: "current",
    featuredRank: 83,
    source: "https://museomoderno.org/"
  },
  {
    id: "perros-sueltos-en-el-museo",
    title: "¡Perros sueltos en el Museo! 230 porcelanas europeas",
    galleryId: "decorativo",
    dateText: "Fechas por confirmar",
    artists: ["Colección MNAD"],
    description:
      "Muestra destacada en la sección de exhibiciones del Museo Nacional de Arte Decorativo.",
    status: "current",
    featuredRank: 69,
    source: "https://museoartedecorativo.cultura.gob.ar/exhibiciones/"
  },
  {
    id: "salon-de-arte-textil-2024-2025",
    title: "Salón de Arte Textil (SAT) 2024/2025",
    galleryId: "sivori",
    startDate: "2026-03-21",
    endDate: "2026-05-17",
    artists: ["Selección SAT 2024/2025"],
    description:
      "Nueva edición del Salón de Arte Textil presentada en el Sívori durante el otoño de 2026.",
    status: "current",
    featuredRank: 74,
    source: "https://buenosaires.gob.ar/museosivori/exposiciones-en-el-museo-sivori"
  },
  {
    id: "un-affaire-de-colecciones",
    title: "Un affaire de colecciones",
    galleryId: "sivori",
    startDate: "2026-03-21",
    endDate: "2026-05-03",
    artists: ["Patricio Gil Flood", "Colección Sívori"],
    description:
      "Muestra que pone en diálogo la obra de Patricio Gil Flood con grabados y dibujos de la colección del museo.",
    status: "current",
    featuredRank: 80,
    source: "https://buenosaires.gob.ar/museosivori/exposiciones-en-el-museo-sivori"
  },
  {
    id: "bioartesanias-el-futuro-ya-llego",
    title: "Bioartesanías: el futuro ya llegó",
    galleryId: "jose-hernandez",
    startDate: "2025-11-08",
    endDate: "2026-08-23",
    artists: ["Programa Ensayar Museos 2023"],
    description:
      "Exhibición sobre biomateriales, sustentabilidad y arte popular contemporáneo en el MAP.",
    status: "current",
    featuredRank: 79,
    source: "https://buenosaires.gob.ar/cultura/museos/museojosehernandez/bioartesanias-el-futuro-ya-llego"
  },
  {
    id: "inercia-escultura-en-la-coleccion-del-palais-de-glace",
    title: "Inercia. Escultura en la colección del Palais de Glace",
    galleryId: "palais",
    startDate: "2026-02-12",
    endDate: "2026-08-01",
    artists: ["Colección Palais de Glace"],
    description:
      "Selección de esculturas de la colección del Palais presentada en la Manzana de las Luces.",
    status: "current",
    featuredRank: 88,
    source: "https://palaisdeglace.cultura.gob.ar/exhibiciones/"
  },
  {
    id: "ciencia-y-fantasia",
    title: "Ciencia y fantasía. Egiptología y egiptofilia en la Argentina",
    galleryId: "mnba",
    startDate: "2025-11-19",
    endDate: "2026-04-19",
    artists: ["Colecciones públicas y privadas"],
    description:
      "Exposición temporal del Bellas Artes dedicada a los vínculos locales con el imaginario egipcio.",
    status: "current",
    featuredRank: 70,
    source: "https://www.bellasartes.gob.ar/exhibiciones/"
  }
];

const artistMap = new Map();

const artistId = (name) =>
  name
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

for (const exhibition of exhibitionSeeds) {
  for (const name of exhibition.artists) {
    if (!artistMap.has(name)) {
      artistMap.set(name, { id: artistId(name), name, needs_review: false });
    }
  }
}

const artists = [...artistMap.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));

const exhibitions = exhibitionSeeds.map((record) => ({
  id: record.id,
  slug: record.id,
  title: record.title,
  gallery_id: record.galleryId,
  start_date: record.startDate || "",
  end_date: record.endDate || "",
  date_text: record.dateText || "",
  artist_ids: record.artists.map((name) => artistMap.get(name).id),
  description: record.description,
  status: record.status,
  featured_rank: record.featuredRank,
  image_url: exhibitionImages[record.id] || galleryImages[record.galleryId] || "",
  public_visible: true,
  public_visibility_status: "publicada",
  public_visibility_notes: [],
  source_website_url: record.source,
  source_instagram_url: "",
  last_checked_at: TODAY,
  confidence_score: record.status === "current" ? 0.88 : 0.78,
  needs_review: record.dateText === "Fechas por confirmar",
  review_notes: record.dateText === "Fechas por confirmar" ? ["La fecha exacta no aparece en fuente pública legible."] : [],
  source_conflict: false,
  published_from: "curaduría editorial",
  published_summary: "Registro público cargado desde fuente pública confiable.",
  fuente_exhibicion: "web oficial",
  fuente_imagen: exhibitionImages[record.id] || galleryImages[record.galleryId] ? "web oficial" : "Fallback VoyVeo sutil",
  fecha_ultima_revision: TODAY,
  conflicto_detectado: false,
  image_source_selected: exhibitionImages[record.id] || galleryImages[record.galleryId] ? "website" : "fallback"
}));

const db = {
  galleries,
  exhibitions,
  artists,
  meta: {
    city: "Buenos Aires",
    country: "Argentina",
    private_gallery_whitelist: galleries.filter((gallery) => gallery.private_whitelist).map((gallery) => gallery.name),
    seed_note:
      "Base curada de VoyVeo reconstruida con galerías privadas, museos de arte y exhibiciones actuales, recientes o próximas a partir de fuentes públicas confiables.",
    last_checked_at: TODAY
  }
};

fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log(`DB reconstruida: ${galleries.length} instituciones, ${exhibitions.length} exhibiciones, ${artists.length} artistas.`);

