import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface NewClientForm {
  entityType: string;
  clientName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  primaryContact: {
    name: string;
    email: string;
    phoneCountry: string;
    phone: string;
    relationship: string;
  };
  productTypes: string[];
  clientAdvisor: string;
  notes: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newClientForm: NewClientForm;
  setNewClientForm: React.Dispatch<React.SetStateAction<NewClientForm>>;
  onSubmit: () => void;
}

export function AddClientModal({
  isOpen,
  onClose,
  newClientForm,
  setNewClientForm,
  onSubmit,
}: AddClientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="bg-white w-full sm:max-w-2xl sm:rounded-sm rounded-t-2xl max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <h2 className="text-lg font-medium">Add New Client</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={newClientForm.entityType}
              onChange={(e) => setNewClientForm({ ...newClientForm, entityType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900"
            >
              <option>Individual</option>
              <option>Trust</option>
              <option>Company</option>
              <option>Partnership</option>
              <option>Estate</option>
              <option>Charity</option>
              <option>Joint Account</option>
            </select>
          </div>

          {/* Client/Entity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {newClientForm.entityType === 'Individual' ? 'Client Name' : 'Entity Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={newClientForm.entityType === 'Individual' ? 'e.g. Aaron Smith' : `e.g. ${newClientForm.entityType} name`}
              value={newClientForm.clientName}
              onChange={(e) => setNewClientForm({ ...newClientForm, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
            />
          </div>

          {/* Primary Contact Details - Only show for non-Individual entities */}
          {newClientForm.entityType !== 'Individual' && (
            <div className="bg-gray-50 rounded-sm p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Primary Contact Details</h3>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aaron Smith"
                  value={newClientForm.primaryContact.name}
                  onChange={(e) => setNewClientForm({
                    ...newClientForm,
                    primaryContact: { ...newClientForm.primaryContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                />
              </div>

              {/* Contact Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newClientForm.primaryContact.email}
                    onChange={(e) => setNewClientForm({
                      ...newClientForm,
                      primaryContact: { ...newClientForm.primaryContact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={newClientForm.primaryContact.phoneCountry}
                      onChange={(e) => setNewClientForm({
                        ...newClientForm,
                        primaryContact: { ...newClientForm.primaryContact, phoneCountry: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-200 rounded-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                    >
                      <option>NZ +64</option>
                      <option>AU +61</option>
                      <option>US +1</option>
                      <option>UK +44</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="021 xxx xxxx"
                      value={newClientForm.primaryContact.phone}
                      onChange={(e) => setNewClientForm({
                        ...newClientForm,
                        primaryContact: { ...newClientForm.primaryContact, phone: e.target.value }
                      })}
                      className="min-w-0 px-3 py-2 border border-gray-200 rounded-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                    />
                  </div>
                </div>
              </div>

              {/* Relationship to Entity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Entity
                </label>
                <select
                  value={newClientForm.primaryContact.relationship}
                  onChange={(e) => setNewClientForm({
                    ...newClientForm,
                    primaryContact: { ...newClientForm.primaryContact, relationship: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                >
                  <option value="">Select relationship type</option>
                  <option>Trustee</option>
                  <option>Director</option>
                  <option>Partner</option>
                  <option>Executor</option>
                  <option>Beneficiary</option>
                  <option>Authorized Representative</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Email and Phone - Only show for Individual */}
          {newClientForm.entityType === 'Individual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={newClientForm.phoneCountry}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phoneCountry: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                  >
                    <option>NZ +64</option>
                    <option>AU +61</option>
                    <option>US +1</option>
                    <option>UK +44</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="021 xxx xxxx"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Product Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['KIWISAVER', 'INSURANCE', 'MORTGAGE', 'INVESTMENT', 'REVIEW'].map((product) => (
                <label
                  key={product}
                  className={`px-4 py-3 border rounded-sm cursor-pointer transition-all ${
                    newClientForm.productTypes.includes(product)
                      ? 'border-emerald-900 bg-stone-200/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={newClientForm.productTypes.includes(product)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewClientForm({
                          ...newClientForm,
                          productTypes: [...newClientForm.productTypes, product]
                        });
                      } else {
                        setNewClientForm({
                          ...newClientForm,
                          productTypes: newClientForm.productTypes.filter(p => p !== product)
                        });
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-700">{product}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Client Advisor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Advisor
            </label>
            <select
              value={newClientForm.clientAdvisor}
              onChange={(e) => setNewClientForm({ ...newClientForm, clientAdvisor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900"
            >
              <option value="">Select advisor</option>
              <option>Steven Johnston</option>
              <option>Madison Cole</option>
              <option>Brett O'Donnell</option>
              <option>No manager assigned</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              placeholder="Initial notes about this client..."
              value={newClientForm.notes}
              onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-900 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3 justify-end">

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newClientForm.clientName.trim()}
            className="px-4 py-1.5 text-sm font-medium bg-emerald-900 text-white rounded-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Client
          </button>
        </div>
      </motion.div>
    </div>
  );
}
