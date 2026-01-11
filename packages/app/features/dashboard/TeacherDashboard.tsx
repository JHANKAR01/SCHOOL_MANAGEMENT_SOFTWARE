import React, { useState } from 'react';
import { SchoolConfig } from '../../../../types';
import { AttendanceModule } from '../../../../components/AttendanceModule';
import { Gradebook } from '../academics/Gradebook';
import { LibraryManagement } from '../library/LibraryManagement';
import { StatCard, PageHeader, SovereignButton, SovereignInput, SovereignBadge, SovereignTable } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Users, BookOpen, Clock, Plus, Video, Calendar, UploadCloud } from 'lucide-react';
import { useGeofencing } from '../../../../hooks/useGeofencing';
import { useInteraction } from '../../provider/InteractionContext';
import { ActionModal } from '../../components/ActionModal';

interface Props {
  school: SchoolConfig;
  activeModule: string;
}

export const TeacherDashboard: React.FC<Props> = ({ school, activeModule }) => {
  const { isWithinFence, isMockLocation, loading: geoLoading } = useGeofencing(school.location);
  const [checkedIn, setCheckedIn] = useState(false);

  // Interaction Context
  const { homeworks, addHomework, applyLeave, leaves, liveClasses, toggleLiveClass } = useInteraction();

  // Modal States
  const [isHwModalOpen, setHwModalOpen] = useState(false);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  // Forms
  const [hwForm, setHwForm] = useState({ title: '', subject: 'Mathematics', description: '', dueDate: '', classId: '10-A' });
  const [leaveForm, setLeaveForm] = useState({ type: 'SICK', startDate: '', endDate: '', reason: '' });

  const handleStaffCheckIn = () => {
    if (isMockLocation) {
      alert("Security Alert: Mock Location Detected. Check-in denied.");
      return;
    }
    if (!isWithinFence) {
      alert("You are outside the school campus. Please enter the gate to check in.");
      return;
    }
    setCheckedIn(true);
    alert("Checked in successfully at " + new Date().toLocaleTimeString());
  };

  const handleCreateHomework = () => {
    if (!hwForm.title || !hwForm.dueDate) {
      alert("Please fill required fields");
      return;
    }
    addHomework(hwForm);
    setHwModalOpen(false);
    setHwForm({ title: '', subject: 'Mathematics', description: '', dueDate: '', classId: '10-A' });
    alert("Homework Created Successfully!");
  };

  const handleApplyLeave = () => {
    applyLeave(leaveForm as any);
    setLeaveModalOpen(false);
    setLeaveForm({ type: 'SICK', startDate: '', endDate: '', reason: '' });
    alert("Leave Application Sent.");
  };

  const isMathLive = liveClasses['Mathematics'] || false;

  const handleStartClass = () => {
    const newState = !isMathLive;
    toggleLiveClass('Mathematics', newState);
    if (newState) {
      window.open('https://meet.jit.si/sovereign-math-10a', '_blank');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <PageHeader
          title="Classroom Management"
          subtitle="Class X-A • Mathematics"
        />

        <div className="flex items-center gap-2">
          {/* Smart Check-In Widget */}
          <div className="bg-white p-2 rounded-lg border shadow-sm flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isWithinFence ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div className="text-xs">
              <p className="font-bold text-gray-700">{geoLoading ? 'Locating...' : (isWithinFence ? 'Inside Campus' : 'Outside Campus')}</p>
              <p className="text-[10px] text-gray-400">{isMockLocation ? '⚠️ GPS Spoofed' : 'GPS Verified'}</p>
            </div>
            <SovereignButton
              onClick={handleStaffCheckIn}
              disabled={checkedIn || !isWithinFence || isMockLocation}
              className={`text-xs px-3 py-1.5 h-auto ${checkedIn ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
            >
              {checkedIn ? 'On Duty' : 'Staff Check-In'}
            </SovereignButton>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <StatCard title="Students Present" value="42/45" trend={{ value: 98, isPositive: true }} icon={<Users className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Syllabus" value="75%" subtitle="Chapter 12: Calculus" icon={<BookOpen className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Active HW" value={homeworks.filter(h => h.status === 'PENDING').length} subtitle="Assignments Open" icon={<Clock className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <div
            className={`rounded-xl p-6 border flex flex-col items-center justify-center cursor-pointer transition-all ${isMathLive ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-indigo-300'
              }`}
            onClick={handleStartClass}
          >
            <Video className={`w-8 h-8 mb-2 ${isMathLive ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
            <span className={`font-bold text-sm ${isMathLive ? 'text-red-700' : 'text-gray-600'}`}>
              {isMathLive ? 'End Live Class' : 'Start Live Class'}
            </span>
          </div>
        </Col>
      </Row>

      {/* QUICK ACTIONS BAR */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setHwModalOpen(true)}>Create Homework</SovereignButton>
        <SovereignButton icon={<Calendar className="w-4 h-4" />} variant="secondary" onClick={() => setLeaveModalOpen(true)}>Apply Leave</SovereignButton>
        <SovereignButton icon={<UploadCloud className="w-4 h-4" />} variant="ghost">Upload Syllabus</SovereignButton>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {activeModule === 'ATTENDANCE' && <AttendanceModule school={school} />}
        {activeModule === 'GRADEBOOK' && <div className="p-6"><Gradebook /></div>}
        {activeModule === 'LIBRARY' && <div className="p-6"><LibraryManagement /></div>}

        {/* Default / Overview View showing Leaves and Recent HW */}
        {activeModule !== 'ATTENDANCE' && activeModule !== 'GRADEBOOK' && activeModule !== 'LIBRARY' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">My Leave Applications</h3>
              <SovereignTable
                data={leaves}
                columns={[
                  { header: 'Type', accessor: 'type' },
                  { header: 'Dates', accessor: (row: any) => `${row.startDate} to ${row.endDate}` },
                  { header: 'Reason', accessor: 'reason' },
                  { header: 'Status', accessor: (row: any) => <SovereignBadge status={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'}>{row.status}</SovereignBadge> }
                ]}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Homework</h3>
              <SovereignTable
                data={homeworks}
                columns={[
                  { header: 'Title', accessor: 'title' },
                  { header: 'Due Date', accessor: 'dueDate' },
                  { header: 'Status', accessor: (row: any) => <SovereignBadge status={row.status === 'SUBMITTED' ? 'success' : 'neutral'}>{row.status}</SovereignBadge> }
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Homework Modal */}
      <ActionModal
        isOpen={isHwModalOpen}
        onClose={() => setHwModalOpen(false)}
        title="Create New Assignment"
        onConfirm={handleCreateHomework}
        confirmLabel="Publish"
      >
        <div className="space-y-4">
          <SovereignInput label="Title" value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} placeholder="e.g. Exercise 4.2" />
          <SovereignInput label="Description" value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} placeholder="Instructions..." />
          <Row>
            <Col className="w-1/2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                <select className="w-full border p-2 rounded bg-white" value={hwForm.subject} onChange={e => setHwForm({ ...hwForm, subject: e.target.value })}>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                </select>
              </div>
            </Col>
            <Col className="w-1/2">
              <SovereignInput type="date" label="Due Date" value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} />
            </Col>
          </Row>
        </div>
      </ActionModal>

      {/* Leave Application Modal */}
      <ActionModal
        isOpen={isLeaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Apply for Leave"
        onConfirm={handleApplyLeave}
        confirmLabel="Submit Application"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Leave Type</label>
            <select className="w-full border p-2 rounded bg-white" value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="EARNED">Earned Leave</option>
            </select>
          </div>
          <Row>
            <Col className="w-1/2">
              <SovereignInput type="date" label="Start Date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
            </Col>
            <Col className="w-1/2">
              <SovereignInput type="date" label="End Date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
            </Col>
          </Row>
          <SovereignInput label="Reason" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
        </div>
      </ActionModal>
    </div>
  );
};
