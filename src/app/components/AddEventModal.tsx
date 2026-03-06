import { motion } from 'motion/react';
import { CalendarPlus, X } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
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
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2E9E4] rounded-sm flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-[#0B3D2E]" />
            </div>
            <h2 className="text-lg font-medium">Schedule Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Review Meeting"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>1.5 hours</option>
              <option>2 hours</option>
              <option>Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location / Meeting Link
            </label>
            <input
              type="text"
              placeholder="e.g. Office or Zoom link"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add meeting agenda or notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium bg-[#0B3D2E] text-white rounded-sm hover:bg-[#4f7684] transition-colors"
          >
            Schedule Meeting
          </button>
        </div>
      </motion.div>
    </div>
  );
}
