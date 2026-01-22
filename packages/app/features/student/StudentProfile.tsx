// packages/app/features/student/StudentProfile.tsx
import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useStudentProfile } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignButton } from '../../components/SovereignComponents';
import { User, Phone, Mail, MapPin, School, Book, Calendar } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

const ProfileItem = ({ icon: Icon, label, value }: any) => (
    <View className="flex-row items-center py-3 border-b border-gray-100 last:border-0">
        <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
            <Icon className="w-4 h-4 text-gray-500" />
        </View>
        <View className="flex-1">
            <Text className="text-xs text-gray-400">{label}</Text>
            <Text className="text-sm font-medium text-gray-900">{value || '-'}</Text>
        </View>
    </View>
);

export const StudentProfile = () => {
    const { t } = useTranslation();
    const { data: profile, isLoading } = useStudentProfile();

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50">
                <PageHeader title={t('profile')} subtitle="Personal Details" />
                <View className="items-center mb-8">
                    <SovereignSkeleton className="w-24 h-24 rounded-full mb-4" />
                    <SovereignSkeleton className="w-48 h-6 rounded-lg" />
                </View>
                <SovereignSkeleton className="h-64 w-full rounded-xl" />
            </View>
        );
    }

    if (!profile) return null;

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200">
                <PageHeader title={t('profile')} subtitle="Personal Details" />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Profile Header Card */}
                <View className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-4 items-center relative overflow-hidden">
                    <View className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />

                    <View className="mt-8 mb-4 relative">
                        <View className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                            {profile.photo_url ? (
                                <Image source={{ uri: profile.photo_url }} className="w-full h-full" />
                            ) : (
                                <View className="w-full h-full bg-indigo-100 items-center justify-center">
                                    <User className="w-10 h-10 text-indigo-400" />
                                </View>
                            )}
                        </View>
                    </View>

                    <Text className="text-xl font-bold text-gray-900">{profile.name}</Text>
                    <Text className="text-indigo-600 font-medium mb-1">
                        Class {profile.current_class?.grade || '-'} {profile.current_class?.section || ''}
                    </Text>
                    <Text className="text-gray-400 text-sm">Roll No: {profile.current_class?.roll_number || '-'}</Text>
                </View>

                {/* Details Section */}
                <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <Text className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Academic Info</Text>
                    <ProfileItem icon={School} label="Admission No" value={profile.admission_no} />
                    <ProfileItem icon={Book} label="Section" value={profile.current_class?.section} />
                    <ProfileItem icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '-'} />
                </View>

                <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm pb-8">
                    <Text className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Contact Info</Text>
                    <ProfileItem icon={Mail} label="Email" value={profile.email} />
                    <ProfileItem icon={Phone} label="Phone" value={profile.phone} />
                    <ProfileItem icon={MapPin} label="Address" value={`${profile.address?.line1 || ''} ${profile.address?.city || ''}`} />
                    <ProfileItem icon={User} label="Parent/Guardian" value={profile.father_name || profile.mother_name || '-'} />
                </View>
            </ScrollView>
        </View>
    );
};
