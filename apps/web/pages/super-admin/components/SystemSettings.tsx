import React from 'react';
import { Save, Lock, Globe } from 'lucide-react';

export const SystemSettings = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Platform Configuration</h2>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-all">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6 text-indigo-400">
                        <Globe size={24} />
                        <h3 className="text-lg font-medium text-white">Localization</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Default Currency</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
                                <option>Asia/Kolkata (IST)</option>
                                <option>UTC</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6 text-rose-400">
                        <Lock size={24} />
                        <h3 className="text-lg font-medium text-white">Security Policies</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-300">Force 2FA for School Admins</span>
                            <input type="checkbox" className="toggle toggle-success" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-300">Session Timeout (15 mins)</span>
                            <input type="checkbox" className="toggle toggle-success" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
