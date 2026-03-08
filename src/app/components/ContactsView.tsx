import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Mail, Phone, ChevronDown, UserCircle, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

function mapContact(row: any) {
  return {
    ...row,
    firstName: row.first_name ?? row.firstName ?? '',
    lastName: row.last_name ?? row.lastName ?? '',
    middleName: row.middle_name ?? row.middleName ?? '',
    dateOfBirth: row.date_of_birth ?? row.dateOfBirth ?? '',
    clientId: row.client_id ?? row.clientId,
  };
}

interface ContactsViewProps {
  clientId: number | null;
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
  clientId,
  selectedContact,
  setSelectedContact,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal
}: ContactsViewProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', relationship: '' });

  const fetchContacts = useCallback(() => {
    if (clientId) {
      apiFetch<any[]>(`/api/contacts?clientId=${clientId}`)
        .then(rows => setContacts(rows.map(mapContact)))
        .catch(() => {});
    }
  }, [clientId]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const selected = contacts.find(c => c.id === selectedContact);
  const filteredContacts = search
    ? contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    : contacts;

  const updateField = async (field: string, value: string) => {
    if (!selected) return;
    const nameFields = ['firstName', 'lastName'];
    const updatedContact = { ...selected, [field]: value };
    if (nameFields.includes(field)) {
      updatedContact.name = `${updatedContact.firstName} ${updatedContact.lastName}`.trim();
    }
    setContacts(prev => prev.map(c => c.id === selected.id ? updatedContact : c));
    setSaving(true);
    try {
      const body: any = { [field]: value };
      if (nameFields.includes(field)) body.name = updatedContact.name;
      await apiFetch(`/api/contacts/${selected.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } catch {
      toast.error('Failed to save');
      fetchContacts();
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.firstName || !newContact.lastName || !clientId) {
      toast.error('First and last name are required');
      return;
    }
    try {
      const created = await apiFetch<any>('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          name: `${newContact.firstName} ${newContact.lastName}`,
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email || null,
          phone: newContact.phone || null,
          relationship: newContact.relationship || null,
          type: 'other',
        }),
      });
      const mapped = mapContact(created);
      setContacts(prev => [...prev, mapped]);
      setSelectedContact(mapped.id);
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', relationship: '' });
      setShowAddForm(false);
      toast.success('Contact added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete ${selected.name}?`)) return;
    try {
      await apiFetch(`/api/contacts/${selected.id}`, { method: 'DELETE' });
      setContacts(prev => prev.filter(c => c.id !== selected.id));
      setSelectedContact(0);
      toast.success('Contact deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative" data-ai-section="Contacts">

      {/* Contacts List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="p-2 bg-emerald-900 text-white rounded-sm hover:bg-emerald-950 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 text-sm"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto" data-ai-section="Contact List">
          {showAddForm && (
            <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="First name *" value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900" />
                <input type="text" placeholder="Last name *" value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900" />
              </div>
              <input type="email" placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900" />
              <input type="tel" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-100">Cancel</button>
                <button onClick={handleAddContact} className="flex-1 px-3 py-1.5 text-sm bg-emerald-900 text-white rounded-sm hover:bg-emerald-950">Add</button>
              </div>
            </div>
          )}
          <div className="p-2">
            {filteredContacts.map((contact) => (
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
          <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium">
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
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a contact to view details
            </div>
          ) : (
          <div className="max-w-3xl">
            {/* AI Summary */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-sm border border-purple-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-stone-200/50 rounded-sm flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-emerald-900" />
                  </div>
                  <h3 className="font-semibold">PERSONAL</h3>
                  {saving && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
                </div>
                <button onClick={handleDeleteContact} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors" title="Delete contact">
                  <Trash2 className="w-4 h-4" />
                </button>
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
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, firstName: e.target.value } : c))}
                      onBlur={(e) => updateField('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div data-ai-field="middleName" data-ai-label="Middle Name" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={selected.middleName || ''}
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, middleName: e.target.value } : c))}
                      onBlur={(e) => updateField('middleName', e.target.value)}
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
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, lastName: e.target.value } : c))}
                      onBlur={(e) => updateField('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
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
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, email: e.target.value } : c))}
                      onBlur={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div data-ai-field="detailPhone" data-ai-label="Phone" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={selected.phone || ''}
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, phone: e.target.value } : c))}
                      onBlur={(e) => updateField('phone', e.target.value)}
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
                      onChange={(e) => setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, dateOfBirth: e.target.value } : c))}
                      onBlur={(e) => updateField('dateOfBirth', e.target.value)}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm"
                    />
                  </div>

                  <div data-ai-field="gender" data-ai-label="Gender" data-ai-editable="true">
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      value={selected.gender || ''}
                      onChange={(e) => updateField('gender', e.target.value)}
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
                      onChange={(e) => updateField('relationship', e.target.value)}
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
          )}
        </div>
      </div>
    </div>
  );
}
