import { useState, useEffect } from 'react';
import Chat from './components/chat/Chat.tsx';
import PhoneInput from './components/auth/PhoneInput.tsx';
import { getCachedPhone, setCachedPhone, clearCachedPhone } from './utils/phoneCache';
import './App.css';

function App() {
  const [phone, setPhone] = useState<string | null>(null);

  // check cache on mount
  useEffect(() => {
    const cachedPhone = getCachedPhone();
    if (cachedPhone) {
      setPhone(cachedPhone);
    }
  }, []);

  const handlePhoneSubmit = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setCachedPhone(phoneNumber);
  };

  const handleLogout = () => {
    setPhone(null);
    clearCachedPhone();
  };

  if (!phone) {
    return <PhoneInput onPhoneSubmit={handlePhoneSubmit} />;
  }

  const parsedPhone = '+4' + phone;

  return (
    <div className="app">
      <Chat phone={parsedPhone} onLogout={handleLogout} />
    </div>
  );
}

export default App;
