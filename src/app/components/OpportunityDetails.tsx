import {
  StickyNote,
  Edit,
  CheckSquare,
  X,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  FileText,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface NoteItem {
  text: string;
  timestamp: string;
  user: string;
}

interface Activity {
  id: number;
  type: string;
  date: string;
  label: string;
  title: string;
  description: string;
  assigned: boolean;
  location?: string;
  time?: string;
}

interface AIInsights {
  summary: string;
  keyPoints: Array<{ label: string; text: string }>;
  considerations: string;
  timeline: string;
}

export interface OpportunityDetailsProps {
  selectedOpp: any;
  editingNotes: boolean;
  setEditingNotes: (editing: boolean) => void;
  opportunityNotes: NoteItem[];
  setOpportunityNotes: (notes: NoteItem[]) => void;
  aiSummaryExpanded: boolean;
  setAiSummaryExpanded: (expanded: boolean) => void;
  activityTab: 'assigned' | 'unassigned';
  setActivityTab: (tab: 'assigned' | 'unassigned') => void;
  generateAIInsights: (opp: any) => AIInsights;
  activities: Activity[];
}

export function OpportunityDetails({
  selectedOpp,
  editingNotes,
  setEditingNotes,
  opportunityNotes,
  setOpportunityNotes,
  aiSummaryExpanded,
  setAiSummaryExpanded,
  activityTab,
  setActivityTab,
  generateAIInsights,
  activities,
}: OpportunityDetailsProps) {
  const insights = generateAIInsights(selectedOpp);

  return (
    <>
      {/* AI Insights and Activities - Side by Side */}
      <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-6 mb-6">
        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-sm border border-purple-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Insights</h3>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Summary with Expandable Content */}
          <div className="relative">
            <div className={`overflow-hidden transition-all duration-300 ${aiSummaryExpanded ? 'max-h-[2000px]' : 'max-h-[280px]'}`}>
              {/* Summary */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {insights.summary}
              </p>

              {/* Key Points */}
              {insights.keyPoints && insights.keyPoints.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {insights.keyPoints.map((point: any, idx: number) => (
                      <div key={idx} className="bg-white/50 rounded-sm p-3">
                        <div className="text-xs font-semibold text-purple-700 mb-1">{point.label}</div>
                        <div className="text-sm text-gray-700">{point.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Considerations */}
              {insights.considerations && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-600" />
                    Important Considerations
                  </h4>
                  <p className="text-sm text-gray-700 bg-white/50 rounded-sm p-3">{insights.considerations}</p>
                </div>
              )}

              {/* Timeline */}
              {insights.timeline && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Expected Timeline
                  </h4>
                  <p className="text-sm text-gray-700 bg-white/50 rounded-sm p-3">{insights.timeline}</p>
                </div>
              )}
            </div>

            {/* Gradient Overlay when collapsed */}
            {!aiSummaryExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-50 via-purple-50/80 to-transparent pointer-events-none"></div>
            )}

            {/* Read More Button */}
            <button
              onClick={() => setAiSummaryExpanded(!aiSummaryExpanded)}
              className="relative w-full mt-2 pt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {aiSummaryExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read More
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Suggested Next Steps - Always Visible */}
          <div className="mt-4 pt-4 border-t border-purple-200/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">{'\u2192'}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Suggested Next Steps</h4>
            </div>
            <div className="space-y-2">
              {selectedOpp.type === 'Mortgage' && (
                <>
                  <NextStepItem text="Schedule pre-approval meeting with client" />
                  <NextStepItem text="Request recent pay slips and bank statements" />
                  <NextStepItem text="Review lending criteria with multiple banks" />
                </>
              )}
              {selectedOpp.type === 'Insurance' && (
                <>
                  <NextStepItem text="Complete needs analysis questionnaire" />
                  <NextStepItem text="Obtain quotes from 3+ providers" />
                  <NextStepItem text="Review existing policies for coverage gaps" />
                </>
              )}
              {selectedOpp.type === 'Investment' && (
                <>
                  <NextStepItem text="Assess risk tolerance and investment timeline" />
                  <NextStepItem text="Present diversified portfolio options" />
                  <NextStepItem text="Schedule follow-up to review investment goals" />
                </>
              )}
              {selectedOpp.type === 'KiwiSaver' && (
                <>
                  <NextStepItem text="Review current KiwiSaver fund performance" />
                  <NextStepItem text="Discuss contribution optimization strategies" />
                  <NextStepItem text="Evaluate fund transfer options if appropriate" />
                </>
              )}
              {selectedOpp.type === 'Retirement' && (
                <>
                  <NextStepItem text="Calculate retirement income requirements" />
                  <NextStepItem text="Review all retirement income sources" />
                  <NextStepItem text="Develop comprehensive retirement strategy document" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Activities Card */}
        <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActivityTab('assigned')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activityTab === 'assigned'
                  ? 'text-[#0B3D2E] border-b-2 border-[#0B3D2E]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setActivityTab('unassigned')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activityTab === 'unassigned'
                  ? 'text-[#0B3D2E] border-b-2 border-[#0B3D2E]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unassigned
            </button>
          </div>

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-sm flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg">ACTIVITIES</h4>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-medium text-gray-500 mb-3">FEBRUARY 2026</div>

              {activities
                .filter(a => a.assigned === (activityTab === 'assigned'))
                .map((activity, idx, arr) => (
                <div key={activity.id} className="relative">
                  {idx !== arr.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200"></div>
                  )}
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'meeting'
                        ? 'bg-[#F2E9E4]/50'
                        : 'bg-gray-100'
                    }`}>
                      {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4 text-[#0B3D2E]" />}
                      {activity.type === 'document' && <FileText className="w-4 h-4 text-gray-600" />}
                      {activity.type === 'note' && <StickyNote className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.description}</div>
                        </div>
                        {activity.type === 'meeting' && (
                          <span className="text-xs font-medium text-[#0B3D2E] bg-[#F2E9E4]/20 px-2 py-1 rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.date} {'\u2022'} {activity.time || 'No time set'}
                      </div>
                      {activity.location && (
                        <div className="text-xs text-gray-500 mt-1">
                          Location: {activity.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full mt-4 pt-4 border-t border-gray-200 text-sm text-[#0B3D2E] hover:text-[#0B3D2E] font-medium"
            >
              View All Activities
            </button>
          </div>
        </div>
      </div>

      {/* Notes Card */}
      <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Notes</h3>
          </div>
          {editingNotes ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedOpp) {
                    selectedOpp.notes = opportunityNotes.filter(note => note.text.trim() !== '');
                  }
                  setEditingNotes(false);
                  toast.success('Notes saved successfully');
                }}
                className="p-2 hover:bg-green-50 rounded-sm transition-colors text-green-600"
                title="Save"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (selectedOpp) {
                    setOpportunityNotes(selectedOpp.notes || []);
                  }
                  setEditingNotes(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            {opportunityNotes.map((note, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-start gap-2">
                  <textarea
                    value={note.text}
                    onChange={(e) => {
                      const newNotes = [...opportunityNotes];
                      newNotes[idx] = { ...newNotes[idx], text: e.target.value };
                      setOpportunityNotes(newNotes);
                    }}
                    className="flex-1 p-3 border border-gray-300 rounded-sm text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={() => {
                      const newNotes = opportunityNotes.filter((_, i) => i !== idx);
                      setOpportunityNotes(newNotes);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 pl-3">
                  {note.user} {'\u2022'} {note.timestamp}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const now = new Date();
                const timestamp = now.toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                setOpportunityNotes([...opportunityNotes, {
                  text: '',
                  timestamp: timestamp,
                  user: "Brett O'Donnell"
                }]);
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-sm text-sm text-gray-600 hover:border-[#0B3D2E] hover:text-[#0B3D2E] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {opportunityNotes.length > 0 ? (
              opportunityNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-[#0B3D2E] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2">{note.text}</p>
                      <div className="text-xs text-gray-500">
                        {note.user} {'\u2022'} {note.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic py-2">No notes added yet. Click edit to add notes.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Helper component for next step bullet points
function NextStepItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}
