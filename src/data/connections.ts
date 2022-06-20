import { invoke } from '@tauri-apps/api';
import { createMemo, createUniqueId } from 'solid-js';
import { produce } from 'solid-js/store';
import { z } from 'zod';
import { Connection, Environment, setState, state, TabType } from './state';

const AppConnectionSchema = z.object({
  name: z.string(),
  environment: z.nativeEnum(Environment),
  connection_information: z.object({
    user: z.string(),
    database: z.string(),
    host: z.string(),
    port: z.number(),
  }),
});

export type AppConnection = z.infer<typeof AppConnectionSchema>;

export const AppConnectionsSchema = z.array(AppConnectionSchema);

invoke('get_connections').then((response: unknown) => {
  const connections: AppConnection[] = AppConnectionsSchema.parse(response);

  const connectionsAsObject = connections.reduce<Record<string, Connection>>(
    (acc, connection) => {
      const connectionId = createUniqueId();

      const emptyTab = {
        id: createUniqueId(),
        title: `Query #1`,
        content: {
          type: TabType.Query,
          query: '',
        },
      };

      acc[connectionId] = {
        id: connectionId,
        name: connection.name,
        dbType: 'MySQL',
        environment: connection.environment,
        tabs: [emptyTab],
        currentTabId: emptyTab.id,
        connectionInformation: connection.connection_information,
      };

      return acc;
    },
    {}
  );

  setState(
    produce((state) => {
      state.connections = connectionsAsObject;
      state.currentConnectionId = Object.keys(connectionsAsObject)[0];
    })
  );
});

export const currentConnection = createMemo(() => {
  return state.currentConnectionId
    ? state.connections[state.currentConnectionId]
    : null;
});

export const setCurrentConnection = (connectionId: string) => {
  setState('currentConnectionId', connectionId);
};
