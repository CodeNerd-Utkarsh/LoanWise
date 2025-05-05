
"use client"; // Required for useState and useEffect

import React, { useState, useCallback } from 'react';
import { EmiCalculatorForm } from '@/components/emi-calculator-form';
import { AmortizationTable } from '@/components/amortization-table';
import { generateAmortizationSchedule, type AmortizationEntry } from '@/lib/emi-calculator';

// Define the structure for the form data we expect
interface FormData {
  principal: number;
  annualRate: number;
  durationYears: number;
}


export default function Home() {
  const [emi, setEmi] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  // Callback function passed to the form
  const handleCalculation = useCallback((calculatedEmi: number, _schedule: AmortizationEntry[], formData: FormData) => {
    // Generate schedule here based on the latest form data
    const newSchedule = generateAmortizationSchedule(
        formData.principal,
        formData.annualRate,
        formData.durationYears * 12
    );

    setEmi(calculatedEmi);
    setSchedule(newSchedule);
    setCurrentFormData(formData); // Store current form data if needed elsewhere

  }, []); // Empty dependency array ensures the function identity remains stable


  return (
    <div className="flex flex-col items-center space-y-8">
      <EmiCalculatorForm onCalculate={handleCalculation} />
      <AmortizationTable schedule={schedule} />
    </div>
  );
}
