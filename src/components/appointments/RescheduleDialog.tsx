
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  appointmentId: number;
}

const availableTimes = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const formattedDate = format(selectedDate, 'dd/MM/yyyy');
      onConfirm(formattedDate, selectedTime);
      onClose();
      setSelectedDate(undefined);
      setSelectedTime('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedDate(undefined);
    setSelectedTime('');
  };

  // Disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>שינוי מועד התור</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">בחר תאריך חדש:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">בחר שעה חדשה:</label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-xs"
                >
                  <Clock className="ml-1 h-3 w-3" />
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              ביטול
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
            >
              אישור שינוי
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
