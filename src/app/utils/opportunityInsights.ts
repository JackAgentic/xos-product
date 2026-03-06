// Generate comprehensive AI insights based on opportunity type
export function generateAIInsights(opp: any) {
  const insights: { [key: string]: any } = {
    'Mortgage': {
      summary: `Based on the client's profile and current market conditions, this ${opp.value} mortgage opportunity presents a strong potential for conversion. The client's ${opp.probability}% probability indicates they are ${opp.probability > 70 ? 'highly engaged' : opp.probability > 50 ? 'moderately engaged' : 'in early stages'} in the buying process.`,
      keyPoints: [
        { label: 'Market Position', text: 'Current interest rates are favorable for first-time buyers, with competitive lending options available from multiple banks.' },
        { label: 'Client Readiness', text: 'Client has expressed clear intent and timeline. Pre-approval process should be initiated within the next 7 days to maintain momentum.' },
        { label: 'Risk Assessment', text: 'Standard income verification required. Client appears to have stable employment history based on initial discussions.' },
        { label: 'Competitive Advantage', text: 'Opportunity to present cashback offers and rate discounts available through preferred lending partners.' }
      ],
      considerations: 'Ensure all documentation is prepared in advance to expedite the approval process. Consider discussing mortgage protection insurance as an add-on service to increase overall client value.',
      timeline: 'Expected timeline: 4-6 weeks from pre-approval to settlement, depending on property purchase timeline.'
    },
    'KiwiSaver': {
      summary: `This KiwiSaver opportunity valued at ${opp.value} represents an excellent chance to optimize the client's retirement savings strategy. With a ${opp.probability}% probability, the client shows ${opp.probability > 70 ? 'strong interest' : opp.probability > 50 ? 'solid engagement' : 'initial interest'} in reviewing their current arrangement.`,
      keyPoints: [
        { label: 'Current Fund Analysis', text: 'Review of existing KiwiSaver fund shows potential for improved returns through strategic fund reallocation.' },
        { label: 'Contribution Strategy', text: 'Client may benefit from increasing voluntary contributions to maximize employer matching and government contributions.' },
        { label: 'Performance Review', text: 'Historical fund performance comparison indicates potential annual return improvement of 1-2% through fund optimization.' },
        { label: 'First Home Considerations', text: 'If applicable, discuss first home withdrawal eligibility and timing to align with property purchase goals.' }
      ],
      considerations: 'KiwiSaver switches typically take 10-15 business days. Ensure client understands there are no fees for switching between providers under current regulations.',
      timeline: 'Fund switch can be completed within 2-3 weeks. Schedule follow-up in 6 months to review performance.'
    },
    'Insurance': {
      summary: `This ${opp.value} insurance opportunity presents significant value for both client protection and practice growth. The ${opp.probability}% probability suggests the client ${opp.probability > 70 ? 'has identified clear needs' : opp.probability > 50 ? 'is actively researching options' : 'requires education on coverage benefits'}.`,
      keyPoints: [
        { label: 'Coverage Gap Analysis', text: 'Initial assessment reveals potential underinsurance in key areas. Comprehensive needs analysis will quantify exact coverage requirements.' },
        { label: 'Product Recommendations', text: 'Multi-provider quote comparison recommended to ensure competitive pricing and optimal coverage terms.' },
        { label: 'Life Stage Alignment', text: 'Client\'s current life stage and family situation indicate priority coverage areas including income protection and life insurance.' },
        { label: 'Budget Considerations', text: 'Preliminary budget discussions suggest affordable premium range. Multiple payment frequency options available to suit cash flow.' }
      ],
      considerations: 'Medical underwriting may be required depending on coverage amounts. Pre-existing conditions should be disclosed early in the process to avoid claim complications.',
      timeline: 'Quote comparison: 3-5 days. Application to policy issue: 2-4 weeks depending on underwriting requirements.'
    },
    'Investment': {
      summary: `The ${opp.value} investment opportunity indicates strong client interest in growing wealth outside of traditional retirement vehicles. With ${opp.probability}% probability, the client demonstrates ${opp.probability > 70 ? 'high commitment' : opp.probability > 50 ? 'serious consideration' : 'exploratory interest'} in establishing a diversified investment portfolio.`,
      keyPoints: [
        { label: 'Risk Profile', text: 'Detailed risk tolerance assessment required to align investment strategy with client comfort level and financial goals.' },
        { label: 'Diversification Strategy', text: 'Recommend balanced portfolio approach across multiple asset classes to optimize risk-adjusted returns.' },
        { label: 'Tax Efficiency', text: 'Consider PIE fund structures and other tax-advantaged investment vehicles to maximize after-tax returns.' },
        { label: 'Time Horizon', text: 'Client\'s investment timeline will determine appropriate asset allocation between growth and defensive assets.' }
      ],
      considerations: 'Market volatility should be discussed openly. Set realistic return expectations and establish regular review cadence. Consider dollar-cost averaging for initial investment to mitigate timing risk.',
      timeline: 'Initial portfolio setup: 1-2 weeks. First quarterly review scheduled for 90 days post-investment.'
    },
    'Retirement': {
      summary: `This comprehensive ${opp.value} retirement planning opportunity offers significant long-term value. The ${opp.probability}% probability reflects the client's ${opp.probability > 70 ? 'strong engagement' : opp.probability > 50 ? 'active planning phase' : 'initial exploration'} in securing their financial future.`,
      keyPoints: [
        { label: 'Retirement Income Gap', text: 'Detailed analysis required to calculate the difference between desired retirement lifestyle and projected income from existing sources.' },
        { label: 'Multiple Income Streams', text: 'Optimize combination of NZ Superannuation, KiwiSaver, personal savings, and investment income to create reliable cash flow.' },
        { label: 'Longevity Planning', text: 'Plan for 25-30 year retirement period with inflation protection and healthcare cost considerations.' },
        { label: 'Estate Planning', text: 'Integrate retirement planning with estate planning goals to ensure wealth transfer objectives are met.' }
      ],
      considerations: 'Retirement planning requires regular updates as legislation and personal circumstances change. Annual reviews recommended to adjust strategy as needed.',
      timeline: 'Initial comprehensive plan: 2-3 weeks. Implementation phase: 1-3 months depending on complexity.'
    }
  };

  return insights[opp.type] || {
    summary: opp.description,
    keyPoints: [],
    considerations: '',
    timeline: ''
  };
}
