import { Component, createEffect, createSignal, For } from 'solid-js';
import { currentConnection } from '../../data/connections';
import { openTableTab } from '../../data/tabs';
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
      <For each={tables()}>
        {(table) => (
          <div class="p-2" onclick={() => openTableTab(table)}>
            {table}
          </div>
        )}
      </For>
    </div>
  );
};
