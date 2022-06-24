import { createMemo, createUniqueId } from 'solid-js';
import { produce } from 'solid-js/store';
import { getConnections } from '../api';
import { Connection, setState, state, TabType } from './state';

getConnections().then((connections) => {
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
        tabs: [emptyTab],
        currentTabId: emptyTab.id,
        connectionInformation: {
          id: connection.id,
          user: connection.connection_information.user,
          environment: connection.environment,
          name: connection.name,
          database: connection.connection_information.database,
          host: connection.connection_information.host,
          port: connection.connection_information.port,
          password: null,
        },
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
