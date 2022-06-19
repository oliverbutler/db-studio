import { createStore, produce } from 'solid-js/store';

export enum Environment {
  Local = 'Local',
  Dev = 'Dev',
  Staging = 'Staging',
  Production = 'Production',
}

export interface Connection {
  id: string;
  name: string;
  dbType: string;
  environment: Environment;
  tabs: ITab[];
  currentTabId: string | null;
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
