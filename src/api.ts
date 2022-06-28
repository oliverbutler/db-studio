import { produce } from 'solid-js/store';
import { AppConnection } from '../src-tauri/bindings/AppConnection';
import {
  invokeAddConnection,
  invokeExecuteQuery,
  invokeGetConnection,
  invokeGetConnections,
  invokeUpdateConnection,
} from '../src-tauri/bindings/Invoke';
import { ConnectionInformation, Environment, setState } from './data/state';
import { addToast } from './data/toast';
import { DeepPartial, RequiredKeys } from './utils';

const getConnections = async () => {
  const connections = await invokeGetConnections();

  return connections.connections;
};

const addConnection = async (connection: AppConnection): Promise<void> => {
  await invokeAddConnection({ connection });
};

const updateConnection = async (
  connection: RequiredKeys<DeepPartial<ConnectionInformation>, 'connection_id'>,
  successCallback: () => void
): Promise<void> => {
  const result = await invokeUpdateConnection({
    update: {
      id: connection.connection_id ?? null,
      name: connection.name ?? null,
      environment: connection.environment ?? null,
      connection_information: {
        user: connection.user ?? null,
        database: connection.database ?? null,
        password: connection.password ?? null,
        host: connection.host ?? null,
        port: connection.port ?? null,
      },
    },
  });

  if (!result) {
    addToast({ message: 'Issue updating, please try again.', type: 'error' });
    return;
  }

  // Mutate the local state optimistically
  setState(
    produce((s) => {
      s.connections[s.currentConnectionId!].connectionInformation = {
        ...s.connections[s.currentConnectionId!].connectionInformation,
        ...connection,
      };
    })
  );

  addToast({ message: 'Connection updated', type: 'success' });
  successCallback();
};

const getConnection = async (connectionId: string) => {
  const connection = await invokeGetConnection({
    connectionId,
  });

  return connection.connection;
};

const executeQuery = async (connectionId: string, query: string) => {
  try {
    const result = await invokeExecuteQuery({
      connectionId,
      query,
    });

    return result;
  } catch (e) {
    displayError(e);
    return null;
  }
};

type ApiError = {
  type: 'MySqlError' | 'DriverError' | 'unknown';
  message: string;
};

const displayError = (error: any) => {
  const { message } = extractError(error);
  addToast({ message, type: 'error' });
};

const extractError = (error: any): ApiError => {
  if (typeof error !== 'string') {
    return {
      type: 'unknown',
      message: error,
    };
  }

  // Remove everything other than between curly braces {}
  const regex = /\{(.*?)\}/g;
  const match = regex.exec(error);
  if (!match) {
    return {
      type: 'unknown',
      message: error,
    };
  }

  const json = match[1];

  if (error.includes('MySqlError')) {
    return {
      type: 'MySqlError',
      message: json.split(':')[1],
    };
  }

  if (error.includes('Driver')) {
    return {
      type: 'DriverError',
      message: json,
    };
  }

  return {
    type: 'unknown',
    message: json,
  };
};

export const api = {
  addConnection,
  updateConnection,
  getConnection,
  getConnections,
  executeQuery,
};
