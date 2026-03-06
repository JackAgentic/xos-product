import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { adviceLabels, getAdviceIcon } from '../utils/adviceUtils';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityType: string;
}

export function NewOpportunityModal({ isOpen, onClose, opportunityType }: NewOpportunityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="bg-white w-full sm:max-w-lg sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900/10 rounded-sm flex items-center justify-center text-emerald-900">
              {opportunityType && getAdviceIcon(opportunityType)}
            </div>
            <h2 className="text-lg font-medium">
              New {opportunityType && adviceLabels[opportunityType]} Opportunity
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-sm transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opportunity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Home Loan Application"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              rows={4}
              placeholder="Add any relevant details about this opportunity..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">

          <button onClick={onClose} className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-1.5 text-sm font-medium bg-emerald-900 text-white rounded-sm hover:bg-slate-500 transition-colors">
            Create Opportunity
          </button>
        </div>
      </motion.div>
    </div>
  );
}
