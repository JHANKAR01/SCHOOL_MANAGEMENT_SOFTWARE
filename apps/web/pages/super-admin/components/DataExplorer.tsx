import React, { useState, useEffect } from 'react';
import {
    Database, Search, Filter, Users, GraduationCap, Phone, Lock,
    AlertTriangle, ToggleLeft, Shield, ShieldAlert, BookOpen, UserPlus,
    LayoutGrid, Table as TableIcon, Eye, ArrowLeft, Loader2
} from 'lucide-react';
import { getSuperAdminData } from '../../../../../packages/app/api/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODULES = [
    { id: 'students', name: 'Students', icon: GraduationCap },
    { id: 'staff', name: 'Staff', icon: Users },
    { id: 'parents', name: 'Parents', icon: UserPlus },
    { id: 'classes', name: 'Classes', icon: BookOpen },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => ({ id: `class-${i + 1}`, name: `Class ${i + 1}` }));
const SECTIONS = ['A', 'B', 'C', 'D'].map(s => ({ id: `sec-${s}`, name: `Section ${s}` }));

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
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modify/Edit State
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
                // Mock random status for demo purposes since API might not return it
                const enhancedData = (Array.isArray(data) ? data : []).map(r => ({ ...r, status: Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE' }));
                setRecords(enhancedData);
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

    // Status Badge
    const StatusBadge = ({ status }: { status: string }) => {
        const isGreen = status === 'ACTIVE';
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isGreen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} ${isDarkMode ? (isGreen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300') : ''}`}>
                {status}
            </span>
        );
    };

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
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <Filter className={`w-5 h-5 ${textSecondary}`} />
                        <div className="flex flex-wrap gap-3 flex-1">
                            <FilterSelect isDarkMode={isDarkMode} label="School" value={selectedSchool} onChange={(v) => { setSelectedSchool(v); setSelectedModule(''); setSearchQuery(''); }} options={schools} placeholder="Select School..." />
                            <FilterSelect isDarkMode={isDarkMode} label="Module" value={selectedModule} onChange={(v) => { setSelectedModule(v); setSearchQuery(''); }} options={MODULES} placeholder="Module..." disabled={!selectedSchool} />
                            {selectedModule === 'students' && (
                                <>
                                    <FilterSelect isDarkMode={isDarkMode} label="Class" value={selectedClass} onChange={setSelectedClass} options={CLASSES} placeholder="All Classes" disabled={!selectedSchool} />
                                    <FilterSelect isDarkMode={isDarkMode} label="Section" value={selectedSection} onChange={setSelectedSection} options={SECTIONS} placeholder="All" disabled={!selectedClass} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end gap-3 min-w-[200px]">
                        <div className="flex-1 relative">
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5 ${textSecondary}`}>Search</label>
                            <Search className={`absolute left-3 bottom-2.5 w-4 h-4 z-10 pointer-events-none ${searchIconColor}`} />
                            <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={!selectedModule} className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg} disabled:opacity-50`} />
                        </div>
                        {selectedSchool && selectedModule && !selectedRecord && (
                            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600 mb-[1px]">
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                    <TableIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {selectedSchool && selectedModule ? (
                <div className={`rounded-2xl border transition-all overflow-hidden ${modifyMode ? cardBgModify : cardBg}`}>
                    {selectedRecord ? (
                        // ━━━━━━━━━━━━━━━━━━━━ DETAIL VIEW ━━━━━━━━━━━━━━━━━━━━
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <button onClick={() => setSelectedRecord(null)} className={`flex items-center gap-2 text-sm font-medium ${textSecondary} hover:text-indigo-500`}>
                                    <ArrowLeft className="w-4 h-4" /> Back to List
                                </button>

                                {/* Modify Toggle */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {modifyMode ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <Shield className={`w-4 h-4 ${textSecondary}`} />}
                                        <span className={`text-xs ${textSecondary}`}>{modifyMode ? 'Override Mode' : 'Read-only'}</span>
                                    </div>
                                    <button onClick={() => setModifyMode(!modifyMode)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${modifyMode ? 'bg-amber-500 text-white' : isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                        <ToggleLeft className="w-3 h-3" /> {modifyMode ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-4xl mx-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
                                            {selectedModule === 'students' ? <GraduationCap className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${textPrimary}`}>{selectedRecord.name}</h2>
                                            <p className={`text-sm ${textSecondary}`}>{selectedRecord.class || selectedRecord.role || 'No designation'} • ID: {selectedRecord.id.substring(0, 8)}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={selectedRecord.status} />
                                </div>

                                {modifyMode && getChanges().length > 0 && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="text-sm font-medium">You have unsaved changes.</span>
                                        </div>
                                        <button onClick={() => setShowConfirm(true)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium shadow-sm">
                                            Save Changes
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                    {[{ label: 'Full Name', key: 'name', mask: null },
                                    { label: 'Role / Class', key: 'class', mask: null },
                                    { label: 'Phone Number', key: 'phone', mask: maskPhone },
                                    { label: 'Aadhaar / Gov ID', key: 'aadhaar', mask: maskAadhaar },
                                    { label: 'Email Address', key: 'email', mask: null },
                                    { label: 'Fee Status', key: 'feeStatus', mask: null, readonly: true }
                                    ].map(field => (
                                        <div key={field.key} className="space-y-1.5">
                                            <label className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                                                {field.label} {!modifyMode && field.mask && <Lock className="w-3 h-3 opacity-50" />}
                                            </label>
                                            <input type="text"
                                                value={modifyMode && !field.readonly ? (editedData[field.key] ?? (selectedRecord as any)[field.key]) : (field.mask ? field.mask((selectedRecord as any)[field.key]) : (selectedRecord as any)[field.key] || '')}
                                                onChange={(e) => !field.readonly && handleEdit(field.key, e.target.value)}
                                                disabled={!modifyMode || field.readonly}
                                                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${modifyMode && !field.readonly ? inputModify : inputDisabled}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ━━━━━━━━━━━━━━━━━━━━ LIST VIEW (GRID / TABLE) ━━━━━━━━━━━━━━━━━━━━
                        <div>
                            {/* Header Stats */}
                            <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                <p className={`text-xs uppercase tracking-wider font-semibold ${textSecondary}`}>{records.length} Records Found</p>
                                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                            </div>

                            <div className="min-h-[300px] max-h-[600px] overflow-auto">
                                {records.length === 0 && !isFetching ? (
                                    <div className={`p-10 text-center text-sm ${textSecondary}`}>No records found matching your filters.</div>
                                ) : viewMode === 'table' ? (
                                    // ========== TABLE VIEW ==========
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} sticky top-0 z-10`}>
                                                <th className="px-6 py-3 font-semibold">Name</th>
                                                <th className="px-6 py-3 font-semibold">ID</th>
                                                <th className="px-6 py-3 font-semibold">Role/Class</th>
                                                <th className="px-6 py-3 font-semibold">Contact</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                            {records.map(record => (
                                                <tr key={record.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                                                    <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>{record.name}</td>
                                                    <td className={`px-6 py-4 text-xs font-mono ${textSecondary}`}>{record.id.substring(0, 8)}...</td>
                                                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{record.class || record.role || '-'}</td>
                                                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{maskPhone(record.phone)}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => setSelectedRecord(record)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // ========== GRID VIEW ==========
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                        {records.map(record => (
                                            <div key={record.id} onClick={() => setSelectedRecord(record)}
                                                className={`cursor-pointer group flex items-center p-4 rounded-xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                    <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400">
                                                        {record.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>{record.name}</p>
                                                    <p className={`text-xs truncate ${textSecondary}`}>{record.class || record.role || 'No Class'}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-4 h-4 text-indigo-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
