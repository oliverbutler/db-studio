import { Component, JSX, Show, splitProps } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { refresh, search, collection, database } from 'solid-heroicons/solid';
import { Clickable } from '../Clickable';
import { currentConnection } from '../../data/connections';
import { Environment } from '../../data/state';
import classNames from 'classnames';
import { Modal } from '../Modal';
import { ConnectionEditor } from './ConnectionEditor';
import { ConnectionEditorWrapper } from './ConnectionEditorWrapper';

const ToolbarOption: Component<{
  children: JSX.Element;
  onClick?: () => void;
}> = (props) => {
  return (
    <Clickable onClick={props.onClick} class="px-1">
      {props.children}
    </Clickable>
  );
};

const getEnvironmentColour = (
  environment: Environment
): { bgColour: string; outlineColour: string } => {
  switch (environment) {
    case Environment.Local:
      return {
        bgColour: 'bg-blue-500/40',
        outlineColour: 'outline-blue-500/50',
      };
    case Environment.Dev:
      return {
        bgColour: 'bg-green-500/40',
        outlineColour: 'outline-green-500/50',
      };
    case Environment.Staging:
      return {
        bgColour: 'bg-orange-500/40',
        outlineColour: 'outline-orange-500/50',
      };
    case Environment.Production:
      return { bgColour: 'bg-red-500/40', outlineColour: 'outline-red-500/50' };
    default:
      const type: never = environment;
      throw new Error(`Unknown environment: ${type}`);
  }
};

export const ConnectionBadge: Component<{ environment: Environment }> = (
  props
) => {
  return (
    <div
      class={classNames(
        'outline outline-1 px-1 text-sm rounded-md',
        getEnvironmentColour(props.environment).outlineColour
      )}
    >
      {props.environment}
    </div>
  );
};

export const ConnectionBar: Component = () => {
  return (
    <div
      data-tauri-drag-region
      class="gap-x-1 pl-20 py-0.5  border-b-2 border-b-dark-900 text-sm flex flex-row items-center"
    >
      <Modal
        trigger={({ open }) => (
          <ToolbarOption onClick={open}>
            <Icon path={database} class="h-4" />
          </ToolbarOption>
        )}
      >
        {({ close }) => <ConnectionEditorWrapper />}
      </Modal>
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
            currentConnection()?.connectionInformation.environment ||
              Environment.Local
          ).bgColour
        )}
      >
        <Show when={currentConnection()} fallback={<span>No Connection</span>}>
          {(connection) =>
            `MySQL : ${connection.connectionInformation.name} : ${connection.connectionInformation.environment}`
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
