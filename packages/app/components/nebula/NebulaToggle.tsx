import React from 'react';
import { AlertTriangle, Shield, ShieldAlert } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA TOGGLE - View/Modify Mode Toggle (Core Safety Feature)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaModifyToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    disabled?: boolean;
}

export const NebulaModifyToggle: React.FC<NebulaModifyToggleProps> = ({
    enabled,
    onToggle,
    disabled = false,
}) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onToggle(!enabled)}
            disabled={disabled}
            className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${enabled
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                }
      `}
        >
            {enabled ? (
                <ShieldAlert className="w-5 h-5" />
            ) : (
                <Shield className="w-5 h-5" />
            )}

            <span className="text-sm font-medium">
                {enabled ? 'Admin Overrides Active' : 'Enable Admin Overrides'}
            </span>

            {/* Toggle Switch */}
            <div className={`
        relative w-10 h-5 rounded-full transition-colors duration-300
        ${enabled ? 'bg-amber-500' : 'bg-slate-600'}
      `}>
                <div className={`
          absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md
          transition-transform duration-300
          ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
        `} />
            </div>
        </button>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA SWITCH - Simple Boolean Toggle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    description?: string;
}

export const NebulaSwitch: React.FC<NebulaSwitchProps> = ({
    label,
    checked,
    onChange,
    disabled = false,
    description,
}) => {
    return (
        <div className={`
      flex items-center justify-between p-3 rounded-lg
      bg-white/5 border border-white/10
      ${disabled ? 'opacity-50' : 'hover:bg-white/8'}
      transition-colors duration-200
    `}>
            <div className="flex-1">
                <span className="text-sm font-medium text-slate-200">{label}</span>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>

            <button
                type="button"
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`
          relative w-11 h-6 rounded-full transition-colors duration-300
          focus:outline-none focus:ring-2 focus:ring-indigo-500/40
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-indigo-600' : 'bg-slate-600'}
        `}
            >
                <div className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md
          transition-transform duration-300
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
        `} />
            </button>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIRM OVERRIDE MODAL - Required for Modify Mode saves
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConfirmOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    changes: { field: string; oldValue: string; newValue: string }[];
    entityName?: string;
}

export const ConfirmOverrideModal: React.FC<ConfirmOverrideModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    changes,
    entityName = 'Record',
}) => {
    const [reason, setReason] = React.useState('');
    const [error, setError] = React.useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Override reason is required for audit compliance');
            return;
        }
        if (reason.trim().length < 10) {
            setError('Please provide a more detailed reason (min 10 characters)');
            return;
        }
        onConfirm(reason);
        setReason('');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-50">Confirm Admin Override</h3>
                        <p className="text-xs text-slate-400">Modifying {entityName}</p>
                    </div>
                </div>

                {/* Changes Diff */}
                <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                    {changes.map((change, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">{change.field}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-red-400 line-through font-mono">{change.oldValue}</span>
                                <span className="text-slate-500">→</span>
                                <span className="text-sm text-emerald-400 font-mono">{change.newValue}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reason Input (Mandatory) */}
                <div className="p-4 border-t border-white/10">
                    <label className="block text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                        Reason for Override (Required)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g., Principal requested grade fix via email on 14-Jan-2026"
                        rows={3}
                        className={`
              w-full rounded-lg border px-4 py-3 text-sm
              bg-white/5 text-slate-50 placeholder:text-slate-500
              focus:outline-none focus:ring-1
              ${error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/10 focus:border-amber-500 focus:ring-amber-500/20'
                            }
            `}
                    />
                    {error && (
                        <p className="text-xs text-red-400 mt-1">{error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    >
                        Confirm Override
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NebulaModifyToggle;
