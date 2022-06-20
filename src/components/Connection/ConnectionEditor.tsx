import classNames from 'classnames';
import { Component, createMemo, For, lazy } from 'solid-js';
import {
  currentConnection,
  setCurrentConnection,
} from '../../data/connections';
import { Environment, state } from '../../data/state';
import Button, { ButtonColour } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { ConnectionBadge } from './ConnectionBar';

export const ConnectionEditor: Component = () => {
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
                  <span>{connection.name}</span>
                  <ConnectionBadge environment={connection.environment} />
                </div>
                <span class="text-sm text-dark-500">{connection.dbType}</span>
              </div>
            )}
          </For>
        </div>
        <div class="w-72 px-2 pb-2">
          <Input label="Name" value={currentConnection()?.name} />
          <Select
            label="Environment"
            value={currentConnection()?.environment}
            options={[
              Environment.Dev,
              Environment.Local,
              Environment.Staging,
              Environment.Production,
            ].map((e) => ({ label: e, value: e }))}
          />
          <Input
            label="User"
            value={currentConnection()?.connectionInformation.user}
          />
          <Input
            label="Database"
            value={currentConnection()?.connectionInformation.database}
          />
          <Input
            label="Host"
            value={currentConnection()?.connectionInformation.host}
          />
          <Input
            label="Port"
            value={currentConnection()?.connectionInformation.port}
          />
          <Input label="Password" type="password" value={'fake-password'} />
          <Button
            class="mt-4"
            variation="primary"
            colour={ButtonColour.Secondary}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
