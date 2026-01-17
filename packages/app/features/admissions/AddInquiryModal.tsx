import React, { useState } from 'react';
import { X } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

interface AddInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddInquiryModal: React.FC<AddInquiryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        parent_name: '',
        phone: '',
        target_class: '',
        previous_school: '',
    });

    const handleSubmit = async () => {
        if (!formData.student_name || !formData.phone || !formData.parent_name) {
            alert('Student Name, Parent Name, and Phone are required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    status: 'NEW',
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ student_name: '', parent_name: '', phone: '', target_class: '', previous_school: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create inquiry');
            }
        } catch (error) {
            console.error('Failed to create inquiry:', error);
            alert('Failed to create inquiry');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <NebulaCard className="relative w-full max-w-md p-6 animate-in zoom-in-95">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        New Admission Inquiry
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <NebulaInput
                        label="Student Name"
                        value={formData.student_name}
                        onChange={(val) => setFormData({ ...formData, student_name: val })}
                        placeholder="e.g. Rahul Kumar"
                    />
                    <NebulaInput
                        label="Parent/Guardian Name"
                        value={formData.parent_name}
                        onChange={(val) => setFormData({ ...formData, parent_name: val })}
                        placeholder="e.g. Mr. Suresh Kumar"
                    />
                    <NebulaInput
                        label="Mobile Number"
                        value={formData.phone}
                        onChange={(val) => setFormData({ ...formData, phone: val })}
                        placeholder="e.g. 9876543210"
                    />
                    <NebulaInput
                        label="Target Class"
                        value={formData.target_class}
                        onChange={(val) => setFormData({ ...formData, target_class: val })}
                        placeholder="e.g. 10"
                    />
                    <NebulaInput
                        label="Previous School"
                        value={formData.previous_school}
                        onChange={(val) => setFormData({ ...formData, previous_school: val })}
                        placeholder="e.g. St. Mary's"
                    />
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end gap-3">
                    <NebulaButton variant="secondary" onClick={onClose}>
                        Cancel
                    </NebulaButton>
                    <NebulaButton variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Inquiry'}
                    </NebulaButton>
                </div>
            </NebulaCard>
        </div>
    );
};
