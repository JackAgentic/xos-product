// Comprehensive seed data for XOS Product demo
// All data is fictional and for demonstration purposes only

// ─── Overview Activities ─────────────────────────────────────────────────────
export const overviewActivities = [
  { id: 1, type: 'meeting', title: 'Meeting', subtitle: 'Annual Review — KiwiSaver & Insurance', date: 'Mar 4', time: '10:00 AM', status: 'completed' },
  { id: 2, type: 'email', title: 'Email Sent', subtitle: 'Statement of Advice — Mortgage Refinance', date: 'Mar 3', time: '3:45 PM', status: 'completed' },
  { id: 3, type: 'document', title: 'Document Upload', subtitle: 'Signed Disclosure Statement.pdf', date: 'Mar 2', time: '11:20 AM', status: 'completed' },
  { id: 4, type: 'meeting', title: 'Meeting', subtitle: 'Discovery Call — Retirement Planning', date: 'Mar 7', time: '2:00 PM', status: 'upcoming' },
  { id: 5, type: 'email', title: 'Email Received', subtitle: 'RE: Investment Portfolio Options', date: 'Mar 1', time: '9:30 AM', status: 'completed' },
  { id: 6, type: 'document', title: 'Document Upload', subtitle: 'Proof of Identity — Passport.pdf', date: 'Feb 28', time: '4:15 PM', status: 'completed' },
  { id: 7, type: 'meeting', title: 'Meeting', subtitle: 'Follow-up — Insurance Underwriting', date: 'Mar 10', time: '11:00 AM', status: 'upcoming' },
  { id: 8, type: 'email', title: 'Email Sent', subtitle: 'KiwiSaver Fund Switch Confirmation', date: 'Feb 26', time: '1:00 PM', status: 'completed' },
];

// ─── Overview Opportunities ──────────────────────────────────────────────────
export const overviewOpportunities = [
  { id: 1, name: 'Mortgage Refinance', value: '$485,000', stage: 'Application', probability: 80 },
  { id: 2, name: 'Life & Trauma Insurance', value: '$62,000', stage: 'Proposal', probability: 65 },
  { id: 3, name: 'KiwiSaver Optimisation', value: '$128,000', stage: 'Active', probability: 95 },
  { id: 4, name: 'Investment Portfolio Setup', value: '$250,000', stage: 'Discovery', probability: 40 },
];

// ─── Dashboard Revenue Data (24 months: Apr 2024 – Mar 2026) ────────────────
// Trailing 24 months of commission + fee revenue for a mid-size NZ advisory practice
export const revenueData = [
  // FY2024-25
  { month: 'Apr 24', revenue: 34800, target: 38000, lastYear: 31200 },
  { month: 'May 24', revenue: 39200, target: 38000, lastYear: 34500 },
  { month: 'Jun 24', revenue: 43500, target: 40000, lastYear: 38900 },
  { month: 'Jul 24', revenue: 40100, target: 40000, lastYear: 36200 },
  { month: 'Aug 24', revenue: 41800, target: 40000, lastYear: 37400 },
  { month: 'Sep 24', revenue: 44200, target: 43000, lastYear: 39100 },
  { month: 'Oct 24', revenue: 42900, target: 43000, lastYear: 38600 },
  { month: 'Nov 24', revenue: 48300, target: 45000, lastYear: 43100 },
  { month: 'Dec 24', revenue: 38600, target: 45000, lastYear: 35200 },
  { month: 'Jan 25', revenue: 46100, target: 47000, lastYear: 41800 },
  { month: 'Feb 25', revenue: 49800, target: 47000, lastYear: 44300 },
  { month: 'Mar 25', revenue: 52400, target: 50000, lastYear: 47600 },
  // FY2025-26
  { month: 'Apr 25', revenue: 38420, target: 42000, lastYear: 34800 },
  { month: 'May 25', revenue: 44610, target: 42000, lastYear: 39200 },
  { month: 'Jun 25', revenue: 51380, target: 45000, lastYear: 43500 },
  { month: 'Jul 25', revenue: 42150, target: 45000, lastYear: 40100 },
  { month: 'Aug 25', revenue: 48730, target: 45000, lastYear: 41800 },
  { month: 'Sep 25', revenue: 53940, target: 48000, lastYear: 44200 },
  { month: 'Oct 25', revenue: 46280, target: 48000, lastYear: 42900 },
  { month: 'Nov 25', revenue: 57610, target: 50000, lastYear: 48300 },
  { month: 'Dec 25', revenue: 41820, target: 50000, lastYear: 38600 },
  { month: 'Jan 26', revenue: 54370, target: 52000, lastYear: 46100 },
  { month: 'Feb 26', revenue: 63140, target: 52000, lastYear: 49800 },
  { month: 'Mar 26', revenue: 59480, target: 55000, lastYear: 52400 },
];

