import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartWidgetConfig } from '../data/dashboardConfig';

interface ChartWidgetProps {
  config: ChartWidgetConfig;
  data: any[];
  compact?: boolean;
  idPrefix?: string;
}

export function ChartWidget({ config, data, compact = false, idPrefix = '' }: ChartWidgetProps) {
  const gradientId = `${idPrefix}gradient-${config.id}`;
  const primaryColor = config.series[0]?.color || config.colors.primary || '#0B3D2E';

  const areaHeight = compact ? 200 : 300;
  const barHeight = compact ? 180 : 250;
  const lineHeight = compact ? 200 : 300;

  const fontSize = compact ? '10px' : '12px';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {config.chartType === 'area' && (
        <ResponsiveContainer width="100%" height={areaHeight}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={data[0] && 'month' in data[0] ? 'month' : 'day'} stroke="#6b7280" style={{ fontSize }} />
            <YAxis stroke="#6b7280" style={{ fontSize }} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value: any) => `$${value.toLocaleString()}`} />
            {config.series.filter(s => s.visible).map((s, i) => (
              i === 0
                ? <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
                : <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {config.chartType === 'bar' && (
        <ResponsiveContainer width="100%" height={barHeight}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={data[0] && 'day' in data[0] ? 'day' : 'month'} stroke="#6b7280" style={{ fontSize }} />
            <YAxis stroke="#6b7280" style={{ fontSize }} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            {config.series.filter(s => s.visible).map(s => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {config.chartType === 'line' && (
        <ResponsiveContainer width="100%" height={lineHeight}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={data[0] && 'month' in data[0] ? 'month' : 'day'} stroke="#6b7280" style={{ fontSize }} />
            <YAxis stroke="#6b7280" style={{ fontSize }} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            {config.series.filter(s => s.visible).map(s => (
              <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {(config.chartType === 'donut' || config.chartType === 'pie') && (
        <div className={compact ? 'flex flex-col items-center gap-3' : 'flex items-center gap-4'}>
          <div className={compact ? 'w-[150px] h-[150px]' : 'w-[200px] h-[200px] shrink-0'}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={config.chartType === 'donut' ? (compact ? 40 : 60) : 0}
                outerRadius={compact ? 65 : 90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value} opportunities`} />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div className={compact ? 'w-full space-y-2' : 'flex-1 space-y-3'}>
            {data.map((stage: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700`}>{stage.name}</span>
                </div>
                <div className="text-right">
                  <div className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>{stage.value}</div>
                  {stage.amount != null && <div className="text-xs text-gray-500">${(stage.amount / 1000).toFixed(0)}k</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
