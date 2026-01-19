// packages/app/features/teacher/TeacherClassView.tsx
// View teacher's assigned classes with student rosters
// Includes quick actions and today's status

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useMyClassesToday, useStudentsForClass } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

interface ClassInfo {
    id: string;
    name: string;
    grade: string;
    section: string;
    studentCount: number;
    subjectName: string;
}

// ============================================================================
// CLASS CARD
// ============================================================================

interface ClassCardProps {
    cls: ClassInfo;
    onSelect: (classId: string) => void;
    isSelected: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, onSelect, isSelected }) => {
    return (
        <button
            onClick={() => onSelect(cls.id)}
            className={`
        w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
        ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }
      `}
        >
            <div className="flex items-center gap-4">
                <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
          ${isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
        `}>
                    {cls.grade}{cls.section}
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold ${isSelected ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-white'}`}>
                        {cls.name}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cls.subjectName}
                    </p>
                </div>
                <div className={`
          px-3 py-1 rounded-full text-xs font-bold
          ${isSelected
                        ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
        `}>
                    {cls.studentCount} students
                </div>
            </div>
        </button>
    );
};

// ============================================================================
// STUDENT ROSTER
// ============================================================================

interface StudentRosterProps {
    classId: string;
    className: string;
}

const StudentRoster: React.FC<StudentRosterProps> = ({ classId, className }) => {
    const { data: students = [], isLoading } = useStudentsForClass(classId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">{className} - Student Roster</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{students.length} students enrolled</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {students.map(student => (
                    <div key={student.id} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {student.rollNumber}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-slate-800 dark:text-white">{student.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Roll #{student.rollNumber}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeacherClassView: React.FC = () => {
    const { t } = useTranslation();
    const { data: classesToday = [], isLoading } = useMyClassesToday();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Convert to ClassInfo format
    const classes: ClassInfo[] = classesToday.map(c => ({
        id: c.id,
        name: c.className,
        grade: c.grade || '10',
        section: c.section || 'A',
        studentCount: 35, // Would come from API
        subjectName: c.subjectName,
    }));

    const selectedClass = classes.find(c => c.id === selectedClassId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('my_classes')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {classes.length} classes assigned
                </p>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Assigned Classes
                    </h3>
                    {classes.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No classes assigned</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {classes.map(cls => (
                                <ClassCard
                                    key={cls.id}
                                    cls={cls}
                                    onSelect={setSelectedClassId}
                                    isSelected={selectedClassId === cls.id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Student Roster Panel */}
                <div>
                    {selectedClass ? (
                        <StudentRoster classId={selectedClass.id} className={selectedClass.name} />
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center text-slate-400">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p>Select a class to view students</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherClassView;
