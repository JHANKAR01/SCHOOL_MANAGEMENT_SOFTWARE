import React, { useState, useMemo, useEffect } from 'react';
import {
    Database, Search, Filter, Users, GraduationCap, Phone, Lock,
    AlertTriangle, ToggleLeft, Shield, ShieldAlert, DollarSign, Truck, Loader2
} from 'lucide-react';
import { getSuperAdminData } from '../../../../../packages/app/api/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODULES = [
    { id: 'students', name: 'Students', icon: GraduationCap },
    { id: 'staff', name: 'Staff', icon: Users },
    // Finance and Fleet coming soon
];

// Helper to mask sensitive data
const maskPhone = (phone: string): string => phone && phone.length > 4 ? `******${phone.slice(-4)}` : '******';
const maskAadhaar = (aadhaar: string): string => aadhaar && aadhaar.length > 4 ? `XXXX-XXXX-${aadhaar.slice(-4)}` : 'XXXX-XXXX-XXXX';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILTER SELECT COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FilterSelect: React.FC<{
    label: string; value: string; onChange: (val: string) => void;
    options: { id: string; name: string }[]; placeholder: string; disabled?: boolean; isDarkMode: boolean;
}> = ({ label, value, onChange, options, placeholder, disabled, isDarkMode }) => {
    const labelColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';
    const selectBg = isDarkMode
        ? 'bg-slate-800 border-slate-600 text-slate-100'
        : 'bg-white border-slate-300 text-slate-900';

    return (
        <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs uppercase tracking-wider mb-1 ${labelColor}`}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 appearance-none cursor-pointer pr-10 ${selectBg}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem 1.25rem' }}>
                <option value="" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>{placeholder}</option>
                {options.map((opt) => (<option key={opt.id} value={opt.id} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>{opt.name}</option>))}
            </select>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA EXPLORER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DataExplorerProps { isDarkMode: boolean; }
import { SkeletonDataExplorer } from './Skeleton';

export const DataExplorer: React.FC<DataExplorerProps> = ({ isDarkMode }) => {
    // State
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    // Data State
    const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
    const [records, setRecords] = useState<any[]>([]);

    // Filter State
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // View/Edit State
    const [modifyMode, setModifyMode] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [editedData, setEditedData] = useState<Record<string, string>>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');

    // 1. Initial Load: Fetch Schools
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const data = await getSuperAdminData('/tenants');
                setSchools(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch schools", err);
            } finally {
                setIsLoadingInit(false);
            }
        };
        fetchSchools();
    }, []);

    // 2. Fetch Records when filters change
    useEffect(() => {
        if (!selectedSchool || !selectedModule) {
            setRecords([]);
            return;
        }

        const fetchRecords = async () => {
            setIsFetching(true);
            try {
                const data = await getSuperAdminData(`/explorer/search?schoolId=${selectedSchool}&module=${selectedModule}&query=${searchQuery}`);
                setRecords(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch explorer records", err);
            } finally {
                setIsFetching(false);
            }
        };

        // Debounce search
        const timeout = setTimeout(fetchRecords, 500);
        return () => clearTimeout(timeout);
    }, [selectedSchool, selectedModule, searchQuery]);

    // Theme Helpers
    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200';
    const cardBgModify = isDarkMode ? 'bg-amber-900/20 border-amber-500/40' : 'bg-amber-50 border-amber-300';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
    const searchIconColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDarkMode ? 'bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
    const inputModify = isDarkMode ? 'bg-slate-800 border-amber-500/50 text-white' : 'bg-white border-amber-400 text-slate-900';
    const inputDisabled = isDarkMode ? 'bg-slate-900/30 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed';
    const itemBg = isDarkMode ? 'hover:bg-white/5 border-transparent' : 'hover:bg-slate-50 border-transparent';
    const itemActive = isDarkMode ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200';

    const handleEdit = (field: string, value: string) => setEditedData(prev => ({ ...prev, [field]: value }));

    const getChanges = () => {
        if (!selectedRecord) return [];
        return Object.entries(editedData).filter(([k, v]) => (selectedRecord as any)[k] !== v).map(([k, v]) => ({ field: k, oldValue: (selectedRecord as any)[k], newValue: v }));
    };

    const handleSave = () => {
        console.log('[AUDIT] Override:', { record: selectedRecord?.id, changes: getChanges(), reason: overrideReason });
        setShowConfirm(false);
        setEditedData({});
        setOverrideReason('');
        setModifyMode(false);
        alert("Changes logged to Audit Trail. (Write API not connected in this demo)");
    };

    if (isLoadingInit) return <SkeletonDataExplorer />;

    return (
        <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className={`p-4 rounded-2xl border transition-all ${modifyMode ? cardBgModify : cardBg}`}>
                <div className="flex items-center gap-4 mb-4">
                    <Filter className={`w-5 h-5 ${textSecondary}`} />
                    <span className={`text-sm font-medium ${textPrimary}`}>Data Filters</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <FilterSelect isDarkMode={isDarkMode} label="School" value={selectedSchool} onChange={(v) => { setSelectedSchool(v); setSelectedModule(''); setSearchQuery(''); }} options={schools} placeholder="Select School..." />
                    <FilterSelect isDarkMode={isDarkMode} label="Module" value={selectedModule} onChange={(v) => { setSelectedModule(v); setSearchQuery(''); }} options={MODULES} placeholder="Select Module..." disabled={!selectedSchool} />

                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5 ${textSecondary}`}>Search</label>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none ${searchIconColor}`} />
                            <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={!selectedModule} className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg} disabled:opacity-50`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modify Mode Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${modifyMode ? cardBgModify : cardBg}`}>
                <div className="flex items-center gap-3">
                    {modifyMode ? <ShieldAlert className="w-5 h-5 text-amber-500" /> : <Shield className={`w-5 h-5 ${textSecondary}`} />}
                    <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{modifyMode ? 'Admin Override Mode Active' : 'View Only Mode'}</p>
                        <p className={`text-xs ${textSecondary}`}>{modifyMode ? 'Changes require confirmation + reason' : 'Read-only with masked PII'}</p>
                    </div>
                </div>
                <button onClick={() => setModifyMode(!modifyMode)} disabled={!selectedRecord}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${modifyMode ? 'bg-amber-500 text-white' : isDarkMode ? 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/15' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                    <ToggleLeft className="w-4 h-4" /> {modifyMode ? 'Disable' : 'Enable Overrides'}
                </button>
            </div>

            {/* Data Grid */}
            {selectedSchool && selectedModule ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className={`rounded-2xl border overflow-hidden ${modifyMode ? cardBgModify : cardBg}`}>
                        <div className={`flex justify-between items-center p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <p className={`text-xs uppercase tracking-wider ${textSecondary}`}>{records.length} Records</p>
                            {isFetching && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                        </div>
                        <div className="max-h-[400px] overflow-auto">
                            {records.length === 0 && !isFetching && (
                                <div className={`p-4 text-center text-sm ${textSecondary}`}>No records found.</div>
                            )}
                            {records.map(record => (
                                <button key={record.id} onClick={() => { setSelectedRecord(record); setEditedData({}); }}
                                    className={`w-full text-left p-3 border-b transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} ${selectedRecord?.id === record.id ? itemActive : itemBg}`}>
                                    <p className={`text-sm font-medium ${textPrimary}`}>{record.name}</p>
                                    <p className={`text-xs ${textSecondary}`}>{record.class} • {modifyMode ? record.phone : maskPhone(record.phone)}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`lg:col-span-2 rounded-2xl border p-6 ${modifyMode ? cardBgModify : cardBg}`}>
                        {selectedRecord ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-white" /></div>
                                        <div><h3 className={`text-lg font-semibold ${textPrimary}`}>{selectedRecord.name}</h3><p className={`text-sm ${textSecondary}`}>{selectedRecord.class}</p></div>
                                    </div>
                                    {modifyMode && getChanges().length > 0 && <button onClick={() => setShowConfirm(true)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium">Save Changes</button>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ label: 'Phone', key: 'phone', mask: maskPhone }, { label: 'Aadhaar', key: 'aadhaar', mask: maskAadhaar }, { label: 'Email', key: 'email', mask: null }, { label: 'Fee Status', key: 'feeStatus', mask: null, readonly: true }].map(field => (
                                        <div key={field.key} className="space-y-1">
                                            <label className={`flex items-center gap-1 text-xs uppercase tracking-wider ${textSecondary}`}>{field.label}{!modifyMode && field.mask && <Lock className="w-3 h-3 opacity-50" />}</label>
                                            <input type="text"
                                                value={modifyMode && !field.readonly ? (editedData[field.key] ?? (selectedRecord as any)[field.key]) : (field.mask ? field.mask((selectedRecord as any)[field.key]) : (selectedRecord as any)[field.key])}
                                                onChange={(e) => !field.readonly && handleEdit(field.key, e.target.value)}
                                                disabled={!modifyMode || field.readonly}
                                                className={`w-full px-3 py-2 rounded-lg border text-sm font-mono ${modifyMode && !field.readonly ? inputModify : inputDisabled}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`h-full flex flex-col items-center justify-center py-16 ${textSecondary}`}>
                                <Database className="w-12 h-12 mb-4 opacity-30" /><p>Select a record to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={`p-16 text-center rounded-2xl border ${cardBg}`}>
                    <Filter className={`w-12 h-12 mx-auto mb-4 opacity-30 ${textSecondary}`} />
                    <p className={`text-lg font-medium ${textPrimary}`}>Select School & Module</p>
                    <p className={`text-sm ${textSecondary}`}>Use the filters above to explore data</p>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className={`relative w-full max-w-md rounded-2xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-amber-500/30' : 'bg-white border-amber-300'}`}>
                        <div className={`flex items-center gap-3 p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                            <h3 className={`text-lg font-semibold ${textPrimary}`}>Confirm Override</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-40 overflow-auto">
                            {getChanges().map((c, i) => (
                                <div key={i} className={`p-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <span className={textSecondary}>{c.field}:</span>
                                    <span className="text-red-500 line-through mx-2 font-mono">{c.oldValue}</span>→
                                    <span className="text-emerald-500 ml-2 font-mono">{c.newValue}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <label className="block text-xs text-amber-500 uppercase tracking-wider mb-2">Reason (Required)</label>
                            <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="e.g., Principal requested update" rows={2} className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500 ${inputBg}`} />
                        </div>
                        <div className={`flex justify-end gap-3 p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <button onClick={() => setShowConfirm(false)} className={`px-4 py-2 text-sm ${textSecondary}`}>Cancel</button>
                            <button onClick={handleSave} disabled={overrideReason.length < 10} className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataExplorer;
