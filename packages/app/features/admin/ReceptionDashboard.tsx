import React, { useState } from 'react';
import { useReception } from '../../hooks/useOperations';
import { SovereignTable, PageHeader, SovereignButton, SovereignInput, SovereignBadge } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { Printer, Plus } from 'lucide-react';

export const ReceptionDashboard = () => {
  // Use new Operations hook instead of InteractionContext
  const { visitors, addVisitor, approveVisitor } = useReception();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', purpose: '', student: '' });

  const handleCheckIn = () => {
    if (!form.name || !form.purpose) return alert("Required fields missing");
    addVisitor(form);
    setModalOpen(false);
    setForm({ name: '', purpose: '', student: '' });
  };

  const handlePrintPass = (visitorName: string) => {
    alert(`Printing Gate Pass for ${visitorName}... \n[Printer: EPSON-TM-T82 connected]`);
  };

  const columns = [
    { header: "Time", accessor: "time" },
    { header: "Visitor Name", accessor: "name" },
    { header: "Purpose", accessor: "purpose" },
    { header: "Student Ref", accessor: (row: any) => row.student || '-' },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'APPROVED' ? 'success' : row.status === 'COMPLETED' ? 'neutral' : 'warning'}>{row.status}</SovereignBadge> },
  ];

  const actions = (row: any) => (
    <div className="flex gap-2">
      {row.status === 'WAITING' && (
        <button onClick={() => approveVisitor(row.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Approve</button>
      )}
      <button onClick={() => handlePrintPass(row.name)} className="text-gray-500 hover:text-indigo-600">
        <Printer className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Front Desk"
        subtitle="Visitor Registry"
        action={<SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Visitor Check-In</SovereignButton>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SovereignTable data={visitors} columns={columns} actions={actions} />
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Visitor Registration"
        footer={<SovereignButton onClick={handleCheckIn}>Issue Pass</SovereignButton>}
      >
        <div className="space-y-4">
          <SovereignInput label="Visitor Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purpose</label>
            <select className="w-full border p-2 rounded bg-white" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
              <option value="">Select Purpose</option>
              <option value="Parent Meeting">Parent Meeting</option>
              <option value="Vendor Delivery">Vendor Delivery</option>
              <option value="Interview">Job Interview</option>
              <option value="Guest">Guest</option>
            </select>
          </div>
          <SovereignInput label="Student Reference (Optional)" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} placeholder="e.g. Rohan Class 5A" />
        </div>
      </ActionModal>
    </div>
  );
};