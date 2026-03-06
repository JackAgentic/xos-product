import { motion } from 'motion/react';
import { X, CheckSquare } from 'lucide-react';
import { adviceLabels, getAdviceIcon } from '../utils/adviceUtils';

interface ClientFilterModalProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedManager: string;
  setSelectedManager: (manager: string) => void;
  managers: string[];
  statuses: string[];
  onClose: () => void;
}

export function ClientFilterModal({
  activeFilter,
  setActiveFilter,
  selectedStatuses,
  setSelectedStatuses,
  selectedManager,
  setSelectedManager,
  managers,
  statuses,
  onClose,
}: ClientFilterModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full sm:max-w-md sm:rounded-sm rounded-t-2xl max-h-[80vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-6">
          {/* Advice Type Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advice Type</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveFilter('All');
                }}
                className={`w-full px-4 py-3 rounded-sm text-left flex items-center justify-between ${
                  activeFilter === 'All'
                    ? 'bg-[#0B3D2E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>All Advice Types</span>
                {activeFilter === 'All' && <CheckSquare className="w-5 h-5" />}
              </button>

              {['M', 'K', 'I', 'V', 'R'].map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setActiveFilter(letter);
                  }}
                  className={`w-full px-4 py-3 rounded-sm text-left flex items-center justify-between ${
                    activeFilter === letter
                      ? 'bg-[#0B3D2E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#0B3D2E] text-white rounded flex items-center justify-center">
                      {getAdviceIcon(letter)}
                    </span>
                    {adviceLabels[letter]}
                  </span>
                  {activeFilter === letter && <CheckSquare className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Manager Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Client Manager</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedManager('All Managers');
                }}
                className={`w-full px-4 py-3 rounded-sm text-left flex items-center justify-between ${
                  selectedManager === 'All Managers'
                    ? 'bg-[#0B3D2E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>All Managers</span>
                {selectedManager === 'All Managers' && <CheckSquare className="w-5 h-5" />}
              </button>

              {managers.map((manager) => (
                <button
                  key={manager}
                  onClick={() => {
                    setSelectedManager(manager);
                  }}
                  className={`w-full px-4 py-3 rounded-sm text-left flex items-center justify-between ${
                    selectedManager === manager
                      ? 'bg-[#0B3D2E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{manager}</span>
                  {selectedManager === manager && <CheckSquare className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 justify-end">

          <button
            onClick={() => {
              setActiveFilter('All');
              setSelectedManager('All Managers');
            }}
            className="px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium bg-[#0B3D2E] text-white rounded-sm hover:bg-[#0B3D2E]"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
