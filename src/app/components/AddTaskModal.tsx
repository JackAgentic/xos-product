import { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

const TEAM_MEMBERS = [
  { id: 0, name: 'Me' },
  { id: 1, name: "Brett O'Donnell" },
  { id: 2, name: 'Steven Johnston' },
  { id: 3, name: 'Michael Chen' },
  { id: 4, name: 'Sarah Williams' },
  { id: 5, name: 'David Lee' },
  { id: 6, name: 'James Thompson' },
  { id: 7, name: 'Emma Davis' },
];

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

export function AddTaskModal({ isOpen, onClose, clientId }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignTo, setAssignTo] = useState('0');
  const [description, setDescription] = useState('');
  const [sendReminder, setSendReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle(''); setPriority('Medium'); setDueDate(''); setDueTime('');
    setAssignTo('0'); setDescription(''); setSendReminder(false);
  };

  const handleSubmit = async () => {
    if (!title) {
      toast.error('Please fill in required fields', { description: 'Task Title is required' });
      return;
    }
    setLoading(true);
    try {
      const assignedId = parseInt(assignTo);
      await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
          assignedTo: assignedId > 0 ? assignedId : null,
          clientId: clientId || null,
          sendReminder,
        }),
      });
      toast.success('Task created', { description: `"${title}" (${priority} priority)` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
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
            <div className="w-10 h-10 bg-indigo-100 rounded-sm flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium">Create Task</h2>
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
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow up with client"
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TEAM_MEMBERS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task details..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendReminder"
              checked={sendReminder}
              onChange={(e) => setSendReminder(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="sendReminder" className="text-sm text-gray-700">
              Send reminder notification
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}
