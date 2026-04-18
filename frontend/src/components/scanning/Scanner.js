import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

const Scanner = ({ onScan }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'scan.jpg');
      
      // Send to backend
      fetch('/api/scanning/scan', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => onScan(data))
      .catch(error => console.error('Error scanning:', error));
    });
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  return (
    <div className="scanner">
      <video ref={videoRef} autoPlay playsInline style={{ display: isScanning ? 'block' : 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!isScanning ? (
        <Button onClick={startCamera}>{t('scanning.startCamera')}</Button>
      ) : (
        <div>
          <Button onClick={captureImage}>{t('scanning.capture')}</Button>
          <Button onClick={stopCamera}>{t('scanning.stop')}</Button>
        </div>
      )}
    </div>
  );
};

export default Scanner;