
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { EmiCalculatorForm } from '@/components/emi-calculator-form';
import { AmortizationTable } from '@/components/amortization-table';
import { generateAmortizationSchedule, calculateEMI, type AmortizationEntry } from '@/lib/emi-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface FormData {
  principal: number;
  annualRate: number;
  durationYears: number;
}

interface ExchangeRates {
  [key: string]: number;
}

const DEFAULT_FORM_DATA: FormData = {
  principal: 100000,
  annualRate: 7.5,
  durationYears: 5,
};

export default function Home() {
  const [emi, setEmi] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [errorRates, setErrorRates] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
      setIsLoadingRates(true);
      setErrorRates(null);
      const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
          setErrorRates("API key for exchange rates is missing. Please configure it in your environment variables (e.g., .env.local).");
          setIsLoadingRates(false);
          setExchangeRates({});
          return;
      }
      try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
           throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText} - ${errorData['error-type'] || 'Unknown API Error'}`);
        }
        const data = await response.json();
        if (data.result === 'error') {
             throw new Error(`Exchange rate API error: ${data['error-type']}`);
        }
        setExchangeRates(data.conversion_rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setErrorRates(error instanceof Error ? error.message : "An unknown error occurred while fetching exchange rates.");
        setExchangeRates(null);
      } finally {
        setIsLoadingRates(false);
      }
    // No dependency array here, it's called explicitly in the main useEffect
  }, []);


  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

   const performCalculation = useCallback((formData: FormData) => {
     const calculatedEmi = calculateEMI(
       formData.principal,
       formData.annualRate,
       formData.durationYears * 12
     );
     const newSchedule = generateAmortizationSchedule(
       formData.principal,
       formData.annualRate,
       formData.durationYears * 12
     );

     if (!isNaN(calculatedEmi) && isFinite(calculatedEmi)) {
       setEmi(calculatedEmi);
       setSchedule(newSchedule);
       setCurrentFormData(formData);
     } else {
       setEmi(null);
       setSchedule([]);
       setCurrentFormData(null);
       console.error("Initial or subsequent calculation failed", { formData, calculatedEmi });
     }
   }, []);


   useEffect(() => {
     if (!isLoadingRates && exchangeRates && !currentFormData) {
       performCalculation(DEFAULT_FORM_DATA);
     }
   }, [isLoadingRates, exchangeRates, performCalculation, currentFormData]);

  const handleFormSubmit = useCallback((calculatedEmi: number, formData: FormData) => {
     performCalculation(formData);
  }, [performCalculation]);


  return (
    <div className="flex flex-col items-center space-y-8">
       {errorRates && (
          <Alert variant="destructive" className="w-full max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error</AlertTitle>
            <AlertDescription>{errorRates}</AlertDescription>
          </Alert>
        )}
       {isLoadingRates && !exchangeRates && !errorRates && (
           <Card className="w-full max-w-lg mx-auto shadow-lg">
               <CardHeader>
                   <CardTitle>Loading Exchange Rates...</CardTitle>
               </CardHeader>
               <CardContent className="flex justify-center items-center py-8">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </CardContent>
           </Card>
       )}
      <EmiCalculatorForm
          onCalculate={handleFormSubmit}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          exchangeRates={exchangeRates}
          isLoadingRates={isLoadingRates}
          baseCurrency="USD"
          displayEmiBase={emi}
          defaultValues={DEFAULT_FORM_DATA}
        />
      <AmortizationTable
          schedule={schedule}
          selectedCurrency={selectedCurrency}
          exchangeRates={exchangeRates}
          baseCurrency="USD"
        />
    </div>
  );
}

