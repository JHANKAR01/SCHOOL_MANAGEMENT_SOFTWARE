import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Link2 } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

interface Subject {
    id: string;
    name: string;
    code: string;
    is_optional?: boolean;
    class_count?: number;
}

interface ClassItem {
    id: string;
    name: string;
}

export const SubjectManager: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', class_id: '', is_optional: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subjectsRes, classesRes] = await Promise.all([
                fetch('/api/academics/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
                }),
                fetch('/api/academics/classes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
                })
            ]);

            const subjectsData = await subjectsRes.json();
            const classesData = await classesRes.json();

            if (subjectsData.success) setSubjects(subjectsData.subjects);
            if (classesData.success) setClasses(classesData.classes);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.code) {
            alert('Name and Code are required');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/academics/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                fetchData();
                setShowForm(false);
                setFormData({ name: '', code: '', class_id: '', is_optional: false });
            } else {
                alert(data.error || 'Failed to create subject');
            }
        } catch (error) {
            console.error('Create error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete subject "${name}"? This will remove it from all classes.`)) return;

        try {
            const res = await fetch(`/api/academics/subjects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });

            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Loading subjects...</div>;
    }

    return (
        <div className="space-y-6">
            <NebulaCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm rounded-xl overflow-hidden p-0">
                {/* Header Section */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Subject Management
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Manage academic subjects and class assignments</p>
                    </div>
                    <NebulaButton size="sm" variant="primary" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Subject
                    </NebulaButton>
                </div>

                {/* Add Subject Form Area - Styled to fit in */}
                {showForm && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">New Subject Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NebulaInput
                                    label="Subject Name"
                                    value={formData.name}
                                    onChange={(val) => setFormData({ ...formData, name: val })}
                                    placeholder="e.g. Mathematics"
                                />
                                <NebulaInput
                                    label="Subject Code"
                                    value={formData.code}
                                    onChange={(val) => setFormData({ ...formData, code: val.toUpperCase() })}
                                    placeholder="e.g. MATH"
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Assign to Class (Optional)
                                    </label>
                                    <select
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="">No class (create subject only)</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pb-3">
                                    <input
                                        type="checkbox"
                                        id="is_optional"
                                        checked={formData.is_optional}
                                        onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                                        className="w-5 h-5 rounded accent-indigo-500"
                                    />
                                    <label htmlFor="is_optional" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Mark as Optional Subject
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <NebulaButton variant="secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </NebulaButton>
                                <NebulaButton variant="primary" onClick={handleCreate} disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Subject'}
                                </NebulaButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {subjects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-slate-900 dark:text-white font-medium">No subjects found</h3>
                                        <p className="text-slate-500 text-sm mt-1">Get started by creating a new subject.</p>
                                    </td>
                                </tr>
                            ) : (
                                subjects.map(sub => (
                                    <tr key={sub.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {sub.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {sub.name}
                                            </span>
                                            {sub.class_count ? (
                                                <span className="ml-2 text-xs text-slate-400">
                                                    ({sub.class_count} classes)
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${sub.is_optional
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                }`}>
                                                {sub.is_optional ? 'Optional' : 'Core'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(sub.id, sub.name)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </NebulaCard>
        </div>
    );
};