// ─── Dashboard Pipeline Data ─────────────────────────────────────────────────
// Derived from 125 opportunities across 25 clients (5 product types each)
export const pipelineData = [
  { name: 'Lead', value: 31, amount: 1842000, color: '#94a3b8' },
  { name: 'Qualified', value: 24, amount: 2156000, color: '#0B3D2E' },
  { name: 'Proposal', value: 18, amount: 1735000, color: '#081C15' },
  { name: 'Negotiation', value: 12, amount: 984000, color: '#16a34a' },
  { name: 'Closed Won', value: 40, amount: 3480000, color: '#0ea5e9' },
];

// ─── Dashboard Activity Trend (4-week view) ─────────────────────────────────
export const activityTrendData = [
  { day: 'W/C 10 Feb', meetings: 18, calls: 42, emails: 96 },
  { day: 'W/C 17 Feb', meetings: 22, calls: 51, emails: 108 },
  { day: 'W/C 24 Feb', meetings: 16, calls: 38, emails: 87 },
  { day: 'W/C 3 Mar', meetings: 24, calls: 55, emails: 114 },
];

// ─── Dashboard Recent Activities ─────────────────────────────────────────────
export const dashboardRecentActivities = [
  { id: 1, type: 'meeting', client: 'Aitken Family Trust', action: 'Completed annual KiwiSaver and insurance review', time: '32 min ago', iconType: 'video' as const, color: 'text-blue-600 bg-blue-50' },
  { id: 2, type: 'task', client: 'Andrew Carter', action: 'Mortgage application submitted to ANZ — $485k refinance', time: '1 hour ago', iconType: 'mail' as const, color: 'text-green-600 bg-green-50' },
  { id: 3, type: 'opportunity', client: 'Agentic Intelligence Ltd', action: 'Key person insurance proposal ($1.2M cover) sent for board review', time: '2 hours ago', iconType: 'file' as const, color: 'text-purple-600 bg-purple-50' },
  { id: 4, type: 'call', client: 'George Patterson', action: 'Phone consultation — NZ Super drawdown strategy at age 65', time: '3 hours ago', iconType: 'phone' as const, color: 'text-orange-600 bg-orange-50' },
  { id: 5, type: 'meeting', client: 'Haines & Co Accountants', action: 'Quarterly portfolio review — Milford Growth Fund up 14.2% YTD', time: '5 hours ago', iconType: 'calendar' as const, color: 'text-[#0B3D2E] bg-[#F2E9E4]/20' },
  { id: 6, type: 'task', client: 'Olivia Walker', action: 'AML/CDD verification completed — passport and proof of address verified', time: '6 hours ago', iconType: 'file' as const, color: 'text-purple-600 bg-purple-50' },
  { id: 7, type: 'call', client: 'James Robertson', action: 'Follow-up call — confirmed switch from Conservative to Balanced KiwiSaver', time: '1 day ago', iconType: 'phone' as const, color: 'text-orange-600 bg-orange-50' },
  { id: 8, type: 'meeting', client: 'Fraser Investments', action: 'Discovery call — $2.4M managed fund rebalance discussed', time: '1 day ago', iconType: 'video' as const, color: 'text-blue-600 bg-blue-50' },
  { id: 9, type: 'task', client: 'Rachel Green', action: 'Income protection claim lodged with Partners Life — 13-week stand-down', time: '1 day ago', iconType: 'file' as const, color: 'text-purple-600 bg-purple-50' },
  { id: 10, type: 'opportunity', client: 'David Morrison', action: 'Investment property finance — conditional approval from Westpac ($720k)', time: '2 days ago', iconType: 'mail' as const, color: 'text-green-600 bg-green-50' },
  { id: 11, type: 'call', client: 'Laura Mitchell', action: 'Discussed trauma cover options — AIA vs Asteron Life comparison', time: '2 days ago', iconType: 'phone' as const, color: 'text-orange-600 bg-orange-50' },
  { id: 12, type: 'meeting', client: 'Thompson & Associates', action: 'Estate planning workshop — 4 attendees, trust restructure recommended', time: '3 days ago', iconType: 'video' as const, color: 'text-blue-600 bg-blue-50' },
];

