
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
import { formatCurrency } from "@/lib/emi-calculator";
import { ListOrdered } from 'lucide-react';

interface AmortizationTableProps {
  schedule: AmortizationEntry[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  if (!schedule || schedule.length === 0) {
    return (
         <Card className="mt-8 shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListOrdered className="text-primary" /> Amortization Schedule</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground text-center py-8">Enter loan details above to view the amortization schedule.</p>
             </CardContent>
         </Card>
     );
  }

  return (
     <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListOrdered className="text-primary" /> Amortization Schedule</CardTitle>
      </CardHeader>
      <CardContent>
         <ScrollArea className="h-[400px] w-full rounded-md border">
             <Table>
             <TableHeader className="sticky top-0 bg-secondary z-10">
                 <TableRow>
                 <TableHead className="w-[80px]">Month</TableHead>
                 <TableHead className="text-right">Principal Paid</TableHead>
                 <TableHead className="text-right">Interest Paid</TableHead>
                 <TableHead className="text-right">Total Payment</TableHead>
                 <TableHead className="text-right">Remaining Balance</TableHead>
                 </TableRow>
             </TableHeader>
             <TableBody>
                 {schedule.map((entry) => (
                 <TableRow key={entry.month}>
                     <TableCell className="font-medium">{entry.month}</TableCell>
                     <TableCell className="text-right">{formatCurrency(entry.principalPayment)}</TableCell>
                     <TableCell className="text-right">{formatCurrency(entry.interestPayment)}</TableCell>
                     <TableCell className="text-right">{formatCurrency(entry.totalPayment)}</TableCell>
                     <TableCell className="text-right">{formatCurrency(entry.remainingBalance)}</TableCell>
                 </TableRow>
                 ))}
             </TableBody>
             </Table>
         </ScrollArea>
       </CardContent>
     </Card>
  );
}
