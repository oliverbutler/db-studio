import classNames from 'classnames';
import { Component, JSX, splitProps } from 'solid-js';

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  colour?: ButtonColour;
  variation?: 'primary' | 'tertiary';
}

export enum ButtonColour {
  Primary = 'primary',
  Danger = 'danger',
  Secondary = 'secondary',
  Dark = 'dark',
}

const getButtonStyles = (
  colour: ButtonColour,
  variation: ButtonProps['variation'],
  disabled: boolean
) => {
  if (variation === 'primary') {
    return classNames(
      {
        'text-white bg-primary-500 hover:bg-primary-700 ring-primary-500':
          colour === ButtonColour.Primary && !disabled,
      },
      {
        'text-white bg-secondary-500 hover:bg-secondary-700 ring-secondary-500':
          colour === ButtonColour.Secondary && !disabled,
      },
      {
        'text-white bg-red-500 ring-red-500 hover:bg-red-700':
          colour === ButtonColour.Danger && !disabled,
      },
      {
        'text-white bg-dark-500 ring-dark-500':
          colour === ButtonColour.Dark || disabled,
      },
      {
        'text-white hover:bg-dark-700':
          colour === ButtonColour.Dark && !disabled,
      }
    );
  } else {
    return classNames(
      {
        'ring-inset ring text-primary-500 hover:bg-primary-700/10 ring-primary-500':
          colour === ButtonColour.Primary && !disabled,
      },
      {
        'ring-inset ring text-secondary-500 hover:bg-secondary-700/10 ring-secondary-500':
          colour === ButtonColour.Secondary && !disabled,
      },
      {
        'ring-inset ring text-red-500 ring-red-500 hover:bg-red-700/10':
          colour === ButtonColour.Danger && !disabled,
      },
      {
        'ring-inset ring text-dark-500 ring-dark-500':
          colour === ButtonColour.Dark || disabled,
      },
      {
        'ring-inset ring hover:bg-dark-700/10':
          colour === ButtonColour.Dark && !disabled,
      }
    );
  }
};

export const Button: Component<ButtonProps> = (props) => {
  const [myProps, restProps] = splitProps(props, [
    'colour',
    'variation',
    'disabled',
    'loading',
    'children',
    'class',
  ]);

  return (
    <button
      class={classNames(
        ' focus:shadow-outline flex items-center rounded py-2 px-4 font-bold ring-opacity-50 focus:outline-none focus:ring-4',
        getButtonStyles(
          myProps.colour || ButtonColour.Primary,
          myProps.variation,
          myProps.disabled || false
        ),
        myProps.class
      )}
      type="button"
      disabled={myProps.disabled}
      {...restProps}
    >
      {myProps.loading && <span>...</span>}
      {myProps.children}
    </button>
  );
};

export default Button;
