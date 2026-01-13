
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useHostel } from '../../hooks/useHostel';
import { useHR } from '../../hooks/useHR';
import { SovereignButton, SovereignBadge, PageHeader } from '../../components/SovereignComponents';
import { ActionModal } from '../../components/ActionModal';
import { Row, Col } from '../../components/Layout';
import { Bed } from 'lucide-react';

export const HostelWarden = () => {
  // Use new Hostel hook for rooms data
  const { hostelRooms, allocateRoom } = useHostel();
  // Use new HR hook for students
  const { students } = useHR();

  const [view, setView] = useState<'ALLOCATION' | 'ATTENDANCE'>('ALLOCATION');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');

  const openAllocation = (roomId: string) => {
    setSelectedRoom(roomId);
    setModalOpen(true);
  };

  const handleAllocate = () => {
    if (selectedRoom && studentId) {
      allocateRoom(selectedRoom, studentId);
      setModalOpen(false);
      setStudentId('');
      setSelectedRoom(null);
    }
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || id;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="m-4 md:m-6 max-w-7xl mx-auto rounded-xl shadow-sm border border-gray-100 overflow-hidden bg-white">
        <View className="p-6 pb-0">
          <PageHeader title="Hostel Management" subtitle="Room Allocation & Rolls" />
        </View>

        <View className="flex-row border-b border-gray-200 px-6">
          <Pressable onPress={() => setView('ALLOCATION')} className={`px-4 py-3 border-b-2 mr-4 ${view === 'ALLOCATION' ? 'border-indigo-600' : 'border-transparent'}`}>
            <Text className={`text-sm font-bold ${view === 'ALLOCATION' ? 'text-indigo-600' : 'text-gray-500'}`}>Room Allocation</Text>
          </Pressable>
          <Pressable onPress={() => setView('ATTENDANCE')} className={`px-4 py-3 border-b-2 ${view === 'ATTENDANCE' ? 'border-indigo-600' : 'border-transparent'}`}>
            <Text className={`text-sm font-bold ${view === 'ATTENDANCE' ? 'text-indigo-600' : 'text-gray-500'}`}>Night Roll Call</Text>
          </Pressable>
        </View>

        <View className="p-6">
          {view === 'ALLOCATION' && (
            <Row>
              {hostelRooms.map((room) => (
                <Col key={room.roomNumber} className="w-full md:w-1/2 lg:w-1/4">
                  <View className="border border-gray-200 rounded-lg p-4 bg-white relative">
                    <View className="flex-row justify-between items-start mb-2">
                      <View>
                        <Text className="text-lg font-bold text-gray-800">Room {room.roomNumber}</Text>
                        <Text className="text-xs text-gray-500">{room.gender === 'BOYS' ? 'Boys Wing' : 'Girls Wing'}</Text>
                      </View>
                      <SovereignBadge status={room.occupied === room.capacity ? 'error' : 'success'}>
                        {room.occupied}/{room.capacity}
                      </SovereignBadge>
                    </View>

                    <View className="flex-row gap-1 mb-4">
                      {Array.from({ length: room.capacity }).map((_, i) => (
                        <View key={i} className={`h-1.5 flex-1 rounded-full ${i < room.occupied ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      ))}
                    </View>

                    <View className="mb-4 min-h-[40px]">
                      <Text className="text-[10px] uppercase font-bold text-gray-400 mb-1">Occupants</Text>
                      <View className="flex-row flex-wrap gap-1">
                        {room.students.map(s => (
                          <View key={s} className="bg-gray-100 px-1.5 py-0.5 rounded">
                            <Text className="text-xs text-gray-600">{getStudentName(s).split(' ')[0]}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <SovereignButton
                      onClick={() => openAllocation(room.roomNumber)}
                      disabled={room.occupied === room.capacity}
                      variant="secondary"
                      className="w-full py-2"
                    >
                      {room.occupied === room.capacity ? 'Full' : '+ Allocate Bed'}
                    </SovereignButton>
                  </View>
                </Col>
              ))}
            </Row>
          )}

          {view === 'ATTENDANCE' && (
            <View className="p-12 items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Bed className="w-8 h-8 text-gray-400 mb-2" />
              <Text className="text-gray-500 text-center">Attendance Module Linked to Biometric Entry.</Text>
              <Text className="text-xs text-gray-500 mt-1 text-center">Syncs automatically at 9:00 PM.</Text>
            </View>
          )}
        </View>

        {/* Allocation Modal - Replacing Select with List */}
        <ActionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Allocate Bed: Room ${selectedRoom}`}
          onConfirm={handleAllocate}
          confirmLabel="Assign Room"
        >
          <View className="space-y-4 max-h-96">
            <View>
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Select Student</Text>
              <ScrollView className="max-h-60 border border-gray-200 rounded-lg">
                {students.map(s => (
                  <Pressable
                    key={s.id}
                    onPress={() => setStudentId(s.id)}
                    className={`p-3 border-b border-gray-100 ${studentId === s.id ? 'bg-indigo-50' : 'bg-white'}`}
                  >
                    <Text className={`text-sm ${studentId === s.id ? 'text-indigo-700 font-bold' : 'text-gray-700'}`}>
                      {s.name} ({s.class})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </ActionModal>
      </View>
    </ScrollView>
  );
};