// ─── Dashboard Upcoming Meetings ─────────────────────────────────────────────
export const dashboardUpcomingMeetings = [
  { id: 1, client: 'Andrew Carter', type: 'Mortgage Pre-Approval Review', time: 'Today, 2:00 PM', duration: '45 min', advisor: "Brett O'Donnell" },
  { id: 2, client: 'Aitken Family Trust', type: 'Annual Insurance Review', time: 'Today, 4:00 PM', duration: '60 min', advisor: 'Steven Johnston' },
  { id: 3, client: 'Laura Mitchell', type: 'Life & Trauma Proposal', time: 'Tomorrow, 9:30 AM', duration: '90 min', advisor: 'Sarah Williams' },
  { id: 4, client: 'George Patterson', type: 'Retirement Income Strategy', time: 'Tomorrow, 2:00 PM', duration: '60 min', advisor: "Brett O'Donnell" },
  { id: 5, client: 'Olivia Walker', type: 'KiwiSaver Quarterly Review', time: 'Thu, 10:00 AM', duration: '45 min', advisor: 'Michael Chen' },
  { id: 6, client: 'Fraser Investments', type: 'Portfolio Rebalance', time: 'Thu, 2:30 PM', duration: '60 min', advisor: 'David Lee' },
  { id: 7, client: 'Haines & Co Accountants', type: 'Group Scheme Review', time: 'Fri, 11:00 AM', duration: '90 min', advisor: 'Steven Johnston' },
  { id: 8, client: 'James Robertson', type: 'Investment Strategy Follow-up', time: 'Mon, 9:00 AM', duration: '45 min', advisor: 'Sarah Williams' },
];

// ─── Top Clients Performance Data ────────────────────────────────────────────
// Deterministic revenue and deal counts tied to actual client IDs
export const topClientsData: Record<number, { revenue: number; deals: number }> = {
  2: { revenue: 186400, deals: 8 },    // Aitken Family Trust
  5: { revenue: 142800, deals: 6 },    // Angela Whitfield
  3: { revenue: 128500, deals: 5 },    // Agentic Intelligence Ltd
  7: { revenue: 97200, deals: 4 },     // Brad Fraser
  1: { revenue: 84600, deals: 7 },     // Andrew Carter
  13: { revenue: 76300, deals: 3 },    // George Patterson
  22: { revenue: 68900, deals: 4 },    // Olivia Walker
  8: { revenue: 62100, deals: 3 },     // Charlotte Evans
  19: { revenue: 58400, deals: 5 },    // Laura Mitchell
  9: { revenue: 51200, deals: 2 },     // David Morrison
};

