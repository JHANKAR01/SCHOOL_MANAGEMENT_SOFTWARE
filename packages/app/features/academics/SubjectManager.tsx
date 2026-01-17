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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Subject Management
                    </h2>
                    <p className="text-sm text-slate-500">Define subjects and assign them to classes</p>
                </div>
                <NebulaButton variant="primary" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                </NebulaButton>
            </div>

            {/* Add Subject Form */}
            {showForm && (
                <NebulaCard className="p-6 w-full max-w-lg mx-auto">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Create New Subject
                    </h3>
                    <div className="space-y-4">
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

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Assign to Class (Optional)
                            </label>
                            <select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="">No class (create subject only)</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_optional"
                                checked={formData.is_optional}
                                onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                                className="w-4 h-4 rounded accent-indigo-500"
                            />
                            <label htmlFor="is_optional" className="text-sm text-slate-600 dark:text-slate-400">
                                Mark as Optional subject
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <NebulaButton variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                                Cancel
                            </NebulaButton>
                            <NebulaButton variant="primary" onClick={handleCreate} disabled={submitting} className="flex-1">
                                {submitting ? 'Creating...' : 'Create Subject'}
                            </NebulaButton>
                        </div>
                    </div>
                </NebulaCard>
            )}

            {/* Subjects Table */}
            <NebulaCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Subject Name</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        No subjects defined yet.
                                    </td>
                                </tr>
                            )}
                            {subjects.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            {sub.code}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {sub.name}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${sub.is_optional
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {sub.is_optional ? 'Optional' : 'Core'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id, sub.name)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NebulaCard>
        </div>
    );
};
