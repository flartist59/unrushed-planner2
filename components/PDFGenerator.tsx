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
  const textLineHeight = 5; // A base line height for calculations
  const sectionSpacing = 10;
  const activitySpacing = 3;

  // FIX: A more robust helper function for adding wrapped text.
  // It now calculates the total height of a text block beforehand to handle page breaks more cleanly.
  // It also leverages the built-in maxWidth property of the .text() function.
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    options: {
      maxWidth: number;
      fontSize: number;
      lineHeight: number;
      align?: 'left' | 'center' | 'right';
      fontStyle?: 'bold' | 'normal';
      textColor?: [number, number, number];
    }
  ) => {
    doc.setFontSize(options.fontSize);
    doc.setFont('helvetica', options.fontStyle || 'normal');
    if (options.textColor) {
      doc.setTextColor(options.textColor[0], options.textColor[1], options.textColor[2]);
    }

    const lines = doc.splitTextToSize(text, options.maxWidth);
    const textHeight = lines.length * options.lineHeight;

    // Check if the entire block fits, if not, add a new page
    if (y + textHeight > pageHeight - margin) {
      doc.addPage();
      y = margin; // Reset position to the top margin
    }

    doc.text(text, x, y, {
      maxWidth: options.maxWidth,
      align: options.align || 'left',
    });

    // Return the new Y position below the added text block
    return y + textHeight;
  };

  // --- PDF Content Generation ---

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
  yPosition = addWrappedText(itineraryData.tripTitle, pageWidth / 2, yPosition, {
    maxWidth: maxWidth,
    fontSize: 18,
    lineHeight: 7,
    align: 'center',
    textColor: [41, 37, 36],
  });
  yPosition += sectionSpacing / 2;

  // Summary
  yPosition = addWrappedText(itineraryData.summary, pageWidth / 2, yPosition, {
    maxWidth: maxWidth,
    fontSize: 11,
    lineHeight: 6,
    align: 'center',
    textColor: [87, 83, 78],
  });
  yPosition += sectionSpacing;

  // Daily itinerary
  itineraryData.dailyPlan.forEach((day) => {
    // Check for new page before starting a new day's section to ensure the header isn't orphaned
    if (yPosition > pageHeight - 60) { // 60 is an estimate for header + one activity
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

    // FIX: Define coordinates and widths for indented content for clarity and accuracy.
    const contentX = margin + 5;
    const contentMaxWidth = maxWidth - 10; // The available width for indented text

    // Morning
    doc.setFontSize(11);
    doc.setTextColor(120, 53, 15);
    doc.text('MORNING', contentX, yPosition);
    yPosition += 7;

    yPosition = addWrappedText(`${day.morningActivity.name} - ${day.morningActivity.description}`, contentX, yPosition, {
      maxWidth: contentMaxWidth,
      fontSize: 10,
      lineHeight: textLineHeight,
      textColor: [41, 37, 36],
    });

    if (day.morningActivity.accessibilityNote) {
      yPosition = addWrappedText(`Accessibility: ${day.morningActivity.accessibilityNote}`, contentX, yPosition, {
        maxWidth: contentMaxWidth,
        fontSize: 8,
        lineHeight: textLineHeight - 1,
        textColor: [120, 113, 108],
      });
    }
    yPosition += activitySpacing;

    // Afternoon
    doc.setFontSize(11);
    doc.setTextColor(12, 74, 110);
    doc.text('AFTERNOON', contentX, yPosition);
    yPosition += 7;

    yPosition = addWrappedText(`${day.afternoonActivity.name} - ${day.afternoonActivity.description}`, contentX, yPosition, {
      maxWidth: contentMaxWidth,
      fontSize: 10,
      lineHeight: textLineHeight,
      textColor: [41, 37, 36],
    });

    if (day.afternoonActivity.accessibilityNote) {
      yPosition = addWrappedText(`Accessibility: ${day.afternoonActivity.accessibilityNote}`, contentX, yPosition, {
        maxWidth: contentMaxWidth,
        fontSize: 8,
        lineHeight: textLineHeight - 1,
        textColor: [120, 113, 108],
      });
    }
    yPosition += activitySpacing;

    // Evening
    doc.setFontSize(11);
    doc.setTextColor(55, 48, 163);
    doc.text('EVENING', contentX, yPosition);
    yPosition += 7;

    yPosition = addWrappedText(day.eveningSuggestion, contentX, yPosition, {
      maxWidth: contentMaxWidth,
      fontSize: 10,
      lineHeight: textLineHeight,
      textColor: [41, 37, 36],
    });

    yPosition += sectionSpacing;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Created with Unrushed Europe AI Planner', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `unrushed-europe-itinerary-${today}.pdf`;
  doc.save(filename);
}

// --- React Component (No changes needed here) ---
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