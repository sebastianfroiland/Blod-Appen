// Realistic Norwegian blood test data with reference ranges.
// Status: 'optimal' | 'borderline' | 'attention'
// All values lightly tuned to tell a coherent story:
//   - Slightly low hemoglobin (transparent drop trigger)
//   - Mildly elevated CRP (pulse trigger)
//   - Borderline LDL & D-vitamin
// Everything else healthy.

export const patient = {
  name: 'Ingrid Solberg',
  birthDate: '1989-04-12',
  testDate: '2026-05-18',
  lab: 'Fürst Medisinsk Laboratorium, Oslo',
  ordreId: 'FÜ-2026-0518-4421',
  overallScore: 82
}

export const flag = (value, low, high) => {
  if (value < low * 0.92 || value > high * 1.08) return 'attention'
  if (value < low || value > high) return 'borderline'
  return 'optimal'
}

// Each metric: id, name (Norwegian), short, value, unit, low, high, history[]
export const metrics = {
  // KEY
  hemoglobin: {
    id: 'hb', name: 'Hemoglobin', short: 'HB',
    value: 11.6, unit: 'g/dL', low: 11.7, high: 15.3,
    history: [13.1, 12.8, 12.4, 12.0, 11.8, 11.6],
    note: 'Litt under nedre grense. Følges opp.'
  },
  leukocytes: {
    id: 'lpk', name: 'Leukocytter', short: 'LPK',
    value: 6.4, unit: '10⁹/L', low: 3.5, high: 10.0,
    history: [5.9, 6.1, 6.0, 6.3, 6.2, 6.4]
  },
  platelets: {
    id: 'trc', name: 'Trombocytter', short: 'TRC',
    value: 248, unit: '10⁹/L', low: 145, high: 390,
    history: [230, 241, 256, 244, 252, 248]
  },
  glucose: {
    id: 'glu', name: 'Glukose (fastende)', short: 'GLU',
    value: 5.1, unit: 'mmol/L', low: 4.0, high: 6.0,
    history: [4.8, 5.0, 4.9, 5.2, 5.0, 5.1]
  },

  // CHOLESTEROL
  cholTotal: { id: 'kol', name: 'Kolesterol totalt', short: 'KOL', value: 5.4, unit: 'mmol/L', low: 0, high: 5.0, history: [4.9, 5.1, 5.2, 5.3, 5.3, 5.4] },
  cholHDL:   { id: 'hdl', name: 'HDL-kolesterol',   short: 'HDL', value: 1.6, unit: 'mmol/L', low: 1.2, high: 3.0, history: [1.5, 1.5, 1.6, 1.6, 1.5, 1.6] },
  cholLDL:   { id: 'ldl', name: 'LDL-kolesterol',   short: 'LDL', value: 3.4, unit: 'mmol/L', low: 0, high: 3.0, history: [2.9, 3.0, 3.2, 3.3, 3.3, 3.4] },

  // LIVER
  alat: { id: 'alat', name: 'ALAT', short: 'ALAT', value: 22, unit: 'U/L', low: 10, high: 45, history: [19, 21, 20, 23, 22, 22] },
  asat: { id: 'asat', name: 'ASAT', short: 'ASAT', value: 24, unit: 'U/L', low: 15, high: 35, history: [22, 23, 25, 24, 26, 24] },
  ggt:  { id: 'ggt',  name: 'Gamma-GT', short: 'GT', value: 18, unit: 'U/L', low: 10, high: 45, history: [16, 17, 17, 18, 18, 18] },

  // KIDNEY
  kreatinin: { id: 'krea', name: 'Kreatinin', short: 'KREA', value: 68, unit: 'µmol/L', low: 45, high: 90, history: [70, 69, 67, 68, 69, 68] },
  egfr:      { id: 'egfr', name: 'eGFR',      short: 'eGFR', value: 96, unit: 'mL/min', low: 90, high: 120, history: [94, 95, 97, 96, 95, 96] },

  // THYROID
  tsh: { id: 'tsh', name: 'TSH', short: 'TSH', value: 2.1, unit: 'mIU/L', low: 0.27, high: 4.20, history: [1.9, 2.0, 2.1, 2.0, 2.2, 2.1] },
  t4:  { id: 't4',  name: 'Fritt T4', short: 'fT4', value: 15.2, unit: 'pmol/L', low: 12.0, high: 22.0, history: [14.8, 15.0, 15.1, 15.2, 15.0, 15.2] },
  t3:  { id: 't3',  name: 'Fritt T3', short: 'fT3', value: 4.6, unit: 'pmol/L', low: 3.1, high: 6.8, history: [4.5, 4.5, 4.6, 4.7, 4.6, 4.6] },

  // IRON
  ferritin:    { id: 'fer', name: 'Ferritin',    short: 'FER', value: 24, unit: 'µg/L', low: 30, high: 200, history: [42, 38, 34, 30, 27, 24], note: 'Lavt — vurder jerntilskudd.' },
  jern:        { id: 'jern',name: 'Jern',        short: 'Fe',  value: 11.2, unit: 'µmol/L', low: 9, high: 30, history: [14, 13, 12, 12, 11.5, 11.2] },
  transferrin: { id: 'trf', name: 'Transferrin', short: 'TRF', value: 2.8, unit: 'g/L', low: 2.0, high: 3.6, history: [2.6, 2.7, 2.7, 2.8, 2.8, 2.8] },

  // VITAMINS
  dvitamin: { id: 'd',  name: 'Vitamin D (25-OH)', short: 'D',   value: 48, unit: 'nmol/L', low: 50, high: 150, history: [62, 58, 54, 52, 50, 48], note: 'Litt lav etter vinteren.' },
  b12:      { id: 'b12',name: 'Vitamin B12',      short: 'B12', value: 412, unit: 'pmol/L', low: 200, high: 700, history: [380, 395, 402, 410, 408, 412] },
  folat:    { id: 'fol',name: 'Folat',            short: 'FOL', value: 18, unit: 'nmol/L', low: 7, high: 40, history: [15, 16, 17, 18, 18, 18] },

  // INFLAMMATION
  crp: { id: 'crp', name: 'CRP', short: 'CRP', value: 8.2, unit: 'mg/L', low: 0, high: 5.0, history: [1.8, 2.1, 3.4, 5.6, 7.1, 8.2], note: 'Lett forhøyet — forbigående betennelse?' },
  sr:  { id: 'sr',  name: 'Senkning (SR)', short: 'SR', value: 11, unit: 'mm/t', low: 0, high: 20, history: [8, 9, 9, 10, 11, 11] }
}

