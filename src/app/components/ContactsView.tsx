import { Plus, Search, Mail, Phone, ChevronDown, UserCircle, Sparkles, RefreshCw } from 'lucide-react';
import { contactsData } from '../data/seedData';

interface ContactsViewProps {
  selectedContact: number;
  setSelectedContact: (n: number) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}

export function ContactsView({
  selectedContact,
  setSelectedContact,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: ContactsViewProps) {
  const contacts = contactsData;

  const selected = contacts[selectedContact];

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative" data-ai-section="Contacts">

      {/* Contacts List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <button className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto" data-ai-section="Contact List">
          <div className="p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact.id)}
                data-ai-field={`contact-${contact.id}`}
                data-ai-label={contact.name}
                className={`p-3 mb-2 rounded-sm border cursor-pointer transition-colors ${selectedContact === contact.id
                  ? 'border-emerald-900 bg-stone-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                    {contact.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1" data-ai-field="contactName" data-ai-label="Name">{contact.name}</div>
                    <div className="text-xs text-gray-500 mb-1" data-ai-field="contactType" data-ai-label="Contact Type">{contact.type.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1" data-ai-field="contactEmail" data-ai-label="Email">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1" data-ai-field="contactPhone" data-ai-label="Phone">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="flex-1 flex flex-col overflow-hidden" data-ai-section="Contact Details">
        {/* Top Action Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-end gap-3 text-sm flex-shrink-0">
          <button className="text-emerald-900 hover:underline flex items-center gap-1">
            Tools <ChevronDown className="w-3 h-3" />
          </button>
          <button className="text-emerald-900 hover:underline flex items-center gap-1">
            Resources <ChevronDown className="w-3 h-3" />
          </button>
          <button className="text-emerald-900 hover:underline flex items-center gap-1">
            Portal Logins <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
          <div className="max-w-3xl">
            {/* AI Summary */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-sm border border-purple-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Summary</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 italic">
                No AI summary available for this contact yet. Click the refresh button to generate one.
              </p>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6" data-ai-section="Personal Information">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-stone-200/50 rounded-sm flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-emerald-900" />
                </div>
                <h3 className="font-semibold">PERSONAL</h3>
              </div>

              <div className="space-y-4">
                {/* Name Fields Row - 3 columns on lg, 2 on md, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div data-ai-field="firstName" data-ai-label="First Name" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selected.firstName || ''}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm"
                      readOnly
                    />
                  </div>

                  <div data-ai-field="middleName" data-ai-label="Middle Name" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={selected.middleName || ''}
                      onChange={() => { }}
                      placeholder="Middle name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-1" data-ai-field="lastName" data-ai-label="Last Name" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selected.lastName || ''}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm"
                      readOnly
                    />
                  </div>
                </div>

                {/* Contact Fields Row - 2 columns on md+, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-ai-field="detailEmail" data-ai-label="Email" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={selected.email || ''}
                      onChange={() => { }}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div data-ai-field="detailPhone" data-ai-label="Phone" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={selected.phone || ''}
                      onChange={() => { }}
                      placeholder="0987654321"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>
                </div>

                {/* Personal Details Row - 3 columns on lg, 2 on md, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div data-ai-field="dateOfBirth" data-ai-label="Date of Birth" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input
                      type="text"
                      value={selected.dateOfBirth || ''}
                      onChange={() => { }}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div data-ai-field="gender" data-ai-label="Gender" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      value={selected.gender || ''}
                      onChange={() => { }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-gray-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1" data-ai-field="relationship" data-ai-label="Relationship" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Relationship</label>
                    <select
                      value={selected.relationship || ''}
                      onChange={() => { }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-gray-500"
                    >
                      <option value="">Select relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Partner">Partner</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Dependent">Dependent</option>
                      <option value="Beneficiary">Beneficiary</option>
                      <option value="Business Partner">Business Partner</option>
                      <option value="Adviser">Adviser</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Solicitor">Solicitor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
