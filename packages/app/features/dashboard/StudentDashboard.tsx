// packages/app/features/student/StudentDashboard.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { useStudentProfile } from '../../../hooks/useStudentData';
import { StudentMyDay } from '../student/StudentMyDay';
import { StudentTimetable } from '../student/StudentTimetable';
import { StudentHomework } from '../student/StudentHomework';
import { StudentAttendance } from '../student/StudentAttendance';
import { StudentResults } from '../student/StudentResults';
import { StudentLiveClasses } from '../student/StudentLiveClasses';
import { StudentNotifications } from '../student/StudentNotifications';
import { StudentProfile } from '../student/StudentProfile';

export const StudentDashboard = () => {
    const [currentModule, setCurrentModule] = useState<Module>('today');

    // Fetch basic student info for the shell header
    const { data: profile } = useStudentProfile();

    const getTitle = () => {
        switch (currentModule) {
            case 'today': return 'My Day';
            case 'timetable': return 'Weekly Timetable';
            case 'homework': return 'Homework & Assignments';
            case 'attendance': return 'Attendance & Leave';
            case 'results': return 'Results & Reports';
            case 'live-class': return 'Live Classes';
            case 'notifications': return 'Notifications';
            case 'profile': return 'My Profile';
            default: return 'Student Dashboard';
        }
    };

    const renderContent = () => {
        switch (currentModule) {
            case 'today':
                return <StudentMyDay />;
            case 'timetable':
                return <StudentTimetable />;
            case 'homework':
                return <StudentHomework />;
            case 'attendance':
                return <StudentAttendance />;
            case 'results':
                return <StudentResults />;
            case 'live-class':
                return <StudentLiveClasses />;
            case 'notifications':
                return <StudentNotifications />;
            case 'profile':
                return <StudentProfile />;
            default:
                return <StudentMyDay />;
        }
    };

    return (
        <DashboardShell
            role="STUDENT"
            title={getTitle()}
            activeModule={currentModule}
            onModuleChange={setCurrentModule}
            user={profile ? {
                name: profile.name,
                email: profile.admission_no,
                avatar: profile.photo_url || undefined
            } : undefined}
        >
            {renderContent()}
        </DashboardShell>
    );
};

export default StudentDashboard;
