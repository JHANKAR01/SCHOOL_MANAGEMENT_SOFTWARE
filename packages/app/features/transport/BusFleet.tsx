import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTransport, LiveBus } from '../../hooks/useTransport';
import { useFinance } from '../../hooks/useFinance';
import { SovereignButton, SovereignTable, SovereignBadge, SovereignInput, StatCard, PageHeader, Column } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { Row, Col } from '../../components/Layout';
import { Bus, MapPin, Fuel, UserPlus, PlayCircle, StopCircle } from 'lucide-react';

export const BusFleet = () => {
  // Use new Transport hook for buses data and mutations
  const { buses, updateBusStatus, assignBusDriver } = useTransport();
  // Use new Finance hook for expense logging
  const { addExpense } = useFinance();

  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [driverForm, setDriverForm] = useState('');
  const [fuelForm, setFuelForm] = useState({ liters: '', amount: '' });

  const activeBuses = buses.filter(b => b.status === 'ON_ROUTE').length;

  // Actions
  const handleAssignDriver = () => {
    if (selectedBusId && driverForm) {
      assignBusDriver(selectedBusId, driverForm);
      setDriverModalOpen(false);
      setDriverForm('');
    }
  };

  const handleLogFuel = () => {
    if (selectedBusId && fuelForm.amount) {
      addExpense({
        category: 'MAINTENANCE',
        amount: parseFloat(fuelForm.amount),
        description: `Fuel for ${buses.find(b => b.id === selectedBusId)?.plateNumber}: ${fuelForm.liters}L`
      });
      setFuelModalOpen(false);
      setFuelForm({ liters: '', amount: '' });
      alert("Fuel expense logged to Finance Ledger.");
    }
  };

  const toggleTrip = (bus: LiveBus) => {
    if (bus.status === 'ON_ROUTE') {
      updateBusStatus(bus.id, 'IDLE');
    } else {
      updateBusStatus(bus.id, 'ON_ROUTE');
    }
  };

  const openDriverModal = (id: string) => {
    setSelectedBusId(id);
    setDriverModalOpen(true);
  };

  const openFuelModal = (id: string) => {
    setSelectedBusId(id);
    setFuelModalOpen(true);
  };

  const columns: Column<LiveBus>[] = [
    { header: "Bus No", accessor: "plateNumber" },
    { header: "Route", accessor: "routeId" },
    {
      header: "Driver", accessor: (row: LiveBus) => (
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900">{row.driverName || 'Unassigned'}</Text>
          <Pressable onPress={() => openDriverModal(row.id)} className="p-1">
            <UserPlus className="w-3 h-3 text-gray-400" />
          </Pressable>
        </View>
      )
    },
    { header: "Live Speed", accessor: (row: LiveBus) => <Text className="font-mono text-gray-600">{row.speed} km/h</Text> },
    { header: "Status", accessor: (row: LiveBus) => <SovereignBadge status={row.status === 'ON_ROUTE' ? 'success' : 'neutral'}>{row.status.replace('_', ' ')}</SovereignBadge> }
  ];

  const actions = (row: LiveBus) => (
    <View className="flex-row gap-2">
      <Pressable
        onPress={() => toggleTrip(row)}
        className={`flex-row items-center gap-1 px-2 py-1 rounded border ${row.status === 'ON_ROUTE'
          ? 'bg-red-50 border-red-200'
          : 'bg-green-50 border-green-200'
          }`}
      >
        {row.status === 'ON_ROUTE' ? (
          <>
            <StopCircle className="w-3 h-3 text-red-600" />
            <Text className="text-xs font-bold text-red-600">End Trip</Text>
          </>
        ) : (
          <>
            <PlayCircle className="w-3 h-3 text-green-600" />
            <Text className="text-xs font-bold text-green-600">Start Trip</Text>
          </>
        )}
      </Pressable>
      <Pressable
        onPress={() => openFuelModal(row.id)}
        className="flex-row items-center justify-center bg-gray-100 px-2 py-1 rounded border border-gray-200"
      >
        <Fuel className="w-3 h-3 text-gray-600" />
      </Pressable>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        <PageHeader title="Fleet Management" subtitle="Live Tracking & Logistics" />

        <Row className="mb-8">
          <Col className="w-full md:w-1/3">
            <StatCard title="Total Fleet" value={buses.length} icon={<Bus className="w-5 h-5" />} />
          </Col>
          <Col className="w-full md:w-1/3">
            <StatCard title="Active Trips" value={activeBuses} icon={<MapPin className="w-5 h-5 text-green-600" />} trend={{ value: (activeBuses / buses.length) * 100, isPositive: true }} />
          </Col>
          <Col className="w-full md:w-1/3">
            <StatCard title="Maintenance" value={buses.filter(b => b.status === 'MAINTENANCE').length} icon={<Fuel className="w-5 h-5 text-orange-600" />} />
          </Col>
        </Row>

        <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <SovereignTable data={buses} columns={columns} actions={actions} />
        </View>

        {/* Driver Modal */}
        <ActionModal
          isOpen={driverModalOpen}
          onClose={() => setDriverModalOpen(false)}
          title="Assign Driver"
          onConfirm={handleAssignDriver}
          confirmLabel="Assign"
        >
          <View className="space-y-4">
            <SovereignInput label="Driver Name" value={driverForm} onChangeText={setDriverForm} placeholder="e.g. Rajesh Kumar" />
          </View>
        </ActionModal>

        {/* Fuel Modal */}
        <ActionModal
          isOpen={fuelModalOpen}
          onClose={() => setFuelModalOpen(false)}
          title="Log Fuel Entry"
          onConfirm={handleLogFuel}
          confirmLabel="Record Expense"
        >
          <View className="space-y-4">
            <View className="p-3 bg-gray-50 rounded border border-gray-100">
              <Text className="text-xs text-gray-500">
                This will automatically create a "MAINTENANCE" expense in the Finance Ledger.
              </Text>
            </View>
            <SovereignInput label="Liters Filled" keyboardType="numeric" value={fuelForm.liters} onChangeText={t => setFuelForm({ ...fuelForm, liters: t })} />
            <SovereignInput label="Total Cost (₹)" keyboardType="numeric" value={fuelForm.amount} onChangeText={t => setFuelForm({ ...fuelForm, amount: t })} />
          </View>
        </ActionModal>
      </View>
    </ScrollView>
  );
};