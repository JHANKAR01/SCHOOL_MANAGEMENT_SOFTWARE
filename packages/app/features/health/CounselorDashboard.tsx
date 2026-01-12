
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SovereignTable, PageHeader, StatCard, SovereignBadge } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { HeartPulse, Brain, UserPlus } from 'lucide-react';
import { DUMMY_STUDENTS } from '../../../api/src/data/dummy-data';

interface CounselorNote {
  id: number | string;
  date: string;
  student: string;
  category: string;
  note: string;
}

export const CounselorDashboard = () => {
  const { data: notes } = useQuery<CounselorNote[]>({
    queryKey: ['counselor-notes'],
    queryFn: async () => {
      // Mock counseling data - in production, fetch from API
      const mockCounseling = [
        { id: 1, student_id: 'std_0001', date: '2025-09-15', category: 'Academic', note: 'Student needs extra support in Math.' },
        { id: 2, student_id: 'std_0010', date: '2025-09-16', category: 'Behavioral', note: 'Discussion about classroom behavior.' },
        { id: 3, student_id: 'std_0025', date: '2025-09-17', category: 'Personal', note: 'Follow-up session scheduled.' },
      ];
      return mockCounseling.map(c => ({
        ...c,
        student: DUMMY_STUDENTS.find(s => s.id === c.student_id)?.name || c.student_id
      }));
    }
  });

  const columns: any[] = [
    { header: "Date", accessor: "date" },
    { header: "Student", accessor: "student" },
    { header: "Category", accessor: "category" },
    { header: "Notes", accessor: "note" },
    { header: "Severity", accessor: () => <SovereignBadge status="warning">Medium</SovereignBadge> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Student Wellness" subtitle="Counseling & Behavioral Health" />

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Active Cases" value="12" icon={<Brain className="w-5 h-5" />} trend={{ value: 2, isPositive: false }} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Sessions Today" value="5" icon={<UserPlus className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Flagged (Severe)" value="1" icon={<HeartPulse className="w-5 h-5 text-red-600" />} />
        </Col>
      </Row>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between">
          <h3 className="font-bold text-gray-700">Private Session Logs</h3>
          <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">+ New Session</button>
        </div>
        <SovereignTable data={notes || []} columns={columns} />
      </div>
    </div>
  );
};
