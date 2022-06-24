import { invoke } from '@tauri-apps/api';
import { z } from 'zod';
import { Environment } from './data/state';

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

export const getConnections = async (): Promise<AppConnection[]> => {
  const connections = await invoke('get_connections');

  return AppConnectionsSchema.parse(connections);
};

export const removeConnection = async (connectionId: string): Promise<void> => {
  await invoke('remove_connection', { connection_id: connectionId });
};

export const addConnection = async (
  connection: AppConnectionCreate
): Promise<void> => {
  await invoke('add_connection', { connection });
};

export const updateConnection = async (
  connection: RequiredKeys<DeepPartial<AppConnectionCreate>, 'id'>
): Promise<void> => {
  await invoke('update_connection', { update: connection });
};

type RequiredKeys<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
