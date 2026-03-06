import { useState, useEffect } from 'react';
import {
  Target,
  ChevronLeft,
  ChevronDown,
  Edit,
  CheckSquare,
  X,
  User,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { CLIENTS_LOOKUP } from '../data/clients';
import { getAdviceIcon } from '../utils/adviceUtils';
import { generateAIInsights } from '../utils/opportunityInsights';
import { opportunityActivities } from '../data/seedData';
import { QuickActionsMenu } from './QuickActionsMenu';
import { OpportunitySidebar } from './OpportunitySidebar';
import { OpportunityDetails } from './OpportunityDetails';
import { OpportunityPipeline } from './OpportunityPipeline';
import { OpportunityFilterModal, OpportunitySortModal } from './OpportunityFilterModal';

export interface OpportunitiesViewProps {
  clientId: number | null;
  showAddOpportunityModal: boolean;
  setShowAddOpportunityModal: (show: boolean) => void;
  opportunityForm: {
    name: string;
    type: string;
    probability: string;
    notes: string;
  };
  setOpportunityForm: (form: any) => void;
  allOpportunities: any[];
  addOpportunity: (formData: any) => void;
  updateOpportunity: (id: number, updates: any) => void;
  selectedOpportunityId: number | null;
  setSelectedOpportunityId: (id: number | null) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
  onClientClick: (clientId: number) => void;
}

// Helper to get icon letter from type
const getTypeIcon = (type: string) => {
  const typeMap: { [key: string]: string } = {
    'Mortgage': 'M',
    'KiwiSaver': 'K',
    'Insurance': 'I',
    'Investment': 'V',
    'Retirement': 'R'
  };
  return typeMap[type] || '';
};

const pipelineStages = [
  { name: 'Leads', date: '21 Feb' },
  { name: 'Discussions', date: '25 Feb' },
  { name: 'Proposal', date: '1 Mar' },
  { name: 'SOA', date: '5 Mar' },
  { name: 'App', date: '10 Mar' },
  { name: 'In', date: '15 Mar' },
  { name: 'Close', date: '20 Mar' },
  { name: 'Lost', date: '25 Mar' }
];

// Activity timeline data
const activities = opportunityActivities;

export function OpportunitiesView({
  clientId,
  showAddOpportunityModal,
  setShowAddOpportunityModal,
  opportunityForm,
  setOpportunityForm,
  allOpportunities,
  addOpportunity,
  updateOpportunity,
  selectedOpportunityId,
  setSelectedOpportunityId,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAIAssistantModal,
  onClientClick,
}: OpportunitiesViewProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null);
  const [pinnedOpportunities, setPinnedOpportunities] = useState<Set<number>>(new Set([0, 2]));
  const [activityTab, setActivityTab] = useState<'assigned' | 'unassigned'>('assigned');
  const [isClientDetailsExpanded, setIsClientDetailsExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [aiSummaryExpanded, setAiSummaryExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [opportunityNotes, setOpportunityNotes] = useState<Array<{text: string; timestamp: string; user: string}>>([]);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterClient, setFilterClient] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  // Sort modal state
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Watch for selectedOpportunityId changes from parent (e.g., from toast)
  useEffect(() => {
    if (selectedOpportunityId !== null) {
      setSelectedOpportunity(selectedOpportunityId);
      setMobileView('detail');
      setSelectedOpportunityId(null);
    }
  }, [selectedOpportunityId, setSelectedOpportunityId]);

  // Filter opportunities by clientId and filters
  const opportunities = allOpportunities.filter(opp => {
    if (clientId) {
      return opp.clientId === clientId;
    }
    if (filterClient !== null && opp.clientId !== filterClient) {
      return false;
    }
    if (filterType && opp.type !== filterType) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    let compareA: any;
    let compareB: any;

    switch (sortBy) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'client':
        compareA = a.client.toLowerCase();
        compareB = b.client.toLowerCase();
        break;
      case 'value':
        compareA = parseInt(a.value.replace(/[$,]/g, '')) || 0;
        compareB = parseInt(b.value.replace(/[$,]/g, '')) || 0;
        break;
      case 'probability':
        compareA = a.probability;
        compareB = b.probability;
        break;
      case 'date':
      default:
        compareA = new Date(a.date).getTime();
        compareB = new Date(b.date).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
    } else {
      return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
    }
  });

  // Auto-select first opportunity if none is selected
  useEffect(() => {
    if (opportunities.length > 0 && selectedOpportunity === null) {
      setSelectedOpportunity(opportunities[0].id);
      setMobileView('list');
    }
  }, [opportunities, selectedOpportunity]);

  const selectedOpp = opportunities.find(o => o.id === selectedOpportunity);

  // Get client name from CLIENTS_LOOKUP if not present in opportunity
  const clientName = selectedOpp
    ? (selectedOpp.client || CLIENTS_LOOKUP.find(c => c.id === selectedOpp.clientId)?.name || 'Unknown Client')
    : 'Unknown Client';

  const togglePin = (id: number) => {
    setPinnedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle editing opportunity name
  const startEditingName = () => {
    if (selectedOpp) {
      setEditedName(selectedOpp.name);
      setEditingName(true);
    }
  };

  const saveOpportunityName = () => {
    if (selectedOpp && editedName.trim()) {
      updateOpportunity(selectedOpp.id, { name: editedName.trim() });
      setEditingName(false);
    }
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setEditedName('');
  };

  // Initialize notes when opportunity changes
  useEffect(() => {
    if (selectedOpp) {
      const migratedNotes = (selectedOpp.notes || []).map((note: any) => {
        if (typeof note === 'object' && note !== null && 'text' in note) {
          return note as {text: string; timestamp: string; user: string};
        }
        return {
          text: note as string,
          timestamp: '01 Jan 2026, 12:00 PM',
          user: 'Legacy Note'
        };
      });
      setOpportunityNotes(migratedNotes);
      setEditingNotes(false);
    }
  }, [selectedOpportunity, selectedOpp]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row lg:h-full relative">
      {/* Quick Actions Menu - Only show on client sub-pages */}
      {clientId && (
        <div className="fixed bottom-6 right-6 z-40">
          <QuickActionsMenu
            setShowAddEventModal={setShowAddEventModal}
            setShowSendEmailModal={setShowSendEmailModal}
            setShowAddDocumentModal={setShowAddDocumentModal}
            setShowAddNoteModal={setShowAddNoteModal}
            setShowAddTaskModal={setShowAddTaskModal}
            setShowAddOpportunityModal={setShowAddOpportunityModal}
            setShowAIAssistantModal={setShowAIAssistantModal}
          />
        </div>
      )}

      {/* Left Sidebar - Opportunities List */}
      <OpportunitySidebar
        opportunities={opportunities}
        selectedOpportunity={selectedOpportunity}
        setSelectedOpportunity={setSelectedOpportunity}
        pinnedOpportunities={pinnedOpportunities}
        clientId={clientId}
        mobileView={mobileView}
        setMobileView={setMobileView}
        setShowAddOpportunityModal={setShowAddOpportunityModal}
        showFilterModal={() => setShowFilterModal(true)}
        showSortModal={() => setShowSortModal(true)}
        filterClient={filterClient}
        filterType={filterType}
      />

      {/* Main Content Area */}
      <div className={`
        ${mobileView === 'detail' ? 'flex flex-col overflow-y-auto' : 'hidden'} lg:flex lg:flex-col
        flex-1 lg:overflow-y-auto bg-gray-50 min-h-0 lg:h-full pb-24
      `}>
        {selectedOpp ? (
          <>
            {/* Mobile Navigation Header - Sticky */}
            <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileView('list')}
                  className="p-2 hover:bg-gray-100 rounded-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {editingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveOpportunityName();
                        if (e.key === 'Escape') cancelEditingName();
                      }}
                      className="flex-1 text-lg font-semibold bg-white border border-teal-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                      autoFocus
                    />
                    <button
                      onClick={saveOpportunityName}
                      className="p-2 text-emerald-900 hover:bg-stone-200/20 rounded-sm"
                      title="Save"
                    >
                      <CheckSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEditingName}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-sm"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>{selectedOpp.name}</span>
                    <button
                      onClick={startEditingName}
                      className="p-1.5 text-gray-400 hover:text-emerald-900 hover:bg-stone-200/20 rounded transition-colors"
                      title="Edit name"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </h2>
                )}
              </div>
            </div>

            {/* Client Details - Sticky Header */}
            <div className="hidden lg:block sticky lg:top-0 z-10 bg-white border-b border-gray-200 p-4 lg:p-6">
              <div className="w-full flex items-center justify-between gap-3">
                <button
                  onClick={() => onClientClick(selectedOpp.clientId)}
                  className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                  title="Go to client"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {clientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold">{clientName}</h2>
                    <p className="text-xs text-gray-500">Client Details</p>
                  </div>
                </button>
                <button
                  onClick={() => setIsClientDetailsExpanded(!isClientDetailsExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                  title="Toggle client details"
                >
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isClientDetailsExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {isClientDetailsExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOpp.clientDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kiwisaver calc:</span>
                    <span className="font-medium">{selectedOpp.clientDetails.kiwisaverCalc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Name:</span>
                    <span className="font-medium">{selectedOpp.clientDetails.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CRM:</span>
                    <span className="font-medium">{selectedOpp.clientDetails.crm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name (IR):</span>
                    <span className="font-medium">{selectedOpp.clientDetails.nameIR}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Birth:</span>
                    <span className="font-medium">{selectedOpp.clientDetails.dateOfBirth}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Opportunity Metadata */}
            <div className="bg-white border-b border-gray-200 p-4 lg:px-6 lg:py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`
                  px-3 py-1 rounded-sm text-sm font-medium flex items-center gap-1.5
                  ${selectedOpp.type === 'Mortgage' ? 'bg-blue-100 text-blue-700' : ''}
                  ${selectedOpp.type === 'Investment' ? 'bg-purple-100 text-purple-700' : ''}
                  ${selectedOpp.type === 'Insurance' ? 'bg-orange-100 text-orange-700' : ''}
                  ${selectedOpp.type === 'KiwiSaver' ? 'bg-green-100 text-green-700' : ''}
                  ${selectedOpp.type === 'Retirement' ? 'bg-indigo-100 text-indigo-700' : ''}
                `}>
                  {getAdviceIcon(getTypeIcon(selectedOpp.type))}
                  {selectedOpp.type}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedOpp.advisor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{selectedOpp.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Probability:</span>
                    <span className="font-semibold text-emerald-900">{selectedOpp.probability}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="w-full p-3 lg:p-6 max-w-5xl mx-auto">
              <OpportunityDetails
                selectedOpp={selectedOpp}
                editingNotes={editingNotes}
                setEditingNotes={setEditingNotes}
                opportunityNotes={opportunityNotes}
                setOpportunityNotes={setOpportunityNotes}
                aiSummaryExpanded={aiSummaryExpanded}
                setAiSummaryExpanded={setAiSummaryExpanded}
                activityTab={activityTab}
                setActivityTab={setActivityTab}
                generateAIInsights={generateAIInsights}
                activities={activities}
              />

              <OpportunityPipeline
                stages={pipelineStages}
                probability={selectedOpp.probability}
                currentStage={selectedOpp.stage}
              />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an opportunity to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <OpportunityFilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        filterClient={filterClient}
        setFilterClient={setFilterClient}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      {/* Sort Modal */}
      <OpportunitySortModal
        showSortModal={showSortModal}
        setShowSortModal={setShowSortModal}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
}
