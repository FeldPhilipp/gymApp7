import { useCallback, useEffect, useState } from "react";

export function useNotificationMessage({ autoHideMs = 0 } = {}) {
  const [message, setMessage] = useState({ type: "", text: "" });

  const clearMessage = useCallback(() => {
    setMessage({ type: "", text: "" });
  }, []);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    if (!autoHideMs || !message.text) return undefined;
    const timer = setTimeout(clearMessage, autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs, clearMessage, message.text]);

  return {
    message,
    setMessage,
    showMessage,
    clearMessage,
    hasMessage: Boolean(message.text),
  };
}

export default useNotificationMessage;
