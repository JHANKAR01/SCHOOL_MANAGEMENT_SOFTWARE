// packages/app/features/teacher/TeacherCommunication.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useAnnouncements, useSendAnnouncement, useMyClassesToday } from '../../hooks/useTeacherData';

export const TeacherCommunication = () => {
    const { t } = useTranslation();
    const { data: announcements = [], isLoading } = useAnnouncements();
    const { data: classes = [] } = useMyClassesToday();
    const sendMutation = useSendAnnouncement();

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

    // Get unique classes for selection
    const uniqueClasses = Array.from(new Set(classes.map(c => c.classId)))
        .map(id => classes.find(c => c.classId === id))
        .filter(Boolean);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message || selectedClasses.length === 0) return;

        await sendMutation.mutateAsync({
            title,
            message,
            targetClassIds: selectedClasses
        });

        setShowForm(false);
        setTitle('');
        setMessage('');
        setSelectedClasses([]);
    };

    const toggleClass = (id: string) => {
        if (selectedClasses.includes(id)) {
            setSelectedClasses(prev => prev.filter(c => c !== id));
        } else {
            setSelectedClasses(prev => [...prev, id]);
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Announcements
                </h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Message
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p>No announcements sent yet.</p>
                    </div>
                ) : (
                    announcements.map((a: any) => (
                        <div key={a.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{a.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{a.message}</p>
                            <div className="mt-3 text-xs text-slate-400">
                                Sent on {new Date(a.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Announcement</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSend} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Select Classes</label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueClasses.map((c: any) => (
                                        <button
                                            key={c.classId}
                                            type="button"
                                            onClick={() => toggleClass(c.classId)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition
                                                ${selectedClasses.includes(c.classId)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                        >
                                            {c.className}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    placeholder="Important Notice..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                                    placeholder="Type your message here..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendMutation.isPending}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {sendMutation.isPending ? 'Sending...' : 'Send Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
