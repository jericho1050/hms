'use client';

import { Dispatch, SetStateAction } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, X } from 'lucide-react';
import { BillingFilter } from '@/types/billing';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BillingFiltersProps {
  filters: BillingFilter;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  onFilterChange: (key: keyof BillingFilter, value: any) => void;
  onResetFilters: () => void;
}

export default function BillingFilters({
  filters,
  searchTerm,
  setSearchTerm,
  onFilterChange,
  onResetFilters
}: BillingFiltersProps) {
  
  // Handle payment status change with special handling for 'all' value
  const handlePaymentStatusChange = (value: string) => {
    // Convert 'all' to empty string for the filter logic
    const filterValue = value === 'all' ? '' : value;
    onFilterChange('paymentStatus', filterValue);
  };

  // For display purposes, show 'all' when paymentStatus is an empty string
  const displayPaymentStatus = !filters.paymentStatus ? 'all' : filters.paymentStatus;
  
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient">Search Patient</Label>
          <Input
            id="patient"
            placeholder="Patient name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFilterChange('searchTerm', e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Payment Status</Label>
          <Select
            value={displayPaymentStatus}
            onValueChange={handlePaymentStatusChange}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? (
                  format(filters.startDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => onFilterChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? (
                  format(filters.endDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => onFilterChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}