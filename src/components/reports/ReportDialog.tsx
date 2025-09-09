
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, AlertCircle } from 'lucide-react';
import { format, differenceInDays, isFuture, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { dbOperations } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { ReportGenerator } from '@/lib/reportGenerator';
import type { ReportData, ReportFilters } from '@/lib/reportTypes';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const validateDateRange = (): string | null => {
    if (!startDate || !endDate) {
      return 'יש לבחור תאריך התחלה וסיום';
    }
    
    if (startDate > endDate) {
      return 'תאריך ההתחלה חייב להיות לפני תאריך הסיום';
    }
    
    if (isFuture(endDate)) {
      return 'תאריך הסיום לא יכול להיות בעתיד';
    }
    
    const daysDiff = differenceInDays(endDate, startDate);
    if (daysDiff > 31) {
      return 'טווח התאריכים לא יכול לעלות על 31 יום';
    }
    
    const maxDate = addDays(new Date(), 0);
    if (endDate > maxDate) {
      return 'תאריך הסיום לא יכול להיות בעתיד';
    }
    
    return null;
  };

  const fetchReportData = async (filters: ReportFilters): Promise<ReportData | null> => {
    try {
      // Get user's institute
      const institutes = await dbOperations.getInstitutesByOwner(user?.id || '');
      
      if (!institutes || institutes.length === 0) {
        throw new Error('לא נמצא מכון המשויך למשתמש');
      }
      
      const institute = institutes[0]; // Use first institute

      // Fetch appointments for the date range
      const allAppointments = await dbOperations.getAppointmentsByInstitute(institute.id);
      
      // Filter appointments by date range
      const appointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        const startDate = new Date(format(filters.startDate, 'yyyy-MM-dd'));
        const endDate = new Date(format(filters.endDate, 'yyyy-MM-dd'));
        return aptDate >= startDate && aptDate <= endDate;
      });

      if (!appointments || appointments.length === 0) {
        return null;
      }

      // Calculate summary statistics
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;
      const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
      const successRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
      const totalRevenue = appointments
        .filter(apt => apt.status === 'confirmed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      // Group by services
      const serviceStats = new Map<string, { count: number; revenue: number }>();
      appointments.forEach(apt => {
        const serviceName = apt.service_name || 'שירות לא מוגדר';
        if (!serviceStats.has(serviceName)) {
          serviceStats.set(serviceName, { count: 0, revenue: 0 });
        }
        const stats = serviceStats.get(serviceName)!;
        stats.count++;
        if (apt.status === 'confirmed') {
          stats.revenue += apt.price || 0;
        }
      });

      const services = Array.from(serviceStats.entries()).map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue
      }));

      // Group by date for daily stats
      const dailyStats = new Map<string, { appointments: number; revenue: number }>();
      appointments.forEach(apt => {
        const dateStr = format(new Date(apt.appointment_date), 'dd/MM/yyyy');
        if (!dailyStats.has(dateStr)) {
          dailyStats.set(dateStr, { appointments: 0, revenue: 0 });
        }
        const stats = dailyStats.get(dateStr)!;
        stats.appointments++;
        if (apt.status === 'confirmed') {
          stats.revenue += apt.price || 0;
        }
      });

      const dailyStatsArray = Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        appointments: stats.appointments,
        revenue: stats.revenue
      }));

      return {
        businessName: institutes.institute_name,
        dateRange: {
          start: filters.startDate,
          end: filters.endDate
        },
        generatedAt: new Date(),
        summary: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          successRate,
          totalRevenue
        },
        services,
        dailyStats: dailyStatsArray
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  };

  const handleGenerateReport = async () => {
    const validationError = validateDateRange();
    if (validationError) {
      toast({
        title: 'שגיאה',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    if (!startDate || !endDate) return;

    setIsGenerating(true);
    
    try {
      const filters: ReportFilters = {
        startDate,
        endDate,
        format: reportFormat
      };

      const reportData = await fetchReportData(filters);
      
      if (!reportData) {
        toast({
          title: 'אין נתונים',
          description: 'לא נמצאו תורים בתקופה הנבחרת',
          variant: 'destructive'
        });
        return;
      }

      // Generate the report
      if (reportFormat === 'pdf') {
        ReportGenerator.generatePDF(reportData);
      } else {
        ReportGenerator.generateExcel(reportData);
      }

      toast({
        title: 'הדוח נוצר בהצלחה',
        description: 'הקובץ הורד למחשב שלך'
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'שגיאה ביצירת הדוח',
        description: error instanceof Error ? error.message : 'אירעה שגיאה לא צפויה',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const dateError = validateDateRange();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>יצירת דוח הזמנות</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="start-date">תאריך התחלה</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: he }) : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => isFuture(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="end-date">תאריך סיום</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: he }) : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => isFuture(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="format">פורמט הדוח</Label>
              <Select value={reportFormat} onValueChange={(value: 'pdf' | 'excel') => setReportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר פורמט" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {dateError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleGenerateReport} 
              disabled={!!dateError || isGenerating}
            >
              {isGenerating ? (
                'מייצר דוח...'
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  יצור דוח
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
