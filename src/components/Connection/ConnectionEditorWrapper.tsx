import classNames from 'classnames';
import { Component, For, Show } from 'solid-js';
import {
  currentConnection,
  setCurrentConnection,
} from '../../data/connections';
import { state } from '../../data/state';
import { ConnectionBadge } from './ConnectionBar';
import { ConnectionEditor } from './ConnectionEditor';

export const ConnectionEditorWrapper: Component = () => {
  return (
    <div>
      <h2 class="font-bold text-lg text-center p-4">Connections</h2>
      <div class="flex flex-row">
        <div class="space-y-2">
          <For each={Object.values(state.connections)}>
            {(connection) => (
              <div
                class={classNames(
                  'flex flex-col hover:bg-dark-700 px-6 py-2 cursor-pointer border-l-2 border-l-transparent',
                  {
                    'border-l-white': connection.id === currentConnection()?.id,
                  }
                )}
                onClick={() => setCurrentConnection(connection.id)}
              >
                <div class="flex flex-row gap-x-1">
                  <span>{connection.connectionInformation.name}</span>
                  <ConnectionBadge
                    environment={connection.connectionInformation.environment}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
        <Show when={currentConnection()?.connectionInformation}>
          {(c) => <ConnectionEditor connectionInformation={c} />}
        </Show>
      </div>
    </div>
  );
};
