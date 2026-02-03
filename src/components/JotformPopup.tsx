import { useEffect } from 'react';

declare global {
  interface Window {
    JF?: {
      init: () => void;
      feedback: (options: {
        formId: string;
        buttonText: string;
        base: string;
        width: number;
        height: number;
        openOnLoad: boolean;
        closeOnSubmit: boolean;
      }) => void;
    };
  }
}

const JOTFORM_SCRIPT_URL = 'https://form.jotform.com/static/feedback2.js';

interface JotformPopupProps {
  formId: string;
  buttonText: string;
  base?: string;
  width?: number;
  height?: number;
  openOnLoad?: boolean;
  closeOnSubmit?: boolean;
}

export default function JotformPopup({
  formId,
  buttonText,
  base = 'https://form.jotform.com/',
  width = 700,
  height = 600,
  openOnLoad = false,
  closeOnSubmit = true,
}: JotformPopupProps) {
  useEffect(() => {
    if (!formId) return;
    if (typeof window.JF === 'undefined') {
      const script = document.createElement('script');
      script.src = JOTFORM_SCRIPT_URL;
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        if (window.JF) {
          window.JF.init();
          window.JF.feedback({
            formId,
            buttonText,
            base,
            width,
            height,
            openOnLoad,
            closeOnSubmit,
          });
        }
      };
      document.head.appendChild(script);
      return () => {
        const s = document.querySelector(`script[src="${JOTFORM_SCRIPT_URL}"]`);
        if (s) s.remove();
      };
    }
    window.JF.init();
    window.JF.feedback({
      formId,
      buttonText,
      base,
      width,
      height,
      openOnLoad,
      closeOnSubmit,
    });
  }, [formId, buttonText, base, width, height, openOnLoad, closeOnSubmit]);

  return <div id="JF_BUTTON" className="jotform-popup-button" />;
}
