import classNames from 'classnames';
import { Icon } from 'solid-heroicons';
import { Component } from 'solid-js';
import { Toast as IToast } from '../../data/state';
import { removeToast } from '../../data/toast';
import { checkCircle } from 'solid-heroicons/solid';

interface ToastProps {
  toast: IToast;
}

const getToastColour = (type: IToast['type']) => {
  const toastType = type;
  switch (toastType) {
    case 'success':
      return 'bg-emerald-500/70';
    case 'error':
      return 'bg-red-500/70';
    case 'info':
      return 'bg-sky-500/70';
    default:
      const _: never = toastType;
  }
};

export const Toast: Component<ToastProps> = (props) => {
  setTimeout(() => {
    removeToast(props.toast.id);
  }, props.toast.duration || 2000);

  return (
    <div
      class={classNames(
        getToastColour(props.toast.type),
        'flex flex-row items-center p-2 rounded-md transition-all'
      )}
    >
      <Icon path={checkCircle} height={20} width={20} class="mr-1" />{' '}
      {props.toast.message}
    </div>
  );
};
