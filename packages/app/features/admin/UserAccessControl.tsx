import React, { useState, useEffect } from 'react';
import { Shield, Plus, Key, Trash2, Search, Check } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/system-admin/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
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
                fetchUsers();
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
            fetchUsers();
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

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

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
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                    </div>
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
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{user.name}</div>
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
            </NebulaCard>

            {/* Grant Access Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <NebulaCard className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">Grant System Access</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-70">Person Type</label>
                                <select
                                    className="w-full p-2 rounded border bg-transparent"
                                    value={formData.personType}
                                    onChange={e => setFormData({ ...formData, personType: e.target.value })}
                                >
                                    <option value="STAFF">Staff Member</option>
                                    <option value="STUDENT">Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-70">Person ID (UUID)</label>
                                <input
                                    className="w-full p-2 rounded border bg-transparent"
                                    placeholder="Paste ID here..."
                                    value={formData.personId}
                                    onChange={e => setFormData({ ...formData, personId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <NebulaInput
                                label="Email (Login ID)"
                                value={formData.email}
                                onChange={val => setFormData({ ...formData, email: val })}
                            />
                            <NebulaInput
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={val => setFormData({ ...formData, password: val })}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold mb-2 opacity-70">Role</label>
                            <select
                                className="w-full p-2 rounded border bg-transparent mb-4"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="SCHOOL_ADMIN">School Admin</option>
                                <option value="PRINCIPAL">Principal</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ACCOUNTANT">Accountant</option>
                                <option value="ADMISSIONS_OFFICER">Admissions Officer</option>
                                <option value="STUDENT">Student</option>
                            </select>

                            <label className="block text-xs font-bold mb-2 opacity-70">Granular Permissions</label>
                            <div className="grid grid-cols-2 gap-2 p-3 rounded border bg-slate-50 dark:bg-slate-900/50">
                                {Object.values(PERMISSIONS).map(perm => (
                                    <label key={perm} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-black/5 rounded">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.permissions.includes(perm) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400'}`}>
                                            {formData.permissions.includes(perm) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.permissions.includes(perm)}
                                            onChange={() => togglePermission(perm)}
                                        />
                                        <span className="text-xs font-medium">{perm.replace(/_/g, ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <NebulaButton variant="secondary" onClick={() => setShowModal(false)}>Cancel</NebulaButton>
                            <NebulaButton variant="primary" onClick={handleGrantAccess}>Grant Access</NebulaButton>
                        </div>
                    </NebulaCard>
                </div>
            )}
        </div>
    );
};
