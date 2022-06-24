import classNames from 'classnames';
import { Component, For } from 'solid-js';
import { setCurrentConnection } from '../../data/connections';
import { state } from '../../data/state';

export const ConnectionSidebar: Component = () => {
  return (
    <div class="flex flex-col">
      <For each={Object.values(state.connections) || []}>
        {(connection) => (
          <div
            onClick={() => setCurrentConnection(connection.id)}
            class={classNames(
              'border-l-2 pl-2',
              { 'border-l-white': connection.id === state.currentConnectionId },
              {
                'border-l-transparent':
                  connection.id !== state.currentConnectionId,
              }
            )}
          >
            {connection.connectionInformation.name}
          </div>
        )}
      </For>
    </div>
  );
};
