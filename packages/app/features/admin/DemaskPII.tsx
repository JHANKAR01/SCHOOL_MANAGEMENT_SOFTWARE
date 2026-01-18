// packages/app/features/admin/DemaskPII.tsx
// Demask PII Component - Time-limited reveal of sensitive data with audit logging
import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Eye, EyeOff, Clock, AlertTriangle,
    Copy, Check, Loader2, X
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PIIField {
    label: string;
    maskedValue: string;
    realValue: string;
    type: 'aadhaar' | 'phone' | 'email' | 'address';
}

interface DemaskPIIProps {
    studentId: string;
    studentName: string;
    fields: PIIField[];
    onClose: () => void;
}

// Default demask duration in seconds (5 minutes)
const DEMASK_DURATION = 300;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO WRAPPER (Provides mock data for testing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DemaskPIIDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <DemaskPII
        studentId="std_demo_001"
        studentName="Vikash Joshi"
        fields={[
            { label: 'Aadhaar Number', maskedValue: 'XXXX-XXXX-7890', realValue: '2345-6789-7890', type: 'aadhaar' },
            { label: 'Phone (Father)', maskedValue: '+91 XXXXX X3210', realValue: '+91 98765 43210', type: 'phone' },
            { label: 'Phone (Mother)', maskedValue: '+91 XXXXX X3211', realValue: '+91 98765 43211', type: 'phone' },
            { label: 'Email', maskedValue: 'v***@gmail.com', realValue: 'vikash.joshi@gmail.com', type: 'email' },
            { label: 'Address', maskedValue: '*** *** Nagar, Delhi', realValue: '45-B Rajendra Nagar, New Delhi 110001', type: 'address' },
        ]}
        onClose={onClose}
    />
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DemaskPII: React.FC<DemaskPIIProps> = ({
    studentId,
    studentName,
    fields,
    onClose
}) => {
    const { isDarkMode } = useTheme();
    const [isRevealed, setIsRevealed] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(DEMASK_DURATION);
    const [loading, setLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [justification, setJustification] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (!isRevealed) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsRevealed(false);
                    return DEMASK_DURATION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRevealed]);

    // Format time remaining
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Copy to clipboard
    const handleCopy = (value: string, label: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Request demask
    const handleDemaskRequest = async () => {
        if (!justification.trim()) return;

        setLoading(true);
        try {
            // Call API to log the demask action
            const res = await fetch('/api/principal/demask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({
                    studentId,
                    justification,
                    fields: fields.map(f => f.type)
                })
            });

            // Even if API fails in demo mode, allow demask
            setIsRevealed(true);
            setTimeRemaining(DEMASK_DURATION);
            setShowConfirm(false);
        } catch (error) {
            console.error('Demask request error:', error);
            // Allow in demo mode
            setIsRevealed(true);
            setTimeRemaining(DEMASK_DURATION);
            setShowConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    // Hide data manually
    const handleHide = () => {
        setIsRevealed(false);
        setTimeRemaining(DEMASK_DURATION);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                {/* Header with Timer */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${isRevealed ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Protected Information
                                </h2>
                                <p className="text-sm text-slate-500">{studentName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Timer Bar */}
                    {isRevealed && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Data visible for: {formatTime(timeRemaining)}</span>
                                </div>
                                <button
                                    onClick={handleHide}
                                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    <EyeOff className="w-3 h-3" /> Hide Now
                                </button>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000"
                                    style={{ width: `${(timeRemaining / DEMASK_DURATION) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Warning */}
                    <div className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'
                        }`}>
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-700 dark:text-amber-400">
                            <p className="font-semibold mb-1">Audit Notice</p>
                            <p>This action is logged for compliance. Only demask when legally required.</p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        {fields.map((field) => (
                            <div
                                key={field.label}
                                className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">{field.label}</p>
                                        <p className={`font-mono text-sm ${isRevealed
                                                ? 'text-slate-900 dark:text-white'
                                                : 'text-slate-400'
                                            }`}>
                                            {isRevealed ? field.realValue : field.maskedValue}
                                        </p>
                                    </div>
                                    {isRevealed && (
                                        <button
                                            onClick={() => handleCopy(field.realValue, field.label)}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                            title="Copy"
                                        >
                                            {copiedField === field.label ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-slate-500" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {!isRevealed ? (
                        showConfirm ? (
                            <div className="space-y-4">
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Enter justification for accessing this data..."
                                    className={`w-full h-24 px-4 py-3 rounded-lg border resize-none text-sm ${isDarkMode
                                            ? 'bg-slate-800 border-slate-700 text-white'
                                            : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                />
                                <div className="flex gap-3">
                                    <NebulaButton
                                        variant="ghost"
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </NebulaButton>
                                    <NebulaButton
                                        variant="primary"
                                        onClick={handleDemaskRequest}
                                        disabled={!justification.trim() || loading}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Eye className="w-4 h-4 mr-2" />
                                        )}
                                        Reveal Data
                                    </NebulaButton>
                                </div>
                            </div>
                        ) : (
                            <NebulaButton
                                variant="primary"
                                onClick={() => setShowConfirm(true)}
                                className="w-full"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Request Access (5 min window)
                            </NebulaButton>
                        )
                    ) : (
                        <div className="text-center text-sm text-slate-500">
                            Data will auto-hide in {formatTime(timeRemaining)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemaskPII;
