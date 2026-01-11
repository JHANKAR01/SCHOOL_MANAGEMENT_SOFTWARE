import React, { useState } from 'react';
import { PageHeader, StatCard, SovereignTable, SovereignBadge, SovereignButton, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Gradebook } from './Gradebook';
import { Users, CheckCircle, Wallet, Settings, Send } from 'lucide-react';
import { useInteraction } from '../../provider/InteractionContext';
import { ActionModal } from '../../components/ActionModal';

export const PrincipalDashboard: React.FC<{ activeModule: string }> = ({ activeModule }) => {
  const { leaves, updateLeaveStatus } = useInteraction();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState({ name: 'Sovereign High', address: 'New Delhi, India' });

  const handlePublishResults = () => {
    if (confirm("Are you sure you want to publish results to 1,240 parents via SMS?")) {
      alert("Results Published! SMS Broadcast initiated.");
    }
  };

  const leaveActions = (leave: any) => (
    <div className="flex gap-2">
      <button
        className="text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded border border-green-200 transition-colors"
        onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
      >
        Approve
      </button>
      <button
        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded border border-red-200 transition-colors"
        onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
      >
        Reject
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Principal's Office" subtitle="Academic Overview & Analytics" />
        <SovereignButton variant="ghost" icon={<Settings className="w-5 h-5" />} onClick={() => setSettingsOpen(true)}>
          Config
        </SovereignButton>
      </div>

      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <StatCard title="Total Students" value="1,240" trend={{ value: 2, isPositive: true }} icon={<Users className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Avg Attendance" value="94%" trend={{ value: 1.5, isPositive: true }} icon={<CheckCircle className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Staff Present" value="48/50" icon={<Users className="w-5 h-5" />} subtitle="2 on Leave" />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Term Revenue" value="92%" icon={<Wallet className="w-5 h-5" />} subtitle="Collection Rate" />
        </Col>
      </Row>

      {activeModule === 'RESULTS' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <SovereignButton icon={<Send className="w-4 h-4" />} onClick={handlePublishResults}>Publish Term Results</SovereignButton>
          </div>
          <Gradebook />
        </div>
      )}

      {activeModule === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800">Pending Leave Applications</h3>
            </div>
            <SovereignTable
              data={leaves.filter(l => l.status === 'PENDING')}
              columns={[
                { header: 'Teacher', accessor: 'teacherName' },
                { header: 'Type', accessor: 'type' },
                { header: 'Reason', accessor: 'reason' },
                { header: 'Duration', accessor: (row: any) => `${row.startDate} - ${row.endDate}` }
              ]}
              actions={leaveActions}
            />
            {leaves.filter(l => l.status === 'PENDING').length === 0 && (
              <div className="p-8 text-center text-gray-400">No pending requests.</div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <ActionModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="School Configuration"
        onConfirm={() => setSettingsOpen(false)}
        confirmLabel="Save Changes"
      >
        <div className="space-y-4">
          <SovereignInput label="School Name" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} />
          <SovereignInput label="Address" value={config.address} onChange={e => setConfig({ ...config, address: e.target.value })} />
        </div>
      </ActionModal>
    </div>
  );
};
