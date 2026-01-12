
import React from 'react';
import { useAttendance } from '../packages/app/features/attendance/useAttendance';
import { useGeofencing } from '../hooks/useGeofencing';
import { SchoolConfig } from '../types';
import { useTranslation } from '../packages/app/provider/language-context';
import { useLowDataMode } from '../packages/app/hooks/useLowDataMode';
import { DUMMY_STUDENTS } from '../packages/api/src/data/dummy-data';

interface Props {
  school: SchoolConfig;
}

export const AttendanceModule: React.FC<Props> = ({ school }) => {
  const { markAttendance, isOffline } = useAttendance(school.school_id);
  const { isLowData } = useLowDataMode();
  const { isWithinFence, distance, isMockLocation, loading: geoLoading } = useGeofencing(school.location);
  const { t } = useTranslation();

  const [marked, setMarked] = React.useState<Record<string, string>>({});

  // Filtering for a mock class "10-A" - using new dummy data export
  const students = DUMMY_STUDENTS.filter(s => s.id.includes('std_') && parseInt(s.id.split('_')[1]) <= 40);

  const handleMark = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    // Geofencing Block
    if (!isWithinFence && !isLowData) {
      alert("Action Blocked: You must be inside the school campus to mark attendance.");
      return;
    }

    markAttendance({ studentId, status, date: new Date().toISOString() });
    setMarked(prev => ({ ...prev, [studentId]: status }));
  };

  return (
    <div className="p-4">
      {/* Geofence Status Bar */}
      {!isLowData && (
        <div className={`mb-4 p-3 rounded-lg flex justify-between items-center text-sm ${isWithinFence ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{isWithinFence ? '📍' : '⚠️'}</span>
            <span className="font-bold">
              {geoLoading ? "Triangulating Position..." :
                isWithinFence ? "Location Verified: Attendance Unlocked" : `Outside Campus (${Math.round(distance || 0)}m)`}
            </span>
          </div>
          {isMockLocation && <span className="font-bold text-red-600 animate-pulse">GPS SPOOF DETECTED</span>}
        </div>
      )}

      {/* Grid List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student, index) => (
          <div key={student.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-gray-800">{student.name}</p>
                <p className="text-xs text-gray-500">Reg: {student.id}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleMark(student.id, 'PRESENT')}
                disabled={!isWithinFence && !isLowData}
                className={`p-2 rounded-md font-bold text-xs transition-colors w-12 border ${marked[student.id] === 'PRESENT'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                P
              </button>
              <button
                onClick={() => handleMark(student.id, 'ABSENT')}
                disabled={!isWithinFence && !isLowData}
                className={`p-2 rounded-md font-bold text-xs transition-colors w-12 border ${marked[student.id] === 'ABSENT'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                A
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isOffline || isLowData) && (
        <div className="mt-4 text-xs text-center text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
          {isLowData ? '📶 Low Data Mode: GPS check skipped.' : '🔴 Offline Mode Active.'}
        </div>
      )}
    </div>
  );
};
