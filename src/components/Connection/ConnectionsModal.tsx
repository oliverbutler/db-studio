import classNames from 'classnames';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import {
  currentConnection,
  setCurrentConnection,
} from '../../data/connections';
import { state } from '../../data/state';
import Button from '../Button';
import { Input } from '../Input';
import { ConnectionBadge } from './ConnectionBar';
import { ConnectionEditor } from './ConnectionEditor';

export const ConnectionsModal: Component<{ close: () => void }> = (props) => {
  const [searchString, setSearchString] = createSignal<string | null>(null);

  const updateSearchString = (value: string) => {
    setSearchString(value ? value : null);
  };

  const filteredConnections = createMemo(() => {
    const connections = Object.values(state.connections);
    const search = searchString();

    if (!search) {
      return connections;
    }

    return connections.filter((c) =>
      c.connectionInformation.name.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <h2 class="font-bold text-lg text-center p-4">Connections</h2>
      <div class="flex flex-row">
        <div class="space-y-2">
          <Input
            label="Search"
            class="px-2"
            placeholder="Search Connection"
            autocapitalize="off"
            autocomplete="off"
            oninput={(e) => updateSearchString(e.currentTarget.value)}
          />
          <For each={filteredConnections()}>
            {(connection) => (
              <div
                class={classNames(
                  'flex flex-col hover:bg-dark-700 px-6 py-2 cursor-pointer border-l-2 border-l-transparent',
                  {
                    'border-l-white':
                      connection.id === state.currentConnectionId,
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
          <Button class="ml-2">Add New</Button>
        </div>
        <Show when={currentConnection()?.connectionInformation}>
          {(c) => (
            <ConnectionEditor connectionInformation={c} close={props.close} />
          )}
        </Show>
      </div>
    </div>
  );
};