// ─── Dashboard KPI Metrics (derived from operational data) ──────────────────
// These simulate backend-computed aggregate metrics for the dashboard cards
export const dashboardKPIs = {
  // Revenue & Goal Tracking
  revenue: {
    totalRevenue: 601930,       // sum of revenueData[].revenue
    totalTarget: 574000,        // sum of revenueData[].target
    attainment: 104.9,          // (totalRevenue / totalTarget) * 100
    mtdRevenue: 59480,          // Mar (current month)
    mtdTarget: 55000,           // Mar target
    growthVsPrior: 14.2,        // % increase vs same period last year
    byProduct: {
      Mortgage: 218400,
      Insurance: 124600,
      KiwiSaver: 98200,
      Investment: 108730,
      Retirement: 52000,
    },
  },
  // Pipeline Health
  pipeline: {
    totalPipelineValue: 10197000,  // sum of all pipeline amounts
    coverageRatio: 2.94,           // pipeline value / annual target
    conversionRate: 32.0,          // (Closed Won / total opportunities) * 100
    avgSalesCycle: 47,             // days from Lead to Closed Won
    openOpportunities: 85,        // Lead + Qualified + Proposal + Negotiation
    weightedPipeline: 5840000,    // probability-weighted pipeline value
  },
  // Performance Metrics
  performance: {
    winRate: 76.9,               // Closed Won / (Closed Won + Closed Lost)
    lossRate: 23.1,
    avgDealSize: 87000,          // avg value of Closed Won deals
    quotaAttainment: 104.9,      // same as revenue attainment
    closedWon: 40,
    closedLost: 12,
    avgDaysToClose: 34,
    advisorPerformance: [
      { name: "Brett O'Donnell", revenue: 168200, deals: 14, quota: 110 },
      { name: 'Steven Johnston', revenue: 142800, deals: 11, quota: 98 },
      { name: 'Sarah Williams', revenue: 128400, deals: 9, quota: 95 },
      { name: 'Michael Chen', revenue: 96300, deals: 8, quota: 87 },
      { name: 'David Lee', revenue: 66230, deals: 6, quota: 72 },
    ],
  },
  // Activity Metrics (current week: W/C 3 Mar)
  activity: {
    meetingsThisWeek: 24,
    callsThisWeek: 55,
    emailsThisWeek: 114,
    totalThisWeek: 193,
    meetingsLastWeek: 16,
    callsLastWeek: 38,
    emailsLastWeek: 87,
    totalLastWeek: 141,
    weekOverWeekChange: 36.9,   // % increase
    avgMeetingsPerDay: 4.8,
    avgCallsPerDay: 11.0,
  },
  // Customer Insights
  customers: {
    totalClients: 25,
    activeClients: 18,
    prospectClients: 5,
    inactiveClients: 2,
    cac: 1240,                    // customer acquisition cost ($)
    avgLtv: 48600,                // average lifetime value ($)
    ltvCacRatio: 39.2,            // LTV / CAC
    churnRate: 3.2,               // annual % churn
    nps: 72,                      // net promoter score
    topClientsByRevenue: [2, 5, 3, 7, 1],  // client IDs in revenue order
  },
};

// ─── Meetings ────────────────────────────────────────────────────────────────
export const meetingsData = [
  { id: 0, title: 'Annual KiwiSaver Review', date: 'Thu, Mar 6, 2026', time: '10:00 AM to 11:00 AM', attendees: 2 },
  { id: 1, title: 'Mortgage Pre-Approval Discussion', date: 'Thu, Mar 6, 2026', time: '2:00 PM to 2:45 PM', attendees: 1 },
  { id: 2, title: 'Insurance Proposal Presentation', date: 'Fri, Mar 7, 2026', time: '9:30 AM to 11:00 AM', attendees: 3 },
  { id: 3, title: 'Retirement Income Planning', date: 'Fri, Mar 7, 2026', time: '2:00 PM to 3:00 PM', attendees: 2 },
  { id: 4, title: 'Quarterly Portfolio Review', date: 'Mon, Mar 10, 2026', time: '10:00 AM to 10:45 AM', attendees: 1 },
  { id: 5, title: 'Estate Planning Consultation', date: 'Tue, Mar 11, 2026', time: '11:00 AM to 12:00 PM', attendees: 4 },
  { id: 6, title: 'Investment Strategy Workshop', date: 'Wed, Mar 12, 2026', time: '1:00 PM to 2:30 PM', attendees: 2 },
  { id: 7, title: 'Follow-up — Risk Assessment', date: 'Thu, Mar 13, 2026', time: '3:00 PM to 3:30 PM', attendees: 1 },
];

