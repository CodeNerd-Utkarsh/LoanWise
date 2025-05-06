
"use client";

import React, { useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { calculateEMI } from "@/lib/emi-calculator";
import { Calculator, IndianRupee, DollarSign, Euro, PoundSterling } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertCurrencyValue, formatCurrency, supportedCurrencies, convertAndFormatCurrency } from "@/lib/currency-utils";
import { useToast } from "@/hooks/use-toast";

interface ExchangeRates {
  [key: string]: number;
}

const MAX_PRINCIPAL_USD = 10000000;
const MAX_RATE = 30;
const MAX_DURATION = 30;


const formSchema = z.object({
  principal: z.coerce.number().positive({ message: "Principal must be positive." }).max(MAX_PRINCIPAL_USD, {message: `Max Principal is ${formatCurrency(MAX_PRINCIPAL_USD, 'USD')}`}),
  annualRate: z.coerce.number().min(0, { message: "Interest rate cannot be negative." }).max(MAX_RATE, { message: `Max interest rate is ${MAX_RATE}%` }),
  durationYears: z.coerce.number().positive({ message: "Duration must be positive." }).max(MAX_DURATION, { message: `Max duration is ${MAX_DURATION} years` }),
});

type EmiFormValues = z.infer<typeof formSchema>;

interface EmiCalculatorFormProps {
  onCalculate: (emi: number, formData: EmiFormValues) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: ExchangeRates | null;
  isLoadingRates: boolean;
  baseCurrency: string;
  displayEmiBase: number | null;
}

