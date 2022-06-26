import { createUniqueId } from 'solid-js';
import { produce } from 'solid-js/store';
import { setState, Toast } from './state';

export const addToast = (toast: Omit<Toast, 'id'>): void => {
  setState(
    produce((s) => {
      s.toasts.push({ id: createUniqueId(), ...toast });
    })
  );
};

export const removeToast = (toastId: Toast['id']): void => {
  setState(
    produce((s) => {
      s.toasts = s.toasts.filter((t) => t.id !== toastId);
    })
  );
};
