// Data for the seven Nisir Designs service pages. Centralizing this here
// means the home page list, header dropdown, footer links, and each
// service's own page all render from one source instead of seven
// hand-duplicated HTML files.

export type ServiceField =
  | { type: "select"; name: string; label: string; options: string[] }
  | { type: "number"; name: string; label: string }
  | { type: "dimensions" }
  | {
      type: "file";
      name: string;
      label: string;
      accept: string;
      hint: string;
      maxBytes: number;
    };

/** Which procedural figure draws for this service. See components/ui/plate.tsx. */
export type PlateKind = "grid" | "orbit" | "stack" | "wave" | "solid" | "lattice" | "weave";

export type Service = {
  slug: string;
  number: string;
  titleTop: string;
  titleBottom: string;
  /** Short one-line summary used on the home page list and footer. */
  blurb: string;
  /** Longer sentence used in the hero paragraph and intro lead. */
  detail: string;
  /** Which side of the practice this sits on — used to group the index. */
  discipline: "Digital" | "Brand" | "Matter" | "Education";
  plate: PlateKind;
  scope: string[];
  gallery: string[];
  fields: ServiceField[];
};

const materialOptions = [
  "Matte PLA Shell",
  "Wood-Filled Fibre",
  "High-Impact Structural Rigid",
  "Not sure — advise me",
];

const dimensionalFields: ServiceField[] = [
  { type: "dimensions" },
  { type: "select", name: "material", label: "Material / texture", options: materialOptions },
  { type: "number", name: "production_volume", label: "Production volume" },
  {
    type: "file",
    name: "files",
    label: "Reference / engineering files",
    accept: ".step,.stp,.stl,.obj,image/*",
    hint: "STEP, STL, OBJ, sketches or reference images. Prototype limit: 100MB per file.",
    maxBytes: 104_857_600,
  },
];

