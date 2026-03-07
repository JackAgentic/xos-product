import { CalendarPlus, MailPlus, FilePlus, NotebookPen, ClipboardCheck, Target, Mic, Sparkles } from 'lucide-react';
import { useAIDrag } from './AIDragToInspect';

interface QuickActionsMenuProps {
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}

export function QuickActionsMenu({
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
}: QuickActionsMenuProps) {
  const { openAI } = useAIDrag();

  return (
    <div className="max-[445px]:hidden 2xl:hidden bg-white rounded-full shadow-lg border border-gray-200 p-3 flex items-center gap-2">
      <button
        onClick={() => openAI()}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-purple-100"
        aria-label="Ask AVA"
      >
        <Sparkles className="w-5 h-5 text-purple-600" />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={() => setShowAddEventModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-emerald-700/10"
        aria-label="Schedule Meeting"
      >
        <CalendarPlus className="w-5 h-5 text-emerald-700" />
      </button>

      <button
        onClick={() => setShowSendEmailModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-blue-600/10"
        aria-label="Send Email"
      >
        <MailPlus className="w-5 h-5 text-blue-600" />
      </button>

      <button
        onClick={() => setShowAddDocumentModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-indigo-600/10"
        aria-label="Add Document"
      >
        <FilePlus className="w-5 h-5 text-indigo-600" />
      </button>

      <button
        onClick={() => setShowAddNoteModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-amber-600/10"
        aria-label="Create Note"
      >
        <NotebookPen className="w-5 h-5 text-amber-600" />
      </button>

      <button
        onClick={() => setShowAddTaskModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-cyan-600/10"
        aria-label="Create Task"
      >
        <ClipboardCheck className="w-5 h-5 text-cyan-600" />
      </button>

      <button
        onClick={() => setShowAddOpportunityModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-orange-600/10"
        aria-label="Add Opportunity"
      >
        <Target className="w-5 h-5 text-orange-600" />
      </button>

      <button
        onClick={() => {/* Handle Voice Recording */ }}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-red-600/10"
        aria-label="Voice Recording"
      >
        <Mic className="w-5 h-5 text-red-600" />
      </button>

    </div>
  );
}