// ─── Communications ──────────────────────────────────────────────────────────
export const communicationsData = [
  {
    id: 0,
    from: 'Sarah Johnson',
    subject: 'RE: Quarterly Portfolio Review — Investment Performance Update',
    preview: 'Hi there, I\'ve completed the quarterly review of your investment portfolio. Returns are tracking well above benchmark at 8.2% YTD...',
    date: 'Mar 5, 2026',
    type: 'email',
    unread: true
  },
  {
    id: 1,
    from: 'Brett O\'Donnell',
    subject: 'RE: Mortgage Refinance — Rate Lock Confirmation',
    preview: 'Great news — ANZ has confirmed the rate lock at 5.89% fixed for 2 years. We need to submit the application by Friday to secure this...',
    date: 'Mar 4, 2026',
    type: 'email',
    unread: true
  },
  {
    id: 2,
    from: 'Steven Johnston',
    subject: 'Insurance Policy Renewal — Action Required',
    preview: 'Client called to discuss upcoming life insurance policy renewal. Current premium is $185/month. Reviewed alternative providers and...',
    date: 'Mar 3, 2026',
    type: 'note',
    unread: false
  },
  {
    id: 3,
    from: 'Sarah Johnson',
    subject: 'RE: KiwiSaver Fund Switch — Confirmation & Next Steps',
    preview: 'The fund switch from Conservative to Growth has been processed. New allocation: 80% Growth, 15% Balanced, 5% Cash. Expected to...',
    date: 'Mar 2, 2026',
    type: 'email',
    unread: false
  },
  {
    id: 4,
    from: 'Michael Chen',
    subject: 'AML/CDD Compliance — Documents Received',
    preview: 'All required identity documents have been verified. Passport, proof of address, and source of funds declaration all in order...',
    date: 'Mar 1, 2026',
    type: 'note',
    unread: false
  },
  {
    id: 5,
    from: 'Brett O\'Donnell',
    subject: 'RE: Retirement Projection — Updated Scenarios',
    preview: 'I\'ve run three retirement scenarios based on our discussion. Scenario A (retire at 60) shows a projected income of $62,000/year...',
    date: 'Feb 28, 2026',
    type: 'email',
    unread: false
  },
  {
    id: 6,
    from: 'Sarah Johnson',
    subject: 'Meeting Notes — Discovery Call Summary',
    preview: 'Summary of today\'s discovery call: Client interested in diversifying beyond property. Currently holds 3 rental properties valued at...',
    date: 'Feb 26, 2026',
    type: 'note',
    unread: false
  },
  {
    id: 7,
    from: 'Steven Johnston',
    subject: 'RE: Health Insurance Claim — Status Update',
    preview: 'Southern Cross has approved the claim for the dental procedure. Payment of $2,400 will be processed within 5 working days to the...',
    date: 'Feb 24, 2026',
    type: 'email',
    unread: false
  },
];

