import React, { useState } from 'react';
import { generateUPILink } from '../../../../packages/api/src/upi-engine';
import { useInteraction } from '../../../../packages/app/provider/InteractionContext';

const SCHOOL_VPA = "greenwood.high@oksbi";
const SCHOOL_NAME = "Greenwood High School";

export default function ParentPayments() {
  const { invoices } = useInteraction();
  
  // Find pending invoice for the mock student 'std_1'
  // In a real app, this would filter by the logged-in user's student ID
  const pendingInvoice = invoices.find(inv => inv.studentId === 'std_1' && inv.status === 'PENDING');
  
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fallback if no dues
  if (!pendingInvoice) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🎉</div>
        <h3 className="font-bold text-green-800">No Dues Pending!</h3>
        <p className="text-sm text-green-600">You are all caught up.</p>
      </div>
    );
  }

  const upiLink = generateUPILink({
    payeeVPA: SCHOOL_VPA,
    payeeName: SCHOOL_NAME,
    amount: pendingInvoice.amount,
    transactionNote: `Fees ${pendingInvoice.description}`,
    transactionRef: pendingInvoice.id
  });

  const handlePayClick = () => {
    // Platform agnostic open
    if (typeof window !== 'undefined') {
      window.open(upiLink, '_blank');
    }
  };

  const handleSubmitUTR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (utr.length !== 12) {
      alert("Please enter a valid 12-digit UTR/Reference ID from your UPI App.");
      return;
    }

    setSubmitting(true);
    // Simulate API Call to submit UTR
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received</h2>
          <p className="text-gray-600 mb-6">
            We have received UTR <span className="font-mono font-bold">{utr}</span> for Invoice #{pendingInvoice.id}.
            <br/>
            Receipt will be generated after reconciliation (approx. 24hrs).
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-lg overflow-hidden md:rounded-xl">
        {/* Header */}
        <div className="bg-indigo-900 p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Outstanding Fees</p>
            <h1 className="text-4xl font-black mt-2">₹{pendingInvoice.amount.toLocaleString()}</h1>
            <p className="text-sm opacity-80 mt-2">{pendingInvoice.description} • Due: {pendingInvoice.dueDate}</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="p-6 space-y-8">
          {/* Step 1: Pay */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-bold text-gray-800">Make Payment</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
              <button 
                onClick={handlePayClick}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Pay via UPI App
              </button>
              <p className="text-[10px] text-gray-500 mt-3 font-medium">
                Works with GPay, PhonePe, Paytm, BHIM
              </p>
            </div>
          </div>

          {/* Step 2: Verify */}
          <div className="border-t border-gray-100 pt-8">
             <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="font-bold text-gray-800">Confirm Payment</h3>
            </div>

            <form onSubmit={handleSubmitUTR} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    12-Digit UTR / Transaction ID
                </label>
                <input 
                    type="text" 
                    placeholder="e.g. 324512345678"
                    maxLength={12}
                    minLength={12}
                    pattern="\d*"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g,''))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || utr.length !== 12}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-800 transition-all"
              >
                {submitting ? 'Verifying...' : 'Submit UTR for Reconciliation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}