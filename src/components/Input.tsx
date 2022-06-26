import classNames from 'classnames';
import { Component, JSX, splitProps } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: Component<InputProps> = (props) => {
  const [innerProps, restProps] = splitProps(props, ['label', 'class']);

  return (
    <div class={classNames('flex flex-col', innerProps.class)}>
      <label class="text-sm text-dark-500">{innerProps.label}</label>
      <input
        class="bg-dark-900 px-2 rounded-md p-1 accent-primary-400"
        aria-aria-label={innerProps.label}
        {...restProps}
      />
    </div>
  );
};
