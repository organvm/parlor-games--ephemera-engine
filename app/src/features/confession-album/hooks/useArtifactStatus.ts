import { useState, useEffect } from 'react';

export const useArtifactStatus = (sessionId: string) => {
  const [status, setStatus] = useState('pending');

  const generate = () => {
    setStatus('generating');
    setTimeout(() => {
      setStatus('ready');
    }, 2000);
  };

  return { status, generate };
};
