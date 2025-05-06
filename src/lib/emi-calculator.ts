

export interface AmortizationEntry {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}


export function calculateEMI(principal: number, annualRate: number, durationMonths: number): number {
  if (principal <= 0 || annualRate < 0 || durationMonths <= 0 || !isFinite(principal) || !isFinite(annualRate) || !isFinite(durationMonths)) {
    return NaN;
  }

  if (annualRate === 0) {
     if (durationMonths === 0) return NaN;
    return principal / durationMonths;
  }

  const monthlyRate = annualRate / 12 / 100;
   if (!isFinite(Math.pow(1 + monthlyRate, durationMonths))) {
       return NaN;
   }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
  const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;

  if (denominator === 0) {
       return NaN;
  }


  const emi = numerator / denominator;
   if (!isFinite(emi)) {
        return NaN;
    }
  return emi;
}


export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  durationMonths: number
): AmortizationEntry[] {
  const emi = calculateEMI(principal, annualRate, durationMonths);
   if (isNaN(emi) || !isFinite(emi) || principal <= 0 || !isFinite(principal) || durationMonths <= 0) {
    return [];
  }

  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;
  const monthlyRate = annualRate === 0 ? 0 : annualRate / 12 / 100;


  for (let month = 1; month <= durationMonths; month++) {
    const interestPayment = monthlyRate === 0 ? 0 : remainingBalance * monthlyRate;
     let principalPayment = emi - interestPayment;
     let currentTotalPayment = emi;

    if (!isFinite(interestPayment) || !isFinite(principalPayment)) {
        console.error(`Calculation error in month ${month}: Interest=${interestPayment}, Principal=${principalPayment}`);
        return schedule;
    }


    if (month === durationMonths) {
         if (Math.abs(remainingBalance - principalPayment) > 0.01) {
            principalPayment = remainingBalance;
        }
        currentTotalPayment = principalPayment + interestPayment;
        remainingBalance = 0;

    } else {
         remainingBalance -= principalPayment;
          if (remainingBalance < -0.01) {
             principalPayment = remainingBalance + principalPayment;
             currentTotalPayment = principalPayment + interestPayment;
             remainingBalance = 0;
         } else if (remainingBalance < 0) {
             remainingBalance = 0;
         }
    }

     if (!isFinite(principalPayment) || !isFinite(interestPayment) || !isFinite(currentTotalPayment) || !isFinite(remainingBalance)) {
         console.error(`Non-finite value detected before push in month ${month}`);
         return schedule;
     }

     schedule.push({
       month,
       principalPayment: principalPayment,
       interestPayment: interestPayment,
       totalPayment: currentTotalPayment,
       remainingBalance: remainingBalance,
     });

       if (remainingBalance < -1) {
            console.error(`Significant negative balance error in month ${month}. Stopping.`);
            break;
        }
  }

  return schedule;
}
