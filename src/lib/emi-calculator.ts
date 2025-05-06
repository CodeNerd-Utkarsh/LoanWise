
export interface AmortizationEntry {
  month: number;
  principalPayment: number; // Always in base currency (e.g., USD)
  interestPayment: number; // Always in base currency
  totalPayment: number; // Always in base currency
  remainingBalance: number; // Always in base currency
}

/**
 * Calculates the Equated Monthly Installment (EMI) for a loan in the base currency.
 * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where:
 * P = Principal loan amount (in base currency)
 * r = Monthly interest rate (Annual rate / 12 / 100)
 * n = Loan tenure in months
 *
 * @param principal The principal loan amount in the base currency.
 * @param annualRate The annual interest rate (in percentage, e.g., 5 for 5%).
 * @param durationMonths The loan duration in months.
 * @returns The calculated EMI amount in the base currency, or NaN if inputs are invalid.
 */
export function calculateEMI(principal: number, annualRate: number, durationMonths: number): number {
  if (principal <= 0 || annualRate < 0 || durationMonths <= 0 || !isFinite(principal) || !isFinite(annualRate) || !isFinite(durationMonths)) {
    return NaN; // Invalid input
  }

  if (annualRate === 0) {
    // Ensure duration is not zero to avoid division by zero
     if (durationMonths === 0) return NaN;
    return principal / durationMonths; // Simple division for 0% interest
  }

  const monthlyRate = annualRate / 12 / 100;
   // Check for potential issues with Math.pow for very large durationMonths
   if (!isFinite(Math.pow(1 + monthlyRate, durationMonths))) {
       console.warn("Calculation involves potentially non-finite numbers. Check input ranges.");
       return NaN;
   }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
  const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;

  if (denominator === 0) {
      console.warn("Denominator is zero in EMI calculation.");
       // For non-zero rate, this is unlikely unless duration is 0, handled above.
       // If it still occurs, could be precision issue. Returning NaN.
       return NaN;
  }


  const emi = numerator / denominator;
   // Final check if EMI calculation results in a valid number
   if (!isFinite(emi)) {
        console.warn("EMI calculation resulted in a non-finite number.");
        return NaN;
    }
  return emi;
}


/**
 * Generates the amortization schedule for a loan. All monetary values are in the base currency.
 *
 * @param principal The principal loan amount in the base currency.
 * @param annualRate The annual interest rate (in percentage).
 * @param durationMonths The loan duration in months.
 * @returns An array of AmortizationEntry objects representing the schedule (values in base currency). Returns empty array if EMI is NaN.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  durationMonths: number
): AmortizationEntry[] {
  const emi = calculateEMI(principal, annualRate, durationMonths);
  // Check if EMI is not a valid number or principal is invalid
   if (isNaN(emi) || !isFinite(emi) || principal <= 0 || !isFinite(principal) || durationMonths <= 0) {
     console.log("Invalid input for schedule generation:", { principal, annualRate, durationMonths, emi });
    return []; // Return empty if EMI calculation failed or inputs invalid
  }

  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;
  const monthlyRate = annualRate === 0 ? 0 : annualRate / 12 / 100; // Handle 0% rate


  for (let month = 1; month <= durationMonths; month++) {
    // Ensure calculations are valid even with 0 rate
    const interestPayment = monthlyRate === 0 ? 0 : remainingBalance * monthlyRate;
     let principalPayment = emi - interestPayment;
     let currentTotalPayment = emi;

    // Ensure values are numbers before pushing
    if (!isFinite(interestPayment) || !isFinite(principalPayment)) {
        console.error(`Calculation error in month ${month}: Interest=${interestPayment}, Principal=${principalPayment}`);
        // Handle error, maybe stop schedule generation or push error state?
        return schedule; // Stop generation if calculation fails
    }


    // Adjust last payment to ensure remaining balance is exactly 0
    if (month === durationMonths) {
        // If remaining balance is slightly off due to precision, adjust principal
         if (Math.abs(remainingBalance - principalPayment) > 0.01) { // Allow small tolerance
            principalPayment = remainingBalance;
        }
        currentTotalPayment = principalPayment + interestPayment; // Recalculate total payment for the last month
        remainingBalance = 0;


    } else {
         remainingBalance -= principalPayment;
         // Prevent remaining balance from going significantly negative due to floating point inaccuracies
          if (remainingBalance < -0.01) { // Use a small tolerance
             console.warn(`Negative balance detected month ${month}: ${remainingBalance}. Adjusting.`);
             // Adjust principal payment for this month to avoid negative balance
             principalPayment = remainingBalance + principalPayment; // Original principal payment was too high
             currentTotalPayment = principalPayment + interestPayment;
             remainingBalance = 0; // Set balance to 0
         } else if (remainingBalance < 0) {
             remainingBalance = 0; // Set small negatives to zero
         }
    }

     // Final check before pushing
     if (!isFinite(principalPayment) || !isFinite(interestPayment) || !isFinite(currentTotalPayment) || !isFinite(remainingBalance)) {
         console.error(`Non-finite value detected before push in month ${month}`);
         return schedule; // Stop if any value becomes non-finite
     }

     schedule.push({
       month,
       principalPayment: principalPayment,
       interestPayment: interestPayment,
       totalPayment: currentTotalPayment,
       remainingBalance: remainingBalance,
     });


      // Safety break if balance somehow goes way off (shouldn't happen with checks)
       if (remainingBalance < -1) {
            console.error(`Significant negative balance error in month ${month}. Stopping.`);
            break;
        }
  }

  return schedule;
}

// formatCurrency function is removed from here and added to src/lib/currency-utils.ts
