import { AdmissionsDashboard } from 'app/features/admissions/AdmissionsDashboard';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdmissionsScreen() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Admissions Pipeline' }} />
            <AdmissionsDashboard />
        </SafeAreaView>
    );
}
