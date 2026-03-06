import { Clock, Calendar as CalendarIcon, FileText, Mail } from 'lucide-react';

interface Activity {
  id: number;
  type: 'meeting' | 'document' | 'email';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed';
}

interface ActivitiesCardProps {
  visibleModules: any;
  activities: Activity[];
  changeTab: (tab: string) => void;
}

export function ActivitiesCard({ visibleModules, activities, changeTab }: ActivitiesCardProps) {
  if (!visibleModules.activities) return null;

  return (
    <div className="hidden lg:block lg:flex-1 lg:order-3">
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-5 flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center">
            <Clock className="w-5 h-5 text-sky-600" />
          </div>
          <h3 className="font-semibold text-lg">ACTIVITIES</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4">
            <div className="text-xs font-medium text-gray-500 mb-3">JANUARY 2026</div>
            
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200"></div>
                )}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                    activity.status === 'upcoming' 
                      ? 'bg-stone-200/50' 
                      : 'bg-gray-100'
                  }`}>
                    {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4 text-emerald-700" />}
                    {activity.type === 'document' && <FileText className="w-4 h-4 text-indigo-600" />}
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.subtitle}</div>
                      </div>
                      {activity.status === 'upcoming' && (
                        <span className="text-xs font-medium text-emerald-900 bg-stone-200/20 px-2 py-1 rounded">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.date} • {activity.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => changeTab('communication')}
          className="w-full mt-4 pt-4 border-t border-gray-200 text-sm text-emerald-900 hover:text-emerald-900 font-medium flex-shrink-0"
        >
          View All Activities
        </button>
      </div>
    </div>
  );
}