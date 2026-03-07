import {
  Plus,
  Search,
  Filter,
  ChevronsUpDown,
} from 'lucide-react';
import { getAdviceIcon } from '../utils/adviceUtils';

export interface OpportunitySidebarProps {
  opportunities: any[];
  selectedOpportunity: number | null;
  setSelectedOpportunity: (id: number) => void;
  pinnedOpportunities: Set<number>;
  clientId: number | null;
  mobileView: 'list' | 'detail';
  setMobileView: (view: 'list' | 'detail') => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  showFilterModal: () => void;
  showSortModal: () => void;
  filterClient: number | null;
  filterType: string;
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

export function OpportunitySidebar({
  opportunities,
  selectedOpportunity,
  setSelectedOpportunity,
  pinnedOpportunities,
  clientId,
  mobileView,
  setMobileView,
  setShowAddOpportunityModal,
  showFilterModal,
  showSortModal,
  filterClient,
  filterType,
}: OpportunitySidebarProps) {
  return (
    <div className={`
      ${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex
      lg:w-64 bg-white border-r border-gray-200 flex-col
      lg:relative w-full lg:inset-auto z-40 lg:z-auto
      lg:overflow-y-auto min-h-0 lg:h-full
    `}>
      {/* Mobile List Header - Sticky */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Opportunities</h2>
        <button
          onClick={() => setShowAddOpportunityModal(true)}
          className="px-3 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Opportunities</h3>
          <button
            onClick={() => setShowAddOpportunityModal(true)}
            className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
          />
        </div>

        {/* Filter and Sort buttons */}
        {!clientId && (
          <div className="flex items-center gap-2">
            <button
              onClick={showFilterModal}
              className={`relative px-3 py-2 h-10 border rounded-sm text-sm font-medium transition-colors flex items-center justify-center flex-1 ${
                filterClient !== null || filterType
                  ? 'border-emerald-900 bg-stone-200 text-emerald-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {(filterClient !== null || filterType) && (
                <span className="w-2 h-2 bg-emerald-900 rounded-full absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              onClick={showSortModal}
              className="px-3 py-2 h-10 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center flex-1"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="p-4 border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Opportunities</h3>
          <button
            onClick={() => setShowAddOpportunityModal(true)}
            className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
          />
        </div>

        {/* Filter and Sort buttons */}
        {!clientId && (
          <div className="flex items-center gap-2">
            <button
              onClick={showFilterModal}
              className={`px-3 py-2 h-10 border rounded-sm text-sm font-medium transition-colors flex items-center justify-center relative flex-1 ${
                filterClient !== null || filterType
                  ? 'border-emerald-900 bg-stone-200 text-emerald-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {(filterClient !== null || filterType) && (
                <span className="w-2 h-2 bg-emerald-900 rounded-full absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              onClick={showSortModal}
              className="px-3 py-2 h-10 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center flex-1"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Opportunities List */}
      <div className="flex-1 overflow-y-auto" data-ai-section="Opportunities List">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            onClick={() => {
              setSelectedOpportunity(opp.id);
              setMobileView('detail');
            }}
            className={`
              p-4 border-b border-gray-200 cursor-pointer transition-colors
              ${selectedOpportunity === opp.id ? 'bg-stone-200 border-l-4 border-l-emerald-900' : 'hover:bg-gray-50'}
            `}
            data-ai-section="Opportunity Card"
            data-ai-entity-id={opp.id}
          >
            <div className="flex lg:flex-col items-start justify-between gap-2 mb-2">
              <span className={`
                px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 lg:mb-1
                ${opp.type === 'Mortgage' ? 'bg-blue-100 text-blue-700' : ''}
                ${opp.type === 'Investment' ? 'bg-purple-100 text-purple-700' : ''}
                ${opp.type === 'Insurance' ? 'bg-orange-100 text-orange-700' : ''}
              `} data-ai-field="opportunityType" data-ai-label="Type">
                {getAdviceIcon(getTypeIcon(opp.type))}
                {opp.type}
              </span>
              <h4 className="font-semibold text-sm flex-1" data-ai-field="opportunityName" data-ai-label="Opportunity Name">{opp.name}</h4>
            </div>
            {/* Show client name when viewing all opportunities */}
            {!clientId && (
              <p className="text-xs font-medium text-gray-900 mb-1" data-ai-field="clientName" data-ai-label="Client">{opp.client}</p>
            )}
            <p className="text-xs text-gray-600 mb-2" data-ai-field="advisor" data-ai-label="Advisor">{opp.advisor}</p>
            <div className="text-xs text-gray-500" data-ai-field="opportunityDate" data-ai-label="Date">{opp.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
