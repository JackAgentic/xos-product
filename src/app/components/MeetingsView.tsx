import { useState } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, Users, X, FileText, Shield, Target, CheckSquare, Send, Paperclip, Video, Phone, Sparkles } from 'lucide-react';

interface MeetingsViewProps {
  selectedMeeting: number;
  setSelectedMeeting: (n: number) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}

export function MeetingsView({
  selectedMeeting,
  setSelectedMeeting,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: MeetingsViewProps) {
  const meetings = [
    { id: 0, title: 'Annual KiwiSaver Review', date: 'Thu, Mar 6, 2026', time: '10:00 AM to 11:00 AM', attendees: 2 },
    { id: 1, title: 'Mortgage Pre-Approval Discussion', date: 'Thu, Mar 6, 2026', time: '2:00 PM to 2:45 PM', attendees: 1 },
    { id: 2, title: 'Insurance Proposal Presentation', date: 'Fri, Mar 7, 2026', time: '9:30 AM to 11:00 AM', attendees: 3 },
    { id: 3, title: 'Retirement Income Planning', date: 'Fri, Mar 7, 2026', time: '2:00 PM to 3:00 PM', attendees: 2 },
    { id: 4, title: 'Quarterly Portfolio Review', date: 'Mon, Mar 10, 2026', time: '10:00 AM to 10:45 AM', attendees: 1 },
    { id: 5, title: 'Estate Planning Consultation', date: 'Tue, Mar 11, 2026', time: '11:00 AM to 12:00 PM', attendees: 4 },
    { id: 6, title: 'Investment Strategy Workshop', date: 'Wed, Mar 12, 2026', time: '1:00 PM to 2:30 PM', attendees: 2 },
    { id: 7, title: 'Follow-up — Risk Assessment', date: 'Thu, Mar 13, 2026', time: '3:00 PM to 3:30 PM', attendees: 1 },
  ];

  const [activeTab, setActiveTab] = useState('meeting');

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative" data-ai-section="Meetings">

      {/* Meetings List */}
      <div className="w-full lg:w-[280px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Meetings</h2>
            <button className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" data-ai-section="Meeting List">
          <div className="p-2">
            {meetings.map((meeting, idx) => (
              <button
                key={meeting.id}
                onClick={() => setSelectedMeeting(idx)}
                data-ai-field="meetingRecord"
                data-ai-label="Meeting Record"
                data-ai-entity-id={meeting.id}
                className={`w-full p-3 mb-2 rounded-sm border text-left transition-colors ${selectedMeeting === idx
                  ? 'border-emerald-900 bg-stone-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{meeting.title}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {meeting.date}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meeting.time}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      No attendees
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="flex-1 overflow-auto" data-ai-section="Meeting Details">
        <div className="bg-stone-200/20 p-4 sm:p-6 pb-24">
          <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-900 rounded-full" />
                <h3 className="text-lg font-semibold">Meeting Notes</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meeting Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: 'meeting', label: 'Meeting', icon: CalendarIcon },
                { id: 'transcript', label: 'Transcript', icon: FileText },
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'compliance', label: 'Compliance', icon: Shield },
                { id: 'sales', label: 'Sales Coach', icon: Target },
                { id: 'actions', label: 'Actions', icon: CheckSquare },
                { id: 'mindmap', label: 'Mind Map', icon: Target },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-emerald-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Meeting Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MEETINGS</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-emerald-900 text-white rounded-sm hover:bg-emerald-900 flex items-center gap-1 text-sm">
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 text-sm">
                    Save Draft
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 text-sm flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    Attach File
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 text-sm text-red-500">
                    Cancel Meeting
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Meeting invitation not sent
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div data-ai-field="meetingTitle" data-ai-label="Meeting Title" data-ai-editable="true">
                  <label className="block text-sm font-medium mb-2">Title:</label>
                  <input
                    type="text"
                    value="Security Test"
                    onChange={() => { }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2" data-ai-field="meetingDateTime" data-ai-label="Date and Time" data-ai-editable="true">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date & Time:</label>
                    <input
                      type="text"
                      value="15/01/2026"
                      onChange={() => { }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value="23:00"
                    onChange={() => { }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm mt-6"
                  />
                  <input
                    type="text"
                    value="23:30"
                    onChange={() => { }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm mt-6"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 flex items-center gap-1 text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </button>
              </div>

              <div data-ai-field="meetingLocation" data-ai-label="Location" data-ai-editable="true">
                <label className="block text-sm font-medium mb-2">Location:</label>
                <input
                  type="text"
                  placeholder="Meeting location"
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type:</label>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border-2 border-emerald-900 text-emerald-900 rounded-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    In Person
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meeting URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://teams.microsoft..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-sm"
                  />
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-sm hover:bg-purple-600 flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4" />
                    Generate Teams Link
                  </button>
                </div>
              </div>

              <div data-ai-field="meetingAttendeesList" data-ai-label="Attendees" data-ai-editable="true">
                <label className="block text-sm font-medium mb-2">Attendees:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search contacts to add..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-sm"
                  />
                  <button className="px-3 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-900">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <button className="text-purple-600 hover:underline flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Ask AVA
                </button>
              </div>

              <div data-ai-field="meetingNotes" data-ai-label="Meeting Notes" data-ai-editable="true">
                <textarea
                  placeholder="Enter meeting invitation notes here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}