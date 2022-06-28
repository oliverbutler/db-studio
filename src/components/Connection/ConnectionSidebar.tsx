import { Component, createEffect, createSignal, For } from 'solid-js';
import { currentConnection } from '../../data/connections';
import { getTables } from '../../sql';

export const ConnectionSidebar: Component = () => {
  const [tables, setTables] = createSignal<string[]>([]);

  createEffect(() => {
    const cur = currentConnection();

    if (cur) {
      getTables(cur.connectionInformation.connection_id).then(setTables);
    }
  });

  return (
    <div class="flex flex-col">
      <For each={tables()}>{(table) => <div class="p-2">{table}</div>}</For>
    </div>
  );
};
