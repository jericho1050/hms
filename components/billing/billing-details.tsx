'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/hooks/use-billing';
import { BillingWithPatient } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, FileText, Pencil, Printer, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BillingDetailsProps {
  billingId: string;
  billingRecord: BillingWithPatient;
  onClose: () => void;
}

export default function BillingDetails({ billingId, billingRecord, onClose }: BillingDetailsProps) {
  const { isLoading } = useBilling();
  const { toast } = useToast();

  if (isLoading) {
    return <div className="text-center py-4">Loading invoice details...</div>;
  }

  const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Invoice #{billingRecord.id.substring(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">
            Created on {formatDate(billingRecord.created_at)}
          </p>
        </div>
        <Badge className={statusColors[billingRecord.payment_status as keyof typeof statusColors] || ''}>
          {billingRecord.payment_status.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="space-y-2">
          <Label className="text-base">Patient Information</Label>
          <div className="rounded-md border p-4">
            <p className="font-medium">{billingRecord.patient.first_name} {billingRecord.patient.last_name}</p>
            <p className="text-sm text-muted-foreground">Patient ID: {billingRecord.patient_id}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="space-y-2">
          <Label className="text-base">Invoice Details</Label>
          <div className="rounded-md border p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p>{formatDate(billingRecord.invoice_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p>{billingRecord.due_date ? formatDate(billingRecord.due_date) : '-'}</p>
              </div>
              {billingRecord.payment_method && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{billingRecord.payment_method.replace('_', ' ')}</p>
                </div>
              )}
              {billingRecord.payment_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p>{formatDate(billingRecord.payment_date)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <Label className="text-base">Services</Label>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Service</th>
                <th className="p-3 font-medium text-center">Quantity</th>
                <th className="p-3 font-medium text-center">Unit Price</th>
                <th className="p-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billingRecord.services.map((service: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{service.name}</td>
                  <td className="p-3 text-center">{service.quantity}</td>
                  <td className="p-3 text-center">{formatCurrency(service.price)}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(service.price * service.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-md border p-4">
        <div className="flex justify-between">
          <div className="space-y-3">
            {billingRecord.insurance_claim_id && (
              <div>
                <p className="text-sm text-muted-foreground">Insurance Claim</p>
                <p>{billingRecord.insurance_claim_id}</p>
              </div>
            )}
            {billingRecord.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{billingRecord.notes}</p>
              </div>
            )}
          </div>
          <div className="space-y-2 text-right min-w-[150px]">
            {billingRecord.insurance_coverage && (
              <>
                <div className="flex justify-between">
                  <p>Insurance Coverage:</p>
                  <p>{formatCurrency(billingRecord.insurance_coverage)}</p>
                </div>
              </>
            )}
            {billingRecord.discount && (
              <div className="flex justify-between">
                <p>Discount:</p>
                <p>{formatCurrency(billingRecord.discount)}</p>
              </div>
            )}
            {billingRecord.tax && (
              <div className="flex justify-between">
                <p>Tax:</p>
                <p>{billingRecord.tax}%</p>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <p>Total:</p>
              <p>{formatCurrency(billingRecord.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}