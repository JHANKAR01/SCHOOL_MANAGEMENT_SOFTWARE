import React, { useState, useEffect } from 'react';
import { Shield, Plus, Key, Trash2, Search, Check, Users, Loader2 } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';
import { PERMISSIONS } from '../../../../types/permissions';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    created_at: string;
    student_account?: { admission_no: string };
    staff_profile?: { designation: string };
}

export const UserAccessControl: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState(false);
    const [total, setTotal] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // Grant Access Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        personType: 'STAFF', // STAFF | STUDENT
        personId: '',
        email: '',
        password: '',
        role: 'TEACHER', // TEACHER | ACCOUNTANT | ADMIN etc
        permissions: [] as string[]
    });

    // Load recent users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (searchTerm: string = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/system-admin/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setTotal(data.total || data.users.length);
                setSearchMode(data.searchMode || false);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setHasSearched(true);
        fetchUsers(searchQuery);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleGrantAccess = async () => {
        try {
            const res = await fetch('/api/system-admin/users/grant-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({
                    person_type: formData.personType,
                    person_id: formData.personId,
                    role: formData.role,
                    email: formData.email,
                    password: formData.password,
                    permissions: formData.permissions
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Access Granted Successfully');
                setShowModal(false);
                fetchUsers(searchQuery);
            } else {
                alert(data.error || 'Failed to grant access');
            }
        } catch (error) {
            console.error('Grant Access Error:', error);
        }
    };

    const handleRevoke = async (userId: string) => {
        if (!confirm('Are you sure you want to revoke access? This will delete the login.')) return;

        try {
            await fetch(`/api/system-admin/users/${userId}/revoke`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });
            fetchUsers(searchQuery);
        } catch (error) {
            console.error('Revoke Error:', error);
        }
    };

    const togglePermission = (perm: string) => {
        setFormData(prev => {
            const exists = prev.permissions.includes(perm);
            return {
                ...prev,
                permissions: exists
                    ? prev.permissions.filter(p => p !== perm)
                    : [...prev.permissions, perm]
            };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Access Control</h2>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Grant and manage system access for staff and students.</p>
                </div>
                <NebulaButton onClick={() => setShowModal(true)} variant="primary">
                    <Plus className="w-4 h-4 mr-2" /> Grant New Access
                </NebulaButton>
            </div>

            <NebulaCard className="p-4">
                {/* Search Bar with Button */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                        />
                    </div>
                    <NebulaButton onClick={handleSearch} variant="secondary" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </NebulaButton>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && users.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Users className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {hasSearched ? 'No users found' : 'Search for users'}
                        </h3>
                        <p className="text-slate-500 text-center max-w-md">
                            {hasSearched
                                ? 'Try adjusting your search terms or grant access to a new user.'
                                : 'Search for a staff member or student by name or email to manage their access.'}
                        </p>
                    </div>
                )}

                {/* Results Table */}
                {!loading && users.length > 0 && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-slate-500">
                                {searchMode ? `Found ${total} user(s)` : `Showing ${users.length} recent users`}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400 border-b border-slate-700' : 'text-slate-500 border-b border-slate-200'}`}>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Linked Person</th>
                                        <th className="px-4 py-3">Permissions</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                    {users.map(user => (
                                        <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === 'TEACHER' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    user.role === 'STUDENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        user.role === 'PARENT' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                                            user.role === 'PRINCIPAL' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                user.role === 'SCHOOL_ADMIN' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                    user.role === 'ACCOUNTANT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {user.student_account ? `Student (${user.student_account.admission_no})` :
                                                    user.staff_profile ? `Staff (${user.staff_profile.designation})` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.permissions.slice(0, 3).map(p => (
                                                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                                                            {p.split('_')[1]}
                                                        </span>
                                                    ))}
                                                    {user.permissions.length > 3 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">+{user.permissions.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleRevoke(user.id)}
                                                    className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </NebulaCard>

            {/* Grant Access Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <NebulaCard className="w-full max-w-lg p-6">
                        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Grant System Access
                        </h3>

                        <div className="space-y-4">
                            {/* Person Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Person Type</label>
                                <div className="flex gap-2">
                                    {['STAFF', 'STUDENT'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFormData({ ...formData, personType: t })}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.personType === t
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Person ID */}
                            <NebulaInput
                                label={`${formData.personType === 'STAFF' ? 'Staff' : 'Student'} ID`}
                                value={formData.personId}
                                onChange={(val) => setFormData({ ...formData, personId: val })}
                                placeholder="Enter the person's ID"
                            />

                            {/* Email */}
                            <NebulaInput
                                label="Login Email"
                                value={formData.email}
                                onChange={(val) => setFormData({ ...formData, email: val })}
                                placeholder="email@school.edu"
                            />

                            {/* Password */}
                            <NebulaInput
                                label="Temporary Password"
                                value={formData.password}
                                onChange={(val) => setFormData({ ...formData, password: val })}
                                placeholder="Leave blank for default (Welcome@123)"
                            />

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="TEACHER">Teacher</option>
                                    <option value="ACCOUNTANT">Accountant</option>
                                    <option value="ADMISSIONS_OFFICER">Admissions Officer</option>
                                    <option value="HOD">Head of Department</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="PARENT">Parent</option>
                                </select>
                            </div>

                            {/* Permissions */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Permissions</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(PERMISSIONS).slice(0, 8).map(perm => (
                                        <button
                                            key={perm}
                                            onClick={() => togglePermission(perm)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formData.permissions.includes(perm)
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {formData.permissions.includes(perm) && <Check className="w-3 h-3" />}
                                            {perm.split('_').slice(1).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <NebulaButton variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </NebulaButton>
                            <NebulaButton variant="primary" onClick={handleGrantAccess}>
                                <Key className="w-4 h-4 mr-2" /> Grant Access
                            </NebulaButton>
                        </div>
                    </NebulaCard>
                </div>
            )}
        </div>
    );
};
