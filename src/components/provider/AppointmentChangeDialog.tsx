
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: Date, newTime: string) => void;
  currentDate: string;
  currentTime: string;
}

const AppointmentChangeDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentDate,
  currentTime
}: AppointmentChangeDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>שינוי מועד התור</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              מועד נוכחי: {currentDate} בשעה {currentTime}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">בחר תאריך חדש</label>
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
                  {selectedDate ? format(selectedDate, "PPP", { locale: he }) : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">בחר שעה חדשה</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  <Clock className="h-3 w-3 ml-1" />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            ביטול
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="bg-freezefit-300 hover:bg-freezefit-400 text-black"
          >
            אשר שינוי
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentChangeDialog;
