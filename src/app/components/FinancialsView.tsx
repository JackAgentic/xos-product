import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';
import {
  Plus,
  Search,
  Archive,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Car,
  Briefcase,
  CreditCard,
  Target,
  PiggyBank,
  Building2,
  Wallet,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react';

interface FinancialSnapshot {
  id: string;
  name: string;
  date: string;
  status: 'draft' | 'in-progress' | 'completed';
  progress: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

interface AssetItem {
  id: string;
  type: string;
  description: string;
  value: string;
  ownership: string;
}

interface LiabilityItem {
  id: string;
  type: string;
  description: string;
  balance: string;
  interestRate: string;
  payment: string;
}

interface IncomeItem {
  id: string;
  source: string;
  amount: string;
  frequency: string;
}

interface ExpenseItem {
  id: string;
  category: string;
  amount: string;
  frequency: string;
}

interface GoalItem {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string;
  priority: string;
}

export function FinancialsView({
  clientId,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: {
  clientId: number | null;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}) {
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);

  const [selectedSnapshot, setSelectedSnapshot] = useState<FinancialSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [showArchive, setShowArchive] = useState(false);
  const [isAddingSnapshot, setIsAddingSnapshot] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Form data states
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>([]);
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);

  useEffect(() => {
    if (!clientId) return;
    apiFetch<any[]>(`/api/financials/snapshots?clientId=${clientId}`).then(data => {
      setSnapshots(data.map((s: any) => ({ ...s, id: String(s.id), netWorth: s.net_worth, totalAssets: s.total_assets, totalLiabilities: s.total_liabilities })));
    }).catch(() => {});
    apiFetch<any[]>(`/api/financials/assets?clientId=${clientId}`).then(data => {
      setAssets(data.map((a: any) => ({ id: String(a.id), type: a.type, description: a.description, value: a.value, ownership: a.ownership })));
    }).catch(() => {});
    apiFetch<any[]>(`/api/financials/liabilities?clientId=${clientId}`).then(data => {
      setLiabilities(data.map((l: any) => ({ id: String(l.id), type: l.type, description: l.description, balance: l.balance, interestRate: l.interest_rate, payment: l.payment })));
    }).catch(() => {});
    apiFetch<any[]>(`/api/financials/income?clientId=${clientId}`).then(data => {
      setIncomeItems(data.map((i: any) => ({ id: String(i.id), source: i.source, amount: i.amount, frequency: i.frequency })));
    }).catch(() => {});
    apiFetch<any[]>(`/api/financials/expenses?clientId=${clientId}`).then(data => {
      setExpenseItems(data.map((e: any) => ({ id: String(e.id), category: e.category, amount: e.amount, frequency: e.frequency })));
    }).catch(() => {});
    apiFetch<any[]>(`/api/financials/goals?clientId=${clientId}`).then(data => {
      setGoals(data.map((g: any) => ({ id: String(g.id), name: g.name, targetAmount: g.target_amount, targetDate: g.target_date, priority: g.priority })));
    }).catch(() => {});
  }, [clientId]);

  const tabs = [
    { id: 'assets', label: 'Assets', icon: TrendingUp },
    { id: 'liabilities', label: 'Liabilities', icon: TrendingDown },
    { id: 'income-expenses', label: 'Income & Expenses', icon: Wallet },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'summary', label: 'Net Worth', icon: DollarSign }
  ];

  const assetTypes = [
    { value: 'property', label: 'Property', icon: Home },
    { value: 'investment', label: 'Investment', icon: TrendingUp },
    { value: 'savings', label: 'Savings', icon: PiggyBank },
    { value: 'vehicle', label: 'Vehicle', icon: Car },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'other', label: 'Other', icon: Building2 }
  ];

  const liabilityTypes = [
    { value: 'mortgage', label: 'Mortgage', icon: Home },
    { value: 'loan', label: 'Loan', icon: Briefcase },
    { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
    { value: 'line-of-credit', label: 'Line of Credit', icon: Wallet },
    { value: 'other', label: 'Other', icon: Building2 }
  ];

  const handleAddSnapshot = () => {
    if (!newSnapshotName.trim()) {
      toast.error('Please enter a snapshot name');
      return;
    }

    const newSnapshot: FinancialSnapshot = {
      id: Date.now().toString(),
      name: newSnapshotName,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      progress: 0,
      netWorth: 0,
      totalAssets: 0,
      totalLiabilities: 0
    };

    setSnapshots([newSnapshot, ...snapshots]);
    setSelectedSnapshot(newSnapshot);
    setIsAddingSnapshot(false);
    setNewSnapshotName('');
    toast.success('Financial snapshot created');
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots(snapshots.filter(s => s.id !== id));
    if (selectedSnapshot?.id === id) {
      setSelectedSnapshot(null);
    }
    toast.success('Snapshot deleted');
  };

  const addAsset = () => {
    const newAsset: AssetItem = {
      id: Date.now().toString(),
      type: '',
      description: '',
      value: '',
      ownership: ''
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const updateAsset = (id: string, field: string, value: string) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addLiability = () => {
    const newLiability: LiabilityItem = {
      id: Date.now().toString(),
      type: '',
      description: '',
      balance: '',
      interestRate: '',
      payment: ''
    };
    setLiabilities([...liabilities, newLiability]);
  };

  const removeLiability = (id: string) => {
    setLiabilities(liabilities.filter(l => l.id !== id));
  };

  const updateLiability = (id: string, field: string, value: string) => {
    setLiabilities(liabilities.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addIncome = () => {
    const newIncome: IncomeItem = {
      id: Date.now().toString(),
      source: '',
      amount: '',
      frequency: 'monthly'
    };
    setIncomeItems([...incomeItems, newIncome]);
  };

  const removeIncome = (id: string) => {
    setIncomeItems(incomeItems.filter(i => i.id !== id));
  };

  const updateIncome = (id: string, field: string, value: string) => {
    setIncomeItems(incomeItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      category: '',
      amount: '',
      frequency: 'monthly'
    };
    setExpenseItems([...expenseItems, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenseItems(expenseItems.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, field: string, value: string) => {
    setExpenseItems(expenseItems.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addGoal = () => {
    const newGoal: GoalItem = {
      id: Date.now().toString(),
      name: '',
      targetAmount: '',
      targetDate: '',
      priority: 'medium'
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: string, value: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <Edit2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    const totalAssets = assets.reduce((sum, asset) => {
      const value = parseFloat(asset.value.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + value;
    }, 0);

    const totalLiabilities = liabilities.reduce((sum, liability) => {
      const value = parseFloat(liability.balance.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + value;
    }, 0);

    const netWorth = totalAssets - totalLiabilities;

    return { totalAssets, totalLiabilities, netWorth };
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative" data-ai-section="Financials">

      {/* Left Sidebar - Snapshots List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full" data-ai-section="Financial Snapshots">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Financial Snapshots</h2>
            <button
              onClick={() => setIsAddingSnapshot(true)}
              className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search snapshots..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        {/* Add Snapshot Form */}
        {isAddingSnapshot && (
          <div className="p-4 border-b border-gray-200 bg-stone-200">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Snapshot Name
              </label>
              <input
                type="text"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                placeholder="e.g., Q2 2026 Review"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddSnapshot}
                className="flex-1 px-3 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors text-sm font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsAddingSnapshot(false);
                  setNewSnapshotName('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto">
          {snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-4">No financial snapshots found</p>
              <button
                onClick={() => setIsAddingSnapshot(true)}
                className="text-emerald-900 hover:text-emerald-950 text-sm font-medium"
              >
                Create your first snapshot
              </button>
            </div>
          ) : (
            <div className="p-2">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  onClick={() => setSelectedSnapshot(snapshot)}
                  className={`p-3 mb-2 rounded-sm border cursor-pointer transition-colors relative ${selectedSnapshot?.id === snapshot.id
                    ? 'border-emerald-900 bg-stone-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  data-ai-field="snapshotCard"
                  data-ai-label={`Snapshot: ${snapshot.name}`}
                >
                  {/* Action Menu */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(showActionMenu === snapshot.id ? null : snapshot.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {showActionMenu === snapshot.id && (
                      <div className="absolute top-8 right-0 w-40 bg-white border border-gray-200 rounded-sm shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSnapshot(snapshot.id);
                            setShowActionMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pr-6">
                    <div className="font-medium text-gray-900 mb-1" data-ai-field="snapshotName" data-ai-label="Snapshot Name">{snapshot.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2" data-ai-field="snapshotDate" data-ai-label="Snapshot Date">
                      <Calendar className="w-3 h-3" />
                      {formatDate(snapshot.date)}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(snapshot.status)}`}>
                        {getStatusIcon(snapshot.status)}
                        {snapshot.status === 'in-progress' ? 'In Progress' : snapshot.status.charAt(0).toUpperCase() + snapshot.status.slice(1)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {snapshot.status !== 'completed' && (
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-emerald-900 h-1.5 rounded-full transition-all"
                            style={{ width: `${snapshot.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{snapshot.progress}% complete</div>
                      </div>
                    )}

                    {/* Net Worth */}
                    {snapshot.status === 'completed' && (
                      <div className="text-sm" data-ai-field="snapshotNetWorth" data-ai-label="Snapshot Net Worth">
                        <span className="text-gray-500">Net Worth: </span>
                        <span className={`font-medium ${snapshot.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(snapshot.netWorth)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show Archive Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Archive className="w-4 h-4" />
            {showArchive ? 'Hide Archive' : 'Show Archive'}
          </button>
        </div>
      </div>

      {/* Right Panel - Snapshot Details */}
      <div className="flex-1 overflow-auto">
        {!selectedSnapshot ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Select a financial snapshot to view details</p>
              <p className="text-sm text-gray-400">
                Choose from the list or create a new snapshot
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 pb-24">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">{selectedSnapshot.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedSnapshot.date)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSnapshot.status)}`}>
                        {getStatusIcon(selectedSnapshot.status)}
                        {selectedSnapshot.status === 'in-progress' ? 'In Progress' : selectedSnapshot.status.charAt(0).toUpperCase() + selectedSnapshot.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-sm border border-gray-200 mb-4 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                          ? 'text-emerald-900 border-b-2 border-emerald-900 bg-stone-200/30'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-sm border border-gray-200 p-6">
                {/* Assets Tab */}
                {activeTab === 'assets' && (
                  <div className="space-y-6" data-ai-section="Assets">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Assets</h3>
                        <p className="text-sm text-gray-600">List all assets and their current values</p>
                      </div>
                      <button
                        onClick={addAsset}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                      >
                        <Plus className="w-4 h-4" />
                        Add Asset
                      </button>
                    </div>

                    {assets.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-300 rounded-sm">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No assets added yet</p>
                        <button
                          onClick={addAsset}
                          className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                        >
                          Add your first asset
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assets.map((asset, index) => (
                          <div key={asset.id} className="p-4 border border-gray-200 rounded-sm" data-ai-field="assetEntry" data-ai-label={`Asset: ${asset.description || `Asset ${index + 1}`}`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Asset {index + 1}</h4>
                              <button
                                onClick={() => removeAsset(asset.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                                <select
                                  value={asset.type}
                                  onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="assetType" data-ai-label="Asset Type" data-ai-editable="true"
                                >
                                  <option value="">Select type</option>
                                  {assetTypes.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                                <input
                                  type="text"
                                  value={asset.value}
                                  onChange={(e) => updateAsset(asset.id, 'value', e.target.value)}
                                  placeholder="$100,000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="assetValue" data-ai-label="Asset Value" data-ai-editable="true"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                  type="text"
                                  value={asset.description}
                                  onChange={(e) => updateAsset(asset.id, 'description', e.target.value)}
                                  placeholder="e.g., Main residence, Investment portfolio"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="assetDescription" data-ai-label="Asset Description" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ownership</label>
                                <select
                                  value={asset.ownership}
                                  onChange={(e) => updateAsset(asset.id, 'ownership', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="assetOwnership" data-ai-label="Asset Ownership" data-ai-editable="true"
                                >
                                  <option value="">Select ownership</option>
                                  <option value="individual">Individual</option>
                                  <option value="joint">Joint</option>
                                  <option value="trust">Trust</option>
                                  <option value="company">Company</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Liabilities Tab */}
                {activeTab === 'liabilities' && (
                  <div className="space-y-6" data-ai-section="Liabilities">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Liabilities</h3>
                        <p className="text-sm text-gray-600">List all debts and obligations</p>
                      </div>
                      <button
                        onClick={addLiability}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                      >
                        <Plus className="w-4 h-4" />
                        Add Liability
                      </button>
                    </div>

                    {liabilities.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-300 rounded-sm">
                        <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No liabilities added yet</p>
                        <button
                          onClick={addLiability}
                          className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                        >
                          Add your first liability
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {liabilities.map((liability, index) => (
                          <div key={liability.id} className="p-4 border border-gray-200 rounded-sm" data-ai-field="liabilityEntry" data-ai-label={`Liability: ${liability.description || `Liability ${index + 1}`}`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Liability {index + 1}</h4>
                              <button
                                onClick={() => removeLiability(liability.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Liability Type</label>
                                <select
                                  value={liability.type}
                                  onChange={(e) => updateLiability(liability.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="liabilityType" data-ai-label="Liability Type" data-ai-editable="true"
                                >
                                  <option value="">Select type</option>
                                  {liabilityTypes.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                                <input
                                  type="text"
                                  value={liability.balance}
                                  onChange={(e) => updateLiability(liability.id, 'balance', e.target.value)}
                                  placeholder="$250,000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="liabilityBalance" data-ai-label="Current Balance" data-ai-editable="true"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                  type="text"
                                  value={liability.description}
                                  onChange={(e) => updateLiability(liability.id, 'description', e.target.value)}
                                  placeholder="e.g., Home mortgage, Car loan"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="liabilityDescription" data-ai-label="Liability Description" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate</label>
                                <input
                                  type="text"
                                  value={liability.interestRate}
                                  onChange={(e) => updateLiability(liability.id, 'interestRate', e.target.value)}
                                  placeholder="5.5%"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="liabilityInterestRate" data-ai-label="Interest Rate" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Payment</label>
                                <input
                                  type="text"
                                  value={liability.payment}
                                  onChange={(e) => updateLiability(liability.id, 'payment', e.target.value)}
                                  placeholder="$1,500"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="liabilityPayment" data-ai-label="Monthly Payment" data-ai-editable="true"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Income & Expenses Tab */}
                {activeTab === 'income-expenses' && (
                  <div className="space-y-8" data-ai-section="Income and Expenses">
                    {/* Income Section */}
                    <div data-ai-section="Income">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Income Sources</h3>
                          <p className="text-sm text-gray-600">List all regular income sources</p>
                        </div>
                        <button
                          onClick={addIncome}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                        >
                          <Plus className="w-4 h-4" />
                          Add Income
                        </button>
                      </div>

                      {incomeItems.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-gray-300 rounded-sm">
                          <p className="text-gray-500 mb-3">No income sources added</p>
                          <button
                            onClick={addIncome}
                            className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                          >
                            Add income source
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {incomeItems.map((income, index) => (
                            <div key={income.id} className="p-4 border border-gray-200 rounded-sm" data-ai-field="incomeEntry" data-ai-label={`Income: ${income.source || `Income ${index + 1}`}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Income {index + 1}</h4>
                                <button
                                  onClick={() => removeIncome(income.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                                  <input
                                    type="text"
                                    value={income.source}
                                    onChange={(e) => updateIncome(income.id, 'source', e.target.value)}
                                    placeholder="e.g., Salary, Rental"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="incomeSource" data-ai-label="Income Source" data-ai-editable="true"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                  <input
                                    type="text"
                                    value={income.amount}
                                    onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                                    placeholder="$5,000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="incomeAmount" data-ai-label="Income Amount" data-ai-editable="true"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                                  <select
                                    value={income.frequency}
                                    onChange={(e) => updateIncome(income.id, 'frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="incomeFrequency" data-ai-label="Income Frequency" data-ai-editable="true"
                                  >
                                    <option value="weekly">Weekly</option>
                                    <option value="fortnightly">Fortnightly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="annually">Annually</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expenses Section */}
                    <div className="border-t border-gray-200 pt-8" data-ai-section="Expenses">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Expenses</h3>
                          <p className="text-sm text-gray-600">List all regular expenses</p>
                        </div>
                        <button
                          onClick={addExpense}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                        >
                          <Plus className="w-4 h-4" />
                          Add Expense
                        </button>
                      </div>

                      {expenseItems.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-gray-300 rounded-sm">
                          <p className="text-gray-500 mb-3">No expenses added</p>
                          <button
                            onClick={addExpense}
                            className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                          >
                            Add expense
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {expenseItems.map((expense, index) => (
                            <div key={expense.id} className="p-4 border border-gray-200 rounded-sm" data-ai-field="expenseEntry" data-ai-label={`Expense: ${expense.category || `Expense ${index + 1}`}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Expense {index + 1}</h4>
                                <button
                                  onClick={() => removeExpense(expense.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                  <input
                                    type="text"
                                    value={expense.category}
                                    onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                                    placeholder="e.g., Housing, Food"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="expenseCategory" data-ai-label="Expense Category" data-ai-editable="true"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                  <input
                                    type="text"
                                    value={expense.amount}
                                    onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                                    placeholder="$2,000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="expenseAmount" data-ai-label="Expense Amount" data-ai-editable="true"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                                  <select
                                    value={expense.frequency}
                                    onChange={(e) => updateExpense(expense.id, 'frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    data-ai-field="expenseFrequency" data-ai-label="Expense Frequency" data-ai-editable="true"
                                  >
                                    <option value="weekly">Weekly</option>
                                    <option value="fortnightly">Fortnightly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="annually">Annually</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                  <div className="space-y-6" data-ai-section="Financial Goals">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Financial Goals</h3>
                        <p className="text-sm text-gray-600">Set and track financial objectives</p>
                      </div>
                      <button
                        onClick={addGoal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                      >
                        <Plus className="w-4 h-4" />
                        Add Goal
                      </button>
                    </div>

                    {goals.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-300 rounded-sm">
                        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No financial goals set yet</p>
                        <button
                          onClick={addGoal}
                          className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                        >
                          Add your first goal
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {goals.map((goal, index) => (
                          <div key={goal.id} className="p-4 border border-gray-200 rounded-sm" data-ai-field="goalEntry" data-ai-label={`Goal: ${goal.name || `Goal ${index + 1}`}`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Goal {index + 1}</h4>
                              <button
                                onClick={() => removeGoal(goal.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                                <input
                                  type="text"
                                  value={goal.name}
                                  onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                                  placeholder="e.g., Retirement Fund, House Deposit"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="goalName" data-ai-label="Goal Name" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                                <input
                                  type="text"
                                  value={goal.targetAmount}
                                  onChange={(e) => updateGoal(goal.id, 'targetAmount', e.target.value)}
                                  placeholder="$500,000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="goalTargetAmount" data-ai-label="Target Amount" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                                <input
                                  type="date"
                                  value={goal.targetDate}
                                  onChange={(e) => updateGoal(goal.id, 'targetDate', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="goalTargetDate" data-ai-label="Target Date" data-ai-editable="true"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                  value={goal.priority}
                                  onChange={(e) => updateGoal(goal.id, 'priority', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-field="goalPriority" data-ai-label="Goal Priority" data-ai-editable="true"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div className="space-y-6" data-ai-section="Net Worth Summary">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Net Worth Summary</h3>
                      <p className="text-sm text-gray-600 mb-6">Overview of total financial position</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-sm border border-green-200" data-ai-field="totalAssets" data-ai-label="Total Assets">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-sm font-medium">Total Assets</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900" data-ai-field="totalAssetsValue" data-ai-label="Total Assets Value">
                          {formatCurrency(calculateTotals().totalAssets)}
                        </div>
                        <div className="text-xs text-green-600 mt-1" data-ai-field="totalAssetsCount" data-ai-label="Number of Assets">{assets.length} items</div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-sm border border-red-200" data-ai-field="totalLiabilities" data-ai-label="Total Liabilities">
                        <div className="flex items-center gap-2 text-red-700 mb-2">
                          <TrendingDown className="w-5 h-5" />
                          <span className="text-sm font-medium">Total Liabilities</span>
                        </div>
                        <div className="text-2xl font-bold text-red-900" data-ai-field="totalLiabilitiesValue" data-ai-label="Total Liabilities Value">
                          {formatCurrency(calculateTotals().totalLiabilities)}
                        </div>
                        <div className="text-xs text-red-600 mt-1" data-ai-field="totalLiabilitiesCount" data-ai-label="Number of Liabilities">{liabilities.length} items</div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-stone-200 to-sky-100 rounded-sm border border-emerald-900" data-ai-field="netWorth" data-ai-label="Net Worth">
                        <div className="flex items-center gap-2 text-emerald-950 mb-2">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-sm font-medium">Net Worth</span>
                        </div>
                        <div className={`text-2xl font-bold ${calculateTotals().netWorth >= 0 ? 'text-emerald-950' : 'text-red-900'
                          }`} data-ai-field="netWorthValue" data-ai-label="Net Worth Value">
                          {formatCurrency(calculateTotals().netWorth)}
                        </div>
                        <div className="text-xs text-emerald-900 mt-1" data-ai-field="netWorthPosition" data-ai-label="Net Worth Position">
                          {calculateTotals().netWorth >= 0 ? 'Positive position' : 'Negative position'}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="border border-gray-200 rounded-sm overflow-hidden" data-ai-section="Net Worth Breakdown">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {assets.map((asset) => {
                            const value = parseFloat(asset.value.replace(/[^0-9.-]+/g, '')) || 0;
                            return (
                              <tr key={asset.id} data-ai-field="assetBreakdownRow" data-ai-label={`Asset: ${asset.description || 'Unnamed Asset'}`}>
                                <td className="px-4 py-3 text-sm">
                                  <div className="font-medium text-gray-900" data-ai-field="breakdownAssetName" data-ai-label="Asset Name">
                                    {asset.description || 'Unnamed Asset'}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize" data-ai-field="breakdownAssetType" data-ai-label="Asset Type">{asset.type || 'Asset'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-green-600" data-ai-field="breakdownAssetValue" data-ai-label="Asset Value">
                                  {formatCurrency(value)}
                                </td>
                              </tr>
                            );
                          })}
                          {liabilities.map((liability) => {
                            const value = parseFloat(liability.balance.replace(/[^0-9.-]+/g, '')) || 0;
                            return (
                              <tr key={liability.id} data-ai-field="liabilityBreakdownRow" data-ai-label={`Liability: ${liability.description || 'Unnamed Liability'}`}>
                                <td className="px-4 py-3 text-sm">
                                  <div className="font-medium text-gray-900" data-ai-field="breakdownLiabilityName" data-ai-label="Liability Name">
                                    {liability.description || 'Unnamed Liability'}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize" data-ai-field="breakdownLiabilityType" data-ai-label="Liability Type">{liability.type || 'Liability'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-red-600" data-ai-field="breakdownLiabilityValue" data-ai-label="Liability Value">
                                  -{formatCurrency(value)}
                                </td>
                              </tr>
                            );
                          })}
                          {assets.length === 0 && liabilities.length === 0 && (
                            <tr>
                              <td colSpan={2} className="px-4 py-8 text-center text-gray-500 text-sm">
                                No financial data added yet. Start by adding assets and liabilities.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button className="px-6 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors h-10 font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Financial snapshot saved successfully!', {
                        icon: <CheckCircle2 className="w-5 h-5" />
                      });
                    }}
                    className="px-6 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10 font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}