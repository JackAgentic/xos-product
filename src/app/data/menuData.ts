import {
  LayoutDashboard,
  Users,
  Target,
  Mail,
  CheckSquare,
  Megaphone,
  BookUser,
  Calendar as CalendarIcon,
  BarChart3,
  Smartphone,
  UserCircle,
  LayoutGrid,
  ClipboardList,
  DollarSign,
  CalendarDays,
  FileText,
  MessageSquare,
  StickyNote,
  Home as HomeIcon,
  Shield,
  PiggyBank,
  TrendingUp,
  Briefcase,
  ClipboardCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MainMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ClientMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge: number | null;
}

export interface AdviceDropdownItem {
  id: string;
  label: string;
}

export interface AdviceMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hasDropdown: boolean;
  dropdownItems?: AdviceDropdownItem[];
}

export const mainMenuItems: MainMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'opportunities', label: 'Opportunities', icon: Target },
  { id: 'inbox', label: 'Inbox', icon: Mail },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'contacts', label: 'Contacts', icon: BookUser },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'reporting', label: 'Reporting', icon: BarChart3 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'account', label: 'Account', icon: UserCircle },
];

export const clientMenuItems: ClientMenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, badge: null },
  { id: 'opportunities', label: 'Opportunities', icon: Target, badge: null },
  { id: 'fact-find', label: 'Fact-Find', icon: ClipboardList, badge: null },
  { id: 'financials', label: 'Financials', icon: DollarSign, badge: null },
  { id: 'contacts', label: 'Contacts', icon: Users, badge: 2 },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays, badge: 1 },
  { id: 'documents', label: 'Documents', icon: FileText, badge: null },
  { id: 'communication', label: 'Communication', icon: MessageSquare, badge: 5 },
  { id: 'notes', label: 'Notes', icon: StickyNote, badge: null },
];

export const adviceMenuItems: AdviceMenuItem[] = [
  { id: 'mortgage', label: 'Mortgage', icon: HomeIcon, hasDropdown: false },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: Shield,
    hasDropdown: true,
    dropdownItems: [
      { id: 'fire-general', label: 'Fire & General' },
      { id: 'health', label: 'Health' },
      { id: 'home-contents', label: 'Home & Contents' },
      { id: 'motor', label: 'Motor' },
      { id: 'travel', label: 'Travel' },
    ]
  },
  { id: 'kiwisaver', label: 'KiwiSaver', icon: PiggyBank, hasDropdown: false },
  {
    id: 'property',
    label: 'Property',
    icon: TrendingUp,
    hasDropdown: true,
    dropdownItems: [
      { id: 'cashflow-analysis', label: 'Cashflow Analysis' },
      { id: 'portfolio', label: 'Portfolio' },
    ]
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: Briefcase,
    hasDropdown: true,
    dropdownItems: [
      { id: 'cashflow-model', label: 'Cashflow Model' },
    ]
  },
  { id: 'audit', label: 'Audit', icon: ClipboardCheck, hasDropdown: false },
];

export const allTabs = [
  ...clientMenuItems.map(item => item.id),
  ...adviceMenuItems.map(item => item.id)
];
