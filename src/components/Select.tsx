import { Icon } from 'solid-heroicons';
import { chevronDown } from 'solid-heroicons/solid';
import { Component, For, JSX, splitProps } from 'solid-js';

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

export const Select: Component<SelectProps> = (props) => {
  const [innerProps, restProps] = splitProps(props, [
    'label',
    'options',
    'value',
  ]);

  return (
    <div class="flex flex-col">
      <label class="text-sm text-dark-500">{innerProps.label}</label>
      <div class="relative w-full flex flex-row bg-dark-900 rounded-md">
        <select
          class=" bg-transparent px-2  p-1 w-full accent-primary-400 appearance-none"
          aria-aria-label={innerProps.label}
          {...restProps}
        >
          <For each={innerProps.options}>
            {(option) => (
              <option
                value={option.value}
                selected={innerProps.value === option.value}
              >
                {option.label}
              </option>
            )}
          </For>
        </select>
        <Icon class="absolute right-0 h-7 mt-0.5" path={chevronDown} />
      </div>
    </div>
  );
};