export const insights = [
  {
    level: 'attention',
    icon: 'flame',
    title: 'CRP er lett forhøyet',
    body: 'Verdien har steget jevnt over seks målinger. Vanligvis tegn på mild, forbigående betennelse — kan skyldes nylig infeksjon eller stress. Ta ny prøve om 2–3 uker.'
  },
  {
    level: 'attention',
    icon: 'leaf',
    title: 'Ferritin og hemoglobin synker',
    body: 'Jernlagrene er lavere enn forrige år. Kombiner jernrik kost (rødt kjøtt, linser, mørke grønnsaker) med C-vitamin for bedre opptak. Vurder tilskudd i samråd med fastlege.'
  },
  {
    level: 'borderline',
    icon: 'sun',
    title: 'Vitamin D under optimalt nivå',
    body: 'Typisk for nordmenn etter vinteren. 20 µg daglig tran eller tilskudd, samt 15 minutter dagslys på ansiktet, gir vanligvis rask normalisering.'
  },
  {
    level: 'borderline',
    icon: 'heart',
    title: 'LDL nærmer seg øvre grense',
    body: 'Fortsatt innenfor handlingsrommet for kost. Bytt mettet fett mot umettet (olivenolje, fet fisk, nøtter). Ta opp igjen ved neste kontroll.'
  },
  {
    level: 'optimal',
    icon: 'spark',
    title: 'Nyrefunksjon, lever og skjoldbruskkjertel er stabile',
    body: 'Alle markører innenfor referanseområdet og uten signifikant endring siden forrige prøve.'
  }
]
