
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { calculateEMI, AmortizationEntry, formatCurrency } from "@/lib/emi-calculator";
import { Calculator } from "lucide-react";

const formSchema = z.object({
  principal: z.coerce.number().positive({ message: "Principal must be positive." }).max(10000000, {message: "Max Principal is 10,000,000"}),
  annualRate: z.coerce.number().min(0, { message: "Interest rate cannot be negative." }).max(30, { message: "Max interest rate is 30%" }),
  durationYears: z.coerce.number().positive({ message: "Duration must be positive." }).max(30, { message: "Max duration is 30 years" }),
});

type EmiFormValues = z.infer<typeof formSchema>;

interface EmiCalculatorFormProps {
  onCalculate: (emi: number, schedule: AmortizationEntry[], formData: EmiFormValues) => void;
}

export function EmiCalculatorForm({ onCalculate }: EmiCalculatorFormProps) {
  const form = useForm<EmiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 100000,
      annualRate: 7.5,
      durationYears: 5,
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  const { watch, setValue } = form;
  const principal = watch("principal");
  const annualRate = watch("annualRate");
  const durationYears = watch("durationYears");

   const calculatedEMI = useMemo(() => {
      const values = form.getValues();
      const result = formSchema.safeParse(values);
      if (result.success) {
        return calculateEMI(result.data.principal, result.data.annualRate, result.data.durationYears * 12);
      }
      return NaN;
    }, [principal, annualRate, durationYears, form]);


  const onSubmit = (data: EmiFormValues) => {
    const emi = calculateEMI(data.principal, data.annualRate, data.durationYears * 12);
     if (!isNaN(emi)) {
        // Trigger parent callback - schedule generation will happen there or be passed
       onCalculate(emi, [], data); // Pass empty schedule initially, parent can generate if needed
     } else {
        console.error("EMI Calculation failed with data:", data);
       // Handle error state, maybe show a message
     }
  };

  // Optional: Recalculate on form value changes automatically
   useEffect(() => {
       const subscription = watch((values, { name, type }) => {
           const result = formSchema.safeParse(values);
           if (result.success) {
               const emi = calculateEMI(result.data.principal, result.data.annualRate, result.data.durationYears * 12);
                if (!isNaN(emi)) {
                    onCalculate(emi, [], result.data); // Update parent on any valid change
                }
           }
       });
       return () => subscription.unsubscribe();
   }, [watch, onCalculate, formSchema]);


  return (
     <Card className="w-full max-w-lg mx-auto shadow-lg">
       <CardHeader>
         <CardTitle className="flex items-center gap-2"><Calculator className="text-primary"/> EMI Calculator</CardTitle>
       </CardHeader>
       <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Principal Amount */}
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Loan Amount ($)</FormLabel>
                    <span className="text-sm font-medium text-primary">{formatCurrency(field.value)}</span>
                  </div>
                  <FormControl>
                   <div className="flex items-center gap-4">
                     <Slider
                       min={1000}
                       max={10000000} // Example Max
                       step={1000}
                       value={[field.value]}
                       onValueChange={(value) => field.onChange(value[0])}
                        className="flex-grow"
                     />
                      <Input
                       type="number"
                       {...field}
                       onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} // Allow empty input temporary state
                       className="w-32"
                      />
                   </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interest Rate */}
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
                        max={30}
                        step={0.1}
                        value={[field.value]}
                         onValueChange={(value) => field.onChange(value[0])}
                         className="flex-grow"
                      />
                       <Input
                         type="number"
                         step="0.1"
                         {...field}
                         onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-32"
                       />
                   </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Duration */}
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
                            max={30}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-grow"
                          />
                           <Input
                             type="number"
                             step="1"
                             {...field}
                             onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                             className="w-32"
                           />
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button removed as calculation happens onChange */}
            {/* <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Calculate EMI</Button> */}
          </form>
         </Form>
       </CardContent>
        <CardFooter className="flex justify-center p-6 bg-secondary/50 rounded-b-lg">
            <div className="text-center">
                <p className="text-muted-foreground text-sm mb-1">Monthly EMI</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(calculatedEMI)}</p>
            </div>
        </CardFooter>
     </Card>
  );
}
