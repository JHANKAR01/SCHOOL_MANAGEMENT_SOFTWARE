// packages/app/features/academics/LessonPlanOversight.tsx
// Phase 4B: Curriculum Feed & Pacing Tracker
import React, { useState, useMemo } from 'react';
import {
    BookOpen, Clock, AlertTriangle, CheckCircle, TrendingUp,
    ChevronRight, ArrowLeft, MessageSquare, Send, X, Filter,
    Calendar, Users
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PacingStatus = 'on-track' | 'slightly-behind' | 'behind' | 'critical';

interface TodayLesson {
    id: string;
    className: string;
    section: string;
    subject: string;
    teacher: string;
    topic: string;
    period: number;
    pacingStatus: PacingStatus;
    completionPct: number;
    expectedPct: number;
    weeksBehind?: number;
}

interface Subject {
    id: string;
    name: string;
    avgCompletion: number;
    expectedCompletion: number;
    behindClasses: number;
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TODAY_LESSONS: TodayLesson[] = [
    { id: 'ls_001', className: 'Class 10', section: 'A', subject: 'Mathematics', teacher: 'Mrs. Sharma', topic: 'Trigonometry: Sin & Cos Functions', period: 1, pacingStatus: 'on-track', completionPct: 72, expectedPct: 70 },
    { id: 'ls_002', className: 'Class 10', section: 'B', subject: 'Physics', teacher: 'Mr. Patel', topic: 'Laws of Motion - Revision', period: 2, pacingStatus: 'slightly-behind', completionPct: 58, expectedPct: 70, weeksBehind: 1 },
    { id: 'ls_003', className: 'Class 9', section: 'A', subject: 'Chemistry', teacher: 'Ms. Iyer', topic: 'Acids & Bases Introduction', period: 2, pacingStatus: 'on-track', completionPct: 68, expectedPct: 70 },
    { id: 'ls_004', className: 'Class 9', section: 'B', subject: 'Mathematics', teacher: 'Mr. Kumar', topic: 'Quadratic Equations', period: 3, pacingStatus: 'behind', completionPct: 45, expectedPct: 70, weeksBehind: 2 },
    { id: 'ls_005', className: 'Class 8', section: 'A', subject: 'English', teacher: 'Ms. Gupta', topic: 'Poetry Analysis: The Road Not Taken', period: 3, pacingStatus: 'critical', completionPct: 32, expectedPct: 70, weeksBehind: 4 },
    { id: 'ls_006', className: 'Class 8', section: 'B', subject: 'Science', teacher: 'Mr. Reddy', topic: 'Cell Structure & Functions', period: 4, pacingStatus: 'on-track', completionPct: 75, expectedPct: 70 },
    { id: 'ls_007', className: 'Class 7', section: 'A', subject: 'Hindi', teacher: 'Mrs. Singh', topic: 'Vyakaran: Sandhi', period: 4, pacingStatus: 'slightly-behind', completionPct: 62, expectedPct: 70, weeksBehind: 1 },
    { id: 'ls_008', className: 'Class 7', section: 'B', subject: 'Social Studies', teacher: 'Mr. Nair', topic: 'Medieval India - Mughal Empire', period: 5, pacingStatus: 'on-track', completionPct: 78, expectedPct: 70 },
];

const SUBJECTS: Subject[] = [
    { id: 'sub_001', name: 'Mathematics', avgCompletion: 65, expectedCompletion: 70, behindClasses: 2 },
    { id: 'sub_002', name: 'Physics', avgCompletion: 58, expectedCompletion: 70, behindClasses: 3 },
    { id: 'sub_003', name: 'Chemistry', avgCompletion: 68, expectedCompletion: 70, behindClasses: 1 },
    { id: 'sub_004', name: 'English', avgCompletion: 52, expectedCompletion: 70, behindClasses: 4 },
    { id: 'sub_005', name: 'Hindi', avgCompletion: 62, expectedCompletion: 70, behindClasses: 2 },
    { id: 'sub_006', name: 'Science', avgCompletion: 72, expectedCompletion: 70, behindClasses: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NUDGE MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NudgeModalProps {
    lesson: TodayLesson;
    onSend: (message: string) => void;
    onClose: () => void;
}

const NudgeModal: React.FC<NudgeModalProps> = ({ lesson, onSend, onClose }) => {
    const { isDarkMode } = useTheme();
    const [message, setMessage] = useState('');
    const [quickMessage, setQuickMessage] = useState<string | null>(null);

    const quickMessages = [
        "Please prioritize catching up on the syllabus this week.",
        "Kindly submit an action plan to cover the pending topics.",
        "Can we discuss the syllabus progress tomorrow?",
        "Please allocate extra time for revision classes.",
    ];

    const handleSend = () => {
        const finalMessage = quickMessage || message;
        if (finalMessage.trim()) {
            onSend(finalMessage);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-lg mx-4 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Nudge Teacher
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Teacher Info */}
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{lesson.teacher}</p>
                                <p className="text-sm text-slate-500">{lesson.subject} • {lesson.className}-{lesson.section}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500">Current Status:</p>
                            <p className={`font-medium ${lesson.pacingStatus === 'critical' ? 'text-red-600' :
                                    lesson.pacingStatus === 'behind' ? 'text-amber-600' : 'text-blue-600'
                                }`}>
                                {lesson.weeksBehind ? `${lesson.weeksBehind} week(s) behind schedule` : 'Slightly behind'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Messages */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Quick Messages
                        </label>
                        <div className="space-y-2">
                            {quickMessages.map((msg, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setQuickMessage(msg); setMessage(''); }}
                                    className={`w-full p-3 rounded-lg text-left text-sm transition-all ${quickMessage === msg
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-400'
                                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {msg}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Or Write Custom Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => { setMessage(e.target.value); setQuickMessage(null); }}
                            placeholder="Type your message..."
                            rows={3}
                            className={`w-full px-4 py-3 rounded-lg border resize-none ${isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <NebulaButton variant="secondary" className="flex-1" onClick={onClose}>
                        Cancel
                    </NebulaButton>
                    <NebulaButton
                        variant="primary"
                        className="flex-1"
                        onClick={handleSend}
                        disabled={!message.trim() && !quickMessage}
                    >
                        <Send className="w-4 h-4 mr-2" /> Send Nudge
                    </NebulaButton>
                </div>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PACING INDICATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PacingIndicatorProps {
    status: PacingStatus;
    size?: 'sm' | 'md';
}

const PacingIndicator: React.FC<PacingIndicatorProps> = ({ status, size = 'md' }) => {
    const config = {
        'on-track': { color: 'bg-emerald-500', icon: '🟢', label: 'On Track' },
        'slightly-behind': { color: 'bg-blue-500', icon: '🟡', label: 'Slightly Behind' },
        'behind': { color: 'bg-amber-500', icon: '🟠', label: 'Behind' },
        'critical': { color: 'bg-red-500', icon: '🔴', label: 'Critical' },
    };

    const { icon, label } = config[status];
    const sizing = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <span className={`inline-flex items-center gap-1 ${sizing}`}>
            <span>{icon}</span>
            <span className="font-medium">{label}</span>
        </span>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LessonPlanOversight: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // State
    const [filter, setFilter] = useState<'all' | PacingStatus>('all');
    const [selectedLesson, setSelectedLesson] = useState<TodayLesson | null>(null);
    const [showNudge, setShowNudge] = useState(false);

    // Filter lessons
    const filteredLessons = useMemo(() => {
        if (filter === 'all') return TODAY_LESSONS;
        return TODAY_LESSONS.filter(l => l.pacingStatus === filter);
    }, [filter]);

    // Summary stats
    const stats = useMemo(() => ({
        total: TODAY_LESSONS.length,
        onTrack: TODAY_LESSONS.filter(l => l.pacingStatus === 'on-track').length,
        behind: TODAY_LESSONS.filter(l => ['slightly-behind', 'behind'].includes(l.pacingStatus)).length,
        critical: TODAY_LESSONS.filter(l => l.pacingStatus === 'critical').length,
        avgCompletion: Math.round(TODAY_LESSONS.reduce((sum, l) => sum + l.completionPct, 0) / TODAY_LESSONS.length),
        targetCompletion: 70,
    }), []);

    // Handle nudge
    const handleNudge = (lesson: TodayLesson) => {
        setSelectedLesson(lesson);
        setShowNudge(true);
    };

    const handleSendNudge = (message: string) => {
        // TODO: Send notification via API
        console.log('Sending nudge to', selectedLesson?.teacher, ':', message);
        setShowNudge(false);
        setSelectedLesson(null);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Curriculum Oversight</h1>
                        <p className="text-sm text-slate-500">Today's lessons • Pacing tracker • Nudge system</p>
                    </div>
                </div>
            </div>

            {/* School Progress Bar */}
            <NebulaCard className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">School-Wide Syllabus Progress</h3>
                    <span className={`font-bold ${stats.avgCompletion >= stats.targetCompletion ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                        {stats.avgCompletion}% / {stats.targetCompletion}% target
                    </span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${stats.avgCompletion}%` }}
                    />
                    <div
                        className="absolute top-0 h-full w-0.5 bg-slate-800 dark:bg-white"
                        style={{ left: `${stats.targetCompletion}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {stats.onTrack} on-track • {stats.behind} behind • {stats.critical} critical
                </p>
            </NebulaCard>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-400" />
                {(['all', 'on-track', 'slightly-behind', 'behind', 'critical'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        {f === 'all' ? 'All' : f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        {f !== 'all' && (
                            <span className="ml-1 opacity-70">
                                ({TODAY_LESSONS.filter(l => l.pacingStatus === f).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Today's Lessons Feed */}
            <div className="flex-1 space-y-3 overflow-y-auto">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Today's Lessons ({filteredLessons.length})
                </h3>

                {filteredLessons.map(lesson => (
                    <NebulaCard
                        key={lesson.id}
                        className={`p-4 border-l-4 ${lesson.pacingStatus === 'on-track' ? 'border-l-emerald-500' :
                                lesson.pacingStatus === 'slightly-behind' ? 'border-l-blue-500' :
                                    lesson.pacingStatus === 'behind' ? 'border-l-amber-500' :
                                        'border-l-red-500'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${lesson.pacingStatus === 'on-track' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                                    lesson.pacingStatus === 'slightly-behind' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                        lesson.pacingStatus === 'behind' ? 'bg-amber-100 dark:bg-amber-900/20' :
                                            'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                <BookOpen className={`w-5 h-5 ${lesson.pacingStatus === 'on-track' ? 'text-emerald-600' :
                                        lesson.pacingStatus === 'slightly-behind' ? 'text-blue-600' :
                                            lesson.pacingStatus === 'behind' ? 'text-amber-600' :
                                                'text-red-600'
                                    }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {lesson.className}-{lesson.section}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-600 dark:text-slate-400">{lesson.subject}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                                        Period {lesson.period}
                                    </span>
                                </div>
                                <p className="text-slate-900 dark:text-white font-medium">{lesson.topic}</p>
                                <p className="text-sm text-slate-500">{lesson.teacher}</p>

                                <div className="mt-2 flex items-center gap-4">
                                    <PacingIndicator status={lesson.pacingStatus} size="sm" />
                                    {lesson.weeksBehind && (
                                        <span className={`text-xs font-medium ${lesson.pacingStatus === 'critical' ? 'text-red-600' : 'text-amber-600'
                                            }`}>
                                            ⚠️ {lesson.weeksBehind} week{lesson.weeksBehind > 1 ? 's' : ''} behind
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress + Nudge */}
                            <div className="text-right">
                                <p className={`text-lg font-bold ${lesson.completionPct >= lesson.expectedPct ? 'text-emerald-600' :
                                        lesson.pacingStatus === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                    {lesson.completionPct}%
                                </p>
                                <p className="text-xs text-slate-500">of syllabus</p>

                                {lesson.pacingStatus !== 'on-track' && (
                                    <NebulaButton
                                        variant="secondary"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => handleNudge(lesson)}
                                    >
                                        <MessageSquare className="w-3 h-3 mr-1" /> Nudge
                                    </NebulaButton>
                                )}
                            </div>
                        </div>
                    </NebulaCard>
                ))}
            </div>

            {/* Subject Summary */}
            <NebulaCard>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Subject-wise Progress</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {SUBJECTS.map(subject => (
                        <div key={subject.id} className={`p-3 rounded-lg ${subject.avgCompletion >= subject.expectedCompletion
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800'
                            }`}>
                            <p className="font-medium text-slate-900 dark:text-white">{subject.name}</p>
                            <p className={`text-lg font-bold ${subject.avgCompletion >= subject.expectedCompletion ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                {subject.avgCompletion}%
                            </p>
                            {subject.behindClasses > 0 && (
                                <p className="text-xs text-amber-600">{subject.behindClasses} classes behind</p>
                            )}
                        </div>
                    ))}
                </div>
            </NebulaCard>

            {/* Nudge Modal */}
            {showNudge && selectedLesson && (
                <NudgeModal
                    lesson={selectedLesson}
                    onSend={handleSendNudge}
                    onClose={() => { setShowNudge(false); setSelectedLesson(null); }}
                />
            )}
        </div>
    );
};

export default LessonPlanOversight;
