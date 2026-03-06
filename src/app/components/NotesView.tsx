import { Plus, Search, Filter, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { QuickActionsMenu } from './QuickActionsMenu';

interface NotesViewProps {
  notesTab: string;
  setNotesTab: (tab: string) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
}

export function NotesView({ 
  notesTab, 
  setNotesTab,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  setShowAIAssistantModal
}: NotesViewProps) {
  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative">
      {/* Quick Actions Menu - fixed to bottom right of viewport */}
      <div className="fixed bottom-6 right-6 z-40">
        <QuickActionsMenu 
          setShowAddEventModal={setShowAddEventModal}
          setShowSendEmailModal={setShowSendEmailModal}
          setShowAddDocumentModal={setShowAddDocumentModal}
          setShowAddNoteModal={setShowAddNoteModal}
          setShowAddTaskModal={setShowAddTaskModal}
          setShowAddOpportunityModal={setShowAddOpportunityModal}
          setShowAIAssistantModal={setShowAIAssistantModal}
        />
      </div>

      {/* Notes List */}
      <div className="w-full lg:w-[360px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Notes</h2>
            <button className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNotesTab('notes')}
              className={`flex-1 py-2 rounded-sm font-medium text-sm ${
                notesTab === 'notes'
                  ? 'bg-emerald-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setNotesTab('history')}
              className={`flex-1 py-2 rounded-sm font-medium text-sm ${
                notesTab === 'history'
                  ? 'bg-emerald-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              History
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">No notes available</p>
          </div>
        </div>
      </div>

      {/* Notes Detail */}
      <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a Note</h3>
          <p className="text-gray-500">Choose a note from the list to view its content</p>
        </div>
      </div>
    </div>
  );
}