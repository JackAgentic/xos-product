// Dashboard configuration types and defaults

export type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'donut';
export type MetricId = 'totalClients' | 'opportunities' | 'totalRevenue' | 'avgDealSize';

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

export interface DashboardConfig {
  widgets: WidgetConfig[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  widgets: [
    // Metric cards
    {
      id: 'metric-totalClients',
      type: 'metric',
      metricId: 'totalClients',
      label: 'Total Clients',
      visible: true,
      iconBgColor: 'bg-stone-200',
      iconColor: 'text-emerald-950',
      trendDirection: 'up',
      trendValue: '+12%',
      order: 0,
    },
    {
      id: 'metric-opportunities',
      type: 'metric',
      metricId: 'opportunities',
      label: 'Opportunities',
      visible: true,
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trendDirection: 'up',
      trendValue: '+8%',
      order: 1,
    },
    {
      id: 'metric-totalRevenue',
      type: 'metric',
      metricId: 'totalRevenue',
      label: 'Total Revenue',
      visible: true,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trendDirection: 'down',
      trendValue: '-3%',
      order: 2,
    },
    {
      id: 'metric-avgDealSize',
      type: 'metric',
      metricId: 'avgDealSize',
      label: 'Avg Deal Size',
      visible: true,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trendDirection: 'up',
      trendValue: '+15%',
      order: 3,
    },
    // Charts
    {
      id: 'chart-revenue',
      type: 'chart',
      chartType: 'area',
      title: 'Revenue Overview',
      subtitle: 'Monthly revenue vs target',
      visible: true,
      dataSource: 'revenueData',
      series: [
        { dataKey: 'revenue', color: '#0B3D2E', label: 'Revenue', visible: true },
        { dataKey: 'target', color: '#94a3b8', label: 'Target', visible: true },
      ],
      colors: { primary: '#0B3D2E', gradient: '#0B3D2E' },
      colSpan: 1,
      order: 10,
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
      subtitle: 'Weekly activity breakdown',
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
