import { Component, createSignal, JSX, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { addEventListener } from '../utils';

const ModalContent: Component<{
  children: ({ close }: { close: () => void }) => JSX.Element;
  setIsOpen: (isOpen: boolean) => void;
}> = (props) => {
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      props.setIsOpen(false);
      e.preventDefault();
    }
  });

  return (
    <div
      data-tauri-drag-region
      class="fixed inset-0 bg-dark-900/60 flex flex-col items-center justify-center transition-all overflow-hidden backdrop-blur-sm "
      style={{ 'z-index': 999 }}
    >
      <div class="bg-dark-900">
        {props.children({ close: () => props.setIsOpen(false) })}
      </div>
    </div>
  );
};

export const Modal: Component<{
  children: ({ close }: { close: () => void }) => JSX.Element;
  trigger: ({ open }: { open: () => void }) => JSX.Element;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      {props.trigger({ open: () => setIsOpen(true) })}
      <Show when={isOpen()}>
        <Portal mount={document.getElementById('modal')!}>
          <Show when={isOpen()}>
            <ModalContent children={props.children} setIsOpen={setIsOpen} />
          </Show>
        </Portal>
      </Show>
    </>
  );
};
