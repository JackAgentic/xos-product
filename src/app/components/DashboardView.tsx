import { useState, useMemo } from 'react';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Phone,
  Mail,
  Video,
  FileText,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { revenueData as seedRevenue, pipelineData as seedPipeline, activityTrendData, dashboardRecentActivities, dashboardUpcomingMeetings } from '../data/seedData';
import type { DashboardConfig, MetricCardConfig, ChartWidgetConfig, ListWidgetConfig, WidgetConfig } from '../data/dashboardConfig';

const METRIC_ICONS: Record<string, any> = {
  totalClients: Users,
  opportunities: Target,
  totalRevenue: DollarSign,
  avgDealSize: TrendingUp,
};

const DATA_SOURCES: Record<string, any[]> = {
  revenueData: seedRevenue,
  pipelineData: seedPipeline,
  activityTrendData: activityTrendData,
};

const iconMap: Record<string, any> = { video: Video, mail: Mail, file: FileText, phone: Phone, calendar: Calendar };

export function DashboardView({
  setMobileDrawerOpen,
  clients = [],
  allOpportunities = [],
  handleClientClick,
  dashboardConfig,
  onConfigChange,
}: {
  setMobileDrawerOpen: (open: boolean) => void;
  clients?: any[];
  allOpportunities?: any[];
  handleClientClick: (clientId: number) => void;
  dashboardConfig: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
}) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const revenueData = seedRevenue;
  const pipelineData = seedPipeline;
  const activityData = activityTrendData;

  // Calculate metrics
  const totalClients = clients.length;
  const activeOpportunities = allOpportunities.length;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const avgDealSize = totalRevenue / (pipelineData[4].value || 1);

  const prospectClients = clients.filter((c: any) => c.status === 'PROSPECT').length;
  const activeClients = clients.filter((c: any) => c.status === 'ACTIVE').length;
  const inactiveClients = clients.filter((c: any) => c.status === 'INACTIVE').length;

  const clientStatusData = [
    { name: 'Active', value: activeClients, color: '#16a34a' },
    { name: 'Prospect', value: prospectClients, color: '#0B3D2E' },
    { name: 'Inactive', value: inactiveClients, color: '#94a3b8' },
  ];

  const metricValues: Record<string, number> = {
    totalClients,
    opportunities: activeOpportunities,
    totalRevenue,
    avgDealSize,
  };

  const recentActivities = dashboardRecentActivities.map(a => ({ ...a, icon: iconMap[a.iconType] }));
  const upcomingMeetings = dashboardUpcomingMeetings;

  const topClients = useMemo(() => clients.slice(0, 5).map((client: any) => ({
    ...client,
    revenue: Math.floor(Math.random() * 100000) + 50000,
    deals: Math.floor(Math.random() * 10) + 1,
  })), [clients]);

  // Sort visible widgets by order
  const visibleWidgets = dashboardConfig.widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const metrics = visibleWidgets.filter((w): w is MetricCardConfig => w.type === 'metric');
  const chartsRow1 = visibleWidgets.filter(w => w.order >= 10 && w.order < 20 && w.type === 'chart') as ChartWidgetConfig[];
  const row2 = visibleWidgets.filter(w => w.order >= 20 && w.order < 30);
  const row3 = visibleWidgets.filter(w => w.order >= 30 && w.order < 40);
  const row4 = visibleWidgets.filter(w => w.order >= 40 && w.order < 50);

  function formatMetric(id: string, value: number): string {
    if (id === 'totalRevenue' || id === 'avgDealSize') return `$${(value / 1000).toFixed(0)}k`;
    return String(value);
  }

  function renderMetricCard(config: MetricCardConfig) {
    const Icon = METRIC_ICONS[config.metricId] || Users;
    const value = metricValues[config.metricId] ?? 0;
    const TrendIcon = config.trendDirection === 'up' ? ArrowUpRight : ArrowDownRight;
    const trendColor = config.trendDirection === 'up' ? 'text-green-600' : 'text-red-600';

    return (
      <div
        key={config.id}
        data-ai-section="Dashboard Metrics"
        data-ai-field={config.id}
        data-ai-label={config.label}
        data-ai-editable="true"
        className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{config.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{formatMetric(config.metricId, value)}</h3>
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              <span className={`text-sm ${trendColor} font-medium`}>{config.trendValue}</span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
          <div className={`${config.iconBgColor} rounded-sm p-3`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        </div>
      </div>
    );
  }

  function renderChartWidget(config: ChartWidgetConfig) {
    const data = DATA_SOURCES[config.dataSource] || revenueData;
    const gradientId = `gradient-${config.id}`;
    const primaryColor = config.series[0]?.color || config.colors.primary || '#0B3D2E';

    return (
      <div
        key={config.id}
        data-ai-section="Dashboard Charts"
        data-ai-field={config.id}
        data-ai-label={config.title}
        data-ai-editable="true"
        className={`bg-white rounded-sm border border-gray-200 p-6 ${config.colSpan === 2 ? 'lg:col-span-2' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {config.chartType === 'area' && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={data[0] && 'month' in data[0] ? 'month' : 'day'} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value / 1000}k`} />
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={data[0] && 'day' in data[0] ? 'day' : 'month'} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              {config.series.filter(s => s.visible).map(s => (
                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {config.chartType === 'line' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={data[0] && 'month' in data[0] ? 'month' : 'day'} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              {config.series.filter(s => s.visible).map(s => (
                <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {(config.chartType === 'donut' || config.chartType === 'pie') && (
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="40%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={config.chartType === 'donut' ? 60 : 0}
                  outerRadius={90}
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
            <div className="flex-1 space-y-3">
              {data.map((stage: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm text-gray-700">{stage.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{stage.value}</div>
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

  function renderListWidget(config: ListWidgetConfig) {
    return (
      <div
        key={config.id}
        data-ai-section="Dashboard Lists"
        data-ai-field={config.id}
        data-ai-label={config.title}
        data-ai-editable="true"
        className={`bg-white rounded-sm border border-gray-200 p-6 ${config.colSpan === 2 ? 'lg:col-span-2' : ''}`}
      >
        {config.listType === 'meetings' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <button className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.slice(0, config.maxItems).map((meeting) => (
                <div key={meeting.id} className="p-3 bg-gray-50 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{meeting.client}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{meeting.type}</p>
                    </div>
                    <Calendar className="w-4 h-4 text-emerald-900 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meeting.time}
                    </span>
                    <span>• {meeting.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {config.listType === 'clientStatus' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {clientStatusData.map((status, idx) => {
                const percentage = totalClients > 0 ? ((status.value / totalClients) * 100).toFixed(0) : '0';
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-sm text-gray-700">{status.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{status.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: status.color }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {config.listType === 'activity' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <button className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentActivities.slice(0, config.maxItems).map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`p-2 rounded-sm ${activity.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{activity.client}</p>
                        <span className="text-xs text-gray-500">• {activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{activity.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {config.listType === 'topClients' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Based on revenue and deal count</p>
              </div>
              <button className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">View All Clients</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Client</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Revenue</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Deals</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Advisor</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topClients.slice(0, config.maxItems).map((client: any) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors overflow-visible">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-emerald-950" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          client.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                          client.status === 'PROSPECT' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-semibold text-gray-900">${(client.revenue / 1000).toFixed(0)}k</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-700">{client.deals} deals</p>
                      </td>
                      <td className="py-4 overflow-visible">
                        <div className="flex items-center gap-2">
                          {client.managers?.map((manager: any, idx: number) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-medium hover:scale-110 transition-transform cursor-pointer group/avatar relative"
                            >
                              {manager.initials}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/avatar:block z-[100] bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                                {manager.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleClientClick(client.id)}
                          className="text-sm text-emerald-900 hover:text-emerald-950 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderWidget(widget: WidgetConfig) {
    switch (widget.type) {
      case 'metric': return renderMetricCard(widget);
      case 'chart': return renderChartWidget(widget);
      case 'list': return renderListWidget(widget);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50" data-ai-section="Dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="h-10 w-10 hover:bg-gray-100 rounded-sm lg:hidden flex-shrink-0 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening today.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-sm p-1">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Key Metrics Row */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map(m => renderMetricCard(m))}
            </div>
          )}

          {/* Charts Row 1 */}
          {chartsRow1.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {chartsRow1.map(c => renderChartWidget(c))}
            </div>
          )}

          {/* Row 2: Activity + Meetings */}
          {row2.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {row2.map(w => renderWidget(w))}
            </div>
          )}

          {/* Row 3: Client Status + Recent Activity */}
          {row3.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {row3.map(w => renderWidget(w))}
            </div>
          )}

          {/* Row 4: Full width widgets */}
          {row4.map(w => renderWidget(w))}
        </div>
      </div>
    </div>
  );
}
