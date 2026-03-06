import { CalendarPlus, MailPlus, FilePlus, NotebookPen, ClipboardCheck, Target, Mic, Sparkles } from 'lucide-react';

interface QuickActionsMenuProps {
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
}

export function QuickActionsMenu({
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  setShowAIAssistantModal
}: QuickActionsMenuProps) {
  return (
    <div className="max-[445px]:hidden 2xl:hidden bg-white rounded-full shadow-lg border border-gray-200 p-3 flex items-center gap-2">
      <button 
        onClick={() => setShowAddEventModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#2D6A4F]/10"
        aria-label="Schedule Meeting"
      >
        <CalendarPlus className="w-5 h-5 text-[#2D6A4F]" />
      </button>
      
      <button 
        onClick={() => setShowSendEmailModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#2563EB]/10"
        aria-label="Send Email"
      >
        <MailPlus className="w-5 h-5 text-[#2563EB]" />
      </button>
      
      <button 
        onClick={() => setShowAddDocumentModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#4F46E5]/10"
        aria-label="Add Document"
      >
        <FilePlus className="w-5 h-5 text-[#4F46E5]" />
      </button>
      
      <button 
        onClick={() => setShowAddNoteModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#D97706]/10"
        aria-label="Create Note"
      >
        <NotebookPen className="w-5 h-5 text-[#D97706]" />
      </button>
      
      <button 
        onClick={() => setShowAddTaskModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#0891B2]/10"
        aria-label="Create Task"
      >
        <ClipboardCheck className="w-5 h-5 text-[#0891B2]" />
      </button>
      
      <button 
        onClick={() => setShowAddOpportunityModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#EA580C]/10"
        aria-label="Add Opportunity"
      >
        <Target className="w-5 h-5 text-[#EA580C]" />
      </button>
      
      <button 
        onClick={() => {/* Handle Voice Recording */}}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#DC2626]/10"
        aria-label="Voice Recording"
      >
        <Mic className="w-5 h-5 text-[#DC2626]" />
      </button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />
      
      <button 
        onClick={() => setShowAIAssistantModal(true)}
        className="flex flex-col items-center gap-1 transition-all active:scale-95 p-1.5 rounded-sm hover:bg-[#9333EA]/10"
        aria-label="AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-[#9333EA]" />
      </button>
    </div>
  );
}
