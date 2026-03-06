import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ClientHeaderCard } from './ClientHeaderCard';
import { ActivitiesCard } from './ActivitiesCard';
import { FactFindCard } from './FactFindCard';
import {
  DollarSign,
  FileText,
  CalendarDays,
  Target,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Mail,
  ClipboardCheck,
  X,
} from 'lucide-react';

interface OverviewViewProps {
  visibleModules: { factFind: boolean; aiSummary: boolean; details: boolean; quickStats: boolean; opportunities: boolean; activities: boolean; quickActions: boolean };
  changeTab: (tab: string) => void;
  selectedClient: any;
}

export function OverviewView({ visibleModules, changeTab, selectedClient }: OverviewViewProps) {
  const [editingDetails, setEditingDetails] = useState(false);
  const [factFindExpanded, setFactFindExpanded] = useState(true);
  const [factFindModalOpen, setFactFindModalOpen] = useState(false);

  const [factFindItems, setFactFindItems] = useState([
    { id: 'client-details', label: 'Client Details', completed: false, completedDate: null as string | null },
    { id: 'onboarding', label: 'Client Onboarding', completed: false, completedDate: null as string | null },
    { id: 'cdd', label: 'CDD', completed: false, progress: '0/1', completedDate: null as string | null },
    { id: 'aml', label: 'AML', completed: false, completedDate: null as string | null },
    { id: 'privacy', label: 'Privacy Consent', completed: false, completedDate: null as string | null },
    { id: 'agreement', label: 'Client Agreement', completed: false, completedDate: null as string | null },
    { id: 'disclosure', label: 'Disclosure Statement', completed: false, completedDate: null as string | null },
  ]);

  const allItemsCompleted = factFindItems.every(item => item.completed);
  const prevCompletionRef = useRef(allItemsCompleted);

  useEffect(() => {
    if (!prevCompletionRef.current && allItemsCompleted) {
      toast.success('Fact-find completed!', {
        description: 'All checklist items have been completed.',
        duration: 4000,
      });
    }
    prevCompletionRef.current = allItemsCompleted;
  }, [allItemsCompleted]);

  const toggleFactFindItem = (itemId: string) => {
    setFactFindItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedDate: !item.completed ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
            }
          : item
      )
    );
  };

  const activities = [
    { id: 1, type: 'meeting', title: 'Meeting', subtitle: 'Security Test', date: 'Jan 15', time: '11:00 PM', status: 'upcoming' },
    { id: 2, type: 'document', title: 'Document Upload', subtitle: 'Privacy Policy.pdf', date: 'Jan 10', time: '2:30 PM', status: 'completed' },
    { id: 3, type: 'email', title: 'Email Sent', subtitle: 'Investment Proposal', date: 'Jan 8', time: '9:15 AM', status: 'completed' },
  ];

  const opportunities = [
    { id: 1, name: 'Life Insurance Policy', value: '$50,000', stage: 'Proposal', probability: 75 },
    { id: 2, name: 'Investment Portfolio', value: '$125,000', stage: 'Negotiation', probability: 85 },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 pb-24 bg-gray-50">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6 lg:max-h-[600px] lg:overflow-hidden">
          <ClientHeaderCard
            selectedClient={selectedClient}
            allItemsCompleted={allItemsCompleted}
            visibleModules={visibleModules}
            editingDetails={editingDetails}
            setEditingDetails={setEditingDetails}
            setFactFindModalOpen={setFactFindModalOpen}
          />
          <ActivitiesCard visibleModules={visibleModules} activities={activities} changeTab={changeTab} />
          <FactFindCard
            visibleModules={visibleModules}
            allItemsCompleted={allItemsCompleted}
            factFindItems={factFindItems}
            factFindExpanded={factFindExpanded}
            setFactFindExpanded={setFactFindExpanded}
            toggleFactFindItem={toggleFactFindItem}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:max-h-[200px]">
          {visibleModules.quickStats && (
            <div className="md:order-1 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
                <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-[#2D6A4F]" /><span className="text-xs font-medium text-gray-500">TOTAL VALUE</span></div>
                  <div className="text-xl font-semibold text-gray-900">$175K</div>
                  <div className="text-xs text-gray-600 mt-1">+15% growth</div>
                </div>
                <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2"><FileText className="w-5 h-5 text-[#4F46E5]" /><span className="text-xs font-medium text-gray-500">DOCUMENTS</span></div>
                  <div className="text-xl font-semibold text-gray-900">24</div>
                  <div className="text-xs text-gray-500 mt-1">3 pending</div>
                </div>
                <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2"><CalendarDays className="w-5 h-5 text-[#2D6A4F]" /><span className="text-xs font-medium text-gray-500">MEETINGS</span></div>
                  <div className="text-xl font-semibold text-gray-900">8</div>
                  <div className="text-xs text-gray-500 mt-1">1 upcoming</div>
                </div>
              </div>
            </div>
          )}

          {visibleModules.activities && (
            <div className="lg:hidden md:order-2">
              <div className="bg-white rounded-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-[#0284C7]/10 rounded-sm flex items-center justify-center"><Clock className="w-5 h-5 text-[#0284C7]" /></div>
                  <h3 className="font-semibold text-lg">ACTIVITIES</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-medium text-gray-500 mb-3">JANUARY 2026</div>
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="relative">
                      {idx !== activities.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200"></div>}
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${activity.status === 'upcoming' ? 'bg-[#F2E9E4]/50' : 'bg-gray-100'}`}>
                          {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4 text-[#2D6A4F]" />}
                          {activity.type === 'document' && <FileText className="w-4 h-4 text-[#4F46E5]" />}
                          {activity.type === 'email' && <Mail className="w-4 h-4 text-[#2563EB]" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                              <div className="text-sm text-gray-600">{activity.subtitle}</div>
                            </div>
                            {activity.status === 'upcoming' && <span className="text-xs font-medium text-[#0B3D2E] bg-[#F2E9E4]/20 px-2 py-1 rounded">Upcoming</span>}
                          </div>
                          <div className="text-xs text-gray-500">{activity.date} • {activity.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => changeTab('communication')} className="w-full mt-4 pt-4 border-t border-gray-200 text-sm text-[#0B3D2E] hover:text-[#0B3D2E] font-medium">
                  View All Activities
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {visibleModules.opportunities && (
            <div className="bg-white rounded-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#EA580C]/10 rounded-sm flex items-center justify-center"><Target className="w-5 h-5 text-[#EA580C]" /></div>
                  <h3 className="font-semibold text-lg">OPPORTUNITIES</h3>
                </div>
                <button onClick={() => changeTab('opportunities')} className="text-sm text-[#0B3D2E] hover:text-[#0B3D2E] font-medium flex items-center gap-1">
                  See All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-4 rounded-sm border border-gray-200 hover:border-teal-200 hover:bg-[#F2E9E4]/20/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{opp.name}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-semibold text-[#0B3D2E]">{opp.value}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">{opp.stage}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${opp.probability}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{opp.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {factFindModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center sm:justify-center">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="bg-white w-full sm:max-w-lg sm:rounded-sm rounded-t-2xl max-h-[90vh] flex flex-col m-4 sm:m-0"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0B3D2E] rounded-full flex items-center justify-center"><ClipboardCheck className="w-6 h-6 text-white" /></div>
                <div><h2 className="text-lg font-semibold text-gray-900">Fact-Find Complete</h2><p className="text-xs text-gray-500">All items completed</p></div>
              </div>
              <button onClick={() => setFactFindModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-sm transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-3">
                {factFindItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-sm bg-[#F2E9E4]/20 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#0B3D2E] flex items-center justify-center flex-shrink-0"><span className="text-white text-xs">✓</span></div>
                      <span className="text-sm text-gray-900">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-600">{item.completedDate}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 p-6">
              <button onClick={() => setFactFindModalOpen(false)} className="w-full h-10 bg-gray-900 text-white rounded-sm hover:bg-gray-800 transition-colors font-medium">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
