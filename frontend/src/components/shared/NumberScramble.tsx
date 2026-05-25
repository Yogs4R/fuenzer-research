import { useState, useEffect } from 'react';

interface NumberScrambleProps {
  value: string;
  duration?: number;
}

const chars = '0123456789';

export function NumberScramble({ value, duration = 1500 }: NumberScrambleProps) {
  const [displayText, setDisplayText] = useState(value);

  useEffect(() => {
    let start = Date.now();
    let frameId: number;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);

      if (progress < 1) {
        // Scramble
        const scrambled = value
          .split('')
          .map((char) => {
            // Keep non-numeric characters intact (like +, M, %)
            if (!/[0-9]/.test(char)) return char;
            // Otherwise randomize
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        setDisplayText(scrambled);
        frameId = requestAnimationFrame(animate);
      } else {
        // Settle on actual value
        setDisplayText(value);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span>{displayText}</span>;
}
