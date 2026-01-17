import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Edit2, X } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

interface FeeStructure {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    category: string;
    class_id: string | null;
    class_name: string;
    academic_year: string;
}

interface ClassItem {
    id: string;
    name: string;
}

const FREQUENCIES = [
    { value: 'ONE_TIME', label: 'One-Time' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'ANNUAL', label: 'Annual' }
];

const CATEGORIES = [
    { value: 'TUITION', label: 'Tuition Fee' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'HOSTEL', label: 'Hostel' },
    { value: 'ADMISSION', label: 'Admission Fee' },
    { value: 'LAB', label: 'Lab Fee' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'MISC', label: 'Miscellaneous' }
];

export const FeeStructureManager: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        frequency: 'QUARTERLY',
        category: 'TUITION',
        class_id: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [structuresRes, classesRes] = await Promise.all([
                fetch('/api/finance/structures', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
                }),
                fetch('/api/academics/classes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
                })
            ]);

            const structuresData = await structuresRes.json();
            const classesData = await classesRes.json();

            if (structuresData.success) setStructures(structuresData.structures);
            if (classesData.success) setClasses(classesData.classes);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.amount || !formData.category) {
            alert('Name, Amount, and Category are required');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/finance/structures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    class_id: formData.class_id || null
                })
            });

            const data = await res.json();
            if (res.ok) {
                fetchData();
                setShowForm(false);
                setFormData({ name: '', amount: '', frequency: 'QUARTERLY', category: 'TUITION', class_id: '' });
            } else {
                alert(data.error || 'Failed to create fee structure');
            }
        } catch (error) {
            console.error('Create error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete fee structure "${name}"?`)) return;

        try {
            const res = await fetch(`/api/finance/structures/${id}`, {
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Loading fee structures...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Fee Structure Setup
                    </h2>
                    <p className="text-sm text-slate-500">Define fee heads and amounts for each class</p>
                </div>
                <NebulaButton variant="primary" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Fee Head
                </NebulaButton>
            </div>

            {/* Add Fee Form */}
            {showForm && (
                <NebulaCard className="p-6 w-full max-w-xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Create Fee Structure
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <NebulaInput
                                label="Fee Name"
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                placeholder="e.g. Tuition Fee Q1"
                            />
                        </div>

                        <NebulaInput
                            label="Amount (₹)"
                            value={formData.amount}
                            onChange={(val) => setFormData({ ...formData, amount: val.replace(/[^0-9]/g, '') })}
                            placeholder="e.g. 15000"
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Frequency
                            </label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {FREQUENCIES.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                                Apply to Class
                            </label>
                            <select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <NebulaButton variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                            Cancel
                        </NebulaButton>
                        <NebulaButton variant="primary" onClick={handleCreate} disabled={submitting} className="flex-1">
                            {submitting ? 'Creating...' : 'Create Fee Structure'}
                        </NebulaButton>
                    </div>
                </NebulaCard>
            )}

            {/* Fee Structures List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {structures.length === 0 && !showForm && (
                    <NebulaCard className="col-span-full p-8 text-center">
                        <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No fee structures defined yet.</p>
                        <p className="text-sm text-slate-400">Click "Add Fee Head" to get started.</p>
                    </NebulaCard>
                )}

                {structures.map(fs => (
                    <div key={fs.id} className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${fs.category === 'TUITION' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                                    fs.category === 'TRANSPORT' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' :
                                        fs.category === 'ADMISSION' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                    {fs.category}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(fs.id, fs.name)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">
                            {fs.name}
                        </h4>

                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 tracking-tight">
                            {formatCurrency(fs.amount)}
                        </div>

                        <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Frequency</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {FREQUENCIES.find(f => f.value === fs.frequency)?.label || fs.frequency}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Applies To</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{fs.class_name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
