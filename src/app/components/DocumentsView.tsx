import { useState } from 'react';
import { Search, Folder, ChevronDown, ChevronRight, MoreVertical, File as FileIcon, Plus, Eye, Info, Database, Clock, Lock, Download, FileText } from 'lucide-react';
import { documentFolders } from '../data/seedData';

interface DocumentsViewProps {
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}

export function DocumentsView({
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: DocumentsViewProps) {
  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative" data-ai-section="Documents">

      {/* Documents List */}
      <div className="w-full lg:w-[400px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Documents</h2>
            <button className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        {/* Scrollable folder list area */}
        <div className="flex-1 overflow-y-auto" data-ai-section="Document List">
          <div className="p-2">{/* Folder List */}
            <div className="space-y-1">
              {documentFolders.map((folder) => (
                <div key={folder.name} data-ai-field={`folder-${folder.name}`} data-ai-label={folder.name}>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      <Folder className="w-5 h-5 text-emerald-900" />
                      <div className="flex-1">
                        <div className="font-medium">{folder.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{folder.documents.length}</span>
                      <button>
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {folder.documents.map((doc) => (
                    <div key={doc.name} className="ml-10 flex items-center gap-2 p-2 hover:bg-gray-50 rounded-sm" data-ai-field={`document-${doc.name}`} data-ai-label={doc.name}>
                      <FileIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm flex-1">{doc.name}</span>
                      <span className="text-xs text-gray-400">{doc.size}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Document Details */}
      <div className="flex-1 bg-gray-50 overflow-auto" data-ai-section="Document Details">
        <div className="p-4 sm:p-6 pb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-900 rounded-full" />
              <h3 className="text-lg font-semibold">Terms and Conditions</h3>
            </div>
            <button className="px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-900 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* Document Actions */}
          <div className="bg-white rounded-sm border border-gray-200 p-6 mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">CREATE DOCUMENT</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-3 p-4 border-2 border-emerald-900 rounded-sm hover:bg-stone-200/20">
                <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Preview</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200">
                Create
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50">
                <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Details</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200">
                Select Data
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50">
                <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Data Points</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200">
                Edit
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50">
                <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">History</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 flex items-center gap-2">
                <span>Show Variables</span>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 col-span-1">
                <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Permissions</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Empty State */}
            <div className="mt-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-sm flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h5 className="font-medium mb-2">Ready to create document</h5>
              <p className="text-sm text-gray-500">
                Click <span className="font-medium">Select Data</span> to choose your data sources, populate Data Points, then click <span className="font-medium">Create</span> to generate the document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}