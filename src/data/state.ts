import { createStore, produce } from 'solid-js/store';

export enum Environment {
  Local = 'Local',
  Dev = 'Dev',
  Staging = 'Staging',
  Production = 'Production',
}

export interface ConnectionInformation {
  id: string;
  user: string;
  environment: Environment;
  name: string;
  database: string;
  host: string;
  port: number;
  password: string | null;
}
export interface Connection {
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
}

export interface ITab {
  id: string;
  title: string;
  content: TabQuery;
}

interface State {
  connections: Record<string, Connection>;
  currentConnectionId: string | null;
}

const [state, setState] = createStore<State>({
  connections: {},
  currentConnectionId: null,
});

export { state, setState };
