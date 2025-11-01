import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Activity {
  name: string;
  description: string;
  accessibilityNote?: string;
}

interface DailyPlan {
  day: number;
  title: string;
  morningActivity: Activity;
  afternoonActivity: Activity;
  eveningSuggestion: string;
}

interface ItineraryData {
  tripTitle: string;
  summary: string;
  dailyPlan: DailyPlan[];
}

export function generateItineraryPDF(itineraryData: ItineraryData) {
  const doc = new jsPDF();
  let yPosition = 20;
  
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('Unrushed Europe', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Your Personalized Travel Itinerary', 105, 25, { align: 'center' });
  
  yPosition = 50;
  
  doc.setFontSize(20);
  doc.setTextColor(41, 37, 36);
  const titleLines = doc.splitTextToSize(itineraryData.tripTitle, 170);
  titleLines.forEach((line: string) => {
    doc.text(line, 105, yPosition, { align: 'center' });
    yPosition += 8;
  });
  
  yPosition += 5;
  
  doc.setFontSize(11);
  doc.setTextColor(87, 83, 78);
  const summaryLines = doc.splitTextToSize(itineraryData.summary, 170);
  summaryLines.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, 105, yPosition, { align: 'center' });
    yPosition += 6;
  });
  
  yPosition += 10;
  
  itineraryData.dailyPlan.forEach((day) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(15, yPosition - 5, 180, 12, 2, 2, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(17, 94, 89);
    doc.setFont(undefined, 'bold');
    doc.text(`Day ${day.day}: ${day.title}`, 20, yPosition + 3);
    doc.setFont(undefined, 'normal');
    
    yPosition += 15;
    
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(20, yPosition - 3, 170, 8, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(120, 53, 15);
    doc.setFont(undefined, 'bold');
    doc.text('🌅 Morning', 25, yPosition + 2);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    doc.setFont(undefined, 'bold');
    const morningNameLines = doc.splitTextToSize(day.morningActivity.name, 160);
    morningNameLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    doc.setFont(undefined, 'normal');
    
    doc.setTextColor(68, 64, 60);
    const morningDescLines = doc.splitTextToSize(day.morningActivity.description, 160);
    morningDescLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    
    if (day.morningActivity.accessibilityNote) {
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      const accessLines = doc.splitTextToSize(`♿ ${day.morningActivity.accessibilityNote}`, 160);
      accessLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 4;
      });
      doc.setFontSize(10);
    }
    
    yPosition += 5;
    
    doc.setFillColor(224, 242, 254);
    doc.roundedRect(20, yPosition - 3, 170, 8, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(12, 74, 110);
    doc.setFont(undefined, 'bold');
    doc.text('☀️ Afternoon', 25, yPosition + 2);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    doc.setFont(undefined, 'bold');
    const afternoonNameLines = doc.splitTextToSize(day.afternoonActivity.name, 160);
    afternoonNameLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    doc.setFont(undefined, 'normal');
    
    doc.setTextColor(68, 64, 60);
    const afternoonDescLines = doc.splitTextToSize(day.afternoonActivity.description, 160);
    afternoonDescLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    
    if (day.afternoonActivity.accessibilityNote) {
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      const accessLines = doc.splitTextToSize(`♿ ${day.afternoonActivity.accessibilityNote}`, 160);
      accessLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 4;
      });
      doc.setFontSize(10);
    }
    
    yPosition += 5;
    
    doc.setFillColor(224, 231, 255);
    doc.roundedRect(20, yPosition - 3, 170, 8, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(55, 48, 163);
    doc.setFont(undefined, 'bold');
    doc.text('🌙 Evening', 25, yPosition + 2);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(68, 64, 60);
    const eveningLines = doc.splitTextToSize(day.eveningSuggestion, 160);
    eveningLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
  });
  
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    doc.text(
      'Created with Unrushed Europe AI Planner',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }
  
  const today = new Date().toISOString().split('T')[0];
  const sanitizedTitle = itineraryData.tripTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const filename = `${sanitizedTitle}-${today}.pdf`;
  
  doc.save(filename);
}

interface PDFDownloadButtonProps {
  itineraryData: ItineraryData;
  disabled?: boolean;
  className?: string;
}

export default function PDFDownloadButton({ 
  itineraryData, 
  disabled = false, 
  className = '' 
}: PDFDownloadButtonProps) {
  const handleDownload = () => {
    if (!itineraryData) {
      alert('No itinerary available to download');
      return;
    }
    
    try {
      generateItineraryPDF(itineraryData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-6 py-3 
        bg-emerald-600 hover:bg-emerald-700 
        text-white font-medium rounded-lg 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
        ${className}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      Download PDF Itinerary
    </button>
  );
}