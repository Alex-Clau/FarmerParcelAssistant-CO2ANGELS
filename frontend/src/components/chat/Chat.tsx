import {useState, useRef, useEffect} from 'react';
import Message from './Message.tsx';
import './Chat.css';
import ErrorModal from "../ui/ErrorModal.tsx";

interface MessageType {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatProps {
  phone: string;
}

const Chat = ({phone}: ChatProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

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

    const typingId = `typing-${Date.now()}`; // add a typing message till req finishes
    const typingMessage: MessageType = {
      id: typingId,
      text: 'Typing...',
      isUser: false,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('http://localhost:6777/message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({from: phone, text: messageText}),
      });
      const data = await response.json();

      setMessages(prev => prev.map(msg => // replace the typing message with actual response
        msg.id === typingId
          ? {id: typingId, text: data.reply, isUser: false}
          : msg
      ));
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => msg.id !== typingId)); // remove typing message on error
      setError(error.message || 'Something went wrong server side.');
    }
  };

  return <>
    {error && <ErrorModal
      error={error}
      onClose={() => setError(null)}
    />}

    <div className="chat-container">
      <div className="chat-header">
        <h2>Farmer Assistant</h2>
        <p>{phone}</p>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
          />
        ))}
        <div ref={messagesEndRef}/>
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="message-input"
        />
        <button
          onClick={handleSend}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  </>
};

export default Chat;
