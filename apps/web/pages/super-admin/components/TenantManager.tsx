import React, { useState, useEffect } from 'react';
import {
    Building2, Search, Settings, Key, Eye, EyeOff,
    AlertTriangle, Clock, Users, GraduationCap,
    CreditCard, Mail, MessageSquare, Smartphone, RefreshCw,
} from 'lucide-react';
import { getSuperAdminData, superAdminApi } from '../../../../../packages/app/api/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface School {
    id: string;
    name: string;
    status: string; // "ACTIVE" | "INACTIVE" etc.
    plan: string;
    region: string;
    studentCount: number;
    // Features are now dynamic from settings_json but we need to fetch/store them.
    // For now, the API listing /tenants doesn't return full feature list, 
    // we might need to assume defaults or fetch details.
    // However, the toggle API updates them. We'll manage locally for now.
    features?: { [key: string]: boolean };
}

const statusConfig: Record<string, { color: string; text: string; bg: string }> = {
    ACTIVE: { color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    INACTIVE: { color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' },
    SUSPENDED: { color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
    // Fallback
    default: { color: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/10' }
};

const getStatusStyle = (status: string) => statusConfig[status] || statusConfig.default;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHOOL DETAILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SchoolDetails: React.FC<{ school: School; isDarkMode: boolean }> = ({ school, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'secrets'>('overview');
    // Initialize features (mock defaults if not provided by list API yet)
    // In a real app, we'd fetch specific school details on selection
    const [features, setFeatures] = useState(school.features || { transport: true, biometric: false, hostel: false, library: true });

    const cardBg = isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const tabBg = isDarkMode ? 'bg-white/5' : 'bg-slate-100';
    const tabActive = isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm';
    const tabInactive = isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'config', label: 'Configuration', icon: Settings },
        // { id: 'secrets', label: 'Secrets Vault', icon: Key }, // Hidden until API supports it
    ];

    const handleToggle = async (key: string) => {
        // Optimistic update
        const newValue = !features[key];
        setFeatures(prev => ({ ...prev, [key]: newValue }));

        try {
            await superAdminApi.toggleFeature(school.id, key, newValue);
        } catch (error) {
            console.error('Failed to toggle feature', error);
            // Revert on failure
            setFeatures(prev => ({ ...prev, [key]: !newValue }));
            alert('Failed to update setting. Please try again.');
        }
    };

    const style = getStatusStyle(school.status);

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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>{school.status}</span>
                            <span className={`text-xs ${textSecondary} px-2 py-0.5 rounded border border-current`}>{school.plan}</span>
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
                            <p className={`text-2xl font-bold font-mono ${textPrimary}`}>{school.studentCount.toLocaleString()}</p>
                        </div>
                        {/* Placeholder for Staff count (not in API yet) */}
                        <div className={`p-4 rounded-xl border ${cardBg}`}>
                            <div className={`flex items-center gap-2 mb-2 ${textSecondary}`}><Users className="w-4 h-4" /><span className="text-xs uppercase tracking-wider">Region</span></div>
                            <p className={`text-2xl font-bold font-mono ${textPrimary}`}>{school.region}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-3">
                        <p className={`text-xs uppercase tracking-wider mb-4 ${textSecondary}`}>Feature Toggles</p>
                        {Object.entries(features).map(([key, enabled]) => (
                            <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${cardBg}`}>
                                <span className={`text-sm font-medium capitalize ${textPrimary}`}>{key}</span>
                                <button onClick={() => handleToggle(key)} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        ))}
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
    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const data = await getSuperAdminData('/tenants');
                setSchools(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch tenants", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadTenants();
    }, []);

    if (isLoading) return <SkeletonTenantManager />;

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
    const searchIconColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
    const itemBg = isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-50';
    const itemActive = isDarkMode ? 'bg-indigo-600/30 border-indigo-500/50' : 'bg-indigo-50 border-indigo-300';

    const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                                </div>
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${getStatusStyle(school.status).color}`} />
                            </div>
                            <p className={`text-xs mt-1 ${textSecondary}`}>{school.studentCount.toLocaleString()} students</p>
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
