
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ReportData } from './reportTypes';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ReportGenerator {
  static generatePDF(data: ReportData): void {
    const doc = new jsPDF();
    
    // Add Hebrew font support (basic)
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text('דוח הזמנות', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`${data.businessName}`, 20, 35);
    doc.text(`תקופה: ${format(data.dateRange.start, 'dd/MM/yyyy')} - ${format(data.dateRange.end, 'dd/MM/yyyy')}`, 20, 45);
    doc.text(`נוצר בתאריך: ${format(data.generatedAt, 'dd/MM/yyyy HH:mm')}`, 20, 55);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('סיכום כללי', 20, 75);
    
    const summaryData = [
      ['סה"כ תורים', data.summary.totalAppointments.toString()],
      ['תורים שהושלמו', data.summary.completedAppointments.toString()],
      ['תורים שבוטלו', data.summary.cancelledAppointments.toString()],
      ['אחוז הצלחה', `${data.summary.successRate.toFixed(1)}%`],
      ['סה"כ הכנסות', `₪${data.summary.totalRevenue.toLocaleString()}`]
    ];
    
    doc.autoTable({
      head: [['פרמטר', 'ערך']],
      body: summaryData,
      startY: 85,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Services section
    if (data.services.length > 0) {
      doc.setFontSize(14);
      doc.text('פירוט שירותים', 20, doc.lastAutoTable.finalY + 20);
      
      const servicesData = data.services.map(service => [
        service.name,
        service.count.toString(),
        `₪${service.revenue.toLocaleString()}`
      ]);
      
      doc.autoTable({
        head: [['שירות', 'כמות', 'הכנסות']],
        body: servicesData,
        startY: doc.lastAutoTable.finalY + 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [46, 125, 50] }
      });
    }
    
    // Save the PDF
    const fileName = `report_${format(data.dateRange.start, 'dd-MM-yyyy')}_${format(data.dateRange.end, 'dd-MM-yyyy')}.pdf`;
    doc.save(fileName);
  }
  
  static generateExcel(data: ReportData): void {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['דוח הזמנות - ' + data.businessName],
      [''],
      ['תקופה:', `${format(data.dateRange.start, 'dd/MM/yyyy')} - ${format(data.dateRange.end, 'dd/MM/yyyy')}`],
      ['נוצר בתאריך:', format(data.generatedAt, 'dd/MM/yyyy HH:mm')],
      [''],
      ['סיכום כללי:'],
      ['סה"כ תורים', data.summary.totalAppointments],
      ['תורים שהושלמו', data.summary.completedAppointments],
      ['תורים שבוטלו', data.summary.cancelledAppointments],
      ['אחוז הצלחה', `${data.summary.successRate.toFixed(1)}%`],
      ['סה"כ הכנסות', data.summary.totalRevenue],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום');
    
    // Services sheet
    if (data.services.length > 0) {
      const servicesData = [
        ['שירות', 'כמות', 'הכנסות'],
        ...data.services.map(service => [service.name, service.count, service.revenue])
      ];
      
      const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
      XLSX.utils.book_append_sheet(workbook, servicesSheet, 'שירותים');
    }
    
    // Daily stats sheet
    if (data.dailyStats.length > 0) {
      const dailyData = [
        ['תאריך', 'תורים', 'הכנסות'],
        ...data.dailyStats.map(day => [day.date, day.appointments, day.revenue])
      ];
      
      const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(workbook, dailySheet, 'נתונים יומיים');
    }
    
    // Save the Excel file
    const fileName = `report_${format(data.dateRange.start, 'dd-MM-yyyy')}_${format(data.dateRange.end, 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}
