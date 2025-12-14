import {useState} from 'react';
import './PhoneInput.css';
import React from "react";
import ErrorModal from "../ui/ErrorModal.tsx";

interface PhoneInputProps {
  onPhoneSubmit: (phone: string) => void;
}

const PhoneInput = ({onPhoneSubmit}: PhoneInputProps) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<any>(null);

  const isValidSimplePhoneNumber = (phone: string): boolean => {
    const cleanedPhone = phone.replace(/\D/g, ''); // remove all non-digit chars

    const regex = /^\d{10}$/; // exactly 10 digits
    return regex.test(cleanedPhone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedPhone = phone.replace(/\D/g, ''); // remove all non-digit chars
    if (isValidSimplePhoneNumber(cleanedPhone)) {
      onPhoneSubmit(cleanedPhone);
    } else {
      setError('Invalid phone number');
    }
  };

  return <>
    {error && <ErrorModal
      error={error}
      onClose={() => setError(null)}
    />}

    <div className="phone-input-container">
      <div className="phone-input-box">
        <h2>Farmer Parcel Assistant</h2>
        <p>Enter your phone number to start</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="0712345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit(e)}
            className="phone-input-field"
            autoFocus
          />
          <button
            type="submit"
            className="phone-submit-button"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  </>
};

export default PhoneInput;

