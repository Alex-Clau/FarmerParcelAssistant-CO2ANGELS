import './Message.css';

interface MessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
  };
}

const Message = ({ message }: MessageProps) => {
  return (
    <div className={`message ${message.isUser ? 'user' : 'bot'}`}>
      <div className="message-bubble">
        {message.text}
      </div>
    </div>
  );
};

export default Message;
