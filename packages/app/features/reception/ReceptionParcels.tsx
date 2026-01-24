// packages/app/features/reception/ReceptionParcels.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Package, Search, Plus, Filter } from 'lucide-react';
import { useReception } from '../../hooks/useOperations';

export const ReceptionParcels = () => {
    const { visitors, isLoading } = useReception();

    // Filter for deliveries
    const parcels = (visitors || []).filter((v: any) =>
        v.purpose === 'Vendor Delivery' || (v.vehicle_no && v.purpose !== 'Parent Meeting')
    );

    return (
        <View className="flex-1 flex-col h-full bg-white dark:bg-transparent">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-500" /> Parcel Log
                    </h2>
                    <p className="text-xs text-slate-500">Track incoming deliveries and vendor visits</p>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-amber-500/20"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Delivery</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-3">Vendor / Courier</div>
                    <div className="col-span-3">Details</div>
                    <div className="col-span-2">Vehicle</div>
                    <div className="col-span-2 text-right">Status</div>
                </div>

                {/* Rows */}
                <ScrollView className="flex-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading deliveries...</div>
                    ) : parcels.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                            <Package className="w-8 h-8 mb-2 opacity-50" />
                            <Text>No parcels or deliveries pending today</Text>
                        </div>
                    ) : (
                        parcels.map((p: any) => (
                            <div key={p.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 dark:border-slate-800 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="col-span-3">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                                    <p className="text-xs text-slate-500">{p.phone}</p>
                                </div>
                                <div className="col-span-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{p.purpose}</span>
                                        {p.student && <span className="text-xs text-indigo-500">For: {p.student}</span>}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
                                        {p.vehicle_no || '-'}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'APPROVED' ? 'bg-amber-100 text-amber-700' :
                                            p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {p.status === 'APPROVED' ? 'Pending' : 'Delivered'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollView>
            </div>
        </View>
    );
};
