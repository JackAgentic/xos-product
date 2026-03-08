import { useState } from 'react';
import { motion } from 'motion/react';
import { FilePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

const DOC_TYPE_TO_FOLDER: Record<string, string> = {
  'Financial Statement': 'Compliance',
  'Tax Return': 'Compliance',
  'Insurance Policy': 'Insurance',
  'Contract': 'Compliance',
  'Investment Report': 'Investments',
  'ID Document': 'Identity',
  'Other': 'Other',
};

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

export function AddDocumentModal({ isOpen, onClose, clientId }: AddDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Financial Statement');
  const [description, setDescription] = useState('');
  const [confidential, setConfidential] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle(''); setDocType('Financial Statement'); setDescription(''); setConfidential(false);
  };

  const handleSubmit = async () => {
    if (!title) {
      toast.error('Please fill in required fields', { description: 'Document Title is required' });
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId || null,
          name: title,
          folder: DOC_TYPE_TO_FOLDER[docType] || 'Other',
          size: '0 KB',
          description: description || null,
          confidential,
        }),
      });
      toast.success('Document added', { description: `"${title}" (${docType})` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add document');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
              <FilePlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium">Add Document</h2>
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
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Financial Statement 2024"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Financial Statement</option>
              <option>Tax Return</option>
              <option>Insurance Policy</option>
              <option>Contract</option>
              <option>Investment Report</option>
              <option>ID Document</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-sm p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FilePlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PDF, DOC, XLS, JPG, PNG (max 25MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confidential"
              checked={confidential}
              onChange={(e) => setConfidential(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confidential" className="text-sm text-gray-700">
              Mark as confidential
            </label>
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
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload Document
          </button>
        </div>
      </motion.div>
    </div>
  );
}
