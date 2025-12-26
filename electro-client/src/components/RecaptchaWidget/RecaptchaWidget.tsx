import React, { useEffect, useRef } from 'react';
import ApplicationConstants from 'constants/ApplicationConstants';

type RecaptchaWidgetProps = {
  onChange: (token: string | null) => void;
  onError?: () => void;
  resetSignal?: number;
};

function RecaptchaWidget({ onChange, onError, resetSignal = 0 }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    const renderCaptcha = () => {
      if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: ApplicationConstants.RECAPTCHA_SITE_KEY,
        callback: (token: string) => onChange(token),
        'expired-callback': () => onChange(null),
        'error-callback': () => {
          onChange(null);
          if (onError) {
            onError();
          }
        },
      });
    };

    if (window.grecaptcha) {
      renderCaptcha();
    } else {
      window.onRecaptchaLoadCallback = renderCaptcha;
    }
  }, [onChange, onError]);

  useEffect(() => {
    if (resetSignal > 0 && window.grecaptcha && widgetIdRef.current !== null) {
      window.grecaptcha.reset(widgetIdRef.current);
      onChange(null);
    }
  }, [resetSignal, onChange]);

  return <div ref={containerRef} />;
}

export default RecaptchaWidget;
