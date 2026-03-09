// Dashboard configuration types and defaults

import { revenueData, pipelineData, activityTrendData, dashboardKPIs } from './seedData';

export type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'donut';
export type MetricId = 'totalClients' | 'opportunities' | 'totalRevenue' | 'avgDealSize' | 'revenueGoal' | 'pipelineHealth' | 'performanceMetrics' | 'activityMetrics' | 'customerInsights';

export interface SeriesConfig {
  dataKey: string;
  color: string;
  label: string;
  visible: boolean;
}

export interface MetricCardConfig {
  id: string;
  type: 'metric';
  metricId: MetricId;
  label: string;
  visible: boolean;
  iconBgColor: string;
  iconColor: string;
  trendDirection: 'up' | 'down';
  trendValue: string;
  order: number;
}

export interface ChartWidgetConfig {
  id: string;
  type: 'chart';
  chartType: ChartType;
  title: string;
  subtitle: string;
  visible: boolean;
  dataSource: string;
  series: SeriesConfig[];
  colors: Record<string, string>;
  colSpan: 1 | 2;
  order: number;
  dateRange?: { start: number; end: number };
}

export interface ListWidgetConfig {
  id: string;
  type: 'list';
  listType: 'meetings' | 'activity' | 'clientStatus' | 'topClients';
  title: string;
  visible: boolean;
  colSpan: 1 | 2;
  maxItems: number;
  order: number;
}

export type WidgetConfig = MetricCardConfig | ChartWidgetConfig | ListWidgetConfig;

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardLayouts {
  lg: GridLayout[];
  md: GridLayout[];
  sm: GridLayout[];
}

export interface DashboardConfig {
  version?: number;
  widgets: WidgetConfig[];
  layouts?: DashboardLayouts;
}

export const DASHBOARD_CONFIG_VERSION = 5;

