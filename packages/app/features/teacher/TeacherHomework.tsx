// packages/app/features/teacher/TeacherHomework.tsx
// Homework management with create, list, and copy features
// Supports offline creation via sync queue

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useSyncQueue } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

interface Homework {
    id: string;
    title: string;
    description: string;
    subjectName: string;
    className: string;
    dueDate: string;
    createdAt: string;
    submissionCount: number;
    totalStudents: number;
}

// ============================================================================
// HOMEWORK CARD
// ============================================================================

interface HomeworkCardProps {
    homework: Homework;
    onEdit: (id: string) => void;
    onCopy: (id: string) => void;
    onDelete: (id: string) => void;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({ homework, onEdit, onCopy, onDelete }) => {
    const { t } = useTranslation();
    const dueDate = new Date(homework.dueDate);
    const isPastDue = dueDate < new Date();
    const submissionRate = Math.round((homework.submissionCount / homework.totalStudents) * 100);

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white">
                        {homework.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {homework.subjectName} • {homework.className}
                    </p>
                </div>
                <div className={`
          px-2.5 py-1 rounded-full text-xs font-bold
          ${isPastDue
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    }
        `}>
                    {isPastDue ? 'Past Due' : `Due: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {homework.description}
            </p>

            {/* Submission Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Submissions</span>
                    <span>{homework.submissionCount}/{homework.totalStudents}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${submissionRate >= 80 ? 'bg-emerald-500' : submissionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${submissionRate}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(homework.id)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                    Edit
                </button>
                <button
                    onClick={() => onCopy(homework.id)}
                    className="flex-1 px-3 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                >
                    {t('copy_to_class')}
                </button>
                <button
                    onClick={() => onDelete(homework.id)}
                    className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// CREATE HOMEWORK FORM
// ============================================================================

interface CreateFormProps {
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        description: string;
        subjectId: string;
        classId: string;
        dueDate: string;
    }) => void;
}

const CreateHomeworkForm: React.FC<CreateFormProps> = ({ onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectId: '',
        classId: '',
        dueDate: '',
    });
    const [saving, setSaving] = useState(false);

    // Mock classes/subjects (in production, fetch from context/API)
    const classes = [
        { id: 'c1', name: 'Class 10-A' },
        { id: 'c2', name: 'Class 10-B' },
        { id: 'c3', name: 'Class 9-A' },
    ];
    const subjects = [
        { id: 's1', name: 'Mathematics' },
        { id: 's2', name: 'Science' },
        { id: 's3', name: 'English' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSubmit(formData);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            {t('create_homework')}
                        </h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Chapter 5 Exercises"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Instructions for students..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Class</label>
                                <select
                                    value={formData.classId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                                <select
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {saving ? 'Creating...' : t('create_homework')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeacherHomework: React.FC = () => {
    const { t } = useTranslation();
    const { status: syncStatus, queueOperation } = useSyncQueue();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAST'>('ALL');

    // Mock homework data (in production, fetch via useQuery)
    const [homeworks, setHomeworks] = useState<Homework[]>([
        {
            id: '1',
            title: 'Chapter 5 - Quadratic Equations',
            description: 'Complete exercises 5.1 to 5.4 from the textbook. Show all working.',
            subjectName: 'Mathematics',
            className: 'Class 10-A',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            submissionCount: 28,
            totalStudents: 35,
        },
        {
            id: '2',
            title: 'Essay: Environmental Conservation',
            description: 'Write a 500-word essay on environmental conservation in your local area.',
            subjectName: 'English',
            className: 'Class 10-A',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            submissionCount: 32,
            totalStudents: 35,
        },
    ]);

    const filteredHomeworks = homeworks.filter(h => {
        const isPast = new Date(h.dueDate) < new Date();
        if (filter === 'ACTIVE') return !isPast;
        if (filter === 'PAST') return isPast;
        return true;
    });

    const handleCreate = async (data: any) => {
        const newHomework: Homework = {
            id: `hw_${Date.now()}`,
            title: data.title,
            description: data.description,
            subjectName: 'Mathematics', // Would come from selected subject
            className: 'Class 10-A', // Would come from selected class
            dueDate: data.dueDate,
            createdAt: new Date().toISOString(),
            submissionCount: 0,
            totalStudents: 35,
        };

        setHomeworks(prev => [newHomework, ...prev]);

        // Queue for sync
        await queueOperation('HOMEWORK', data, `homework:create:${newHomework.id}`);
    };

    const handleCopy = (id: string) => {
        console.log('[Homework] Copy:', id);
        // Would open class selector modal
    };

    const handleEdit = (id: string) => {
        console.log('[Homework] Edit:', id);
    };

    const handleDelete = (id: string) => {
        setHomeworks(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('homework')}
                </h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('create_homework')}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['ALL', 'ACTIVE', 'PAST'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Active' : 'Past Due'}
                    </button>
                ))}
            </div>

            {/* Homework List */}
            {filteredHomeworks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p>No homework found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHomeworks.map(hw => (
                        <HomeworkCard
                            key={hw.id}
                            homework={hw}
                            onEdit={handleEdit}
                            onCopy={handleCopy}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Create Form Modal */}
            {showCreateForm && (
                <CreateHomeworkForm
                    onClose={() => setShowCreateForm(false)}
                    onSubmit={handleCreate}
                />
            )}
        </div>
    );
};

export default TeacherHomework;
