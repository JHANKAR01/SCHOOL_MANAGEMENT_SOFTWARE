// packages/app/features/parent/ParentProfile.tsx
// Profile Settings - Contact info, terms acceptance, preferences

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch } from 'react-native';
import { User, Phone, Mail, MapPin, Shield, Check, AlertTriangle } from 'lucide-react';
import { useParentProfile, useUpdateParentProfile, useAcceptTerms } from '../../../hooks/useParentData';
import { SovereignSkeleton, SovereignButton, SovereignBadge } from '../../components/SovereignComponents';
import { useTranslation } from '../../provider/language-context';

export const ParentProfile: React.FC = () => {
    const { data, isLoading, refetch } = useParentProfile();
    const updateProfile = useUpdateParentProfile();
    const acceptTerms = useAcceptTerms();
    const { setLanguage: setAppLanguage } = useTranslation();

    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState('');
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [error, setError] = useState('');

    const profile = data?.data;

    const [language, setLanguage] = useState('en');
    const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, sms: true });

    React.useEffect(() => {
        if (profile) {
            setPhone(profile.phone || '');
            if (profile.profile?.language_preference) setLanguage(profile.profile.language_preference);
            if (profile.profile?.notification_prefs) setNotifPrefs(profile.profile.notification_prefs as any);
        }
    }, [profile]);

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        setAppLanguage(lang as any);
        updateProfile.mutate({ language_preference: lang });
    };

    const handleNotifPrefChange = (key: string, value: boolean) => {
        const newPrefs = { ...notifPrefs, [key]: value };
        setNotifPrefs(newPrefs);
        updateProfile.mutate({ notification_prefs: newPrefs });
    };

    React.useEffect(() => {
        if (profile && !profile.terms_accepted) {
            setShowTermsModal(true);
        }
    }, [profile]);

    const handleSave = async () => {
        setError('');
        try {
            await updateProfile.mutateAsync({ phone });
            setIsEditing(false);
            refetch();
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        }
    };

    const handleAcceptTerms = async () => {
        try {
            await acceptTerms.mutateAsync();
            setShowTermsModal(false);
            refetch();
        } catch (err: any) {
            setError(err.message || 'Failed to accept terms');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-48 w-full rounded-xl" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Profile not found
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView className="flex-1 p-4">
                {/* Profile Header */}
                <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-4">
                    <View className="flex-row items-center gap-4 mb-4">
                        <View className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
                            <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {profile.name.charAt(0)}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                {profile.name}
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <Text className="text-sm text-slate-500 dark:text-slate-400">
                                    {profile.email}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Terms Status */}
                    <View className="flex-row items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Shield className={`w-5 h-5 ${profile.terms_accepted ? 'text-green-500' : 'text-amber-500'}`} />
                        <Text className={`flex-1 text-sm ${profile.terms_accepted ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {profile.terms_accepted
                                ? `Terms accepted on ${new Date(profile.terms_accepted_at!).toLocaleDateString('en-IN')}`
                                : 'Terms not yet accepted'
                            }
                        </Text>
                        {!profile.terms_accepted && (
                            <TouchableOpacity
                                onPress={() => setShowTermsModal(true)}
                                className="bg-indigo-600 px-3 py-1 rounded-lg"
                            >
                                <Text className="text-white text-sm font-medium">Accept</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Contact Info */}
                <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">
                            Contact Information
                        </Text>
                        {!isEditing ? (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg"
                            >
                                <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => setIsEditing(false)}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                >
                                    <Text className="text-sm text-slate-600 dark:text-slate-400">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={updateProfile.isPending}
                                    className="px-3 py-1 bg-indigo-600 rounded-lg"
                                >
                                    <Text className="text-sm text-white font-medium">Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {error && (
                        <View className="flex-row items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <Text className="text-red-600 dark:text-red-400 text-sm">{error}</Text>
                        </View>
                    )}

                    <View className="space-y-4">
                        <View className="flex-row items-center gap-3">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <View className="flex-1">
                                <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</Text>
                                {isEditing ? (
                                    <TextInput
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="+91 9876543210"
                                        keyboardType="phone-pad"
                                        className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                                    />
                                ) : (
                                    <Text className="text-sm text-slate-900 dark:text-white">
                                        {profile.phone || 'Not set'}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {profile.profile?.address && (
                            <View className="flex-row items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                <View className="flex-1">
                                    <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Address</Text>
                                    <Text className="text-sm text-slate-900 dark:text-white">
                                        {[
                                            profile.profile.address.line1,
                                            profile.profile.address.line2,
                                            profile.profile.address.city,
                                            profile.profile.address.state,
                                            profile.profile.address.pincode
                                        ].filter(Boolean).join(', ') || 'Not set'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Occupation Info */}
                {profile.profile && (
                    <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Professional Info
                        </Text>
                        <View className="space-y-3">
                            <View>
                                <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Occupation</Text>
                                <Text className="text-sm text-slate-900 dark:text-white">
                                    {profile.profile.occupation || 'Not specified'}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Organization</Text>
                                <Text className="text-sm text-slate-900 dark:text-white">
                                    {profile.profile.organization || 'Not specified'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Settings & Preferences */}
                <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Settings & Preferences
                    </Text>

                    {/* Language */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Language</Text>
                        <View className="flex-row gap-3">
                            {['en', 'hi'].map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    onPress={() => handleLanguageChange(lang)}
                                    className={`px-4 py-2 rounded-lg border ${language === lang
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                                        }`}
                                >
                                    <Text className={language === lang ? 'text-white font-medium' : 'text-slate-700 dark:text-slate-300'}>
                                        {lang === 'en' ? 'English' : 'Hindi'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notifications */}
                    <View>
                        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Notifications</Text>
                        <View className="space-y-4">
                            {[
                                { key: 'email', label: 'Email Alerts' },
                                { key: 'push', label: 'Push Notifications' },
                                { key: 'sms', label: 'SMS Alerts' },
                            ].map((item) => (
                                <View key={item.key} className="flex-row justify-between items-center">
                                    <Text className="text-slate-600 dark:text-slate-400">{item.label}</Text>
                                    <Switch
                                        value={(notifPrefs as any)[item.key]}
                                        onValueChange={(val) => handleNotifPrefChange(item.key, val)}
                                        trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
                                        thumbColor={(notifPrefs as any)[item.key] ? '#4f46e5' : '#f1f5f9'}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Terms Modal */}
            <Modal
                visible={showTermsModal}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <View className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <View className="bg-indigo-600 p-4">
                            <Text className="text-white text-lg font-bold">Terms & Conditions</Text>
                        </View>

                        <ScrollView className="max-h-80 p-4">
                            <Text className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                By using the Parent Dashboard, you agree to the following terms:
                                {'\n\n'}
                                1. You will only access information for your linked children.
                                {'\n\n'}
                                2. You will not share login credentials with unauthorized persons.
                                {'\n\n'}
                                3. You understand that financial transactions are subject to verification.
                                {'\n\n'}
                                4. You consent to receiving notifications about your children's academic progress.
                                {'\n\n'}
                                5. You agree to the school's privacy policy regarding data handling.
                            </Text>
                        </ScrollView>

                        <View className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <SovereignButton
                                variant="primary"
                                onPress={handleAcceptTerms}
                                disabled={acceptTerms.isPending}
                                className="w-full"
                            >
                                {acceptTerms.isPending ? 'Processing...' : 'I Accept the Terms'}
                            </SovereignButton>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};
