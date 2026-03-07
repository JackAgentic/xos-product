import { useState } from 'react';
import { toast } from 'sonner';
import {
  UserCircle,
  Users,
  FileText,
  Building,
  MapPin,
  Shield,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2
} from 'lucide-react';

export function FactFindView({
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: {
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}) {
  const [selectedEntity, setSelectedEntity] = useState('individual');
  const [activeTab, setActiveTab] = useState('client-info');
  const [entitySelected, setEntitySelected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form data state
  const [clientInfoData, setClientInfoData] = useState({
    entityType: 'individual',
    primaryContact: '',
    secondaryContact: '',
    // Individual/Household fields
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    mobile: '',
    preferredContact: 'email',
    // Household specific
    partner1FirstName: '',
    partner1LastName: '',
    partner1DOB: '',
    partner2FirstName: '',
    partner2LastName: '',
    partner2DOB: '',
    // Trust fields
    trustName: '',
    trustType: '',
    establishmentDate: '',
    trustees: '',
    beneficiaries: '',
    // Company fields
    companyName: '',
    tradingName: '',
    companyNumber: '',
    incorporationDate: '',
    directors: '',
    shareholders: '',
  });

  const [contactData, setContactData] = useState({
    residentialAddress: '',
    residentialCity: '',
    residentialPostcode: '',
    mailingAddress: '',
    mailingCity: '',
    mailingPostcode: '',
    sameAsResidential: false,
  });

  const [complianceData, setComplianceData] = useState({
    identityVerified: false,
    amlCompleted: false,
    cddCompleted: false,
    privacyConsent: false,
    termsAccepted: false,
    disclosureProvided: false,
  });

  const [financialsData, setFinancialsData] = useState({
    annualIncome: '',
    employmentStatus: '',
    employer: '',
    occupation: '',
    assetsValue: '',
    liabilitiesValue: '',
    monthlyExpenses: '',
    riskProfile: 'moderate',
  });

  const [dependentsData, setDependentsData] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    financiallyDependent: boolean;
  }>>([]);

  const tabs = [
    { id: 'client-info', label: 'Client Info', icon: UserCircle },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'dependents', label: 'Dependents', icon: Users },
  ];

  const handleEntitySelection = (entity: string) => {
    setSelectedEntity(entity);
    setEntitySelected(true);
    setClientInfoData(prev => ({ ...prev, entityType: entity }));
  };

  const addDependent = () => {
    setDependentsData([
      ...dependentsData,
      {
        id: Date.now().toString(),
        name: '',
        relationship: '',
        dateOfBirth: '',
        financiallyDependent: true,
      },
    ]);
  };

  const removeDependent = (id: string) => {
    setDependentsData(dependentsData.filter(d => d.id !== id));
  };

  const updateDependent = (id: string, field: string, value: any) => {
    setDependentsData(
      dependentsData.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };

  const handleSaveAndContinue = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      // Go to next tab
      setActiveTab(tabs[currentIndex + 1].id);
    } else {
      // On last tab - save and complete
      console.log('Fact-find completed!');
      toast.success('Fact-find completed successfully!', {
        icon: <CheckCircle2 className="w-5 h-5" />
      });
      setIsCompleted(true);
    }
  };

  const handleEdit = () => {
    setIsCompleted(false);
    setActiveTab('client-info');
  };

  const isLastTab = activeTab === tabs[tabs.length - 1].id;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format compliance checkbox labels
  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Read-only completed view
  if (isCompleted && entitySelected) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50" data-ai-section="Fact Find">
        <div className="p-4 sm:p-6 pb-24">
          <div className="max-w-5xl mx-auto relative">

            {/* Header with Edit Button */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">Fact-Find</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                </div>
                <p className="text-gray-600">Review the completed fact-find information below.</p>
              </div>
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10 whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </button>
            </div>

            {/* Entity Badge */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 rounded-sm border border-emerald-900">
                {selectedEntity === 'individual' && <UserCircle className="w-4 h-4 text-emerald-900" />}
                {selectedEntity === 'household' && <Users className="w-4 h-4 text-emerald-900" />}
                {selectedEntity === 'trust' && <FileText className="w-4 h-4 text-emerald-900" />}
                {selectedEntity === 'company' && <Building className="w-4 h-4 text-emerald-900" />}
                <span className="text-sm font-medium text-emerald-950 capitalize">{selectedEntity}</span>
              </div>
            </div>

            {/* Read-Only Content Sections */}
            <div className="space-y-4">
              {/* Client Info Section */}
              <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Client Information">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-lg font-semibold">Client Information</h3>
                </div>

                {selectedEntity === 'individual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Individual Details">
                    <div data-ai-field="fullName" data-ai-label="Full Name">
                      <div className="text-sm font-medium text-gray-500">Full Name</div>
                      <div className="mt-1">
                        {[clientInfoData.firstName, clientInfoData.middleName, clientInfoData.lastName]
                          .filter(Boolean)
                          .join(' ') || 'Not provided'}
                      </div>
                    </div>
                    <div data-ai-field="dateOfBirth" data-ai-label="Date of Birth">
                      <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                      <div className="mt-1">{formatDate(clientInfoData.dateOfBirth)}</div>
                    </div>
                    <div data-ai-field="gender" data-ai-label="Gender">
                      <div className="text-sm font-medium text-gray-500">Gender</div>
                      <div className="mt-1 capitalize">{clientInfoData.gender || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="email" data-ai-label="Email">
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="mt-1">{clientInfoData.email || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="phone" data-ai-label="Phone">
                      <div className="text-sm font-medium text-gray-500">Phone</div>
                      <div className="mt-1">{clientInfoData.phone || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="mobile" data-ai-label="Mobile">
                      <div className="text-sm font-medium text-gray-500">Mobile</div>
                      <div className="mt-1">{clientInfoData.mobile || 'Not provided'}</div>
                    </div>
                  </div>
                )}

                {selectedEntity === 'household' && (
                  <div className="space-y-6" data-ai-section="Household Details">
                    <div data-ai-section="Partner 1">
                      <h4 className="font-medium text-gray-700 mb-3">Partner 1</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div data-ai-field="partner1Name" data-ai-label="Partner 1 Name">
                          <div className="text-sm font-medium text-gray-500">Name</div>
                          <div className="mt-1">
                            {[clientInfoData.partner1FirstName, clientInfoData.partner1LastName]
                              .filter(Boolean)
                              .join(' ') || 'Not provided'}
                          </div>
                        </div>
                        <div data-ai-field="partner1DOB" data-ai-label="Partner 1 Date of Birth">
                          <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                          <div className="mt-1">{formatDate(clientInfoData.partner1DOB)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-6" data-ai-section="Partner 2">
                      <h4 className="font-medium text-gray-700 mb-3">Partner 2</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div data-ai-field="partner2Name" data-ai-label="Partner 2 Name">
                          <div className="text-sm font-medium text-gray-500">Name</div>
                          <div className="mt-1">
                            {[clientInfoData.partner2FirstName, clientInfoData.partner2LastName]
                              .filter(Boolean)
                              .join(' ') || 'Not provided'}
                          </div>
                        </div>
                        <div data-ai-field="partner2DOB" data-ai-label="Partner 2 Date of Birth">
                          <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                          <div className="mt-1">{formatDate(clientInfoData.partner2DOB)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntity === 'trust' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Trust Details">
                    <div className="md:col-span-2" data-ai-field="trustName" data-ai-label="Trust Name">
                      <div className="text-sm font-medium text-gray-500">Trust Name</div>
                      <div className="mt-1">{clientInfoData.trustName || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="trustType" data-ai-label="Trust Type">
                      <div className="text-sm font-medium text-gray-500">Trust Type</div>
                      <div className="mt-1 capitalize">{clientInfoData.trustType || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="establishmentDate" data-ai-label="Establishment Date">
                      <div className="text-sm font-medium text-gray-500">Establishment Date</div>
                      <div className="mt-1">{formatDate(clientInfoData.establishmentDate)}</div>
                    </div>
                    <div className="md:col-span-2" data-ai-field="trustees" data-ai-label="Trustees">
                      <div className="text-sm font-medium text-gray-500">Trustees</div>
                      <div className="mt-1 whitespace-pre-wrap">{clientInfoData.trustees || 'Not provided'}</div>
                    </div>
                    <div className="md:col-span-2" data-ai-field="beneficiaries" data-ai-label="Beneficiaries">
                      <div className="text-sm font-medium text-gray-500">Beneficiaries</div>
                      <div className="mt-1 whitespace-pre-wrap">{clientInfoData.beneficiaries || 'Not provided'}</div>
                    </div>
                  </div>
                )}

                {selectedEntity === 'company' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Company Details">
                    <div className="md:col-span-2" data-ai-field="companyName" data-ai-label="Company Name">
                      <div className="text-sm font-medium text-gray-500">Company Name</div>
                      <div className="mt-1">{clientInfoData.companyName || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="tradingName" data-ai-label="Trading Name">
                      <div className="text-sm font-medium text-gray-500">Trading Name</div>
                      <div className="mt-1">{clientInfoData.tradingName || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="companyNumber" data-ai-label="Company Number">
                      <div className="text-sm font-medium text-gray-500">Company Number</div>
                      <div className="mt-1">{clientInfoData.companyNumber || 'Not provided'}</div>
                    </div>
                    <div data-ai-field="incorporationDate" data-ai-label="Incorporation Date">
                      <div className="text-sm font-medium text-gray-500">Incorporation Date</div>
                      <div className="mt-1">{formatDate(clientInfoData.incorporationDate)}</div>
                    </div>
                    <div className="md:col-span-2" data-ai-field="directors" data-ai-label="Directors">
                      <div className="text-sm font-medium text-gray-500">Directors</div>
                      <div className="mt-1 whitespace-pre-wrap">{clientInfoData.directors || 'Not provided'}</div>
                    </div>
                    <div className="md:col-span-2" data-ai-field="shareholders" data-ai-label="Shareholders">
                      <div className="text-sm font-medium text-gray-500">Shareholders</div>
                      <div className="mt-1 whitespace-pre-wrap">{clientInfoData.shareholders || 'Not provided'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Section */}
              <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Contact Details">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-lg font-semibold">Contact Details</h3>
                </div>

                <div className="space-y-6">
                  <div data-ai-field="residentialAddress" data-ai-label="Residential Address">
                    <h4 className="font-medium text-gray-700 mb-3">Residential Address</h4>
                    <div className="text-gray-900">
                      {contactData.residentialAddress && (
                        <div>{contactData.residentialAddress}</div>
                      )}
                      {(contactData.residentialCity || contactData.residentialPostcode) && (
                        <div>
                          {[contactData.residentialCity, contactData.residentialPostcode]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                      {!contactData.residentialAddress && !contactData.residentialCity && !contactData.residentialPostcode && (
                        <div className="text-gray-500">Not provided</div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6" data-ai-field="mailingAddress" data-ai-label="Mailing Address">
                    <h4 className="font-medium text-gray-700 mb-3">Mailing Address</h4>
                    {contactData.sameAsResidential ? (
                      <div className="text-gray-600 italic">Same as residential address</div>
                    ) : (
                      <div className="text-gray-900">
                        {contactData.mailingAddress && (
                          <div>{contactData.mailingAddress}</div>
                        )}
                        {(contactData.mailingCity || contactData.mailingPostcode) && (
                          <div>
                            {[contactData.mailingCity, contactData.mailingPostcode]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        )}
                        {!contactData.mailingAddress && !contactData.mailingCity && !contactData.mailingPostcode && (
                          <div className="text-gray-500">Not provided</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compliance Section */}
              <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Compliance">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-lg font-semibold">Compliance</h3>
                </div>

                <div className="space-y-2">
                  {Object.entries(complianceData).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 py-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${value ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        {value && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                      <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                        {formatLabel(key)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials Section */}
              <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Financial Information">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-ai-field="annualIncome" data-ai-label="Annual Income">
                    <div className="text-sm font-medium text-gray-500">Annual Income</div>
                    <div className="mt-1">{financialsData.annualIncome || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="employmentStatus" data-ai-label="Employment Status">
                    <div className="text-sm font-medium text-gray-500">Employment Status</div>
                    <div className="mt-1 capitalize">{financialsData.employmentStatus || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="employer" data-ai-label="Employer">
                    <div className="text-sm font-medium text-gray-500">Employer</div>
                    <div className="mt-1">{financialsData.employer || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="occupation" data-ai-label="Occupation">
                    <div className="text-sm font-medium text-gray-500">Occupation</div>
                    <div className="mt-1">{financialsData.occupation || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="assetsValue" data-ai-label="Total Assets">
                    <div className="text-sm font-medium text-gray-500">Total Assets</div>
                    <div className="mt-1">{financialsData.assetsValue || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="liabilitiesValue" data-ai-label="Total Liabilities">
                    <div className="text-sm font-medium text-gray-500">Total Liabilities</div>
                    <div className="mt-1">{financialsData.liabilitiesValue || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="monthlyExpenses" data-ai-label="Monthly Expenses">
                    <div className="text-sm font-medium text-gray-500">Monthly Expenses</div>
                    <div className="mt-1">{financialsData.monthlyExpenses || 'Not provided'}</div>
                  </div>
                  <div data-ai-field="riskProfile" data-ai-label="Risk Profile">
                    <div className="text-sm font-medium text-gray-500">Risk Profile</div>
                    <div className="mt-1 capitalize">{financialsData.riskProfile || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Dependents Section */}
              <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Dependents">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-lg font-semibold">Dependents</h3>
                </div>

                {dependentsData.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No dependents added</div>
                ) : (
                  <div className="space-y-4">
                    {dependentsData.map((dependent, index) => (
                      <div key={dependent.id} className="p-4 border border-gray-200 rounded-sm" data-ai-section={`Dependent ${index + 1}`}>
                        <div className="font-medium text-gray-900 mb-3">Dependent {index + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div data-ai-field={`dependent${index + 1}Name`} data-ai-label={`Dependent ${index + 1} Name`}>
                            <div className="text-sm font-medium text-gray-500">Name</div>
                            <div className="mt-1">{dependent.name || 'Not provided'}</div>
                          </div>
                          <div data-ai-field={`dependent${index + 1}Relationship`} data-ai-label={`Dependent ${index + 1} Relationship`}>
                            <div className="text-sm font-medium text-gray-500">Relationship</div>
                            <div className="mt-1 capitalize">{dependent.relationship || 'Not provided'}</div>
                          </div>
                          <div data-ai-field={`dependent${index + 1}DOB`} data-ai-label={`Dependent ${index + 1} Date of Birth`}>
                            <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                            <div className="mt-1">{formatDate(dependent.dateOfBirth)}</div>
                          </div>
                          <div data-ai-field={`dependent${index + 1}FinanciallyDependent`} data-ai-label={`Dependent ${index + 1} Financially Dependent`}>
                            <div className="text-sm font-medium text-gray-500">Financially Dependent</div>
                            <div className="mt-1">{dependent.financiallyDependent ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editable form view
  return (
    <div className="flex-1 overflow-auto bg-gray-50" data-ai-section="Fact Find">
      <div className="p-4 sm:p-6 pb-24">

        <div className="max-w-5xl mx-auto relative">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Fact-Find</h2>
            <p className="text-gray-600">Complete each section to finish the fact-find process.</p>
          </div>

          {/* Entity Type Selection */}
          {!entitySelected ? (
            <div className="bg-white rounded-sm border border-gray-200 p-6" data-ai-section="Entity Type Selection">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Entity Type</h3>
                <p className="text-sm text-gray-600">Select the entity type for this client to begin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleEntitySelection('individual')}
                  className={`p-4 rounded-sm border-2 text-left transition-colors ${selectedEntity === 'individual'
                    ? 'border-emerald-900 bg-stone-200'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm ${selectedEntity === 'individual' ? 'bg-emerald-900' : 'bg-gray-100'}`}>
                      <UserCircle className={`w-5 h-5 ${selectedEntity === 'individual' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium">Individual</div>
                      <div className="text-sm text-gray-500">Single person</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleEntitySelection('household')}
                  className={`p-4 rounded-sm border-2 text-left transition-colors ${selectedEntity === 'household'
                    ? 'border-emerald-900 bg-stone-200'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm ${selectedEntity === 'household' ? 'bg-emerald-900' : 'bg-gray-100'}`}>
                      <Users className={`w-5 h-5 ${selectedEntity === 'household' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium">Household</div>
                      <div className="text-sm text-gray-500">Couple or family</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleEntitySelection('trust')}
                  className={`p-4 rounded-sm border-2 text-left transition-colors ${selectedEntity === 'trust'
                    ? 'border-emerald-900 bg-stone-200'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm ${selectedEntity === 'trust' ? 'bg-emerald-900' : 'bg-gray-100'}`}>
                      <FileText className={`w-5 h-5 ${selectedEntity === 'trust' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium">Trust</div>
                      <div className="text-sm text-gray-500">Trust structure</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleEntitySelection('company')}
                  className={`p-4 rounded-sm border-2 text-left transition-colors ${selectedEntity === 'company'
                    ? 'border-emerald-900 bg-stone-200'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm ${selectedEntity === 'company' ? 'bg-emerald-900' : 'bg-gray-100'}`}>
                      <Building className={`w-5 h-5 ${selectedEntity === 'company' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium">Company</div>
                      <div className="text-sm text-gray-500">Business entity</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Entity Type Badge */}
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 rounded-sm border border-emerald-900">
                  {selectedEntity === 'individual' && <UserCircle className="w-4 h-4 text-emerald-900" />}
                  {selectedEntity === 'household' && <Users className="w-4 h-4 text-emerald-900" />}
                  {selectedEntity === 'trust' && <FileText className="w-4 h-4 text-emerald-900" />}
                  {selectedEntity === 'company' && <Building className="w-4 h-4 text-emerald-900" />}
                  <span className="text-sm font-medium text-emerald-950 capitalize">{selectedEntity}</span>
                </div>
                <button
                  onClick={() => setEntitySelected(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Change entity type
                </button>
              </div>

              {/* Tabs Navigation */}
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
                {/* Client Info Tab */}
                {activeTab === 'client-info' && (
                  <div className="space-y-6" data-ai-section="Client Information">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Client Information</h3>

                      {selectedEntity === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Individual Details">
                          <div data-ai-field="firstName" data-ai-label="First Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              value={clientInfoData.firstName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, firstName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Enter first name"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="middleName" data-ai-label="Middle Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                            <input
                              type="text"
                              value={clientInfoData.middleName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, middleName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Enter middle name"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="lastName" data-ai-label="Last Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input
                              type="text"
                              value={clientInfoData.lastName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, lastName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Enter last name"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="dateOfBirth" data-ai-label="Date of Birth">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                            <input
                              type="date"
                              value={clientInfoData.dateOfBirth}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, dateOfBirth: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="gender" data-ai-label="Gender">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <select
                              value={clientInfoData.gender}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, gender: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              data-ai-editable="true"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                          <div data-ai-field="email" data-ai-label="Email">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                              type="email"
                              value={clientInfoData.email}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="email@example.com"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="phone" data-ai-label="Phone">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={clientInfoData.phone}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="(123) 456-7890"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="mobile" data-ai-label="Mobile">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                            <input
                              type="tel"
                              value={clientInfoData.mobile}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, mobile: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="(123) 456-7890"
                              data-ai-editable="true"
                            />
                          </div>
                        </div>
                      )}

                      {selectedEntity === 'household' && (
                        <div className="space-y-6" data-ai-section="Household Details">
                          <div data-ai-section="Partner 1">
                            <h4 className="font-medium text-gray-900 mb-3">Partner 1</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div data-ai-field="partner1FirstName" data-ai-label="Partner 1 First Name">
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                <input
                                  type="text"
                                  value={clientInfoData.partner1FirstName}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner1FirstName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div data-ai-field="partner1LastName" data-ai-label="Partner 1 Last Name">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                <input
                                  type="text"
                                  value={clientInfoData.partner1LastName}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner1LastName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div data-ai-field="partner1DOB" data-ai-label="Partner 1 Date of Birth">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                <input
                                  type="date"
                                  value={clientInfoData.partner1DOB}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner1DOB: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6" data-ai-section="Partner 2">
                            <h4 className="font-medium text-gray-900 mb-3">Partner 2</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div data-ai-field="partner2FirstName" data-ai-label="Partner 2 First Name">
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                <input
                                  type="text"
                                  value={clientInfoData.partner2FirstName}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner2FirstName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div data-ai-field="partner2LastName" data-ai-label="Partner 2 Last Name">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                <input
                                  type="text"
                                  value={clientInfoData.partner2LastName}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner2LastName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div data-ai-field="partner2DOB" data-ai-label="Partner 2 Date of Birth">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                <input
                                  type="date"
                                  value={clientInfoData.partner2DOB}
                                  onChange={(e) => setClientInfoData({ ...clientInfoData, partner2DOB: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedEntity === 'trust' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Trust Details">
                          <div className="md:col-span-2" data-ai-field="trustName" data-ai-label="Trust Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trust Name *</label>
                            <input
                              type="text"
                              value={clientInfoData.trustName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, trustName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Enter trust name"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="trustType" data-ai-label="Trust Type">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trust Type *</label>
                            <select
                              value={clientInfoData.trustType}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, trustType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              data-ai-editable="true"
                            >
                              <option value="">Select type</option>
                              <option value="family">Family Trust</option>
                              <option value="discretionary">Discretionary Trust</option>
                              <option value="unit">Unit Trust</option>
                              <option value="charitable">Charitable Trust</option>
                            </select>
                          </div>
                          <div data-ai-field="establishmentDate" data-ai-label="Establishment Date">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Establishment Date *</label>
                            <input
                              type="date"
                              value={clientInfoData.establishmentDate}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, establishmentDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              data-ai-editable="true"
                            />
                          </div>
                          <div className="md:col-span-2" data-ai-field="trustees" data-ai-label="Trustees">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trustees</label>
                            <textarea
                              value={clientInfoData.trustees}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, trustees: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
                              rows={3}
                              placeholder="List trustees"
                              data-ai-editable="true"
                            />
                          </div>
                          <div className="md:col-span-2" data-ai-field="beneficiaries" data-ai-label="Beneficiaries">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiaries</label>
                            <textarea
                              value={clientInfoData.beneficiaries}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, beneficiaries: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
                              rows={3}
                              placeholder="List beneficiaries"
                              data-ai-editable="true"
                            />
                          </div>
                        </div>
                      )}

                      {selectedEntity === 'company' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-ai-section="Company Details">
                          <div className="md:col-span-2" data-ai-field="companyName" data-ai-label="Company Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <input
                              type="text"
                              value={clientInfoData.companyName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, companyName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Enter company name"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="tradingName" data-ai-label="Trading Name">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trading Name</label>
                            <input
                              type="text"
                              value={clientInfoData.tradingName}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, tradingName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="Trading as..."
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="companyNumber" data-ai-label="Company Number">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Number</label>
                            <input
                              type="text"
                              value={clientInfoData.companyNumber}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, companyNumber: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              placeholder="123456789"
                              data-ai-editable="true"
                            />
                          </div>
                          <div data-ai-field="incorporationDate" data-ai-label="Incorporation Date">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Incorporation Date</label>
                            <input
                              type="date"
                              value={clientInfoData.incorporationDate}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, incorporationDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                              data-ai-editable="true"
                            />
                          </div>
                          <div className="md:col-span-2" data-ai-field="directors" data-ai-label="Directors">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Directors</label>
                            <textarea
                              value={clientInfoData.directors}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, directors: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
                              rows={3}
                              placeholder="List directors"
                              data-ai-editable="true"
                            />
                          </div>
                          <div className="md:col-span-2" data-ai-field="shareholders" data-ai-label="Shareholders">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shareholders</label>
                            <textarea
                              value={clientInfoData.shareholders}
                              onChange={(e) => setClientInfoData({ ...clientInfoData, shareholders: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
                              rows={3}
                              placeholder="List shareholders with percentages"
                              data-ai-editable="true"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6" data-ai-section="Contact Details">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Details</h3>

                      <div className="space-y-6">
                        <div data-ai-section="Residential Address">
                          <h4 className="font-medium text-gray-900 mb-3">Residential Address</h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div data-ai-field="residentialAddress" data-ai-label="Residential Street Address">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                              <input
                                type="text"
                                value={contactData.residentialAddress}
                                onChange={(e) => setContactData({ ...contactData, residentialAddress: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                placeholder="123 Main Street"
                                data-ai-editable="true"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div data-ai-field="residentialCity" data-ai-label="Residential City">
                                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                <input
                                  type="text"
                                  value={contactData.residentialCity}
                                  onChange={(e) => setContactData({ ...contactData, residentialCity: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  placeholder="City"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div data-ai-field="residentialPostcode" data-ai-label="Residential Postcode">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Postcode *</label>
                                <input
                                  type="text"
                                  value={contactData.residentialPostcode}
                                  onChange={(e) => setContactData({ ...contactData, residentialPostcode: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  placeholder="12345"
                                  data-ai-editable="true"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6" data-ai-section="Mailing Address">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Mailing Address</h4>
                            <label className="flex items-center gap-2 text-sm" data-ai-field="sameAsResidential" data-ai-label="Same as Residential">
                              <input
                                type="checkbox"
                                checked={contactData.sameAsResidential}
                                onChange={(e) => setContactData({ ...contactData, sameAsResidential: e.target.checked })}
                                className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                                data-ai-editable="true"
                              />
                              Same as residential
                            </label>
                          </div>

                          {!contactData.sameAsResidential && (
                            <div className="grid grid-cols-1 gap-4">
                              <div data-ai-field="mailingAddress" data-ai-label="Mailing Street Address">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                <input
                                  type="text"
                                  value={contactData.mailingAddress}
                                  onChange={(e) => setContactData({ ...contactData, mailingAddress: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  placeholder="PO Box 123"
                                  data-ai-editable="true"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div data-ai-field="mailingCity" data-ai-label="Mailing City">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                  <input
                                    type="text"
                                    value={contactData.mailingCity}
                                    onChange={(e) => setContactData({ ...contactData, mailingCity: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    placeholder="City"
                                    data-ai-editable="true"
                                  />
                                </div>
                                <div data-ai-field="mailingPostcode" data-ai-label="Mailing Postcode">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                                  <input
                                    type="text"
                                    value={contactData.mailingPostcode}
                                    onChange={(e) => setContactData({ ...contactData, mailingPostcode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                    placeholder="12345"
                                    data-ai-editable="true"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance Tab */}
                {activeTab === 'compliance' && (
                  <div className="space-y-6" data-ai-section="Compliance">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Compliance Checklist</h3>
                      <p className="text-sm text-gray-600 mb-6">Complete all required compliance items before proceeding.</p>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="identityVerified" data-ai-label="Identity Verification">
                          <input
                            type="checkbox"
                            checked={complianceData.identityVerified}
                            onChange={(e) => setComplianceData({ ...complianceData, identityVerified: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Identity Verification</div>
                            <div className="text-sm text-gray-500">Verify client identity with government-issued ID</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="amlCompleted" data-ai-label="AML Check">
                          <input
                            type="checkbox"
                            checked={complianceData.amlCompleted}
                            onChange={(e) => setComplianceData({ ...complianceData, amlCompleted: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">AML Check</div>
                            <div className="text-sm text-gray-500">Anti-Money Laundering screening completed</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="cddCompleted" data-ai-label="Customer Due Diligence">
                          <input
                            type="checkbox"
                            checked={complianceData.cddCompleted}
                            onChange={(e) => setComplianceData({ ...complianceData, cddCompleted: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Customer Due Diligence (CDD)</div>
                            <div className="text-sm text-gray-500">Complete CDD requirements and documentation</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="privacyConsent" data-ai-label="Privacy Consent">
                          <input
                            type="checkbox"
                            checked={complianceData.privacyConsent}
                            onChange={(e) => setComplianceData({ ...complianceData, privacyConsent: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Privacy Consent</div>
                            <div className="text-sm text-gray-500">Client has provided consent for data processing</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="termsAccepted" data-ai-label="Terms and Conditions">
                          <input
                            type="checkbox"
                            checked={complianceData.termsAccepted}
                            onChange={(e) => setComplianceData({ ...complianceData, termsAccepted: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Terms & Conditions</div>
                            <div className="text-sm text-gray-500">Client has accepted terms and conditions</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer" data-ai-field="disclosureProvided" data-ai-label="Disclosure Statement">
                          <input
                            type="checkbox"
                            checked={complianceData.disclosureProvided}
                            onChange={(e) => setComplianceData({ ...complianceData, disclosureProvided: e.target.checked })}
                            className="w-5 h-5 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 mt-0.5"
                            data-ai-editable="true"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Disclosure Statement</div>
                            <div className="text-sm text-gray-500">Disclosure statement provided and acknowledged</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financials Tab */}
                {activeTab === 'financials' && (
                  <div className="space-y-6" data-ai-section="Financial Information">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Financial Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div data-ai-field="annualIncome" data-ai-label="Annual Income">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                          <input
                            type="text"
                            value={financialsData.annualIncome}
                            onChange={(e) => setFinancialsData({ ...financialsData, annualIncome: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="$50,000"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="employmentStatus" data-ai-label="Employment Status">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                          <select
                            value={financialsData.employmentStatus}
                            onChange={(e) => setFinancialsData({ ...financialsData, employmentStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            data-ai-editable="true"
                          >
                            <option value="">Select status</option>
                            <option value="employed">Employed</option>
                            <option value="self-employed">Self-Employed</option>
                            <option value="retired">Retired</option>
                            <option value="unemployed">Unemployed</option>
                            <option value="student">Student</option>
                          </select>
                        </div>

                        <div data-ai-field="employer" data-ai-label="Employer">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
                          <input
                            type="text"
                            value={financialsData.employer}
                            onChange={(e) => setFinancialsData({ ...financialsData, employer: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="Company name"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="occupation" data-ai-label="Occupation">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                          <input
                            type="text"
                            value={financialsData.occupation}
                            onChange={(e) => setFinancialsData({ ...financialsData, occupation: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="Job title"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="assetsValue" data-ai-label="Total Assets Value">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Assets Value</label>
                          <input
                            type="text"
                            value={financialsData.assetsValue}
                            onChange={(e) => setFinancialsData({ ...financialsData, assetsValue: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="$500,000"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="liabilitiesValue" data-ai-label="Total Liabilities">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Liabilities</label>
                          <input
                            type="text"
                            value={financialsData.liabilitiesValue}
                            onChange={(e) => setFinancialsData({ ...financialsData, liabilitiesValue: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="$200,000"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="monthlyExpenses" data-ai-label="Monthly Expenses">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses</label>
                          <input
                            type="text"
                            value={financialsData.monthlyExpenses}
                            onChange={(e) => setFinancialsData({ ...financialsData, monthlyExpenses: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            placeholder="$3,000"
                            data-ai-editable="true"
                          />
                        </div>

                        <div data-ai-field="riskProfile" data-ai-label="Risk Profile">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
                          <select
                            value={financialsData.riskProfile}
                            onChange={(e) => setFinancialsData({ ...financialsData, riskProfile: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                            data-ai-editable="true"
                          >
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="balanced">Balanced</option>
                            <option value="growth">Growth</option>
                            <option value="aggressive">Aggressive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dependents Tab */}
                {activeTab === 'dependents' && (
                  <div className="space-y-6" data-ai-section="Dependents">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Dependents</h3>
                        <p className="text-sm text-gray-600">Add details of financially dependent individuals</p>
                      </div>
                      <button
                        onClick={addDependent}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10"
                      >
                        <Plus className="w-4 h-4" />
                        Add Dependent
                      </button>
                    </div>

                    {dependentsData.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-300 rounded-sm">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No dependents added yet</p>
                        <button
                          onClick={addDependent}
                          className="text-emerald-900 hover:text-emerald-950 font-medium text-sm"
                        >
                          Add your first dependent
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dependentsData.map((dependent, index) => (
                          <div key={dependent.id} className="p-4 border border-gray-200 rounded-sm" data-ai-section={`Dependent ${index + 1}`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Dependent {index + 1}</h4>
                              <button
                                onClick={() => removeDependent(dependent.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div data-ai-field={`dependent${index + 1}Name`} data-ai-label={`Dependent ${index + 1} Full Name`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                  type="text"
                                  value={dependent.name}
                                  onChange={(e) => updateDependent(dependent.id, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  placeholder="Enter name"
                                  data-ai-editable="true"
                                />
                              </div>

                              <div data-ai-field={`dependent${index + 1}Relationship`} data-ai-label={`Dependent ${index + 1} Relationship`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                <select
                                  value={dependent.relationship}
                                  onChange={(e) => updateDependent(dependent.id, 'relationship', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                >
                                  <option value="">Select relationship</option>
                                  <option value="child">Child</option>
                                  <option value="spouse">Spouse</option>
                                  <option value="parent">Parent</option>
                                  <option value="sibling">Sibling</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div data-ai-field={`dependent${index + 1}DOB`} data-ai-label={`Dependent ${index + 1} Date of Birth`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <input
                                  type="date"
                                  value={dependent.dateOfBirth}
                                  onChange={(e) => updateDependent(dependent.id, 'dateOfBirth', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 h-10"
                                  data-ai-editable="true"
                                />
                              </div>

                              <div className="flex items-center" data-ai-field={`dependent${index + 1}FinanciallyDependent`} data-ai-label={`Dependent ${index + 1} Financially Dependent`}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={dependent.financiallyDependent}
                                    onChange={(e) => updateDependent(dependent.id, 'financiallyDependent', e.target.checked)}
                                    className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                                    data-ai-editable="true"
                                  />
                                  <span className="text-sm text-gray-700">Financially dependent</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button className="px-6 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors h-10 font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAndContinue}
                    className="px-6 py-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors h-10 font-medium"
                  >
                    {isLastTab ? 'Save & Complete' : 'Save & Continue'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}