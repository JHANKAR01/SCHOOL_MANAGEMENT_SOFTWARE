
import React, { useState } from 'react';
import { useInteraction } from '../../provider/InteractionContext';
import { PageHeader, SovereignButton, SovereignInput, SovereignBadge, StatCard } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { ActionModal } from '../../components/ActionModal';
import { Plus, Activity, Thermometer } from 'lucide-react';

export const InfirmaryDashboard = () => {
  const { medicalLogs, students, addMedicalLog } = useInteraction();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', issue: '', action: '' });

  const handleLogVisit = () => {
    if (!form.studentId || !form.issue) return alert("Required details missing");

    const studentName = students.find(s => s.id === form.studentId)?.name || form.studentId;

    addMedicalLog({
      student: studentName,
      issue: form.issue,
      action: form.action
    });

    setModalOpen(false);
    setForm({ studentId: '', issue: '', action: '' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Infirmary & Health Logs" subtitle="Daily Medical Registry" />
        <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Log Visit</SovereignButton>
      </div>

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Visits Today" value={medicalLogs.filter(l => l.date === new Date().toLocaleDateString()).length} icon={<Activity className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Common Issue" value="Fever" icon={<Thermometer className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Vaccination Drive" value="45%" icon={<Activity className="w-5 h-5 text-green-600" />} subtitle="Consent Received" />
        </Col>
      </Row>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700">Recent Visits</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {medicalLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{log.student}</p>
                  <p className="text-sm text-red-600 font-medium mt-1">Diagnosis: {log.issue}</p>
                  <p className="text-xs text-gray-500 mt-1">Action: {log.action}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded block mb-1">{log.time}</span>
                  <span className="text-[10px] text-gray-400">{log.date}</span>
                </div>
              </div>
            </div>
          ))}
          {medicalLogs.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">No medical logs found.</div>
          )}
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Medical Visit"
        onConfirm={handleLogVisit}
        confirmLabel="Record Entry"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">Select Student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
              ))}
            </select>
          </div>
          <SovereignInput label="Issue / Diagnosis" placeholder="e.g. Headache" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} />
          <SovereignInput label="Action Taken" placeholder="e.g. Rest prescribed" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} />
        </div>
      </ActionModal>
    </div>
  );
};
