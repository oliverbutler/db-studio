import { invoke } from '@tauri-apps/api';
import { createMemo, createUniqueId } from 'solid-js';
import { produce } from 'solid-js/store';
import { z } from 'zod';
import { Connection, Environment, setState, state } from './state';

const AppConnectionSchema = z.object({
  name: z.string(),
  url: z.string(),
  environment: z.nativeEnum(Environment),
});

export type AppConnection = z.infer<typeof AppConnectionSchema>;

export const AppConnectionsSchema = z.array(AppConnectionSchema);

invoke('get_connections').then((response: unknown) => {
  const connections: AppConnection[] = AppConnectionsSchema.parse(response);

  const connectionsAsObject = connections.reduce<Record<string, Connection>>(
    (acc, connection) => {
      const connectionId = createUniqueId();

      acc[connectionId] = {
        id: connectionId,
        name: connection.name,
        dbType: connection.url.split(':')[0],
        environment: connection.environment,
        tabs: [],
        currentTabId: null,
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
