import {useState} from 'react';
import React from 'react';

interface MessageType {
  id: string;
  text: string;
  isUser: boolean;
}

interface UseGenerateReportsProps {
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  setError: (error: string | null) => void;
}

export const useGenerateReports = ({setMessages, setError,}: UseGenerateReportsProps) => {
  const [isGeneratingReports, setIsGeneratingReports] = useState(false);

  const handleGenerateReports = async () => {
    setIsGeneratingReports(true);

    const loadingId = `loading-${Date.now()}`;
    const loadingMessage: MessageType = {
      id: loadingId,
      text: 'Generating reports...',
      isUser: false,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/generate-reports`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const reports = await response.json();
      const parsedReports = reports
        .map((report: { to: string; message: string }) =>
          `To: ${report.to}\n${report.message}`
        )
        .join('\n\n');

      const reportsText =  reports.length === 0 ? 'No farmer needs to be sent a report at this time.' : `Reports generated successfully!\n${reports.length} report${reports.length !== 1 ? 's' : ''} sent:\n\n${parsedReports}`;


      const resultMessage: MessageType = {
        id: Date.now().toString(),
        text: reportsText,
        isUser: false,
      };

      setMessages(prev => prev.map(msg =>
        msg.id === loadingId
          ? resultMessage
          : msg
      ));
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      setError(error.message || 'Failed to generate reports.');
    } finally {
      setIsGeneratingReports(false);
    }
  };

  return {handleGenerateReports, isGeneratingReports};
};