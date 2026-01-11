
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SovereignTable, PageHeader, StatCard, SovereignBadge, SovereignButton, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { FileText, Lock, Printer, Plus } from 'lucide-react';
import { useInteraction } from '../../provider/InteractionContext';
import { ActionModal } from '../../components/ActionModal';

// Mock inventory for exams
const MOCK_PAPERS = [
  { id: 'QP-1', subject: 'Mathematics', class: 'X', copies: 150, status: 'PRINTED', location: 'Strong Room A' },
  { id: 'QP-2', subject: 'Physics', class: 'XII', copies: 80, status: 'PENDING', location: '-' },
  { id: 'QP-3', subject: 'English', class: 'IX', copies: 120, status: 'PRINTED', location: 'Strong Room B' },
];

export const ExamCellDashboard = () => {
  const { exams, addExam } = useInteraction();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  const handleCreate = () => {
    addExam({ ...form, classes: ['X', 'XII'] });
    setModalOpen(false);
    setForm({ name: '', startDate: '', endDate: '' });
  };

  const { data: papers } = useQuery({
    queryKey: ['papers'],
    queryFn: async () => {
      return MOCK_PAPERS;
    }
  });

  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Copies", accessor: "copies" },
    { header: "Secure Location", accessor: "location" },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'PRINTED' ? 'success' : 'warning'}>{row.status}</SovereignBadge> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Exam Controller" subtitle="Confidential: Assessment Logistics" />
        <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Schedule Exam</SovereignButton>
      </div>

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Upcoming Exams" value={exams.length + 5} icon={<FileText className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Papers Printed" value="1,250" icon={<Printer className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Strong Room" value="Locked" icon={<Lock className="w-5 h-5 text-green-600" />} />
        </Col>
      </Row>

      <div className="mb-8">
        <h3 className="font-bold mb-4">Scheduled Examinations</h3>
        <div className="space-y-2">
          {exams.map(ex => (
            <div key={ex.id} className="bg-white p-4 rounded border flex justify-between items-center">
              <span className="font-bold">{ex.name}</span>
              <span className="text-sm text-gray-500">{ex.startDate} to {ex.endDate}</span>
            </div>
          ))}
          {exams.length === 0 && <p className="text-sm text-gray-400 italic">No exams scheduled in this session.</p>}
        </div>
      </div>

      <SovereignTable data={papers || []} columns={columns} />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule New Exam"
        footer={<SovereignButton onClick={handleCreate}>Confirm Schedule</SovereignButton>}
      >
        <div className="space-y-4">
          <SovereignInput label="Exam Name" placeholder="e.g. Half-Yearly 2024" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Row>
            <Col className="w-1/2">
              <SovereignInput type="date" label="Start Date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </Col>
            <Col className="w-1/2">
              <SovereignInput type="date" label="End Date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </Col>
          </Row>
        </div>
      </ActionModal>
    </div>
  );
};
