import { useEffect, useRef } from 'react';

interface JotformPopupProps {
  formId: string;
  className?: string;
}

export default function JotformPopup({ formId, className = '' }: JotformPopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formId || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = `https://form.jotform.com/jsform/${formId}`;
    script.type = 'text/javascript';
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [formId]);

  return <div ref={containerRef} className={className} />;
}
