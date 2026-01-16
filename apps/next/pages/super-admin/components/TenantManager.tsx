import React, { useState, useEffect } from 'react';
import {
    Building2, Search, Settings, Key, Eye, EyeOff,
    AlertTriangle, Clock, Users, GraduationCap,
    CreditCard, Mail, MessageSquare, Smartphone, RefreshCw,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface School {
    id: string;
    name: string;
    slug: string;
    status: 'healthy' | 'warning' | 'critical';
    students: number;
    staff: number;
    lastSync: string;
    features: { transport: boolean; biometric: boolean; hostel: boolean; library: boolean };
    secrets: { razorpay: string; sendgrid: string; smsGateway: string; firebase: string };
}

const MOCK_SCHOOLS: School[] = [
    { id: 'sch_001', name: 'Greenwood High', slug: 'greenwood', status: 'healthy', students: 1245, staff: 87, lastSync: '2 min ago', features: { transport: true, biometric: true, hostel: false, library: true }, secrets: { razorpay: 'rzp_live_gw_abc123', sendgrid: 'SG.greenwood.xyz', smsGateway: 'sms_gw_001', firebase: 'AIza_gw_xxx' } },
    { id: 'sch_002', name: 'St. Xavier\'s Academy', slug: 'xavier', status: 'healthy', students: 2100, staff: 124, lastSync: '5 min ago', features: { transport: true, biometric: false, hostel: true, library: true }, secrets: { razorpay: 'rzp_live_sx_def456', sendgrid: 'SG.xavier.abc', smsGateway: 'sms_sx_002', firebase: 'AIza_sx_yyy' } },
    { id: 'sch_003', name: 'Delhi Public School', slug: 'dps-delhi', status: 'warning', students: 3200, staff: 210, lastSync: '15 min ago', features: { transport: true, biometric: true, hostel: true, library: true }, secrets: { razorpay: 'rzp_live_dps_ghi789', sendgrid: 'SG.dps.def', smsGateway: 'sms_dps_003', firebase: 'AIza_dps_zzz' } },
    { id: 'sch_004', name: 'Ryan International', slug: 'ryan', status: 'critical', students: 890, staff: 56, lastSync: '45 min ago', features: { transport: false, biometric: false, hostel: false, library: true }, secrets: { razorpay: 'rzp_live_ryan_jkl012', sendgrid: 'SG.ryan.ghi', smsGateway: 'sms_ryan_004', firebase: 'AIza_ryan_aaa' } },
];

const maskApiKey = (key: string): string => `${key.slice(0, 10)}****${key.slice(-4)}`;

const statusConfig = {
    healthy: { color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    warning: { color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
    critical: { color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECRET ROW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SecretRow: React.FC<{ name: string; value: string; icon: React.ReactNode; type: string; isDarkMode: boolean }> = ({ name, value, icon, type, isDarkMode }) => {
    const [revealed, setRevealed] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const cardBg = isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';
    const textPrimary = isDarkMode ? 'text-slate-200' : 'text-slate-800';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const codeBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300';

    const handleReveal = () => revealed ? setRevealed(false) : setShowConfirm(true);
    const confirmReveal = () => { setRevealed(true); setShowConfirm(false); setTimeout(() => setRevealed(false), 30000); };

    return (
        <>
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${cardBg}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>{icon}</div>
                    <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{name}</p>
                        <p className={`text-xs ${textSecondary}`}>{type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <code className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${codeBg} ${textPrimary}`}>
                        {revealed ? value : maskApiKey(value)}
                    </code>
                    <button onClick={handleReveal} className={`p-2 rounded-lg transition-colors ${revealed ? 'bg-amber-500/20 text-amber-500' : isDarkMode ? 'bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-500 hover:text-slate-700'}`}>
                        {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className={`relative w-full max-w-sm rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                            <h3 className={`text-lg font-semibold ${textPrimary}`}>Reveal Secret?</h3>
                        </div>
                        <p className={`text-sm mb-6 ${textSecondary}`}>This action will be logged for security audit.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className={`px-4 py-2 text-sm ${textSecondary}`}>Cancel</button>
                            <button onClick={confirmReveal} className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white">Reveal Key</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHOOL DETAILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SchoolDetails: React.FC<{ school: School; isDarkMode: boolean }> = ({ school, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'secrets'>('overview');
    const [features, setFeatures] = useState(school.features);

    const cardBg = isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const tabBg = isDarkMode ? 'bg-white/5' : 'bg-slate-100';
    const tabActive = isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm';
    const tabInactive = isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'config', label: 'Configuration', icon: Settings },
        { id: 'secrets', label: 'Secrets Vault', icon: Key },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-start justify-between p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${textPrimary}`}>{school.name}</h2>
                        <div className="flex items-center gap-2">
                            <p className={`text-sm font-mono ${textSecondary}`}>{school.slug}.sovereign.edu</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig[school.status].bg} ${statusConfig[school.status].text}`}>{school.status}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDarkMode ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-amber-600 text-amber-700 hover:bg-amber-50'}`} onClick={() => console.log('Impersonate', school.id)}>
                        Impersonate
                    </button>
                    <button className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDarkMode ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-red-600 text-red-700 hover:bg-red-50'}`} onClick={() => console.log('Suspend', school.id)}>
                        Suspend
                    </button>
                </div>
            </div>

            <div className={`flex gap-1 p-2 mx-4 mt-4 rounded-xl ${tabBg}`}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? tabActive : tabInactive}`}>
                        <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${cardBg}`}>
                            <div className={`flex items-center gap-2 mb-2 ${textSecondary}`}><GraduationCap className="w-4 h-4" /><span className="text-xs uppercase tracking-wider">Students</span></div>
                            <p className={`text-2xl font-bold font-mono ${textPrimary}`}>{school.students.toLocaleString()}</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${cardBg}`}>
                            <div className={`flex items-center gap-2 mb-2 ${textSecondary}`}><Users className="w-4 h-4" /><span className="text-xs uppercase tracking-wider">Staff</span></div>
                            <p className={`text-2xl font-bold font-mono ${textPrimary}`}>{school.staff}</p>
                        </div>
                        <div className={`col-span-2 p-4 rounded-xl border ${cardBg}`}>
                            <div className={`flex items-center gap-2 mb-2 ${textSecondary}`}><Clock className="w-4 h-4" /><span className="text-xs uppercase tracking-wider">Last Sync</span></div>
                            <p className={`text-lg font-medium ${textPrimary}`}>{school.lastSync}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-3">
                        <p className={`text-xs uppercase tracking-wider mb-4 ${textSecondary}`}>Feature Toggles</p>
                        {Object.entries(features).map(([key, enabled]) => (
                            <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${cardBg}`}>
                                <span className={`text-sm font-medium capitalize ${textPrimary}`}>{key}</span>
                                <button onClick={() => setFeatures(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'secrets' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <p className={`text-xs uppercase tracking-wider ${textSecondary}`}>API Keys for {school.name}</p>
                            <button className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400"><RefreshCw className="w-3.5 h-3.5" /> Rotate All</button>
                        </div>
                        <SecretRow isDarkMode={isDarkMode} name="Razorpay API Key" value={school.secrets.razorpay} icon={<CreditCard className="w-4 h-4 text-indigo-500" />} type="Payment Gateway" />
                        <SecretRow isDarkMode={isDarkMode} name="SendGrid API Key" value={school.secrets.sendgrid} icon={<Mail className="w-4 h-4 text-teal-500" />} type="Email Service" />
                        <SecretRow isDarkMode={isDarkMode} name="SMS Gateway Key" value={school.secrets.smsGateway} icon={<MessageSquare className="w-4 h-4 text-amber-500" />} type="SMS Provider" />
                        <SecretRow isDarkMode={isDarkMode} name="Firebase Admin" value={school.secrets.firebase} icon={<Smartphone className="w-4 h-4 text-orange-500" />} type="Push Notifications" />
                    </div>
                )}
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TENANT MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TenantManagerProps { isDarkMode: boolean; }

import { SkeletonTenantManager } from './Skeleton';

export const TenantManager: React.FC<TenantManagerProps> = ({ isDarkMode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Simulate API fetch delay (replace with real API call later)
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <SkeletonTenantManager />;

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
    const searchIconColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
    const itemBg = isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-50';
    const itemActive = isDarkMode ? 'bg-indigo-600/30 border-indigo-500/50' : 'bg-indigo-50 border-indigo-300';

    const filteredSchools = MOCK_SCHOOLS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.slug.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-180px)] gap-4 p-4">
            <div className={`w-80 flex-shrink-0 flex flex-col rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none ${searchIconColor}`} />
                        <input type="text" placeholder="Search schools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`} />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                    {filteredSchools.map(school => (
                        <button key={school.id} onClick={() => setSelectedSchool(school)} className={`w-full text-left p-3 rounded-xl transition-all border ${selectedSchool?.id === school.id ? itemActive : `border-transparent ${itemBg}`}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${textPrimary}`}>{school.name}</p>
                                    <p className={`text-xs font-mono ${textSecondary}`}>{school.slug}</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${statusConfig[school.status].color}`} />
                            </div>
                            <p className={`text-xs mt-1 ${textSecondary}`}>{school.students.toLocaleString()} students</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 rounded-2xl border overflow-hidden ${cardBg}`}>
                {selectedSchool ? (
                    <SchoolDetails school={selectedSchool} isDarkMode={isDarkMode} />
                ) : (
                    <div className={`h-full flex flex-col items-center justify-center ${textSecondary}`}>
                        <Building2 className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium">Select a School</p>
                        <p className="text-sm">Choose a tenant to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantManager;
