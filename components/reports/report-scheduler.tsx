"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"

const formSchema = z.object({
  reportName: z.string().min(2, "Report name must be at least 2 characters"),
  reportType: z.string().min(1, "Please select a report type"),
  frequency: z.string().min(1, "Please select a frequency"),
  emailRecipients: z.string().min(5, "Please add at least one email recipient"),
  fileFormat: z.string().min(1, "Please select a file format"),
  includeCharts: z.boolean().default(true),
  includeTables: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface ReportSchedulerProps {
  onClose: () => void
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
  activeTab: string
}

export function ReportScheduler({ 
  onClose, 
  dateRange, 
  departmentFilter, 
  reportTypeFilter,
  activeTab
}: ReportSchedulerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Generate a default report name based on filters
  const getDefaultReportName = () => {
    const reportType = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    const department = departmentFilter === 'all' ? 'All Departments' : 
      departmentFilter.charAt(0).toUpperCase() + departmentFilter.slice(1)
    
    return `${reportType} Report - ${department}`
  }

  // Initialize the form with pre-populated values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportName: getDefaultReportName(),
      reportType: activeTab,
      frequency: "monthly",
      emailRecipients: "",
      fileFormat: "pdf",
      includeCharts: true,
      includeTables: true,
      includeSummary: true,
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Format date range for report description
      const fromDate = dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'earliest record'
      const toDate = dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'latest record'

      // Call the API to schedule the report
      const response = await fetch('/api/scheduled-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportName: data.reportName,
          reportType: data.reportType,
          frequency: data.frequency,
          recipients: data.emailRecipients,
          dateRange: {
            from: dateRange.from ? dateRange.from.toISOString() : null,
            to: dateRange.to ? dateRange.to.toISOString() : null
          },
          departmentFilter,
          reportTypeFilter,
          fileFormat: data.fileFormat,
          includeCharts: data.includeCharts,
          includeTables: data.includeTables,
          includeSummary: data.includeSummary
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule report');
      }
      
      const result = await response.json();
      
      // Show success message
      toast({
        title: "Report Scheduled",
        description: `Your ${data.reportType} report will be sent ${data.frequency}.`,
      })

      // Close modal and reset form
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error scheduling report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Regular Report</DialogTitle>
          <DialogDescription>Set up automated report generation and delivery on a regular schedule</DialogDescription>
        </DialogHeader>

        {/* Beta notification banner */}
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Beta Feature
              </p>
              <p className="text-sm mt-1">
                The report scheduler is still under development and may not be fully stable.
                Some scheduling features might be incomplete or not work as expected.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="reportName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Financial Summary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="clinical">Clinical</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="combined">Combined Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emailRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Recipients</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com, another@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Separate multiple email addresses with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Report Content</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="includeCharts"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Include charts and visualizations</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeTables"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Include data tables</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeSummary"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Include executive summary</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Filters Applied</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Date Range:</span> {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'All time'} 
                  - {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'Present'}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
                </div>
                <div>
                  <span className="font-medium">Report Type:</span> {reportTypeFilter === 'all' ? 'All Types' : reportTypeFilter}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

