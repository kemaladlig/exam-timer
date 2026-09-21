import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 2,
  duration = 750,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const targetValue = value;
    const diff = targetValue - startValue;
    prevValueRef.current = value;

    // Ignore micro changes
    if (Math.abs(diff) < 0.001) {
      setDisplayValue(targetValue);
      return;
    }

    // Smooth duration
    const animDuration = Math.min(
      950,
      Math.max(600, duration + Math.min(Math.abs(diff) * 10, 200))
    );

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      
      // Quartic ease-out curve for natural deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + diff * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {displayValue.toFixed(decimals)}
    </span>
  );
}

