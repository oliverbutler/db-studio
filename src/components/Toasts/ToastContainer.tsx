import { Component, createEffect, createMemo, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import { state } from '../../data/state';
import { addToast } from '../../data/toast';
import { Toast } from './Toast';

export const ToastContainer: Component = () => {
  const first5 = createMemo(() => state.toasts.slice(0, 4));

  return (
    <Portal mount={document.getElementById('toasts')!}>
      <div
        class="top-0 right-0 fixed space-y-2 flex flex-col items-center justify-center transition-all m-2"
        style={{ 'z-index': 999 }}
      >
        <For each={first5()}>{(toast) => <Toast toast={toast} />}</For>
      </div>
    </Portal>
  );
};
