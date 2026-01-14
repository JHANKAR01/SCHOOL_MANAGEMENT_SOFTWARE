import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    Building2,
    Database,
    UserCog,
    Sun,
    Moon,
    Menu,
    X,
    LogOut,
    Activity,
    DollarSign,
    AlertTriangle,
    Server,
    Rocket,
    Radio,
    Lock,
    Eye,
    EyeOff,
    Settings,
    Key,
    ToggleLeft,
    Search,
    ChevronRight,
    Users,
    GraduationCap,
    Phone,
    Mail,
    MapPin,
    Edit3,
    ExternalLink,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_METRICS = {
    totalRevenue: 4567890,
    activeTenants: 12,
    dbLoad: 34,
    criticalAlerts: 2,
};

const MOCK_SCHOOLS = [
    { id: 'sch_001', name: 'Greenwood High', slug: 'greenwood', status: 'healthy', students: 1245, staff: 87, lastSync: '2 min ago' },
    { id: 'sch_002', name: 'St. Xavier\'s Academy', slug: 'xavier', status: 'healthy', students: 2100, staff: 124, lastSync: '5 min ago' },
    { id: 'sch_003', name: 'Delhi Public School', slug: 'dps-delhi', status: 'warning', students: 3200, staff: 210, lastSync: '15 min ago' },
    { id: 'sch_004', name: 'Ryan International', slug: 'ryan', status: 'critical', students: 890, staff: 56, lastSync: '45 min ago' },
    { id: 'sch_005', name: 'Kendriya Vidyalaya', slug: 'kv-sec12', status: 'healthy', students: 1567, staff: 98, lastSync: '1 min ago' },
    { id: 'sch_006', name: 'Army Public School', slug: 'aps-pune', status: 'healthy', students: 780, staff: 45, lastSync: '3 min ago' },
];

const MOCK_SECRETS = [
    { id: 'key_001', name: 'Razorpay API Key', key: 'rzp_live_abc123xyz789', type: 'payment', lastRotated: '30 days ago' },
    { id: 'key_002', name: 'SendGrid API Key', key: 'SG.xyzabc123.456789', type: 'email', lastRotated: '15 days ago' },
    { id: 'key_003', name: 'SMS Gateway Key', key: 'sms_key_india_999888', type: 'sms', lastRotated: '7 days ago' },
    { id: 'key_004', name: 'Firebase Admin', key: 'AIzaSyD-xxxxxxxxxxxxx', type: 'push', lastRotated: '60 days ago' },
];

