// packages/types/finance.ts
// Finance and HR types

import { UserRole } from './user';

export interface Invoice {
    id: string;
    studentId: string;
    amount: number;
    description: string;
    dueDate: string;
    status: 'PENDING' | 'VERIFIED' | 'PAID';
    utr?: string;
}

export interface BankTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'CR' | 'DR';
    refNo: string;
}

export interface Employee {
    id: string;
    name: string;
    role: UserRole;
    basicSalary: number;
    allowances: number;
    pfEnabled: boolean;
    esiEnabled: boolean;
}

export interface SalarySlip {
    employeeId: string;
    month: string;
    totalDays: number;
    workingDays: number;
    leaveDays: number;
    basicPay: number;
    allowances: number;
    deductions: {
        pf: number;
        esi: number;
        lop: number;
        tax: number;
    };
    netSalary: number;
}
