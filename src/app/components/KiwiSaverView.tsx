import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Eye,
  EyeOff,
  FileText,
  Calendar,
  Target,
  TrendingUp,
  Scale,
  Download,
  Send,
  CheckCircle,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  Plus,
  Save,
  Layers,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  FileCheck,
  UserCheck,
  Loader,
  PiggyBank
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

type KiwiSaverTab = 'assessment' | 'meeting' | 'risk' | 'projection' | 'comparison';

type WorkflowStatus = 'draft' | 'pending_review' | 'approved' | 'sent_to_client' | 'signed' | 'completed';

interface Contact {
  id: number;
  name: string;
  type: string;
  email: string;
}

interface KiwiSaverViewProps {
  clientId: number;
  clientName: string;
  contacts?: Contact[];
  setMobileDrawerOpen?: (open: boolean) => void;
}

export function KiwiSaverView({ clientId, clientName, contacts = [], setMobileDrawerOpen }: KiwiSaverViewProps) {
  const [activeTab, setActiveTab] = useState<KiwiSaverTab>('assessment');
  const [hiddenTabs, setHiddenTabs] = useState<KiwiSaverTab[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('draft');
  const [selectedScenario, setSelectedScenario] = useState<number>(1);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedFunds, setSelectedFunds] = useState<string[]>(['current', 'recommended']);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number>(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);
  const [activeAssessmentSection, setActiveAssessmentSection] = useState('personal');
  const [showAssessmentMobileNav, setShowAssessmentMobileNav] = useState(false);

  // ─── Scroll-spy for assessment sections ────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingToRef = useRef(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el && scrollContainerRef.current) {
      isScrollingToRef.current = true;
      setActiveAssessmentSection(sectionId);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Re-enable scroll-spy after scroll finishes
      setTimeout(() => { isScrollingToRef.current = false; }, 800);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'assessment') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionIds = ['personal', 'enrolment', 'provider', 'employment', 'goals', 'other'];
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '');
            setActiveAssessmentSection(id);
            break;
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -60% 0px', threshold: 0.01 }
    );

    // Small delay to let DOM render
    const timer = setTimeout(() => {
      sectionIds.forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab]);

  // ─── Per-contact form state ─────────────────────────────────────────────────
  type ContactFormData = {
    personal: { firstName: string; lastName: string; dateOfBirth: string; residence: string };
    enrolment: 'Yes' | 'No' | null;
    provider: { provider: string; providerUnknown: boolean; fund: string; fundUnknown: boolean; balance: string; balanceUnknown: boolean; joiningYear: string; memberNumber: string };
    employment: { status: string; income: string; pirRate: string; esctRate: string; irdNumber: string; employeeContrib: string; employerContrib: string; voluntaryContrib: string; frequency: string };
    goals: 'First Home' | 'Retirement' | null;
    other: { nzWorkplace: 'Yes' | 'No' | null; nzWorkplaceName: string; nzWorkplaceBalance: string; overseasPension: 'Yes' | 'No' | null; overseasName: string; overseasCountry: string; overseasBalance: string; notes: string };
  };

  const makeDefaultForms = (contact: Contact): ContactFormData => {
    const parts = contact.name.split(' ');
    return {
      personal: { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', dateOfBirth: '', residence: 'New Zealand' },
      enrolment: null,
      provider: { provider: '', providerUnknown: false, fund: '', fundUnknown: false, balance: '', balanceUnknown: false, joiningYear: '2024', memberNumber: '' },
      employment: { status: 'Employed', income: '', pirRate: '28%', esctRate: '', irdNumber: '', employeeContrib: '3%', employerContrib: '3%', voluntaryContrib: '', frequency: 'Fortnightly' },
      goals: null,
      other: { nzWorkplace: null, nzWorkplaceName: '', nzWorkplaceBalance: '', overseasPension: null, overseasName: '', overseasCountry: '', overseasBalance: '', notes: '' },
    };
  };

  const [contactForms, setContactForms] = useState<Record<number, ContactFormData>>(() => {
    const initial: Record<number, ContactFormData> = {};
    contacts.forEach(c => {
      initial[c.id] = makeDefaultForms(c);
    });
    // Seed realistic data for contacts
    if (contacts.length > 0) {
      const first = contacts[0].id;
      initial[first] = {
        ...initial[first],
        personal: { firstName: 'Andrew', lastName: 'Carter', dateOfBirth: '15/03/1985', residence: 'New Zealand' },
        enrolment: 'Yes',
        provider: { provider: 'Fisher Funds', providerUnknown: false, fund: 'Growth', fundUnknown: false, balance: '128,000', balanceUnknown: false, joiningYear: '2008', memberNumber: 'FF-2847193' },
        employment: { status: 'Employed', income: '145,000', pirRate: '28%', esctRate: '33%', irdNumber: '123-456-789', employeeContrib: '4%', employerContrib: '3%', voluntaryContrib: '50', frequency: 'Fortnightly' },
        goals: 'Retirement',
        other: { nzWorkplace: 'No', nzWorkplaceName: '', nzWorkplaceBalance: '', overseasPension: 'No', overseasName: '', overseasCountry: '', overseasBalance: '', notes: 'Client interested in increasing voluntary contributions. Discussed tax benefits of higher PIR rate.' },
      };
    }
    if (contacts.length > 1) {
      const second = contacts[1].id;
      initial[second] = {
        ...initial[second],
        personal: { firstName: 'Sarah', lastName: 'Carter', dateOfBirth: '22/07/1987', residence: 'New Zealand' },
        enrolment: 'Yes',
        provider: { provider: 'Milford Asset Management', providerUnknown: false, fund: 'Active Growth', fundUnknown: false, balance: '95,400', balanceUnknown: false, joiningYear: '2010', memberNumber: 'MAM-5519822' },
        employment: { status: 'Employed', income: '115,000', pirRate: '28%', esctRate: '30%', irdNumber: '987-654-321', employeeContrib: '3%', employerContrib: '3%', voluntaryContrib: '', frequency: 'Fortnightly' },
        goals: 'Retirement',
        other: { nzWorkplace: 'No', nzWorkplaceName: '', nzWorkplaceBalance: '', overseasPension: 'No', overseasName: '', overseasCountry: '', overseasBalance: '', notes: 'Consider consolidating with partner\'s provider for fee savings.' },
      };
    }
    if (contacts.length > 2) {
      const third = contacts[2].id;
      initial[third] = {
        ...initial[third],
        personal: { firstName: 'Margaret', lastName: 'Carter', dateOfBirth: '10/11/1958', residence: 'New Zealand' },
        enrolment: 'Yes',
        provider: { provider: 'ANZ Investments', providerUnknown: false, fund: 'Conservative', fundUnknown: false, balance: '245,000', balanceUnknown: false, joiningYear: '2007', memberNumber: 'ANZ-7734201' },
        employment: { status: 'Retired', income: '42,000', pirRate: '17.5%', esctRate: '', irdNumber: '456-789-123', employeeContrib: '0%', employerContrib: '0%', voluntaryContrib: '', frequency: 'Monthly' },
        goals: 'Retirement',
        other: { nzWorkplace: 'No', nzWorkplaceName: '', nzWorkplaceBalance: '', overseasPension: 'Yes', overseasName: 'UK State Pension', overseasCountry: 'United Kingdom', overseasBalance: '38,500', notes: 'Receiving UK state pension. Review fund allocation — may be too conservative for remaining time horizon.' },
      };
    }
    return initial;
  });

  // ─── Contact selection & active contact ────────────────────────────────────
  const [selectedContacts, setSelectedContacts] = useState<number[]>(() => contacts.map(c => c.id));
  const [activeContactId, setActiveContactId] = useState<number>(contacts[0]?.id ?? 0);

  const toggleContact = useCallback((id: number) => {
    setSelectedContacts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // If we deselected the active contact, switch to another
      if (!next.includes(activeContactId) && next.length > 0) {
        setActiveContactId(next[0]);
      }
      return next;
    });
  }, [activeContactId]);

  // ─── Derived form state for the active contact (matches existing JSX names) ──
  const activeForms = contactForms[activeContactId];
  const personalForm = activeForms?.personal ?? { firstName: '', lastName: '', dateOfBirth: '', residence: '' };
  const enrolmentForm = activeForms?.enrolment ?? null;
  const providerForm = activeForms?.provider ?? { provider: '', providerUnknown: false, fund: '', fundUnknown: false, balance: '', balanceUnknown: false, joiningYear: '2024', memberNumber: '' };
  const employmentForm = activeForms?.employment ?? { status: 'Employed', income: '', pirRate: '28%', esctRate: '', irdNumber: '', employeeContrib: '3%', employerContrib: '3%', voluntaryContrib: '', frequency: 'Fortnightly' };
  const goalsForm = activeForms?.goals ?? null;
  const otherForm = activeForms?.other ?? { nzWorkplace: null, overseasPension: null, notes: '' };

  const updateContactForm = useCallback(<K extends keyof ContactFormData>(section: K, updater: ContactFormData[K] | ((prev: ContactFormData[K]) => ContactFormData[K])) => {
    setContactForms(prev => {
      const current = prev[activeContactId];
      if (!current) return prev;
      const newValue = typeof updater === 'function' ? (updater as (prev: ContactFormData[K]) => ContactFormData[K])(current[section]) : updater;
      return { ...prev, [activeContactId]: { ...current, [section]: newValue } };
    });
  }, [activeContactId]);

  // Setter shims matching existing JSX usage
  const setPersonalForm = useCallback((updater: ((prev: ContactFormData['personal']) => ContactFormData['personal'])) => updateContactForm('personal', updater), [updateContactForm]);
  const setEnrolmentForm = useCallback((value: 'Yes' | 'No') => updateContactForm('enrolment', value), [updateContactForm]);
  const setProviderForm = useCallback((updater: ((prev: ContactFormData['provider']) => ContactFormData['provider'])) => updateContactForm('provider', updater), [updateContactForm]);
  const setEmploymentForm = useCallback((updater: ((prev: ContactFormData['employment']) => ContactFormData['employment'])) => updateContactForm('employment', updater), [updateContactForm]);
  const setGoalsForm = useCallback((value: 'First Home' | 'Retirement') => updateContactForm('goals', value), [updateContactForm]);
  const setOtherForm = useCallback((updater: ((prev: ContactFormData['other']) => ContactFormData['other'])) => updateContactForm('other', updater), [updateContactForm]);

  // ─── Compute per-section completed counts for the active contact ────────────
  const assessmentSections = React.useMemo(() => {
    const f = contactForms[activeContactId];
    if (!f) return [
      { id: 'personal', label: 'Personal Details', icon: User, completedCount: 0, totalCount: 4 },
      { id: 'enrolment', label: 'Enrolment Status', icon: CheckCircle, completedCount: 0, totalCount: 1 },
      { id: 'provider', label: 'KiwiSaver Provider', icon: Building, completedCount: 0, totalCount: 5 },
      { id: 'employment', label: 'Employment & Tax', icon: Building, completedCount: 0, totalCount: 9 },
      { id: 'goals', label: 'Primary Goals', icon: Target, completedCount: 0, totalCount: 1 },
      { id: 'other', label: 'Other Schemes', icon: FileText, completedCount: 0, totalCount: 2 },
    ];

    const personalCompleted = [f.personal.firstName.trim(), f.personal.lastName.trim(), f.personal.dateOfBirth.trim(), f.personal.residence.trim()].filter(Boolean).length;
    const enrolmentCompleted = f.enrolment !== null ? 1 : 0;
    const providerCompleted = [f.provider.provider || f.provider.providerUnknown, f.provider.fund || f.provider.fundUnknown, f.provider.balance || f.provider.balanceUnknown, f.provider.joiningYear.trim(), /^\d{3}-\d{3}-\d{3}$/.test(f.provider.memberNumber.trim())].filter(Boolean).length;
    const employmentCompleted = [f.employment.status, f.employment.income.trim(), f.employment.pirRate, f.employment.esctRate.trim(), /^\d{3}-\d{3}-\d{3}$/.test(f.employment.irdNumber.trim()), f.employment.employeeContrib, f.employment.employerContrib, f.employment.voluntaryContrib.trim(), f.employment.frequency].filter(Boolean).length;
    const goalsCompleted = f.goals !== null ? 1 : 0;
    // Other Schemes: base 2 questions + conditional fields when "Yes"
    let otherTotal = 2; // nzWorkplace question + overseasPension question
    let otherCompleted = 0;
    if (f.other.nzWorkplace) { otherCompleted++; }
    if (f.other.nzWorkplace === 'Yes') {
      otherTotal += 2; // scheme name + balance
      if (f.other.nzWorkplaceName.trim()) otherCompleted++;
      if (f.other.nzWorkplaceBalance.trim()) otherCompleted++;
    }
    if (f.other.overseasPension) { otherCompleted++; }
    if (f.other.overseasPension === 'Yes') {
      otherTotal += 3; // scheme name + country + balance
      if (f.other.overseasName.trim()) otherCompleted++;
      if (f.other.overseasCountry.trim()) otherCompleted++;
      if (f.other.overseasBalance.trim()) otherCompleted++;
    }

    return [
      { id: 'personal', label: 'Personal Details', icon: User, completedCount: personalCompleted, totalCount: 4 },
      { id: 'enrolment', label: 'Enrolment Status', icon: CheckCircle, completedCount: enrolmentCompleted, totalCount: 1 },
      { id: 'provider', label: 'KiwiSaver Provider', icon: Building, completedCount: providerCompleted, totalCount: 5 },
      { id: 'employment', label: 'Employment & Tax', icon: Building, completedCount: employmentCompleted, totalCount: 9 },
      { id: 'goals', label: 'Primary Goals', icon: Target, completedCount: goalsCompleted, totalCount: 1 },
      { id: 'other', label: 'Other Schemes', icon: FileText, completedCount: otherCompleted, totalCount: otherTotal },
    ];
  }, [contactForms, activeContactId]);

  // ─── Overall progress (%) from section totals ──────────────────────────────
  const overallProgress = React.useMemo(() => {
    const total = assessmentSections.reduce((s, sec) => s + sec.totalCount, 0);
    const completed = assessmentSections.reduce((s, sec) => s + sec.completedCount, 0);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [assessmentSections]);

  // ─── Per-contact progress ─────────────────────────────────────────────────
  const getContactProgress = useCallback((id: number): number => {
    const f = contactForms[id];
    if (!f) return 0;
    const baseCompleted = [
      f.personal.firstName.trim(), f.personal.lastName.trim(), f.personal.dateOfBirth.trim(), f.personal.residence.trim(),
      f.enrolment !== null ? 'y' : '',
      f.provider.provider || f.provider.providerUnknown, f.provider.fund || f.provider.fundUnknown, f.provider.balance || f.provider.balanceUnknown, f.provider.joiningYear.trim(), /^\d{3}-\d{3}-\d{3}$/.test(f.provider.memberNumber.trim()) ? 'y' : '',
      f.employment.status, f.employment.income.trim(), f.employment.pirRate, f.employment.esctRate.trim(), /^\d{3}-\d{3}-\d{3}$/.test(f.employment.irdNumber.trim()) ? 'y' : '', f.employment.employeeContrib, f.employment.employerContrib, f.employment.voluntaryContrib.trim(), f.employment.frequency,
      f.goals !== null ? 'y' : '',
      f.other.nzWorkplace, f.other.overseasPension,
    ].filter(Boolean).length;
    let total = 22;
    let completed = baseCompleted;
    if (f.other.nzWorkplace === 'Yes') {
      total += 2;
      if (f.other.nzWorkplaceName.trim()) completed++;
      if (f.other.nzWorkplaceBalance.trim()) completed++;
    }
    if (f.other.overseasPension === 'Yes') {
      total += 3;
      if (f.other.overseasName.trim()) completed++;
      if (f.other.overseasCountry.trim()) completed++;
      if (f.other.overseasBalance.trim()) completed++;
    }
    return Math.round((completed / total) * 100);
  }, [contactForms]);

  // ─── All selected contacts fully complete? ─────────────────────────────────
  const allContactsComplete = React.useMemo(() => {
    if (selectedContacts.length === 0) return false;
    return selectedContacts.every(id => getContactProgress(id) === 100);
  }, [selectedContacts, getContactProgress]);


  // Mock data for assessments
  const [assessments] = useState([
    { id: 1, label: 'Annual Review 2026', status: 'Draft', date: '5 Mar 2026', progress: 77 },
    { id: 2, label: 'Fund Switch Assessment', status: 'Complete', date: '1 Feb 2026', progress: 100 },
    { id: 3, label: 'First Home Withdrawal', status: 'Complete', date: '15 Nov 2025', progress: 100 },
    { id: 4, label: 'Initial Assessment', status: 'Complete', date: '20 Jun 2025', progress: 100 },
  ]);

  // Get currently selected assessment
  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId) || assessments[0];



  // Mock meeting data
  const [meetingData] = useState({
    title: 'Meeting title',
    dateTime: '06/03/2026 12:00',
    endTime: '18:45',
    location: 'Meeting location',
    type: 'In Person',
    meetingLink: 'https://teams.myadviser.com/...',
    attendees: 'attendees',
    notes: '',
  });

  // Mock risk profile questions
  const [riskQuestions] = useState([
    {
      id: 1,
      question: 'How long do I expect to invest my KiwiSaver funds before I need to withdraw a significant portion of my KiwiSaver balance? (Note: this is different from the date you can first access your KiwiSaver at age 65)',
      options: ['More than 25 years', 'Between 15 and 25 years', 'Less than 15 years'],
      selected: 'More than 25 years'
    },
    {
      id: 2,
      question: 'How long until I intend to spend a meaningful portion of my KiwiSaver balance? (Note this is different than a date of withdrawal at my age 65)',
      options: ['More than 10 years', '5-10 years', 'Less than 5 years'],
      selected: 'More than 10 years'
    },
    // Add more questions as needed
  ]);

  // Mock projection data
  const projectionData = [
    { year: 0, lowerGrowth: 50000, baseGrowth: 50000, higherGrowth: 50000 },
    { year: 5, lowerGrowth: 75000, baseGrowth: 85000, higherGrowth: 95000 },
    { year: 10, lowerGrowth: 110000, baseGrowth: 135000, higherGrowth: 165000 },
    { year: 15, lowerGrowth: 155000, baseGrowth: 205000, higherGrowth: 265000 },
    { year: 20, lowerGrowth: 210000, baseGrowth: 295000, higherGrowth: 405000 },
    { year: 25, lowerGrowth: 280000, baseGrowth: 415000, higherGrowth: 605000 },
    { year: 30, lowerGrowth: 370000, baseGrowth: 575000, higherGrowth: 890000 },
  ];

  // Mock funds for comparison
  const ALL_FUNDS = [
    {
      id: 'anz-growth',
      name: 'ANZ Growth Fund',
      provider: 'ANZ Investments',
      type: 'Growth',
      fees: '1.05%',
      returns5yr: '8.2%',
      riskProfile: 'High',
    },
    {
      id: 'simplicity-conservative',
      name: 'Simplicity Conservative Fund',
      provider: 'Simplicity NZ',
      type: 'Conservative',
      fees: '0.31%',
      returns5yr: '5.4%',
      riskProfile: 'Low',
    },
    {
      id: 'fisher-growth',
      name: 'Fisher Funds Growth Fund',
      provider: 'Fisher Funds',
      type: 'Growth',
      fees: '1.10%',
      returns5yr: '9.1%',
      riskProfile: 'High',
    },
    {
      id: 'milford-active',
      name: 'Milford Active Growth Fund',
      provider: 'Milford Asset Management',
      type: 'Growth',
      fees: '1.05%',
      returns5yr: '10.4%',
      riskProfile: 'High',
    },
    {
      id: 'bnz-balanced',
      name: 'BNZ Balanced Fund',
      provider: 'BNZ',
      type: 'Balanced',
      fees: '0.45%',
      returns5yr: '6.8%',
      riskProfile: 'Medium',
    },
    {
      id: 'westpac-balanced',
      name: 'Westpac Balanced Fund',
      provider: 'Westpac',
      type: 'Balanced',
      fees: '0.55%',
      returns5yr: '6.2%',
      riskProfile: 'Medium',
    },
    {
      id: 'kiwi-wealth-growth',
      name: 'Kiwi Wealth Growth Fund',
      provider: 'Kiwi Wealth',
      type: 'Growth',
      fees: '0.94%',
      returns5yr: '7.9%',
      riskProfile: 'High',
    },
    {
      id: 'booster-high-growth',
      name: 'Booster High Growth Fund',
      provider: 'Booster',
      type: 'High Growth',
      fees: '1.24%',
      returns5yr: '9.4%',
      riskProfile: 'Very High',
    },
    {
      id: 'generate-growth',
      name: 'Generate Growth Fund',
      provider: 'Generate',
      type: 'Growth',
      fees: '1.34%',
      returns5yr: '8.8%',
      riskProfile: 'High',
    },
    {
      id: 'anz-balanced',
      name: 'ANZ Balanced Fund',
      provider: 'ANZ Investments',
      type: 'Balanced',
      fees: '0.94%',
      returns5yr: '6.5%',
      riskProfile: 'Medium',
    }
  ];

  const [funds, setFunds] = useState({
    current: ALL_FUNDS[0],
    recommended: ALL_FUNDS[1],
  });

  const [justifications, setJustifications] = useState({
    current: 'No matching fund found in Previous Register',
    recommended: 'No matching fund found in Previous Register',
  });

  const tabs = [
    { id: 'assessment' as KiwiSaverTab, label: 'Key Details', icon: FileText },
    { id: 'meeting' as KiwiSaverTab, label: 'Meeting', icon: Calendar },
    { id: 'risk' as KiwiSaverTab, label: 'Risk Profile', icon: Target },
    { id: 'projection' as KiwiSaverTab, label: 'Projection', icon: TrendingUp },
    { id: 'comparison' as KiwiSaverTab, label: 'Comparison & Report', icon: Scale },
  ];

  const visibleTabs = tabs.filter(tab => !hiddenTabs.includes(tab.id));

  const toggleTabVisibility = (tabId: KiwiSaverTab) => {
    setHiddenTabs(prev =>
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const getWorkflowStatusInfo = () => {
    switch (workflowStatus) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText };
      case 'pending_review':
        return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'sent_to_client':
        return { label: 'Sent to Client', color: 'bg-blue-100 text-blue-700', icon: Send };
      case 'signed':
        return { label: 'Client Signed', color: 'bg-purple-100 text-purple-700', icon: UserCheck };
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-900/10 text-emerald-950', icon: CheckCircle };
      default:
        return { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText };
    }
  };

  const statusInfo = getWorkflowStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleGenerateReport = () => {
    if (selectedFunds.length < 2) {
      alert('Please select at least 2 funds to compare');
      return;
    }
    setShowReportPreview(true);
  };

  const handleSendForReview = () => {
    setWorkflowStatus('pending_review');
    alert('Statement of Advice sent for review');
  };

  const handleApprove = () => {
    setWorkflowStatus('approved');
    alert('Statement of Advice approved');
  };

  const handleSendToClient = () => {
    setWorkflowStatus('sent_to_client');
    alert('Statement of Advice sent to client via DocuSign');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-200">

        <div className="flex flex-1 overflow-hidden">
          {/* Persistent Left Sidebar - Assessment Selection */}
          <div className={`relative z-20 border-r border-gray-200 bg-white shadow-md ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto'} flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-80'}`}>
            <div className={`border-b border-gray-100 transition-all ${isSidebarCollapsed ? 'p-4 flex justify-center' : 'p-4'}`}>
              {!isSidebarCollapsed ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <PiggyBank className="w-8 h-8 text-emerald-900 -ml-1" />
                    {setMobileDrawerOpen && (
                      <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="h-8 w-8 hover:bg-gray-100 rounded lg:hidden flex items-center justify-center transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">KiwiSaver</h1>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Statement of Advice for {clientName}</p>
                  </div>
                </div>
              ) : (
                <PiggyBank className="w-6 h-6 text-emerald-900" />
              )}
            </div>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={`w-full p-4 border-b border-gray-100 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} bg-gray-50/50 hover:bg-gray-100 transition-colors group/collapse`}
                >
                  {!isSidebarCollapsed && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/collapse:text-emerald-900 transition-colors">Collapse</span>}
                  <div className="p-1.5 rounded text-gray-500 group-hover/collapse:text-emerald-900 transition-colors">
                    {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </TooltipContent>
            </ShadcnTooltip>

            <div className={`${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
              {/* Current Assessment Info */}
              {!isSidebarCollapsed && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{selectedAssessment.label}</h3>
                      <p className="text-xs text-gray-500">Created {selectedAssessment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold text-emerald-900">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-900 h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isSidebarCollapsed && (
                <div className="h-px bg-gray-100 my-4 mx-[-1.5rem]" />
              )}

              {/* Create New Assessment Button */}
              <button className={`w-full mb-4 border border-dashed border-gray-300 rounded hover:border-emerald-900 hover:bg-emerald-900/5 transition-all group ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className={`bg-stone-200 group-hover:bg-emerald-900/20 rounded flex items-center justify-center transition-colors ${isSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <Plus className={`${isSidebarCollapsed ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-900`} />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-gray-900">New Assessment</p>
                      <p className="text-xs text-gray-600">Start fresh SOA</p>
                    </div>
                  )}
                </div>
              </button>

              {/* Previous Assessments List */}
              <div className="space-y-2">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="relative group/item">
                    <button
                      onClick={() => setSelectedAssessmentId(assessment.id)}
                      className={`w-full text-left rounded border transition-all ${assessment.id === selectedAssessmentId
                        ? 'bg-emerald-900/10 border-emerald-900 ring-2 ring-emerald-900/20'
                        : 'bg-white border-gray-200 hover:border-emerald-900 hover:bg-gray-50'
                        } ${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}
                    >
                      {isSidebarCollapsed ? (
                        <FileCheck className={`w-5 h-5 ${assessment.id === selectedAssessmentId ? 'text-emerald-900' : 'text-gray-400'}`} />
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{assessment.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{assessment.date}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded flex-shrink-0 ml-2">
                              {assessment.status}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-emerald-900 h-1 rounded-full transition-all"
                              style={{ width: `${assessment.progress}%` }}
                            />
                          </div>
                        </>
                      )}
                    </button>

                    {/* Hover Popover for Collapsed Sidebar */}
                    {isSidebarCollapsed && (
                      <div className="hidden group-hover/item:block absolute left-full top-0 ml-2 z-[60] py-1 pointer-events-none">
                        <div className="bg-white border border-gray-200 rounded-sm p-4 w-60 pointer-events-auto">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-stone-200 rounded-sm flex items-center justify-center flex-shrink-0">
                              <FileCheck className="w-5 h-5 text-emerald-900" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-bold uppercase tracking-wider">
                              {assessment.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">{assessment.label}</h4>
                          <p className="text-[11px] text-gray-500 mb-4">Created {assessment.date}</p>

                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area - Unified Workbench */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-tl-lg mt-2 ml-2 shadow-md">
            {selectedAssessmentId && (
              <div className="flex-shrink-0">
                {/* Tab Navigation - Floor to Ceiling Grid */}
                <div className="bg-white border-b border-gray-200 flex-shrink-0">
                  <div className="flex h-10 sm:h-12">
                    {/* Assessment Info */}
                    <div className="hidden lg:flex items-center gap-2.5 px-4 border-r border-gray-200 flex-shrink-0 lg:w-64 bg-gray-50">
                      <div className="w-7 h-7 bg-emerald-900 rounded flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900 truncate">{selectedAssessment.label}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 ${statusInfo.color} border border-current opacity-80`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">Created {selectedAssessment.date}</span>
                      </div>
                    </div>

                    {visibleTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 px-2 sm:px-4 transition-all relative border-r border-gray-100 last:border-r-0 ${isActive
                            ? 'text-emerald-900 bg-emerald-900/5'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-emerald-900' : 'text-gray-400'}`} />
                          <span className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1 ${isActive ? 'text-emerald-900' : 'text-gray-500'}`}>
                            {tab.label}
                            {tab.id === 'assessment' && allContactsComplete && <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-green-50" />}
                          </span>
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-900" />
                          )}
                        </button>
                      );
                    })}

                    {/* Tab Visibility Dropdown */}
                    <div className="relative w-12 sm:w-16 flex-shrink-0 border-l border-gray-100 flex items-center justify-center">
                      <ShadcnTooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)}
                            className={`w-full h-full flex flex-col items-center justify-center transition-colors ${isVisibilityDropdownOpen ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={10}>
                          Visibility
                        </TooltipContent>
                      </ShadcnTooltip>

                      {isVisibilityDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsVisibilityDropdownOpen(false)}
                          />
                          <div className="absolute right-0 top-full mt-0 bg-white border border-gray-200 rounded-sm py-2 min-w-[240px] z-[60] animate-in fade-in zoom-in duration-200 origin-top-right border-t-2 border-t-emerald-900">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Show/Hide Tabs</span>
                            </div>
                            {tabs.map((tab) => {
                              const Icon = tab.icon;
                              const isHidden = hiddenTabs.includes(tab.id);
                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => toggleTabVisibility(tab.id)}
                                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group/tab"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded transition-colors ${isHidden ? 'bg-gray-50 text-gray-400' : 'bg-stone-200 text-emerald-900'}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${isHidden ? 'text-gray-400' : 'text-gray-700'}`}>{tab.label}</span>
                                  </div>
                                  {isHidden ? (
                                    <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5 text-emerald-900" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Main Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'assessment' && (
                <div className="flex flex-col lg:flex-row h-full bg-white overflow-hidden relative">
                  {/* Mobile Assessment Header / Module Switcher */}
                  <div className="lg:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-900 text-white rounded">
                        {React.createElement(assessmentSections.find(s => s.id === activeAssessmentSection)?.icon || User, { className: "w-4 h-4" })}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Current Module</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">
                          {assessmentSections.find(s => s.id === activeAssessmentSection)?.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssessmentMobileNav(!showAssessmentMobileNav)}
                      className="p-2 bg-gray-50 text-gray-400 rounded hover:text-emerald-900 transition-colors"
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAssessmentMobileNav ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mobile Nav Overlay */}
                    {showAssessmentMobileNav && (
                      <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 z-30 animate-in slide-in-from-top-2 duration-200 p-4 space-y-2">
                        {assessmentSections.map((section) => {
                          const Icon = section.icon;
                          const isActive = activeAssessmentSection === section.id;
                          return (
                            <button
                              key={section.id}
                              onClick={() => {
                                scrollToSection(section.id);
                                setShowAssessmentMobileNav(false);
                              }}
                              className={`w-full text-left p-4 rounded-sm flex items-center gap-4 ${isActive ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <Icon className="w-5 h-5 text-emerald-900" />
                              <span className="text-sm font-bold">{section.label}</span>
                              {isActive && <CheckCircle className="w-4 h-4 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Left Mini-Sidebar (Desktop Only) */}
                  <div className="hidden lg:flex flex-col lg:w-64 border-r border-gray-200 flex-shrink-0 bg-white">
                    {/* Contacts list — fixed height, scrollable */}
                    {contacts.length > 0 && (
                      <div className="flex-shrink-0 border-b border-gray-200">
                        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contacts</label>
                          <span className="text-[9px] font-medium text-gray-400">{selectedContacts.length}/{contacts.length}</span>
                        </div>
                        <div className="px-3 pb-3 max-h-[200px] overflow-y-auto space-y-1">
                          {contacts.map(contact => {
                            const isSelected = selectedContacts.includes(contact.id);
                            const isActive = contact.id === activeContactId;
                            const progress = getContactProgress(contact.id);
                            return (
                              <div
                                key={contact.id}
                                onClick={() => {
                                  if (!isSelected) setSelectedContacts(prev => [...prev, contact.id]);
                                  setActiveContactId(contact.id);
                                }}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm cursor-pointer transition-all ${
                                  isActive
                                    ? 'bg-emerald-900 text-white'
                                    : isSelected
                                      ? 'bg-white border border-gray-100 hover:bg-gray-50'
                                      : 'opacity-50 hover:opacity-75'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>{contact.name}</p>
                                  {isSelected ? (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <div className={`flex-1 h-1 rounded-full overflow-hidden ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        <div className={`h-full rounded-full transition-all ${isActive ? 'bg-white' : 'bg-emerald-900'}`} style={{ width: `${progress}%` }} />
                                      </div>
                                      <span className={`text-[9px] font-bold ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{progress}%</span>
                                    </div>
                                  ) : (
                                    <p className="text-[9px] text-gray-400 mt-0.5">Not included</p>
                                  )}
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); toggleContact(contact.id); }}
                                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                    isActive
                                      ? 'text-white/40 hover:text-white'
                                      : isSelected
                                        ? 'text-emerald-900/40 hover:text-red-500'
                                        : 'text-gray-300 hover:text-emerald-900'
                                  }`}
                                  title={isSelected ? 'Remove from assessment' : 'Add to assessment'}
                                >
                                  {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Focus modules — scrollable */}
                    <div className="overflow-y-auto flex-1">
                      <div className="px-4 pt-4 pb-2 sticky top-0 bg-slate-50 z-10">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Details</label>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {assessmentSections.map((section) => {
                          const isActive = activeAssessmentSection === section.id;
                          const progressPercentage = Math.round((section.completedCount / section.totalCount) * 100);
                          const isComplete = progressPercentage === 100;

                          return (
                            <button
                              key={section.id}
                              onClick={() => scrollToSection(section.id)}
                              className={`w-full text-left px-4 py-2.5 transition-all group border-l-2 ${isActive
                                ? 'bg-emerald-900/5 border-l-emerald-900'
                                : 'hover:bg-gray-50 text-gray-600 border-l-transparent'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs font-bold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{section.label}</p>
                                {isComplete && <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-green-50" />}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 w-full">
                                <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-700 ${isComplete ? 'bg-green-500' : 'bg-emerald-900'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold min-w-[30px] text-right ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                                  {section.completedCount}/{section.totalCount}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Content Area - Main Content Background */}
                  <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth pb-12">
                    <div className="p-4 sm:p-4 lg:p-6">
                      <div className="max-w-[1000px] mx-auto">

                        {/* Active contact header */}
                        {(() => {
                          const active = contacts.find(c => c.id === activeContactId);
                          if (!active) return null;
                          return (
                            <div className="mb-6 pb-6 border-b border-gray-200">
                              <h2 className="text-lg font-bold text-gray-900 leading-tight">{active.name}</h2>
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{active.type === 'self' ? 'Self' : 'Contact'} · {overallProgress}% complete</p>
                            </div>
                          );
                        })()}

                        {/* All sections rendered vertically */}
                        <div className="space-y-8">

                          {/* ── Personal Details ── */}
                          <div id="section-personal" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">Personal Details</h2>
                            <div className="space-y-4">
                              <div className="bg-white rounded-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${personalForm.firstName.trim() ? 'text-emerald-900/60' : 'text-gray-400'}`}>First Name</label>
                                    <input
                                      type="text"
                                      value={personalForm.firstName} onChange={e => setPersonalForm(f => ({ ...f, firstName: e.target.value }))}
                                      className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium"
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${personalForm.lastName.trim() ? 'text-emerald-900/60' : 'text-gray-400'}`}>Last Name</label>
                                    <input
                                      type="text"
                                      value={personalForm.lastName} onChange={e => setPersonalForm(f => ({ ...f, lastName: e.target.value }))}
                                      className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium"
                                    />
                                  </div>
                                  <div className="sm:col-span-2 lg:col-span-1">
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${personalForm.dateOfBirth.trim() ? 'text-emerald-900/60' : 'text-gray-400'}`}>Date of Birth</label>
                                    <input
                                      type="text"
                                      value={personalForm.dateOfBirth} onChange={e => setPersonalForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                                      className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-4">Localization</h3>
                                <div>
                                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${personalForm.residence ? 'text-emerald-900/60' : 'text-gray-400'}`}>Primary Residence</label>
                                  <div className="relative">
                                    <select value={personalForm.residence} onChange={e => setPersonalForm(f => ({ ...f, residence: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium">
                                      <option value="">Select country</option>
                                      <option value="Australia">Australia</option>
                                      <option value="New Zealand">New Zealand</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                      <ChevronDown className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Enrolment Status ── */}
                          <div id="section-enrolment" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">Enrolment Status</h2>
                            <div className="bg-white rounded border border-gray-100 p-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">KiwiSaver Enrolment</h3>
                              <p className="text-sm text-gray-500 mb-4 max-w-sm">Is the client currently enrolled in a KiwiSaver scheme?</p>

                              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                                {(['Yes', 'No'] as const).map(choice => (
                                  <button
                                    key={choice}
                                    onClick={() => setEnrolmentForm(choice)}
                                    className={`w-full sm:w-auto px-3 py-1.5 rounded-sm text-sm font-bold flex items-center justify-center sm:justify-start gap-2 transition-all border ${enrolmentForm === choice
                                      ? 'bg-emerald-900/5 text-emerald-900 border-emerald-900'
                                      : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-900/30 hover:bg-gray-50'
                                      }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${enrolmentForm === choice ? 'border-2 border-emerald-900' : 'border border-gray-200'}`}>
                                      {enrolmentForm === choice && <div className="w-1 h-1 rounded-full bg-emerald-900" />}
                                    </div>
                                    {choice}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* ── KiwiSaver Provider ── */}
                          <div id="section-provider" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">KiwiSaver Provider</h2>
                            <div className="space-y-4">
                              {/* Card 1: Provider */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100 flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">Scheme Provider</h3>
                                  <p className="text-sm text-gray-500 font-medium tracking-tight">Select their current KiwiSaver scheme provider</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full 2xl:w-auto 2xl:min-w-[450px]">
                                  <div className="relative flex-1">
                                    <select className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-800" value={providerForm.provider} onChange={e => setProviderForm(f => ({ ...f, provider: e.target.value, providerUnknown: false }))} disabled={providerForm.providerUnknown}>
                                      {Array.from(new Set(ALL_FUNDS.map(f => f.provider))).sort().map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                      <ChevronDown className="w-5 h-5" />
                                    </div>
                                  </div>
                                  <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors shrink-0 sm:min-w-[120px]">
                                    <input type="checkbox" checked={providerForm.providerUnknown} onChange={e => setProviderForm(f => ({ ...f, providerUnknown: e.target.checked, provider: e.target.checked ? '' : f.provider }))} className="rounded border-gray-300 w-4 h-4 text-emerald-900 focus:ring-emerald-900" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unknown</span>
                                  </label>
                                </div>
                              </div>

                              {/* Card 2: Fund */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100 flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">Fund Selection</h3>
                                  <p className="text-sm text-gray-500 font-medium tracking-tight">Select the fund type they are currently invested in</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full 2xl:w-auto 2xl:min-w-[450px]">
                                  <div className="relative flex-1">
                                    <select className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-800" value={providerForm.fund} onChange={e => setProviderForm(f => ({ ...f, fund: e.target.value, fundUnknown: false }))} disabled={providerForm.fundUnknown}>
                                      {Array.from(new Set(ALL_FUNDS.map(f => f.type))).sort().map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                      <ChevronDown className="w-5 h-5" />
                                    </div>
                                  </div>
                                  <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors shrink-0 sm:min-w-[120px]">
                                    <input type="checkbox" checked={providerForm.fundUnknown} onChange={e => setProviderForm(f => ({ ...f, fundUnknown: e.target.checked, fund: e.target.checked ? '' : f.fund }))} className="rounded border-gray-300 w-4 h-4 text-emerald-900 focus:ring-emerald-900" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unknown</span>
                                  </label>
                                </div>
                              </div>

                              {/* Card 3: Balance */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100 flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">Account Balance</h3>
                                  <p className="text-sm text-gray-500 font-medium tracking-tight">The current total market value of their holdings</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full 2xl:w-auto 2xl:min-w-[450px]">
                                  <div className="flex items-center gap-0 w-full flex-1 relative group">
                                    <div className="h-9 w-10 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md flex items-center justify-center text-emerald-900 font-bold group-focus-within:border-emerald-900 group-focus-within:bg-emerald-900/5 transition-all">$</div>
                                    <input
                                      type="text"
                                      value={providerForm.balance}
                                      onChange={e => setProviderForm(f => ({ ...f, balance: e.target.value, balanceUnknown: false }))}
                                      disabled={providerForm.balanceUnknown}
                                      className="flex-1 h-9 px-4 border border-l-0 border-gray-200 rounded-r-md text-sm bg-gray-50/50 focus:outline-none focus:ring-0 focus:border-emerald-900 group-focus-within:border-emerald-900 transition-all font-bold text-gray-900 w-full disabled:opacity-40"
                                    />
                                  </div>
                                  <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors shrink-0 sm:min-w-[120px]">
                                    <input type="checkbox" checked={providerForm.balanceUnknown} onChange={e => setProviderForm(f => ({ ...f, balanceUnknown: e.target.checked, balance: e.target.checked ? '' : f.balance }))} className="rounded border-gray-300 w-4 h-4 text-emerald-900 focus:ring-emerald-900" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unknown</span>
                                  </label>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded border border-gray-100">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">Joining Date</h3>
                                  <p className="text-xs text-gray-500 mb-3 font-medium">When did they first enroll in KiwiSaver?</p>
                                  <div className="relative">
                                    <select className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-800" value={providerForm.joiningYear} onChange={e => setProviderForm(f => ({ ...f, joiningYear: e.target.value }))}>
                                      {Array.from({ length: 26 }, (_, i) => 2026 - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                      <ChevronDown className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white p-4 rounded border border-gray-100">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">Member Number</h3>
                                  <p className="text-xs text-gray-500 mb-3 font-medium">Their unique account identifier if known</p>
                                  {(() => {
                                    const raw = providerForm.memberNumber.trim();
                                    const isValid = /^\d{3}-\d{3}-\d{3}$/.test(raw);
                                    const hasInput = raw.length > 0;
                                    return (
                                      <>
                                        <input
                                          type="text"
                                          placeholder="XXX-XXX-XXX"
                                          maxLength={11}
                                          value={providerForm.memberNumber}
                                          onChange={e => {
                                            const prev = providerForm.memberNumber;
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            let formatted = digits.length > 6
                                              ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                                              : digits.length > 3
                                                ? `${digits.slice(0, 3)}-${digits.slice(3)}`
                                                : digits;
                                            // Auto-append hyphen after 3rd and 6th digit
                                            if ((digits.length === 3 || digits.length === 6) && e.target.value.length > prev.length) {
                                              formatted += '-';
                                            }
                                            setProviderForm(f => ({ ...f, memberNumber: formatted }));
                                          }}
                                          className={`w-full h-9 px-4 border rounded-sm text-sm bg-gray-50/50 focus:ring-2 transition-all font-bold text-gray-900 placeholder:text-gray-300 ${
                                            hasInput && isValid
                                              ? 'border-green-400 focus:ring-green-500/20 focus:border-green-500'
                                              : hasInput && !isValid
                                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-emerald-900/20 focus:border-emerald-900'
                                          }`}
                                        />
                                        {hasInput && !isValid && (
                                          <p className="text-[11px] text-red-500 mt-1.5 font-medium">Enter a valid 9-digit member number (XXX-XXX-XXX)</p>
                                        )}
                                        {hasInput && isValid && (
                                          <p className="text-[11px] text-green-600 mt-1.5 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Valid member number
                                          </p>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Employment & Tax ── */}
                          <div id="section-employment" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">Employment & Tax</h2>
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Employment Status</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${employmentForm.status ? 'text-emerald-900/60' : 'text-gray-400'}`}>Current Status</label>
                                    <div className="relative">
                                      <select value={employmentForm.status} onChange={e => setEmploymentForm(f => ({ ...f, status: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold">
                                        <option>Employed</option>
                                        <option>Self-employed</option>
                                        <option>Unemployed</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${employmentForm.income.trim() ? 'text-emerald-900/60' : 'text-gray-400'}`}>Annual Gross Income</label>
                                    <div className="flex items-center gap-0 group">
                                      <div className="h-9 w-10 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md flex items-center justify-center text-gray-400 font-bold">$</div>
                                      <input
                                        type="text"
                                        value={employmentForm.income}
                                        onChange={e => setEmploymentForm(f => ({ ...f, income: e.target.value }))}
                                        className="flex-1 h-9 px-4 border border-gray-200 rounded-r-md text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Taxation Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${employmentForm.pirRate ? 'text-emerald-900/60' : 'text-gray-400'}`}>PIR Tax Rate</label>
                                    <div className="relative">
                                      <select value={employmentForm.pirRate} onChange={e => setEmploymentForm(f => ({ ...f, pirRate: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold">
                                        <option>28%</option>
                                        <option>17.5%</option>
                                        <option>10.5%</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${employmentForm.esctRate.trim() ? 'text-emerald-900/60' : 'text-gray-400'}`}>ESCT Rate</label>
                                    <input type="text" value={employmentForm.esctRate} onChange={e => setEmploymentForm(f => ({ ...f, esctRate: e.target.value }))} className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold" />
                                  </div>
                                  <div className="sm:col-span-2 lg:col-span-1">
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${/^\d{3}-\d{3}-\d{3}$/.test(employmentForm.irdNumber.trim()) ? 'text-emerald-900/60' : 'text-gray-400'}`}>IRD Number</label>
                                    {(() => {
                                      const raw = employmentForm.irdNumber.trim();
                                      const isValid = /^\d{3}-\d{3}-\d{3}$/.test(raw);
                                      const hasInput = raw.length > 0;
                                      return (
                                        <>
                                          <input
                                            type="text"
                                            placeholder="XXX-XXX-XXX"
                                            maxLength={11}
                                            value={employmentForm.irdNumber}
                                            onChange={e => {
                                              const prev = employmentForm.irdNumber;
                                              const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                              let formatted = digits.length > 6
                                                ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                                                : digits.length > 3
                                                  ? `${digits.slice(0, 3)}-${digits.slice(3)}`
                                                  : digits;
                                              if ((digits.length === 3 || digits.length === 6) && e.target.value.length > prev.length) {
                                                formatted += '-';
                                              }
                                              setEmploymentForm(f => ({ ...f, irdNumber: formatted }));
                                            }}
                                            className={`w-full h-9 px-4 border rounded-sm text-sm bg-gray-50/50 focus:ring-2 transition-all font-bold text-gray-900 placeholder:text-gray-300 ${
                                              hasInput && isValid
                                                ? 'border-green-400 focus:ring-green-500/20 focus:border-green-500'
                                                : hasInput && !isValid
                                                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                                  : 'border-gray-200 focus:ring-emerald-900/20 focus:border-emerald-900'
                                            }`}
                                          />
                                          {hasInput && !isValid && (
                                            <p className="text-[11px] text-red-500 mt-1.5 font-medium">Enter a valid 9-digit IRD number (XXX-XXX-XXX)</p>
                                          )}
                                          {hasInput && isValid && (
                                            <p className="text-[11px] text-green-600 mt-1.5 font-medium flex items-center gap-1">
                                              <CheckCircle className="w-3 h-3" />
                                              Valid IRD number
                                            </p>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Contribution Rates</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                                  <div>
                                    <label className={`block text-sm font-bold mb-2 transition-colors ${employmentForm.employeeContrib ? 'text-emerald-900/70' : 'text-gray-700'}`}>Employee Contribution</label>
                                    <div className="relative">
                                      <select value={employmentForm.employeeContrib} onChange={e => setEmploymentForm(f => ({ ...f, employeeContrib: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold">
                                        <option>3%</option>
                                        <option>4%</option>
                                        <option>6%</option>
                                        <option>8%</option>
                                        <option>10%</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-bold mb-2 transition-colors ${employmentForm.employerContrib ? 'text-emerald-900/70' : 'text-gray-700'}`}>Employer Contribution</label>
                                    <div className="relative">
                                      <select value={employmentForm.employerContrib} onChange={e => setEmploymentForm(f => ({ ...f, employerContrib: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold">
                                        <option>3%</option>
                                        <option>4%</option>
                                        <option>Other</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                                  <div>
                                    <label className={`block text-sm font-bold mb-2 transition-colors ${employmentForm.voluntaryContrib.trim() ? 'text-emerald-900/70' : 'text-gray-700'}`}>Voluntary Contribution</label>
                                    <div className="flex items-center gap-0">
                                      <div className="h-9 w-10 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md flex items-center justify-center text-gray-400 font-bold">$</div>
                                      <input type="text" placeholder="0.00" value={employmentForm.voluntaryContrib} onChange={e => setEmploymentForm(f => ({ ...f, voluntaryContrib: e.target.value }))} className="flex-1 h-9 px-4 border border-gray-200 rounded-r-md text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-900" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-bold mb-2 transition-colors ${employmentForm.frequency ? 'text-emerald-900/70' : 'text-gray-700'}`}>Frequency</label>
                                    <div className="relative">
                                      <select value={employmentForm.frequency} onChange={e => setEmploymentForm(f => ({ ...f, frequency: e.target.value }))} className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold">
                                        <option>Fortnightly</option>
                                        <option>Monthly</option>
                                        <option>One-off</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Primary Goals ── */}
                          <div id="section-goals" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">Primary Goals</h2>
                            <div className="bg-white rounded border border-gray-100 p-4 sm:p-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">Primary Objective</h3>
                              <p className="text-sm text-gray-500 mb-4 max-w-sm">What is {contacts.find(c => c.id === activeContactId)?.name || clientName}'s primary purpose for their KiwiSaver fund?</p>

                              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                                {(['First Home', 'Retirement'] as const).map(goal => (
                                  <button
                                    key={goal}
                                    onClick={() => setGoalsForm(goal)}
                                    className={`w-full sm:w-auto px-3 py-1.5 rounded-sm text-sm font-bold flex items-center justify-center sm:justify-start gap-2 transition-all border ${goalsForm === goal
                                      ? 'bg-emerald-900/5 text-emerald-900 border-emerald-900'
                                      : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-900/30 hover:bg-gray-50'
                                      }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${goalsForm === goal ? 'border-2 border-emerald-900' : 'border border-gray-200'
                                      }`}>
                                      {goalsForm === goal && <div className="w-1 h-1 rounded-full bg-emerald-900" />}
                                    </div>
                                    {goal}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* ── Other Schemes ── */}
                          <div id="section-other" className="scroll-mt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3">Other Schemes</h2>
                            <div className="space-y-4">
                              {/* NZ Workplace */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <h3 className="text-sm font-bold text-gray-900">NZ workplace superannuation scheme?</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Employer-sponsored retirement savings separate from KiwiSaver</p>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    {(['Yes', 'No'] as const).map(choice => (
                                      <button
                                        key={choice}
                                        onClick={() => setOtherForm(f => ({ ...f, nzWorkplace: choice }))}
                                        className={`px-3 h-8 rounded-sm text-xs font-bold transition-all ${otherForm.nzWorkplace === choice
                                          ? 'bg-emerald-900 text-white'
                                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                      >{choice}</button>
                                    ))}
                                  </div>
                                </div>
                                {otherForm.nzWorkplace === 'Yes' && (
                                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Scheme Name</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. AMP Workplace Savings"
                                        value={otherForm.nzWorkplaceName}
                                        onChange={e => setOtherForm(f => ({ ...f, nzWorkplaceName: e.target.value }))}
                                        className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium placeholder:text-gray-300"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Balance</label>
                                      <div className="flex items-center gap-0">
                                        <div className="h-9 w-10 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md flex items-center justify-center text-gray-400 font-bold">$</div>
                                        <input
                                          type="text"
                                          placeholder="0"
                                          value={otherForm.nzWorkplaceBalance}
                                          onChange={e => setOtherForm(f => ({ ...f, nzWorkplaceBalance: e.target.value }))}
                                          className="flex-1 h-9 px-4 border border-gray-200 rounded-r-md text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Overseas Pension */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <h3 className="text-sm font-bold text-gray-900">Overseas pension or retirement scheme?</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Any retirement savings from another country</p>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    {(['Yes', 'No'] as const).map(choice => (
                                      <button
                                        key={choice}
                                        onClick={() => setOtherForm(f => ({ ...f, overseasPension: choice }))}
                                        className={`px-3 h-8 rounded-sm text-xs font-bold transition-all ${otherForm.overseasPension === choice
                                          ? 'bg-emerald-900 text-white'
                                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                      >{choice}</button>
                                    ))}
                                  </div>
                                </div>
                                {otherForm.overseasPension === 'Yes' && (
                                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Scheme Name</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. UK State Pension"
                                        value={otherForm.overseasName}
                                        onChange={e => setOtherForm(f => ({ ...f, overseasName: e.target.value }))}
                                        className="w-full h-9 px-4 border border-gray-200 rounded-sm text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium placeholder:text-gray-300"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Country</label>
                                      <div className="relative">
                                        <select
                                          value={otherForm.overseasCountry}
                                          onChange={e => setOtherForm(f => ({ ...f, overseasCountry: e.target.value }))}
                                          className="w-full h-9 pl-4 pr-10 border border-gray-200 rounded-sm text-sm bg-gray-50/50 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-medium"
                                        >
                                          <option value="">Select country</option>
                                          <option value="United Kingdom">United Kingdom</option>
                                          <option value="Australia">Australia</option>
                                          <option value="United States">United States</option>
                                          <option value="Canada">Canada</option>
                                          <option value="Ireland">Ireland</option>
                                          <option value="South Africa">South Africa</option>
                                          <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                          <ChevronDown className="w-4 h-4" />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Balance</label>
                                      <div className="flex items-center gap-0">
                                        <div className="h-9 w-10 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md flex items-center justify-center text-gray-400 font-bold">$</div>
                                        <input
                                          type="text"
                                          placeholder="0"
                                          value={otherForm.overseasBalance}
                                          onChange={e => setOtherForm(f => ({ ...f, overseasBalance: e.target.value }))}
                                          className="flex-1 h-9 px-4 border border-gray-200 rounded-r-md text-sm bg-gray-50/50 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Additional Notes */}
                              <div className="bg-white p-4 rounded-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Additional Notes</h3>
                                <p className="text-xs text-gray-400 mb-3">Capture any specific details about properties, inheritance, or future retirement plans.</p>
                                <textarea
                                  placeholder="Enter any additional notes..."
                                  rows={3}
                                  value={otherForm.notes}
                                  onChange={e => setOtherForm(f => ({ ...f, notes: e.target.value }))}
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm font-medium resize-none bg-gray-50/30 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all placeholder:text-gray-300"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'meeting' && (
                <div className="p-4 sm:p-4">
                  <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar items-center lg:items-stretch">
                        {[
                          { id: 'meeting', label: 'Meeting', icon: Calendar, active: true },
                          { id: 'transcript', label: 'Transcript', icon: FileText },
                          { id: 'summary', label: 'Summary', icon: FileCheck },
                          { id: 'compliance', label: 'Compliance', icon: CheckCircle },
                          { id: 'sales', label: 'Sales Coach', icon: Target },
                          { id: 'actions', label: 'Actions', icon: CheckCircle },
                          { id: 'map', label: 'Mind Map', icon: Target },
                        ].map((section) => {
                          const Icon = section.icon;
                          return (
                            <button
                              key={section.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors whitespace-nowrap lg:w-full ${section.active
                                ? 'bg-emerald-900 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium">{section.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Main Content - Meeting Form */}
                      <div className="lg:col-span-3">
                        <div className="bg-white rounded-sm border border-gray-200 p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Notes</h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                              <input
                                type="text"
                                defaultValue={meetingData.title}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                                <input
                                  type="text"
                                  defaultValue={meetingData.dateTime}
                                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                <input
                                  type="text"
                                  defaultValue={meetingData.endTime}
                                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Calendar</label>
                                <button className="w-full px-3 py-2 border border-gray-200 rounded text-sm flex items-center gap-2 hover:bg-gray-50 bg-white">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>Calendar</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                              <input
                                type="text"
                                defaultValue={meetingData.location}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                              <div className="flex flex-wrap items-center gap-2">
                                {['In Person', 'Video', 'Phone'].map((type) => (
                                  <button
                                    key={type}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded text-sm font-medium transition-colors ${meetingData.type === type
                                      ? 'bg-emerald-900 text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                                      }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Link</label>
                              <input
                                type="text"
                                defaultValue={meetingData.meetingLink}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                                placeholder="https://teams.myadviser.com/..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                              <input
                                type="text"
                                defaultValue={meetingData.attendees}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                              <div className="flex items-center gap-2 mb-2">
                                <button className="p-2 hover:bg-gray-100 rounded">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                </button>
                                <span className="text-xs text-gray-500">Add 368</span>
                              </div>
                              <textarea
                                className="w-full border border-gray-200 rounded p-3 text-sm bg-white"
                                rows={6}
                                placeholder="Enter meeting transcript/notes here..."
                                defaultValue={meetingData.notes}
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4">
                              <button className="text-sm text-emerald-900 hover:text-emerald-950 font-medium">
                                Generate Teams Link
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                              onClick={() => setActiveTab('assessment')}
                              className="w-full sm:w-auto px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-bold border border-transparent hover:border-gray-200"
                            >
                              Back to Assessment
                            </button>
                            <button
                              onClick={() => setActiveTab('risk')}
                              className="w-full sm:ml-auto sm:w-auto px-10 py-2.5 bg-emerald-900 text-white text-sm rounded hover:bg-emerald-950 transition-all font-bold shadow-sm active:scale-95"
                            >
                              Next Step: Risk Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'risk' && (
                <div className="p-4 sm:p-4">
                  <div className="max-w-[1200px] mx-auto">
                    <div className="bg-white rounded-sm border border-gray-200 p-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">KiwiSaver Risk Assessment</h3>
                          <span className="text-sm text-emerald-900 font-medium">for {clientName}</span>
                        </div>
                        <div className="bg-emerald-900/10 border border-emerald-900 rounded p-4 mt-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-emerald-900 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              Your Risk Tolerance Score <span className="font-semibold">Aggressive</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {riskQuestions.map((q, idx) => (
                          <ExpandableSection
                            key={q.id}
                            icon={Target}
                            title={`Question ${idx + 1}`}
                            subtitle={q.selected}
                            defaultOpen={idx === 0}
                          >
                            <div className="p-4 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700 mb-4">{q.question}</p>
                              <div className="space-y-2">
                                {q.options.map((option) => (
                                  <label
                                    key={option}
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded cursor-pointer hover:border-emerald-900 transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      checked={q.selected === option}
                                      className="w-4 h-4 text-emerald-900"
                                      readOnly
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </ExpandableSection>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setActiveTab('meeting')}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setActiveTab('projection')}
                          className="px-4 py-2 bg-emerald-900 text-white text-sm rounded hover:bg-emerald-950 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projection' && (
                <div className="p-4 sm:p-4">
                  <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Left Sidebar */}
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-sm border border-gray-200 p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Graph Data</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-900/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-900" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Another User</p>
                                <p className="text-xs text-gray-400">Primary Contact</p>
                              </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-emerald-900 text-white text-sm rounded hover:bg-emerald-950 transition-colors">
                              Save Scenarios
                            </button>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-900 mb-3">Other Scenarios (0)</h4>
                            <div className="space-y-2">
                              <button className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2">
                                <span>Scenario 1</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Content - Projection Chart */}
                      <div className="lg:col-span-3">
                        <div className="bg-white rounded-sm border border-gray-200 p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">KiwiSaver Balance Projection</h3>

                          <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={projectionData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis
                                dataKey="year"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                              />
                              <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                              />
                              <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value: any) => `$${value.toLocaleString()}`}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="lowerGrowth"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                name="Lower Growth"
                                strokeDasharray="5 5"
                              />
                              <Line
                                type="monotone"
                                dataKey="baseGrowth"
                                stroke="#0B3D2E"
                                strokeWidth={3}
                                name="Base Growth"
                              />
                              <Line
                                type="monotone"
                                dataKey="higherGrowth"
                                stroke="#081C15"
                                strokeWidth={2}
                                name="Higher Growth"
                                strokeDasharray="5 5"
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          <div className="mt-6 p-4 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-4">
                              Projections are estimates only and actual results may differ due to market conditions, rule changes, contributions and other factors.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Projected Balance at Retirement</p>
                                <p className="text-xl font-bold text-emerald-950">$542</p>
                                <p className="text-xs text-gray-500 mt-1">Another User (65y)</p>
                              </div>
                              <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Next Contribution Date</p>
                                <p className="text-xl font-bold text-emerald-950">$542</p>
                                <p className="text-xs text-gray-500 mt-1">Another User (70y)</p>
                              </div>
                              <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Weekly / Bi-Weekly</p>
                                <p className="text-xl font-bold text-emerald-950">$65wk</p>
                                <p className="text-xs text-gray-500 mt-1">Monthly / Annually</p>
                              </div>
                              <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Employer Contributions</p>
                                <p className="text-xl font-bold text-emerald-950">$850</p>
                                <p className="text-xs text-gray-500 mt-1">Current / Expected</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                            <button
                              onClick={() => setActiveTab('risk')}
                              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => setActiveTab('comparison')}
                              className="px-4 py-2 bg-emerald-900 text-white text-sm rounded hover:bg-emerald-950 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="p-4 sm:p-4">
                  <div className="max-w-[1400px] mx-auto">
                    {!showReportPreview ? (
                      <div className="bg-white rounded-sm border border-gray-200 p-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Fund Comparison</h3>
                            <p className="text-sm text-gray-500 mt-1">Select funds to include in the recommendation and providing justifications.</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${selectedFunds.length >= 2 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {selectedFunds.length >= 2 ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            <span>{selectedFunds.length} of 2 required funds selected</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Current Fund */}
                          <div className={`p-4 rounded border transition-all ${selectedFunds.includes('current')
                            ? 'border-emerald-900 bg-emerald-900/5 ring-4 ring-emerald-900/5'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                            }`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex w-fit px-2 py-1 bg-emerald-900 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                  Current
                                </span>
                              </div>
                              <div className="w-5 h-5 bg-emerald-900 rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="text-[9px] font-bold text-emerald-900 uppercase tracking-widest block mb-1.5 ml-1">Select Fund</label>
                              <div className="relative group/select">
                                <select
                                  value={funds.current.id}
                                  onChange={(e) => {
                                    const selected = ALL_FUNDS.find(f => f.id === e.target.value);
                                    if (selected) setFunds(prev => ({ ...prev, current: selected }));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-sm px-4 py-3 text-sm font-bold text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all shadow-sm group-hover/select:border-gray-300 pr-10"
                                >
                                  {ALL_FUNDS.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-emerald-900 transition-colors">
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 ml-1 italic">{funds.current.provider}</p>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Type</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.current.type}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Fees</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.current.fees}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">5yr Returns</span>
                                <span className="text-xs font-bold text-green-600 font-mono">{funds.current.returns5yr}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Risk</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.current.riskProfile}</span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-dashed border-gray-200">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Reason</p>
                              <textarea
                                className="w-full border border-gray-200 rounded p-3 text-xs focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all bg-white"
                                rows={3}
                                placeholder="Why keep with current fund?"
                                value={justifications.current}
                                onChange={(e) => setJustifications({ ...justifications, current: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Recommended Fund */}
                          <div className={`p-4 rounded border transition-all ${selectedFunds.includes('recommended')
                            ? 'border-green-600 bg-green-50/30 ring-4 ring-green-600/5'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                            }`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex w-fit px-2 py-1 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                  Recommended
                                </span>
                              </div>
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-1.5 ml-1">Select Fund</label>
                              <div className="relative group/select">
                                <select
                                  value={funds.recommended.id}
                                  onChange={(e) => {
                                    const selected = ALL_FUNDS.find(f => f.id === e.target.value);
                                    if (selected) setFunds(prev => ({ ...prev, recommended: selected }));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-sm px-4 py-3 text-sm font-bold text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all shadow-sm group-hover/select:border-gray-300 pr-10"
                                >
                                  {ALL_FUNDS.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-green-600 transition-colors">
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 ml-1 italic">{funds.recommended.provider}</p>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Type</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.recommended.type}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Fees</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.recommended.fees}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">5yr Returns</span>
                                <span className="text-xs font-bold text-green-600 font-mono">{funds.recommended.returns5yr}</span>
                              </div>
                              <div className="p-2 rounded bg-white/50 border border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight block">Risk</span>
                                <span className="text-xs font-semibold text-gray-900">{funds.recommended.riskProfile}</span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-dashed border-gray-200">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Advice Comment</p>
                              <textarea
                                className="w-full border border-gray-200 rounded p-3 text-xs focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all bg-white"
                                rows={3}
                                placeholder="Why we recommend this fund?"
                                value={justifications.recommended}
                                onChange={(e) => setJustifications({ ...justifications, recommended: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Alternative Fund Card */}
                          <div className="p-4 rounded border border-dashed border-gray-200 hover:border-emerald-900/40 hover:bg-gray-50/50 transition-all flex flex-col items-center justify-center min-h-[400px] group/alt">
                            <div className="text-center">
                              <div className="w-14 h-14 bg-gray-100 group-hover/alt:bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                <Plus className="w-6 h-6 text-gray-400 group-hover/alt:text-emerald-900" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 font-bold uppercase tracking-widest text-[10px]">Compare Another</h4>
                              <p className="text-xs text-gray-500 mb-4 max-w-[160px]">
                                Add a secondary alternative to provide a broader comparison.
                              </p>
                              <button className="px-5 py-2.5 bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 rounded hover:border-emerald-900 hover:text-emerald-900 transition-all shadow-sm">
                                Add Fund
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                          <button
                            onClick={() => setActiveTab('projection')}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                          </button>
                          <button
                            onClick={handleGenerateReport}
                            disabled={selectedFunds.length < 2}
                            className={`flex items-center gap-2 px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${selectedFunds.length >= 2
                              ? 'bg-emerald-900 text-white hover:bg-emerald-950 '
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            Show Report Preview
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-4 duration-500">
                        {/* Report Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                          <div className="bg-white rounded-sm border border-gray-200 p-4 shadow-sm">
                            <button
                              onClick={() => setShowReportPreview(false)}
                              className="w-full mb-4 px-4 py-3 bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-emerald-900 hover:text-emerald-900 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-sm hover: active:scale-[0.98]"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                              Back to Comparison
                            </button>

                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scenarios</h3>
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">1 Active</span>
                            </div>
                            <div className="space-y-2 mb-3">
                              {[1].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => setSelectedScenario(num)}
                                  className={`w-full text-left px-4 py-3 rounded-sm text-sm font-medium transition-all ${selectedScenario === num
                                    ? 'bg-emerald-900 text-white '
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                  Scenario {num}
                                </button>
                              ))}
                            </div>

                            <div className="pt-5 border-t border-gray-100 mb-3">
                              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Compared Funds</h3>
                              <div className="space-y-3">
                                {selectedFunds.map((fundKey) => {
                                  const fund = funds[fundKey as keyof typeof funds];
                                  if (!fund) return null;
                                  return (
                                    <div key={fundKey} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-sm border border-gray-100">
                                      <div className={`w-2 h-2 rounded-full ${fundKey === 'current' ? 'bg-emerald-900' : fundKey === 'recommended' ? 'bg-green-600' : 'bg-amber-500'}`} />
                                      <div>
                                        <p className="text-[11px] font-bold text-gray-900 leading-tight">{fund.name}</p>
                                        <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter mt-0.5">
                                          {fundKey === 'current' ? 'Current' : fundKey === 'recommended' ? 'Recommended' : 'Alternative'}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-5 border-t border-gray-100">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contacts</h4>
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm border border-gray-100">
                                <div className="w-10 h-10 rounded-sm bg-emerald-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                  {clientName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-900">{clientName}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">Primary Client</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Export Options */}
                          <div className="bg-emerald-900 rounded-sm p-4 text-white ">
                            <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Action Required</h4>
                            <p className="text-xs leading-relaxed mb-4 opacity-90">
                              Review the generated Statement of Advice. If accurate, proceed to internal review or send directly to the client.
                            </p>
                            <div className="space-y-3">
                              {workflowStatus === 'draft' && (
                                <button
                                  onClick={handleSendForReview}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-900 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/95 transition-all "
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Send for Review
                                </button>
                              )}
                              {workflowStatus === 'approved' && (
                                <button
                                  onClick={handleSendToClient}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-green-600 transition-all "
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Send to Client
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Main Content - Report Preview */}
                        <div className="lg:col-span-3">
                          <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[800px]">
                            {/* Report Preview Header (Toolbar) */}
                            <div className="bg-white border-b border-gray-200">
                              <div className="px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors group">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    Save Draft
                                  </button>
                                  <button
                                    onClick={handleSendForReview}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors group"
                                  >
                                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    Send for Review
                                  </button>
                                  <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors group">
                                    <Layers className="w-4 h-4" />
                                    Variables Highlighted
                                  </button>
                                  <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors group">
                                    <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                                    Download PDF
                                  </button>
                                </div>

                                <div className="flex items-center gap-4">
                                  {workflowStatus !== 'draft' && (
                                    <div className={`px-2.5 py-1 rounded-full ${statusInfo.color} border border-current text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                                      <StatusIcon className="w-3 h-3" />
                                      <span>{statusInfo.label}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Saved Status Sub-bar */}
                              <div className="px-6 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end">
                                <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
                                  Draft saved: 2:54 pm 5 Mar 2026
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Report Container */}
                            <div className="flex-1 bg-gray-100/50 p-6 overflow-y-auto">
                              <div className="max-w-[800px] mx-auto bg-white rounded-sm p-16 min-h-[1056px] relative ring-1 ring-gray-200">
                                {/* Page Decoration */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-900" />

                                <div className="mt-8 mb-20">
                                  <PiggyBank className="w-10 h-10 text-emerald-900 mb-4" />
                                  <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tighter">KiwiSaver</h1>
                                  <h2 className="text-3xl font-light text-gray-400 -mt-1 tracking-tight">Statement of Advice</h2>
                                </div>

                                <div className="space-y-10 pt-12 border-t border-gray-100">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Prepared For</p>
                                      <p className="text-xl font-bold text-gray-900">{clientName}</p>
                                      <p className="text-sm text-gray-500 mt-1">Primary Client Portfolio</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Date Prepared</p>
                                      <p className="text-xl font-bold text-gray-900">5 March 2026</p>
                                    </div>
                                  </div>

                                  {/* Comparison Details Section */}
                                  <div className="pt-12 border-t border-gray-100">
                                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest mb-4">Recommendation Analysis</p>
                                    <div className="grid grid-cols-1 gap-4">
                                      {selectedFunds.map((fundKey) => {
                                        const fund = funds[fundKey as keyof typeof funds];
                                        if (!fund) return null;
                                        return (
                                          <div key={fundKey} className="p-4 bg-gray-50/50 rounded border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                              <div>
                                                <p className="text-sm font-bold text-gray-900">{fund.name}</p>
                                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">{fund.provider}</p>
                                              </div>
                                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${fundKey === 'current' ? 'bg-emerald-900 text-white' : fundKey === 'recommended' ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                                {fundKey === 'current' ? 'Current Fund' : fundKey === 'recommended' ? 'Our Recommendation' : 'Alternative Option'}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Fees</p>
                                                <p className="text-xs font-semibold text-gray-900">{fund.fees}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Risk</p>
                                                <p className="text-xs font-semibold text-gray-900">{fund.riskProfile}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">5yr Performance</p>
                                                <p className="text-xs font-bold text-green-600">{fund.returns5yr}</p>
                                              </div>
                                            </div>
                                            {justifications[fundKey as keyof typeof justifications] && (
                                              <div className="pt-4 border-t border-gray-200 border-dashed">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Internal Justification</p>
                                                <p className="text-xs text-gray-600 leading-relaxed italic">"{justifications[fundKey as keyof typeof justifications]}"</p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Advisor</p>
                                      <p className="text-xl font-bold text-gray-900">Admin User</p>
                                      <p className="text-sm text-gray-500 mt-1">Certified Financial Planner</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Assessment ID</p>
                                      <p className="text-xl font-bold text-gray-900">#SOA-2026-0041</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-32 pt-12 border-t border-gray-100">
                                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-sm">
                                    This Statement of Advice is strictly confidential and has been prepared specifically for the client named above.
                                    Distribution to third parties without prior written consent is prohibited.
                                  </p>
                                </div>

                                <div className="absolute bottom-12 right-16 flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest leading-none">Powered by</p>
                                    <p className="text-sm font-bold text-emerald-900 leading-tight">Antigravity</p>
                                  </div>
                                  <div className="w-8 h-8 bg-emerald-900 rounded"></div>
                                </div>
                              </div>

                              {/* Workflow Timeline Section */}
                              {workflowStatus !== 'draft' && (
                                <div className="max-w-[800px] mx-auto mt-12 mb-12">
                                  <div className="bg-white rounded-sm border border-gray-200 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Workflow Audit History</h3>
                                    <div className="space-y-4">
                                      <WorkflowStep
                                        status="completed"
                                        title="SOA Draft Finalized"
                                        timestamp="5 March 2026, 10:30 AM"
                                        user="Admin User"
                                      />
                                      {['pending_review', 'approved', 'sent_to_client', 'signed', 'completed'].includes(workflowStatus) && (
                                        <WorkflowStep
                                          status="completed"
                                          title="Internal Review Initiated"
                                          timestamp="5 March 2026, 11:45 AM"
                                          user="Admin User"
                                        />
                                      )}
                                      {['approved', 'sent_to_client', 'signed', 'completed'].includes(workflowStatus) && (
                                        <WorkflowStep
                                          status="completed"
                                          title="Compliance Approval Granted"
                                          timestamp="5 March 2026, 2:15 PM"
                                          user="Compliance Officer"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

          // Helper Components

          interface ExpandableSectionProps {
            icon: any;
          title: string;
          subtitle?: string;
          children: React.ReactNode;
          defaultOpen?: boolean;
          completedCount?: number;
          totalCount?: number;
}

          function ExpandableSection({
            icon: Icon,
          title,
          subtitle,
          children,
          defaultOpen = false,
          completedCount,
          totalCount
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
          const hasProgress = completedCount !== undefined && totalCount !== undefined;
          const progressPercentage = hasProgress ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
          <div className="border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-emerald-900/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-900" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    {hasProgress && (
                      <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                        <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${progressPercentage === 100 ? 'bg-green-500' : 'bg-emerald-900'}`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${progressPercentage === 100 ? 'text-green-600' : 'text-gray-400'}`}>
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    )}
                  </div>
                  {subtitle && <p className="text-xs text-emerald-900 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && <div className="border-t border-gray-200">{children}</div>}
          </div>
          );
}

          interface WorkflowStepProps {
            status: 'completed' | 'pending' | 'upcoming';
          title: string;
          timestamp: string;
          user: string;
}

          function WorkflowStep({status, title, timestamp, user}: WorkflowStepProps) {
  return (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {status === 'completed' && (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
              {status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              )}
              {status === 'upcoming' && (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{timestamp}</p>
              <p className="text-xs text-gray-500">by {user}</p>
            </div>
          </div>
          );
}
