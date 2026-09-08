import { create } from 'zustand';

export type ToastTone = 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => number;
  dismiss: (id: number) => void;
}

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'info') => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Fire a toast from anywhere, including outside a component. */
export const toast = (message: string, tone: ToastTone = 'info'): number =>
  useToastStore.getState().push(message, tone);
