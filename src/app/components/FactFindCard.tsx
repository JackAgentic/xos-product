import { ClipboardList, ChevronRight } from 'lucide-react';

interface FactFindItem {
  id: number;
  label: string;
  completed: boolean;
  completedDate?: string;
}

interface FactFindCardProps {
  visibleModules: any;
  allItemsCompleted: boolean;
  factFindItems: FactFindItem[];
  factFindExpanded: boolean;
  setFactFindExpanded: (value: boolean) => void;
  toggleFactFindItem: (id: number) => void;
}

export function FactFindCard({
  visibleModules,
  allItemsCompleted,
  factFindItems,
  factFindExpanded,
  setFactFindExpanded,
  toggleFactFindItem
}: FactFindCardProps) {
  if (!visibleModules.factFind) return null;

  return (
    <div 
      className={`lg:order-2 ${
        allItemsCompleted 
          ? 'hidden lg:block lg:flex-[0] lg:w-0 lg:opacity-0 lg:overflow-hidden lg:min-w-0 lg:-mr-6' 
          : 'lg:flex-1 lg:opacity-100'
      }`}
      style={{ 
        transition: 'all 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 300ms'
      }}
    >
      <div className="bg-white rounded-sm border border-gray-200 p-4 h-full flex flex-col">
        {/* Header - Expandable on small screens only */}
        <button 
          onClick={() => setFactFindExpanded(!factFindExpanded)}
          className="w-full flex items-center justify-between mb-4 lg:cursor-default flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600/10 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fact-Find Checklist</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {factFindItems.filter(i => i.completed).length} of {factFindItems.length} completed
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${factFindExpanded ? 'rotate-90' : ''}`} />
        </button>
        
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-900 h-2 rounded-full transition-all" 
              style={{ width: `${(factFindItems.filter(i => i.completed).length / factFindItems.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {Math.round((factFindItems.filter(i => i.completed).length / factFindItems.length) * 100)}%
          </span>
        </div>
        
        {/* Checklist items - Always visible on large screens, expandable on small */}
        <div className={`space-y-2 ${factFindExpanded ? 'block' : 'hidden'} lg:block flex-1 overflow-y-auto min-h-0`}>
          {factFindItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleFactFindItem(item.id)}
              className="flex items-center justify-between p-3 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.completed 
                    ? 'bg-emerald-900 border-emerald-900' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {item.completed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${item.completed ? 'text-gray-900 line-through' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </div>
              {item.completed && item.completedDate && (
                <span className="text-xs text-gray-500">{item.completedDate}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}