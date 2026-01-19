// packages/app/features/teacher/TeacherHomework.tsx
// Homework management with create, list, and copy features
// Supports offline creation via sync queue

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useHomework, useCreateHomework, useUpdateHomework, useCopyHomework, useDeleteHomework, useMyClassesToday, TeacherClass } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

interface Homework {
    id: string;
    title: string;
    description: string;
    subjectId: string;
    subjectName: string;
    classId: string;
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
    availableClasses: TeacherClass[];
    initialData?: Homework;
}

const CreateHomeworkForm: React.FC<CreateFormProps> = ({ onClose, onSubmit, availableClasses, initialData }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        subjectId: initialData?.subjectId || '',
        classId: initialData?.classId || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    });
    const [saving, setSaving] = useState(false);

    // Filter unique class-subject combinations from the schedule
    // Use a Map to deduplicate (same class+subject might appear in multiple periods)
    const classOptions = React.useMemo(() => {
        const unique = new Map();
        availableClasses.forEach(c => {
            // Use classId (not timetable id) to deduplicate multiple periods
            const key = `${c.classId}-${c.subjectId}`;
            if (!unique.has(key)) {
                unique.set(key, c);
            }
        });
        return Array.from(unique.values());
    }, [availableClasses]);

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
                            {initialData ? 'Edit Homework' : t('create_homework')}
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

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Class & Subject</label>
                            <select
                                value={`${formData.classId}|${formData.subjectId}`}
                                onChange={(e) => {
                                    const [cId, sId] = e.target.value.split('|');
                                    setFormData(prev => ({ ...prev, classId: cId, subjectId: sId }));
                                }}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="|">Select Class & Subject...</option>
                                {classOptions.map(c => (
                                    <option key={`${c.classId}-${c.subjectId}`} value={`${c.classId}|${c.subjectId}`}>
                                        {c.className} - {c.subjectName}
                                    </option>
                                ))}
                            </select>
                            {classOptions.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    No classes found for today.
                                </p>
                            )}
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
                            {saving ? 'Saving...' : (initialData ? 'Update' : t('create_homework'))}
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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
    const [copyModalId, setCopyModalId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAST'>('ALL');

    // API Hooks
    const { data: classesToday = [] } = useMyClassesToday();
    const filterStatus = filter === 'ALL' ? undefined : filter;
    const { data: homeworks = [], isLoading } = useHomework(undefined, filterStatus);
    const createMutation = useCreateHomework();
    const updateMutation = useUpdateHomework();
    const copyMutation = useCopyHomework();
    const deleteMutation = useDeleteHomework();

    const handleCreate = async (data: any) => {
        if (editingHomework) {
            await updateMutation.mutateAsync({
                id: editingHomework.id,
                ...data
            });
        } else {
            await createMutation.mutateAsync({
                title: data.title,
                description: data.description,
                subjectId: data.subjectId,
                classId: data.classId,
                dueDate: data.dueDate,
            });
        }
        setEditingHomework(null);
    };

    const handleCopy = (id: string) => {
        setCopyModalId(id);
    };

    const handleCopyConfirm = async (targetClassId: string) => {
        if (copyModalId) {
            await copyMutation.mutateAsync({ homeworkId: copyModalId, targetClassId });
            setCopyModalId(null);
        }
    };

    const handleEdit = (id: string) => {
        const homeworkToEdit = homeworks.find(h => h.id === id);
        if (homeworkToEdit) {
            setEditingHomework(homeworkToEdit);
            setShowCreateForm(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this homework?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

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
            {homeworks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p>No homework found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {homeworks.map((hw: Homework) => (
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
                    onClose={() => {
                        setShowCreateForm(false);
                        setEditingHomework(null);
                    }}
                    onSubmit={handleCreate}
                    availableClasses={classesToday}
                    initialData={editingHomework || undefined}
                />
            )}

            {/* Copy Class Selector Modal */}
            {copyModalId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Copy to Class</h3>
                        <div className="space-y-2">
                            {classesToday.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleCopyConfirm(cls.id)}
                                    className="w-full p-3 text-left rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                >
                                    {cls.className} - {cls.subjectName}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCopyModalId(null)}
                            className="w-full mt-4 p-2 text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherHomework;
