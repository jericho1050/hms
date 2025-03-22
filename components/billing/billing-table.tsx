'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { BillingWithPatient } from '@/types/billing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Mail, Eye, FileText, MoreHorizontal, Printer, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jsPDF } from 'jspdf';

interface BillingTableProps {
  records: BillingWithPatient[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onEdit: (record: BillingWithPatient) => void;
  onDelete: (id: string) => void;
}

export default function BillingTable({ 
  records, 
  isLoading, 
  onViewDetails,
  onEdit,
  onDelete 
}: BillingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };
  
  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, records.length);
  const currentRecords = records.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    setPageSize(newPageSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };
  
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current page
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Show first pages and ellipsis at end
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Show ellipsis at start and last pages
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show ellipsis at both sides
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const generatePdf = (record: BillingWithPatient) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Add header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${record.id.substring(0, 8)}`, margin, 40);
    doc.text(`Date: ${formatDate(record.invoice_date)}`, margin, 50);
    doc.text(`Due Date: ${record.due_date ? formatDate(record.due_date) : 'N/A'}`, margin, 60);
    
    // Add patient details
    doc.text('Patient Details:', margin, 80);
    doc.text(`Name: ${record.patient.first_name} ${record.patient.last_name}`, margin, 90);
    
    // Add billing details
    doc.text('Billing Details:', margin, 120);
    
    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, 130);
    doc.text('Amount', pageWidth - margin - 20, 130, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Line
    doc.line(margin, 135, pageWidth - margin, 135);
    
    // Services (sample data - in a real app you'd iterate through services)
    let yPos = 145;
    if (record.services && record.services.length > 0) {
      record.services.forEach((service: any, index: number) => {
        doc.text(service.description || `Service ${index + 1}`, margin, yPos);
        doc.text(formatCurrency(service.amount || 0), pageWidth - margin - 20, yPos, { align: 'right' });
        yPos += 10;
      });
    } else {
      // If no services data available, show a single line
      doc.text('Medical services', margin, yPos);
      doc.text(formatCurrency(record.total_amount), pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 10;
    }
    
    // Total
    yPos += 10;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margin, yPos);
    doc.text(formatCurrency(record.total_amount), pageWidth - margin - 20, yPos, { align: 'right' });
    
    // Status
    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: ${record.payment_status.replace('_', ' ')}`, margin, yPos);
    
    // Footer
    const footerText = 'Thank you for your business!';
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    
    // Save PDF with name based on invoice ID
    doc.save(`invoice-${record.id.substring(0, 8)}.pdf`);
  };
  
  const printInvoice = (record: BillingWithPatient) => {
    // Create a temporary PDF and open in a new window for printing
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Add header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${record.id.substring(0, 8)}`, margin, 40);
    doc.text(`Date: ${formatDate(record.invoice_date)}`, margin, 50);
    doc.text(`Due Date: ${record.due_date ? formatDate(record.due_date) : 'N/A'}`, margin, 60);
    
    // Add patient details
    doc.text('Patient Details:', margin, 80);
    doc.text(`Name: ${record.patient.first_name} ${record.patient.last_name}`, margin, 90);
    
    // Add billing details
    doc.text('Billing Details:', margin, 120);
    
    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, 130);
    doc.text('Amount', pageWidth - margin - 20, 130, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Line
    doc.line(margin, 135, pageWidth - margin, 135);
    
    // Services (sample data - in a real app you'd iterate through services)
    let yPos = 145;
    if (record.services && record.services.length > 0) {
      record.services.forEach((service: any, index: number) => {
        doc.text(service.description || `Service ${index + 1}`, margin, yPos);
        doc.text(formatCurrency(service.amount || 0), pageWidth - margin - 20, yPos, { align: 'right' });
        yPos += 10;
      });
    } else {
      // If no services data available, show a single line
      doc.text('Medical services', margin, yPos);
      doc.text(formatCurrency(record.total_amount), pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 10;
    }
    
    // Total
    yPos += 10;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margin, yPos);
    doc.text(formatCurrency(record.total_amount), pageWidth - margin - 20, yPos, { align: 'right' });
    
    // Status
    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: ${record.payment_status.replace('_', ' ')}`, margin, yPos);
    
    // Footer
    const footerText = 'Thank you for your business!';
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    
    // Instead of using document.write, we'll directly open and print the PDF
    // Generate a blob URL for the PDF
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    
    // Open the PDF in a new window
    const printWindow = window.open(blobUrl, '_blank');
    
    if (printWindow) {
      // Add event listener to trigger print when PDF is loaded
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
          // Release the blob URL when done
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }, 1000);
      });
    } else {
      // If popup is blocked, create a fallback approach with a download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `invoice-${record.id.substring(0, 8)}.pdf`;
      link.click();
      
      // Release the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
      // Inform user that printing was attempted
      alert('Print popup was blocked. The invoice has been downloaded instead.');
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No billing records found
              </TableCell>
            </TableRow>
          ) : (
            currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  #{record.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {record.patient.first_name} {record.patient.last_name}
                </TableCell>
                <TableCell>{formatDate(record.invoice_date)}</TableCell>
                <TableCell>{record.due_date ? formatDate(record.due_date) : '-'}</TableCell>
                <TableCell>{formatCurrency(record.total_amount)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[record.payment_status as keyof typeof statusColors] || ''}>
                    {record.payment_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(record.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => printInvoice(record)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generatePdf(record)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(record.id)}>
                        <Trash2 className="mr-2 h-4 w-4" color='red' />
                        <span className='text-red-600'>Delete Invoice </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {!isLoading && records.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{records.length}</span> records
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page as number)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}