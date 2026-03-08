// Initial clients state data
export const initialClientsData = [
  {
    id: 1,
    name: 'Andrew Carter',
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
    email: 'andrew.carter@gmail.com',
    phone: '021 887 654'
  },
  {
    id: 2,
    name: 'Aitken Family Trust',
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
    email: 'admin@aitkentrust.co.nz',
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
    email: 'info@agenticintelligence.co.nz',
    phone: '09 300 1234'
  },
  {
    id: 4,
    name: 'Andrew Beckett',
    type: 'person' as const,
    status: 'INACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: true, stage: 'Underwriting', progress: 55 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'andrew.beckett@xtra.co.nz',
    phone: '021 887 854'
  },
  {
    id: 5,
    name: 'Angela Whitfield',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Review', progress: 70 },
      I: { active: true, stage: 'Application', progress: 45 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'angela.whitfield@gmail.com',
    phone: '021 987 854'
  },
  {
    id: 6,
    name: 'Anthony Henderson',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Settlement', progress: 90 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Active', progress: 100 },
      V: { active: true, stage: 'Discovery', progress: 25 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'a.henderson@outlook.co.nz',
    phone: '021 345 6789'
  },
  {
    id: 7,
    name: 'Brad Fraser',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Prospect', progress: 15 },
      K: { active: true, stage: 'Prospect', progress: 10 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'brad.fraser@outlook.com',
    phone: '027 444 5555'
  },
  {
    id: 8,
    name: 'Charlotte Evans',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Review', progress: 80 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'charlotte.evans@xtra.co.nz',
    phone: '022 876 5432'
  },
  {
    id: 9,
    name: 'David Morrison',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    adviceProgress: {
      M: { active: true, stage: 'Application', progress: 60 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Underwriting', progress: 50 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'david.morrison@email.co.nz',
    phone: '027 123 4567'
  },
  {
    id: 10,
    name: 'Elite Properties Ltd',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: true, stage: 'Planning', progress: 35 }
    },
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'info@eliteproperties.co.nz',
    phone: '09 555 7890'
  },
  {
    id: 11,
    name: 'Emma Thompson',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['K', 'I'],
    adviceProgress: {
      M: { active: false, stage: null, progress: 0 },
      K: { active: true, stage: 'Discovery', progress: 20 },
      I: { active: true, stage: 'Prospect', progress: 10 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
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
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: true, stage: 'Review', progress: 75 }
    },
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
    adviceProgress: {
      M: { active: true, stage: 'Settlement', progress: 92 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: true, stage: 'Active', progress: 100 },
      V: { active: true, stage: 'Application', progress: 55 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'g.patterson@outlook.co.nz',
    phone: '022 345 6789'
  },
  {
    id: 14,
    name: 'Hannah Williams',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Active', progress: 100 },
      V: { active: true, stage: 'Review', progress: 85 },
      R: { active: true, stage: 'Planning', progress: 30 }
    },
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'hannah.will@hotmail.co.nz',
    phone: '021 987 6543'
  },
  {
    id: 15,
    name: 'Harrison Family Trust',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: true, stage: 'Active', progress: 100 }
    },
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'harrison.trust@gmail.com',
    phone: '027 654 3210'
  },
  {
    id: 16,
    name: 'Isabella Chen',
    type: 'person' as const,
    status: 'PROSPECT' as const,
    advice: ['K', 'I', 'V'],
    adviceProgress: {
      M: { active: false, stage: null, progress: 0 },
      K: { active: true, stage: 'Prospect', progress: 15 },
      I: { active: true, stage: 'Discovery', progress: 20 },
      V: { active: true, stage: 'Prospect', progress: 10 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'isabella.chen@xtra.co.nz',
    phone: '021 111 2222'
  },
  {
    id: 17,
    name: 'James Robertson',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'K', 'I'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Review', progress: 70 },
      I: { active: true, stage: 'Application', progress: 40 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
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
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'admin@kiwiholdings.co.nz',
    phone: '09 444 5555'
  },
  {
    id: 19,
    name: 'Laura Mitchell',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'I', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Application', progress: 65 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: true, stage: 'Underwriting', progress: 50 },
      V: { active: true, stage: 'Active', progress: 100 },
      R: { active: true, stage: 'Discovery', progress: 25 }
    },
    managers: [
      { name: 'Steven Johnston', initials: 'SJ' },
      { name: 'Michael Chen', initials: 'MC' },
      { name: 'Sarah Williams', initials: 'SW' }
    ],
    email: 'laura.mitchell@yahoo.co.nz',
    phone: '027 777 6666'
  },
  {
    id: 20,
    name: 'Mark Stevenson',
    type: 'person' as const,
    status: 'INACTIVE' as const,
    advice: ['K', 'I'],
    adviceProgress: {
      M: { active: false, stage: null, progress: 0 },
      K: { active: true, stage: 'Prospect', progress: 5 },
      I: { active: true, stage: 'Prospect', progress: 5 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'mark.stevenson@gmail.com',
    phone: '021 222 3333'
  },
  {
    id: 21,
    name: 'Northland Enterprises',
    type: 'building' as const,
    status: 'ACTIVE' as const,
    advice: ['M', 'V', 'R'],
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Review', progress: 80 },
      R: { active: true, stage: 'Active', progress: 100 }
    },
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
    adviceProgress: {
      M: { active: true, stage: 'Active', progress: 100 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Review', progress: 75 },
      V: { active: true, stage: 'Application', progress: 60 },
      R: { active: false, stage: null, progress: 0 }
    },
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
    adviceProgress: {
      M: { active: true, stage: 'Settlement', progress: 95 },
      K: { active: false, stage: null, progress: 0 },
      I: { active: true, stage: 'Active', progress: 100 },
      V: { active: false, stage: null, progress: 0 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [{ name: "Brett O'Donnell", initials: 'BO' }],
    email: 'patrick.obrien@email.co.nz',
    phone: '021 888 9999'
  },
  {
    id: 24,
    name: 'Quinn Enterprises Ltd',
    type: 'building' as const,
    status: 'PROSPECT' as const,
    advice: ['M', 'K', 'V'],
    adviceProgress: {
      M: { active: true, stage: 'Prospect', progress: 10 },
      K: { active: true, stage: 'Discovery', progress: 20 },
      I: { active: false, stage: null, progress: 0 },
      V: { active: true, stage: 'Prospect', progress: 10 },
      R: { active: false, stage: null, progress: 0 }
    },
    managers: [],
    email: 'contact@quinn-ent.nz',
    phone: '09 666 7777'
  },
  {
    id: 25,
    name: 'Rebecca Taylor',
    type: 'person' as const,
    status: 'ACTIVE' as const,
    advice: ['K', 'I', 'V', 'R'],
    adviceProgress: {
      M: { active: false, stage: null, progress: 0 },
      K: { active: true, stage: 'Active', progress: 100 },
      I: { active: true, stage: 'Active', progress: 100 },
      V: { active: true, stage: 'Review', progress: 85 },
      R: { active: true, stage: 'Planning', progress: 40 }
    },
    managers: [{ name: 'Steven Johnston', initials: 'SJ' }],
    email: 'rebecca.taylor@xtra.co.nz',
    phone: '027 321 6549'
  }
];
