import { Employee, SalarySlip } from '../../../types';

/**
 * Sovereign Payroll Engine
 * Handles Indian statutory compliance (PF, ESI) and Leave adjustments locally.
 */

const PF_RATE = 0.12; // 12% of Basic
const ESI_RATE = 0.0075; // 0.75% of Gross (Employee Share)
const MONTH_DAYS = 30; // Standardized for simplicity, real logic uses actual month days

export function calculateMonthlySalary(
  employee: Employee,
  unpaidLeaves: number, // Days absent without pay
  month: string
): SalarySlip {
  
  // 1. Pro-Rata Calculation (Loss of Pay)
  const totalGross = employee.basicSalary + employee.allowances;
  const perDayPay = totalGross / MONTH_DAYS;
  const lopDeduction = perDayPay * unpaidLeaves;

  const earnedBasic = employee.basicSalary - ((employee.basicSalary / MONTH_DAYS) * unpaidLeaves);
  const earnedGross = totalGross - lopDeduction;

  // 2. Statutory Deductions
  let pfDeduction = 0;
  if (employee.pfEnabled) {
    // PF is capped at 15k Basic usually, but here simplified to 12% of Earned Basic
    pfDeduction = earnedBasic * PF_RATE;
  }

  let esiDeduction = 0;
  if (employee.esiEnabled && earnedGross < 21000) {
    // ESI applicable if Gross < 21k
    esiDeduction = earnedGross * ESI_RATE;
  }

  // 3. Professional Tax (Mock Slab)
  let ptDeduction = 0;
  if (earnedGross > 12000) ptDeduction = 200;

  const totalDeductions = pfDeduction + esiDeduction + lopDeduction + ptDeduction;

  return {
    employeeId: employee.id,
    month,
    totalDays: MONTH_DAYS,
    workingDays: MONTH_DAYS - unpaidLeaves,
    leaveDays: unpaidLeaves,
    basicPay: Math.round(earnedBasic),
    allowances: Math.round(employee.allowances), // Simplified: Allowances usually fully fixed unless LOP affects them heavily
    deductions: {
      pf: Math.round(pfDeduction),
      esi: Math.round(esiDeduction),
      lop: Math.round(lopDeduction),
      tax: Math.round(ptDeduction)
    },
    netSalary: Math.round(totalGross - totalDeductions)
  };
}

/**
 * Mock Biometric Agent Logic
 * This function simulates what runs on the local school Windows PC connected to Essl/Matrix device.
 */
export async function syncBiometricLogs(deviceIp: string, schoolId: string) {
  console.log(`[Biometric Agent] Connecting to device at ${deviceIp}...`);
  // Simulate fetching logs via UDP/TCP SDK
  const logs = [
    { empId: 'T001', time: '08:05:00', date: '2023-10-25' },
    { empId: 'T002', time: '08:15:00', date: '2023-10-25' }, // Late
  ];
  
  console.log(`[Biometric Agent] Pushing ${logs.length} records to Sovereign Cloud for School: ${schoolId}`);
  // In prod: await fetch('https://api.sovereign.school/biometric/sync', ...)
  return { success: true, syncedCount: logs.length };
}
