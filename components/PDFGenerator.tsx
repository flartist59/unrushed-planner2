import React from 'react';
import { jsPDF } from 'jspdf';

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
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const textLineHeight = 5; // Approximate line height for text wrapping
  const sectionSpacing = 10; // Spacing between different sections (e.g., summary and daily plan)
  const activitySpacing = 3; // Spacing between activities within a day

  // Helper function to add text with wrapping and page breaks
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    lineHeight: number,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = y;

    lines.forEach((line: string) => {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, x, currentY, { align });
      currentY += lineHeight;
    });
    return currentY;
  };

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('Unrushed Europe', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Your Personalized Travel Itinerary', pageWidth / 2, 25, { align: 'center' });

  yPosition = 50;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(41, 37, 36);
  yPosition = addWrappedText(itineraryData.tripTitle, pageWidth / 2, yPosition, maxWidth, 18, 7, 'center');
  yPosition += sectionSpacing / 2;

  // Summary
  doc.setFontSize(11);
  doc.setTextColor(87, 83, 78);
  yPosition = addWrappedText(itineraryData.summary, pageWidth / 2, yPosition, maxWidth, 11, 6, 'center');
  yPosition += sectionSpacing;

  // Daily itinerary
  itineraryData.dailyPlan.forEach((day) => {
    // Check for new page before starting a new day section
    if (yPosition > pageHeight - (margin + 60)) { // Ensure enough space for day header and at least one activity
      doc.addPage();
      yPosition = margin;
    }

    // Day header
    doc.setFillColor(240, 253, 250);
    doc.rect(margin, yPosition - 5, maxWidth, 10, 'F');

    doc.setFontSize(14);
    doc.setTextColor(17, 94, 89);
    doc.text(`Day ${day.day}: ${day.title}`, margin + 5, yPosition + 2);

    yPosition += 12;

    // Morning
    doc.setFontSize(11);
    doc.setTextColor(120, 53, 15);
    doc.text('MORNING', margin + 5, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    yPosition = addWrappedText(
      `${day.morningActivity.name} - ${day.morningActivity.description}`,
      margin + 5,
      yPosition,
      maxWidth - 10, // Indent for activity details
      10,
      textLineHeight
    );

    if (day.morningActivity.accessibilityNote) {
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      yPosition = addWrappedText(
        `Accessibility: ${day.morningActivity.accessibilityNote}`,
        margin + 5,
        yPosition,
        maxWidth - 10,
        8,
        textLineHeight - 1
      );
    }
    yPosition += activitySpacing;

    // Afternoon
    doc.setFontSize(11);
    doc.setTextColor(12, 74, 110);
    doc.text('AFTERNOON', margin + 5, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    yPosition = addWrappedText(
      `${day.afternoonActivity.name} - ${day.afternoonActivity.description}`,
      margin + 5,
      yPosition,
      maxWidth - 10,
      10,
      textLineHeight
    );

    if (day.afternoonActivity.accessibilityNote) {
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      yPosition = addWrappedText(
        `Accessibility: ${day.afternoonActivity.accessibilityNote}`,
        margin + 5,
        yPosition,
        maxWidth - 10,
        8,
        textLineHeight - 1
      );
    }
    yPosition += activitySpacing;

    // Evening
    doc.setFontSize(11);
    doc.setTextColor(55, 48, 163);
    doc.text('EVENING', margin + 5, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    yPosition = addWrappedText(
      day.eveningSuggestion,
      margin + 5,
      yPosition,
      maxWidth - 10,
      10,
      textLineHeight
    );

    yPosition += sectionSpacing; // Space after each day
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' }); // Adjusted Y
    doc.text('Created with Unrushed Europe AI Planner', pageWidth / 2, pageHeight - 10, { align: 'center' }); // Adjusted Y
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `unrushed-europe-itinerary-${today}.pdf`;
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