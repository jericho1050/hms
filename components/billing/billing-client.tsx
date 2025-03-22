'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/hooks/use-billing';
import { BillingWithPatient, BillingFilter } from '@/types/billing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download, Plus, RefreshCw } from 'lucide-react';
import BillingTable from './billing-table';
import BillingFilters from './billing-filters';
import { NewBillingForm } from './';
import EditBillingForm from './edit-billing-form';
import BillingDetails from './billing-details';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BillingClient() {
  const { 
    isLoading, 
    records, 
    stats,
    fetchBillingRecords, 
    fetchBillingStats,
    deleteBilling 
  } = useBilling();
  const { toast } = useToast();
  const [openNewForm, setOpenNewForm] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<BillingWithPatient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BillingFilter>({});

  useEffect(() => {
    fetchBillingRecords();
    fetchBillingStats();
  }, []);

  const handleFilterChange = (key: keyof BillingFilter, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    fetchBillingRecords(newFilters);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({});
    fetchBillingRecords({});
  };

  const handleViewDetails = (id: string) => {
    const record = records.find(r => r.id === id);
    setSelectedId(id);
    setSelectedRecord(record || null);
    setOpenDetails(true);
  };

  const handleCreateNew = () => {
    setOpenNewForm(true);
  };

  const handleCloseDialogs = () => {
    setOpenNewForm(false);
    setOpenEditForm(false);
    setOpenDetails(false);
    // Reset the selected ID when closing dialogs
    setSelectedId(null);
  };

  const handleRefresh = () => {
    fetchBillingRecords();
    fetchBillingStats();
  };

  const handleEditFormOpenChange = (open: boolean) => {
    setOpenEditForm(open);
    if (!open) {
      setSelectedId(null);
    }
  };

  const handleDetailsOpenChange = (open: boolean) => {
    setOpenDetails(open);
    if (!open) {
      setSelectedId(null);
    }
  };

  const handleEditInvoice = (record: BillingWithPatient) => {
    setSelectedId(record.id);
    setSelectedRecord(record);
    setOpenEditForm(true);
  };

  const handleDeleteInvoice = (id: string) => {
    setSelectedId(id);
    setOpenDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    
    try {
      await deleteBilling(selectedId);
      toast({
        title: 'Success',
        description: 'Invoice has been deleted successfully',
      });
      fetchBillingRecords();
      fetchBillingStats();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      });
    } finally {
      setOpenDeleteAlert(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalMonthlyRevenue) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month's total billing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalOutstanding) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending or overdue payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recentTransactions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              New billing records in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BillingFilters 
        filters={filters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <BillingTable 
        records={records} 
        isLoading={isLoading} 
        onViewDetails={handleViewDetails}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
      />

      {/* New Form Dialog */}
      <Dialog open={openNewForm} onOpenChange={setOpenNewForm}>
        <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Fill in the invoice details to create a new billing record.
            </DialogDescription>
          </DialogHeader>
          <NewBillingForm 
            onClose={handleCloseDialogs}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={openEditForm} onOpenChange={handleEditFormOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the invoice details below
            </DialogDescription>
          </DialogHeader>
          {selectedId && selectedRecord && (
            <EditBillingForm 
              billingId={selectedId} 
              billingRecord={selectedRecord}
              onClose={() => {
                setOpenEditForm(false);
                fetchBillingRecords();
                fetchBillingStats();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openDetails} onOpenChange={handleDetailsOpenChange}>
        <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View the complete invoice information.
            </DialogDescription>
          </DialogHeader>
          {selectedId && selectedRecord && (
            <BillingDetails 
              billingId={selectedId}
              billingRecord={selectedRecord}
              onClose={handleCloseDialogs}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}