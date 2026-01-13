import React, { useState } from 'react';
import { useAdmissions } from '../../hooks/useAdmissions';
import { SovereignButton, SovereignTable, SovereignInput, SovereignBadge, PageHeader } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { ActionModal } from '../../components/ActionModal';
import { Plus, UserCheck } from 'lucide-react';

export const AdmissionsDashboard = () => {
  // Use new Admissions hook instead of InteractionContext
  const { inquiries, addInquiry, convertInquiry } = useAdmissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ parent_name: '', phone: '', target_class: '' });

  const handleAdd = () => {
    if (!form.parent_name || !form.phone) return alert("Details required");
    addInquiry(form);
    setModalOpen(false);
    setForm({ parent_name: '', phone: '', target_class: '' });
  };

  const handleConvert = (id: number) => {
    if (confirm("Confirm admission and generate Student ID?")) {
      convertInquiry(id);
      alert("Student Profile Created! Welcome Kit email sent.");
    }
  };

  const columns = [
    { header: "Parent Name", accessor: "parent_name" },
    { header: "Contact", accessor: "phone" },
    { header: "Target Class", accessor: "target_class" },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'CONVERTED' ? 'success' : 'neutral'}>{row.status}</SovereignBadge> }
  ];

  const actions = (row: any) => row.status !== 'CONVERTED' ? (
    <button
      onClick={() => handleConvert(row.id)}
      className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-100"
    >
      <UserCheck className="w-3 h-3" /> Admit
    </button>
  ) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Admissions CRM"
        subtitle="Lead Management & Enrollment"
        action={<SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>New Inquiry</SovereignButton>}
      />

      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-xl shadow-sm border h-full">
            <h3 className="text-gray-500 text-xs font-bold uppercase">Total Leads</h3>
            <p className="text-2xl font-black">{inquiries.length}</p>
          </div>
        </Col>
        <Col className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-xl shadow-sm border h-full">
            <h3 className="text-gray-500 text-xs font-bold uppercase">Converted</h3>
            <p className="text-2xl font-black text-green-600">{inquiries.filter(i => i.status === 'CONVERTED').length}</p>
          </div>
        </Col>
      </Row>

      <SovereignTable data={inquiries} columns={columns} actions={actions} />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log New Inquiry"
        footer={
          <>
            <SovereignButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</SovereignButton>
            <SovereignButton onClick={handleAdd}>Log Inquiry</SovereignButton>
          </>
        }
      >
        <div className="space-y-4">
          <SovereignInput label="Parent Name" value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} />
          <SovereignInput label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <SovereignInput label="Target Class" value={form.target_class} onChange={e => setForm({ ...form, target_class: e.target.value })} placeholder="e.g. Class 5" />
        </div>
      </ActionModal>
    </div>
  );
};