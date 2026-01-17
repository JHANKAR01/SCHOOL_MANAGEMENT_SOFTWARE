import React, { useState, useEffect } from 'react';
import { Save, Upload, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

interface SchoolProfile {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    contact_email: string;
    contact_phone: string;
    logo_url: string | null;
}

export const SchoolSettings: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [profile, setProfile] = useState<SchoolProfile>({
        id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contact_email: '',
        contact_phone: '',
        logo_url: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Try to get school profile from session or API
            const sessionStr = localStorage.getItem('sovereign_user_session');
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                if (session.school) {
                    setProfile({
                        id: session.school.id || '',
                        name: session.school.name || '',
                        address: session.school.address || '',
                        city: session.school.city || '',
                        state: session.school.state || '',
                        pincode: session.school.pincode || '',
                        contact_email: session.school.contact_email || '',
                        contact_phone: session.school.contact_phone || '',
                        logo_url: session.school.logo_url || null
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof SchoolProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/school/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                alert('Settings saved successfully!');
                setHasChanges(false);

                // Update session storage with new profile
                const sessionStr = localStorage.getItem('sovereign_user_session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    session.school = { ...session.school, ...profile };
                    localStorage.setItem('sovereign_user_session', JSON.stringify(session));
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        School Settings
                    </h2>
                    <p className="text-sm text-slate-500">Update your school's profile and branding</p>
                </div>
                <NebulaButton variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </NebulaButton>
            </div>

            {/* Profile Card */}
            <NebulaCard className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <div className="flex items-start gap-6 mb-8">
                    {/* Logo Upload Placeholder */}
                    <div className="flex-shrink-0">
                        <div className={`w-24 h-24 rounded-xl flex items-center justify-center border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                            }`}>
                            {profile.logo_url ? (
                                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                    <span className="text-xs text-slate-400">Logo</span>
                                </div>
                            )}
                        </div>
                        <button className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 w-full text-center">
                            Upload Logo
                        </button>
                    </div>

                    {/* School Name */}
                    <div className="flex-1">
                        <NebulaInput
                            label="School Name"
                            value={profile.name}
                            onChange={(val) => handleChange('name', val)}
                            placeholder="Enter school name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Address
                            </span>
                        </div>
                        <NebulaInput
                            value={profile.address}
                            onChange={(val) => handleChange('address', val)}
                            placeholder="Street address"
                        />
                    </div>

                    <NebulaInput
                        label="City"
                        value={profile.city}
                        onChange={(val) => handleChange('city', val)}
                        placeholder="City"
                    />

                    <NebulaInput
                        label="State"
                        value={profile.state}
                        onChange={(val) => handleChange('state', val)}
                        placeholder="State"
                    />

                    <NebulaInput
                        label="PIN Code"
                        value={profile.pincode}
                        onChange={(val) => handleChange('pincode', val.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="e.g. 400001"
                    />

                    {/* Contact Section */}
                    <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Contact Information
                            </span>
                        </div>
                    </div>

                    <NebulaInput
                        label="Contact Email"
                        value={profile.contact_email}
                        onChange={(val) => handleChange('contact_email', val)}
                        placeholder="admin@school.edu"
                    />

                    <NebulaInput
                        label="Contact Phone"
                        value={profile.contact_phone}
                        onChange={(val) => handleChange('contact_phone', val.replace(/[^0-9+\-\s]/g, ''))}
                        placeholder="+91 XXXXX XXXXX"
                    />
                </div>
            </NebulaCard>

            {/* Info Banner */}
            <NebulaCard className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-400">School ID</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-500 font-mono">{profile.id || 'Not available'}</p>
                    </div>
                </div>
            </NebulaCard>
        </div>
    );
};
