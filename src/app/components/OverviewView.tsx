import { useState, useEffect } from 'react';
import { ClientHeaderCard } from './ClientHeaderCard';
import { ActivitiesCard } from './ActivitiesCard';
import { apiFetch } from '../lib/api';
import {
  DollarSign,
  FileText,
  CalendarDays,
  Target,
  ChevronRight,
  Clock,
  ClipboardList,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface ContactOnboardingData {
  contactId: number;
  contactName: string;
  contactType: string;
  items: { id: string; label: string; completed: boolean; completedDate: string | null }[];
}

interface OverviewViewProps {
  visibleModules: { onboarding: boolean; aiSummary: boolean; details: boolean; quickStats: boolean; opportunities: boolean; activities: boolean; quickActions: boolean };
  changeTab: (tab: string) => void;
  selectedClient: any;
  isViewsMenuOpen: boolean;
  setIsViewsMenuOpen: (open: boolean) => void;
  toggleModule: (moduleKey: string) => void;
  contactOnboarding: ContactOnboardingData[];
  toggleOnboardingItem: (contactId: number, itemId: string) => void;
  allOnboardingCompleted: boolean;
  clientId: number | null;
  allOpportunities: any[];
}

export function OverviewView({ visibleModules, changeTab, selectedClient, isViewsMenuOpen, setIsViewsMenuOpen, toggleModule, contactOnboarding, toggleOnboardingItem, allOnboardingCompleted, clientId, allOpportunities }: OverviewViewProps) {
  const [editingDetails, setEditingDetails] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (clientId) {
      apiFetch<any[]>(`/api/activities?clientId=${clientId}&limit=8`).then(data => {
        setActivities(data.map((a: any) => ({
          id: a.id,
          type: a.type === 'meeting' ? 'meeting' : a.type === 'email' ? 'email' : 'document',
          title: a.type === 'meeting' ? 'Meeting' : a.type === 'email' ? 'Email' : 'Document',
          subtitle: a.action || '',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }) : '',
          time: a.created_at ? new Date(a.created_at).toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
          status: new Date(a.created_at) > new Date() ? 'upcoming' : 'completed',
        })));
      }).catch(() => {});
    }
  }, [clientId]);

  const opportunities = (allOpportunities || [])
    .filter((opp: any) => opp.clientId === clientId || opp.client_id === clientId)
    .slice(0, 4)
    .map((opp: any) => ({
      id: opp.id,
      name: opp.name,
      value: typeof opp.value === 'number' ? `$${opp.value.toLocaleString()}` : opp.value || '$0',
      stage: opp.stage || 'Prospect',
      probability: opp.probability || 0,
    }));

  // Determine which module fills the hero right column (priority order)
  const rightColumnModule = visibleModules.activities ? 'activities'
    : visibleModules.opportunities ? 'opportunities'
    : visibleModules.quickStats ? 'quickStats'
    : null;

  // Remaining visible modules for the flow zone
  const flowModules: string[] = [];
  if (visibleModules.activities && rightColumnModule !== 'activities') flowModules.push('activities');
  if (visibleModules.opportunities && rightColumnModule !== 'opportunities') flowModules.push('opportunities');
  if (visibleModules.quickStats && rightColumnModule !== 'quickStats') flowModules.push('quickStats');

  // --- Reusable module renderers ---

  const renderQuickStatsHorizontal = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 h-full" data-ai-section="Quick Stats">
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between" data-ai-field="totalValue" data-ai-label="Total Value">
        <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-emerald-700" /><span className="text-xs font-medium text-gray-500">TOTAL VALUE</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="totalValueAmount" data-ai-label="Total Value Amount">$925K</div>
        <div className="text-xs text-gray-600 mt-1" data-ai-field="totalValueGrowth" data-ai-label="Value Growth">+12% growth</div>
      </div>
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between" data-ai-field="documents" data-ai-label="Documents">
        <div className="flex items-center gap-2 mb-2"><FileText className="w-5 h-5 text-indigo-600" /><span className="text-xs font-medium text-gray-500">DOCUMENTS</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="documentCount" data-ai-label="Document Count">24</div>
        <div className="text-xs text-gray-500 mt-1" data-ai-field="documentsPending" data-ai-label="Documents Pending">3 pending</div>
      </div>
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between" data-ai-field="meetings" data-ai-label="Meetings">
        <div className="flex items-center gap-2 mb-2"><CalendarDays className="w-5 h-5 text-emerald-700" /><span className="text-xs font-medium text-gray-500">MEETINGS</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="meetingCount" data-ai-label="Meeting Count">8</div>
        <div className="text-xs text-gray-500 mt-1" data-ai-field="meetingsUpcoming" data-ai-label="Meetings Upcoming">1 upcoming</div>
      </div>
    </div>
  );

  const renderQuickStatsVertical = () => (
    <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col gap-4" data-ai-section="Quick Stats">
      <div className="flex-1 flex flex-col justify-between" data-ai-field="totalValue" data-ai-label="Total Value">
        <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-emerald-700" /><span className="text-xs font-medium text-gray-500">TOTAL VALUE</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="totalValueAmount" data-ai-label="Total Value Amount">$925K</div>
        <div className="text-xs text-gray-600 mt-1" data-ai-field="totalValueGrowth" data-ai-label="Value Growth">+12% growth</div>
      </div>
      <div className="border-t border-gray-200" />
      <div className="flex-1 flex flex-col justify-between" data-ai-field="documents" data-ai-label="Documents">
        <div className="flex items-center gap-2 mb-2"><FileText className="w-5 h-5 text-indigo-600" /><span className="text-xs font-medium text-gray-500">DOCUMENTS</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="documentCount" data-ai-label="Document Count">24</div>
        <div className="text-xs text-gray-500 mt-1" data-ai-field="documentsPending" data-ai-label="Documents Pending">3 pending</div>
      </div>
      <div className="border-t border-gray-200" />
      <div className="flex-1 flex flex-col justify-between" data-ai-field="meetings" data-ai-label="Meetings">
        <div className="flex items-center gap-2 mb-2"><CalendarDays className="w-5 h-5 text-emerald-700" /><span className="text-xs font-medium text-gray-500">MEETINGS</span></div>
        <div className="text-xl font-semibold text-gray-900" data-ai-field="meetingCount" data-ai-label="Meeting Count">8</div>
        <div className="text-xs text-gray-500 mt-1" data-ai-field="meetingsUpcoming" data-ai-label="Meetings Upcoming">1 upcoming</div>
      </div>
    </div>
  );

  const renderOpportunities = (layout: 'grid' | 'scrollable') => (
    <div className={`bg-white rounded-sm border border-gray-200 p-4 ${layout === 'scrollable' ? 'h-full flex flex-col' : ''}`} data-ai-section="Opportunities">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600/10 rounded-sm flex items-center justify-center"><Target className="w-5 h-5 text-orange-600" /></div>
          <h3 className="font-semibold text-lg">OPPORTUNITIES</h3>
        </div>
        <button onClick={() => changeTab('opportunities')} className="text-sm text-emerald-900 hover:text-emerald-900 font-medium flex items-center gap-1">
          See All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className={layout === 'scrollable' ? 'flex-1 overflow-y-auto min-h-0' : ''}>
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 rounded-sm border border-gray-200 hover:border-teal-200 hover:bg-stone-200/20 transition-all cursor-pointer" data-ai-field="opportunity" data-ai-label={opp.name}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1" data-ai-field="opportunityName" data-ai-label="Opportunity Name">{opp.name}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-semibold text-emerald-900" data-ai-field="opportunityValue" data-ai-label="Value">{opp.value}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium" data-ai-field="opportunityStage" data-ai-label="Stage">{opp.stage}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${opp.probability}%` }}></div>
                </div>
                <span className="text-xs text-gray-600 font-medium" data-ai-field="opportunityProbability" data-ai-label="Probability">{opp.probability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFlowModule = (mod: string) => {
    switch (mod) {
      case 'activities': return <ActivitiesCard activities={activities} changeTab={changeTab} />;
      case 'opportunities': return renderOpportunities('grid');
      case 'quickStats': return flowModules.length === 1 ? renderQuickStatsHorizontal() : renderQuickStatsVertical();
      default: return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 pb-24 bg-gray-50" data-ai-section="Client Overview">
      <div className="max-w-7xl mx-auto relative">
        {/* ── Hero Zone ── */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6 lg:h-[calc(100vh-280px)] lg:min-h-[500px] relative isolate">
          <ClientHeaderCard
            selectedClient={selectedClient}
            allOnboardingCompleted={allOnboardingCompleted}
            visibleModules={visibleModules}
            editingDetails={editingDetails}
            setEditingDetails={setEditingDetails}
            contactOnboarding={contactOnboarding}
            toggleOnboardingItem={toggleOnboardingItem}
          />

          {/* Promoted right-column module (lg only) */}
          {rightColumnModule && (
            <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:order-3">
              {rightColumnModule === 'activities' && <ActivitiesCard activities={activities} changeTab={changeTab} />}
              {rightColumnModule === 'opportunities' && renderOpportunities('scrollable')}
              {rightColumnModule === 'quickStats' && renderQuickStatsVertical()}
            </div>
          )}

          {/* Views Menu — corner cutout */}
          <div className="absolute top-0 right-0 w-[80px] h-[80px] z-[50] pointer-events-none">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 0 L 0 1 Q 16 1 16 16 L 16 48 Q 16 64 32 64 L 64 64 Q 80 64 80 80 L 80 80 L 80 0 Z" fill="#f9fafb" />
              <path d="M 0 1 Q 16 1 16 16 L 16 48 Q 16 64 32 64 L 64 64 Q 80 64 80 80" stroke="#e5e7eb" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div className="absolute top-0 right-0 w-[64px] h-[64px] z-[60] pb-1 pl-1 flex items-center justify-center">
            <Popover.Root open={isViewsMenuOpen} onOpenChange={setIsViewsMenuOpen}>
              <Popover.Trigger asChild>
                <button
                  className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-[14px] transition-colors active:scale-95 hover:bg-gray-50 shadow-sm outline-none"
                  aria-label="Views Menu"
                >
                  <LayoutGrid className="w-5 h-5 text-emerald-900" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="bg-white rounded-sm shadow-md border border-gray-200 py-2 w-48 z-[100] animate-in fade-in-0 zoom-in-95"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</span>
                  </div>
                  <div className="py-1">
                    <button onClick={() => toggleModule('onboarding')} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                      <ClipboardList className="w-4 h-4 text-cyan-600" /> Onboarding
                      <div className={`ml-auto w-2 h-2 rounded-full ${visibleModules.onboarding ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </button>
                    <button onClick={() => toggleModule('quickStats')} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-purple-600" /> Quick Stats
                      <div className={`ml-auto w-2 h-2 rounded-full ${visibleModules.quickStats ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </button>
                    <button onClick={() => toggleModule('opportunities')} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                      <Target className="w-4 h-4 text-orange-600" /> Opportunities
                      <div className={`ml-auto w-2 h-2 rounded-full ${visibleModules.opportunities ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </button>
                    <button onClick={() => toggleModule('activities')} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-sky-600" /> Activities
                      <div className={`ml-auto w-2 h-2 rounded-full ${visibleModules.activities ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>

        {/* ── Mobile Stack — all visible modules stacked (below lg) ── */}
        <div className="lg:hidden flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
          {visibleModules.activities && <ActivitiesCard activities={activities} changeTab={changeTab} />}
          {visibleModules.quickStats && renderQuickStatsHorizontal()}
          {visibleModules.opportunities && renderOpportunities('grid')}
        </div>

        {/* ── Flow Zone — remaining lg modules flex-wrap side by side ── */}
        {flowModules.length > 0 && (
          <div className="hidden lg:flex flex-wrap gap-4 sm:gap-6 mb-4 sm:mb-6">
            {flowModules.map(mod => (
              <div key={mod} className={flowModules.length === 1 ? 'min-w-full' : 'flex-1 basis-0 min-w-[400px]'}>
                {renderFlowModule(mod)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
