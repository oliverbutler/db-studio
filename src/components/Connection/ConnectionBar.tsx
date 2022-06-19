import { Component, JSX, Show, splitProps } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { refresh, search, collection, database } from 'solid-heroicons/solid';
import { Clickable } from '../Clickable';
import { currentConnection } from '../../data/connections';
import { Environment } from '../../data/state';
import classNames from 'classnames';

const ToolbarOption: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Clickable onClick={() => {}} class="px-1">
      {props.children}
    </Clickable>
  );
};

const getEnvironmentColour = (environment: Environment) => {
  switch (environment) {
    case Environment.Local:
      return 'bg-blue-500/60';
    case Environment.Dev:
      return 'bg-green-500/60';
    case Environment.Staging:
      return 'bg-orange-500/60';
    case Environment.Production:
      return 'bg-red-500/60';
    default:
      const type: never = environment;
      throw new Error(`Unknown environment: ${type}`);
  }
};

export const ConnectionBadge: Component<{ environment: Environment }> = (
  props
) => {
  return (
    <span
      class={classNames(
        'flex flex-row items-center',
        getEnvironmentColour(props.environment)
      )}
    >
      {props.environment}
    </span>
  );
};

export const ConnectionBar: Component = () => {
  return (
    <div
      data-tauri-drag-region
      class="gap-x-1 pl-20 py-0.5 dark:bg-zinc-700 border-b-2 border-b-zinc-900 text-sm flex flex-row items-center"
    >
      <ToolbarOption>
        <Icon path={database} class="h-4" />
      </ToolbarOption>
      <ToolbarOption>
        <Icon path={collection} class="h-4" />
      </ToolbarOption>
      <Clickable onClick={() => {}} class="px-2 text-xs">
        SQL
      </Clickable>
      <div
        data-tauri-drag-region
        class={classNames(
          'w-full cursor-default select-none my-1 px-2 py-0.5 rounded-sm text-xs font-mono  truncate',
          getEnvironmentColour(
            currentConnection()?.environment || Environment.Local
          )
        )}
      >
        <Show when={currentConnection()} fallback={<span>No Connection</span>}>
          {(connection) =>
            `${connection.dbType} : ${connection.name} : ${connection.environment}`
          }
        </Show>
      </div>
      <ToolbarOption>
        <Icon path={refresh} class="h-4" />
      </ToolbarOption>
      <ToolbarOption>
        <Icon path={search} class="h-4" />
      </ToolbarOption>
    </div>
  );
};
