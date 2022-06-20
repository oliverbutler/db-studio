import { Component, For, JSX, splitProps } from 'solid-js';

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

export const Select: Component<SelectProps> = (props) => {
  const [innerProps, restProps] = splitProps(props, ['label', 'options']);

  return (
    <div class="flex flex-col">
      <label class="text-sm text-dark-500">{innerProps.label}</label>
      <select
        class="bg-dark-800 px-2 rounded-sm accent-primary-400"
        aria-aria-label={innerProps.label}
        {...restProps}
      >
        <For each={innerProps.options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
    </div>
  );
};
