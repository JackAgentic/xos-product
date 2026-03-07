import OpenAI from 'openai';
import type { DashboardConfig } from '../data/dashboardConfig';
import type { AIElementContext } from '../components/AIDragToInspect';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

let openai: OpenAI | null = null;

if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestions?: string[];
}

export interface AIAction {
  functionName: string;
  args: Record<string, any>;
}

export interface AIResponse {
  message: string;
  actions: AIAction[];
  suggestions?: string[];
}

export interface AIRequestOptions {
  elementContext?: AIElementContext;
  dashboardConfig?: DashboardConfig;
  activeView?: string;
  clientName?: string;
}

const mockClientContext = {
  name: 'Another Client',
  email: 'another.client@example.com',
  phone: '(123) 456-7890',
  status: 'Active',
  mortgages: [{ type: 'Home Loan', balance: '$450,000', interestRate: '3.5%', monthlyPayment: '$2,025' }],
  insurance: [{ type: 'Life Insurance', provider: 'Insurance Co', coverage: '$500,000' }],
  upcomingMeetings: [{ date: 'March 15, 2026', type: 'Policy Review' }],
  recentNotes: ['Client interested in refinancing options', 'Discussed investment strategy for retirement'],
};

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
      description: 'Add a new chart widget to the dashboard. Available data sources: revenueData (fields: month, revenue, target), pipelineData (fields: name, value, amount, color), activityTrendData (fields: day, meetings, calls, emails).',
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
];

function buildSystemPrompt(options?: AIRequestOptions): string {
  const clientName = options?.clientName || mockClientContext.name;
  let prompt = `You are AVA, a helpful AI assistant for a CRM system. You help financial advisors manage their clients and dashboard.

You currently have access to information about a client named "${clientName}":
- Contact: ${mockClientContext.email}, ${mockClientContext.phone}
- Status: ${mockClientContext.status}
- Mortgages: ${JSON.stringify(mockClientContext.mortgages)}
- Insurance: ${JSON.stringify(mockClientContext.insurance)}
- Upcoming Meetings: ${JSON.stringify(mockClientContext.upcomingMeetings)}
- Recent Notes: ${mockClientContext.recentNotes.join(', ')}`;

  if (options?.activeView === 'dashboard' && options.dashboardConfig) {
    const widgetSummary = options.dashboardConfig.widgets.map(w => {
      const vis = w.visible ? 'visible' : 'hidden';
      if (w.type === 'metric') return `  - ${w.id}: "${w.label}" (metric, ${vis}, icon: ${w.iconBgColor} ${w.iconColor})`;
      if (w.type === 'chart') return `  - ${w.id}: "${w.title}" (${w.chartType} chart, ${vis}, data: ${w.dataSource}, series: ${JSON.stringify(w.series)})`;
      if (w.type === 'list') return `  - ${w.id}: "${w.title}" (${w.listType} list, ${vis}, maxItems: ${w.maxItems})`;
      return `  - unknown widget`;
    }).join('\n');

    prompt += `

The user is viewing the Dashboard. Current widgets:
${widgetSummary}

Available data sources for new charts:
- revenueData: fields "month" (string), "revenue" (number), "target" (number)
- pipelineData: fields "name" (string), "value" (number), "amount" (number), "color" (string)
- activityTrendData: fields "day" (string), "meetings" (number), "calls" (number), "emails" (number)

When the user wants to modify the dashboard, use the provided tools. Always use hex colors for chart series (e.g. "#3b82f6") and Tailwind classes for metric card styling (e.g. "bg-blue-50", "text-blue-600"). Briefly explain what you changed in your text response.`;
  }

  if (options?.elementContext) {
    prompt += `

The user is inspecting element: "${options.elementContext.label}" (field: ${options.elementContext.fieldName}, section: ${options.elementContext.section}).${options.elementContext.editable ? ' This element can be modified.' : ''}`;
  }

  prompt += `

Be helpful, professional, and concise. When asked about the client, reference the specific data above.`;

  return prompt;
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

      return {
        message: choice.message.content || (actions.length > 0 ? "Done! I've applied the changes to your dashboard." : 'Sorry, I could not generate a response.'),
        actions,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return getFallbackResponse(messages, options?.clientName);
    }
  }

  return getFallbackResponse(messages, options?.clientName);
}

function getFallbackResponse(messages: Message[], clientName?: string): AIResponse {
  const name = clientName || mockClientContext.name;
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content.toLowerCase() || '';

  if (lastUserMessage.includes('mortgage') || lastUserMessage.includes('loan')) {
    return {
      message: `Based on ${name}'s profile, they have a Home Loan with a balance of $450,000 at 3.5% interest rate. Their monthly payment is $2,025.`,
      actions: [],
      suggestions: ['Tell me about refinancing options', 'Show interest rate trends', 'Calculate early repayment']
    };
  }
  if (lastUserMessage.includes('insurance')) {
    return {
      message: `${name} currently has Life Insurance with Insurance Co, providing $500,000 in coverage.`,
      actions: [],
      suggestions: ['Review policy details', 'Discuss additional coverage', 'Check premium history']
    };
  }
  if (lastUserMessage.includes('meeting') || lastUserMessage.includes('appointment')) {
    return {
      message: `${name} has an upcoming Policy Review meeting scheduled for March 15, 2026.`,
      actions: [],
      suggestions: ['Reschedule meeting', 'Add new meeting', 'View meeting notes']
    };
  }
  if (lastUserMessage.includes('contact') || lastUserMessage.includes('email') || lastUserMessage.includes('phone')) {
    return {
      message: `You can reach ${name} at:\n• Email: ${mockClientContext.email}\n• Phone: ${mockClientContext.phone}`,
      actions: [],
      suggestions: ['Send an email', 'Call this client', 'Update contact info']
    };
  }
  if (lastUserMessage.includes('summary') || lastUserMessage.includes('overview')) {
    return {
      message: `Here's a quick summary of ${name}:\n\nEmail: ${mockClientContext.email}\nPhone: ${mockClientContext.phone}\nHome Loan: $450,000 balance\nLife Insurance: $500,000 coverage\nNext Meeting: March 15, 2026`,
      actions: [],
      suggestions: ['View full financials', 'See recent notes', 'Check upcoming tasks']
    };
  }

  return {
    message: `I'd be happy to help you with information about ${name}. I can help you with:`,
    actions: [],
    suggestions: ['Client contact details', 'Mortgage and loan info', 'Insurance policies', 'Upcoming meetings', 'Recent activity']
  };
}

export function isOpenAIConfigured(): boolean {
  return openai !== null;
}
