import React, { useState } from 'react';
import { useHR } from '../../hooks/useHR';
import { UserRole } from '../../../../types';
import { SovereignButton, SovereignTable, SovereignInput, PageHeader } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { Plus, DollarSign, Trash2 } from 'lucide-react';

export const StaffManagement = () => {
  // Use new HR hook instead of InteractionContext
  const { localStaff, addStaff } = useHR();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: UserRole.TEACHER, department: '', joinedAt: '' });

  const handleHire = () => {
    if (!newStaff.name || !newStaff.joinedAt) return alert("Required fields missing");
    addStaff(newStaff);
    setShowAddModal(false);
    setNewStaff({ name: '', role: UserRole.TEACHER, department: '', joinedAt: '' });
    alert("Staff member onboarded successfully.");
  };

  const handleRunPayroll = () => {
    const totalSalaries = localStaff.length * 25000; // Mock calculation
    if (confirm(`Generate Payroll for ${localStaff.length} employees?\nEst. Total: ₹${totalSalaries.toLocaleString()}`)) {
      alert("Payroll Processed! Salary slips generated and emailed.");
    }
  };

  const columns = [
    { header: "Employee Name", accessor: "name" },
    { header: "Role", accessor: (row: any) => <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-bold">{row.role}</span> },
    { header: "Department", accessor: (row: any) => row.department || '-' },
    { header: "Joining Date", accessor: "joinedAt" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Human Resources"
        subtitle="Staff Directory & Payroll"
        action={
          <div className="flex gap-2">
            <SovereignButton variant="secondary" icon={<DollarSign className="w-4 h-4" />} onClick={handleRunPayroll}>Run Payroll</SovereignButton>
            <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Onboard Staff</SovereignButton>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SovereignTable
          data={localStaff}
          columns={columns}
          actions={(emp) => (
            <button className="text-red-400 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
          )}
        />
      </div>

      <ActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Employee Onboarding"
        footer={<SovereignButton onClick={handleHire}>Confirm Hiring</SovereignButton>}
      >
        <div className="space-y-4">
          <SovereignInput label="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
              <select className="w-full border p-2 rounded bg-white" value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}>
                {Object.values(UserRole).filter(r => r !== 'STUDENT' && r !== 'PARENT').map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <SovereignInput type="date" label="Joining Date" value={newStaff.joinedAt} onChange={e => setNewStaff({ ...newStaff, joinedAt: e.target.value })} />
          </div>

          {newStaff.role === UserRole.TEACHER && (
            <SovereignInput label="Department" value={newStaff.department} onChange={e => setNewStaff({ ...newStaff, department: e.target.value })} placeholder="e.g. Science" />
          )}
        </div>
      </ActionModal>
    </div>
  );
};