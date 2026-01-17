import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, ArrowRight, MoreHorizontal, User, Plus, LayoutList, Kanban, CheckCircle2, XCircle } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';
import { AddInquiryModal } from './AddInquiryModal';

interface Inquiry {
    id: number;
    school_id: string;
    parent_name: string;
    student_name?: string;
    phone: string;
    target_class?: string;
    status: 'NEW' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_DONE' | 'SELECTED' | 'CONVERTED' | 'REJECTED';
    created_at: string;
}

const ACTIVE_COLUMNS = [
    { id: 'NEW', title: 'New Leads', color: 'border-blue-500', bg: 'bg-blue-50' },
    { id: 'CONTACTED', title: 'Contacted', color: 'border-yellow-500', bg: 'bg-yellow-50' },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interview', color: 'border-purple-500', bg: 'bg-purple-50' },
    { id: 'SELECTED', title: 'Selected', color: 'border-green-500', bg: 'bg-green-50' },
];

export const InquiryBoard: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'pipeline' | 'history'>('pipeline');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/admissions', {
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setInquiries(data);
            }
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        // Optimistic update
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));

        try {
            await fetch(`/api/admissions/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            fetchInquiries(); // Revert on failure
        }
    };

    const handleConvert = async (id: number) => {
        if (!confirm('This will create a Student Profile. No login will be created. Continue?')) return;

        try {
            const res = await fetch(`/api/admissions/${id}/convert`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Success! Student created with Admission No: ${data.admission_no}. Go to System Admin to grant login access.`);
                fetchInquiries();
            } else {
                alert(`Error: ${data.message || 'Conversion failed'}`);
            }
        } catch (error) {
            console.error('Conversion error:', error);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading admission pipeline...</div>;

    const activeInquiries = inquiries.filter(i => !['CONVERTED', 'REJECTED'].includes(i.status));
    const historyInquiries = inquiries.filter(i => ['CONVERTED', 'REJECTED'].includes(i.status));

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admissions</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage student enrollment pipeline</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'pipeline' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                        >
                            <span className="flex items-center gap-2"><Kanban size={16} /> Pipeline</span>
                        </button>
                        <button
                            onClick={() => setViewMode('history')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'history' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                        >
                            <span className="flex items-center gap-2"><LayoutList size={16} /> History</span>
                        </button>
                    </div>

                    <NebulaButton variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Inquiry
                    </NebulaButton>
                </div>
            </div>

            {/* Pipeline View (Kanban) */}
            {viewMode === 'pipeline' && (
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-4 h-full min-w-full pb-2">
                        {ACTIVE_COLUMNS.map(column => {
                            const columnInquiries = activeInquiries.filter(i => i.status === column.id || (column.id === 'INTERVIEW_SCHEDULED' && i.status === 'INTERVIEW_DONE'));

                            return (
                                <div key={column.id} className="flex-1 min-w-[280px] flex flex-col h-full">
                                    {/* Column Header */}
                                    <div className={`flex items-center justify-between p-3 rounded-t-lg border-t-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm mb-2 ${column.color}`}>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200">{column.title}</h3>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full">
                                            {columnInquiries.length}
                                        </span>
                                    </div>

                                    {/* Column Body */}
                                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                        {columnInquiries.map(inquiry => (
                                            <NebulaCard key={inquiry.id} className="p-4 hover:shadow-md transition-shadow border-l-2 border-l-transparent hover:border-l-indigo-500">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                        Class {inquiry.target_class || '?'}
                                                    </span>
                                                    <div className="relative group/menu">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-500" />
                                                        {/* Quick Actions Dropdown */}
                                                        <div className="hidden group-hover/menu:block absolute right-0 top-4 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg z-20 overflow-hidden">
                                                            {ACTIVE_COLUMNS.map(c => (
                                                                c.id !== inquiry.status && (
                                                                    <button key={c.id} onClick={() => updateStatus(inquiry.id, c.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                        Move to {c.title}
                                                                    </button>
                                                                )
                                                            ))}
                                                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                                            <button onClick={() => updateStatus(inquiry.id, 'REJECTED')} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Reject</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{inquiry.student_name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <User size={12} /> {inquiry.parent_name}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone size={12} /> {inquiry.phone}
                                                    </div>

                                                    {column.id === 'SELECTED' && (
                                                        <button
                                                            onClick={() => handleConvert(inquiry.id)}
                                                            className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded"
                                                        >
                                                            Convert <ArrowRight size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </NebulaCard>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* History View (Table) */}
            {viewMode === 'history' && (
                <NebulaCard className="flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Class</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {historyInquiries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400">No history found.</td>
                                    </tr>
                                )}
                                {historyInquiries.map(i => (
                                    <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{i.student_name}</div>
                                            <div className="text-xs text-slate-500">{i.parent_name}</div>
                                        </td>
                                        <td className="p-4 text-sm">{i.target_class}</td>
                                        <td className="p-4 text-sm font-mono text-slate-500">{i.phone}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${i.status === 'CONVERTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {i.status === 'CONVERTED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-sm text-slate-500">
                                            {new Date(i.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </NebulaCard>
            )}

            {/* Add Inquiry Modal */}
            <AddInquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInquiries}
            />
        </div>
    );
};
