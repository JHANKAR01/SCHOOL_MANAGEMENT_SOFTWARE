
import React, { useState, useEffect } from 'react';
import { View, Text, Platform, ScrollView, Linking } from 'react-native';
import { SchoolConfig, UserRole } from '../../../../types';
import ParentPayments from '../../../../apps/mobile/app/parent/payments';
import TransportTracking from '../../../../apps/mobile/app/parent/transport';
import { Gradebook } from '../academics/Gradebook';
import { StatCard, PageHeader, SovereignButton, SovereignBadge, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Wallet, Bus, FileText, CheckCircle, Bell, Video, Upload } from 'lucide-react';
import { useInteraction } from '../../provider/InteractionContext';
import { ActionModal } from '../../components/ActionModal';
// Note: generatePDFMarksheet removed - using API fetch instead

interface Props {
  school: SchoolConfig;
  activeModule: string;
  role?: UserRole;
}

export const ParentDashboard: React.FC<Props> = ({ school, activeModule, role }) => {
  // State for live data
  const [student, setStudent] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction Context
  const { liveClasses, homeworks, submitHomework } = useInteraction();
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedHw, setSelectedHw] = useState<string | null>(null);

  const activeLiveSubjects = Object.entries(liveClasses).filter(([_, isActive]) => isActive).map(([sub]) => sub);
  const isStudent = role === UserRole.STUDENT;

  // FETCH LIVE DATA
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const studentId = 'std_1'; // Hardcoded for transition phase as mock replacement

        const [studentRes, invoiceRes] = await Promise.all([
          fetch(`/api/operations/student/${studentId}`),
          fetch(`/api/finance/invoices?studentId=${studentId}`)
        ]);

        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData);
        }

        if (invoiceRes.ok) {
          const invoiceData = await invoiceRes.json();
          setInvoices(invoiceData.filter((inv: any) => inv.status === 'PENDING'));
        }
      } catch (err) {
        console.error("Dashboard Fetch Failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const totalDue = invoices.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmitHw = () => {
    if (selectedHw) {
      submitHomework(selectedHw);
      setSubmissionModalOpen(false);
      setSelectedHw(null);
      alert("Assignment Submitted Successfully!");
    }
  };

  const downloadReportCard = async () => {
    if (!student) return;
    try {
      // Call API endpoint instead of direct service function
      const res = await fetch(`/api/reports/generate?studentId=${student.id}&term=TERM_1_FINAL`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      const url = data.url;

      if (url) {
        if (Platform.OS === 'web') {
          const link = document.createElement('a');
          link.href = url;
          link.download = `${student.name}_ReportCard.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          Linking.openURL(url);
        }
      }
    } catch (e) {
      console.error("PDF Fail", e);
    }
  };

  if (loading) return <View className="p-8 items-center"><Text>Loading Dashboard...</Text></View>;
  if (!student) return <View className="p-8 items-center"><Text className="text-red-500">Failed to load profile.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 w-full">

        {/* LIVE CLASS BANNER (Student Only) */}
        {isStudent && activeLiveSubjects.length > 0 && (
          <View className="bg-red-500 p-4 rounded-xl shadow-lg mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 p-2 rounded-full">
                <Video className="w-6 h-6 text-white" />
              </View>
              <View>
                <Text className="font-bold text-lg text-white">Live Class in Session</Text>
                <Text className="text-sm text-white opacity-90">{activeLiveSubjects.join(', ')} is live now.</Text>
              </View>
            </View>
            <SovereignButton
              className="bg-white border-none"
              onClick={() => Linking.openURL('https://meet.jit.si/sovereign-math-10a')}
            >
              <Text className="text-red-600 font-bold">Join Now</Text>
            </SovereignButton>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-6">
          <PageHeader
            title={isStudent ? "My Dashboard" : "Student Portal"}
            subtitle={`${student.name} • Class ${student.class}`}
          />
          <View className="p-2 bg-white border border-gray-200 rounded-full relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </View>
        </View>

        {/* KPI GRID - Mobile Optimized (2x2) */}
        <Row className="mb-8">
          <Col className="w-full md:w-1/4">
            <StatCard
              title="Fees Due"
              value={`₹${totalDue.toLocaleString()}`}
              icon={<Wallet className="w-4 h-4" />}
              subtitle={invoices.length > 0 ? "Action Required" : "All Clear"}
            />
          </Col>
          <Col className="w-full md:w-1/4">
            <StatCard title="Attendance" value="92%" trend={{ value: 5, isPositive: true }} icon={<CheckCircle className="w-4 h-4" />} />
          </Col>
          <Col className="w-full md:w-1/4">
            <StatCard title="Bus Status" value="On Time" subtitle="ETA 4:10 PM" icon={<Bus className="w-4 h-4" />} />
          </Col>
          <Col className="w-full md:w-1/4">
            <StatCard title="Result" value="A+" subtitle="Term 1" icon={<FileText className="w-4 h-4" />} />
          </Col>
        </Row>

        {/* HOMEWORK SECTION (Visible by Default) */}
        {activeModule !== 'FEES' && activeModule !== 'TRACKING' && activeModule !== 'REPORT' && (
          <View className="mb-8">
            <Text className="font-bold text-gray-800 mb-4 text-lg">Pending Assignments</Text>
            <View className="gap-3">
              {homeworks.map(hw => (
                <View key={hw.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold text-gray-900">{hw.title}</Text>
                    <Text className="text-xs text-gray-500">{hw.subject} • Due {hw.dueDate}</Text>
                  </View>
                  {isStudent && hw.status === 'PENDING' ? (
                    <SovereignButton
                      className="h-8 py-1"
                      onClick={() => { setSelectedHw(hw.id); setSubmissionModalOpen(true); }}
                    >
                      Submit
                    </SovereignButton>
                  ) : (
                    <SovereignBadge status={hw.status === 'PENDING' ? 'warning' : 'success'}>{hw.status}</SovereignBadge>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeModule === 'FEES' && <ParentPayments />}

        {activeModule === 'TRACKING' && (
          <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-800">Live Bus Tracking</Text>
            </View>
            <TransportTracking />
          </View>
        )}

        {activeModule === 'REPORT' && (
          <View className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-gray-800 text-lg">Academic Performance</Text>
              <SovereignButton variant="secondary" icon={<Upload className="w-4 h-4 rotate-180" />} onClick={downloadReportCard}>
                Download PDF
              </SovereignButton>
            </View>
            <View className={Platform.OS === 'web' ? "pointer-events-none md:pointer-events-auto" : ""}>
              <Gradebook />
            </View>
          </View>
        )}

        {/* THUMB ZONE ACTION BAR (Mobile Only) */}
        {/* 
            FIX: Only render if NOT web and (optionally) if user is a student. 
            Using Platform.OS vs 'web' check. 
        */}
        {Platform.OS !== 'web' && isStudent && (
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex-row gap-3 shadow-xl z-50">
            <SovereignButton className="flex-1 py-3" variant="secondary" icon={<Bus className="w-4 h-4" />}>
              Track Bus
            </SovereignButton>
            <SovereignButton className="flex-1 py-3 shadow-xl shadow-indigo-500/20" icon={<Wallet className="w-4 h-4" />}>
              Pay Fees
            </SovereignButton>
          </View>
        )}

        {/* Submission Modal */}
        <ActionModal
          isOpen={submissionModalOpen}
          onClose={() => setSubmissionModalOpen(false)}
          title="Submit Assignment"
          footer={
            <SovereignButton onClick={handleSubmitHw}>Upload & Turn In</SovereignButton>
          }
        >
          <View className="space-y-4">
            <SovereignInput label="Your Answer" placeholder="Type here..." />
            <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 justify-center items-center">
              <Text className="text-gray-500 text-sm">Tap to attach file (PDF/IMG)</Text>
            </View>
          </View>
        </ActionModal>
      </View>
    </ScrollView>
  );
};
