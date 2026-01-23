// packages/app/features/parent/ParentFees.tsx
// Fees & Payments Center - Invoice list, UTR submission, payment history

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { Wallet, Receipt, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, QrCode, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { useChildInvoices, useChildTransactions, useUpiLink, useSubmitUTR, Invoice, Transaction } from '../../../hooks/useParentData';
import { SovereignBadge, SovereignButton, PageHeader, SovereignSkeleton } from '../../components/SovereignComponents';

interface Props {
    studentId: string | null;
}

type TabType = 'invoices' | 'history';

export const ParentFees: React.FC<Props> = ({ studentId }) => {
    const [activeTab, setActiveTab] = useState<TabType>('invoices');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = useChildInvoices(studentId);
    const { data: transactionsData, isLoading: transactionsLoading } = useChildTransactions(studentId);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return { status: 'success' as const, label: 'Paid' };
            case 'PARTIAL': return { status: 'warning' as const, label: 'Partial' };
            case 'OVERDUE': return { status: 'error' as const, label: 'Overdue' };
            case 'PENDING': return { status: 'warning' as const, label: 'Pending' };
            case 'VERIFIED': return { status: 'success' as const, label: 'Verified' };
            case 'REJECTED': return { status: 'error' as const, label: 'Rejected' };
            case 'UNDER_REVIEW': return { status: 'info' as const, label: 'Under Review' };
            default: return { status: 'neutral' as const, label: status };
        }
    };

    if (!studentId) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Please select a child to view fees
                </Text>
            </View>
        );
    }

    if (invoicesLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-40 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-40 w-full rounded-xl" />
            </View>
        );
    }

    const invoices = invoicesData?.data?.invoices || [];
    const summary = invoicesData?.data?.summary || { total_outstanding: 0, overdue_amount: 0 };
    const transactions = transactionsData?.data || [];

    return (
        <View className="flex-1">
            {/* Summary Header */}
            <View className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 mx-4 mt-4 rounded-xl">
                <Text className="text-white/80 text-sm font-medium mb-1">Total Outstanding</Text>
                <Text className="text-white text-3xl font-bold mb-4">
                    {formatCurrency(summary.total_outstanding)}
                </Text>
                {summary.overdue_amount > 0 && (
                    <View className="flex-row items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-300" />
                        <Text className="text-red-300 text-sm font-medium">
                            {formatCurrency(summary.overdue_amount)} Overdue
                        </Text>
                    </View>
                )}
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-slate-200 dark:border-slate-700 mx-4 mt-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('invoices')}
                    className={`px-6 py-3 border-b-2 ${activeTab === 'invoices'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                        }`}
                >
                    <Text className={`font-medium ${activeTab === 'invoices'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        Invoices
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`px-6 py-3 border-b-2 ${activeTab === 'history'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                        }`}
                >
                    <Text className={`font-medium ${activeTab === 'history'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        Payment History
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {activeTab === 'invoices' ? (
                    invoices.length === 0 ? (
                        <View className="items-center py-16">
                            <Receipt className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                            <Text className="text-slate-500 dark:text-slate-400">No invoices found</Text>
                        </View>
                    ) : (
                        invoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={invoice}
                                onPay={() => {
                                    setSelectedInvoice(invoice);
                                    setShowPaymentModal(true);
                                }}
                                formatCurrency={formatCurrency}
                            />
                        ))
                    )
                ) : (
                    transactionsLoading ? (
                        <SovereignSkeleton className="h-32 w-full rounded-xl" />
                    ) : transactions.length === 0 ? (
                        <View className="items-center py-16">
                            <Clock className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                            <Text className="text-slate-500 dark:text-slate-400">No payment history</Text>
                        </View>
                    ) : (
                        transactions.map((txn) => (
                            <TransactionCard
                                key={txn.id}
                                transaction={txn}
                                formatCurrency={formatCurrency}
                            />
                        ))
                    )
                )}
            </ScrollView>

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <PaymentModal
                    invoice={selectedInvoice}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedInvoice(null);
                    }}
                    onSuccess={() => {
                        setShowPaymentModal(false);
                        setSelectedInvoice(null);
                        refetchInvoices();
                    }}
                    formatCurrency={formatCurrency}
                />
            )}
        </View>
    );
};

