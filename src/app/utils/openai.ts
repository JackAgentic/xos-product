import OpenAI from 'openai';
import type { DashboardConfig, DashboardData } from '../data/dashboardConfig';
import type { AIElementContext } from '../components/AIDragToInspect';
import {
  seedAssets, seedLiabilities, seedIncome, seedExpenses, seedGoals,
  contactsData, dashboardUpcomingMeetings, dashboardRecentActivities,
  topClientsData, meetingsData, communicationsData, documentFolders,
  financialSnapshots, opportunityActivities, pipelineData, activityTrendData,
  overviewActivities, overviewOpportunities,
} from '../data/seedData';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

let openai: OpenAI | null = null;

if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

export interface NavLink {
  tabId: string;
  label: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestions?: string[];
  navLinks?: NavLink[];
}

export interface AIAction {
  functionName: string;
  args: Record<string, any>;
}

export interface AIResponse {
  message: string;
  actions: AIAction[];
  suggestions?: string[];
  navLinks?: NavLink[];
}

export interface AIRequestOptions {
  elementContext?: AIElementContext;
  dashboardConfig?: DashboardConfig;
  dashboardData?: DashboardData;
  activeView?: string;
  clientName?: string;
  selectedClient?: any;
  allClients?: any[];
  allOpportunities?: any[];
}

