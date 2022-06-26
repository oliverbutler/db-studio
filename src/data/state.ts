import { createStore, produce } from 'solid-js/store';
import { QueryColumn } from '../../src-tauri/bindings/QueryColumn';

export enum Environment {
  Local = 'Local',
  Dev = 'Dev',
  Staging = 'Staging',
  Production = 'Production',
}

export interface ConnectionInformation {
  /**
   * Id of the connection state.connections.[id]
   */
  connection_id: string;
  user: string;
  environment: Environment;
  name: string;
  database: string;
  host: string;
  port: number;
  password: string | null;
}
export interface Connection {
  /**
   * Internal ID from Rust backend
   */
  id: string;
  tabs: ITab[];
  currentTabId: string | null;
  connectionInformation: ConnectionInformation;
}

export enum TabType {
  Query = 'QUERY',
}

export interface TabQuery {
  type: TabType;
  query: string;
  queryResponse: {
    columns: Array<QueryColumn>;
    rows: Record<string, unknown>[];
  } | null;
}

export interface ITab {
  id: string;
  title: string;
  content: TabQuery;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface State {
  connections: Record<string, Connection>;
  currentConnectionId: string | null;
  toasts: Toast[];
}

const [state, setState] = createStore<State>({
  connections: {},
  currentConnectionId: null,
  toasts: [],
});

export { state, setState };