// Invoice Card Component
const InvoiceCard: React.FC<{
    invoice: Invoice;
    onPay: () => void;
    formatCurrency: (amount: number) => string;
}> = ({ invoice, onPay, formatCurrency }) => {
    const [expanded, setExpanded] = useState(false);
    const statusBadge = getInvoiceStatusBadge(invoice.status);

    return (
        <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden">
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                className="p-4"
            >
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">
                            {invoice.description || 'Fee Invoice'}
                        </Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400">
                            {invoice.academic_year}
                        </Text>
                    </View>
                    <SovereignBadge status={statusBadge.status}>
                        {statusBadge.label}
                    </SovereignBadge>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                    <View>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">Balance Due</Text>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(invoice.balance_amount)}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <Text className="text-sm text-slate-500 dark:text-slate-400">
                            Due: {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </View>

                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 mt-2 self-center" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 mt-2 self-center" />
                )}
            </TouchableOpacity>

            {expanded && (
                <View className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                    {/* Fee Breakdown */}
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Fee Breakdown
                    </Text>
                    {invoice.items.map((item, idx) => (
                        <View key={idx} className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <Text className="text-sm text-slate-600 dark:text-slate-400">{item.title}</Text>
                            <Text className="text-sm font-medium text-slate-900 dark:text-white">
                                {formatCurrency(item.amount)}
                            </Text>
                        </View>
                    ))}

                    {/* Totals */}
                    <View className="mt-3 space-y-1">
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-slate-500">Total</Text>
                            <Text className="text-sm text-slate-900 dark:text-white">
                                {formatCurrency(invoice.total_amount)}
                            </Text>
                        </View>
                        {invoice.discount_amount > 0 && (
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-green-600">Discount</Text>
                                <Text className="text-sm text-green-600">
                                    -{formatCurrency(invoice.discount_amount)}
                                </Text>
                            </View>
                        )}
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-slate-500">Paid</Text>
                            <Text className="text-sm text-slate-900 dark:text-white">
                                {formatCurrency(invoice.amount_paid)}
                            </Text>
                        </View>
                    </View>

                    {/* Pay Button */}
                    {invoice.balance_amount > 0 && (
                        <SovereignButton
                            variant="primary"
                            className="mt-4 w-full"
                            onPress={onPay}
                        >
                            Pay {formatCurrency(invoice.balance_amount)}
                        </SovereignButton>
                    )}
                </View>
            )}
        </View>
    );
};

