import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, BookOpen, GraduationCap } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

interface ClassItem {
    id: string;
    grade: string;
    section: string;
    name: string;
    academic_year: string;
    is_current: boolean;
    student_count: number;
    subject_count: number;
}

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const GRADES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const ClassManager: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ grade: '', section: 'A' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/academics/classes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setClasses(data.classes);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.grade || !formData.section) {
            alert('Please select Grade and Section');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/academics/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                fetchClasses();
                setShowForm(false);
                setFormData({ grade: '', section: 'A' });
            } else {
                alert(data.error || 'Failed to create class');
            }
        } catch (error) {
            console.error('Create error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete class ${name}? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/academics/classes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });

            const data = await res.json();
            if (res.ok) {
                fetchClasses();
            } else {
                alert(data.error || 'Failed to delete class');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Loading classes...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Class Management
                    </h2>
                    <p className="text-sm text-slate-500">Define your school's class structure</p>
                </div>
                <NebulaButton variant="primary" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Class
                </NebulaButton>
            </div>

            {/* Add Class Form */}
            {showForm && (
                <NebulaCard className="p-6 w-full max-w-md mx-auto">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Create New Class
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Grade
                            </label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="">Select Grade</option>
                                {GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Section
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {SECTIONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFormData({ ...formData, section: s })}
                                        className={`px-4 py-2 rounded-lg font-bold transition-all ${formData.section === s
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <NebulaButton variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                                Cancel
                            </NebulaButton>
                            <NebulaButton variant="primary" onClick={handleCreate} disabled={submitting} className="flex-1">
                                {submitting ? 'Creating...' : 'Create Class'}
                            </NebulaButton>
                        </div>
                    </div>
                </NebulaCard>
            )}

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {classes.length === 0 && !showForm && (
                    <NebulaCard className="col-span-full p-8 text-center">
                        <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No classes defined yet.</p>
                        <p className="text-sm text-slate-400">Click "Add Class" to get started.</p>
                    </NebulaCard>
                )}

                {classes.map(cls => (
                    <NebulaCard key={cls.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${cls.is_current ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {cls.grade}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Class {cls.name}
                                    </h4>
                                    <p className="text-xs text-slate-500">{cls.academic_year}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cls.id, cls.name)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                disabled={cls.student_count > 0}
                                title={cls.student_count > 0 ? 'Cannot delete class with students' : 'Delete class'}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Users className="w-4 h-4" />
                                <span>{cls.student_count} students</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <BookOpen className="w-4 h-4" />
                                <span>{cls.subject_count} subjects</span>
                            </div>
                        </div>
                    </NebulaCard>
                ))}
            </div>
        </div>
    );
};
