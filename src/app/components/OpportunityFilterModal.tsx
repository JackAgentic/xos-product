import { motion } from 'motion/react';
import {
  X,
  Filter,
  ChevronsUpDown,
  ArrowUp,
} from 'lucide-react';
import { CLIENTS_LOOKUP } from '../data/clients';

export interface OpportunityFilterModalProps {
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  filterClient: number | null;
  setFilterClient: (client: number | null) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

export interface OpportunitySortModalProps {
  showSortModal: boolean;
  setShowSortModal: (show: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export function OpportunityFilterModal({
  showFilterModal,
  setShowFilterModal,
  filterClient,
  setFilterClient,
  filterType,
  setFilterType,
}: OpportunityFilterModalProps) {
  if (!showFilterModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="bg-white w-full sm:max-w-md sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2E9E4] rounded-sm flex items-center justify-center">
              <Filter className="w-5 h-5 text-[#0B3D2E]" />
            </div>
            <h2 className="text-lg font-medium">Filter Opportunities</h2>
          </div>
          <button
            onClick={() => setShowFilterModal(false)}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Client
            </label>
            <select
              value={filterClient === null ? '' : filterClient}
              onChange={(e) => setFilterClient(e.target.value === '' ? null : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            >
              <option value="">All Clients</option>
              {CLIENTS_LOOKUP.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Opportunity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            >
              <option value="">All Types</option>
              <option value="Mortgage">Mortgage</option>
              <option value="KiwiSaver">KiwiSaver</option>
              <option value="Insurance">Insurance</option>
              <option value="Investment">Investment</option>
              <option value="Retirement">Retirement</option>
            </select>
          </div>

          {/* Active Filters Summary */}
          {(filterClient !== null || filterType) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filterClient !== null && (
                  <div className="px-3 py-1 bg-[#F2E9E4] text-[#0B3D2E] rounded-full text-sm flex items-center gap-2">
                    <span>{CLIENTS_LOOKUP.find(c => c.id === filterClient)?.name}</span>
                    <button
                      onClick={() => setFilterClient(null)}
                      className="hover:bg-[#0B3D2E] hover:text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filterType && (
                  <div className="px-3 py-1 bg-[#F2E9E4] text-[#0B3D2E] rounded-full text-sm flex items-center gap-2">
                    <span>{filterType}</span>
                    <button
                      onClick={() => setFilterType('')}
                      className="hover:bg-[#0B3D2E] hover:text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">

          <button
            onClick={() => {
              setFilterClient(null);
              setFilterType('');
            }}
            className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilterModal(false)}
            className="px-4 py-1.5 text-sm font-medium bg-[#0B3D2E] text-white rounded-sm hover:bg-[#4f7684] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function OpportunitySortModal({
  showSortModal,
  setShowSortModal,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: OpportunitySortModalProps) {
  if (!showSortModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="bg-white w-full sm:max-w-md sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2E9E4] rounded-sm flex items-center justify-center">
              <ChevronsUpDown className="w-5 h-5 text-[#0B3D2E]" />
            </div>
            <h2 className="text-lg font-medium">Sort Opportunities</h2>
          </div>
          <button
            onClick={() => setShowSortModal(false)}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            >
              <option value="date">Date</option>
              <option value="name">Opportunity Name</option>
              <option value="client">Client Name</option>
              <option value="value">Value</option>
              <option value="probability">Probability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-4 py-3 rounded-sm border-2 transition-all ${
                  sortOrder === 'asc'
                    ? 'border-[#0B3D2E] bg-[#F2E9E4] text-[#0B3D2E]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Ascending</div>
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-4 py-3 rounded-sm border-2 transition-all ${
                  sortOrder === 'desc'
                    ? 'border-[#0B3D2E] bg-[#F2E9E4] text-[#0B3D2E]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUp className="w-5 h-5 mx-auto mb-1 rotate-180" />
                <div className="text-sm font-medium">Descending</div>
              </button>
            </div>
          </div>

          {/* Current Sort Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Sort:</div>
            <div className="px-3 py-2 bg-[#F2E9E4] text-[#0B3D2E] rounded-sm text-sm">
              {sortBy === 'date' && 'Date'}
              {sortBy === 'name' && 'Opportunity Name'}
              {sortBy === 'client' && 'Client Name'}
              {sortBy === 'value' && 'Value'}
              {sortBy === 'probability' && 'Probability'}
              {' - '}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">

          <button
            onClick={() => {
              setSortBy('date');
              setSortOrder('desc');
            }}
            className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSortModal(false)}
            className="px-4 py-1.5 text-sm font-medium bg-[#0B3D2E] text-white rounded-sm hover:bg-[#4f7684] transition-colors"
          >
            Apply Sort
          </button>
        </div>
      </motion.div>
    </div>
  );
}
