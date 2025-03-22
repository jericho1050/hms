import { Suspense } from 'react';
import BillingClient from '@/components/billing/billing-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Billing | Hospital Management System',
  description: 'Manage patient billing and invoices',
};

export default function BillingPage() {
  return (
    <main className="container mx-auto px-4 py-6 flex-1 overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Billing Management</h1>
      <Suspense fallback={<BillingFallback />}>
        <BillingClient />
      </Suspense>
    </main>
  );
}

function BillingFallback() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}