/**
 * Sovereign UPI Engine
 * Generates spec-compliant UPI Deep Links for Direct-to-Bank payments.
 * Eliminates Payment Gateway fees.
 */

interface UPIParams {
  payeeVPA: string;    // pa: Payee VPA
  payeeName: string;   // pn: Payee Name (School Name)
  amount: number;      // am: Transaction Amount
  transactionNote?: string; // tn: Note (e.g. "Inv #123")
  transactionRef?: string;  // tr: Transaction Ref ID (Invoice ID)
}

export function generateUPILink({
  payeeVPA,
  payeeName,
  amount,
  transactionNote = "School Fees",
  transactionRef
}: UPIParams): string {
  
  if (!payeeVPA || !payeeVPA.includes('@')) {
    throw new Error("Invalid UPI VPA provided.");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  // Sanitize inputs to prevent injection into URI
  const pa = encodeURIComponent(payeeVPA);
  const pn = encodeURIComponent(payeeName);
  // Ensure amount is formatted to 2 decimal places strictly
  const am = encodeURIComponent(amount.toFixed(2));
  const cu = "INR";
  const tn = encodeURIComponent(transactionNote.slice(0, 50)); // Limit note length
  
  // Base URI
  let uri = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;

  if (transactionRef) {
    const tr = encodeURIComponent(transactionRef);
    uri += `&tr=${tr}`;
  }

  // 'mc' (Merchant Code) can be added if the school has a specific MCC
  // uri += "&mc=8220"; // Educational Services

  return uri;
}

export function validateUPIResponse(responseText: string): boolean {
  // Basic check for success string from common apps (GPay, PhonePe)
  // Usually response is like: "txnId=...&responseCode=...&Status=SUCCESS"
  return /Status=SUCCESS/i.test(responseText) || /responseCode=00/i.test(responseText);
}
