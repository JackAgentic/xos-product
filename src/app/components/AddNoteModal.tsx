import { useState } from 'react';
import { motion } from 'motion/react';
import { NotebookPen, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

export function AddNoteModal({ isOpen, onClose, clientId }: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle(''); setCategory('General'); setContent(''); setPinned(false);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error('Please fill in required fields', { description: 'Title and Content are required' });
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/communications', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId || null,
          subject: `[${category}] ${title}`,
          preview: content.slice(0, 200),
          type: 'note',
        }),
      });
      toast.success('Note saved', { description: `"${title}" (${category})` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
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
            <div className="w-10 h-10 bg-orange-100 rounded-sm flex items-center justify-center">
              <NotebookPen className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-medium">Create Note</h2>
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
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call Summary"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>General</option>
              <option>Call Notes</option>
              <option>Meeting Notes</option>
              <option>Follow-up</option>
              <option>Important</option>
              <option>Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinNote"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="pinNote" className="text-sm text-gray-700">
              Pin this note to top
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
            className="px-4 py-2 bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Note
          </button>
        </div>
      </motion.div>
    </div>
  );
}
