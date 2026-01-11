
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SovereignTable, PageHeader, StatCard, SovereignBadge } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const MOCK_SUBSTITUTIONS = [
  { id: 1, absentTeacher: 'Mrs. R. Iyer', period: 3, class: 'VIII-B', subject: 'History', assignedTo: 'Mr. T. Das (Free)' },
  { id: 2, absentTeacher: 'Mr. P. Singh', period: 5, class: 'X-A', subject: 'PT', assignedTo: 'Library' },
  { id: 3, absentTeacher: 'Ms. K. Sharma', period: 1, class: 'XII-Sci', subject: 'Physics', assignedTo: 'Self Study' },
];

export const VicePrincipalDashboard = () => {
  const { data: substitutions, isLoading } = useQuery({
    queryKey: ['substitutions'],
    queryFn: async () => {
      // Future: SOVEREIGN_GENESIS_DATA.substitutions
      return MOCK_SUBSTITUTIONS;
    }
  });

  const columns = [
    { header: "Period", accessor: "period" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Absent Teacher", accessor: "absentTeacher" },
    { header: "Assigned To", accessor: (row: any) => <span className="font-bold text-indigo-600">{row.assignedTo}</span> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Vice Principal Operations" subtitle="Daily Academic Logistics" />

      <Row className="mb-8">
        <Col className="w-full md:w-1/3">
          <StatCard title="Staff on Leave" value="3" icon={<Users className="w-5 h-5" />} trend={{ value: 2, isPositive: false }} />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Free Periods" value="12" icon={<Calendar className="w-5 h-5" />} subtitle="Available for Sub" />
        </Col>
        <Col className="w-full md:w-1/3">
          <StatCard title="Critical Gaps" value="0" icon={<AlertTriangle className="w-5 h-5" />} subtitle="All classes covered" />
        </Col>
      </Row>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Today's Substitution Plan</h2>
          <SovereignBadge status="success">Auto-Generated</SovereignBadge>
        </div>
        {isLoading ? <div className="p-8 text-center">Loading Schedules...</div> :
          <SovereignTable data={substitutions || []} columns={columns} />
        }
      </div>
    </div>
  );
};
