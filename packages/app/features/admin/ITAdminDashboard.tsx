
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCard, PageHeader, SovereignBadge } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Server, Wifi, Database, Fingerprint, Activity } from 'lucide-react';
// import { io } from 'socket.io-client'; // In prod: import io from 'socket.io-client'

export const ITAdminDashboard = () => {
  const [bioAgents, setBioAgents] = useState({
    'gate-1': { status: 'OFFLINE', lastSeen: 0 },
    'staff-room': { status: 'OFFLINE', lastSeen: 0 },
    'library': { status: 'OFFLINE', lastSeen: 0 }
  });

  // System Health Query
  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // DEMO MODE MOCK
      return { status: 'OPERATIONAL', uptime: 345600 };
    }
  });

  // Real-time Socket Listener
  useEffect(() => {
    // In a real environment, we would initialize the socket client here
    // const socket = io('https://api.sovereign.school');

    // socket.on('biometric:heartbeat', (data: { deviceId: string, timestamp: number }) => {
    //   setBioAgents(prev => ({
    //     ...prev,
    //     [data.deviceId]: { status: 'ONLINE', lastSeen: Date.now() }
    //   }));
    // });

    // Simulation for Demo
    const interval = setInterval(() => {
      const device = Math.random() > 0.5 ? 'gate-1' : 'staff-room';
      setBioAgents(prev => ({
        ...prev,
        [device]: { status: 'ONLINE', lastSeen: Date.now() }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="System Administration" subtitle="Infrastructure & Device Health" />

      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <StatCard title="API Status" value={health?.status || 'Unknown'} icon={<Server className="w-5 h-5 text-green-600" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Uptime" value={`${Math.floor((health?.uptime || 0) / 60)}m`} icon={<Activity className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Database" value="Connected" icon={<Database className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Latency" value="24ms" icon={<Wifi className="w-5 h-5" />} />
        </Col>
      </Row>

      <Row>
        <Col className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Biometric Agents
              </h3>
              <span className="text-xs animate-pulse text-green-600 font-bold">● Live Socket</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-700">Main Gate (Entry)</span>
                <SovereignBadge status={bioAgents['gate-1'].status === 'ONLINE' ? 'success' : 'error'}>
                  {bioAgents['gate-1'].status}
                </SovereignBadge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-700">Staff Room (Bio-1)</span>
                <SovereignBadge status={bioAgents['staff-room'].status === 'ONLINE' ? 'success' : 'error'}>
                  {bioAgents['staff-room'].status}
                </SovereignBadge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-700">Library (Bio-2)</span>
                <SovereignBadge status={bioAgents['library'].status === 'ONLINE' ? 'success' : 'error'}>
                  {bioAgents['library'].status}
                </SovereignBadge>
              </div>
            </div>
          </div>
        </Col>

        <Col className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
            <h3 className="font-bold mb-4">Storage Quota</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Database (PostgreSQL)</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Backups (S3)</span>
                  <span>12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '12%' }}></div></div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
