import { Component, Show } from 'solid-js';
import { invokeExecuteQuery } from '../../../src-tauri/bindings/Invoke';
import { currentConnection } from '../../data/connections';
import { setState, state } from '../../data/state';
import { currentTab, setCurrentTabValue } from '../../data/tabs';
import Button from '../Button';

export const CurrentTab: Component = () => {
  const callCurrentQuery = async () => {
    const tab = currentTab();
    const conn = currentConnection();

    if (tab && conn) {
      const result = await invokeExecuteQuery({
        connectionId: conn.connectionInformation.connection_id,
        query: tab.content.query,
      });

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
  };

  return (
    <Show when={currentTab()}>
      {(tab) => (
        <div class="bg-dark-900 h-full w-full">
          <textarea
            autoCapitalize="off"
            class="bg-transparent font-mono text-sm w-full outline-none"
            value={tab.content.query}
            onInput={(e) => {
              setCurrentTabValue(e.currentTarget.value || '');
            }}
          ></textarea>
          <Show when={tab.content.queryResponse}>
            {(response) => (
              <table class="text-sm">
                <thead class="bg-dark-800">
                  {response.columns.map((col) => (
                    <th class="px-2 py-1">{col.name}</th>
                  ))}
                </thead>
                <tbody class="font-mono">
                  {response.rows.map((row) => (
                    <tr>
                      {response.columns.map((col) => (
                        <td>{String(row[col.name])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Show>

          <Button onclick={callCurrentQuery}>Send</Button>
        </div>
      )}
    </Show>
  );
};
