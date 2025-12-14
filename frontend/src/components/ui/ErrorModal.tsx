import Modal from './Modal';
import Button from './Button';

interface ErrorModalProps {
  error: string | null;
  onClose: () => void;
}

const ErrorModal = ({ error, onClose }: ErrorModalProps) => {
  return (
    <Modal show={!!error} onClose={onClose} title="Error">
      <p>{error}</p>
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <Button onClick={onClose}>Okay</Button>
      </div>
    </Modal>
  );
};

export default ErrorModal;

