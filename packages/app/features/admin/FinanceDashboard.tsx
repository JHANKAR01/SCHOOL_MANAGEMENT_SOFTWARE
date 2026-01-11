import React, { useState } from 'react';
import { SchoolConfig } from '../../../../types';
import { generateUPILink } from '../../../api/src/upi-engine';
import { StatCard, PageHeader, SovereignButton, SovereignTable, SovereignBadge, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Wallet, AlertCircle, TrendingUp, CheckCircle, Plus, DollarSign, Download, CreditCard } from 'lucide-react';
import { useInteraction, Expense } from '../../provider/InteractionContext';
import { SOVEREIGN_GENESIS_DATA } from '../../../api/src/data/dummy-data';
import { ActionModal } from '../../components/ActionModal';

export const FinanceDashboard: React.FC<{ school: SchoolConfig, activeModule: string }> = ({ school, activeModule }) => {
  const { invoices, expenses, addInvoice, markInvoicePaid, addExpense } = useInteraction();

  // Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', amount: '', description: 'Tuition Fee', dueDate: '' });
  const [expenseForm, setExpenseForm] = useState<{ category: Expense['category'], amount: string, description: string }>({ category: 'UTILITY', amount: '', description: '' });
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE'>('CASH');

  // Calculated Stats
  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const cashOnHand = totalCollected - totalExpenses;

  const handleCreateInvoice = () => {
    if (!invoiceForm.studentId || !invoiceForm.amount) return alert("Required fields missing");
    addInvoice({
      studentId: invoiceForm.studentId,
      amount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowInvoiceModal(false);
    setInvoiceForm({ studentId: '', amount: '', description: 'Tuition Fee', dueDate: '' });
  };

  const openPaymentModal = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoiceId) return;
    markInvoicePaid(selectedInvoiceId, paymentMethod);
    setShowPaymentModal(false);
    setSelectedInvoiceId(null);
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) return alert("Required fields missing");
    addExpense({
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description
    });
    setShowExpenseModal(false);
    setExpenseForm({ category: 'UTILITY', amount: '', description: '' });
  };

  // Helper to get student name
  const getStudentName = (id: string) => SOVEREIGN_GENESIS_DATA.students.find(s => s.id === id)?.name || id;

  const invoiceColumns = [
    { header: "Inv ID", accessor: "id" },
    { header: "Student", accessor: (row: any) => <div className="font-bold text-gray-700">{getStudentName(row.studentId)}</div> },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: (row: any) => `₹${row.amount.toLocaleString()}` },
    { header: "Status", accessor: (row: any) => <SovereignBadge status={row.status === 'PAID' ? 'success' : 'warning'}>{row.status}</SovereignBadge> },
  ];

  const invoiceActions = (row: any) => (
    row.status === 'PENDING' ? (
      <SovereignButton variant="secondary" className="text-xs h-8" onClick={() => openPaymentModal(row.id)}>
        Record Pay
      </SovereignButton>
    ) : (
      <span className="text-xs text-gray-400 font-mono">REC-{row.id.split('-')[1]}</span>
    )
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="Finance Department" subtitle="Ledger & Collection Management" />

      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <StatCard title="Total Collected" value={`₹${(totalCollected / 100000).toFixed(2)}L`} trend={{ value: 12, isPositive: true }} icon={<Wallet className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Pending Dues" value={`₹${(totalPending / 100000).toFixed(2)}L`} trend={{ value: 5, isPositive: false }} icon={<AlertCircle className="w-5 h-5" />} />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Expenses" value={`₹${(totalExpenses / 100000).toFixed(2)}L`} icon={<TrendingUp className="w-5 h-5" />} subtitle="Total Outflow" />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard title="Cash on Hand" value={`₹${(cashOnHand / 100000).toFixed(2)}L`} icon={<CheckCircle className="w-5 h-5 text-green-600" />} />
        </Col>
      </Row>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex gap-4">
            <button className="text-sm font-bold text-indigo-700 border-b-2 border-indigo-700 pb-1">Invoices</button>
            <button className="text-sm font-bold text-gray-500 hover:text-gray-700 pb-1">Expenses</button>
          </div>
          <div className="flex gap-2">
            <SovereignButton variant="danger" onClick={() => setShowExpenseModal(true)} icon={<TrendingUp className="w-4 h-4" />}>Log Expense</SovereignButton>
            <SovereignButton onClick={() => setShowInvoiceModal(true)} icon={<Plus className="w-4 h-4" />}>Create Invoice</SovereignButton>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <SovereignTable data={invoices} columns={invoiceColumns} actions={invoiceActions} />
        </div>
      </div>

      {/* MODAL: Create Invoice */}
      <ActionModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Generate New Invoice"
        onConfirm={handleCreateInvoice}
        confirmLabel="Issue Invoice"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={invoiceForm.studentId}
              onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
            >
              <option value="">Select Student</option>
              {SOVEREIGN_GENESIS_DATA.students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
              ))}
            </select>
          </div>
          <SovereignInput label="Amount (₹)" type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
          <SovereignInput label="Description" value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
          <SovereignInput label="Due Date" type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
        </div>
      </ActionModal>

      {/* MODAL: Record Payment */}
      <ActionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Offline Payment"
        onConfirm={handleRecordPayment}
        confirmLabel="Mark as Paid"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
            Ensure cash/cheque is collected before confirming. This action updates the ledger immediately.
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 border p-3 rounded w-full cursor-pointer hover:bg-gray-50">
                <input type="radio" name="method" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                <DollarSign className="w-4 h-4 text-green-600" /> Cash
              </label>
              <label className="flex items-center gap-2 border p-3 rounded w-full cursor-pointer hover:bg-gray-50">
                <input type="radio" name="method" checked={paymentMethod === 'CHEQUE'} onChange={() => setPaymentMethod('CHEQUE')} />
                <CreditCard className="w-4 h-4 text-blue-600" /> Cheque / DD
              </label>
            </div>
          </div>
        </div>
      </ActionModal>

      {/* MODAL: Add Expense */}
      <ActionModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Log Operational Expense"
        onConfirm={handleAddExpense}
        confirmLabel="Add to Ledger"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={expenseForm.category}
              onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
            >
              <option value="UTILITY">Utility (Electricity/Water)</option>
              <option value="VENDOR">Vendor / Inventory</option>
              <option value="MAINTENANCE">Maintenance / Repairs</option>
              <option value="SALARY">Salary / Bonus</option>
            </select>
          </div>
          <SovereignInput label="Amount (₹)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <SovereignInput label="Description" placeholder="e.g. Generator Fuel" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
        </div>
      </ActionModal>

    </div>
  );
};