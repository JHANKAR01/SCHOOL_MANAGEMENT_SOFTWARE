import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { SchoolConfig } from '../../../../types';
import { AttendanceModule } from '../../../../components/AttendanceModule';
import { Gradebook } from '../academics/Gradebook';
import { LibraryManagement } from '../library/LibraryManagement';
import { StatCard, PageHeader, SovereignButton, SovereignInput, SovereignBadge, SovereignTable } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Users, BookOpen, Clock, Plus, Video, Calendar, UploadCloud } from 'lucide-react';
import { useGeofencing } from '../../../../hooks/useGeofencing';
import { useAcademics } from '../../hooks/useAcademics';
import { ActionModal } from '../../components/ActionModal';

interface Props {
  school: SchoolConfig;
  activeModule: string;
}

export const TeacherDashboard: React.FC<Props> = ({ school, activeModule }) => {
  const { isWithinFence, isMockLocation, loading: geoLoading } = useGeofencing(school.location);
  const [checkedIn, setCheckedIn] = useState(false);

  // Use new Academics hook instead of InteractionContext
  const { homeworks, addHomework, applyLeave, leaves, liveClasses, toggleLiveClass } = useAcademics();

  // Modal States
  const [isHwModalOpen, setHwModalOpen] = useState(false);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  // Forms
  const [hwForm, setHwForm] = useState({ title: '', subject: 'Mathematics', description: '', dueDate: '', classId: '10-A' });
  const [leaveForm, setLeaveForm] = useState({ type: 'SICK', startDate: '', endDate: '', reason: '' });

  // Custom Selection State for Modals (replicating select behavior)
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [showLeaveTypeSelect, setShowLeaveTypeSelect] = useState(false);

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
      Linking.openURL('https://meet.jit.si/sovereign-math-10a');
    }
  };

  const SelectList = ({ label, items, selectedValue, onSelect, onClose }: any) => (
    <View className="mb-4">
      <Text className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</Text>
      <View className="border border-gray-200 rounded-lg overflow-hidden">
        {items.map((item: string) => (
          <Pressable
            key={item}
            onPress={() => { onSelect(item); onClose(); }}
            className={`p-3 border-b border-gray-100 ${selectedValue === item ? 'bg-indigo-50' : 'bg-white'}`}
          >
            <Text className={selectedValue === item ? 'text-indigo-700 font-bold' : 'text-gray-700'}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 md:p-8 max-w-7xl mx-auto pb-8">
        <View className="flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <PageHeader
            title="Classroom Management"
            subtitle="Class X-A • Mathematics"
          />

          <View className="flex-row items-center gap-2">
            {/* Smart Check-In Widget */}
            <View className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-row items-center gap-3">
              <View className={`w-3 h-3 rounded-full ${isWithinFence ? 'bg-green-500' : 'bg-red-500'}`} />
              <View>
                <Text className="font-bold text-gray-700 text-xs">{geoLoading ? 'Locating...' : (isWithinFence ? 'Inside Campus' : 'Outside Campus')}</Text>
                <Text className="text-[10px] text-gray-400">{isMockLocation ? '⚠️ GPS Spoofed' : 'GPS Verified'}</Text>
              </View>
              <SovereignButton
                onClick={handleStaffCheckIn}
                disabled={checkedIn || !isWithinFence || isMockLocation}
                className={`text-xs px-3 py-1.5 h-auto ${checkedIn ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
              >
                {checkedIn ? 'On Duty' : 'Staff Check-In'}
              </SovereignButton>
            </View>
          </View>
        </View>

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
            <Pressable
              className={`rounded-xl p-6 border flex-col items-center justify-center transition-all ${isMathLive ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
              onPress={handleStartClass}
            >
              <Video className={`w-8 h-8 mb-2 ${isMathLive ? 'text-red-600' : 'text-gray-400'}`} />
              <Text className={`font-bold text-sm ${isMathLive ? 'text-red-700' : 'text-gray-600'}`}>
                {isMathLive ? 'End Live Class' : 'Start Live Class'}
              </Text>
            </Pressable>
          </Col>
        </Row>

        {/* QUICK ACTIONS BAR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-4 pb-2">
            <SovereignButton icon={<Plus className="w-4 h-4" />} onClick={() => setHwModalOpen(true)}>Create Homework</SovereignButton>
            <SovereignButton icon={<Calendar className="w-4 h-4" />} variant="secondary" onClick={() => setLeaveModalOpen(true)}>Apply Leave</SovereignButton>
            <SovereignButton icon={<UploadCloud className="w-4 h-4" />} variant="ghost">Upload Syllabus</SovereignButton>
          </View>
        </ScrollView>

        {/* Content Area */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          {activeModule === 'ATTENDANCE' && <AttendanceModule school={school} />}
          {activeModule === 'GRADEBOOK' && <View className="p-6"><Gradebook /></View>}
          {activeModule === 'LIBRARY' && <View className="p-6"><LibraryManagement /></View>}

          {/* Default / Overview View showing Leaves and Recent HW */}
          {activeModule !== 'ATTENDANCE' && activeModule !== 'GRADEBOOK' && activeModule !== 'LIBRARY' && (
            <View className="p-6 space-y-8">
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-4">My Leave Applications</Text>
                <SovereignTable
                  data={leaves}
                  columns={[
                    { header: 'Type', accessor: 'type' },
                    { header: 'Dates', accessor: (row: any) => `${row.startDate} to ${row.endDate}` },
                    { header: 'Reason', accessor: 'reason' },
                    { header: 'Status', accessor: (row: any) => <SovereignBadge status={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'}>{row.status}</SovereignBadge> }
                  ]}
                />
              </View>

              <View className="mt-8">
                <Text className="text-lg font-bold text-gray-800 mb-4">Recent Homework</Text>
                <SovereignTable
                  data={homeworks}
                  columns={[
                    { header: 'Title', accessor: 'title' },
                    { header: 'Due Date', accessor: 'dueDate' },
                    { header: 'Status', accessor: (row: any) => <SovereignBadge status={row.status === 'SUBMITTED' ? 'success' : 'neutral'}>{row.status}</SovereignBadge> }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Create Homework Modal */}
        <ActionModal
          isOpen={isHwModalOpen}
          onClose={() => setHwModalOpen(false)}
          title="Create New Assignment"
          onConfirm={handleCreateHomework}
          confirmLabel="Publish"
        >
          <View className="space-y-4">
            <SovereignInput label="Title" value={hwForm.title} onChangeText={text => setHwForm({ ...hwForm, title: text })} placeholder="e.g. Exercise 4.2" />
            <SovereignInput label="Description" value={hwForm.description} onChangeText={text => setHwForm({ ...hwForm, description: text })} placeholder="Instructions..." />
            <Row>
              <Col className="w-1/2">
                <View>
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Subject</Text>
                  <Pressable
                    onPress={() => setShowSubjectSelect(true)}
                    className="w-full border border-gray-300 p-2 rounded bg-white flex-row justify-between"
                  >
                    <Text>{hwForm.subject}</Text>
                  </Pressable>
                </View>
              </Col>
              <Col className="w-1/2">
                <SovereignInput type="date" label="Due Date" value={hwForm.dueDate} onChangeText={text => setHwForm({ ...hwForm, dueDate: text })} />
              </Col>
            </Row>
          </View>

          {/* Nested Subject Select Overlay (Mocking a select dropdown) */}
          {showSubjectSelect && (
            <View className="absolute inset-0 bg-white z-50 p-4">
              <SelectList
                label="Select Subject"
                items={['Mathematics', 'Physics', 'Chemistry']}
                selectedValue={hwForm.subject}
                onSelect={(val: string) => setHwForm({ ...hwForm, subject: val })}
                onClose={() => setShowSubjectSelect(false)}
              />
              <SovereignButton variant="secondary" onClick={() => setShowSubjectSelect(false)}>Cancel</SovereignButton>
            </View>
          )}
        </ActionModal>

        {/* Leave Application Modal */}
        <ActionModal
          isOpen={isLeaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          title="Apply for Leave"
          onConfirm={handleApplyLeave}
          confirmLabel="Submit Application"
        >
          <View className="space-y-4">
            <View>
              <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Leave Type</Text>
              <Pressable
                onPress={() => setShowLeaveTypeSelect(true)}
                className="w-full border border-gray-300 p-2 rounded bg-white"
              >
                <Text>{leaveForm.type === 'SICK' ? 'Sick Leave' : leaveForm.type === 'CASUAL' ? 'Casual Leave' : 'Earned Leave'}</Text>
              </Pressable>
            </View>

            <Row>
              <Col className="w-1/2">
                <SovereignInput type="date" label="Start Date" value={leaveForm.startDate} onChangeText={text => setLeaveForm({ ...leaveForm, startDate: text })} />
              </Col>
              <Col className="w-1/2">
                <SovereignInput type="date" label="End Date" value={leaveForm.endDate} onChangeText={text => setLeaveForm({ ...leaveForm, endDate: text })} />
              </Col>
            </Row>
            <SovereignInput label="Reason" value={leaveForm.reason} onChangeText={text => setLeaveForm({ ...leaveForm, reason: text })} />

            {/* Nested Leave Type Select Overlay */}
            {showLeaveTypeSelect && (
              <View className="absolute inset-0 bg-white z-50 p-4">
                <SelectList
                  label="Select Leave Type"
                  items={['SICK', 'CASUAL', 'EARNED']}
                  selectedValue={leaveForm.type}
                  onSelect={(val: string) => setLeaveForm({ ...leaveForm, type: val })}
                  onClose={() => setShowLeaveTypeSelect(false)}
                />
                <SovereignButton variant="secondary" onClick={() => setShowLeaveTypeSelect(false)}>Cancel</SovereignButton>
              </View>
            )}
          </View>
        </ActionModal>
      </View>
    </ScrollView>
  );
};
