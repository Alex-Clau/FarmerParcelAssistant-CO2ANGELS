import './Modal.css';
import React from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal = ({ show, onClose, title, children }: ModalProps) => {
  if (!show) return null;

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modal">
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
          </div>
        )}
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
};

export default Modal;

