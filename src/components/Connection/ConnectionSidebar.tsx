import { Component, createEffect, createSignal, For } from 'solid-js';
import { state } from '../../data/state';
import { sql } from '../../sql';

export const ConnectionSidebar: Component = () => {
  const [tables, setTables] = createSignal<string[]>([]);

  createEffect(() => {
    if (state.currentConnectionId) {
      sql.getTables(state.currentConnectionId).then(setTables);
    }
  });

  return (
    <div class="flex flex-col">
      <For each={tables()}>{(table) => <div class="p-2">{table}</div>}</For>
    </div>
  );
};
