import {useState, useRef, useEffect} from 'react';
import Message from './Message.tsx';
import './Chat.css';
import ErrorModal from "../ui/ErrorModal.tsx";
import { useSendMessage } from '../../hooks/useSendMessage';
import { useGenerateReports } from '../../hooks/useGenerateReports';

interface MessageType {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatProps {
  phone: string;
  onLogout: () => void;
}

const Chat = ({phone, onLogout}: ChatProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const { handleSend } = useSendMessage({
    phone,
    input,
    setInput,
    setMessages,
    setError,
  });

  const { handleGenerateReports, isGeneratingReports } = useGenerateReports({
    setMessages,
    setError,
  });

  return <>
    {error && <ErrorModal
      error={error}
      onClose={() => setError(null)}
    />}

    <div className="chat-container">
      <div className="chat-header">
        <div>
        <h2>Farmer Assistant</h2>
        <p>{phone}</p>
        </div>
        <button
          onClick={onLogout}
          className="logout-button"
          title="Logout"
        >
          Logout
        </button>
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
          onClick={handleGenerateReports}
          className="generate-reports-button"
          disabled={isGeneratingReports}
        >
          {isGeneratingReports ? 'Generating...' : 'Generate Reports'}
        </button>
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