export const services: Service[] = [
  {
    slug: "web-development",
    discipline: "Digital",
    plate: "grid",
    number: "01",
    titleTop: "Web",
    titleBottom: "Development",
    blurb: "Web systems with clarity, speed, and intent.",
    detail:
      "We design and build web experiences that make complex businesses feel obvious — structurally sound, visually precise, and ready to scale.",
    scope: [
      "Product & marketing websites",
      "Web applications",
      "Design systems & frontend architecture",
      "CMS and content experiences",
      "Performance & accessibility",
      "Ongoing product iteration",
    ],
    gallery: [
      "Product platform",
      "Editorial website",
      "Commerce experience",
      "Dashboard system",
      "Campaign microsite",
      "Design system",
    ],
    fields: [
      {
        type: "select",
        name: "project_type",
        label: "Project type",
        options: ["Marketing website", "Web application", "E-commerce", "Redesign / modernization", "Design system", "Other"],
      },
      {
        type: "select",
        name: "current_stage",
        label: "Current stage",
        options: ["Idea / discovery", "Existing product", "Design ready", "Development ready"],
      },
      {
        type: "select",
        name: "timeline",
        label: "Timeline",
        options: ["Flexible", "1–2 months", "3–4 months", "5+ months"],
      },
    ],
  },
  {
    slug: "app-development",
    discipline: "Digital",
    plate: "stack",
    number: "02",
    titleTop: "App",
    titleBottom: "Development",
    blurb: "Digital products built around real behavior.",
    detail:
      "From first interaction to system logic, we shape mobile and cross-platform products around usefulness, confidence, and long-term maintainability.",
    scope: [
      "iOS & Android product design",
      "Cross-platform application development",
      "Product strategy & UX flows",
      "Interactive prototyping",
      "API & backend integration",
      "QA, launch & iteration",
    ],
    gallery: [
      "Consumer app",
      "Service platform",
      "Mobile commerce",
      "Operations tool",
      "Prototype system",
      "Cross-platform product",
    ],
    fields: [
      {
        type: "select",
        name: "platform",
        label: "Platform",
        options: ["iOS", "Android", "iOS + Android", "Cross-platform", "Not sure yet"],
      },
      {
        type: "select",
        name: "current_stage",
        label: "Current stage",
        options: ["Idea / discovery", "Wireframes", "Design ready", "Existing app"],
      },
      {
        type: "select",
        name: "primary_need",
        label: "Primary need",
        options: ["Strategy & UX", "UI design", "Development", "End-to-end product"],
      },
    ],
  },
  {
    slug: "graphic-design",
    discipline: "Brand",
    plate: "solid",
    number: "03",
    titleTop: "Graphic",
    titleBottom: "Design",
    blurb: "Identity systems that hold attention — and meaning.",
    detail:
      "We turn positioning into visual language: identities, campaigns, and communication systems designed to remain coherent across every touchpoint.",
    scope: [
      "Brand identity systems",
      "Visual direction",
      "Campaign creative",
      "Marketing collateral",
      "Editorial & presentation design",
      "Brand guidelines",
    ],
    gallery: [
      "Identity system",
      "Campaign language",
      "Editorial direction",
      "Packaging concept",
      "Presentation system",
      "Brand toolkit",
    ],
    fields: [
      {
        type: "select",
        name: "design_need",
        label: "Design need",
        options: ["Brand identity", "Brand refresh", "Campaign design", "Presentation / editorial", "Marketing collateral", "Other"],
      },
      {
        type: "select",
        name: "brand_stage",
        label: "Brand stage",
        options: ["New brand", "Existing brand", "Repositioning"],
      },
      {
        type: "select",
        name: "deliverable_scope",
        label: "Deliverable scope",
        options: ["Single deliverable", "Small system", "Full identity system"],
      },
    ],
  },
  {
    slug: "motion-graphics",
    discipline: "Brand",
    plate: "wave",
    number: "04",
    titleTop: "Motion",
    titleBottom: "Graphics",
    blurb: "Movement with a reason.",
    detail:
      "We use motion to clarify stories, reveal systems, and make brands feel alive — from restrained interface movement to expressive campaign films.",
    scope: [
      "Brand motion systems",
      "Explainers & launch films",
      "Product animation",
      "Social motion content",
      "Title sequences",
      "3D-assisted motion",
    ],
    gallery: [
      "Brand motion",
      "Product reveal",
      "Launch film",
      "Interface motion",
      "Social series",
      "Title sequence",
    ],
    fields: [
      {
        type: "select",
        name: "motion_type",
        label: "Motion type",
        options: ["Brand animation", "Explainer", "Product animation", "Social content", "Title sequence", "Other"],
      },
      {
        type: "select",
        name: "approx_duration",
        label: "Approx. duration",
        options: ["Under 15 sec", "15–30 sec", "30–60 sec", "60+ sec"],
      },
      {
        type: "select",
        name: "assets_available",
        label: "Assets available",
        options: ["Brand assets ready", "Some assets ready", "Need full creative direction"],
      },
    ],
  },
  {
    slug: "3d-modelling",
    discipline: "Matter",
    plate: "lattice",
    number: "05",
    titleTop: "Custom",
    titleBottom: "3D Modelling",
    blurb: "From idea to manufacturable geometry.",
    detail:
      "We translate sketches, references, and technical requirements into purposeful 3D models for prototypes, products, visualization, and production.",
    scope: [
      "Concept modelling",
      "Product & enclosure modelling",
      "Prototype-ready geometry",
      "STL / STEP / OBJ preparation",
      "Design-for-manufacturing refinement",
      "Visualization assets",
    ],
    gallery: [
      "Product enclosure",
      "Mechanical concept",
      "Form study",
      "Prototype geometry",
      "Surface refinement",
      "Manufacturing-ready asset",
    ],
    fields: dimensionalFields,
  },
  {
    slug: "3d-printing",
    discipline: "Matter",
    plate: "orbit",
    number: "06",
    titleTop: "Custom",
    titleBottom: "3D Printing",
    blurb: "Physical ideas, produced with precision.",
    detail:
      "Our Ontario production workflow turns validated geometry into tangible prototypes and small production runs with material and finish decisions made deliberately.",
    scope: [
      "Prototype printing",
      "Functional parts",
      "Low-volume production",
      "Material consultation",
      "Print preparation",
      "Post-processing guidance",
    ],
    gallery: [
      "Functional prototype",
      "Small-batch part",
      "Material study",
      "Presentation model",
      "Custom fixture",
      "Production sample",
    ],
    fields: dimensionalFields,
  },
  {
    slug: "fashion-academy",
    discipline: "Education",
    plate: "weave",
    number: "07",
    titleTop: "Fashion",
    titleBottom: "Academy",
    blurb: "Craft knowledge carried forward.",
    detail:
      "The Fashion Academy connects Nisir’s design practice to hands-on learning in Ethiopia — developing practical apparel skills through an offline, human-centered learning environment.",
    scope: [
      "Apparel fundamentals",
      "Pattern & garment thinking",
      "Practical making skills",
      "Creative direction",
      "Portfolio development",
      "Offline learning in Ethiopia",
    ],
    gallery: [
      "Student work",
      "Pattern study",
      "Material exploration",
      "Garment development",
      "Studio learning",
      "Final presentation",
    ],
    fields: [
      {
        type: "select",
        name: "interested_in",
        label: "I am interested in",
        options: ["Academy enrollment", "Program information", "Partnership", "Workshop / training", "Other"],
      },
      {
        type: "select",
        name: "experience_level",
        label: "Experience level",
        options: ["Beginner", "Some experience", "Intermediate", "Advanced"],
      },
      {
        type: "select",
        name: "preferred_contact",
        label: "Preferred contact",
        options: ["Email", "Phone / WhatsApp"],
      },
    ],
  },
];

export function serviceName(service: Pick<Service, "titleTop" | "titleBottom">) {
  return `${service.titleTop} ${service.titleBottom}`;
}

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function nextService(slug: string) {
  const index = services.findIndex((service) => service.slug === slug);
  return services[(index + 1) % services.length];
}
