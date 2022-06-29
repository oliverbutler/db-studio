import { Component, Show } from 'solid-js';
import { api } from '../../api';
import { currentConnection } from '../../data/connections';
import { setState, state, TabType } from '../../data/state';
import { currentTab } from '../../data/tabs';

export const TabTable: Component = () => {
  const callCurrentQuery = async () => {
    const tab = currentTab();
    const conn = currentConnection();

    if (tab && conn && tab.content.type === TabType.Table) {
      const result = await api.executeQuery(
        conn.connectionInformation.connection_id,
        'SELECT * FROM ' + tab.content.table
      );

      if (result) {
        setState(
          'connections',
          state.currentConnectionId!,
          'tabs',
          (x) => x.id === tab.id,
          'content',
          'queryResponse',
          result
        );
      }
    }
  };

  callCurrentQuery();

  return (
    <Show when={currentTab()}>
      {(tab) => (
        <div class="bg-dark-900 h-full w-full">
          <table class="text-sm">
            <thead class="bg-dark-800">
              {tab.content.queryResponse?.columns.map((col) => (
                <th class="px-2 py-1">{col.name}</th>
              ))}
            </thead>
            <tbody class="font-mono">
              {tab.content.queryResponse?.rows.map((row) => (
                <tr>
                  {tab.content.queryResponse?.columns.map((col) => (
                    <td>{String(row[col.name])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Show>
  );
};
