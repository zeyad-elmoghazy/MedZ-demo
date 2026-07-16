// =============================================================
// Histology catalog — modules grouped by academic year, each
// with its list of chapters. Ported from the design mock in
// `MedZ Home.dc.html` → `academicYears`. Chapter progress here
// is the DEMO default only; real per-user progress is read from
// localStorage via `lib/chapter-progress`.
// =============================================================

export type Chapter = {
  id: string;               // slug used in URLs + localStorage keys
  name: string;
  defaultProgress: number;  // 0..100 — the mock value shown until the user starts
  published: boolean;       // false until the professor publishes questions;
                            // locked chapters ignore progress / hide the quiz link
};

export type Module = {
  code: string;             // "101" — combined with subject prefix in the UI ("HIST 101")
  name: string;
  qs: number;               // question count
  chapters: Chapter[];
};

export type AcademicYear = {
  year: string;             // "1st Year"
  label: string;            // "Preclinical · Foundations"
  yearNum: string;          // "1"
  modules: Module[];
};

// A tiny slug helper — deterministic, ASCII-only. The catalog is
// static so we can compute IDs at module load time (below).
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function ch(name: string, defaultProgress: number, published = false): Chapter {
  return { id: slug(name), name, defaultProgress, published };
}

export const HISTOLOGY_ACADEMIC_YEARS: AcademicYear[] = [
  {
    year: '1st Year', label: 'Preclinical · Foundations', yearNum: '1',
    modules: [
      { code: '101', name: 'General Histology & The Cell', qs: 42, chapters: [
        ch('The Cell & Organelles', 100),
        ch('Cell Membrane & Transport', 80),
        ch('Nucleus & Cell Cycle', 60),
        ch('Microscopy & Staining Techniques', 40),
      ] },
      { code: '103', name: 'Epithelial & Connective Tissue', qs: 58, chapters: [
        ch('Covering Epithelium', 100),
        ch('Glandular Epithelium', 45),
        ch('Connective Tissue Proper', 20),
        ch('Cartilage', 0),
        ch('Bone & Ossification', 0),
      ] },
      { code: '104', name: 'Blood & Muscle Tissue', qs: 50, chapters: [
        ch('Blood Cells & Plasma', 30),
        ch('Hematopoiesis', 0),
        ch('Skeletal Muscle', 0),
        ch('Cardiac & Smooth Muscle', 0),
      ] },
    ],
  },
  {
    year: '2nd Year', label: 'Preclinical · Systems', yearNum: '2',
    modules: [
      { code: '205', name: 'Nervous & Cardiovascular Systems', qs: 52, chapters: [
        ch('Neurons & Neuroglia', 0),
        ch('Peripheral Nerves', 0),
        ch('Heart & Conduction System', 0),
        ch('Blood Vessels', 0),
      ] },
      { code: '206', name: 'Lymphoid & Endocrine Systems', qs: 48, chapters: [
        ch('Lymph Nodes & Spleen', 0),
        ch('Thymus & Tonsils', 0),
        ch('Pituitary & Thyroid', 0),
        ch('Adrenal & Pancreatic Islets', 0),
      ] },
      { code: '207', name: 'Respiratory & Digestive Systems', qs: 56, chapters: [
        ch('Upper & Lower Airways', 0),
        ch('Lung & Alveoli', 0),
        ch('GIT Tube Wall', 0),
        ch('Liver, Gallbladder & Pancreas', 0),
      ] },
    ],
  },
];

// Flat lookup helpers — cheap enough to compute at module load.
const MODULE_INDEX = new Map<string, { module: Module; year: AcademicYear }>();
HISTOLOGY_ACADEMIC_YEARS.forEach((y) => {
  y.modules.forEach((m) => MODULE_INDEX.set(m.code, { module: m, year: y }));
});

export function findModule(code: string): { module: Module; year: AcademicYear } | null {
  return MODULE_INDEX.get(code) ?? null;
}

// Design's HIST subject prefix — kept here so both pages read
// the same source when they render "HIST 101" style badges.
export const HISTOLOGY_SUBJECT_PREFIX = 'HIST';
