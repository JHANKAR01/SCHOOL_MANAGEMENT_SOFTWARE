import React, { useState } from 'react';
import { useInteraction } from '../../provider/InteractionContext';
import { SovereignTable, PageHeader, StatCard, SovereignBadge, SovereignButton, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { ActionModal } from '../../components/ActionModal';
import { BookOpen, Users, AlertCircle, CheckCircle } from 'lucide-react';

export const HODDashboard = () => {
  const { syllabus, approveSyllabus } = useInteraction();
  const [activeTab, setActiveTab] = useState<'SYLLABUS' | 'SUBSTITUTION'>('SYLLABUS');

  // Substitution State
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({ absentTeacher: '', replacement: '', class: '', period: '' });

  // Mock Teachers for dropdown
  const teachers = ["Mr. T. Das", "Ms. K. Sharma", "Mrs. R. Iyer", "Mr. P. Singh"];

  const handleAssignSubstitution = () => {
    if (!subForm.absentTeacher || !subForm.replacement) {
      alert("Please select both teachers.");
      return;
    }
    alert(`Substitution Assigned: ${subForm.replacement} taking ${subForm.class} in place of ${subForm.absentTeacher}`);
    setSubModalOpen(false);
    setSubForm({ absentTeacher: '', replacement: '', class: '', period: '' });
  };

  const syllabusColumns = [
    { header: "Teacher", accessor: "teacher" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    {
      header: "Progress", accessor: (row: any) => (
        <div className="w-full max-w-[140px]">
          <div className="flex justify-between text-[10px] mb-1">
            <span>{row.completed}%</span>
            <span className="text-gray-400">Target: {row.target}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${row.completed}%` }} />
          </div>
        </div>
      )
    },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'ON_TRACK' || row.status === 'COMPLETED' ? 'success' : 'warning'}>{row.status.replace('_', ' ')}</SovereignBadge> },
  ];

  const syllabusActions = (row: any) => (
    row.status !== 'COMPLETED' ? (
      <button
        onClick={() => approveSyllabus(row.id)}
        className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded border border-indigo-200"
      >
        Approve
      </button>
    ) : (
      <span className="flex items-center text-xs font-bold text-green-600">
        <CheckCircle className="w-3 h-3 mr-1" /> Approved
      </span>
    )
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Department Head" subtitle="Academic Oversight & Logistics" />

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Syllabus Status" value="On Track" icon={<BookOpen className="w-5 h-5" />} subtitle="85% Completion Avg" />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Teachers Present" value="12/14" icon={<Users className="w-5 h-5" />} subtitle="2 Absent Today" />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Pending Review" value={syllabus.filter(s => s.status !== 'COMPLETED').length} icon={<AlertCircle className="w-5 h-5" />} />
        </Col>
      </Row>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('SYLLABUS')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'SYLLABUS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          Syllabus Plans
        </button>
        <button
          onClick={() => setActiveTab('SUBSTITUTION')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'SUBSTITUTION' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          Substitution Management
        </button>
      </div>

      {activeTab === 'SYLLABUS' && (
        <SovereignTable
          data={syllabus}
          columns={syllabusColumns}
          actions={syllabusActions}
        />
      )}

      {activeTab === 'SUBSTITUTION' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <SovereignButton onClick={() => setSubModalOpen(true)}>+ Assign Substitute</SovereignButton>
          </div>
          <div className="bg-white p-8 text-center border border-dashed border-gray-300 rounded-xl text-gray-500">
            <p>No active substitutions assigned yet for today.</p>
          </div>
        </div>
      )}

      <ActionModal
        isOpen={isSubModalOpen}
        onClose={() => setSubModalOpen(false)}
        title="Assign Teacher Substitute"
        onConfirm={handleAssignSubstitution}
        confirmLabel="Assign"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Absent Teacher</label>
            <select
              className="w-full border p-2 rounded bg-white text-sm"
              value={subForm.absentTeacher}
              onChange={e => setSubForm({ ...subForm, absentTeacher: e.target.value })}
            >
              <option value="">Select...</option>
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Row>
            <Col className="w-1/2">
              <SovereignInput label="Class" value={subForm.class} onChange={e => setSubForm({ ...subForm, class: e.target.value })} />
            </Col>
            <Col className="w-1/2">
              <SovereignInput label="Period" value={subForm.period} onChange={e => setSubForm({ ...subForm, period: e.target.value })} />
            </Col>
          </Row>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Replacement Teacher</label>
            <select
              className="w-full border p-2 rounded bg-white text-sm"
              value={subForm.replacement}
              onChange={e => setSubForm({ ...subForm, replacement: e.target.value })}
            >
              <option value="">Select Free Teacher...</option>
              {teachers.filter(t => t !== subForm.absentTeacher).map(t => <option key={t} value={t}>{t} (Free)</option>)}
            </select>
          </div>
        </div>
      </ActionModal>
    </div>
  );
};
