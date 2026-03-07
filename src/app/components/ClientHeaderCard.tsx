import { Users, Building, Edit, ClipboardCheck, Sparkles, RefreshCw } from 'lucide-react';

interface ClientHeaderCardProps {
  selectedClient: any;
  allItemsCompleted: boolean;
  visibleModules: any;
  editingDetails: boolean;
  setEditingDetails: (value: boolean) => void;
  setFactFindModalOpen: (value: boolean) => void;
}

export function ClientHeaderCard({
  selectedClient,
  allItemsCompleted,
  visibleModules,
  editingDetails,
  setEditingDetails,
  setFactFindModalOpen
}: ClientHeaderCardProps) {
  return (
    <div 
      className={`lg:order-1 ${allItemsCompleted ? 'lg:flex-[2]' : 'lg:flex-1'}`}
      style={{ 
        transition: 'all 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 300ms'
      }}
    >
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col" data-ai-section="Client Header">
        <div className="flex items-start justify-between mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-900 rounded flex items-center justify-center">
              {selectedClient.type === 'person' ? (
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-semibold" data-ai-field="clientName" data-ai-label="Client Name" data-ai-editable="true">{selectedClient.name}</h1>
                {/* Fact-find completed icon */}
                {visibleModules.factFind && allItemsCompleted && (
                  <button 
                    onClick={() => setFactFindModalOpen(true)}
                    className="w-7 h-7 bg-stone-200/50 rounded flex items-center justify-center hover:bg-stone-200 transition-colors"
                    style={{
                      animation: 'scaleIn 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 1000ms both'
                    }}
                    title="View fact-find details"
                  >
                    <ClipboardCheck className="w-4 h-4 text-emerald-900" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  selectedClient.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-yellow-50 text-yellow-800'
                }`} data-ai-field="clientStatus" data-ai-label="Client Status">
                  {selectedClient.status === 'ACTIVE' ? 'Active' : 'Prospect'}
                </span>
                <span className="text-xs sm:text-sm text-gray-500" data-ai-field="clientId" data-ai-label="Client ID">Client ID: #HC{String(selectedClient.id).padStart(3, '0')}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setEditingDetails(!editingDetails)}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* AI Summary */}
          {visibleModules.aiSummary && (
          <div className="bg-gray-50 rounded-sm p-4 mb-6 border border-gray-200 flex flex-col" data-ai-section="AI Summary">
            <div className="flex items-start gap-3 flex-shrink-0 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">AI SUMMARY</span>
                  <button className="p-0.5 hover:bg-white/50 rounded">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-[8] flex-1" data-ai-field="aiSummaryText" data-ai-label="AI Summary Text">
                The client profile centers around a household with the primary contact being "Another Client." Although specific details about the household members remain unspecified, the primary contact serves as an essential figure in any financial planning discussions. This individual's involvement suggests a collaborative approach to managing the household's financial affairs, potentially...
              </p>
              <button className="text-sm text-gray-600 hover:text-emerald-800 font-medium mt-2 flex-shrink-0">Read more</button>
            </div>
          </div>
          )}

          {/* Client Details Grid */}
          {visibleModules.details && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" data-ai-section="Client Details">
            <div className="sm:col-span-2 md:col-span-1" data-ai-field="email" data-ai-label="Email" data-ai-editable="true">
              <div className="text-xs font-medium text-gray-500 mb-1.5">EMAIL</div>
              <div className="text-sm text-gray-900 break-all">{selectedClient.email || '—'}</div>
            </div>
            <div data-ai-field="phone" data-ai-label="Phone" data-ai-editable="true">
              <div className="text-xs font-medium text-gray-500 mb-1.5">PHONE</div>
              <div className="text-sm text-gray-900">{selectedClient.phone || '—'}</div>
            </div>
            <div data-ai-field="dateOfBirth" data-ai-label="Date of Birth" data-ai-editable="true">
              <div className="text-xs font-medium text-gray-500 mb-1.5">DATE OF BIRTH</div>
              <div className="text-sm text-gray-600">Not set</div>
            </div>
            <div data-ai-field="nationality" data-ai-label="Nationality" data-ai-editable="true">
              <div className="text-xs font-medium text-gray-500 mb-1.5">NATIONALITY</div>
              <div className="text-sm text-gray-600">Not set</div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}