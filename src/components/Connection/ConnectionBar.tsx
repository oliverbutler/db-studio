import { Component, JSX } from 'solid-js';
import { currentConnection } from '../../state';
import { Icon } from 'solid-heroicons';
import { refresh, search, collection, database } from 'solid-heroicons/solid';
import { Clickable } from '../Clickable';

const ToolbarOption: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Clickable onClick={() => {}} class="px-1">
      {props.children}
    </Clickable>
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
        class="w-full cursor-default select-none z-0 bg-purple-500/60 my-1 px-2 py-0.5 rounded-sm text-xs font-mono  truncate"
      >
        {currentConnection().dbType} : {currentConnection().name} :{' '}
        {currentConnection().environment}
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
