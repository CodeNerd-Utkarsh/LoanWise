
export interface AmortizationEntry {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

/**
 * Calculates the Equated Monthly Installment (EMI) for a loan.
 * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (Annual rate / 12 / 100)
 * n = Loan tenure in months
 *
 * @param principal The principal loan amount.
 * @param annualRate The annual interest rate (in percentage, e.g., 5 for 5%).
 * @param durationMonths The loan duration in months.
 * @returns The calculated EMI amount, or NaN if inputs are invalid.
 */
export function calculateEMI(principal: number, annualRate: number, durationMonths: number): number {
  if (principal <= 0 || annualRate < 0 || durationMonths <= 0) {
    return NaN; // Invalid input
  }

  if (annualRate === 0) {
    return principal / durationMonths; // Simple division for 0% interest
  }

  const monthlyRate = annualRate / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
  const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;

  if (denominator === 0) {
      // This case might happen for very small rates or durations, treat as edge case.
      // Or could indicate an issue with floating point precision for specific inputs.
      // A simple approximation or handling might be needed depending on requirements.
      // For simplicity, returning an approximation or indicating an issue.
      // Let's return the principal divided by duration as a fallback, though not strictly EMI formula based.
      // A more robust solution might involve checking inputs more rigorously or using BigNumber libraries.
      console.warn("Denominator is zero in EMI calculation, potentially due to input values or precision issues.");
      return principal / durationMonths;
  }


  const emi = numerator / denominator;
  return emi;
}


/**
 * Generates the amortization schedule for a loan.
 *
 * @param principal The principal loan amount.
 * @param annualRate The annual interest rate (in percentage).
 * @param durationMonths The loan duration in months.
 * @returns An array of AmortizationEntry objects representing the schedule. Returns empty array if EMI is NaN.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  durationMonths: number
): AmortizationEntry[] {
  const emi = calculateEMI(principal, annualRate, durationMonths);
  if (isNaN(emi) || !isFinite(emi)) {
    return []; // Return empty if EMI calculation failed
  }

  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= durationMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = emi - interestPayment;

    // Adjust last payment to ensure remaining balance is exactly 0
    if (month === durationMonths) {
        principalPayment = remainingBalance; // Pay off the exact remaining balance
         const adjustedEMI = principalPayment + interestPayment; // Recalculate EMI for the last month
          remainingBalance = 0;
         schedule.push({
             month,
             principalPayment: principalPayment,
             interestPayment: interestPayment,
             totalPayment: adjustedEMI, // Use adjusted EMI for last month
             remainingBalance: remainingBalance,
         });

    } else {
         remainingBalance -= principalPayment;
         // Prevent remaining balance from going negative due to floating point inaccuracies
         if (remainingBalance < 0) remainingBalance = 0;

         schedule.push({
           month,
           principalPayment: principalPayment,
           interestPayment: interestPayment,
           totalPayment: emi,
           remainingBalance: remainingBalance,
         });
    }
  }

  return schedule;
}

// Helper to format currency consistently
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "N/A";
  }
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD', // Defaulting to USD, could be made dynamic
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
