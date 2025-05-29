
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface BusinessHour {
  id?: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_open: boolean;
  institute_id: string;
}

interface BusinessHoursEditorProps {
  instituteId: string;
}

const BusinessHoursEditor = ({ instituteId }: BusinessHoursEditorProps) => {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { useBusinessHours, useUpdateBusinessHours } = useSupabaseData();
  const { data: existingHours = [], isLoading } = useBusinessHours(instituteId);
  const updateBusinessHoursMutation = useUpdateBusinessHours();

  const daysOfWeek = [
    'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
  ];

  useEffect(() => {
    // Initialize business hours with existing data or default closed state
    const initialHours = daysOfWeek.map((_, index) => {
      const existing = existingHours.find(hour => hour.day_of_week === index);
      return existing || {
        day_of_week: index,
        open_time: '09:00',
        close_time: '17:00',
        is_open: false,
        institute_id: instituteId
      };
    });
    setBusinessHours(initialHours);
  }, [existingHours, instituteId]);

  const handleTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', value: string) => {
    setBusinessHours(prev => prev.map(hour => 
      hour.day_of_week === dayIndex 
        ? { ...hour, [field]: value }
        : hour
    ));
    setHasChanges(true);
  };

  const handleOpenToggle = (dayIndex: number, isOpen: boolean) => {
    setBusinessHours(prev => prev.map(hour => 
      hour.day_of_week === dayIndex 
        ? { ...hour, is_open: isOpen }
        : hour
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateBusinessHoursMutation.mutateAsync(businessHours);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving business hours:', error);
    }
  };

  if (isLoading) {
    return <div>טוען שעות פעילות...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>שעות פעילות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {businessHours.map((hour, index) => (
          <div key={hour.day_of_week} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-16 font-medium">
              {daysOfWeek[index]}
            </div>
            
            <Switch
              checked={hour.is_open}
              onCheckedChange={(checked) => handleOpenToggle(hour.day_of_week, checked)}
            />
            
            {hour.is_open && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm">פתיחה:</label>
                  <Input
                    type="time"
                    value={hour.open_time || '09:00'}
                    onChange={(e) => handleTimeChange(hour.day_of_week, 'open_time', e.target.value)}
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm">סגירה:</label>
                  <Input
                    type="time"
                    value={hour.close_time || '17:00'}
                    onChange={(e) => handleTimeChange(hour.day_of_week, 'close_time', e.target.value)}
                    className="w-32"
                  />
                </div>
              </>
            )}
            
            {!hour.is_open && (
              <span className="text-gray-500">סגור</span>
            )}
          </div>
        ))}
        
        {hasChanges && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              className="bg-freezefit-300 hover:bg-freezefit-400"
              disabled={updateBusinessHoursMutation.isPending}
            >
              {updateBusinessHoursMutation.isPending ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessHoursEditor;