const MOCK_STUDENTS = [
    { id: 'stu_001', name: 'Aryan Sharma', class: '10-A', phone: '9876543210', aadhaar: '123456789012', feeStatus: 'Paid' },
    { id: 'stu_002', name: 'Priya Patel', class: '10-B', phone: '9876543211', aadhaar: '234567890123', feeStatus: 'Pending' },
    { id: 'stu_003', name: 'Rahul Singh', class: '9-A', phone: '9876543212', aadhaar: '345678901234', feeStatus: 'Paid' },
    { id: 'stu_004', name: 'Ananya Gupta', class: '11-Science', phone: '9876543213', aadhaar: '456789012345', feeStatus: 'Overdue' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Module = 'command' | 'tenants' | 'explorer' | 'ghost';

interface GhostMode {
    active: boolean;
    schoolId: string | null;
    schoolName: string | null;
    token: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

const maskValue = (value: string, showLast: number = 4): string => {
    if (value.length <= showLast) return value;
    return '•'.repeat(value.length - showLast) + value.slice(-showLast);
};

const maskPhone = (phone: string): string => `******${phone.slice(-4)}`;
const maskAadhaar = (aadhaar: string): string => `XXXX-XXXX-${aadhaar.slice(-4)}`;
const maskApiKey = (key: string): string => `${key.slice(0, 8)}****${key.slice(-4)}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAT CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    status?: 'default' | 'success' | 'warning' | 'critical';
    subValue?: string;
}> = ({ label, value, icon, status = 'default', subValue }) => {
    const statusColors = {
        default: 'text-slate-50',
        success: 'text-teal-400',
        warning: 'text-amber-400',
        critical: 'text-red-400',
    };

    return (
        <div className="relative p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/5 blur-2xl" />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">{icon}</div>
                </div>
                <div className={`text-3xl font-bold font-mono ${statusColors[status]}`}>{value}</div>
                {subValue && <span className="text-sm text-slate-500 mt-1">{subValue}</span>}
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST MODE BANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GhostModeBanner: React.FC<{
    schoolName: string;
    onExit: () => void;
}> = ({ schoolName, onExit }) => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">IMPERSONATING: {schoolName}</span>
        </div>
        <button
            onClick={onExit}
            className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-sm font-medium transition-colors"
        >
            Exit Ghost Mode
        </button>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIRM MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ConfirmModal: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
}> = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', variant = 'warning' }) => {
    if (!isOpen) return null;

    const btnClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-500'
        : 'bg-amber-600 hover:bg-amber-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${btnClass}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 0: COMMAND CENTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CommandCenter: React.FC = () => {
    const statusColors: Record<string, string> = {
        healthy: 'bg-emerald-500',
        warning: 'bg-amber-500',
        critical: 'bg-red-500',
        offline: 'bg-slate-500',
    };

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={formatCurrency(MOCK_METRICS.totalRevenue)}
                    icon={<DollarSign className="w-5 h-5 text-teal-400" />}
                    status="success"
                />
                <StatCard
                    label="Active Tenants"
                    value={MOCK_METRICS.activeTenants}
                    icon={<Building2 className="w-5 h-5 text-indigo-400" />}
                />
                <StatCard
                    label="Database Load"
                    value={`${MOCK_METRICS.dbLoad}%`}
                    icon={<Server className="w-5 h-5 text-slate-400" />}
                    status={MOCK_METRICS.dbLoad > 80 ? 'critical' : MOCK_METRICS.dbLoad > 60 ? 'warning' : 'default'}
                />
                <StatCard
                    label="Critical Alerts"
                    value={MOCK_METRICS.criticalAlerts}
                    icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                    status={MOCK_METRICS.criticalAlerts > 0 ? 'critical' : 'success'}
                />
            </div>

            {/* Health Matrix */}
            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Tenant Health Matrix</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {MOCK_SCHOOLS.map((school) => (
                        <div
                            key={school.id}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${statusColors[school.status]}`} />
                                <span className="text-xs text-slate-400 truncate">{school.slug}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-200 truncate">{school.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{school.students.toLocaleString()} students</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all">
                        <Rocket className="w-4 h-4" />
                        Deploy New School
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-sm font-medium hover:bg-white/15 transition-all">
                        <Radio className="w-4 h-4" />
                        Global Broadcast
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-600/30 transition-all">
                        <Lock className="w-4 h-4" />
                        System Lockdown
                    </button>
                </div>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 1: TENANT MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TenantManager: React.FC = () => {
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
    const [passwordModal, setPasswordModal] = useState<string | null>(null);

    const toggleReveal = (keyId: string) => {
        if (revealedKeys.has(keyId)) {
            setRevealedKeys((prev) => {
                const next = new Set(prev);
                next.delete(keyId);
                return next;
            });
        } else {
            setPasswordModal(keyId);
        }
    };

    const handlePasswordConfirm = () => {
        if (passwordModal) {
            setRevealedKeys((prev) => new Set(prev).add(passwordModal));
            // TODO: Log reveal event to audit
            console.log(`[AUDIT] Key ${passwordModal} revealed at ${new Date().toISOString()}`);
        }
        setPasswordModal(null);
    };

    return (
        <div className="space-y-6">
            {/* School List */}
            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Tenant Schools</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search schools..."
                            className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 uppercase tracking-wider text-xs">
                                <th className="pb-3 font-medium">School</th>
                                <th className="pb-3 font-medium">Slug</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Students</th>
                                <th className="pb-3 font-medium">Last Sync</th>
                                <th className="pb-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_SCHOOLS.map((school) => (
                                <tr key={school.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 text-slate-200 font-medium">{school.name}</td>
                                    <td className="py-3 text-slate-400 font-mono text-xs">{school.slug}</td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${school.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                school.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'healthy' ? 'bg-emerald-400' :
                                                    school.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                                }`} />
                                            {school.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-400 font-mono">{school.students.toLocaleString()}</td>
                                    <td className="py-3 text-slate-500">{school.lastSync}</td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => setSelectedSchool(school.id)}
                                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                                        >
                                            Configure
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {MOCK_SCHOOLS.map((school) => (
                        <div
                            key={school.id}
                            onClick={() => setSelectedSchool(school.id)}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 active:bg-white/10"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-slate-200 font-medium">{school.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{school.slug}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>{school.students.toLocaleString()} students</span>
                                <span className={`flex items-center gap-1 ${school.status === 'healthy' ? 'text-emerald-400' :
                                        school.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'healthy' ? 'bg-emerald-400' :
                                            school.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                        }`} />
                                    {school.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secrets Vault */}
            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Secrets Vault</h3>
                </div>

                <div className="space-y-3">
                    {MOCK_SECRETS.map((secret) => (
                        <div
                            key={secret.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-200">{secret.name}</p>
                                <p className="text-xs text-slate-500">Last rotated: {secret.lastRotated}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <code className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                                    {revealedKeys.has(secret.id) ? secret.key : maskApiKey(secret.key)}
                                </code>
                                <button
                                    onClick={() => toggleReveal(secret.id)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                                >
                                    {revealedKeys.has(secret.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Password Confirmation Modal */}
            <ConfirmModal
                isOpen={!!passwordModal}
                title="Reveal API Key"
                message="Enter your admin password to reveal this secret. This action will be logged for security audit."
                confirmLabel="Reveal Key"
                onConfirm={handlePasswordConfirm}
                onCancel={() => setPasswordModal(null)}
            />
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 2: DATA EXPLORER (View/Modify Engine)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DataExplorer: React.FC = () => {
    const [modifyMode, setModifyMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<typeof MOCK_STUDENTS[0] | null>(null);
    const [editedData, setEditedData] = useState<Record<string, string>>({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');

    const handleEdit = (field: string, value: string) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const getChanges = () => {
        if (!selectedStudent) return [];
        return Object.entries(editedData)
            .filter(([key, val]) => (selectedStudent as any)[key] !== val)
            .map(([key, val]) => ({
                field: key,
                oldValue: (selectedStudent as any)[key],
                newValue: val,
            }));
    };

    const handleSave = () => {
        const changes = getChanges();
        if (changes.length === 0) return;
        setShowConfirmModal(true);
    };

    const handleConfirmSave = () => {
        // TODO: Send to backend with override reason
        console.log('[AUDIT] Override committed:', {
            studentId: selectedStudent?.id,
            changes: getChanges(),
            reason: overrideReason,
            timestamp: new Date().toISOString(),
        });
        setShowConfirmModal(false);
        setEditedData({});
        setOverrideReason('');
        setModifyMode(false);
    };

    return (
        <div className="space-y-6">
            {/* Modify Mode Toggle */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${modifyMode
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-900/60 md:backdrop-blur-xl border-white/10'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {modifyMode ? (
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        ) : (
                            <Database className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                            <h3 className="text-sm font-medium text-slate-200">
                                {modifyMode ? 'Admin Override Mode Active' : 'Data Explorer'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {modifyMode ? 'All changes require confirmation and reason' : 'Read-only view with masked PII'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModifyMode(!modifyMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${modifyMode
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15'
                            }`}
                    >
                        <ToggleLeft className="w-4 h-4" />
                        {modifyMode ? 'Disable Overrides' : 'Enable Overrides'}
                    </button>
                </div>
            </div>

            {/* Student List / Detail View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className={`p-6 rounded-2xl border ${modifyMode ? 'bg-slate-900/80 border-amber-500/20' : 'bg-slate-900/60 md:backdrop-blur-xl border-white/10'}`}>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Students</h3>
                    <div className="space-y-2">
                        {MOCK_STUDENTS.map((student) => (
                            <button
                                key={student.id}
                                onClick={() => {
                                    setSelectedStudent(student);
                                    setEditedData({});
                                }}
                                className={`w-full text-left p-3 rounded-xl transition-colors ${selectedStudent?.id === student.id
                                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <p className="text-sm font-medium text-slate-200">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.class} • {modifyMode ? student.phone : maskPhone(student.phone)}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${modifyMode ? 'bg-slate-900/80 border-amber-500/20' : 'bg-slate-900/60 md:backdrop-blur-xl border-white/10'}`}>
                    {selectedStudent ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-50">{selectedStudent.name}</h3>
                                        <p className="text-sm text-slate-400">{selectedStudent.class}</p>
                                    </div>
                                </div>
                                {modifyMode && getChanges().length > 0 && (
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Phone
                                        {!modifyMode && <Lock className="w-3 h-3 opacity-50" />}
                                    </label>
                                    <input
                                        type="text"
                                        value={modifyMode ? (editedData.phone ?? selectedStudent.phone) : maskPhone(selectedStudent.phone)}
                                        onChange={(e) => handleEdit('phone', e.target.value)}
                                        disabled={!modifyMode}
                                        className={`w-full px-4 py-3 rounded-lg border text-sm font-mono transition-all ${modifyMode
                                                ? 'bg-white/8 border-amber-500/30 text-slate-50 focus:border-amber-500 focus:outline-none'
                                                : 'bg-white/5 border-white/10 text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        Aadhaar
                                        {!modifyMode && <Lock className="w-3 h-3 opacity-50" />}
                                    </label>
                                    <input
                                        type="text"
                                        value={modifyMode ? (editedData.aadhaar ?? selectedStudent.aadhaar) : maskAadhaar(selectedStudent.aadhaar)}
                                        onChange={(e) => handleEdit('aadhaar', e.target.value)}
                                        disabled={!modifyMode}
                                        className={`w-full px-4 py-3 rounded-lg border text-sm font-mono transition-all ${modifyMode
                                                ? 'bg-white/8 border-amber-500/30 text-slate-50 focus:border-amber-500 focus:outline-none'
                                                : 'bg-white/5 border-white/10 text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fee Status</label>
                                    <div className={`px-4 py-3 rounded-lg border text-sm ${selectedStudent.feeStatus === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                            selectedStudent.feeStatus === 'Pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                                'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}>
                                        {selectedStudent.feeStatus}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Student ID</label>
                                    <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-slate-400">
                                        {selectedStudent.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Users className="w-12 h-12 mb-4 opacity-50" />
                            <p>Select a student to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Override Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl">
                        <div className="flex items-center gap-3 p-4 border-b border-white/10">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-50">Confirm Admin Override</h3>
                                <p className="text-xs text-slate-400">Modifying student record</p>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                            {getChanges().map((change, idx) => (
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

                        <div className="p-4 border-t border-white/10">
                            <label className="block text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                                Reason for Override (Required)
                            </label>
                            <textarea
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="e.g., Principal requested data fix via email"
                                rows={3}
                                className="w-full rounded-lg border px-4 py-3 text-sm bg-white/5 border-white/10 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
                            <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                disabled={!overrideReason.trim() || overrideReason.length < 10}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE 3: GHOST MODE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GhostModeModule: React.FC<{
    ghostMode: GhostMode;
    onActivate: (schoolId: string, schoolName: string) => void;
}> = ({ ghostMode, onActivate }) => {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleActivate = () => {
        const school = MOCK_SCHOOLS.find((s) => s.id === selectedSchool);
        if (!school) return;
        onActivate(school.id, school.name);
        setShowConfirm(false);
    };

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <UserCog className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-50">Impersonation Mode</h3>
                        <p className="text-sm text-slate-400">Login as any school admin for support and debugging</p>
                    </div>
                </div>

                {ghostMode.active ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 font-medium">Currently impersonating: {ghostMode.schoolName}</p>
                        <p className="text-sm text-slate-400 mt-1">Use the banner at the top to exit.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select School</label>
                            <select
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-white/5 border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="" className="bg-slate-900">Choose a school...</option>
                                {MOCK_SCHOOLS.map((school) => (
                                    <option key={school.id} value={school.id} className="bg-slate-900">
                                        {school.name} ({school.slug})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={!selectedSchool}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Login as School Admin
                        </button>

                        <p className="text-xs text-slate-500 text-center">
                            This creates a temporary session token stored in sessionStorage.
                        </p>
                    </div>
                )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 md:backdrop-blur-xl border border-white/10">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Security Notes</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        All impersonation sessions are logged with timestamp and IP
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        Sessions auto-expire after 30 minutes of inactivity
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        Your Super Admin session remains active in the background
                    </li>
                </ul>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                title="Activate Ghost Mode"
                message={`You are about to impersonate the admin of "${MOCK_SCHOOLS.find(s => s.id === selectedSchool)?.name}". This action will be logged.`}
                confirmLabel="Activate"
                onConfirm={handleActivate}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SuperAdminDashboard() {
    const [activeModule, setActiveModule] = useState<Module>('command');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ghostMode, setGhostMode] = useState<GhostMode>({
        active: false,
        schoolId: null,
        schoolName: null,
        token: null,
    });

    // Persist theme
    useEffect(() => {
        const saved = localStorage.getItem('sovereign_theme');
        if (saved) setIsDarkMode(saved === 'dark');
    }, []);

    useEffect(() => {
        localStorage.setItem('sovereign_theme', isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handleActivateGhostMode = (schoolId: string, schoolName: string) => {
        const token = `ghost_${schoolId}_${Date.now()}`;
        sessionStorage.setItem('ghost_token', token);
        setGhostMode({ active: true, schoolId, schoolName, token });
    };

    const handleExitGhostMode = () => {
        sessionStorage.removeItem('ghost_token');
        setGhostMode({ active: false, schoolId: null, schoolName: null, token: null });
    };

    const navItems = [
        { id: 'command' as Module, label: 'Command Center', icon: LayoutDashboard },
        { id: 'tenants' as Module, label: 'Tenants', icon: Building2 },
        { id: 'explorer' as Module, label: 'Data Explorer', icon: Database },
        { id: 'ghost' as Module, label: 'Ghost Mode', icon: UserCog },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-sky-50'} transition-colors duration-300`}>
            {/* Ghost Mode Banner */}
            {ghostMode.active && ghostMode.schoolName && (
                <GhostModeBanner schoolName={ghostMode.schoolName} onExit={handleExitGhostMode} />
            )}

            {/* Background Gradient & Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100'}`} />
                <div className={`absolute top-20 left-20 w-96 h-96 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'} blur-3xl`} />
                <div className={`absolute bottom-40 right-20 w-80 h-80 rounded-full ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-500/5'} blur-3xl`} />
            </div>

            <div className={`relative flex ${ghostMode.active ? 'pt-10' : ''}`}>
                {/* Sidebar - Desktop */}
                <aside className={`
          hidden lg:flex flex-col w-64 min-h-screen p-4 border-r transition-colors duration-300
          ${isDarkMode ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-black/5'}
        `}>
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SOVEREIGN</span>
                            <span className="text-indigo-400 font-bold ml-1">CONTROL</span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeModule === item.id
                                        ? isDarkMode
                                            ? 'bg-white/10 text-white'
                                            : 'bg-indigo-100 text-indigo-700'
                                        : isDarkMode
                                            ? 'text-slate-400 hover:text-white hover:bg-white/5'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Theme Toggle & Logout */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                                }`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-red-400 hover:bg-red-500/10`}>
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile Header */}
                <div className={`
          lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b transition-colors duration-300
          ${ghostMode.active ? 'top-10' : 'top-0'}
          ${isDarkMode ? 'bg-slate-900/90 backdrop-blur-xl border-white/10' : 'bg-white/90 backdrop-blur-xl border-black/5'}
        `}>
                    <button onClick={() => setSidebarOpen(true)} className="p-2">
                        <Menu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                    </button>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        SOVEREIGN <span className="text-indigo-400">CONTROL</span>
                    </span>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">
                        {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-slate-900" />}
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                        <div className={`absolute left-0 top-0 bottom-0 w-72 p-4 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Menu</span>
                                <button onClick={() => setSidebarOpen(false)}>
                                    <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveModule(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                      ${activeModule === item.id
                                                ? isDarkMode ? 'bg-white/10 text-white' : 'bg-indigo-100 text-indigo-700'
                                                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                            }
                    `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className={`flex-1 p-4 lg:p-8 ${ghostMode.active ? 'lg:pt-8' : ''} lg:mt-0 mt-16`}>
                    <div className="max-w-7xl mx-auto">
                        {activeModule === 'command' && <CommandCenter />}
                        {activeModule === 'tenants' && <TenantManager />}
                        {activeModule === 'explorer' && <DataExplorer />}
                        {activeModule === 'ghost' && (
                            <GhostModeModule ghostMode={ghostMode} onActivate={handleActivateGhostMode} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