// ─── Contacts ────────────────────────────────────────────────────────────────
export const contactsData = [
  {
    id: 0,
    name: 'Andrew Carter',
    type: 'self',
    email: 'andrew.carter@gmail.com',
    phone: '021 887 654',
    firstName: 'Andrew',
    lastName: 'Carter',
    middleName: 'James',
    dateOfBirth: '15/03/1985',
    gender: 'Male',
    relationship: ''
  },
  {
    id: 1,
    name: 'Sarah Carter',
    type: 'primary_contact',
    email: 'sarah.carter@gmail.com',
    phone: '021 556 789',
    firstName: 'Sarah',
    lastName: 'Carter',
    middleName: 'Louise',
    dateOfBirth: '22/07/1987',
    gender: 'Female',
    relationship: 'Spouse'
  },
  {
    id: 2,
    name: 'Margaret Carter',
    type: 'other',
    email: 'margaret.carter@xtra.co.nz',
    phone: '09 445 2210',
    firstName: 'Margaret',
    lastName: 'Carter',
    middleName: '',
    dateOfBirth: '10/11/1958',
    gender: 'Female',
    relationship: 'Mother'
  },
  {
    id: 3,
    name: 'David Thompson',
    type: 'other',
    email: 'david.t@lawfirm.co.nz',
    phone: '09 302 4455',
    firstName: 'David',
    lastName: 'Thompson',
    middleName: '',
    dateOfBirth: '',
    gender: 'Male',
    relationship: 'Solicitor'
  },
  {
    id: 4,
    name: 'Karen Wells',
    type: 'other',
    email: 'karen.wells@accounting.co.nz',
    phone: '09 555 8877',
    firstName: 'Karen',
    lastName: 'Wells',
    middleName: '',
    dateOfBirth: '',
    gender: 'Female',
    relationship: 'Accountant'
  },
];

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentFolders = [
  {
    name: 'Identity',
    documents: [
      { name: 'Passport — Andrew Carter.pdf', size: '2.1 MB', date: 'Feb 28, 2026', status: 'verified' },
      { name: 'Drivers Licence — Andrew Carter.pdf', size: '1.4 MB', date: 'Feb 28, 2026', status: 'verified' },
      { name: 'Proof of Address — Utility Bill.pdf', size: '890 KB', date: 'Feb 28, 2026', status: 'verified' },
    ]
  },
  {
    name: 'Insurance',
    documents: [
      { name: 'Life Insurance Policy — AIA.pdf', size: '3.2 MB', date: 'Jan 15, 2026', status: 'active' },
      { name: 'Income Protection — Partners Life.pdf', size: '2.8 MB', date: 'Jan 15, 2026', status: 'active' },
      { name: 'Health Insurance — Southern Cross.pdf', size: '1.9 MB', date: 'Dec 10, 2025', status: 'active' },
      { name: 'Trauma Cover — Quotation.pdf', size: '1.1 MB', date: 'Mar 2, 2026', status: 'pending' },
    ]
  },
  {
    name: 'Investments',
    documents: [
      { name: 'Investment Portfolio Statement — Q4 2025.pdf', size: '4.5 MB', date: 'Jan 20, 2026', status: 'current' },
      { name: 'Managed Fund Application — Milford.pdf', size: '2.3 MB', date: 'Feb 10, 2026', status: 'submitted' },
      { name: 'Risk Profile Questionnaire.pdf', size: '560 KB', date: 'Feb 5, 2026', status: 'completed' },
    ]
  },
  {
    name: 'KiwiSaver',
    documents: [
      { name: 'KiwiSaver Statement — Fisher Funds.pdf', size: '1.8 MB', date: 'Feb 1, 2026', status: 'current' },
      { name: 'Fund Switch Confirmation.pdf', size: '420 KB', date: 'Mar 2, 2026', status: 'completed' },
      { name: 'First Home Withdrawal Application.pdf', size: '1.5 MB', date: 'Feb 15, 2026', status: 'in-progress' },
    ]
  },
  {
    name: 'Mortgage',
    documents: [
      { name: 'Mortgage Pre-Approval — ANZ.pdf', size: '3.6 MB', date: 'Feb 20, 2026', status: 'active' },
      { name: 'Property Valuation Report.pdf', size: '5.2 MB', date: 'Feb 18, 2026', status: 'completed' },
      { name: 'Sale & Purchase Agreement.pdf', size: '4.1 MB', date: 'Feb 25, 2026', status: 'pending' },
      { name: 'Loan Application — Signed.pdf', size: '2.9 MB', date: 'Mar 1, 2026', status: 'submitted' },
    ]
  },
  {
    name: 'Property',
    documents: [
      { name: 'Certificate of Title — 42 Karaka Rd.pdf', size: '1.2 MB', date: 'Jan 5, 2026', status: 'current' },
      { name: 'Rates Notice — Auckland Council.pdf', size: '680 KB', date: 'Feb 1, 2026', status: 'current' },
    ]
  },
  {
    name: 'Compliance',
    documents: [
      { name: 'Disclosure Statement — Signed.pdf', size: '1.1 MB', date: 'Mar 2, 2026', status: 'completed' },
      { name: 'Client Agreement — Signed.pdf', size: '980 KB', date: 'Mar 2, 2026', status: 'completed' },
      { name: 'Privacy Consent Form.pdf', size: '450 KB', date: 'Mar 2, 2026', status: 'completed' },
      { name: 'AML Source of Funds Declaration.pdf', size: '520 KB', date: 'Mar 1, 2026', status: 'verified' },
    ]
  },
];

