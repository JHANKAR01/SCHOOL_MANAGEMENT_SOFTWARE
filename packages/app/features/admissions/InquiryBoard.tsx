import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, ArrowRight, MoreHorizontal, User } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

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

const COLUMNS = [
    { id: 'NEW', title: 'New Leads', color: 'bg-blue-500' },
    { id: 'CONTACTED', title: 'Contacted', color: 'bg-yellow-500' },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interview', color: 'bg-purple-500' },
    { id: 'SELECTED', title: 'Selected', color: 'bg-green-500' },
    { id: 'CONVERTED', title: 'Converted', color: 'bg-slate-500' },
];

export const InquiryBoard: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/admissions', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
                    Authorization: `Bearer ${localStorage.getItem('token')}`
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
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

    if (loading) return <div className="p-10 text-center">Loading pipeline...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admissions Pipeline</h2>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Manage inquiries and convert to student profiles.</p>
                </div>
                <NebulaButton onClick={fetchInquiries}>Refresh Board</NebulaButton>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max h-full">
                    {COLUMNS.map(column => {
                        const columnInquiries = inquiries.filter(i => i.status === column.id);

                        return (
                            <div key={column.id} className="w-80 flex flex-col">
                                {/* Column Header */}
                                <div className={`p-3 rounded-t-xl border-b-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} ${column.color.replace('bg-', 'border-')}`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{column.title}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold">
                                            {columnInquiries.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className={`flex-1 p-2 space-y-3 overflow-y-auto rounded-b-xl border border-t-0 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    {columnInquiries.map(inquiry => (
                                        <NebulaCard key={inquiry.id} className="p-3 group hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                    {inquiry.target_class ? `Class ${inquiry.target_class}` : 'N/A'}
                                                </span>

                                                {/* Status Change Dropdown (Simple implementation) */}
                                                <div className="relative group/menu">
                                                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    <div className="hidden group-hover/menu:block absolute right-0 top-6 w-32 bg-white dark:bg-slate-800 border shadow-xl rounded-lg z-10 overflow-hidden">
                                                        {COLUMNS.map(c => (
                                                            c.id !== inquiry.status && (
                                                                <button
                                                                    key={c.id}
                                                                    onClick={() => updateStatus(inquiry.id, c.id)}
                                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                                                                >
                                                                    Move to {c.title}
                                                                </button>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {inquiry.student_name || 'Prospect Student'}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                <User className="w-3 h-3" />
                                                {inquiry.parent_name}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                                <Phone className="w-3 h-3" />
                                                {inquiry.phone}
                                            </div>

                                            {/* Convert Action - Only in SELECTED */}
                                            {column.id === 'SELECTED' && (
                                                <NebulaButton
                                                    variant="primary"
                                                    size="sm"
                                                    className="w-full justify-center"
                                                    onClick={() => handleConvert(inquiry.id)}
                                                >
                                                    Convert <ArrowRight className="w-3 h-3 ml-1" />
                                                </NebulaButton>
                                            )}
                                        </NebulaCard>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
