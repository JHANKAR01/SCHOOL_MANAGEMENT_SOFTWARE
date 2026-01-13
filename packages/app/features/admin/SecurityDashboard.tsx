import React, { useState } from 'react';
import { useSecurity } from '../../hooks/useOperations';
import { useInteraction } from '../../provider/InteractionContext'; // Still need lockdownMode/toggleLockdown
import { SovereignTable, PageHeader, SovereignButton, SovereignBadge, SovereignInput } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { ShieldAlert, Plus, Car } from 'lucide-react';

export const SecurityDashboard = () => {
  // Use new Security hook for gate logs
  const { gateLogs, logGateEntry } = useSecurity();
  // Keep lockdown from InteractionContext (global state)
  const { lockdownMode, toggleLockdown } = useInteraction();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'VISITOR', name: '', purpose: '' });

  const handleLog = () => {
    if (!form.name || !form.purpose) return alert("Enter details");
    logGateEntry({ ...form, status: 'INSIDE' });
    setModalOpen(false);
    setForm({ type: 'VISITOR', name: '', purpose: '' });
  };

  const handleLockdown = () => {
    if (confirm(lockdownMode ? "LIFT Lockdown status?" : "⚠️ INITIATE EMERGENCY LOCKDOWN?\n\nThis will trigger alarms and notify all staff.")) {
      toggleLockdown();
    }
  };

  const columns = [
    { header: "Time", accessor: "time" },
    { header: "Type", accessor: "type" },
    { header: "Name / Plate No", accessor: "name" },
    { header: "Purpose", accessor: "purpose" },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'INSIDE' ? 'warning' : 'neutral'}>{row.status}</SovereignBadge> }
  ];

  return (
    <div className={`p-6 max-w-7xl mx-auto transition-colors duration-500 ${lockdownMode ? 'bg-red-50 min-h-screen' : ''}`}>
      {lockdownMode && (
        <div className="bg-red-600 text-white p-4 text-center font-black animate-pulse rounded-lg mb-6 text-xl shadow-xl border-4 border-red-800">
          ⚠️ EMERGENCY LOCKDOWN ACTIVE - GATES SEALED ⚠️
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <PageHeader title="Gate Command" subtitle="Live Entry/Exit Logs" />
        <div className="flex gap-3">
          <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Log Entry</SovereignButton>
          <SovereignButton
            variant="danger"
            icon={<ShieldAlert className="w-4 h-4" />}
            onClick={handleLockdown}
            className={lockdownMode ? 'bg-red-800 border-red-900 text-white' : ''}
          >
            {lockdownMode ? 'LIFT LOCKDOWN' : 'EMERGENCY LOCKDOWN'}
          </SovereignButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SovereignTable data={gateLogs} columns={columns} />
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Gate Entry"
        footer={<SovereignButton onClick={handleLog}>Record Entry</SovereignButton>}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entry Type</label>
            <select className="w-full border p-2 rounded bg-white" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="VISITOR">Visitor (Person)</option>
              <option value="PARENT">Parent</option>
              <option value="VENDOR">Vendor/Delivery</option>
              <option value="VEHICLE">Vehicle Entry</option>
            </select>
          </div>

          <SovereignInput
            label={form.type === 'VEHICLE' ? "Plate Number" : "Name"}
            placeholder={form.type === 'VEHICLE' ? "e.g. DL-3C-1234" : "Visitor Name"}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <SovereignInput label="Purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
        </div>
      </ActionModal>
    </div>
  );
};