import React from 'react';

interface MessageType {
  id: string;
  text: string;
  isUser: boolean;
}

interface UseSendMessageProps {
  phone: string;
  input: string;
  setInput: (value: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  setError: (error: string | null) => void;
}

export const useSendMessage = ({phone, input, setInput, setMessages, setError,}: UseSendMessageProps) => {
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now()
              .toString(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');

    const typingId = `typing-${Date.now()}`;
    const typingMessage: MessageType = {
      id: typingId,
      text: 'Typing...',
      isUser: false,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({from: phone, text: messageText}),
      });
      const data = await response.json();

      setMessages(prev => prev.map(msg =>
        msg.id === typingId
          ? {id: typingId, text: data.reply, isUser: false}
          : msg
      ));
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => msg.id !== typingId));
      setError(error.message || 'Something went wrong server side.');
    }
  };

  return {handleSend};
};