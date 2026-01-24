// packages/app/features/reception/NewVisitorModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, Camera, Printer, Check, User, Phone, Car, ArrowRight } from 'lucide-react';
import Webcam from 'react-webcam';
import { useReception } from '../../hooks/useOperations';
import { SovereignInput } from '../../components/SovereignComponents'; // Assuming this exists or I use standard input

interface NewVisitorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewVisitorModal: React.FC<NewVisitorModalProps> = ({ isOpen, onClose }) => {
    const { addVisitor, isAddingVisitor } = useReception();
    const webcamRef = useRef<Webcam>(null);
    const [step, setStep] = useState(1); // 1: Details, 2: Photo/Match, 3: Badge
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        purpose: 'Parent Meeting',
        vehicle_no: '',
        host_user_id: '', // TODO: Host search
        student_id: ''   // TODO: Student search
    });

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const handleSubmit = () => {
        addVisitor({
            name: form.name,
            purpose: form.purpose,
            phone: form.phone,
            vehicle_no: form.vehicle_no,
            photo_url: imgSrc || undefined,
            // Defaults
            student_id: form.student_id || undefined,
        });
        setStep(3); // Go to print badge step
    };

    const handlePrint = () => {
        alert("Sending to Printer (192.168.1.50:9100)...");
        onClose();
        setStep(1);
    };

    if (!isOpen) return null;

    return (
        <Modal animationType="slide" transparent={true} visible={isOpen} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <View className="p-4 border-b border-slate-200 dark:border-slate-800 flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <Text className="text-lg font-bold text-slate-800 dark:text-white">
                            {step === 1 ? 'New Visitor Check-In' : step === 2 ? 'Identity Verification' : 'Badge Generated'}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-slate-500" />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <ScrollView className="p-6">
                        {step === 1 && (
                            <View className="space-y-4">
                                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-1">Full Name</Text>
                                        <input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                            placeholder="Enter visitor name"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</Text>
                                        <input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                            placeholder="Mobile number"
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-1">Purpose</Text>
                                    <select
                                        value={form.purpose}
                                        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="Parent Meeting">Parent Meeting</option>
                                        <option value="Vendor Delivery">Vendor Delivery</option>
                                        <option value="Interview">Job Interview</option>
                                        <option value="Guest">Guest / Other</option>
                                    </select>
                                </View>

                                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-1">Host (Optional)</Text>
                                        <input
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white opacity-50"
                                            placeholder="Search staff... (Coming soon)"
                                            disabled
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle No (Optional)</Text>
                                        <input
                                            value={form.vehicle_no}
                                            onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                            placeholder="MH 12 AB 1234"
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {step === 2 && (
                            <View className="space-y-6">
                                <View className="flex-row justify-center gap-6">
                                    {/* Live Cam */}
                                    <View className="items-center">
                                        <Text className="text-xs font-bold text-slate-500 mb-2">LIVE CAMERA</Text>
                                        <View className="w-48 h-48 bg-black rounded-xl overflow-hidden relative">
                                            {!imgSrc ? (
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image source={{ uri: imgSrc }} className="w-full h-full" />
                                            )}
                                        </View>
                                        {!imgSrc ? (
                                            <TouchableOpacity onPress={capture} className="mt-3 bg-indigo-600 px-4 py-2 rounded-lg flex-row items-center gap-2">
                                                <Camera className="w-4 h-4 text-white" />
                                                <Text className="text-white font-medium text-sm">Capture</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={() => setImgSrc(null)} className="mt-3 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg">
                                                <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm">Retake</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Student Match (Mock) */}
                                    <View className="items-center opacity-50">
                                        <Text className="text-xs font-bold text-slate-500 mb-2">STUDENT RECORD</Text>
                                        <View className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                                            <User className="w-12 h-12 text-slate-300" />
                                            <Text className="text-xs text-slate-400 mt-2">No student linked</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <View className="items-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <Text className="text-xl font-bold text-slate-900 dark:text-white">Check-In Successful</Text>
                                <Text className="text-slate-500 mt-2 text-center max-w-xs">
                                    Visitor has been logged. Badge is ready for printing.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-row justify-end gap-3">
                        {step === 1 && (
                            <>
                                <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-lg border border-slate-200 bg-white">
                                    <Text className="text-slate-600">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setStep(2)} className="px-4 py-2 rounded-lg bg-indigo-600 flex-row items-center gap-2">
                                    <Text className="text-white font-bold">Next: Photos</Text>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </TouchableOpacity>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <TouchableOpacity onPress={() => setStep(1)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white">
                                    <Text className="text-slate-600">Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} className="px-4 py-2 rounded-lg bg-emerald-600 flex-row items-center gap-2">
                                    <Text className="text-white font-bold">Confirm Check-In</Text>
                                    <Check className="w-4 h-4 text-white" />
                                </TouchableOpacity>
                            </>
                        )}
                        {step === 3 && (
                            <TouchableOpacity onPress={handlePrint} className="px-6 py-2 rounded-lg bg-indigo-600 flex-row items-center gap-2">
                                <Printer className="w-4 h-4 text-white" />
                                <Text className="text-white font-bold">Print Badge & Close</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
