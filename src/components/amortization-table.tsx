
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AmortizationEntry } from "@/lib/emi-calculator";
import { convertAndFormatCurrency } from "@/lib/currency-utils";
import { ListOrdered, Info } from 'lucide-react';

interface ExchangeRates {
  [key: string]: number;
}
interface AmortizationTableProps {
  schedule: AmortizationEntry[];
  selectedCurrency: string;
  exchangeRates: ExchangeRates | null;
  baseCurrency: string;
}

export function AmortizationTable({ schedule, selectedCurrency, exchangeRates, baseCurrency }: AmortizationTableProps) {
   const formatInSelectedCurrency = (amount: number | undefined | null): string => {
        return convertAndFormatCurrency(amount, selectedCurrency, exchangeRates, baseCurrency);
    };

  if (!schedule || schedule.length === 0) {
    return (
         <Card className="mt-8 shadow-lg w-full max-w-4xl mx-auto">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListOrdered className="text-primary" /> Amortization Schedule</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground text-center py-8">Enter loan details above to view the amortization schedule.</p>
             </CardContent>
         </Card>
     );
  }

  const isRateAvailable = exchangeRates && exchangeRates[selectedCurrency] !== undefined;

  return (
     <Card className="mt-8 shadow-lg w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
             <CardTitle className="flex items-center gap-2"><ListOrdered className="text-primary" /> Amortization Schedule</CardTitle>
             {!isRateAvailable && selectedCurrency !== baseCurrency && (
                 <span className="text-xs text-destructive flex items-center gap-1">
                     <Info size={14} /> Rate for {selectedCurrency} unavailable. Displaying in {baseCurrency}.
                 </span>
             )}
        </div>

      </CardHeader>
      <CardContent>
         <ScrollArea className="h-[400px] w-full rounded-md border">
             <Table>
             <TableHeader className="sticky top-0 bg-secondary z-10">
                 <TableRow>
                 <TableHead className="w-[80px]">Month</TableHead>
                 <TableHead className="text-right">Principal ({selectedCurrency})</TableHead>
                 <TableHead className="text-right">Interest ({selectedCurrency})</TableHead>
                 <TableHead className="text-right">Total Payment ({selectedCurrency})</TableHead>
                 <TableHead className="text-right">Balance ({selectedCurrency})</TableHead>
                 </TableRow>
             </TableHeader>
             <TableBody>
                 {schedule.map((entry) => (
                 <TableRow key={entry.month}>
                     <TableCell className="font-medium">{entry.month}</TableCell>
                     <TableCell className="text-right">{formatInSelectedCurrency(entry.principalPayment)}</TableCell>
                     <TableCell className="text-right">{formatInSelectedCurrency(entry.interestPayment)}</TableCell>
                     <TableCell className="text-right">{formatInSelectedCurrency(entry.totalPayment)}</TableCell>
                     <TableCell className="text-right">{formatInSelectedCurrency(entry.remainingBalance)}</TableCell>
                 </TableRow>
                 ))}
             </TableBody>
             </Table>
         </ScrollArea>
         <p className="text-xs text-muted-foreground mt-2 text-center">All values are approximate and based on the selected exchange rate.</p>
       </CardContent>
     </Card>
  );
}
