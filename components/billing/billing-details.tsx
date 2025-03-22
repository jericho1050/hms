'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/hooks/use-billing';
import { BillingWithPatient } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Download, FileText, Mail, Pencil, Printer, Trash2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { sendInvoiceEmail, processPayment } from '@/app/actions/billing';

interface BillingDetailsProps {
  billingId: string;
  billingRecord: BillingWithPatient;
  onClose: () => void;
}

export default function BillingDetails({ billingId, billingRecord, onClose }: BillingDetailsProps) {
  const { isLoading } = useBilling();
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      const result = await sendInvoiceEmail(billingId);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invoice email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      if (!paymentAmount || !paymentMethod) {
        toast({
          title: 'Validation Error',
          description: 'Payment amount and method are required',
          variant: 'destructive',
        });
        setIsProcessingPayment(false);
        return;
      }
      
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Payment amount must be a positive number',
          variant: 'destructive',
        });
        setIsProcessingPayment(false);
        return;
      }

      const result = await processPayment(
        billingId, 
        amount, 
        paymentMethod, 
        paymentNotes
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setOpenPaymentDialog(false);
        // Reset form
        setPaymentAmount("");
        setPaymentMethod("");
        setPaymentNotes("");
        
        // You would want to refresh the billing record here
        // This is a temporary solution until you implement a more elegant approach
        onClose(); // Close and refresh
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
              {(Array.isArray(billingRecord.services) 
                ? billingRecord.services 
                : typeof billingRecord.services === 'string' 
                  ? JSON.parse(billingRecord.services || '[]') 
                  : []
              ).map((service: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{service.name}</td>
                  <td className="p-3 text-center">{service.quantity}</td>
                  <td className="p-3 text-center">{formatCurrency(service.price)}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(service.price * service.quantity)}
                  </td>
                </tr>
              ))}
              {(!billingRecord.services || 
                (Array.isArray(billingRecord.services) && billingRecord.services.length === 0)) && (
                <tr className="border-t">
                  <td colSpan={4} className="p-3 text-center text-muted-foreground">
                    No services found
                  </td>
                </tr>
              )}
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
                <p className="whitespace-pre-line break-words max-w-[300px] md:max-w-[400px]">
                  {billingRecord.notes.replace(
                    /Invoice emailed on (\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}\.\d+)Z/g, 
                    (match, date, time) => {
                      const formattedDate = new Date(`${date}T${time}Z`);
                      return `Invoice emailed on ${formatDate(formattedDate.toISOString())} at ${formattedDate.toLocaleTimeString()}`;
                    }
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2 min-w-[150px]">
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
                        {/* Add this for paid amount and balance */}
            {(billingRecord.total_paid ?? 0) > 0 && (
              <>
                <div className="flex justify-between">
                  <p>Paid Amount:</p>
                  <p className="text-green-600">{formatCurrency(billingRecord.total_paid ?? 0)}</p>
                </div>
                <div className="flex justify-between font-semibold">
                  <p>Balance Due:</p>
                  <p className={billingRecord.total_amount > (billingRecord.total_paid ?? 0) ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(Math.max(0, billingRecord.total_amount - (billingRecord.total_paid ?? 0)))}
                  </p>
                </div>
              </>
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
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setOpenPaymentDialog(true)}
            disabled={billingRecord.payment_status === 'paid' || billingRecord.payment_status === 'cancelled'}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSendEmail} 
            disabled={isSendingEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSendingEmail ? 'Sending...' : 'Send Invoice Email'}
          </Button>
        </div>
      </div>
    </div>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for invoice #{billingRecord.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Outstanding: {formatCurrency(billingRecord.total_amount - (billingRecord.total_paid || 0))} </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                placeholder="Any additional notes about this payment"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? 'Processing...' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}