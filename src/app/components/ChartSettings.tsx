import type { ChartWidgetConfig, ChartType, SeriesConfig } from '../data/dashboardConfig';

interface ChartSettingsProps {
  config: ChartWidgetConfig;
  onUpdate: (patch: Partial<ChartWidgetConfig>) => void;
}

const SWITCHABLE_TYPES: ChartType[] = ['area', 'line', 'bar'];

function AreaIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? 'text-emerald-900' : 'text-gray-400'}>
      <path d="M2 12L5 7L8 9L14 4V12H2Z" fill="currentColor" opacity={0.2} />
      <path d="M2 12L5 7L8 9L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LineIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? 'text-emerald-900' : 'text-gray-400'}>
      <path d="M2 11L5.5 6L9 8.5L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="8.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BarIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? 'text-emerald-900' : 'text-gray-400'}>
      <rect x="2" y="8" width="3" height="5" rx="0.5" fill="currentColor" />
      <rect x="6.5" y="5" width="3" height="8" rx="0.5" fill="currentColor" />
      <rect x="11" y="3" width="3" height="10" rx="0.5" fill="currentColor" />
    </svg>
  );
}

const TYPE_ICONS: Record<string, typeof AreaIcon> = {
  area: AreaIcon,
  line: LineIcon,
  bar: BarIcon,
};

export function ChartSettings({ config, onUpdate }: ChartSettingsProps) {
  const hasSeries = config.series.length > 0;
  const canSwitchType = SWITCHABLE_TYPES.includes(config.chartType);

  if (!hasSeries && !canSwitchType) return null;

  const toggleSeries = (dataKey: string) => {
    const visibleCount = config.series.filter(s => s.visible).length;
    const target = config.series.find(s => s.dataKey === dataKey);
    if (target?.visible && visibleCount <= 1) return; // don't hide last series

    onUpdate({
      series: config.series.map(s =>
        s.dataKey === dataKey ? { ...s, visible: !s.visible } : s
      ),
    });
  };

  const switchType = (type: ChartType) => {
    if (type === config.chartType) return;
    onUpdate({ chartType: type });
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
      {/* Series toggles */}
      {hasSeries && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {config.series.map((s: SeriesConfig) => (
            <button
              key={s.dataKey}
              onClick={() => toggleSeries(s.dataKey)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                s.visible
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-50 text-gray-400 line-through'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 transition-opacity"
                style={{
                  backgroundColor: s.color,
                  opacity: s.visible ? 1 : 0.3,
                }}
              />
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart type switcher */}
      {canSwitchType && (
        <div className="flex items-center gap-0.5 bg-gray-50 rounded-sm p-0.5 flex-shrink-0">
          {SWITCHABLE_TYPES.map(type => {
            const Icon = TYPE_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => switchType(type)}
                className={`p-1.5 rounded-sm transition-colors ${
                  config.chartType === type
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-100'
                }`}
                title={type.charAt(0).toUpperCase() + type.slice(1) + ' chart'}
              >
                <Icon active={config.chartType === type} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
