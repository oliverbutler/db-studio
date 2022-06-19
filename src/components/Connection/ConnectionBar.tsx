import { Component } from 'solid-js';
import { currentConnection } from '../../state';

export const ConnectionBar: Component = () => {
  return (
    <div class="bg-purple-400 text-black py-1 px-2">
      {currentConnection().name} - {currentConnection().environment}
    </div>
  );
};
