import { invoke } from '@tauri-apps/api';
import { InvokeGetConnectionsReturn } from './InvokeGetConnectionsReturn';
import { InvokeExecuteQueryReturn } from './InvokeExecuteQueryReturn';
import { InvokeGetConnectionReturn } from './InvokeGetConnectionReturn';
import { InvokeUpdateConnection } from './InvokeUpdateConnection';
import { AppConnection } from './AppConnection';

export const invokeExecuteQuery = async (params: {
  connectionId: String;
  query: String;
}): Promise<InvokeExecuteQueryReturn> => await invoke('execute_query', params);

export const invokeGetConnections =
  async (): Promise<InvokeGetConnectionsReturn> => {
    return await invoke('get_connections');
  };

export const invokeGetConnection = async (params: {
  connectionId: String;
}): Promise<InvokeGetConnectionReturn> => invoke('get_connection', params);

export const invokeUpdateConnection = async (params: {
  update: InvokeUpdateConnection;
}): Promise<boolean> => invoke('update_connection', params);

export const invokeAddConnection = async (params: {
  connection: AppConnection;
}): Promise<void> => invoke('add_connection', params);
