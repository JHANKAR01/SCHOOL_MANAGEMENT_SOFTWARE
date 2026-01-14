import React from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKELETON PRIMITIVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const shimmerClass = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`rounded-lg ${shimmerClass} ${className}`} />
);

export const SkeletonText: React.FC<{ width?: string; height?: string }> = ({
    width = 'w-24',
    height = 'h-4'
}) => (
    <div className={`rounded ${shimmerClass} ${width} ${height}`} />
);

export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = 'w-10 h-10' }) => (
    <div className={`rounded-full ${shimmerClass} ${size}`} />
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAT CARD SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonStatCard: React.FC = () => (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between mb-3">
            <SkeletonText width="w-20" height="h-3" />
            <SkeletonBox className="w-9 h-9" />
        </div>
        <SkeletonText width="w-32" height="h-8" />
        <div className="flex items-center justify-between mt-3">
            <SkeletonText width="w-24" height="h-3" />
            <SkeletonText width="w-12" height="h-3" />
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIST ROW SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonRow: React.FC = () => (
    <div className="p-3 border-b border-slate-100 flex items-center gap-3">
        <SkeletonCircle size="w-8 h-8" />
        <div className="flex-1 space-y-2">
            <SkeletonText width="w-32" height="h-4" />
            <SkeletonText width="w-20" height="h-3" />
        </div>
        <SkeletonBox className="w-2 h-2 rounded-full" />
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHOOL CARD SKELETON (Health Matrix)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonSchoolCard: React.FC = () => (
    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-2">
            <SkeletonBox className="w-2 h-2 rounded-full" />
            <SkeletonText width="w-16" height="h-3" />
        </div>
        <SkeletonText width="w-28" height="h-4" />
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETAIL PANEL SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonDetailPanel: React.FC = () => (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
            <SkeletonBox className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
                <SkeletonText width="w-40" height="h-6" />
                <SkeletonText width="w-24" height="h-4" />
            </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 p-2 rounded-xl bg-slate-100">
            <SkeletonBox className="flex-1 h-10 rounded-lg" />
            <SkeletonBox className="flex-1 h-10 rounded-lg" />
            <SkeletonBox className="flex-1 h-10 rounded-lg" />
        </div>
        {/* Content grid */}
        <div className="grid grid-cols-2 gap-4">
            <SkeletonBox className="h-24 rounded-xl" />
            <SkeletonBox className="h-24 rounded-xl" />
            <SkeletonBox className="col-span-2 h-20 rounded-xl" />
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMAND CENTER SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonCommandCenter: React.FC = () => (
    <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>
        {/* Health Matrix + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 bg-white">
                <SkeletonText width="w-40" height="h-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <SkeletonSchoolCard />
                    <SkeletonSchoolCard />
                    <SkeletonSchoolCard />
                    <SkeletonSchoolCard />
                    <SkeletonSchoolCard />
                    <SkeletonSchoolCard />
                </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
                <SkeletonText width="w-32" height="h-4" />
                <div className="mt-4 space-y-3">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </div>
            </div>
        </div>
        {/* Quick Actions */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
            <SkeletonText width="w-28" height="h-4" />
            <div className="flex gap-3 mt-4">
                <SkeletonBox className="w-40 h-10 rounded-xl" />
                <SkeletonBox className="w-36 h-10 rounded-xl" />
                <SkeletonBox className="w-36 h-10 rounded-xl" />
            </div>
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TENANT MANAGER SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonTenantManager: React.FC = () => (
    <div className="flex h-[calc(100vh-180px)] gap-4 p-4">
        {/* Left List */}
        <div className="w-80 flex-shrink-0 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-3 border-b border-slate-200">
                <SkeletonBox className="w-full h-10 rounded-lg" />
            </div>
            <div className="p-2 space-y-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 rounded-xl space-y-2">
                        <SkeletonText width="w-32" height="h-4" />
                        <SkeletonText width="w-20" height="h-3" />
                        <SkeletonText width="w-24" height="h-3" />
                    </div>
                ))}
            </div>
        </div>
        {/* Right Panel */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white">
            <SkeletonDetailPanel />
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA EXPLORER SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SkeletonDataExplorer: React.FC = () => (
    <div className="p-6 space-y-4">
        {/* Filter Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-4 mb-4">
                <SkeletonCircle size="w-5 h-5" />
                <SkeletonText width="w-24" height="h-4" />
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px] space-y-1">
                    <SkeletonText width="w-16" height="h-3" />
                    <SkeletonBox className="w-full h-10 rounded-lg" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-1">
                    <SkeletonText width="w-16" height="h-3" />
                    <SkeletonBox className="w-full h-10 rounded-lg" />
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                    <SkeletonText width="w-16" height="h-3" />
                    <SkeletonBox className="w-full h-10 rounded-lg" />
                </div>
            </div>
        </div>
        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3">
                <SkeletonCircle size="w-5 h-5" />
                <div className="space-y-1">
                    <SkeletonText width="w-40" height="h-4" />
                    <SkeletonText width="w-32" height="h-3" />
                </div>
            </div>
            <SkeletonBox className="w-32 h-9 rounded-lg" />
        </div>
        {/* Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-3 border-b border-slate-200">
                    <SkeletonText width="w-20" height="h-3" />
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 border-b border-slate-100 space-y-2">
                        <SkeletonText width="w-28" height="h-4" />
                        <SkeletonText width="w-20" height="h-3" />
                    </div>
                ))}
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                    <SkeletonBox className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                        <SkeletonText width="w-32" height="h-5" />
                        <SkeletonText width="w-16" height="h-4" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-1">
                            <SkeletonText width="w-16" height="h-3" />
                            <SkeletonBox className="w-full h-10 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default {
    SkeletonBox,
    SkeletonText,
    SkeletonCircle,
    SkeletonStatCard,
    SkeletonRow,
    SkeletonSchoolCard,
    SkeletonDetailPanel,
    SkeletonCommandCenter,
    SkeletonTenantManager,
    SkeletonDataExplorer,
};
