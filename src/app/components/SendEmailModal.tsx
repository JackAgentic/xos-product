import { useState } from 'react';
import { motion } from 'motion/react';
import { MailPlus, FilePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

export function SendEmailModal({ isOpen, onClose, clientId }: SendEmailModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTo(''); setSubject(''); setMessage('');
  };

  const handleSubmit = async () => {
    if (!subject || !message) {
      toast.error('Please fill in required fields', { description: 'Subject and Message are required' });
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/communications', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId || null,
          subject,
          preview: message.slice(0, 200),
          type: 'email',
        }),
      });
      toast.success('Email logged', { description: `"${subject}" ${to ? `to ${to}` : ''}` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log email');
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
        className="bg-white w-full sm:max-w-2xl sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-sm flex items-center justify-center">
              <MailPlus className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-medium">Send Email</h2>
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
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="client@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <FilePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS (max 10MB)</p>
            </div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Email
          </button>
        </div>
      </motion.div>
    </div>
  );
}
