
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { EmiCalculatorForm } from '@/components/emi-calculator-form';
import { AmortizationTable } from '@/components/amortization-table';
import { generateAmortizationSchedule, type AmortizationEntry } from '@/lib/emi-calculator';
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

export default function Home() {
  const [emi, setEmi] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [errorRates, setErrorRates] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      setErrorRates(null);
      const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
          setErrorRates("API key for exchange rates is missing. Please create a `.env.local` file in the project root and add the line: NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key");
          setIsLoadingRates(false);
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
    };

    fetchRates();
  }, []);


  const handleCalculation = useCallback((calculatedEmi: number, formData: FormData) => {
    const newSchedule = generateAmortizationSchedule(
        formData.principal,
        formData.annualRate,
        formData.durationYears * 12
    );

    setEmi(calculatedEmi);
    setSchedule(newSchedule);
    setCurrentFormData(formData);

  }, []);


  return (
    <div className="flex flex-col items-center space-y-8">
       {errorRates && (
          <Alert variant="destructive" className="w-full max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
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
          onCalculate={handleCalculation}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          exchangeRates={exchangeRates}
          isLoadingRates={isLoadingRates}
          baseCurrency="USD"
          displayEmiBase={emi}
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
