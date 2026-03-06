import { Mail, Search, Filter, StickyNote } from 'lucide-react';
import { QuickActionsMenu } from './QuickActionsMenu';
import { communicationsData } from '../data/seedData';

interface CommunicationViewProps {
  selectedCommunication: number | null;
  setSelectedCommunication: (n: number | null) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
}

export function CommunicationView({ 
  selectedCommunication, 
  setSelectedCommunication,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  setShowAIAssistantModal
}: CommunicationViewProps) {
  const communications = [...communicationsData
  ];

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

      {/* Communications List */}
      <div className="w-full lg:w-[480px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Communication</h2>
            <button className="p-2 bg-[#0B3D2E] text-white rounded-sm hover:bg-[#081C15] transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search communications..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] text-sm"
            />
          </div>
        </div>

        {/* Communications List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {communications.map((comm) => (
              <button
                key={comm.id}
                onClick={() => setSelectedCommunication(comm.id)}
                className={`w-full p-4 rounded-sm border text-left ${
                  selectedCommunication === comm.id
                    ? 'border-[#0B3D2E] bg-[#F2E9E4]/20'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {comm.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${
                    comm.type === 'email' ? 'bg-blue-500' : 'bg-[#0B3D2E]'
                  }`}>
                    {comm.type === 'email' ? <Mail className="w-5 h-5" /> : <StickyNote className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{comm.from}</span>
                      {comm.type === 'email' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs ml-2">Sent</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">{comm.date}</div>
                    <div className="font-medium text-sm truncate mb-1">{comm.subject}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{comm.preview}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Detail */}
      <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center">
        {selectedCommunication === null ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a communication to view details</h3>
            <p className="text-gray-500">Choose an item from the list to see its content</p>
          </div>
        ) : (
          <div className="w-full h-full p-6 pb-24">
            <div className="bg-white rounded-sm border border-gray-200 p-6 max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{communications[selectedCommunication].subject}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>From: {communications[selectedCommunication].from}</span>
                  <span>•</span>
                  <span>{communications[selectedCommunication].date}</span>
                </div>
              </div>
              <div className="prose max-w-none">
                <p>{communications[selectedCommunication].preview}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}