import { useEffect, useState, useRef } from "react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

export function Counter({ end, suffix = "", duration = 2, decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime: number | undefined;
          const startValue = 0;
          const endValue = end;
          
          const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
          
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const easedProgress = easeOutQuart(progress);
            const currentValue = Math.floor(startValue + easedProgress * (endValue - startValue));
            
            setCount(currentValue);
            
            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          };
          
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );
    
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    
    return () => {
      if (nodeRef.current) {
        observer.unobserve(nodeRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, decimals]);
  
  return (
    <span ref={nodeRef}>
      {count.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
} 