export function generateDefaultLayouts(widgets: WidgetConfig[]): DashboardLayouts {
  const visible = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  const metrics = visible.filter((w): w is MetricCardConfig => w.type === 'metric');
  const flow = visible.filter(w => w.type !== 'metric');

  const lg: GridLayout[] = [];

  // Metric cards: row 0, each w=2, h=3
  metrics.forEach((m, i) => {
    lg.push({ i: m.id, x: (i * 2) % 12, y: 0, w: 2, h: 3, minW: 2, minH: 3 });
  });

  // Flow widgets: start after metric row
  let flowX = 0;
  let flowY = 3;
  flow.forEach(w => {
    const width = w.colSpan === 2 ? 8 : 4;
    const height = w.type === 'chart' ? 6 : 5;
    if (flowX + width > 12) {
      flowX = 0;
      flowY += height;
    }
    lg.push({ i: w.id, x: flowX, y: flowY, w: width, h: height, minW: 3, minH: 3 });
    flowX += width;
    if (flowX >= 12) {
      flowX = 0;
      flowY += height;
    }
  });

  // md: 6 columns
  const md: GridLayout[] = [];
  metrics.forEach((m, i) => {
    md.push({ i: m.id, x: (i * 3) % 6, y: Math.floor((i * 3) / 6) * 3, w: 3, h: 3, minW: 2, minH: 3 });
  });
  let mdY = Math.ceil(metrics.length / 2) * 3;
  flow.forEach(w => {
    const height = w.type === 'chart' ? 6 : 5;
    md.push({ i: w.id, x: 0, y: mdY, w: 6, h: height, minW: 3, minH: 3 });
    mdY += height;
  });

  // sm: 1 column
  const sm: GridLayout[] = [];
  let smY = 0;
  visible.forEach(w => {
    const height = w.type === 'metric' ? 3 : w.type === 'chart' ? 6 : 5;
    sm.push({ i: w.id, x: 0, y: smY, w: 1, h: height, minW: 1, minH: 2 });
    smY += height;
  });

  return { lg, md, sm };
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  version: DASHBOARD_CONFIG_VERSION,
  widgets: [
    // Metric cards — 5 category cards
    {
      id: 'metric-revenueGoal',
      type: 'metric',
      metricId: 'revenueGoal',
      label: 'Revenue & Goals',
      visible: true,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trendDirection: 'up',
      trendValue: '+14.2%',
      order: 0,
    },
    {
      id: 'metric-pipelineHealth',
      type: 'metric',
      metricId: 'pipelineHealth',
      label: 'Pipeline Health',
      visible: true,
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trendDirection: 'up',
      trendValue: '2.9x',
      order: 1,
    },
    {
      id: 'metric-performanceMetrics',
      type: 'metric',
      metricId: 'performanceMetrics',
      label: 'Performance',
      visible: true,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trendDirection: 'up',
      trendValue: '76.9%',
      order: 2,
    },
    {
      id: 'metric-activityMetrics',
      type: 'metric',
      metricId: 'activityMetrics',
      label: 'Activity',
      visible: true,
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trendDirection: 'up',
      trendValue: '+36.9%',
      order: 3,
    },
    {
      id: 'metric-customerInsights',
      type: 'metric',
      metricId: 'customerInsights',
      label: 'Customer Insights',
      visible: true,
      iconBgColor: 'bg-stone-200',
      iconColor: 'text-emerald-950',
      trendDirection: 'up',
      trendValue: '39.2x',
      order: 4,
    },
    // Charts
    {
      id: 'chart-revenue',
      type: 'chart',
      chartType: 'area',
      title: 'Revenue Overview (Year-on-Year Comparison)',
      subtitle: 'Comparing current revenue with the same period last year',
      visible: true,
      dataSource: 'revenueData',
      series: [
        { dataKey: 'revenue', color: '#0B3D2E', label: 'Revenue', visible: true },
        { dataKey: 'target', color: '#16a34a', label: 'Target', visible: true },
        { dataKey: 'lastYear', color: '#94a3b8', label: 'Last Year', visible: true },
      ],
      colors: { primary: '#0B3D2E', gradient: '#0B3D2E' },
      colSpan: 1,
      order: 10,
      dateRange: { start: 12, end: 24 },
    },
    {
      id: 'chart-pipeline',
      type: 'chart',
      chartType: 'donut',
      title: 'Sales Pipeline',
      subtitle: 'Opportunities by stage',
      visible: true,
      dataSource: 'pipelineData',
      series: [],
      colors: {},
      colSpan: 1,
      order: 11,
    },
    {
      id: 'chart-activityTrend',
      type: 'chart',
      chartType: 'bar',
      title: 'Activity Trend',
      subtitle: '4-week activity breakdown by type',
      visible: true,
      dataSource: 'activityTrendData',
      series: [
        { dataKey: 'meetings', color: '#081C15', label: 'Meetings', visible: true },
        { dataKey: 'calls', color: '#0B3D2E', label: 'Calls', visible: true },
        { dataKey: 'emails', color: '#94a3b8', label: 'Emails', visible: true },
      ],
      colors: {},
      colSpan: 2,
      order: 20,
    },
    // Lists
    {
      id: 'list-meetings',
      type: 'list',
      listType: 'meetings',
      title: 'Upcoming',
      visible: true,
      colSpan: 1,
      maxItems: 6,
      order: 21,
    },
    {
      id: 'list-clientStatus',
      type: 'list',
      listType: 'clientStatus',
      title: 'Client Status',
      visible: true,
      colSpan: 1,
      maxItems: 3,
      order: 30,
    },
    {
      id: 'list-recentActivity',
      type: 'list',
      listType: 'activity',
      title: 'Recent Activity',
      visible: true,
      colSpan: 2,
      maxItems: 8,
      order: 31,
    },
    {
      id: 'list-topClients',
      type: 'list',
      listType: 'topClients',
      title: 'Top Performing Clients',
      visible: true,
      colSpan: 2,
      maxItems: 5,
      order: 40,
    },
  ],
};

// ─── Dashboard Data (mutable, AI-controllable) ───────────────────────────────

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
  lastYear: number;
}

export interface PipelineStage {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface ActivityTrendPoint {
  day: string;
  meetings: number;
  calls: number;
  emails: number;
}

export interface DashboardData {
  version: number;
  revenueData: RevenueDataPoint[];
  pipelineData: PipelineStage[];
  activityTrendData: ActivityTrendPoint[];
  kpis: typeof dashboardKPIs;
}

export const DASHBOARD_DATA_VERSION = 2;

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  version: DASHBOARD_DATA_VERSION,
  revenueData: revenueData,
  pipelineData: pipelineData,
  activityTrendData: activityTrendData,
  kpis: dashboardKPIs,
};

export function resolveChartData(
  dataSource: string,
  data: DashboardData,
  dateRange?: { start: number; end: number },
): any[] {
  const sources: Record<string, any[]> = {
    revenueData: data.revenueData,
    pipelineData: data.pipelineData,
    activityTrendData: data.activityTrendData,
  };
  let result = sources[dataSource] || data.revenueData;
  if (dateRange) result = result.slice(dateRange.start, dateRange.end);
  return result;
}
