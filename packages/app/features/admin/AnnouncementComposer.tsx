// packages/app/features/admin/AnnouncementComposer.tsx
// Announcement Composer - Create and send school-wide announcements
import React, { useState } from 'react';
import {
    Send, FileText, AlertTriangle, Calendar, Heart, Users,
    ChevronDown, X, Loader2, Check
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type AnnouncementType = 'GENERAL' | 'EMERGENCY' | 'EXAM' | 'HOLIDAY' | 'HEALTH';
type TargetAudience = 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'STAFF';

interface Template {
    id: string;
    name: string;
    type: AnnouncementType;
    subject: string;
    body: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMPLATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TEMPLATES: Template[] = [
    {
        id: 'emergency_closure',
        name: 'Emergency School Closure',
        type: 'EMERGENCY',
        subject: 'Urgent: School Closure Notice',
        body: `Dear Parents/Guardians,

Due to [REASON], the school will remain closed on [DATE]. 

All scheduled classes and activities stand cancelled. Students should not come to school.

Regular classes will resume from [RESUME DATE]. Updates will be shared if there are any changes.

Stay safe.

Regards,
[PRINCIPAL NAME]
Principal`
    },
    {
        id: 'exam_schedule',
        name: 'Exam Schedule',
        type: 'EXAM',
        subject: 'Examination Schedule - [TERM]',
        body: `Dear Students and Parents,

The [TERM] examinations are scheduled from [START DATE] to [END DATE].

Please find the detailed timetable attached. Students are requested to:
• Report 30 minutes before the exam
• Bring all necessary stationery
• Carry their ID cards

Best of luck to all students!

Regards,
Examination Cell`
    },
    {
        id: 'holiday_notice',
        name: 'Holiday Notice',
        type: 'HOLIDAY',
        subject: 'Holiday Notification - [OCCASION]',
        body: `Dear All,

On account of [OCCASION], the school will remain closed on [DATE].

Regular classes will resume on [RESUME DATE].

Wishing everyone a happy [OCCASION]!

Regards,
Administration`
    },
    {
        id: 'health_advisory',
        name: 'Health Advisory',
        type: 'HEALTH',
        subject: 'Health Advisory - [TOPIC]',
        body: `Dear Parents,

This is to inform you about [HEALTH CONCERN] in the surrounding areas.

Precautions to take:
• [PRECAUTION 1]
• [PRECAUTION 2]
• [PRECAUTION 3]

If your child shows any symptoms, please keep them at home and consult a doctor.

The school infirmary is taking all necessary precautions.

Stay healthy!

Regards,
School Health Office`
    }
];

const TYPE_CONFIG: Record<AnnouncementType, { icon: typeof FileText; color: string; label: string }> = {
    GENERAL: { icon: FileText, color: 'bg-slate-500', label: 'General' },
    EMERGENCY: { icon: AlertTriangle, color: 'bg-red-500', label: 'Emergency' },
    EXAM: { icon: Calendar, color: 'bg-indigo-500', label: 'Exam' },
    HOLIDAY: { icon: Calendar, color: 'bg-green-500', label: 'Holiday' },
    HEALTH: { icon: Heart, color: 'bg-pink-500', label: 'Health' }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AnnouncementComposer: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { isDarkMode } = useTheme();
    const [type, setType] = useState<AnnouncementType>('GENERAL');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState<TargetAudience[]>(['ALL']);
    const [showTemplates, setShowTemplates] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Apply template
    const applyTemplate = (template: Template) => {
        setType(template.type);
        setSubject(template.subject);
        setBody(template.body);
        setShowTemplates(false);
    };

    // Toggle audience
    const toggleAudience = (target: TargetAudience) => {
        if (target === 'ALL') {
            setAudience(['ALL']);
        } else {
            const newAudience = audience.includes(target)
                ? audience.filter(a => a !== target && a !== 'ALL')
                : [...audience.filter(a => a !== 'ALL'), target];
            setAudience(newAudience.length ? newAudience : ['ALL']);
        }
    };

    // Send announcement
    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) return;

        setSending(true);
        try {
            // TODO: Real API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSent(true);
            setTimeout(() => {
                onClose?.();
            }, 1500);
        } catch (error) {
            console.error('Send error:', error);
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <NebulaCard>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Announcement Sent!
                    </h3>
                    <p className="text-slate-500 text-center">
                        Your announcement has been sent to {audience.includes('ALL') ? 'everyone' : audience.join(', ').toLowerCase()}.
                    </p>
                </div>
            </NebulaCard>
        );
    }

    return (
        <NebulaCard>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Compose Announcement
                </h2>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}
            </div>

            {/* Templates Button */}
            <div className="mb-4">
                <NebulaButton
                    variant="ghost"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full justify-between"
                >
                    <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Use Template
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </NebulaButton>

                {showTemplates && (
                    <div className={`mt-2 p-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        {TEMPLATES.map(template => {
                            const config = TYPE_CONFIG[template.type];
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => applyTemplate(template)}
                                    className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3"
                                >
                                    <div className={`p-2 rounded ${config.color}`}>
                                        <config.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{template.name}</p>
                                        <p className="text-xs text-slate-500">{config.label}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Type Selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(TYPE_CONFIG) as AnnouncementType[]).map(t => {
                        const config = TYPE_CONFIG[t];
                        const isSelected = type === t;
                        return (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                                    ? `${config.color} text-white`
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <config.icon className="w-4 h-4" />
                                {config.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Audience Selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" /> Target Audience
                </label>
                <div className="flex flex-wrap gap-2">
                    {(['ALL', 'STUDENTS', 'PARENTS', 'TEACHERS', 'STAFF'] as TargetAudience[]).map(a => {
                        const isSelected = audience.includes(a);
                        return (
                            <button
                                key={a}
                                onClick={() => toggleAudience(a)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                {a === 'ALL' ? 'Everyone' : a.charAt(0) + a.slice(1).toLowerCase()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
                <NebulaInput
                    label="Subject"
                    placeholder="Enter announcement subject..."
                    value={subject}
                    onChange={(value: string) => setSubject(value)}
                />
            </div>

            {/* Body */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your announcement here..."
                    rows={8}
                    className={`w-full px-4 py-3 rounded-lg border resize-none ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        }`}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onClose && (
                    <NebulaButton variant="ghost" onClick={onClose}>
                        Cancel
                    </NebulaButton>
                )}
                <NebulaButton
                    variant="primary"
                    onClick={handleSend}
                    disabled={!subject.trim() || !body.trim() || sending}
                >
                    {sending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 mr-2" />
                    )}
                    {sending ? 'Sending...' : 'Send Announcement'}
                </NebulaButton>
            </div>
        </NebulaCard>
    );
};

export default AnnouncementComposer;
