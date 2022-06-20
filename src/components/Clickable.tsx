import classNames from 'classnames';
import { Component, JSX, splitProps } from 'solid-js';

interface ClickableProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  class?: string;
}

export const Clickable: Component<ClickableProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <button
      {...others}
      class={classNames(
        'hover:bg-dark-900/50 p-1  rounded-sm select-none cursor-pointer',
        local.class
      )}
    >
      {others.children}
    </button>
  );
};
