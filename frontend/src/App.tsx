import { useState } from 'react';
import Chat from './components/chat/Chat.tsx';
import PhoneInput from './components/auth/PhoneInput.tsx';
import './App.css';

function App() {
  const [phone, setPhone] = useState<string | null>(null);
  const parsedPhone = '+4' + phone;

  if (!phone) {
    return <PhoneInput onPhoneSubmit={setPhone} />;
  }

  return (
    <div className="app">
      <Chat phone={parsedPhone} />
    </div>
  );
}

export default App;
