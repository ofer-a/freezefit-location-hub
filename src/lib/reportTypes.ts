
export interface ReportData {
  businessName: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    successRate: number;
    totalRevenue: number;
  };
  services: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    appointments: number;
    revenue: number;
  }>;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  format: 'pdf' | 'excel';
}