// Transaction Card Component
const TransactionCard: React.FC<{
    transaction: Transaction;
    formatCurrency: (amount: number) => string;
}> = ({ transaction, formatCurrency }) => {
    const statusBadge = getTransactionStatusBadge(transaction.status);

    const getStatusIcon = () => {
        switch (transaction.status) {
            case 'VERIFIED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'PENDING':
            case 'UNDER_REVIEW': return <Clock className="w-5 h-5 text-amber-500" />;
            default: return <CreditCard className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
            <View className="flex-row items-start gap-3">
                {getStatusIcon()}
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(transaction.amount)}
                        </Text>
                        <SovereignBadge status={statusBadge.status}>
                            {statusBadge.label}
                        </SovereignBadge>
                    </View>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {transaction.invoice_description || 'Payment'}
                    </Text>
                    <View className="flex-row flex-wrap gap-3 text-xs">
                        <Text className="text-slate-500 dark:text-slate-400">
                            {transaction.mode} • {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </Text>
                        {transaction.reference_no && (
                            <Text className="text-slate-600 dark:text-slate-300">
                                UTR: {transaction.reference_no}
                            </Text>
                        )}
                    </View>
                    {transaction.verification_note && (
                        <Text className="text-sm text-red-500 mt-2">
                            Note: {transaction.verification_note}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};

// Payment Modal Component
const PaymentModal: React.FC<{
    invoice: Invoice;
    onClose: () => void;
    onSuccess: () => void;
    formatCurrency: (amount: number) => string;
}> = ({ invoice, onClose, onSuccess, formatCurrency }) => {
    const [step, setStep] = useState<'choose' | 'utr'>('choose');
    const [utr, setUtr] = useState('');
    const [amount, setAmount] = useState(invoice.balance_amount.toString());
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
    const [error, setError] = useState('');

    const { data: upiData, isLoading: upiLoading } = useUpiLink(invoice.id);
    const submitUTR = useSubmitUTR();

    const handleOpenUpi = () => {
        if (upiData?.data?.upi_link) {
            Linking.openURL(upiData.data.upi_link).catch(() => {
                setError('Could not open UPI app. Please pay manually and enter UTR.');
            });
            setStep('utr');
        }
    };

    const handleSubmitUTR = async () => {
        setError('');

        // Validate UTR
        if (!utr || utr.length < 12 || utr.length > 22) {
            setError('UTR must be 12-22 characters');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0 || amountNum > invoice.balance_amount) {
            setError(`Amount must be between ₹1 and ${formatCurrency(invoice.balance_amount)}`);
            return;
        }

        try {
            await submitUTR.mutateAsync({
                invoiceId: invoice.id,
                utr,
                amount: amountNum,
                payment_method: paymentMethod,
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to submit payment');
        }
    };

    return (
        <View className="absolute inset-0 bg-black/50 items-center justify-center p-4">
            <View className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <View className="bg-indigo-600 p-4">
                    <Text className="text-white text-lg font-bold">Pay Fee</Text>
                    <Text className="text-white/80 text-sm">
                        {invoice.description || 'Invoice'} • {formatCurrency(invoice.balance_amount)}
                    </Text>
                </View>

                <View className="p-4">
                    {step === 'choose' ? (
                        <>
                            {/* UPI Payment Option */}
                            <TouchableOpacity
                                onPress={handleOpenUpi}
                                disabled={upiLoading}
                                className="flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl mb-3 active:opacity-80"
                            >
                                <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-900 dark:text-white">Pay via UPI</Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                                        Google Pay, PhonePe, Paytm, etc.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* QR Code Option */}
                            {upiData?.data?.qr_data && (
                                <View className="items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl mb-3">
                                    <QrCode className="w-8 h-8 text-slate-600 dark:text-slate-300 mb-2" />
                                    <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        Scan QR code to pay
                                    </Text>
                                    {/* Note: Actual QR code would be rendered here using a QR library */}
                                    <View className="w-32 h-32 bg-white border border-slate-200 rounded-lg mt-2 items-center justify-center">
                                        <Text className="text-xs text-slate-400">QR Code</Text>
                                    </View>
                                </View>
                            )}

                            {/* Already Paid Option */}
                            <TouchableOpacity
                                onPress={() => setStep('utr')}
                                className="flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl active:opacity-80"
                            >
                                <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center">
                                    <Upload className="w-6 h-6 text-amber-600" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-900 dark:text-white">Already Paid?</Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                                        Submit UTR / Transaction ID
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* UTR Entry Form */}
                            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Payment Method
                            </Text>
                            <View className="flex-row gap-2 mb-4">
                                {(['UPI', 'BANK_TRANSFER'] as const).map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        onPress={() => setPaymentMethod(method)}
                                        className={`flex-1 py-2 px-4 rounded-lg border ${paymentMethod === method
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500'
                                            : 'border-slate-200 dark:border-slate-600'
                                            }`}
                                    >
                                        <Text className={`text-center font-medium ${paymentMethod === method
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {method === 'UPI' ? 'UPI' : 'Bank Transfer'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Amount Paid
                            </Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder={`Max: ${invoice.balance_amount}`}
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white mb-4"
                            />

                            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                UTR / Transaction ID
                            </Text>
                            <TextInput
                                value={utr}
                                onChangeText={(text) => setUtr(text.toUpperCase())}
                                placeholder="Enter 12-22 character UTR"
                                autoCapitalize="characters"
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white mb-4"
                            />

                            {error && (
                                <Text className="text-red-500 text-sm mb-4">{error}</Text>
                            )}

                            <SovereignButton
                                variant="primary"
                                onPress={handleSubmitUTR}
                                disabled={submitUTR.isPending}
                                className="w-full"
                            >
                                {submitUTR.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    'Submit Payment'
                                )}
                            </SovereignButton>
                        </>
                    )}
                </View>

                {/* Footer */}
                <View className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-center text-slate-500 dark:text-slate-400 font-medium">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// Helper functions
function getInvoiceStatusBadge(status: string) {
    switch (status) {
        case 'PAID': return { status: 'success' as const, label: 'Paid' };
        case 'PARTIAL': return { status: 'warning' as const, label: 'Partial' };
        case 'OVERDUE': return { status: 'error' as const, label: 'Overdue' };
        case 'PENDING': return { status: 'warning' as const, label: 'Pending' };
        case 'DRAFT': return { status: 'neutral' as const, label: 'Draft' };
        default: return { status: 'neutral' as const, label: status };
    }
}

function getTransactionStatusBadge(status: string) {
    switch (status) {
        case 'VERIFIED': return { status: 'success' as const, label: 'Verified' };
        case 'REJECTED': return { status: 'error' as const, label: 'Rejected' };
        case 'PENDING': return { status: 'warning' as const, label: 'Pending' };
        case 'UNDER_REVIEW': return { status: 'info' as const, label: 'Under Review' };
        default: return { status: 'neutral' as const, label: status };
    }
}