// ─── Financial Snapshots ─────────────────────────────────────────────────────
export const financialSnapshots = [
  {
    id: '1',
    name: 'Annual Review 2026',
    date: '2026-03-01',
    status: 'completed' as const,
    progress: 100,
    netWorth: 850000,
    totalAssets: 1200000,
    totalLiabilities: 350000
  },
  {
    id: '2',
    name: 'Q1 2026 Update',
    date: '2026-02-15',
    status: 'in-progress' as const,
    progress: 60,
    netWorth: 825000,
    totalAssets: 1180000,
    totalLiabilities: 355000
  },
  {
    id: '3',
    name: 'Year-End Review 2025',
    date: '2025-12-15',
    status: 'completed' as const,
    progress: 100,
    netWorth: 790000,
    totalAssets: 1120000,
    totalLiabilities: 330000
  },
  {
    id: '4',
    name: 'Mid-Year Review 2025',
    date: '2025-06-20',
    status: 'completed' as const,
    progress: 100,
    netWorth: 745000,
    totalAssets: 1080000,
    totalLiabilities: 335000
  },
];

// ─── Financial Assets ────────────────────────────────────────────────────────
export const seedAssets = [
  { id: '1', type: 'property', description: '42 Karaka Road, Greenlane, Auckland', value: '$920,000', ownership: 'Joint' },
  { id: '2', type: 'investment', description: 'Milford Active Growth Fund', value: '$85,000', ownership: 'Individual' },
  { id: '3', type: 'savings', description: 'ANZ Serious Saver', value: '$42,000', ownership: 'Joint' },
  { id: '4', type: 'savings', description: 'Fisher Funds KiwiSaver — Growth', value: '$128,000', ownership: 'Individual' },
  { id: '5', type: 'vehicle', description: '2022 Toyota RAV4 Hybrid', value: '$38,000', ownership: 'Individual' },
  { id: '6', type: 'vehicle', description: '2020 Mazda CX-5', value: '$28,000', ownership: 'Joint' },
  { id: '7', type: 'investment', description: 'Sharesies Portfolio — NZX/ASX', value: '$22,000', ownership: 'Individual' },
  { id: '8', type: 'savings', description: 'Term Deposit — 6 month @ 5.25%', value: '$50,000', ownership: 'Joint' },
];

// ─── Financial Liabilities ───────────────────────────────────────────────────
export const seedLiabilities = [
  { id: '1', type: 'mortgage', description: 'ANZ Home Loan — 42 Karaka Rd', balance: '$485,000', interestRate: '5.89%', payment: '$3,120/month' },
  { id: '2', type: 'loan', description: 'Vehicle Finance — Toyota RAV4', balance: '$18,500', interestRate: '8.95%', payment: '$420/month' },
  { id: '3', type: 'credit-card', description: 'Westpac Airpoints Platinum', balance: '$4,200', interestRate: '20.95%', payment: '$250/month' },
  { id: '4', type: 'loan', description: 'Personal Loan — ANZ', balance: '$12,000', interestRate: '12.90%', payment: '$380/month' },
];

// ─── Financial Income ────────────────────────────────────────────────────────
export const seedIncome = [
  { id: '1', source: 'Salary — Andrew (Engineering Manager, Fisher & Paykel)', amount: '$145,000', frequency: 'Annual' },
  { id: '2', source: 'Salary — Sarah (Marketing Lead, Xero)', amount: '$115,000', frequency: 'Annual' },
  { id: '3', source: 'KiwiSaver Employer Contribution (3%)', amount: '$7,800', frequency: 'Annual' },
  { id: '4', source: 'Investment Returns — Milford Growth', amount: '$6,200', frequency: 'Annual' },
  { id: '5', source: 'Sharesies Dividends', amount: '$840', frequency: 'Annual' },
];

