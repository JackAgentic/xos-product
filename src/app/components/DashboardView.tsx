import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Activity,
  Gauge,
  Award,
  Plus,
  Eye,
  GripVertical,
} from 'lucide-react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { apiFetch } from '../lib/api';
import { topClientsData } from '../data/seedData';
import { resolveChartData, generateDefaultLayouts } from '../data/dashboardConfig';
import type { DashboardConfig, DashboardData, DashboardLayouts, MetricCardConfig, ChartWidgetConfig, ListWidgetConfig, WidgetConfig } from '../data/dashboardConfig';
import { ChartWidget } from './ChartWidget';
import { ChartSettings } from './ChartSettings';


const METRIC_ICONS: Record<string, any> = {
  totalClients: Users,
  opportunities: Target,
  totalRevenue: DollarSign,
  avgDealSize: TrendingUp,
  revenueGoal: DollarSign,
  pipelineHealth: Gauge,
  performanceMetrics: Award,
  activityMetrics: Activity,
  customerInsights: Users,
};

const iconMap: Record<string, any> = { video: Video, mail: Mail, file: FileText, phone: Phone, calendar: Calendar };

export function DashboardView({
  setMobileDrawerOpen,
  clients = [],
  allOpportunities = [],
  handleClientClick,
  dashboardConfig,
  onConfigChange,
  dashboardData,
  onDataChange,
  onNavigate,
  setShowAddOpportunityModal,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddTaskModal,
}: {
  setMobileDrawerOpen: (open: boolean) => void;
  clients?: any[];
  allOpportunities?: any[];
  handleClientClick: (clientId: number) => void;
  dashboardConfig: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
  dashboardData: DashboardData;
  onDataChange: (data: DashboardData) => void;
  onNavigate: (view: string) => void;
  setShowAddOpportunityModal: (open: boolean) => void;
  setShowAddEventModal: (open: boolean) => void;
  setShowSendEmailModal: (open: boolean) => void;
  setShowAddTaskModal: (open: boolean) => void;
}) {
  const { containerRef: gridContainerRef, width } = useContainerWidth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('year');
  const [apiDashboard, setApiDashboard] = useState<any>(null);
  const isLoading = apiDashboard === null;

  useEffect(() => {
    apiFetch<any>('/api/dashboard').then(setApiDashboard).catch(() => {});
  }, []);

  const { revenueData, pipelineData, kpis: dashboardKPIs } = dashboardData;

  const PIPELINE_COLORS: Record<string, string> = {
    Prospect: '#94a3b8',
    Active: '#0B3D2E',
    Application: '#081C15',
    Settlement: '#16a34a',
    Review: '#0ea5e9',
  };

  const apiPipeline = (apiDashboard?.pipelineData || []).map((s: any) => ({
    ...s,
    color: PIPELINE_COLORS[s.name] || '#6b7280',
  }));

  const apiRevenue = (apiDashboard?.revenueData || []).map((r: any) => ({
    ...r,
    lastYear: r.last_year ?? r.lastYear,
  }));

  // Merge API data into dashboardData so resolveChartData picks it up
  const effectiveData: DashboardData = useMemo(() => ({
    ...dashboardData,
    revenueData: apiRevenue.length > 0 ? apiRevenue : revenueData,
    pipelineData: apiPipeline.length > 0 ? apiPipeline : pipelineData,
  }), [dashboardData, apiRevenue, apiPipeline, revenueData, pipelineData]);

  // Apply time range filter to all chart widgets
  const handleTimeRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
    const dataLengths: Record<string, number> = {
      revenueData: effectiveData.revenueData.length,
      activityTrendData: effectiveData.activityTrendData.length,
    };
    const rangeSlices: Record<string, number> = { week: 1, month: 3, quarter: 6, year: 12 };
    const lastN = rangeSlices[range];

    const newConfig = {
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.map(w => {
        if (w.type !== 'chart') return w;
        const total = dataLengths[w.dataSource];
        if (!total) return w; // pipeline etc. — no time filtering
        if (lastN === 0 || lastN >= total) {
          const { dateRange: _, ...rest } = w as any;
          return rest;
        }
        return { ...w, dateRange: { start: total - lastN, end: total } };
      }),
    };
    onConfigChange(newConfig);
  };

  // Calculate metrics
  const totalClients = clients.length;

  const prospectClients = clients.filter((c: any) => c.status === 'PROSPECT').length;
  const activeClients = clients.filter((c: any) => c.status === 'ACTIVE').length;
  const inactiveClients = clients.filter((c: any) => c.status === 'INACTIVE').length;

  const clientStatusData = [
    { name: 'Active', value: activeClients, color: '#16a34a' },
    { name: 'Prospect', value: prospectClients, color: '#0B3D2E' },
    { name: 'Inactive', value: inactiveClients, color: '#94a3b8' },
  ];

  const recentActivities = useMemo(() => {
    const apiActivities = apiDashboard?.recentActivities || [];
    return apiActivities.map((a: any) => {
      const actType = (a.type || '').toLowerCase();
      const iconType = actType === 'meeting' ? 'calendar' : actType === 'email' ? 'mail' : actType === 'call' ? 'phone' : 'file';
      return {
        id: a.id,
        type: actType,
        client: a.client_name || a.client || 'Unknown',
        action: a.action || '',
        time: a.created_at ? new Date(a.created_at).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }) : '',
        icon: iconMap[iconType] || FileText,
        color: actType === 'meeting' ? 'bg-blue-50 text-blue-600' : actType === 'email' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600',
      };
    });
  }, [apiDashboard]);

  const upcomingMeetings = useMemo(() => {
    const apiMeetings = apiDashboard?.upcomingMeetings || [];
    return apiMeetings.map((m: any) => ({
      id: m.id,
      client: m.client || 'Unknown',
      type: m.title || 'Meeting',
      time: m.date ? new Date(m.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' }) : '',
      duration: m.duration ? `${m.duration} min` : '30 min',
    }));
  }, [apiDashboard]);

  const topClients = useMemo(() => {
    return clients
      .filter((c: any) => c.status === 'ACTIVE')
      .map((c: any) => ({
        ...c,
        revenue: topClientsData[c.id as number]?.revenue ?? 0,
        deals: topClientsData[c.id as number]?.deals ?? 0,
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [clients]);

  // Sort visible widgets by order
  const visibleWidgets = dashboardConfig.widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const metrics = visibleWidgets.filter((w): w is MetricCardConfig => w.type === 'metric');
  const flowWidgets = visibleWidgets.filter(w => w.type !== 'metric');

  // Grid layout state
  const layouts: DashboardLayouts = useMemo(() => {
    if (dashboardConfig.layouts) return dashboardConfig.layouts;
    return generateDefaultLayouts(dashboardConfig.widgets);
  }, [dashboardConfig]);

  const handleLayoutChange = useCallback((_currentLayout: any, allLayouts: any) => {
    onConfigChange({
      ...dashboardConfig,
      layouts: {
        lg: allLayouts.lg || [],
        md: allLayouts.md || [],
        sm: allLayouts.sm || [],
      },
    });
  }, [dashboardConfig, onConfigChange]);

  function fmtCurrency(v: number): string {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
    return `$${v.toFixed(0)}`;
  }

  function renderMetricCardSkeleton(config: MetricCardConfig) {
    return (
      <div key={config.id} className="bg-white rounded-sm border border-gray-200 p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="w-7 h-7 bg-gray-200 rounded-sm" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded mb-3" />
        <div className="space-y-1.5 mb-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-12 bg-gray-200 rounded" />
              <div className="h-3 w-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  function renderChartWidgetSkeleton(config: ChartWidgetConfig) {
    return (
      <div key={config.id} className="bg-white rounded-sm border border-gray-200 p-6 flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-56 bg-gray-200 rounded" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-sm" />
        </div>
        <div className="h-[300px] bg-gray-100 rounded-sm" />
      </div>
    );
  }

  function renderListWidgetSkeleton(config: ListWidgetConfig) {
    return (
      <div key={config.id} className="bg-white rounded-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {(config.listType === 'meetings') && (
          <div className="space-y-3">
            {Array.from({ length: config.maxItems }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-sm border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {(config.listType === 'activity') && (
          <div className="space-y-3">
            {Array.from({ length: config.maxItems }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-sm">
                <div className="w-8 h-8 bg-gray-200 rounded-sm flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-44 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {(config.listType === 'clientStatus') && (
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-8 bg-gray-200 rounded" />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2" />
                <div className="h-3 w-20 bg-gray-200 rounded mt-1" />
              </div>
            ))}
          </div>
        )}

        {(config.listType === 'topClients') && (
          <div className="mt-2">
            <div className="flex gap-4 border-b border-gray-200 pb-3 mb-3">
              {['w-16', 'w-14', 'w-16', 'w-12', 'w-14', 'w-12'].map((w, i) => (
                <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: config.maxItems }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div>
                      <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-36 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-gray-200 rounded-full" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                  <div className="h-4 w-14 bg-gray-200 rounded" />
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderMetricCard(config: MetricCardConfig) {
    const Icon = METRIC_ICONS[config.metricId] || Users;
    const TrendIcon = config.trendDirection === 'up' ? ArrowUpRight : ArrowDownRight;
    const trendColor = config.trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
    const kpi = dashboardKPIs;

    const cardContent = (): { headline: string; subMetrics: { label: string; value: string }[] } => {
      switch (config.metricId) {
        case 'revenueGoal':
          return {
            headline: fmtCurrency(kpi.revenue.totalRevenue),
            subMetrics: [
              { label: 'Target', value: fmtCurrency(kpi.revenue.totalTarget) },
              { label: 'Attainment', value: `${kpi.revenue.attainment}%` },
              { label: 'MTD', value: fmtCurrency(kpi.revenue.mtdRevenue) },
            ],
          };
        case 'pipelineHealth':
          return {
            headline: fmtCurrency(kpi.pipeline.totalPipelineValue),
            subMetrics: [
              { label: 'Coverage', value: `${kpi.pipeline.coverageRatio}x` },
              { label: 'Conversion', value: `${kpi.pipeline.conversionRate}%` },
              { label: 'Avg Cycle', value: `${kpi.pipeline.avgSalesCycle}d` },
            ],
          };
        case 'performanceMetrics':
          return {
            headline: `${kpi.performance.winRate}%`,
            subMetrics: [
              { label: 'Deal Size', value: fmtCurrency(kpi.performance.avgDealSize) },
              { label: 'Won/Lost', value: `${kpi.performance.closedWon}/${kpi.performance.closedLost}` },
              { label: 'Quota', value: `${kpi.performance.quotaAttainment}%` },
            ],
          };
        case 'activityMetrics':
          return {
            headline: `${kpi.activity.totalThisWeek}`,
            subMetrics: [
              { label: 'Meetings', value: `${kpi.activity.meetingsThisWeek}` },
              { label: 'Calls', value: `${kpi.activity.callsThisWeek}` },
              { label: 'Emails', value: `${kpi.activity.emailsThisWeek}` },
            ],
          };
        case 'customerInsights':
          return {
            headline: `${kpi.customers.ltvCacRatio}x`,
            subMetrics: [
              { label: 'Active Clients', value: `${kpi.customers.activeClients}` },
              { label: 'CAC', value: fmtCurrency(kpi.customers.cac) },
              { label: 'LTV', value: fmtCurrency(kpi.customers.avgLtv) },
            ],
          };
        default:
          return { headline: '—', subMetrics: [] };
      }
    };

    const { headline, subMetrics } = cardContent();

    const cardActions: Record<string, { label: string; icon: typeof Plus; onClick: () => void }[]> = {
      revenueGoal: [
        { label: 'Add Opportunity', icon: Plus, onClick: () => setShowAddOpportunityModal(true) },
        { label: 'View Clients', icon: Eye, onClick: () => onNavigate('clients') },
      ],
      pipelineHealth: [
        { label: 'New Opportunity', icon: Plus, onClick: () => setShowAddOpportunityModal(true) },
        { label: 'View Pipeline', icon: Eye, onClick: () => onNavigate('opportunities') },
      ],
      performanceMetrics: [
        { label: 'Log Activity', icon: Plus, onClick: () => setShowAddTaskModal(true) },
        { label: 'View Opportunities', icon: Eye, onClick: () => onNavigate('opportunities') },
      ],
      activityMetrics: [
        { label: 'Schedule Meeting', icon: Plus, onClick: () => setShowAddEventModal(true) },
        { label: 'Send Email', icon: Mail, onClick: () => setShowSendEmailModal(true) },
      ],
      customerInsights: [
        { label: 'Add Opportunity', icon: Plus, onClick: () => setShowAddOpportunityModal(true) },
        { label: 'View Clients', icon: Eye, onClick: () => onNavigate('clients') },
      ],
    };

    const actions = cardActions[config.metricId] || [];

    return (
      <div
        key={config.id}
        data-ai-section="Dashboard Metrics"
        data-ai-field={config.id}
        data-ai-label={config.label}
        data-ai-editable="true"
        className="bg-white rounded-sm border border-gray-200 p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{config.label}</p>
          <div className={`${config.iconBgColor} rounded-sm p-1.5`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{headline}</h3>
        <div className="space-y-1.5 mb-3">
          {subMetrics.map((sm) => (
            <div key={sm.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{sm.label}</span>
              <span className="text-xs font-semibold text-gray-700">{sm.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-xs ${trendColor} font-medium`}>{config.trendValue}</span>
          <span className="text-xs text-gray-400">vs prior</span>
        </div>
        {actions.length > 0 && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-1 text-[11px] whitespace-nowrap text-gray-400 hover:text-emerald-800 transition-colors"
                >
                  <ActionIcon className="w-3 h-3 flex-shrink-0" />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function updateWidget(widgetId: string, patch: Partial<ChartWidgetConfig>) {
    onConfigChange({
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.map(w =>
        w.id === widgetId && w.type === 'chart'
          ? { ...w, ...patch } as ChartWidgetConfig
          : w
      ),
    });
  }

  function renderChartWidget(config: ChartWidgetConfig) {
    const data = resolveChartData(config.dataSource, effectiveData, config.dateRange);

    return (
      <div
        key={config.id}
        data-ai-section="Dashboard Charts"
        data-ai-field={config.id}
        data-ai-label={config.title}
        data-ai-editable="true"
        className="bg-white rounded-sm border border-gray-200 p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <ChartSettings config={config} onUpdate={(patch) => updateWidget(config.id, patch)} />
        <ChartWidget config={config} data={data} />
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
        className="bg-white rounded-sm border border-gray-200 p-6"
      >
        {config.listType === 'meetings' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <button onClick={() => onNavigate('calendar')} className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.slice(0, config.maxItems).map((meeting: any) => (
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
              <button onClick={() => setShowAddTaskModal(true)} className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">Log Activity</button>
            </div>
            <div className="space-y-3">
              {recentActivities.slice(0, config.maxItems).map((activity: any) => {
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
              <button onClick={() => onNavigate('clients')} className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">View All Clients</button>
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
    if (isLoading) {
      switch (widget.type) {
        case 'metric': return renderMetricCardSkeleton(widget);
        case 'chart': return renderChartWidgetSkeleton(widget);
        case 'list': return renderListWidgetSkeleton(widget);
      }
    }
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
                onClick={() => handleTimeRange(range as any)}
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
        <div ref={gridContainerRef} className="max-w-[1600px] 2xl:max-w-none mx-auto">
          {width > 0 && (
          <ResponsiveGridLayout
            width={width}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 768, sm: 0 }}
            cols={{ lg: 12, md: 6, sm: 1 }}
            rowHeight={60}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".widget-drag-handle"
            resizeHandles={['se', 'e', 's']}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {visibleWidgets.map(w => (
              <div key={w.id} className="widget-grid-item">
                <div className="h-full flex flex-col">
                  <div className="widget-drag-handle absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {renderWidget(w)}
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
          )}
        </div>
      </div>
    </div>
  );
}
