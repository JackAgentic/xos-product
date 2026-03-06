import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export interface OpportunityFormData {
  name: string;
  type: string;
  probability: string;
  notes: string;
}

export interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityForm: OpportunityFormData;
  setOpportunityForm: (form: any) => void;
  onSubmit: (formData: OpportunityFormData) => void;
}

export function AddOpportunityModal({
  isOpen,
  onClose,
  opportunityForm,
  setOpportunityForm,
  onSubmit,
}: AddOpportunityModalProps) {
  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
    setOpportunityForm({
      name: '',
      type: '',
      probability: '',
      notes: ''
    });
  };

  const handleCreate = () => {
    // Validate required fields
    if (!opportunityForm.name || !opportunityForm.type) {
      toast.error('Please fill in all required fields', {
        description: 'Name and Type are required',
      });
      return;
    }

    onSubmit(opportunityForm);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="bg-white w-full sm:max-w-lg sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <h2 className="text-lg font-medium">Add Opportunity</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              placeholder="e.g. KiwiSaver Review 2025"
              value={opportunityForm.name}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, name: e.target.value })}
              className="w-full px-4 h-10 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
            />
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={opportunityForm.type}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, type: e.target.value })}
              className="w-full px-4 h-10 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent bg-white"
            >
              <option value="">Select type...</option>
              <option value="Mortgage">Mortgage</option>
              <option value="KiwiSaver">KiwiSaver</option>
              <option value="Insurance">Insurance</option>
              <option value="Investment">Investment</option>
              <option value="Retirement">Retirement</option>
            </select>
          </div>

          {/* Probability Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Probability (%)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              min="0"
              max="100"
              value={opportunityForm.probability}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, probability: e.target.value })}
              className="w-full px-4 h-10 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
            />
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              placeholder="Any additional notes..."
              rows={4}
              value={opportunityForm.notes}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">

          <button
            onClick={handleCancel}
            className="h-10 px-4 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="h-10 px-4 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}