// ─── Financial Expenses ──────────────────────────────────────────────────────
export const seedExpenses = [
  { id: '1', category: 'Mortgage Repayments', amount: '$3,120', frequency: 'Monthly' },
  { id: '2', category: 'Insurance Premiums (Life + Health + Income)', amount: '$620', frequency: 'Monthly' },
  { id: '3', category: 'Vehicle Costs (Finance + Insurance + Fuel)', amount: '$780', frequency: 'Monthly' },
  { id: '4', category: 'Groceries & Household', amount: '$1,200', frequency: 'Monthly' },
  { id: '5', category: 'Utilities (Power, Internet, Water)', amount: '$380', frequency: 'Monthly' },
  { id: '6', category: 'Childcare / Education', amount: '$1,800', frequency: 'Monthly' },
  { id: '7', category: 'Rates & Body Corporate', amount: '$420', frequency: 'Monthly' },
  { id: '8', category: 'Discretionary (Entertainment, Dining)', amount: '$600', frequency: 'Monthly' },
];

// ─── Financial Goals ─────────────────────────────────────────────────────────
export const seedGoals = [
  { id: '1', name: 'Pay off mortgage by 55', targetAmount: '$485,000', targetDate: '2041-03-15', priority: 'High' },
  { id: '2', name: 'Retirement fund — $1.5M', targetAmount: '$1,500,000', targetDate: '2051-03-15', priority: 'High' },
  { id: '3', name: 'Children education fund', targetAmount: '$120,000', targetDate: '2038-02-01', priority: 'Medium' },
  { id: '4', name: 'Holiday home — Taupo region', targetAmount: '$650,000', targetDate: '2032-12-01', priority: 'Low' },
  { id: '5', name: 'Emergency fund — 6 months expenses', targetAmount: '$54,000', targetDate: '2027-06-01', priority: 'High' },
];

// ─── Opportunity Activities Timeline ─────────────────────────────────────────
export const opportunityActivities = [
  { id: 1, type: 'document', date: '15 Feb', label: 'Feb 15', title: 'Application Form Submitted', description: 'Signed mortgage application sent to ANZ', assigned: true },
  { id: 2, type: 'note', date: '18 Feb', label: 'Feb 18', title: 'Client Call — Rate Discussion', description: 'Discussed fixed vs floating rate options. Client prefers 2-year fixed.', assigned: true },
  { id: 3, type: 'meeting', date: '20 Feb', label: 'Feb 20', title: 'Discovery Meeting', description: 'Comprehensive financial review with both partners', location: 'Office — Meeting Room 2', time: '20 Feb 2026 10:00 AM', assigned: true },
  { id: 4, type: 'document', date: '22 Feb', label: 'Feb 22', title: 'Property Valuation Report', description: 'Registered valuation received — $920,000', assigned: true },
  { id: 5, type: 'note', date: '25 Feb', label: 'Feb 25', title: 'Follow-up Required', description: 'Need updated payslips from Sarah — last 3 months', assigned: true },
  { id: 6, type: 'email', date: '26 Feb', label: 'Feb 26', title: 'SOA Draft Sent', description: 'Statement of Advice emailed for client review', assigned: true },
  { id: 7, type: 'document', date: '28 Feb', label: 'Feb 28', title: 'Income Verification', description: 'IRD income summary and employment letters uploaded', assigned: false },
  { id: 8, type: 'meeting', date: '3 Mar', label: 'Mar 3', title: 'Proposal Review Meeting', description: 'Reviewed SOA, insurance recommendations, and KiwiSaver options', location: 'Video Call — Zoom', time: '3 Mar 2026 2:00 PM', assigned: false },
  { id: 9, type: 'document', date: '4 Mar', label: 'Mar 4', title: 'Signed Disclosure Statement', description: 'Client signed and returned disclosure statement', assigned: false },
  { id: 10, type: 'note', date: '5 Mar', label: 'Mar 5', title: 'ANZ Conditional Approval', description: 'Conditional approval received — subject to insurance confirmation', assigned: false },
];
