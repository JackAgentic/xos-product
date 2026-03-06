// Opportunity seed data generator
import { CLIENTS_LOOKUP } from './clients';

export function generateOpportunities() {
  const opportunities = [];
  const opportunityTypes = ['Mortgage', 'KiwiSaver', 'Insurance', 'Investment', 'Retirement'];
  const stages = ['Prospect', 'Lead Nurture', 'Discovery', 'Proposal', 'Application', 'Review', 'Settlement', 'Active'];
  const advisors = ["Brett O'Donnell", 'Steven Johnston', 'Michael Chen', 'Sarah Williams', 'David Lee', 'James Thompson'];
  
  const opportunityTemplates = {
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
  
  let oppId = 1;
  
  // Generate one opportunity of each type for each client
  for (let clientId = 1; clientId <= 25; clientId++) {
    const clientData = CLIENTS_LOOKUP.find(c => c.id === clientId);
    if (!clientData) continue;
    
    opportunityTypes.forEach((type) => {
      const templates = opportunityTemplates[type as keyof typeof opportunityTemplates];
      const template = templates[clientId % templates.length];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const advisor = advisors[Math.floor(Math.random() * advisors.length)];
      const probability = Math.floor(Math.random() * 70) + 20; // 20-90%
      const value = template.values[clientId % template.values.length];
      
      opportunities.push({
        id: oppId++,
        name: template.name,
        clientId: clientId,
        client: clientData.name,
        advisor: advisor,
        clientDetails: {
          email: clientData.email,
          firstName: '',
          kiwisaverCalc: 'Configured',
          crm: 'Active',
          nameIR: '',
          dateOfBirth: '01/01/1990'
        },
        date: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        stage: stage,
        value: value,
        probability: probability,
        type: type,
        description: template.description,
        notes: [] as Array<{text: string; timestamp: string; user: string}>
      });
    });
  }
  
  return opportunities;
}