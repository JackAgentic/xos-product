import { useState } from 'react';
import { 
  Users, 
  Target, 
  CheckSquare, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Phone,
  Mail,
  Video,
  FileText,
  Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { revenueData as seedRevenue, pipelineData as seedPipeline, activityTrendData, dashboardRecentActivities, dashboardUpcomingMeetings } from '../data/seedData';

export function DashboardView({ 
  setMobileDrawerOpen,
  clients = [],
  allOpportunities = [],
  handleClientClick 
}: { 
  setMobileDrawerOpen: (open: boolean) => void;
  clients?: any[];
  allOpportunities?: any[];
  handleClientClick: (clientId: number) => void;
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
  
  const prospectClients = clients.filter(c => c.status === 'PROSPECT').length;
  const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
  const inactiveClients = clients.filter(c => c.status === 'INACTIVE').length;

  // Client status distribution
  const clientStatusData = [
    { name: 'Active', value: activeClients, color: '#16a34a' },
    { name: 'Prospect', value: prospectClients, color: '#0B3D2E' },
    { name: 'Inactive', value: inactiveClients, color: '#94a3b8' },
  ];

  // Recent activities
  const iconMap = { video: Video, mail: Mail, file: FileText, phone: Phone, calendar: Calendar };
  const recentActivities = dashboardRecentActivities.map(a => ({ ...a, icon: iconMap[a.iconType] }));

  // Upcoming meetings
  const upcomingMeetings = dashboardUpcomingMeetings;

  // Top performing clients
  const topClients = clients.slice(0, 5).map((client, idx) => ({
    ...client,
    revenue: Math.floor(Math.random() * 100000) + 50000,
    deals: Math.floor(Math.random() * 10) + 1,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafbfc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Mobile Burger Menu */}
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

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-sm p-1">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-white text-[#081C15] shadow-sm'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Clients */}
            <div className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <h3 className="text-3xl font-bold text-gray-900">{totalClients}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="bg-[#F2E9E4] rounded-sm p-3">
                  <Users className="w-6 h-6 text-[#081C15]" />
                </div>
              </div>
            </div>

            {/* Active Opportunities */}
            <div className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Opportunities</p>
                  <h3 className="text-3xl font-bold text-gray-900">{activeOpportunities}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+8%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-sm p-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-900">${(totalRevenue / 1000).toFixed(0)}k</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">-3%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-sm p-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Average Deal Size */}
            <div className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Deal Size</p>
                  <h3 className="text-3xl font-bold text-gray-900">${(avgDealSize / 1000).toFixed(0)}k</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+15%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-sm p-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 mt-1">Monthly revenue vs target</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B3D2E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0B3D2E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0B3D2E" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline Chart */}
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
                  <p className="text-sm text-gray-500 mt-1">Opportunities by stage</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="40%" height={250}>
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} opportunities`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {pipelineData.map((stage, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span className="text-sm text-gray-700">{stage.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{stage.value}</div>
                        <div className="text-xs text-gray-500">${(stage.amount / 1000).toFixed(0)}k</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Meetings Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Trend */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity Trend</h3>
                  <p className="text-sm text-gray-500 mt-1">Weekly activity breakdown</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="meetings" fill="#081C15" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="calls" fill="#0B3D2E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="emails" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
                <button className="text-sm text-[#0B3D2E] hover:text-[#081C15] font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-[#fafbfc] rounded-sm hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{meeting.client}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{meeting.type}</p>
                      </div>
                      <Calendar className="w-4 h-4 text-[#0B3D2E] flex-shrink-0" />
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
            </div>
          </div>

          {/* Bottom Row - Client Status & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Status Distribution */}
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Client Status</h3>
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
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%`, backgroundColor: status.color }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-[#0B3D2E] hover:text-[#081C15] font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-sm hover:bg-[#fafbfc] transition-colors cursor-pointer">
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
            </div>
          </div>

          {/* Top Performing Clients */}
          <div className="bg-white rounded-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Clients</h3>
                <p className="text-sm text-gray-500 mt-1">Based on revenue and deal count</p>
              </div>
              <button className="text-sm text-[#0B3D2E] hover:text-[#081C15] font-medium">View All Clients</button>
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
                  {topClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#fafbfc] transition-colors overflow-visible">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F2E9E4] flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-[#081C15]" />
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
                          {client.managers.map((manager: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="w-7 h-7 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center text-xs font-medium hover:scale-110 transition-transform cursor-pointer group/avatar relative"
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
                          className="text-sm text-[#0B3D2E] hover:text-[#081C15] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}