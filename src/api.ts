import { invoke } from '@tauri-apps/api';
import { produce } from 'solid-js/store';
import { z } from 'zod';
import {
  invokeAddConnection,
  invokeExecuteQuery,
  invokeGetConnection,
  invokeUpdateConnection,
} from '../src-tauri/bindings/Invoke';
import { ConnectionInformation, Environment, setState } from './data/state';
import { addToast } from './data/toast';

const AppConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  environment: z.nativeEnum(Environment),
  connection_information: z.object({
    user: z.string(),
    database: z.string(),
    password: z.string(),
    host: z.string(),
    port: z.number(),
  }),
});

// Schema with password
const AppConnectionSchemaCreate = z.object({
  id: z.string(),
  name: z.string(),
  environment: z.nativeEnum(Environment),
  connection_information: z.object({
    user: z.string(),
    database: z.string(),
    password: z.string(),
    host: z.string(),
    port: z.number(),
  }),
});

export type AppConnection = z.infer<typeof AppConnectionSchema>;
export type AppConnectionCreate = z.infer<typeof AppConnectionSchemaCreate>;

export const AppConnectionsSchema = z.array(AppConnectionSchema);

const getConnections = async (): Promise<AppConnection[]> => {
  const connections = await invoke('get_connections');

  return AppConnectionsSchema.parse(connections);
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

const getConnection = async (
  connectionId: string
): Promise<AppConnection | null> => {
  const connection = await invokeGetConnection({
    connectionId,
  });

  return AppConnectionSchema.parse(connection);
};

type RequiredKeys<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

const executeQuery = async (
  connectionId: string,
  query: string
): Promise<unknown> => {
  const result = await invokeExecuteQuery({
    connectionId,
    query,
  });

  return result;
};

export const api = {
  addConnection,
  updateConnection,
  getConnection,
  getConnections,
  executeQuery,
};
