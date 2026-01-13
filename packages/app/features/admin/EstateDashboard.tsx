import React, { useState } from 'react';
import { useEstate } from '../../hooks/useOperations';
import { SovereignTable, PageHeader, SovereignBadge, SovereignButton, SovereignInput, StatCard } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { ActionModal } from '../../components/ActionModal';
import { Plus, Wrench, CheckCircle } from 'lucide-react';

export const EstateDashboard = () => {
  // Use new Estate hook instead of InteractionContext
  const { tickets, addTicket, resolveTicket } = useEstate();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ location: '', issue: '', priority: 'LOW' as const, reportedBy: 'Estate Manager' });

  const handleCreate = () => {
    if (!form.location || !form.issue) return alert("Missing details");
    addTicket(form);
    setModalOpen(false);
    setForm({ location: '', issue: '', priority: 'LOW', reportedBy: 'Estate Manager' });
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Location", accessor: "location" },
    { header: "Issue", accessor: "issue" },
    { header: "Priority", accessor: (row: any) => <span className={`font-bold ${row.priority === 'CRITICAL' ? 'text-red-600' : 'text-gray-600'}`}>{row.priority}</span> },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'OPEN' ? 'error' : 'success'}>{row.status}</SovereignBadge> },
  ];

  const actions = (row: any) => (
    <button
      onClick={() => resolveTicket(row.id)}
      className={`text-xs px-2 py-1 rounded font-bold border transition-colors ${row.status === 'RESOLVED'
        ? 'bg-gray-100 text-gray-500 border-gray-200'
        : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        }`}
    >
      {row.status === 'RESOLVED' ? 'Re-open' : 'Mark Fixed'}
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Facility Management"
        subtitle="Maintenance Tickets"
        action={<SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Create Ticket</SovereignButton>}
      />

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Open Tickets" value={tickets.filter(t => t.status === 'OPEN').length} icon={<Wrench className="w-5 h-5 text-orange-500" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length} icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Critical" value={tickets.filter(t => t.priority === 'CRITICAL').length} icon={<Wrench className="w-5 h-5 text-red-500" />} />
        </Col>
      </Row>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SovereignTable data={tickets} columns={columns} actions={actions} />
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Maintenance Issue"
        footer={<SovereignButton onClick={handleCreate}>Submit Ticket</SovereignButton>}
      >
        <div className="space-y-4">
          <SovereignInput label="Location" placeholder="e.g. Science Lab 2" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <SovereignInput label="Issue Description" placeholder="e.g. AC leaking water" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
            <select className="w-full border p-2 rounded bg-white" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
              <option value="LOW">Low - Cosmetic</option>
              <option value="MEDIUM">Medium - Functional</option>
              <option value="HIGH">High - Urgent</option>
              <option value="CRITICAL">Critical - Safety Hazard</option>
            </select>
          </div>
        </div>
      </ActionModal>
    </div>
  );
};