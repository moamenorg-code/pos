import React, { useState, useEffect, useRef } from 'react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isOpen && videoRef.current) {
        try {
          setError(null);
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("لم يتم السماح بالوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
        }
      }
    };
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScanSuccess(barcode.trim());
      setBarcode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center" onClick={onClose}>
      <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
        <video ref={videoRef} className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <div className="w-3/4 max-w-md h-48 border-4 border-dashed border-white/70 rounded-lg relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 animate-scan"></div>
          </div>
          <p className="mt-4 text-white font-bold text-lg bg-black/50 p-2 rounded">
            وجه الكاميرا نحو الباركود
          </p>
        </div>
        
        {error && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white p-4 rounded-lg text-center">
                <p>{error}</p>
            </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 bg-black/70">
          <form onSubmit={handleSubmit}>
            <label htmlFor="barcode-input" className="text-white mb-2 block text-center">
              أو أدخل الباركود يدويًا للمحاكاة
            </label>
            <input
              id="barcode-input"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="...اكتب الباركود واضغط Enter"
              autoFocus
            />
          </form>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 bg-white/30 text-white font-bold text-2xl w-10 h-10 rounded-full">
            &times;
        </button>
      </div>
      <style>{`
        @keyframes scan {
            0% { transform: translateY(-90px); }
            100% { transform: translateY(90px); }
        }
        .animate-scan {
            animation: scan 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScannerModal;