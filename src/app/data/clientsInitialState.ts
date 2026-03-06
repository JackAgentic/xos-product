// Initial clients state data
export const initialClientsData = [
  {
    id: 1,
    name: 'A household Client',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['M', 'K', 'I', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Application', progress: 65 },
      K: { active: true, stage: 'Prospect', progress: 30 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Review', progress: 85 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [
      { name: "Brett O'Donnell", initials: 'BO' },
      { name: 'Steven Johnston', initials: 'SJ' },
      { name: 'Michael Chen', initials: 'MC' },
      { name: 'Sarah Williams', initials: 'SW' }
    ],
    email: 'test@test.com',
    phone: '0987654321'
  },
  {
    id: 2,
    name: 'AA Trusts',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Settlement', progress: 95 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Policy Review', progress: 40 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [
      { name: 'Steven Johnston', initials: 'SJ' },
      { name: 'Michael Chen', initials: 'MC' },
      { name: 'Sarah Williams', initials: 'SW' },
      { name: 'James Thompson', initials: 'JT' },
      { name: 'Emma Davis', initials: 'ED' }
    ],
    email: 'aaron.smith@aatrust...',
    phone: '021 555 1234'
  },
  {
    id: 3,
    name: 'Agentic Intelligence Ltd',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: false, stage: null, progress: 0 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Planning', progress: 20 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: '—',
    phone: '—'
  },
  {
    id: 4,
    name: 'Andrew Smith',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: true, stage: 'Underwriting', progress: 55 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'andy@adiso.co.nz',
    phone: '021887854'
  },
  {
    id: 5,
    name: 'Andrew Smithson',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'andrew@smithson.c...',
    phone: '021 987 854'
  },
  {
    id: 6,
    name: 'Andy H',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    managers: [],
    email: '—',
    phone: '—'
  },
  {
    id: 7,
    name: 'Brad Fraser',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['M', 'K', 'I', 'V'],
    managers: [],
    email: 'brad@test',
    phone: '444444444444'
  },
  {
    id: 8,
    name: 'Charlotte Evens',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    managers: [],
    email: '—',
    phone: '—'
  },
  {
    id: 9,
    name: 'David Morrison',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'david.morrison@emai...',
    phone: '027 123 4567'
  },
  {
    id: 10,
    name: 'Elite Properties Ltd',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'info@eliteproperties...',
    phone: '09 555 7890'
  },
  {
    id: 11,
    name: 'Emma Thompson',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['K', 'I'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'emma.t@gmail.com',
    phone: '021 456 7890'
  },
  {
    id: 12,
    name: 'Fraser Investments',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'V', 'R'],
    managers: [
      { name: "Brett O'Donnell", initials: 'BO' },
      { name: 'Steven Johnston', initials: 'SJ' },
      { name: 'Michael Chen', initials: 'MC' }
    ],
    email: 'contact@fraser-inv.nz',
    phone: '09 876 5432'
  },
  {
    id: 13,
    name: 'George Patterson',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'I', 'V'],
    managers: [],
    email: 'g.patterson@outlook...',
    phone: '022 345 6789'
  },
  {
    id: 14,
    name: 'Hannah Williams',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V', 'R'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'hannah.will@hotmail...',
    phone: '021 987 6543'
  },
  {
    id: 15,
    name: 'Harrison Family Trust',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'harrison.trust@gmail...',
    phone: '027 654 3210'
  },
  {
    id: 16,
    name: 'Isabella Chen',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['K', 'I', 'V'],
    managers: [],
    email: 'isabella.chen@xtra...',
    phone: '021 111 2222'
  },
  {
    id: 17,
    name: 'James Robertson',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'j.robertson@email.nz',
    phone: '022 999 8888'
  },
  {
    id: 18,
    name: 'Kiwi Holdings Ltd',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'V'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'admin@kiwiholdings...',
    phone: '09 444 5555'
  },
  {
    id: 19,
    name: 'Laura Mitchell',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'I', 'V', 'R'],
    managers: [
      { name: 'Steven Johnston', initials: 'SJ' },
      { name: 'Michael Chen', initials: 'MC' },
      { name: 'Sarah Williams', initials: 'SW' }
    ],
    email: 'laura.mitchell@yahoo...',
    phone: '027 777 6666'
  },
  {
    id: 20,
    name: 'Michael Brown',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['K', 'I'],
    managers: [],
    email: 'm.brown@test.co.nz',
    phone: '021 222 3333'
  },
  {
    id: 21,
    name: 'Northland Enterprises',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'info@northlandent.nz',
    phone: '09 333 4444'
  },
  {
    id: 22,
    name: 'Olivia Walker',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'olivia.w@gmail.com',
    phone: '022 555 4444'
  },
  {
    id: 23,
    name: "Patrick O'Brien",
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'I'],
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'patrick.obrien@emai...',
    phone: '021 888 9999'
  },
  {
    id: 24,
    name: 'Quinn Enterprises Ltd',
    type: 'building' as const,
    status: 'PROSPECT' as const,
    advice: ['M', 'K', 'V'],
    managers: [],
    email: 'contact@quinn-ent.nz',
    phone: '09 666 7777'
  },
  {
    id: 25,
    name: 'Rachel Green',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['K', 'I', 'V', 'R'],
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'rachel.green@xtra.nz',
    phone: '027 321 6549'
  }
];