export function EmiCalculatorForm({
  onCalculate,
  selectedCurrency,
  setSelectedCurrency,
  exchangeRates,
  isLoadingRates,
  baseCurrency,
  displayEmiBase
}: EmiCalculatorFormProps) {

  const { toast } = useToast();

  const form = useForm<EmiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 100000,
      annualRate: 7.5,
      durationYears: 5,
    },
    mode: "onChange",
  });

  const { watch, setValue, getValues, trigger } = form;
  const principalBase = watch("principal");


   const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'USD': return <DollarSign className="h-4 w-4 inline mr-1" />;
      case 'INR': return <IndianRupee className="h-4 w-4 inline mr-1" />;
      case 'EUR': return <Euro className="h-4 w-4 inline mr-1" />;
      case 'GBP': return <PoundSterling className="h-4 w-4 inline mr-1" />;
      default: return <span className="mr-1">{currencyCode}</span>;
    }
  };


  const principalDisplayed = useMemo(() => {
    return convertCurrencyValue(principalBase, selectedCurrency, exchangeRates, baseCurrency);
  }, [principalBase, selectedCurrency, exchangeRates, baseCurrency]);


  const maxPrincipalSelectedCurrency = useMemo(() => {
    return convertCurrencyValue(MAX_PRINCIPAL_USD, selectedCurrency, exchangeRates, baseCurrency);
  }, [selectedCurrency, exchangeRates, baseCurrency]);


   const calculatedEmiFormatted = useMemo(() => {
       return convertAndFormatCurrency(displayEmiBase, selectedCurrency, exchangeRates, baseCurrency);
   }, [displayEmiBase, selectedCurrency, exchangeRates, baseCurrency]);


  const onSubmit = (data: EmiFormValues) => {
     const emiBase = calculateEMI(data.principal, data.annualRate, data.durationYears * 12);
     if (!isNaN(emiBase) && isFinite(emiBase)) {
       onCalculate(emiBase, data);
       toast({
         title: "Calculation Successful",
         description: `EMI calculated: ${convertAndFormatCurrency(emiBase, selectedCurrency, exchangeRates, baseCurrency)}`,
       });
     } else {
        console.error("EMI Calculation failed with data:", data);
        toast({
           variant: "destructive",
           title: "Calculation Error",
           description: "Could not calculate EMI. Please check your inputs.",
         });
     }
  };


  const handlePrincipalChange = (value: number | string) => {
      const numericValue = Number(value);
      if (!isNaN(numericValue) && exchangeRates && selectedCurrency !== baseCurrency) {
        const baseRate = exchangeRates[baseCurrency];
        const selectedRate = exchangeRates[selectedCurrency];
        if (baseRate && selectedRate && selectedRate !== 0) {
            const principalInBase = (numericValue / selectedRate) * baseRate;
            setValue("principal", principalInBase, { shouldValidate: true });
        } else {
             console.warn("Could not find rates for conversion back to base currency or rate is zero.");
              setValue("principal", NaN, { shouldValidate: true });
        }
      } else if (!isNaN(numericValue) && selectedCurrency === baseCurrency) {
         setValue("principal", numericValue, { shouldValidate: true });
      } else if (value === '') {
           setValue("principal", NaN, { shouldValidate: true });
      }
  };


   const handlePrincipalSliderChange = (value: number[]) => {
       setValue("principal", value[0], { shouldValidate: true });
   };


   const handleCurrencyChange = (newCurrency: string) => {
        setSelectedCurrency(newCurrency);
        trigger("principal");
    };


  return (
     <Card className="w-full max-w-lg mx-auto shadow-lg">
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle className="flex items-center gap-2"><Calculator className="text-primary"/> EMI Calculator</CardTitle>
         <div className="w-40">
             <Select
                value={selectedCurrency}
                onValueChange={handleCurrencyChange}
                disabled={isLoadingRates || !exchangeRates}
             >
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                    {supportedCurrencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code} disabled={!exchangeRates?.[currency.code] && currency.code !== baseCurrency}>
                        {getCurrencyIcon(currency.code)} {currency.code}
                    </SelectItem>
                    ))}
                     {isLoadingRates && <SelectItem value="loading" disabled>Loading rates...</SelectItem>}
                      {!isLoadingRates && !exchangeRates && <SelectItem value="error" disabled>Error loading rates</SelectItem>}
                </SelectContent>
             </Select>
         </div>
       </CardHeader>
       <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Loan Amount ({getCurrencyIcon(selectedCurrency)})</FormLabel>
                    <span className="text-sm font-medium text-primary">{formatCurrency(principalDisplayed, selectedCurrency)}</span>
                  </div>
                  <FormControl>
                   <div className="flex items-center gap-4">
                     <Slider
                       min={convertCurrencyValue(1000, baseCurrency, exchangeRates, baseCurrency)}
                       max={MAX_PRINCIPAL_USD}
                       step={convertCurrencyValue(1000, baseCurrency, exchangeRates, baseCurrency)}
                       value={isNaN(field.value) ? [0] : [field.value]}
                       onValueChange={handlePrincipalSliderChange}
                       className="flex-grow"
                       disabled={isLoadingRates || !exchangeRates}
                     />
                      <Input
                       type="number"
                       value={isNaN(principalDisplayed) ? '' : principalDisplayed.toFixed(0)}
                       onChange={e => handlePrincipalChange(e.target.value)}
                       className="w-32"
                       disabled={isLoadingRates || !exchangeRates}
                       placeholder={selectedCurrency}
                      />
                   </div>

                  </FormControl>
                   <FormMessage>{form.formState.errors.principal?.message?.replace(formatCurrency(MAX_PRINCIPAL_USD, 'USD'), formatCurrency(maxPrincipalSelectedCurrency, selectedCurrency))}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualRate"
              render={({ field }) => (
                <FormItem>
                 <div className="flex justify-between items-center">
                  <FormLabel>Interest Rate (% p.a.)</FormLabel>
                   <span className="text-sm font-medium text-primary">{field.value?.toFixed(2)}%</span>
                 </div>
                  <FormControl>
                   <div className="flex items-center gap-4">
                      <Slider
                        min={0.1}
                        max={MAX_RATE}
                        step={0.1}
                        value={isNaN(field.value) ? [0] : [field.value]}
                         onValueChange={(value) => field.onChange(value[0])}
                         className="flex-grow"
                      />
                       <Input
                         type="number"
                         step="0.1"
                         {...field}
                         value={isNaN(field.value) ? '' : field.value}
                         onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-32"
                       />
                   </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationYears"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                      <FormLabel>Loan Tenure (Years)</FormLabel>
                      <span className="text-sm font-medium text-primary">{field.value} Year{field.value !== 1 ? 's' : ''}</span>
                  </div>
                  <FormControl>
                      <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={MAX_DURATION}
                            step={1}
                            value={isNaN(field.value) ? [0] : [field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-grow"
                          />
                           <Input
                             type="number"
                             step="1"
                             {...field}
                             value={isNaN(field.value) ? '' : field.value}
                             onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                             className="w-32"
                           />
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full" disabled={isLoadingRates || !exchangeRates || !form.formState.isValid}>
                Calculate EMI
             </Button>

          </form>
         </Form>
       </CardContent>
        <CardFooter className="flex justify-center p-6 bg-secondary/50 rounded-b-lg">
            <div className="text-center">
                <p className="text-muted-foreground text-sm mb-1">Monthly EMI ({getCurrencyIcon(selectedCurrency)})</p>
                 <p className="text-3xl font-bold text-primary">{calculatedEmiFormatted}</p>
                 {isLoadingRates && <p className="text-xs text-muted-foreground">Loading rates...</p>}
                 {!isLoadingRates && !exchangeRates && <p className="text-xs text-destructive">Could not load rates</p>}
                 {!isLoadingRates && exchangeRates && !exchangeRates[selectedCurrency] && selectedCurrency !== baseCurrency && (
                   <p className="text-xs text-destructive">Rate for {selectedCurrency} unavailable</p>
                 )}
                  {displayEmiBase === null && !isLoadingRates && exchangeRates && (
                    <p className="text-xs text-muted-foreground mt-1">Enter details and click Calculate.</p>
                 )}
            </div>
        </CardFooter>
     </Card>
  );
}