// OpenAI function calling tools for dashboard commands
const dashboardTools: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'update_widget',
      description: 'Update settings of an existing dashboard widget. Can change colors, visibility, chart type, series visibility, title, subtitle, and column span.',
      parameters: {
        type: 'object',
        properties: {
          widgetId: { type: 'string', description: 'The widget ID to update (e.g. "chart-revenue", "metric-totalClients", "list-meetings")' },
          changes: {
            type: 'object',
            properties: {
              visible: { type: 'boolean', description: 'Show or hide the widget' },
              chartType: { type: 'string', enum: ['area', 'bar', 'pie', 'line', 'donut'], description: 'Change chart type (only for chart widgets)' },
              title: { type: 'string' },
              subtitle: { type: 'string' },
              colSpan: { type: 'number', enum: [1, 2], description: 'Grid column span' },
              iconBgColor: { type: 'string', description: 'Tailwind background class for metric card icon (e.g. "bg-blue-50")' },
              iconColor: { type: 'string', description: 'Tailwind text color class for metric card icon (e.g. "text-blue-600")' },
              series: {
                type: 'array',
                description: 'Update chart series config. Each item replaces the series at that index.',
                items: {
                  type: 'object',
                  properties: {
                    dataKey: { type: 'string' },
                    color: { type: 'string', description: 'Hex color (e.g. "#3b82f6")' },
                    label: { type: 'string' },
                    visible: { type: 'boolean' },
                  },
                },
              },
              dateRange: {
                type: 'object',
                description: 'Filter chart data to a slice of the data array. Omit or set to null to show all data.',
                properties: {
                  start: { type: 'number', description: '0-based start index (inclusive)' },
                  end: { type: 'number', description: 'End index (exclusive)' },
                },
                required: ['start', 'end'],
              },
              colors: {
                type: 'object',
                description: 'Color overrides as key-value pairs (hex colors)',
                additionalProperties: { type: 'string' },
              },
            },
          },
        },
        required: ['widgetId', 'changes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_widget',
      description: 'Add a new chart widget to the dashboard. Available data sources: revenueData (fields: month, revenue, target, lastYear), pipelineData (fields: name, value, amount, color), activityTrendData (fields: day, meetings, calls, emails).',
      parameters: {
        type: 'object',
        properties: {
          chartType: { type: 'string', enum: ['area', 'bar', 'pie', 'line', 'donut'] },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          dataSource: { type: 'string', enum: ['revenueData', 'pipelineData', 'activityTrendData'] },
          series: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dataKey: { type: 'string' },
                color: { type: 'string', description: 'Hex color' },
                label: { type: 'string' },
              },
              required: ['dataKey', 'color', 'label'],
            },
          },
          colSpan: { type: 'number', enum: [1, 2] },
        },
        required: ['chartType', 'title', 'dataSource'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_widget',
      description: 'Remove a widget from the dashboard entirely',
      parameters: {
        type: 'object',
        properties: {
          widgetId: { type: 'string', description: 'The widget ID to remove' },
        },
        required: ['widgetId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reset_dashboard',
      description: 'Reset the dashboard to its default configuration, undoing all changes',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_data',
      description: 'Update a data value in the dashboard. For chart data (revenueData, pipelineData, activityTrendData), specify dataSource, index, field, and value. For KPI metrics, specify kpiPath and value.',
      parameters: {
        type: 'object',
        properties: {
          dataSource: { type: 'string', enum: ['revenueData', 'pipelineData', 'activityTrendData'], description: 'The data array to update (for chart data)' },
          index: { type: 'number', description: '0-based index in the data array' },
          field: { type: 'string', description: 'The field name to update (e.g. "revenue", "meetings", "value")' },
          value: { type: 'number', description: 'The new numeric value' },
          kpiPath: { type: 'string', description: 'Dot-path to a KPI field (e.g. "revenue.totalRevenue", "pipeline.coverageRatio", "performance.winRate", "activity.meetingsThisWeek", "customers.nps"). Use this instead of dataSource/index/field for KPI updates.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reset_data',
      description: 'Reset all dashboard data to its original default values, undoing all data changes',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Advice area labels
const ADVICE_LABELS: Record<string, string> = {
  M: 'Mortgage', K: 'KiwiSaver', I: 'Insurance', V: 'Investments', R: 'Retirement',
};

function buildClientContext(client: any, allOpportunities?: any[]): string {
  const lines: string[] = [];
  lines.push(`Client: ${client.name}`);
  lines.push(`Type: ${client.type === 'building' ? 'Organisation' : 'Individual'}`);
  lines.push(`Status: ${client.status}`);
  lines.push(`Email: ${client.email}`);
  lines.push(`Phone: ${client.phone}`);

  if (client.managers?.length) {
    lines.push(`Advisors: ${client.managers.map((m: any) => m.name).join(', ')}`);
  }

  // Advice progress
  if (client.adviceProgress) {
    const activeAreas = Object.entries(client.adviceProgress)
      .filter(([, v]: [string, any]) => v.active)
      .map(([k, v]: [string, any]) => `${ADVICE_LABELS[k] || k}: ${v.stage} (${v.progress}%)`)
      .join(', ');
    if (activeAreas) lines.push(`Active advice areas: ${activeAreas}`);
  }

  // Opportunities for this client
  if (allOpportunities?.length) {
    const clientOpps = allOpportunities.filter((o: any) =>
      o.clientId === client.id || o.client === client.name
    );
    if (clientOpps.length) {
      lines.push(`Opportunities (${clientOpps.length}):`);
      clientOpps.forEach((o: any) => {
        lines.push(`  - ${o.name || o.title}: ${o.value || ''} (${o.stage || o.status || ''})`);
      });
    }
  }

  // Rich seed data for Andrew Carter (client ID 1) — the demo client with full financial profile
  if (client.id === 1) {
    lines.push('');
    lines.push('Financial Profile:');
    lines.push(`Assets: ${seedAssets.map(a => `${a.description}: ${a.value}`).join('; ')}`);
    lines.push(`Liabilities: ${seedLiabilities.map(l => `${l.description}: ${l.balance} @ ${l.interestRate}`).join('; ')}`);
    lines.push(`Income: ${seedIncome.map(i => `${i.source}: ${i.amount} ${i.frequency}`).join('; ')}`);
    lines.push(`Monthly Expenses: ${seedExpenses.map(e => `${e.category}: ${e.amount}`).join('; ')}`);
    lines.push(`Goals: ${seedGoals.map(g => `${g.name} — ${g.targetAmount} by ${g.targetDate} (${g.priority})`).join('; ')}`);
    lines.push(`Contacts: ${contactsData.map(c => `${c.name} (${c.relationship || c.type})`).join(', ')}`);
  }

  return lines.join('\n');
}

function buildPortfolioSummary(clients: any[]): string {
  const active = clients.filter((c: any) => c.status === 'ACTIVE').length;
  const prospect = clients.filter((c: any) => c.status === 'PROSPECT').length;
  const inactive = clients.filter((c: any) => c.status === 'INACTIVE').length;
  const lines = [
    `Portfolio: ${clients.length} clients (${active} active, ${prospect} prospect, ${inactive} inactive)`,
    `Upcoming meetings: ${dashboardUpcomingMeetings.map(m => `${m.client} — ${m.type} (${m.time})`).join('; ')}`,
    `Recent activity: ${dashboardRecentActivities.slice(0, 5).map(a => `${a.client}: ${a.action} (${a.time})`).join('; ')}`,
  ];
  return lines.join('\n');
}

function buildSystemPrompt(options?: AIRequestOptions): string {
  const client = options?.selectedClient;
  const clientName = client?.name || options?.clientName;

  let prompt = `You are AVA, a helpful AI assistant for a New Zealand financial advisory CRM. You help financial advisors manage their clients, pipeline, and dashboard.`;

  // Client context — use real data
  if (options?.allClients?.length) {
    prompt += `\n\n${buildPortfolioSummary(options.allClients)}`;
    prompt += `\n\nAll clients:\n${options.allClients.map((c: any) => {
      const rev = topClientsData[c.id as number];
      const revStr = rev ? `, revenue: $${rev.revenue.toLocaleString()}, ${rev.deals} deals` : '';
      return `- ${c.name} (${c.status}${revStr}${c.email ? ', ' + c.email : ''})`;
    }).join('\n')}`;
  }
  if (client) {
    prompt += `\n\nCurrently viewing client:\n${buildClientContext(client, options?.allOpportunities)}`;
  }

  if (options?.activeView === 'dashboard' && options.dashboardConfig) {
    const widgetSummary = options.dashboardConfig.widgets.map(w => {
      const vis = w.visible ? 'visible' : 'hidden';
      if (w.type === 'metric') return `  - ${w.id}: "${w.label}" (metric, ${vis})`;
      if (w.type === 'chart') return `  - ${w.id}: "${w.title}" (${w.chartType} chart, ${vis}, data: ${w.dataSource})`;
      if (w.type === 'list') return `  - ${w.id}: "${w.title}" (${w.listType} list, ${vis})`;
      return `  - unknown widget`;
    }).join('\n');

    prompt += `\n\nThe user is viewing the Dashboard. Current widgets:\n${widgetSummary}`;

    prompt += `\n\nAvailable data sources:
- revenueData (24 points, index 0–23): month, revenue, target, lastYear. Index 0–11 = FY2024-25, 12–23 = FY2025-26.
- pipelineData (5 stages): name, value (count), amount (dollars), color
- activityTrendData (4 weeks): day, meetings, calls, emails`;

    if (options.dashboardData) {
      const k = options.dashboardData.kpis;
      prompt += `\n\nKey metrics:
  Revenue: $${k.revenue.totalRevenue.toLocaleString()} / $${k.revenue.totalTarget.toLocaleString()} target (${k.revenue.attainment}% attainment)
  Pipeline: $${k.pipeline.totalPipelineValue.toLocaleString()} total, ${k.pipeline.coverageRatio}x coverage, ${k.pipeline.conversionRate}% conversion
  Performance: ${k.performance.winRate}% win rate, $${k.performance.avgDealSize.toLocaleString()} avg deal, ${k.performance.closedWon} won / ${k.performance.closedLost} lost
  Activity this week: ${k.activity.totalThisWeek} total (${k.activity.meetingsThisWeek} meetings, ${k.activity.callsThisWeek} calls, ${k.activity.emailsThisWeek} emails)
  Customers: ${k.customers.activeClients} active, NPS ${k.customers.nps}, LTV/CAC ${k.customers.ltvCacRatio}x`;
    }

    prompt += `\n\nUse the provided tools to modify widgets or data. Use hex colors for charts, Tailwind classes for metric cards. Briefly explain changes.`;
  }

  // Operational data available across all views
  prompt += `\n\nUpcoming meetings:\n${meetingsData.map(m => `- ${m.title} (${m.date}, ${m.time}, ${m.attendees} attendees)`).join('\n')}`;

  prompt += `\n\nRecent communications:\n${communicationsData.map(c => `- ${c.from}: "${c.subject}" (${c.date}, ${c.type}${c.unread ? ', unread' : ''})`).join('\n')}`;

  prompt += `\n\nPipeline stages:\n${pipelineData.map(s => `- ${s.name}: ${s.value} opportunities, $${(s.amount / 1000).toFixed(0)}k value`).join('\n')}`;

  prompt += `\n\nActivity trend (last 4 weeks):\n${activityTrendData.map(a => `- ${a.day}: ${a.meetings} meetings, ${a.calls} calls, ${a.emails} emails`).join('\n')}`;

  if (client?.id === 1) {
    prompt += `\n\nDocuments on file (Andrew Carter):\n${documentFolders.map(f => `${f.name}: ${f.documents.map(d => `${d.name} (${d.status})`).join(', ')}`).join('\n')}`;

    prompt += `\n\nFinancial snapshots:\n${financialSnapshots.map(s => `- ${s.name} (${s.date}): net worth $${s.netWorth.toLocaleString()}, assets $${s.totalAssets.toLocaleString()}, liabilities $${s.totalLiabilities.toLocaleString()} — ${s.status}`).join('\n')}`;

    prompt += `\n\nRecent opportunity activity:\n${opportunityActivities.map(a => `- ${a.date}: ${a.title} — ${a.description}`).join('\n')}`;
  }

  if (options?.allOpportunities?.length) {
    prompt += `\n\nAll opportunities (${options.allOpportunities.length}):\n${options.allOpportunities.slice(0, 20).map((o: any) => `- ${o.name || o.title} — ${o.client || 'Unknown client'}, ${o.value || ''}, stage: ${o.stage || o.status || 'unknown'}`).join('\n')}`;
  }

  if (options?.elementContext) {
    prompt += `\n\nThe user is inspecting element: "${options.elementContext.label}" (field: ${options.elementContext.fieldName}, section: ${options.elementContext.section}).${options.elementContext.editable ? ' This element can be modified.' : ''}`;
  }

  prompt += `\n\nBe helpful, professional, and concise. Reference specific data when answering. You have access to all client, financial, meeting, communication, document, pipeline, and opportunity data — use it to give precise answers.`;

  prompt += `\n\n## Rich Content Formatting
You can embed interactive elements in your responses using special markdown link syntax:

**Inline Charts** — Show a mini chart from dashboard data:
- \`[Revenue Trend](chart:revenueData:area)\` — area chart of revenue data
- \`[Pipeline Breakdown](chart:pipelineData:bar)\` — bar chart of pipeline stages
- \`[Activity Trends](chart:activityTrendData:line)\` — line chart of activity
- Chart types: area, bar, line, pie, donut
- Data sources: revenueData, pipelineData, activityTrendData

**Action Buttons** — Let the user take action directly:
- \`[Schedule Meeting](action:add-event)\`
- \`[Send Email](action:send-email)\`
- \`[Add Note](action:add-note)\`
- \`[Add Task](action:add-task)\`
- \`[Upload Document](action:add-document)\`
- \`[New Opportunity](action:add-opportunity)\`

**Tables** — Use standard markdown tables for structured data. They render as styled cards.

Use charts when discussing trends or data. Use action buttons when suggesting next steps. Use tables for comparisons or lists of data. Place these naturally within your response text.`;

  return prompt;
}

function generateFollowUpSuggestions(userMessage: string, options?: AIRequestOptions): string[] {
  const msg = userMessage.toLowerCase();

  if (options?.elementContext) {
    const label = options.elementContext.label;
    return [`Tell me more about ${label}`, 'What can I change here?', 'Show related data'];
  }

  if (options?.activeView === 'dashboard') {
    return ['Show last 3 months of revenue', 'Compare revenue vs last year', 'Reset dashboard'];
  }

  if (msg.includes('mortgage') || msg.includes('loan')) {
    return ['Refinancing options', 'Compare interest rates', 'Payment breakdown'];
  }
  if (msg.includes('insurance')) {
    return ['Review coverage', 'Compare policies', 'Check premiums'];
  }
  if (msg.includes('meeting') || msg.includes('appointment')) {
    return ['Reschedule meeting', 'Add new meeting', 'View meeting notes'];
  }

  return ['View financials', 'Upcoming meetings', 'Recent activity'];
}

const NAV_KEYWORD_MAP: Record<string, { keywords: string[]; tabId: string; label: string }> = {
  financials: { keywords: ['financial', 'revenue', 'income', 'expense', 'asset', 'liability', 'balance', 'cashflow', 'net worth'], tabId: 'financials', label: 'Financials' },
  meetings: { keywords: ['meeting', 'appointment', 'schedule', 'calendar', 'catch-up', 'review meeting'], tabId: 'meetings', label: 'Meetings' },
  contacts: { keywords: ['contact', 'email', 'phone', 'advisor', 'manager'], tabId: 'contacts', label: 'Contacts' },
  documents: { keywords: ['document', 'file', 'policy', 'statement', 'agreement', 'disclosure'], tabId: 'documents', label: 'Documents' },
  opportunities: { keywords: ['opportunity', 'pipeline', 'deal', 'proposal', 'lead'], tabId: 'opportunities', label: 'Opportunities' },
  communication: { keywords: ['communication', 'correspondence', 'message', 'thread'], tabId: 'communication', label: 'Communication' },
  notes: { keywords: ['note', 'action item'], tabId: 'notes', label: 'Notes' },
  onboarding: { keywords: ['onboarding', 'fact-find', 'aml', 'cdd', 'kyc', 'compliance'], tabId: 'onboarding', label: 'Onboarding' },
  overview: { keywords: ['overview', 'summary', 'portfolio', 'status'], tabId: 'overview', label: 'Overview' },
};

function generateNavLinks(responseText: string, options?: AIRequestOptions): NavLink[] | undefined {
  if (!options?.selectedClient || options?.activeView === 'dashboard') return undefined;

  const text = responseText.toLowerCase();
  const links: NavLink[] = [];

  for (const entry of Object.values(NAV_KEYWORD_MAP)) {
    if (entry.keywords.some(kw => text.includes(kw))) {
      links.push({ tabId: entry.tabId, label: entry.label });
    }
  }

  // Always include overview if no specific matches
  if (links.length === 0) {
    links.push({ tabId: 'overview', label: 'Overview' });
  }

  // Cap at 4 most relevant links
  return links.slice(0, 4);
}

export async function getAIResponse(messages: Message[], options?: AIRequestOptions): Promise<AIResponse> {
  if (openai) {
    try {
      const systemMessage = { role: 'system' as const, content: buildSystemPrompt(options) };
      const useDashboardTools = options?.activeView === 'dashboard';

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        tools: useDashboardTools ? dashboardTools : undefined,
        temperature: 0.7,
        max_tokens: 800,
      });

      const choice = completion.choices[0];
      const actions: AIAction[] = [];

      if (choice.message.tool_calls) {
        for (const toolCall of choice.message.tool_calls) {
          if (toolCall.type === 'function') {
            try {
              actions.push({
                functionName: toolCall.function.name,
                args: JSON.parse(toolCall.function.arguments),
              });
            } catch {
              console.warn('Failed to parse tool call arguments');
            }
          }
        }
      }

      const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
      const responseMsg = choice.message.content || (actions.length > 0 ? "Done! I've applied the changes to your dashboard." : 'Sorry, I could not generate a response.');
      return {
        message: responseMsg,
        actions,
        suggestions: generateFollowUpSuggestions(lastUserMsg, options),
        navLinks: generateNavLinks(responseMsg, options),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return getFallbackResponse(messages, options);
    }
  }

  return getFallbackResponse(messages, options);
}

function getFallbackResponse(messages: Message[], options?: AIRequestOptions): AIResponse {
  const response = getFallbackResponseInner(messages, options);
  response.navLinks = generateNavLinks(response.message, options);
  return response;
}

function getFallbackResponseInner(messages: Message[], options?: AIRequestOptions): AIResponse {
  const client = options?.selectedClient;
  const name = client?.name || options?.clientName || 'your client';
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content.toLowerCase() || '';

  // Dashboard-specific fallbacks
  if (options?.activeView === 'dashboard') {
    if (lastUserMessage.includes('last 3 month') || lastUserMessage.includes('last three month') || lastUserMessage.includes('quarterly')) {
      return {
        message: "I've filtered the Revenue chart to show just the last 3 months (Jan–Mar 26). You can see the recent upward trend clearly now.",
        actions: [{ functionName: 'update_widget', args: { widgetId: 'chart-revenue', changes: { dateRange: { start: 21, end: 24 } } } }],
        suggestions: ['Compare with last year', 'Show full 2 years', 'Show activity trend for same period'],
      };
    }
    if (lastUserMessage.includes('compare') && (lastUserMessage.includes('last year') || lastUserMessage.includes('year on year') || lastUserMessage.includes('yoy'))) {
      return {
        message: "I've enabled the year-on-year comparison on the Revenue chart. The dark green line shows this year's revenue, and the grey dashed line shows last year's figures.",
        actions: [{ functionName: 'update_widget', args: { widgetId: 'chart-revenue', changes: { series: [{ dataKey: 'revenue', visible: true }, { dataKey: 'lastYear', visible: true }] } } }],
        suggestions: ['Show last 3 months only', 'Hide last year comparison', 'Show target line instead'],
      };
    }
    if (lastUserMessage.includes('reset') || lastUserMessage.includes('default')) {
      return {
        message: "I've reset the dashboard to its default layout and filters.",
        actions: [{ functionName: 'reset_dashboard', args: {} }],
        suggestions: ['Show last 3 months', 'Compare year on year', 'Hide activity trend'],
      };
    }
    if (lastUserMessage.includes('show all') || lastUserMessage.includes('full year') || lastUserMessage.includes('12 month')) {
      return {
        message: "Showing the current financial year (Apr 25 – Mar 26).",
        actions: [
          { functionName: 'update_widget', args: { widgetId: 'chart-revenue', changes: { dateRange: { start: 12, end: 24 } } } },
          { functionName: 'update_widget', args: { widgetId: 'chart-activityTrend', changes: { dateRange: null } } },
        ],
        suggestions: ['Show full 2 years', 'Filter to last quarter', 'Hide pipeline chart'],
      };
    }
    if (lastUserMessage.includes('2 year') || lastUserMessage.includes('two year') || lastUserMessage.includes('24 month') || lastUserMessage.includes('all data')) {
      return {
        message: "Showing the full 2-year view (Apr 24 – Mar 26).",
        actions: [
          { functionName: 'update_widget', args: { widgetId: 'chart-revenue', changes: { dateRange: null } } },
        ],
        suggestions: ['Show current year only', 'Filter to last quarter', 'Compare with last year'],
      };
    }
    if (lastUserMessage.includes('update') && lastUserMessage.includes('revenue') && lastUserMessage.match(/\$?\d+/)) {
      const match = lastUserMessage.match(/\$?([\d,]+)\s*k?/i);
      const value = match ? parseInt(match[1].replace(/,/g, '')) * (lastUserMessage.includes('k') ? 1000 : 1) : 65000;
      return {
        message: `I've updated the March revenue to $${(value / 1000).toFixed(0)}k.`,
        actions: [{ functionName: 'update_data', args: { dataSource: 'revenueData', index: 23, field: 'revenue', value } }],
        suggestions: ['Update target too', 'Show revenue chart', 'Reset data'],
      };
    }
    if (lastUserMessage.includes('win rate') && lastUserMessage.match(/\d+/)) {
      const match = lastUserMessage.match(/(\d+)/);
      const value = match ? parseInt(match[1]) : 80;
      return {
        message: `I've updated the win rate to ${value}%.`,
        actions: [
          { functionName: 'update_data', args: { kpiPath: 'performance.winRate', value } },
          { functionName: 'update_data', args: { kpiPath: 'performance.lossRate', value: 100 - value } },
        ],
        suggestions: ['Update quota attainment', 'Show performance card', 'Reset data'],
      };
    }
    if (lastUserMessage.includes('reset data') || lastUserMessage.includes('reset all data')) {
      return {
        message: "I've reset all dashboard data to its original default values.",
        actions: [{ functionName: 'reset_data', args: {} }],
        suggestions: ['Show last 3 months', 'Update revenue', 'Compare year on year'],
      };
    }
  }

  // Client-specific fallbacks using real data
  if (lastUserMessage.includes('mortgage') || lastUserMessage.includes('loan')) {
    if (client?.id === 1) {
      return {
        message: `${name} has the following loans:\n${seedLiabilities.map(l => `• ${l.description}: ${l.balance} at ${l.interestRate} (${l.payment})`).join('\n')}`,
        actions: [],
        suggestions: ['Refinancing options', 'Compare interest rates', 'Payment breakdown'],
      };
    }
    const mortgageStage = client?.adviceProgress?.M;
    return {
      message: mortgageStage?.active
        ? `${name}'s mortgage advice is at the "${mortgageStage.stage}" stage (${mortgageStage.progress}% complete).`
        : `${name} doesn't have an active mortgage advice area. Would you like to start one?`,
      actions: [],
      suggestions: ['Start mortgage advice', 'View all advice areas', 'Check client status'],
    };
  }

  if (lastUserMessage.includes('insurance')) {
    if (client?.id === 1) {
      const insuranceDocs = ['Life Insurance Policy — AIA', 'Income Protection — Partners Life', 'Health Insurance — Southern Cross'];
      return {
        message: `${name}'s insurance policies:\n${insuranceDocs.map(d => `• ${d}`).join('\n')}\n\nMonthly premium: $620 (combined)`,
        actions: [],
        suggestions: ['Review coverage', 'Compare policies', 'Check premiums'],
      };
    }
    const insuranceStage = client?.adviceProgress?.I;
    return {
      message: insuranceStage?.active
        ? `${name}'s insurance advice is at the "${insuranceStage.stage}" stage (${insuranceStage.progress}% complete).`
        : `${name} doesn't have active insurance advice. Would you like to start one?`,
      actions: [],
      suggestions: ['Review coverage options', 'View all advice areas', 'Check client status'],
    };
  }

  if (lastUserMessage.includes('meeting') || lastUserMessage.includes('appointment')) {
    const clientMeetings = dashboardUpcomingMeetings.filter(m => m.client === name);
    if (clientMeetings.length) {
      return {
        message: `Upcoming meetings with ${name}:\n${clientMeetings.map(m => `• ${m.type} — ${m.time} (${m.duration}, advisor: ${m.advisor})`).join('\n')}`,
        actions: [],
        suggestions: ['Reschedule meeting', 'Add new meeting', 'View meeting notes'],
      };
    }
    return {
      message: `No upcoming meetings found for ${name}. Would you like to schedule one?`,
      actions: [],
      suggestions: ['Schedule a meeting', 'View all upcoming meetings', 'Check calendar'],
    };
  }

  if (lastUserMessage.includes('contact') || lastUserMessage.includes('email') || lastUserMessage.includes('phone')) {
    if (client) {
      return {
        message: `Contact details for ${name}:\n• Email: ${client.email}\n• Phone: ${client.phone}${client.managers?.length ? `\n• Advisors: ${client.managers.map((m: any) => m.name).join(', ')}` : ''}`,
        actions: [],
        suggestions: ['Send an email', 'View advice areas', 'Recent activity'],
      };
    }
    return {
      message: `No client selected. Navigate to a client record to see their contact details.`,
      actions: [],
      suggestions: ['View all clients', 'Search for a client', 'Dashboard overview'],
    };
  }

  if (lastUserMessage.includes('summary') || lastUserMessage.includes('overview')) {
    if (client) {
      const activeAreas = client.adviceProgress
        ? Object.entries(client.adviceProgress)
            .filter(([, v]: [string, any]) => v.active)
            .map(([k, v]: [string, any]) => `${ADVICE_LABELS[k] || k}: ${v.stage} (${v.progress}%)`)
        : [];
      return {
        message: `**${name}**\n• Status: ${client.status}\n• Email: ${client.email}\n• Phone: ${client.phone}${activeAreas.length ? `\n• Active advice: ${activeAreas.join(', ')}` : ''}${client.managers?.length ? `\n• Advisors: ${client.managers.map((m: any) => m.name).join(', ')}` : ''}`,
        actions: [],
        suggestions: ['View financials', 'See upcoming meetings', 'Check opportunities'],
      };
    }
    if (options?.allClients?.length) {
      const active = options.allClients.filter((c: any) => c.status === 'ACTIVE').length;
      return {
        message: `Portfolio overview: ${options.allClients.length} total clients (${active} active). Recent activity includes ${dashboardRecentActivities.length} logged interactions.`,
        actions: [],
        suggestions: ['Which clients need attention?', 'Show pipeline summary', 'View dashboard'],
      };
    }
  }

  // Default
  const suggestions = client
    ? [`Tell me about ${name}`, 'View financials', 'Upcoming meetings', 'Recent activity']
    : ['Client contact details', 'Portfolio overview', 'Upcoming meetings', 'Dashboard summary'];

  return {
    message: client
      ? `I can help you with ${name}'s record. What would you like to know?`
      : `I'm AVA, your advisory assistant. How can I help?`,
    actions: [],
    suggestions,
  };
}

export function isOpenAIConfigured(): boolean {
  return openai !== null;
}
