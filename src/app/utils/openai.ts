import OpenAI from 'openai';

// IMPORTANT: To use real AI functionality, replace 'YOUR_OPENAI_API_KEY_HERE' with your actual OpenAI API key
// You can get an API key from: https://platform.openai.com/api-keys
// 
// SECURITY WARNING: Never commit your API key to version control!
// In production, use environment variables or a backend service to handle API calls securely.
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';

// Initialize OpenAI client (will be null if no API key is provided)
let openai: OpenAI | null = null;

if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from a backend
  });
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Mock client data to provide context to the AI
const mockClientContext = {
  name: 'Another Client',
  email: 'another.client@example.com',
  phone: '(123) 456-7890',
  status: 'Active',
  mortgages: [
    {
      type: 'Home Loan',
      balance: '$450,000',
      interestRate: '3.5%',
      monthlyPayment: '$2,025',
    }
  ],
  insurance: [
    {
      type: 'Life Insurance',
      provider: 'Insurance Co',
      coverage: '$500,000',
    }
  ],
  upcomingMeetings: [
    {
      date: 'March 15, 2026',
      type: 'Policy Review',
    }
  ],
  recentNotes: [
    'Client interested in refinancing options',
    'Discussed investment strategy for retirement',
  ],
};

/**
 * Get AI response using OpenAI API or fallback to mock responses
 */
export async function getAIResponse(messages: Message[]): Promise<string> {
  // If OpenAI is configured, use it
  if (openai) {
    try {
      const systemMessage: Message = {
        role: 'system',
        content: `You are AVA, a helpful AI assistant for a CRM system. You help financial advisors manage their clients' information. 
        
You currently have access to information about a client named "${mockClientContext.name}":
- Contact: ${mockClientContext.email}, ${mockClientContext.phone}
- Status: ${mockClientContext.status}
- Mortgages: ${JSON.stringify(mockClientContext.mortgages)}
- Insurance: ${JSON.stringify(mockClientContext.insurance)}
- Upcoming Meetings: ${JSON.stringify(mockClientContext.upcomingMeetings)}
- Recent Notes: ${mockClientContext.recentNotes.join(', ')}

Be helpful, professional, and concise. When asked about the client, reference the specific data above. 
If asked about data you don't have, politely explain what information is available in the system.`,
      };

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using the faster, more cost-effective model
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return getFallbackResponse(messages);
    }
  }

  // Fallback to mock responses
  return getFallbackResponse(messages);
}

/**
 * Fallback responses when OpenAI is not configured
 */
function getFallbackResponse(messages: Message[]): string {
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content.toLowerCase() || '';

  // Check for specific keywords and provide contextual responses
  if (lastUserMessage.includes('mortgage') || lastUserMessage.includes('loan')) {
    return `Based on ${mockClientContext.name}'s profile, they have a Home Loan with a balance of $450,000 at 3.5% interest rate. Their monthly payment is $2,025. Would you like more details about refinancing options?`;
  }

  if (lastUserMessage.includes('insurance')) {
    return `${mockClientContext.name} currently has Life Insurance with Insurance Co, providing $500,000 in coverage. Would you like to review their policy details or discuss additional coverage options?`;
  }

  if (lastUserMessage.includes('meeting') || lastUserMessage.includes('appointment')) {
    return `${mockClientContext.name} has an upcoming Policy Review meeting scheduled for March 15, 2026. Would you like to reschedule or add a new meeting?`;
  }

  if (lastUserMessage.includes('contact') || lastUserMessage.includes('email') || lastUserMessage.includes('phone')) {
    return `You can reach ${mockClientContext.name} at:\n• Email: ${mockClientContext.email}\n• Phone: ${mockClientContext.phone}\n\nWould you like to send them a message?`;
  }

  if (lastUserMessage.includes('note') || lastUserMessage.includes('recent')) {
    return `Recent notes for ${mockClientContext.name}:\n• ${mockClientContext.recentNotes[0]}\n• ${mockClientContext.recentNotes[1]}\n\nWould you like to add a new note?`;
  }

  if (lastUserMessage.includes('summary') || lastUserMessage.includes('overview')) {
    return `Here's a quick summary of ${mockClientContext.name}:\n\n📧 ${mockClientContext.email}\n📞 ${mockClientContext.phone}\n🏠 Home Loan: $450,000 balance\n🛡️ Life Insurance: $500,000 coverage\n📅 Next Meeting: March 15, 2026\n\nWhat would you like to know more about?`;
  }

  // Default response
  return `I'd be happy to help you with information about ${mockClientContext.name}. I can help you with:

• Client contact details and status
• Mortgage and loan information
• Insurance policies and coverage
• Meeting schedules and appointments
• Notes and recent activity
• Document management

What would you like to know?`;
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return openai !== null;
}