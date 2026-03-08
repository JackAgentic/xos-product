import { CalendarPlus, MailPlus, FilePlus, NotebookPen, ClipboardCheck, Target, Mic, PanelRightClose } from 'lucide-react';

interface QuickActionsMenuProps {
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  onCollapse?: () => void;
}

export function QuickActionsMenu({
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  onCollapse,
}: QuickActionsMenuProps) {
  return (
    <div className="max-[445px]:hidden bg-white rounded-full shadow-lg border border-gray-200 h-14 px-2 flex items-center gap-1">
      <button
        onClick={() => setShowAddEventModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-emerald-700/10 text-emerald-700"
        aria-label="Schedule Meeting"
      >
        <CalendarPlus className="w-5 h-5 text-emerald-700" />
      </button>

      <button
        onClick={() => setShowSendEmailModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-blue-600/10 text-blue-600"
        aria-label="Send Email"
      >
        <MailPlus className="w-5 h-5 text-blue-600" />
      </button>

      <button
        onClick={() => setShowAddDocumentModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-indigo-600/10 text-indigo-600"
        aria-label="Add Document"
      >
        <FilePlus className="w-5 h-5 text-indigo-600" />
      </button>

      <button
        onClick={() => setShowAddNoteModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-amber-600/10 text-amber-600"
        aria-label="Create Note"
      >
        <NotebookPen className="w-5 h-5 text-amber-600" />
      </button>

      <button
        onClick={() => setShowAddTaskModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-cyan-600/10 text-cyan-600"
        aria-label="Create Task"
      >
        <ClipboardCheck className="w-5 h-5 text-cyan-600" />
      </button>

      <button
        onClick={() => setShowAddOpportunityModal(true)}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-orange-600/10 text-orange-600"
        aria-label="Add Opportunity"
      >
        <Target className="w-5 h-5 text-orange-600" />
      </button>

      <button
        onClick={() => {/* Handle Voice Recording */ }}
        className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-red-600/10 text-red-600"
        aria-label="Voice Recording"
      >
        <Mic className="w-5 h-5 text-red-600" />
      </button>

      {onCollapse && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={onCollapse}
            className="flex items-center justify-center transition-all active:scale-95 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Collapse Actions"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </>
      )}

    </div>
  );
}
