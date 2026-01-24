// packages/app/features/reception/ReceptionConsole.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { UserPlus, Package, AlertTriangle, Search, Clock, Users, ArrowRight } from 'lucide-react';

interface ReceptionConsoleProps {
    onNavigate: (module: string) => void;
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 min-w-[150px]">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
        </div>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">{title}</Text>
    </View>
);

const QuickAction = ({ label, icon: Icon, onClick, color }: any) => (
    <TouchableOpacity
        onPress={onClick}
        className="flex-row items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    >
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <Text className="font-semibold text-slate-700 dark:text-slate-200">{label}</Text>
    </TouchableOpacity>
);

export const ReceptionConsole: React.FC<ReceptionConsoleProps> = ({ onNavigate }) => {
    return (
        <ScrollView className="flex-1">
            <View className="flex-col gap-6">

                {/* 1. Statistics Row */}
                <View className="flex-row flex-wrap gap-4">
                    <StatCard
                        title="Visitors Today"
                        value="12"
                        icon={Users}
                        color="bg-indigo-500"
                        subtext="+20% vs yesterday"
                    />
                    <StatCard
                        title="On-Site Now"
                        value="4"
                        icon={Clock}
                        color="bg-emerald-500"
                        subtext="Active Badges"
                    />
                    <StatCard
                        title="Pending Parcels"
                        value="3"
                        icon={Package}
                        color="bg-amber-500"
                        subtext="Need Pickup"
                    />
                    {/* <StatCard 
                        title="Open Tickets" 
                        value="1" 
                        icon={AlertTriangle} 
                        color="bg-red-500" 
                        subtext="Facilities"
                    /> */}
                </View>

                {/* 2. Main Layout Grid */}
                <View className="flex-col lg:flex-row gap-6">

                    {/* Left Column: Quick Actions & Search */}
                    <View className="flex-1 flex-col gap-6">

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Quick Search (Visitor, Student, Parcel...)"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <QuickAction
                                label="New Visitor Check-In"
                                icon={UserPlus}
                                color="bg-indigo-500"
                                onClick={() => onNavigate('visitors')} // In real flow, open Check-in Modal
                            />
                            <QuickAction
                                label="Log Parcel Delivery"
                                icon={Package}
                                color="bg-amber-500"
                                onClick={() => onNavigate('parcels')}
                            />
                            <QuickAction
                                label="Emergency Alert"
                                icon={AlertTriangle}
                                color="bg-red-500"
                                onClick={() => alert('Emergency Protocol Initiated')}
                            />
                        </div>

                        {/* Recent Activity Feed */}
                        <View className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                                <button className="text-xs text-indigo-500 font-medium">View All</button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Rahul Kumar <span className="text-xs font-normal text-slate-500">checked in for</span> Parent Meeting
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">10 mins ago • Hosted by Mrs. Sharma</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </View>
                    </View>

                    {/* Right Column: Live Queue / Appointments */}
                    <View className="w-full lg:w-96 flex-col gap-6">

                        {/* Live Queue Widget */}
                        <View className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-0 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-white">On-Site (4)</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">LIVE</span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-8 h-8 rounded-full bg-slate-200" alt="Visitor" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Visitor Name</p>
                                                <p className="text-xs text-slate-500">In: 10:30 AM</p>
                                            </div>
                                        </div>
                                        <button className="px-2 py-1 rounded text-xs border border-slate-200 text-slate-600 hover:bg-white hover:text-red-500 hover:border-red-200 transition-colors">
                                            Exit
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
                                <button onClick={() => onNavigate('visitors')} className="text-sm text-indigo-500 font-medium flex items-center justify-center gap-1">
                                    View Full Log <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </View>

                        {/* Upcoming Appointments */}
                        <View className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Upcoming Appointments</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center min-w-[3rem]">
                                        <span className="text-xs font-bold text-slate-500">11:00</span>
                                        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-1" />
                                    </div>
                                    <div className="pb-4">
                                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Mr. Gupta (Parent)</p>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">Meeting with Principal</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center min-w-[3rem]">
                                        <span className="text-xs font-bold text-slate-500">12:30</span>
                                    </div>
                                    <div>
                                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">SysAdmin Interview</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Meeting with IT Head</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </View>

                    </View>
                </View>
            </View>
        </ScrollView>
    );
};
