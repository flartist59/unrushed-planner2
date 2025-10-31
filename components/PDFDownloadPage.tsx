import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import jsPDF from 'jspdf';

const PDFDownloadPage = () => {
  useEffect(() => {
    const fetchSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (!sessionId) return;

      const res = await fetch(`/api/verify-session?sessionId=${sessionId}`);
      const data = await res.json();

      if (data.success && data.pdfContent) {
        const pdf = new jsPDF();
        pdf.text(JSON.stringify(data.pdfContent, null, 2), 10, 10);
        pdf.save('Itinerary.pdf');
      } else {
        alert('Payment not confirmed or PDF unavailable.');
      }
    };

    fetchSession();
  }, []);

  return <div>Preparing your PDF…</div>;
};

export default PDFDownloadPage;

