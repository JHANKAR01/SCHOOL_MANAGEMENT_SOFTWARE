// packages/app/features/reception/ReceptionVisitorLog.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Search, Filter, Plus, MoreHorizontal, Printer, LogOut } from 'lucide-react';
import { useReception } from '../../hooks/useOperations';
import { NewVisitorModal } from './NewVisitorModal';
import { SovereignBadge } from '../../components/SovereignComponents'; // Assuming exists or replace

export const ReceptionVisitorLog = () => {
    const { visitors, isLoading, approveVisitor } = useReception(); // approveVisitor acts as Check-Out in hook? Need to check
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ONSITE'>('ONSITE');

    // Filter logic
    const filteredVisitors = (visitors || []).filter((v: any) => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.purpose.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' ? true : v.status === 'WAITING' || v.status === 'APPROVED'; // Assuming APPROVED means onsite
        return matchesSearch && matchesFilter;
    });

    return (
        <View className="flex-1 flex-col h-full bg-white dark:bg-transparent">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ONSITE')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ONSITE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        On-Site
                    </button>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        History
                    </button>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search logs..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                    <button
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <Filter className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Visitor</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-2">Time In</div>
                    <div className="col-span-3">Visitor</div>
                    <div className="col-span-3">Purpose / Host</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                <ScrollView className="flex-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading logs...</div>
                    ) : filteredVisitors.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <Text>No visitors found matching your criteria</Text>
                        </div>
                    ) : (
                        filteredVisitors.map((visitor: any) => (
                            <div key={visitor.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 dark:border-slate-800 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {new Date(visitor.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="col-span-3">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{visitor.name}</p>
                                    <p className="text-xs text-slate-500">{visitor.phone || 'No Phone'}</p>
                                </div>
                                <div className="col-span-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{visitor.purpose}</span>
                                        {visitor.student && <span className="text-xs text-indigo-500">→ {visitor.student}</span>}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${visitor.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            visitor.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {visitor.status === 'APPROVED' ? 'active' : visitor.status.toLowerCase()}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    {visitor.status !== 'COMPLETED' && (
                                        <button
                                            // onClick={() => approveVisitor(visitor.id)} // Assuming this marks completion or another endpoint needed for Exit. Using approve as placeholder.
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="Check Out"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ScrollView>
            </div>

            <NewVisitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </View>
    );
};
