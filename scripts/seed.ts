import { sql } from '../lib/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...\n');

  // ─── 1. Users (Advisors) ──────────────────────────────────────────────────
  const defaultPasswordHash = await bcrypt.hash('password123', 12);

  const advisors = [
    { email: 'brett.odonnell@xos.co.nz', full_name: "Brett O'Donnell", initials: 'BO', role: 'admin' },
    { email: 'steven.johnston@xos.co.nz', full_name: 'Steven Johnston', initials: 'SJ', role: 'advisor' },
    { email: 'michael.chen@xos.co.nz', full_name: 'Michael Chen', initials: 'MC', role: 'advisor' },
    { email: 'sarah.williams@xos.co.nz', full_name: 'Sarah Williams', initials: 'SW', role: 'advisor' },
    { email: 'david.lee@xos.co.nz', full_name: 'David Lee', initials: 'DL', role: 'advisor' },
    { email: 'james.thompson@xos.co.nz', full_name: 'James Thompson', initials: 'JT', role: 'advisor' },
    { email: 'emma.davis@xos.co.nz', full_name: 'Emma Davis', initials: 'ED', role: 'advisor' },
    { email: 'jack@agenticintelligence.co.nz', full_name: 'Jack', initials: 'J', role: 'admin' },
  ];

  for (const a of advisors) {
    await sql`
      INSERT INTO users (email, password_hash, full_name, initials, role)
      VALUES (${a.email}, ${defaultPasswordHash}, ${a.full_name}, ${a.initials}, ${a.role})
      ON CONFLICT (email) DO NOTHING
    `;
  }
  console.log('  ✓ users (7 advisors)');

  // Build name->id lookup
  const userRows = await sql`SELECT id, full_name FROM users`;
  const userLookup: Record<string, number> = {};
  for (const u of userRows) {
    userLookup[u.full_name] = u.id;
  }

  // ─── 2. Clients ───────────────────────────────────────────────────────────
  const clients = [
    { id: 1, name: 'Andrew Carter', type: 'person', status: 'PROSPECT', advice: ['M','K','I','V','R'], adviceProgress: { M:{active:true,stage:'Application',progress:65}, K:{active:true,stage:'Prospect',progress:30}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Review',progress:85}, R:{active:false,stage:null,progress:0} }, managers: ["Brett O'Donnell","Steven Johnston","Michael Chen","Sarah Williams"], email: 'andrew.carter@gmail.com', phone: '021 887 654' },
    { id: 2, name: 'Aitken Family Trust', type: 'building', status: 'ACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Settlement',progress:95}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Policy Review',progress:40}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Steven Johnston","Michael Chen","Sarah Williams","James Thompson","Emma Davis"], email: 'admin@aitkentrust.co.nz', phone: '021 555 1234' },
    { id: 3, name: 'Agentic Intelligence Ltd', type: 'building', status: 'ACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:false,stage:null,progress:0}, K:{active:true,stage:'Active',progress:100}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Planning',progress:20}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'info@agenticintelligence.co.nz', phone: '09 300 1234' },
    { id: 4, name: 'Andrew Beckett', type: 'person', status: 'INACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:false,stage:null,progress:0}, I:{active:true,stage:'Underwriting',progress:55}, V:{active:true,stage:'Active',progress:100}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'andrew.beckett@xtra.co.nz', phone: '021 887 854' },
    { id: 5, name: 'Angela Whitfield', type: 'person', status: 'ACTIVE', advice: ['M','K','I'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Review',progress:70}, I:{active:true,stage:'Application',progress:45}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Brett O'Donnell"], email: 'angela.whitfield@gmail.com', phone: '021 987 854' },
    { id: 6, name: 'Anthony Henderson', type: 'person', status: 'ACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Settlement',progress:90}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Active',progress:100}, V:{active:true,stage:'Discovery',progress:25}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'a.henderson@outlook.co.nz', phone: '021 345 6789' },
    { id: 7, name: 'Brad Fraser', type: 'person', status: 'PROSPECT', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Prospect',progress:15}, K:{active:true,stage:'Prospect',progress:10}, I:{active:false,stage:null,progress:0}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'brad.fraser@outlook.com', phone: '027 444 5555' },
    { id: 8, name: 'Charlotte Evans', type: 'person', status: 'ACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Review',progress:80}, V:{active:true,stage:'Active',progress:100}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'charlotte.evans@xtra.co.nz', phone: '022 876 5432' },
    { id: 9, name: 'David Morrison', type: 'person', status: 'ACTIVE', advice: ['M','K','I'], adviceProgress: { M:{active:true,stage:'Application',progress:60}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Underwriting',progress:50}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Steven Johnston"], email: 'david.morrison@email.co.nz', phone: '027 123 4567' },
    { id: 10, name: 'Elite Properties Ltd', type: 'building', status: 'ACTIVE', advice: ['M','V','R'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:false,stage:null,progress:0}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Active',progress:100}, R:{active:true,stage:'Planning',progress:35} }, managers: ["Brett O'Donnell"], email: 'info@eliteproperties.co.nz', phone: '09 555 7890' },
    { id: 11, name: 'Emma Thompson', type: 'person', status: 'PROSPECT', advice: ['K','I'], adviceProgress: { M:{active:false,stage:null,progress:0}, K:{active:true,stage:'Discovery',progress:20}, I:{active:true,stage:'Prospect',progress:10}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Steven Johnston"], email: 'emma.t@gmail.com', phone: '021 456 7890' },
    { id: 12, name: 'Fraser Investments', type: 'building', status: 'ACTIVE', advice: ['M','K','V','R'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Active',progress:100}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Active',progress:100}, R:{active:true,stage:'Review',progress:75} }, managers: ["Brett O'Donnell","Steven Johnston","Michael Chen"], email: 'contact@fraser-inv.nz', phone: '09 876 5432' },
    { id: 13, name: 'George Patterson', type: 'person', status: 'ACTIVE', advice: ['M','I','V'], adviceProgress: { M:{active:true,stage:'Settlement',progress:92}, K:{active:false,stage:null,progress:0}, I:{active:true,stage:'Active',progress:100}, V:{active:true,stage:'Application',progress:55}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'g.patterson@outlook.co.nz', phone: '022 345 6789' },
    { id: 14, name: 'Hannah Williams', type: 'person', status: 'ACTIVE', advice: ['M','K','I','V','R'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Active',progress:100}, V:{active:true,stage:'Review',progress:85}, R:{active:true,stage:'Planning',progress:30} }, managers: ["Steven Johnston"], email: 'hannah.will@hotmail.co.nz', phone: '021 987 6543' },
    { id: 15, name: 'Harrison Family Trust', type: 'building', status: 'ACTIVE', advice: ['M','V','R'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:false,stage:null,progress:0}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Active',progress:100}, R:{active:true,stage:'Active',progress:100} }, managers: ["Brett O'Donnell"], email: 'harrison.trust@gmail.com', phone: '027 654 3210' },
    { id: 16, name: 'Isabella Chen', type: 'person', status: 'PROSPECT', advice: ['K','I','V'], adviceProgress: { M:{active:false,stage:null,progress:0}, K:{active:true,stage:'Prospect',progress:15}, I:{active:true,stage:'Discovery',progress:20}, V:{active:true,stage:'Prospect',progress:10}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'isabella.chen@xtra.co.nz', phone: '021 111 2222' },
    { id: 17, name: 'James Robertson', type: 'person', status: 'ACTIVE', advice: ['M','K','I'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Review',progress:70}, I:{active:true,stage:'Application',progress:40}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Steven Johnston"], email: 'j.robertson@email.nz', phone: '022 999 8888' },
    { id: 18, name: 'Kiwi Holdings Ltd', type: 'building', status: 'ACTIVE', advice: ['M','K','V'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Active',progress:100}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Active',progress:100}, R:{active:false,stage:null,progress:0} }, managers: ["Brett O'Donnell"], email: 'admin@kiwiholdings.co.nz', phone: '09 444 5555' },
    { id: 19, name: 'Laura Mitchell', type: 'person', status: 'ACTIVE', advice: ['M','I','V','R'], adviceProgress: { M:{active:true,stage:'Application',progress:65}, K:{active:false,stage:null,progress:0}, I:{active:true,stage:'Underwriting',progress:50}, V:{active:true,stage:'Active',progress:100}, R:{active:true,stage:'Discovery',progress:25} }, managers: ["Steven Johnston","Michael Chen","Sarah Williams"], email: 'laura.mitchell@yahoo.co.nz', phone: '027 777 6666' },
    { id: 20, name: 'Mark Stevenson', type: 'person', status: 'INACTIVE', advice: ['K','I'], adviceProgress: { M:{active:false,stage:null,progress:0}, K:{active:true,stage:'Prospect',progress:5}, I:{active:true,stage:'Prospect',progress:5}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'mark.stevenson@gmail.com', phone: '021 222 3333' },
    { id: 21, name: 'Northland Enterprises', type: 'building', status: 'ACTIVE', advice: ['M','V','R'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:false,stage:null,progress:0}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Review',progress:80}, R:{active:true,stage:'Active',progress:100} }, managers: ["Brett O'Donnell"], email: 'info@northlandent.nz', phone: '09 333 4444' },
    { id: 22, name: 'Olivia Walker', type: 'person', status: 'ACTIVE', advice: ['M','K','I','V'], adviceProgress: { M:{active:true,stage:'Active',progress:100}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Review',progress:75}, V:{active:true,stage:'Application',progress:60}, R:{active:false,stage:null,progress:0} }, managers: ["Steven Johnston"], email: 'olivia.w@gmail.com', phone: '022 555 4444' },
    { id: 23, name: "Patrick O'Brien", type: 'person', status: 'ACTIVE', advice: ['M','I'], adviceProgress: { M:{active:true,stage:'Settlement',progress:95}, K:{active:false,stage:null,progress:0}, I:{active:true,stage:'Active',progress:100}, V:{active:false,stage:null,progress:0}, R:{active:false,stage:null,progress:0} }, managers: ["Brett O'Donnell"], email: 'patrick.obrien@email.co.nz', phone: '021 888 9999' },
    { id: 24, name: 'Quinn Enterprises Ltd', type: 'building', status: 'PROSPECT', advice: ['M','K','V'], adviceProgress: { M:{active:true,stage:'Prospect',progress:10}, K:{active:true,stage:'Discovery',progress:20}, I:{active:false,stage:null,progress:0}, V:{active:true,stage:'Prospect',progress:10}, R:{active:false,stage:null,progress:0} }, managers: [], email: 'contact@quinn-ent.nz', phone: '09 666 7777' },
    { id: 25, name: 'Rebecca Taylor', type: 'person', status: 'ACTIVE', advice: ['K','I','V','R'], adviceProgress: { M:{active:false,stage:null,progress:0}, K:{active:true,stage:'Active',progress:100}, I:{active:true,stage:'Active',progress:100}, V:{active:true,stage:'Review',progress:85}, R:{active:true,stage:'Planning',progress:40} }, managers: ["Steven Johnston"], email: 'rebecca.taylor@xtra.co.nz', phone: '027 321 6549' },
  ];

  for (const c of clients) {
    await sql`
      INSERT INTO clients (id, name, type, status, advice, advice_progress, email, phone)
      VALUES (${c.id}, ${c.name}, ${c.type}, ${c.status}, ${c.advice as any}, ${JSON.stringify(c.adviceProgress)}, ${c.email}, ${c.phone})
      ON CONFLICT (id) DO NOTHING
    `;

    // Client managers
    for (const managerName of c.managers) {
      const userId = userLookup[managerName];
      if (userId) {
        await sql`
          INSERT INTO client_managers (client_id, user_id)
          VALUES (${c.id}, ${userId})
          ON CONFLICT (client_id, user_id) DO NOTHING
        `;
      }
    }
  }

  // Reset the sequence to avoid conflicts with future inserts
  await sql`SELECT setval('clients_id_seq', 25)`;
  console.log('  ✓ clients (25) + client_managers');

  // ─── 3. Opportunities ─────────────────────────────────────────────────────
  const opportunityTypes = ['Mortgage', 'KiwiSaver', 'Insurance', 'Investment', 'Retirement'];
  const stages = ['Prospect', 'Lead Nurture', 'Discovery', 'Proposal', 'Application', 'Review', 'Settlement', 'Active'];
  const advisorNames = ["Brett O'Donnell", 'Steven Johnston', 'Michael Chen', 'Sarah Williams', 'David Lee', 'James Thompson'];

  const opportunityTemplates: Record<string, Array<{ name: string; description: string; values: string[] }>> = {
    Mortgage: [
      { name: 'First Home Purchase', description: 'Client exploring first home buying options', values: ['$450,000', '$520,000', '$380,000'] },
      { name: 'Refinance Existing Loan', description: 'Looking to refinance for better rates', values: ['$350,000', '$425,000', '$560,000'] },
      { name: 'Investment Property', description: 'Seeking financing for investment property', values: ['$650,000', '$720,000', '$590,000'] },
    ],
    KiwiSaver: [
      { name: 'KiwiSaver Optimization', description: 'Review and optimize KiwiSaver strategy', values: ['$85,000', '$120,000', '$95,000'] },
      { name: 'First Home Withdrawal', description: 'Planning KiwiSaver first home withdrawal', values: ['$65,000', '$75,000', '$55,000'] },
      { name: 'Retirement Planning', description: 'Long-term KiwiSaver retirement strategy', values: ['$145,000', '$180,000', '$160,000'] },
    ],
    Insurance: [
      { name: 'Life Insurance Review', description: 'Comprehensive life insurance coverage review', values: ['$45,000', '$55,000', '$38,000'] },
      { name: 'Income Protection', description: 'Income protection insurance assessment', values: ['$35,000', '$42,000', '$48,000'] },
      { name: 'Health & Trauma Cover', description: 'Health and trauma insurance planning', values: ['$52,000', '$68,000', '$44,000'] },
    ],
    Investment: [
      { name: 'Investment Portfolio Review', description: 'Comprehensive investment portfolio analysis', values: ['$125,000', '$185,000', '$145,000'] },
      { name: 'Managed Funds', description: 'Managed fund investment opportunities', values: ['$95,000', '$110,000', '$88,000'] },
      { name: 'Diversification Strategy', description: 'Portfolio diversification planning', values: ['$165,000', '$205,000', '$142,000'] },
    ],
    Retirement: [
      { name: 'Retirement Planning', description: 'Comprehensive retirement income planning', values: ['$450,000', '$520,000', '$385,000'] },
      { name: 'Pension Review', description: 'Review and optimize pension strategy', values: ['$280,000', '$320,000', '$265,000'] },
      { name: 'Estate Planning', description: 'Estate and legacy planning review', values: ['$380,000', '$425,000', '$355,000'] },
    ],
  };

  // Use deterministic seeding (matching the frontend's Math.random-based generator but with fixed seed)
  let oppId = 1;
  for (let clientId = 1; clientId <= 25; clientId++) {
    const clientData = clients.find(c => c.id === clientId)!;
    for (const type of opportunityTypes) {
      const templates = opportunityTemplates[type];
      const template = templates[clientId % templates.length];
      const stage = stages[(clientId * 3 + oppId) % stages.length];
      const advisor = advisorNames[(clientId + oppId) % advisorNames.length];
      const probability = 20 + ((clientId * 7 + oppId * 13) % 71); // deterministic 20-90
      const value = template.values[clientId % template.values.length];
      const advisorId = userLookup[advisor];

      await sql`
        INSERT INTO opportunities (id, name, client_id, advisor_id, date, stage, value, probability, type, description, client_details)
        VALUES (${oppId}, ${template.name}, ${clientId}, ${advisorId}, ${`2026-02-${String(((clientId * 3 + oppId) % 28) + 1).padStart(2, '0')}`}, ${stage}, ${value}, ${probability}, ${type}, ${template.description}, ${JSON.stringify({ email: clientData.email, firstName: '', kiwisaverCalc: 'Configured', crm: 'Active', nameIR: '', dateOfBirth: '01/01/1990' })})
        ON CONFLICT (id) DO NOTHING
      `;
      oppId++;
    }
  }
  await sql`SELECT setval('opportunities_id_seq', ${oppId - 1})`;
  console.log(`  ✓ opportunities (${oppId - 1})`);

  // ─── 4. Meetings (all clients) ───────────────────────────────────────────
  const meetingTitles = [
    'Annual KiwiSaver Review', 'Mortgage Pre-Approval Discussion', 'Insurance Proposal Presentation',
    'Retirement Income Planning', 'Quarterly Portfolio Review', 'Estate Planning Consultation',
    'Investment Strategy Workshop', 'Follow-up — Risk Assessment', 'Discovery Call',
    'Policy Renewal Review', 'Financial Health Check', 'Compliance Review Meeting',
  ];
  const meetingTypes = [
    'KiwiSaver Review', 'Mortgage Pre-Approval Review', 'Life & Trauma Proposal',
    'Retirement Income Strategy', 'KiwiSaver Quarterly Review', 'Portfolio Rebalance',
    'Group Scheme Review', 'Investment Strategy Follow-up', 'Discovery Meeting',
    'Insurance Renewal', 'Financial Review', 'Compliance Check',
  ];
  const meetingTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00'];
  const meetingDurations = ['30 min', '45 min', '60 min', '90 min'];
  const meetingLocations = ['Office — Level 3, 22 Fanshawe St', 'Video Call — Teams', 'Client Home', 'Café — Ponsonby Rd', 'Phone Call', 'Office — Boardroom', ''];

  let meetingCount = 0;
  for (const client of clients) {
    const numMeetings = 2 + (client.id % 3); // 2-4 meetings per client
    for (let i = 0; i < numMeetings; i++) {
      const dayOffset = (client.id * 3 + i * 5) % 28;
      const date = `2026-03-${String(dayOffset + 1).padStart(2, '0')}`;
      const title = meetingTitles[(client.id + i) % meetingTitles.length];
      const mType = meetingTypes[(client.id + i) % meetingTypes.length];
      const time = meetingTimes[(client.id * 2 + i) % meetingTimes.length];
      const dur = meetingDurations[(client.id + i) % meetingDurations.length];
      const loc = meetingLocations[(client.id + i) % meetingLocations.length];
      const advisor = advisorNames[(client.id + i) % advisorNames.length];

      await sql`INSERT INTO meetings (title, client_id, advisor_id, type, date, start_time, duration, location)
        VALUES (${title}, ${client.id}, ${userLookup[advisor]}, ${mType}, ${date}, ${time}, ${dur}, ${loc})`;
      meetingCount++;
    }
  }
  console.log(`  ✓ meetings (${meetingCount})`);

  // ─── 5. Activities (all clients) ───────────────────────────────────────────
  const activityTemplates = [
    { type: 'meeting', title: 'Meeting', subtitleTmpl: 'Annual Review — KiwiSaver & Insurance' },
    { type: 'email', title: 'Email Sent', subtitleTmpl: 'Statement of Advice — Mortgage Refinance' },
    { type: 'document', title: 'Document Upload', subtitleTmpl: 'Signed Disclosure Statement.pdf' },
    { type: 'meeting', title: 'Meeting', subtitleTmpl: 'Discovery Call — Retirement Planning' },
    { type: 'email', title: 'Email Received', subtitleTmpl: 'RE: Investment Portfolio Options' },
    { type: 'document', title: 'Document Upload', subtitleTmpl: 'Proof of Identity uploaded' },
    { type: 'meeting', title: 'Meeting', subtitleTmpl: 'Follow-up — Insurance Underwriting' },
    { type: 'email', title: 'Email Sent', subtitleTmpl: 'KiwiSaver Fund Switch Confirmation' },
    { type: 'task', title: 'Task Completed', subtitleTmpl: 'Mortgage application submitted' },
    { type: 'call', title: 'Phone Call', subtitleTmpl: 'Phone consultation — portfolio review' },
    { type: 'opportunity', title: 'Opportunity Updated', subtitleTmpl: 'Insurance proposal sent for review' },
    { type: 'email', title: 'Email Sent', subtitleTmpl: 'Quarterly performance report attached' },
  ];

  let activityCount = 0;
  for (const client of clients) {
    const numActivities = 3 + (client.id % 4); // 3-6 activities per client
    for (let i = 0; i < numActivities; i++) {
      const tmpl = activityTemplates[(client.id * 3 + i) % activityTemplates.length];
      const status = i < numActivities - 1 ? 'completed' : 'upcoming';
      await sql`INSERT INTO activities (type, title, subtitle, client_id, client_name, status)
        VALUES (${tmpl.type}, ${tmpl.title}, ${tmpl.subtitleTmpl}, ${client.id}, ${client.name}, ${status})`;
      activityCount++;
    }
  }
  console.log(`  ✓ activities (${activityCount})`);

  // ─── 6. Contacts (all clients) ───────────────────────────────────────────
  // Deterministic helper
  const pick = <T,>(arr: T[], seed: number): T => arr[seed % arr.length];

  const firstNamesMale = ['James','William','Oliver','Thomas','Benjamin','Samuel','Daniel','Henry','Alexander','Matthew','Nathan','Caleb','Ethan','Lucas','Ryan','Connor','Logan','Liam','Noah','Jack'];
  const firstNamesFemale = ['Emma','Olivia','Charlotte','Amelia','Sophia','Isabella','Mia','Ava','Grace','Ella','Lily','Chloe','Hannah','Zoe','Lucy','Sophie','Ruby','Emily','Aria','Harper'];
  const lastNames = ['Smith','Williams','Brown','Taylor','Wilson','Anderson','Thomas','Harris','Clark','Lewis','Robinson','Walker','Hall','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Mitchell','Campbell','Roberts','Turner','Phillips','Parker','Evans','Edwards','Collins'];
  const middleNamesMale = ['James','Robert','William','John','David','Michael','Thomas','Edward','Charles','George'];
  const middleNamesFemale = ['Louise','Marie','Anne','Rose','Grace','Jane','Kate','May','Jean','Claire'];
  const nzStreets = ['Queen St','Ponsonby Rd','Dominion Rd','Great South Rd','Mt Eden Rd','Parnell Rd','Victoria St','Khyber Pass Rd','Broadway','High St','Riccarton Rd','Colombo St','Lambton Quay','Willis St','Cuba St','Devonport Rd','Cameron Rd','Maunganui Rd','Fenton St','Te Ngae Rd'];
  const nzSuburbs = ['Greenlane','Mt Eden','Ponsonby','Remuera','Epsom','Grey Lynn','Parnell','Herne Bay','Takapuna','Devonport','Riccarton','Merivale','Kelburn','Thorndon','Mt Maunganui','Tauranga','Hamilton','Wellington','Christchurch','Queenstown'];
  const nzBanks = ['ANZ','ASB','BNZ','Westpac','Kiwibank','TSB','SBS Bank','The Co-operative Bank'];
  const insurers = ['AIA','Partners Life','Southern Cross','Asteron Life','Fidelity Life','Cigna','nib'];
  const ksProviders = ['Fisher Funds','Milford','ANZ Investments','ASB KiwiSaver','Generate','Simplicity','BNZ KiwiSaver','Booster'];
  const investmentFunds = ['Milford Active Growth Fund','Fisher Funds Growth','Harbour NZ Equity','Mint NZ SRI Fund','ANZ Growth Fund','Pathfinder Ethical Fund','Jarden Balanced Fund','Castle Point Five Fortresses'];
  const nzCompanies = ['Fisher & Paykel','Xero','Fonterra','Air New Zealand','Spark NZ','Mercury NZ','Fletcher Building','Mainfreight','a2 Milk','Pushpay','Vista Group','Meridian Energy','Contact Energy','Ryman Healthcare','Auckland Airport'];

  let contactCount = 0;
  for (const client of clients) {
    const cid = client.id;
    const isPerson = client.type === 'person';
    const nameParts = client.name.split(' ');

    if (isPerson) {
      // Self contact
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const middleName = pick(middleNamesMale, cid * 3);
      const gender = (cid % 3 === 0) ? 'Female' : 'Male';
      const dob = `${String(((cid * 7) % 28) + 1).padStart(2, '0')}/${String(((cid * 5) % 12) + 1).padStart(2, '0')}/${1965 + (cid * 3) % 30}`;
      await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
        VALUES (${cid}, ${client.name}, 'self', ${client.email}, ${client.phone}, ${firstName}, ${lastName}, ${middleName}, ${dob}, ${gender}, '')`;
      contactCount++;

      // Spouse / partner
      const spouseFirst = gender === 'Male' ? pick(firstNamesFemale, cid * 7) : pick(firstNamesMale, cid * 7);
      const spouseMiddle = gender === 'Male' ? pick(middleNamesFemale, cid * 11) : pick(middleNamesMale, cid * 11);
      const spouseDob = `${String(((cid * 11) % 28) + 1).padStart(2, '0')}/${String(((cid * 9) % 12) + 1).padStart(2, '0')}/${1967 + (cid * 3) % 28}`;
      const spouseEmail = `${spouseFirst.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;
      await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
        VALUES (${cid}, ${spouseFirst + ' ' + lastName}, 'primary_contact', ${spouseEmail}, ${'021 ' + String(500 + cid * 17).slice(0,3) + ' ' + String(1000 + cid * 31).slice(0,3)}, ${spouseFirst}, ${lastName}, ${spouseMiddle}, ${spouseDob}, ${gender === 'Male' ? 'Female' : 'Male'}, 'Spouse')`;
      contactCount++;

      // Solicitor (every other client)
      if (cid % 2 === 0) {
        const solFirst = pick(firstNamesMale, cid * 13);
        const solLast = pick(lastNames, cid * 17);
        await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
          VALUES (${cid}, ${solFirst + ' ' + solLast}, 'other', ${solFirst.toLowerCase() + '.' + solLast.toLowerCase()[0] + '@lawfirm.co.nz'}, ${'09 ' + String(300 + cid * 7).slice(0,3) + ' ' + String(4000 + cid * 13).slice(0,4)}, ${solFirst}, ${solLast}, '', '', 'Male', 'Solicitor')`;
        contactCount++;
      }

      // Accountant (every 3rd client)
      if (cid % 3 === 0) {
        const accFirst = pick(firstNamesFemale, cid * 19);
        const accLast = pick(lastNames, cid * 23);
        await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
          VALUES (${cid}, ${accFirst + ' ' + accLast}, 'other', ${accFirst.toLowerCase() + '.' + accLast.toLowerCase() + '@accounting.co.nz'}, ${'09 ' + String(555 + cid * 3).slice(0,3) + ' ' + String(8000 + cid * 9).slice(0,4)}, ${accFirst}, ${accLast}, '', '', 'Female', 'Accountant')`;
        contactCount++;
      }
    } else {
      // Business/trust — director + admin
      const dirFirst = pick(firstNamesMale, cid * 5);
      const dirLast = pick(lastNames, cid * 7);
      const dirDob = `${String(((cid * 3) % 28) + 1).padStart(2, '0')}/${String(((cid * 7) % 12) + 1).padStart(2, '0')}/${1960 + (cid * 2) % 25}`;
      await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
        VALUES (${cid}, ${dirFirst + ' ' + dirLast}, 'self', ${dirFirst.toLowerCase() + '@' + client.name.toLowerCase().replace(/[^a-z]/g, '') + '.co.nz'}, ${'021 ' + String(700 + cid * 11).slice(0,3) + ' ' + String(2000 + cid * 19).slice(0,4)}, ${dirFirst}, ${dirLast}, ${pick(middleNamesMale, cid * 9)}, ${dirDob}, 'Male', 'Director')`;
      contactCount++;

      const adminFirst = pick(firstNamesFemale, cid * 11);
      const adminLast = pick(lastNames, cid * 13);
      await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
        VALUES (${cid}, ${adminFirst + ' ' + adminLast}, 'primary_contact', ${adminFirst.toLowerCase() + '@' + client.name.toLowerCase().replace(/[^a-z]/g, '') + '.co.nz'}, ${'09 ' + String(400 + cid * 3).slice(0,3) + ' ' + String(5000 + cid * 7).slice(0,4)}, ${adminFirst}, ${adminLast}, '', '', 'Female', 'Office Administrator')`;
      contactCount++;

      // Accountant for businesses
      const accFirst = pick(firstNamesMale, cid * 29);
      const accLast = pick(lastNames, cid * 31);
      await sql`INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
        VALUES (${cid}, ${accFirst + ' ' + accLast}, 'other', ${accFirst.toLowerCase() + '.' + accLast.toLowerCase() + '@chartered.co.nz'}, ${'09 ' + String(200 + cid * 5).slice(0,3) + ' ' + String(3000 + cid * 11).slice(0,4)}, ${accFirst}, ${accLast}, '', '', 'Male', 'Accountant')`;
      contactCount++;
    }
  }
  console.log(`  ✓ contacts (${contactCount})`);

  // ─── 7. Communications (all clients) ───────────────────────────────────────
  const commTemplates = [
    { subject: 'RE: Quarterly Portfolio Review — Investment Performance Update', preview: "Hi there, I've completed the quarterly review of the portfolio. Returns are tracking well above benchmark.", type: 'email' },
    { subject: 'RE: Mortgage Refinance — Rate Lock Confirmation', preview: 'Great news — the bank has confirmed the rate lock. Please review the attached documentation.', type: 'email' },
    { subject: 'Insurance Policy Renewal — Action Required', preview: 'Client called to discuss upcoming insurance policy renewal. Current premiums need review before the renewal date.', type: 'note' },
    { subject: 'RE: KiwiSaver Fund Switch — Confirmation & Next Steps', preview: 'The fund switch has been processed successfully. New allocation will take effect within 5 business days.', type: 'email' },
    { subject: 'AML/CDD Compliance — Documents Received', preview: 'All required identity documents have been verified and filed. Compliance check is now complete.', type: 'note' },
    { subject: 'RE: Retirement Projection — Updated Scenarios', preview: "I've run three retirement scenarios based on our discussion. The growth scenario shows the most promising outcome.", type: 'email' },
    { subject: 'Meeting Notes — Discovery Call Summary', preview: "Summary of today's discovery call: Client interested in diversifying their investment portfolio and reviewing insurance.", type: 'note' },
    { subject: 'RE: Health Insurance Claim — Status Update', preview: 'The claim has been approved. Reimbursement should appear in the account within 10 working days.', type: 'email' },
    { subject: 'Annual Review Preparation — Checklist', preview: 'Preparing for the upcoming annual review. Please ensure all documentation is up to date before the meeting.', type: 'note' },
    { subject: 'RE: Investment Opportunity — Property Fund', preview: 'The new property fund opens for subscriptions next month. Minimum investment is $25,000 with projected returns of 7-9%.', type: 'email' },
  ];

  let commCount = 0;
  for (const client of clients) {
    const numComms = 3 + (client.id % 6); // 3-8 comms per client
    for (let i = 0; i < numComms; i++) {
      const tmpl = commTemplates[(client.id * 3 + i) % commTemplates.length];
      const fromName = pick(advisorNames, client.id + i);
      const unread = i < 2 && client.id % 3 === 0;
      await sql`INSERT INTO communications (client_id, from_name, subject, preview, type, unread)
        VALUES (${client.id}, ${fromName}, ${tmpl.subject}, ${tmpl.preview}, ${tmpl.type}, ${unread})`;
      commCount++;
    }
  }
  console.log(`  ✓ communications (${commCount})`);

  // ─── 8. Documents (all clients) ────────────────────────────────────────────
  const docTemplates: Record<string, Array<{ name: string; size: string; status: string }>> = {
    Identity: [
      { name: 'Passport.pdf', size: '2.1 MB', status: 'verified' },
      { name: 'Drivers Licence.pdf', size: '1.4 MB', status: 'verified' },
      { name: 'Proof of Address — Utility Bill.pdf', size: '890 KB', status: 'verified' },
    ],
    Insurance: [
      { name: 'Life Insurance Policy.pdf', size: '3.2 MB', status: 'active' },
      { name: 'Income Protection Policy.pdf', size: '2.8 MB', status: 'active' },
      { name: 'Health Insurance Policy.pdf', size: '1.9 MB', status: 'active' },
      { name: 'Trauma Cover — Quotation.pdf', size: '1.1 MB', status: 'pending' },
    ],
    Investments: [
      { name: 'Investment Portfolio Statement — Q4 2025.pdf', size: '4.5 MB', status: 'current' },
      { name: 'Managed Fund Application.pdf', size: '2.3 MB', status: 'submitted' },
      { name: 'Risk Profile Questionnaire.pdf', size: '560 KB', status: 'completed' },
    ],
    KiwiSaver: [
      { name: 'KiwiSaver Statement.pdf', size: '1.8 MB', status: 'current' },
      { name: 'Fund Switch Confirmation.pdf', size: '420 KB', status: 'completed' },
      { name: 'First Home Withdrawal Application.pdf', size: '1.5 MB', status: 'in-progress' },
    ],
    Mortgage: [
      { name: 'Mortgage Pre-Approval.pdf', size: '3.6 MB', status: 'active' },
      { name: 'Property Valuation Report.pdf', size: '5.2 MB', status: 'completed' },
      { name: 'Sale & Purchase Agreement.pdf', size: '4.1 MB', status: 'pending' },
      { name: 'Loan Application — Signed.pdf', size: '2.9 MB', status: 'submitted' },
    ],
    Compliance: [
      { name: 'Disclosure Statement — Signed.pdf', size: '1.1 MB', status: 'completed' },
      { name: 'Client Agreement — Signed.pdf', size: '980 KB', status: 'completed' },
      { name: 'Privacy Consent Form.pdf', size: '450 KB', status: 'completed' },
      { name: 'AML Source of Funds Declaration.pdf', size: '520 KB', status: 'verified' },
    ],
  };

  // Determine which folders each client gets based on their advice types
  const adviceFolderMap: Record<string, string[]> = {
    M: ['Mortgage'],
    K: ['KiwiSaver'],
    I: ['Insurance'],
    V: ['Investments'],
    R: ['Investments'],
  };

  let docCount = 0;
  for (const client of clients) {
    // Every client gets Identity + Compliance
    const folders = new Set(['Identity', 'Compliance']);
    for (const adv of client.advice) {
      const mapped = adviceFolderMap[adv] || [];
      mapped.forEach(f => folders.add(f));
    }

    for (const folder of folders) {
      const docs = docTemplates[folder] || [];
      for (const doc of docs) {
        // Personalise the document name for person clients
        const docName = client.type === 'person'
          ? doc.name.replace('.pdf', ` — ${client.name}.pdf`)
          : doc.name.replace('.pdf', ` — ${client.name}.pdf`);
        await sql`INSERT INTO documents (client_id, folder, name, size, status)
          VALUES (${client.id}, ${folder}, ${docName}, ${doc.size}, ${doc.status})`;
        docCount++;
      }
    }
  }
  console.log(`  ✓ documents (${docCount})`);

  // ─── 9. Financial Data (all clients) ───────────────────────────────────────
  // Deterministic financial figures based on client id
  const netWorthBase = [450000, 1200000, 2500000, 320000, 680000, 950000, 180000, 1100000, 550000, 3200000, 150000, 4500000, 780000, 890000, 2800000, 210000, 620000, 1800000, 720000, 95000, 3500000, 840000, 560000, 1500000, 920000];

  for (const client of clients) {
    const cid = client.id;
    const baseNW = netWorthBase[(cid - 1) % netWorthBase.length];
    const totalAssets = Math.round(baseNW * 1.45);
    const totalLiabilities = totalAssets - baseNW;

    // Snapshots (2-4 per client)
    const numSnapshots = 2 + (cid % 3);
    const snapshotDates = ['2026-03-01', '2026-02-15', '2025-12-15', '2025-06-20'];
    const snapshotNames = ['Annual Review 2026', 'Q1 2026 Update', 'Year-End Review 2025', 'Mid-Year Review 2025'];
    for (let i = 0; i < numSnapshots; i++) {
      const nwVariance = Math.round(baseNW * (1 - i * 0.04));
      await sql`INSERT INTO financial_snapshots (client_id, name, date, status, progress, net_worth, total_assets, total_liabilities)
        VALUES (${cid}, ${snapshotNames[i]}, ${snapshotDates[i]}, ${i === 1 && cid % 4 === 0 ? 'in-progress' : 'completed'}, ${i === 1 && cid % 4 === 0 ? 60 : 100}, ${nwVariance}, ${Math.round(nwVariance * 1.45)}, ${Math.round(nwVariance * 0.45)})`;
    }

    // Assets (4-7 per client)
    const streetNum = 10 + (cid * 7) % 190;
    const street = pick(nzStreets, cid * 3);
    const suburb = pick(nzSuburbs, cid * 5);
    const propertyValue = 400000 + (cid * 47000) % 800000;
    const ksProvider = pick(ksProviders, cid * 7);
    const invFund = pick(investmentFunds, cid * 11);
    const bank = pick(nzBanks, cid * 13);

    await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'property', ${streetNum + ' ' + street + ', ' + suburb}, ${'$' + propertyValue.toLocaleString()}, ${cid % 3 === 0 ? 'Individual' : 'Joint'})`;
    await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'savings', ${ksProvider + ' KiwiSaver — ' + (cid % 2 === 0 ? 'Growth' : 'Balanced')}, ${'$' + (45000 + (cid * 8300) % 150000).toLocaleString()}, 'Individual')`;
    await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'savings', ${bank + ' Savings Account'}, ${'$' + (8000 + (cid * 3700) % 80000).toLocaleString()}, ${cid % 2 === 0 ? 'Joint' : 'Individual'})`;
    await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'investment', ${invFund}, ${'$' + (15000 + (cid * 6100) % 120000).toLocaleString()}, 'Individual')`;

    if (cid % 2 === 0) {
      await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'vehicle', ${'2022 ' + pick(['Toyota RAV4','Mazda CX-5','Hyundai Tucson','Kia Sportage','Mitsubishi Outlander','Nissan X-Trail','Subaru Outback'], cid)}, ${'$' + (22000 + (cid * 1900) % 30000).toLocaleString()}, 'Individual')`;
    }
    if (cid % 3 === 0) {
      await sql`INSERT INTO financial_assets (client_id, type, description, value, ownership) VALUES (${cid}, 'savings', ${'Term Deposit — ' + (3 + cid % 9) + ' month @ ' + (4.5 + (cid % 15) * 0.1).toFixed(2) + '%'}, ${'$' + (20000 + (cid * 4100) % 80000).toLocaleString()}, 'Joint')`;
    }

    // Liabilities (2-4 per client)
    const mortgageBalance = Math.round(propertyValue * 0.55);
    await sql`INSERT INTO financial_liabilities (client_id, type, description, balance, interest_rate, payment) VALUES (${cid}, 'mortgage', ${bank + ' Home Loan — ' + streetNum + ' ' + street}, ${'$' + mortgageBalance.toLocaleString()}, ${(5.2 + (cid % 15) * 0.1).toFixed(2) + '%'}, ${'$' + Math.round(mortgageBalance * 0.006).toLocaleString() + '/month'})`;

    if (cid % 2 === 0) {
      await sql`INSERT INTO financial_liabilities (client_id, type, description, balance, interest_rate, payment) VALUES (${cid}, 'loan', 'Vehicle Finance', ${'$' + (8000 + (cid * 1300) % 25000).toLocaleString()}, ${(7.5 + (cid % 10) * 0.3).toFixed(2) + '%'}, ${'$' + (280 + (cid * 17) % 200) + '/month'})`;
    }
    await sql`INSERT INTO financial_liabilities (client_id, type, description, balance, interest_rate, payment) VALUES (${cid}, 'credit-card', ${pick(['Westpac Airpoints Platinum', 'ANZ Airpoints Visa', 'ASB True Rewards', 'BNZ Advantage Visa', 'Kiwibank Platinum'], cid)}, ${'$' + (1200 + (cid * 400) % 8000).toLocaleString()}, '20.95%', ${'$' + (100 + (cid * 19) % 300) + '/month'})`;

    // Income (2-4 sources per client)
    const company1 = pick(nzCompanies, cid * 3);
    const salary1 = 65000 + (cid * 8500) % 120000;
    const jobTitles = ['Manager', 'Senior Analyst', 'Team Lead', 'Director', 'Consultant', 'Engineer', 'Coordinator', 'Specialist'];
    await sql`INSERT INTO financial_income (client_id, source, amount, frequency) VALUES (${cid}, ${'Salary — ' + client.name.split(' ')[0] + ' (' + pick(jobTitles, cid) + ', ' + company1 + ')'}, ${'$' + salary1.toLocaleString()}, 'Annual')`;

    if (cid % 2 === 0) {
      const company2 = pick(nzCompanies, cid * 7);
      const salary2 = 55000 + (cid * 6300) % 90000;
      await sql`INSERT INTO financial_income (client_id, source, amount, frequency) VALUES (${cid}, ${'Salary — Partner (' + pick(jobTitles, cid + 5) + ', ' + company2 + ')'}, ${'$' + salary2.toLocaleString()}, 'Annual')`;
    }
    await sql`INSERT INTO financial_income (client_id, source, amount, frequency) VALUES (${cid}, 'KiwiSaver Employer Contribution (3%)', ${'$' + Math.round(salary1 * 0.03).toLocaleString()}, 'Annual')`;
    if (cid % 3 === 0) {
      await sql`INSERT INTO financial_income (client_id, source, amount, frequency) VALUES (${cid}, 'Investment Returns', ${'$' + (2000 + (cid * 1100) % 12000).toLocaleString()}, 'Annual')`;
    }

    // Expenses (5-7 categories per client)
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Mortgage Repayments', ${'$' + Math.round(mortgageBalance * 0.006).toLocaleString()}, 'Monthly')`;
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Insurance Premiums', ${'$' + (350 + (cid * 31) % 400)}, 'Monthly')`;
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Groceries & Household', ${'$' + (800 + (cid * 47) % 600)}, 'Monthly')`;
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Utilities (Power, Internet, Water)', ${'$' + (280 + (cid * 13) % 200)}, 'Monthly')`;
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Rates & Body Corporate', ${'$' + (300 + (cid * 19) % 300)}, 'Monthly')`;
    if (cid % 2 === 0) {
      await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Childcare / Education', ${'$' + (800 + (cid * 130) % 1500)}, 'Monthly')`;
    }
    await sql`INSERT INTO financial_expenses (client_id, category, amount, frequency) VALUES (${cid}, 'Discretionary (Entertainment, Dining)', ${'$' + (300 + (cid * 37) % 500)}, 'Monthly')`;

    // Goals (2-4 per client)
    const goalTemplates = [
      { name: 'Pay off mortgage', target: '$' + mortgageBalance.toLocaleString(), date: (2035 + cid % 15) + '-' + String(1 + cid % 12).padStart(2, '0') + '-15', priority: 'High' },
      { name: 'Retirement fund', target: '$' + (800000 + (cid * 70000) % 1200000).toLocaleString(), date: (2045 + cid % 10) + '-03-15', priority: 'High' },
      { name: 'Emergency fund — 6 months expenses', target: '$' + (30000 + (cid * 3000) % 40000).toLocaleString(), date: '2027-06-01', priority: 'High' },
      { name: 'Holiday home', target: '$' + (400000 + (cid * 25000) % 400000).toLocaleString(), date: (2030 + cid % 8) + '-12-01', priority: 'Low' },
      { name: 'Education fund', target: '$' + (60000 + (cid * 7000) % 100000).toLocaleString(), date: (2033 + cid % 10) + '-02-01', priority: 'Medium' },
    ];
    const numGoals = 2 + (cid % 3);
    for (let i = 0; i < numGoals; i++) {
      const g = goalTemplates[i];
      await sql`INSERT INTO financial_goals (client_id, name, target_amount, target_date, priority) VALUES (${cid}, ${g.name}, ${g.target}, ${g.date}, ${g.priority})`;
    }
  }
  console.log('  ✓ financials (all clients — snapshots, assets, liabilities, income, expenses, goals)');

  // ─── 10. Revenue Data (24 months: Apr 2024 – Mar 2026) ────────────────────
  await sql`DELETE FROM revenue_data`;
  const revenueData = [
    // FY2024-25 (Year 1)
    { month: 'Apr 24', revenue: 34800, target: 38000, last_year: 31200 },
    { month: 'May 24', revenue: 39200, target: 38000, last_year: 34500 },
    { month: 'Jun 24', revenue: 43500, target: 40000, last_year: 38900 },
    { month: 'Jul 24', revenue: 40100, target: 40000, last_year: 36200 },
    { month: 'Aug 24', revenue: 41800, target: 40000, last_year: 37400 },
    { month: 'Sep 24', revenue: 44200, target: 43000, last_year: 39100 },
    { month: 'Oct 24', revenue: 42900, target: 43000, last_year: 38600 },
    { month: 'Nov 24', revenue: 48300, target: 45000, last_year: 43100 },
    { month: 'Dec 24', revenue: 38600, target: 45000, last_year: 35200 },
    { month: 'Jan 25', revenue: 46100, target: 47000, last_year: 41800 },
    { month: 'Feb 25', revenue: 49800, target: 47000, last_year: 44300 },
    { month: 'Mar 25', revenue: 52400, target: 50000, last_year: 47600 },
    // FY2025-26 (Year 2)
    { month: 'Apr 25', revenue: 38420, target: 42000, last_year: 34800 },
    { month: 'May 25', revenue: 44610, target: 42000, last_year: 39200 },
    { month: 'Jun 25', revenue: 51380, target: 45000, last_year: 43500 },
    { month: 'Jul 25', revenue: 42150, target: 45000, last_year: 40100 },
    { month: 'Aug 25', revenue: 48730, target: 45000, last_year: 41800 },
    { month: 'Sep 25', revenue: 53940, target: 48000, last_year: 44200 },
    { month: 'Oct 25', revenue: 46280, target: 48000, last_year: 42900 },
    { month: 'Nov 25', revenue: 57610, target: 50000, last_year: 48300 },
    { month: 'Dec 25', revenue: 41820, target: 50000, last_year: 38600 },
    { month: 'Jan 26', revenue: 54370, target: 52000, last_year: 46100 },
    { month: 'Feb 26', revenue: 63140, target: 52000, last_year: 49800 },
    { month: 'Mar 26', revenue: 59480, target: 55000, last_year: 52400 },
  ];
  for (const r of revenueData) {
    await sql`INSERT INTO revenue_data (month, revenue, target, last_year) VALUES (${r.month}, ${r.revenue}, ${r.target}, ${r.last_year})`;
  }
  console.log('  ✓ revenue_data (24 months)');

  console.log('\nSeeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
