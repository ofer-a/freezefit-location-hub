
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Download, Clock } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface AnalyticsDashboardProps {
  onBack: () => void;
}

const AnalyticsDashboard = ({ onBack }: AnalyticsDashboardProps) => {
  const { user } = useAuth();
  const [selectedDays, setSelectedDays] = useState('7');

  // Mock data - in real app, this would come from your data context or API
  const generateMockData = (days: number) => {
    const data = [];
    const revenue = [];
    const services = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'dd/MM', { locale: he });
      const appointments = Math.floor(Math.random() * 15) + 5;
      const dailyRevenue = Math.floor(Math.random() * 2000) + 1000;
      
      data.push({
        date,
        appointments,
        completed: Math.floor(appointments * 0.8),
        cancelled: Math.floor(appointments * 0.1),
        pending: Math.floor(appointments * 0.1)
      });
      
      revenue.push({
        date,
        revenue: dailyRevenue,
        target: 1500
      });
    }

    // Services data
    const serviceTypes = ['טיפול שיקום', 'טיפול ספורטאים', 'טיפול סטנדרטי', 'קריותרפיה מתקדמת'];
    serviceTypes.forEach(service => {
      services.push({
        name: service,
        count: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 5000) + 2000
      });
    });

    return { appointments: data, revenue, services };
  };

  const data = useMemo(() => generateMockData(parseInt(selectedDays)), [selectedDays]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAppointments = data.appointments.reduce((sum, day) => sum + day.appointments, 0);
    const totalRevenue = data.revenue.reduce((sum, day) => sum + day.revenue, 0);
    const completedAppointments = data.appointments.reduce((sum, day) => sum + day.completed, 0);
    const successRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    return {
      totalAppointments,
      totalRevenue,
      completedAppointments,
      successRate: Math.round(successRate)
    };
  }, [data]);

  const chartConfig = {
    appointments: { label: 'תורים', color: '#3b82f6' },
    completed: { label: 'הושלמו', color: '#10b981' },
    cancelled: { label: 'בוטלו', color: '#ef4444' },
    pending: { label: 'בהמתנה', color: '#f59e0b' },
    revenue: { label: 'הכנסות', color: '#8b5cf6' }
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Add Hebrew font support (basic)
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text('דוח ניתוח נתונים', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`תקופה: ${selectedDays} ימים אחרונים`, 20, 35);
    doc.text(`נוצר בתאריך: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 45);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('סיכום כללי', 20, 60);
    
    const summaryData = [
      ['סה"כ תורים', totals.totalAppointments.toString()],
      ['תורים שהושלמו', totals.completedAppointments.toString()],
      ['אחוז הצלחה', `${totals.successRate}%`],
      ['סה"כ הכנסות', `₪${totals.totalRevenue.toLocaleString()}`]
    ];
    
    doc.autoTable({
      head: [['פרמטר', 'ערך']],
      body: summaryData,
      startY: 70,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    const fileName = `analytics_report_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" onClick={onBack} className="mb-4">
              ← חזרה ללוח הבקרה
            </Button>
            <h1 className="text-3xl font-bold">ניתוח נתונים מתקדם</h1>
            <p className="text-gray-600">צפייה מפורטת בביצועי המכון</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <Select value={selectedDays} onValueChange={setSelectedDays}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ימים אחרונים</SelectItem>
                <SelectItem value="14">14 ימים אחרונים</SelectItem>
                <SelectItem value="30">30 ימים אחרונים</SelectItem>
                <SelectItem value="90">90 ימים אחרונים</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              הורד דוח
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה״כ תורים</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                ב-{selectedDays} ימים אחרונים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הכנסות כוללות</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₪{totals.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ממוצע יומי: ₪{Math.round(totals.totalRevenue / parseInt(selectedDays)).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">אחוז הצלחה</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totals.completedAppointments} מתוך {totals.totalAppointments} תורים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממוצע תורים יומי</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.totalAppointments / parseInt(selectedDays))}
              </div>
              <p className="text-xs text-muted-foreground">
                תורים ביום
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments Chart */}
          <Card>
            <CardHeader>
              <CardTitle>תורים לפי יום</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.appointments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} />
                    <Bar dataKey="pending" stackId="a" fill={chartConfig.pending.color} />
                    <Bar dataKey="cancelled" stackId="a" fill={chartConfig.cancelled.color} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>הכנסות יומיות</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={chartConfig.revenue.color} 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Services Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>התפלגות שירותים</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.services}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.services.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>פירוט שירותים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.services.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.count} תורים</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">₪{service.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">הכנסות</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
