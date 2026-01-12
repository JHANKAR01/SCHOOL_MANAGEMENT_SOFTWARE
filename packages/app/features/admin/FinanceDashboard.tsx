
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchoolConfig } from '../../../../types';
import { StatCard, PageHeader, SovereignButton, SovereignBadge, SovereignInput } from '../../components/SovereignComponents';
import { Row, Col } from '../../components/Layout';
import { Wallet, AlertCircle, TrendingUp, CheckCircle, Plus, DollarSign, CreditCard, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionModal } from '../../components/ActionModal';

// ============================================================================
// TYPES
// ============================================================================

interface FinanceStats {
  totalCollected: number;
  totalPending: number;
  totalExpenses: number;
  cashOnHand: number;
}

interface Invoice {
  id: number;
  student_id: string;
  base_amount: number;
  discount_amount: number;
  description: string;
  due_date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  student?: {
    id: string;
    name: string;
    admission_no: string;
  };
}

interface StudentOption {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  roll: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedInvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination: Pagination;
}

// ============================================================================
// API CONFIG
// ============================================================================

const API_BASE = typeof window !== 'undefined'
  ? (window as any).__API_URL__ || 'http://localhost:3001'
  : 'http://localhost:3001';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchStats(): Promise<FinanceStats> {
  const res = await fetch(`${API_BASE}/api/finance/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.stats;
}

async function fetchInvoices(page: number, limit: number): Promise<PaginatedInvoicesResponse> {
  const res = await fetch(`${API_BASE}/api/finance/invoices?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

async function fetchStudents(search?: string): Promise<StudentOption[]> {
  const url = search
    ? `${API_BASE}/api/finance/students?search=${encodeURIComponent(search)}`
    : `${API_BASE}/api/finance/students`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch students');
  const data = await res.json();
  return data.students;
}

async function createInvoice(invoice: { studentId: string; baseAmount: number; description: string; dueDate: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/finance/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoice)
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

async function markInvoicePaid(id: number, method: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/finance/invoices/${id}/pay`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ method })
  });
  if (!res.ok) throw new Error('Failed to mark invoice as paid');
  return res.json();
}

async function createExpense(expense: { category: string; amount: number; description: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/finance/expenses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...expense, date: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationBarProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ pagination, onPageChange, isLoading }) => {
  const { page, totalPages, total, hasNext, hasPrev } = pagination;

  // Generate visible page numbers
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages if few
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        end = Math.min(totalPages - 1, maxVisible - 1);
      } else if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 2);
      }

      // Add ellipsis if needed before range
      if (start > 2) pages.push('...');

      // Add range
      for (let i = start; i <= end; i++) pages.push(i);

      // Add ellipsis if needed after range
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
        <span className="text-gray-400 ml-2">({total} total records)</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || isLoading}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((p, idx) => (
          typeof p === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${p === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                } disabled:opacity-50`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-gray-400">...</span>
          )
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || isLoading}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FinanceDashboard: React.FC<{ school: SchoolConfig; activeModule: string }> = ({ school }) => {
  const queryClient = useQueryClient();

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  // Form States
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', amount: '', description: 'Tuition Fee', dueDate: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'UTILITY', amount: '', description: '' });
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE' | 'ONLINE'>('CASH');

  // =========================================================================
  // QUERIES
  // =========================================================================

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: fetchStats,
    staleTime: 30000 // 30 seconds
  });

  const { data: invoicesData, isLoading: invoicesLoading, isFetching } = useQuery({
    queryKey: ['finance-invoices', page, limit],
    queryFn: () => fetchInvoices(page, limit),
    staleTime: 10000
  });

  const { data: students } = useQuery({
    queryKey: ['finance-students'],
    queryFn: () => fetchStudents(),
    staleTime: 60000 // 1 minute
  });

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      setShowInvoiceModal(false);
      setInvoiceForm({ studentId: '', amount: '', description: 'Tuition Fee', dueDate: '' });
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, method }: { id: number; method: string }) => markInvoicePaid(id, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      setShowPaymentModal(false);
      setSelectedInvoiceId(null);
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      setShowExpenseModal(false);
      setExpenseForm({ category: 'UTILITY', amount: '', description: '' });
    }
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleCreateInvoice = () => {
    if (!invoiceForm.studentId || !invoiceForm.amount) return alert("Required fields missing");
    createInvoiceMutation.mutate({
      studentId: invoiceForm.studentId,
      baseAmount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleRecordPayment = () => {
    if (!selectedInvoiceId) return;
    markPaidMutation.mutate({ id: selectedInvoiceId, method: paymentMethod });
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) return alert("Required fields missing");
    createExpenseMutation.mutate({
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description
    });
  };

  const openPaymentModal = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setShowPaymentModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format currency
  const formatCurrency = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="Finance Department" subtitle="Ledger & Collection Management" />

      {/* Stats Cards */}
      <Row className="mb-8">
        <Col className="w-full md:w-1/4">
          <StatCard
            title="Total Collected"
            value={statsLoading ? '...' : formatCurrency(stats?.totalCollected || 0)}
            trend={{ value: 12, isPositive: true }}
            icon={<Wallet className="w-5 h-5" />}
          />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard
            title="Pending Dues"
            value={statsLoading ? '...' : formatCurrency(stats?.totalPending || 0)}
            trend={{ value: 5, isPositive: false }}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard
            title="Expenses"
            value={statsLoading ? '...' : formatCurrency(stats?.totalExpenses || 0)}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="Total Outflow"
          />
        </Col>
        <Col className="w-full md:w-1/4">
          <StatCard
            title="Cash on Hand"
            value={statsLoading ? '...' : formatCurrency(stats?.cashOnHand || 0)}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          />
        </Col>
      </Row>

      {/* Action Bar */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex gap-4">
            <button className="text-sm font-bold text-indigo-700 border-b-2 border-indigo-700 pb-1">Invoices</button>
            <button className="text-sm font-bold text-gray-500 hover:text-gray-700 pb-1">Expenses</button>
          </div>
          <div className="flex gap-2">
            <SovereignButton variant="danger" onClick={() => setShowExpenseModal(true)} icon={<TrendingUp className="w-4 h-4" />}>
              Log Expense
            </SovereignButton>
            <SovereignButton onClick={() => setShowInvoiceModal(true)} icon={<Plus className="w-4 h-4" />}>
              Create Invoice
            </SovereignButton>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {invoicesLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading invoices...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b">
                    <tr>
                      <th className="px-6 py-4 text-left">Inv #</th>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoicesData?.data?.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">INV-{invoice.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800">{invoice.student?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{invoice.student?.admission_no}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{invoice.description}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          ₹{(invoice.base_amount - invoice.discount_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <SovereignBadge status={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'error' : 'warning'}>
                            {invoice.status}
                          </SovereignBadge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {invoice.status === 'PENDING' ? (
                            <SovereignButton
                              variant="secondary"
                              className="text-xs h-8"
                              onClick={() => openPaymentModal(invoice.id)}
                            >
                              Record Pay
                            </SovereignButton>
                          ) : (
                            <span className="text-xs text-gray-400">Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {invoicesData?.data?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No invoices found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {invoicesData?.pagination && invoicesData.pagination.totalPages > 1 && (
                <PaginationBar
                  pagination={invoicesData.pagination}
                  onPageChange={handlePageChange}
                  isLoading={isFetching}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: Create Invoice */}
      <ActionModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Generate New Invoice"
        onConfirm={handleCreateInvoice}
        confirmLabel={createInvoiceMutation.isPending ? 'Creating...' : 'Issue Invoice'}
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
              {students?.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class}) - {s.admissionNo}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Showing first 100 students. Use search for more.</p>
          </div>
          <SovereignInput
            label="Amount (₹)"
            type="number"
            value={invoiceForm.amount}
            onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
          />
          <SovereignInput
            label="Description"
            value={invoiceForm.description}
            onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
          />
          <SovereignInput
            label="Due Date"
            type="date"
            value={invoiceForm.dueDate}
            onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
          />
        </div>
      </ActionModal>

      {/* MODAL: Record Payment */}
      <ActionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Offline Payment"
        onConfirm={handleRecordPayment}
        confirmLabel={markPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
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
        confirmLabel={createExpenseMutation.isPending ? 'Creating...' : 'Add to Ledger'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={expenseForm.category}
              onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              <option value="UTILITY">Utility (Electricity/Water)</option>
              <option value="VENDOR">Vendor / Inventory</option>
              <option value="MAINTENANCE">Maintenance / Repairs</option>
              <option value="SALARY">Salary / Bonus</option>
            </select>
          </div>
          <SovereignInput
            label="Amount (₹)"
            type="number"
            value={expenseForm.amount}
            onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <SovereignInput
            label="Description"
            placeholder="e.g. Generator Fuel"
            value={expenseForm.description}
            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
        </div>
      </ActionModal>
    </div>
  );
};