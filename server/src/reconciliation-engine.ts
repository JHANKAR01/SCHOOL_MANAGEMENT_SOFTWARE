import { Invoice, BankTransaction } from '../../../types';

// Mock Telegram Service (The "Free" Layer)
const TelegramBot = {
  sendMessage: (chatId: string, text: string) => {
    console.log(`[TELEGRAM MOCK] To: ${chatId} | Msg: ${text}`);
    // In prod: fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, ...)
  }
};

/**
 * Sovereign Reconciliation Engine
 * Matches messy bank statement rows with user-submitted UTRs.
 */
export class ReconciliationEngine {
  
  /**
   * Parses a raw CSV string from a Bank Statement (SBI/HDFC format).
   * This is a simplified parser.
   */
  static parseBankCSV(csvContent: string): BankTransaction[] {
    const lines = csvContent.split('\n');
    const transactions: BankTransaction[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      // Assuming generic format: Date, Description, RefNo, Debit, Credit, Balance
      // Adjust indices based on specific bank formats
      
      const description = cols[1]?.replace(/"/g, '') || '';
      const creditAmount = parseFloat(cols[4] || '0');
      
      // Extract UTR from Description if not in RefNo column
      // Common patterns: "UPI/123456789012/..." or "NEFT-1234..."
      const utrMatch = description.match(/(\d{12})/);
      const extractedUTR = utrMatch ? utrMatch[0] : (cols[2] || '');

      if (creditAmount > 0) {
        transactions.push({
          date: cols[0],
          description: description,
          amount: creditAmount,
          type: 'CR',
          refNo: extractedUTR
        });
      }
    }
    return transactions;
  }

  /**
   * The "Manual-Auto" Loop.
   * Matches User Claims (Invoice + UTR) against Validated Bank Rows.
   */
  static reconcile(
    bankRows: BankTransaction[], 
    pendingInvoices: Invoice[]
  ): { matched: Invoice[], unmatched: Invoice[] } {
    
    const matched: Invoice[] = [];
    const unmatched: Invoice[] = [];

    pendingInvoices.forEach(invoice => {
      if (!invoice.utr) {
        unmatched.push(invoice);
        return;
      }

      // 1. Exact Match on UTR
      const exactMatch = bankRows.find(
        row => row.refNo === invoice.utr && Math.abs(row.amount - invoice.amount) < 1.0 // Allow ₹1 tolerance
      );

      // 2. Fuzzy Match (If UTR entered by parent has a typo but description matches Name/Amount)
      // (Skipped for Tier 3 MVP - relying on UTR)

      if (exactMatch) {
        invoice.status = 'PAID';
        matched.push(invoice);
        
        // Trigger "Free" Notification
        // In prod, lookup parent Telegram Chat ID via studentId
        TelegramBot.sendMessage(
          `parent_${invoice.studentId}`, 
          `✅ Payment Received: ₹${invoice.amount}. Receipt generated for ${invoice.description}.`
        );
        
      } else {
        unmatched.push(invoice);
      }
    });

    return { matched, unmatched };
  }
}
