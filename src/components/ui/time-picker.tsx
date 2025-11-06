import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  minTime?: string;
  maxTime?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'בחר שעה',
  minTime,
  maxTime
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(
    value ? parseInt(value.split(':')[0]) : null
  );
  const [selectedMinute, setSelectedMinute] = useState<number | null>(
    value ? parseInt(value.split(':')[1]) : null
  );
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen && selectedHour !== null) {
      setTimeout(() => {
        const hourElement = hourRef.current?.querySelector(`[data-hour="${selectedHour}"]`);
        hourElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
    if (isOpen && selectedMinute !== null) {
      setTimeout(() => {
        const minuteElement = minuteRef.current?.querySelector(`[data-minute="${selectedMinute}"]`);
        minuteElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      const time = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      onChange(time);
      setIsOpen(false);
    }
  };

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      const time = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(time);
      setIsOpen(false);
    }
  };

  const displayValue = value || placeholder;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-right font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="ml-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <div className="flex" dir="rtl">
            {/* Minutes Column - First (Right side in RTL) */}
            <div className="flex-1 border-l">
              <div className="px-2 py-1.5 bg-muted/50 border-b">
                <p className="text-xs font-semibold text-center">דקות</p>
              </div>
              <div 
                ref={minuteRef}
                className="max-h-[180px] overflow-y-auto scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {minutes.map((minute) => {
                  return (
                    <button
                      key={minute}
                      type="button"
                      data-minute={minute}
                      onClick={() => handleMinuteSelect(minute)}
                      className={cn(
                        "w-full px-2 py-2 text-sm text-center hover:bg-accent transition-colors",
                        selectedMinute === minute && "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                      )}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours Column - Second (Left side in RTL) */}
            <div className="flex-1">
              <div className="px-2 py-1.5 bg-muted/50 border-b">
                <p className="text-xs font-semibold text-center">שעה</p>
              </div>
              <div 
                ref={hourRef}
                className="max-h-[180px] overflow-y-auto scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {hours.map((hour) => {
                  const isDisabled = 
                    (minTime && hour < parseInt(minTime.split(':')[0])) ||
                    (maxTime && hour > parseInt(maxTime.split(':')[0]));
                  
                  return (
                    <button
                      key={hour}
                      type="button"
                      data-hour={hour}
                      onClick={() => !isDisabled && handleHourSelect(hour)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full px-2 py-2 text-sm text-center hover:bg-accent transition-colors",
                        selectedHour === hour && "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
                        isDisabled && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      {hour.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="border-t p-1.5 flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => {
                const now = new Date();
                const hour = now.getHours();
                const minute = Math.floor(now.getMinutes() / 15) * 15;
                setSelectedHour(hour);
                setSelectedMinute(minute);
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                onChange(time);
                setIsOpen(false);
              }}
            >
              עכשיו
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => {
                setSelectedHour(null);
                setSelectedMinute(null);
                setIsOpen(false);
              }}
            >
              ביטול
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimePicker;

