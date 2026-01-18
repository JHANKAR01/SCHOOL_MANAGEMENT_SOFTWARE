import React from 'react';
import { View, Text, SafeAreaView, Platform } from 'react-native';
import { AdmissionsDashboard } from '@/packages/app/features/admissions/AdmissionsDashboard';

export default function AdmissionsScreen() {
    // On native, show placeholder since AdmissionsDashboard uses HTML
    if (Platform.OS !== 'web') {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151', textAlign: 'center' }}>
                        Admissions Pipeline
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                        Please use the web portal for full Admissions access.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Web version - render full dashboard
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <AdmissionsDashboard />
        </SafeAreaView>
    );
}
