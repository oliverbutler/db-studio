import { createMemo, createUniqueId } from 'solid-js';
import { createStore, produce } from 'solid-js/store';

enum Environment {
  Dev = 'dev',
  Staging = 'staging',
  Prod = 'prod',
  Test = 'test',
}

interface Connection {
  id: string;
  connectionInfo: {
    url: string;
    username: string;
    password: string;
    database: string;
    port: number;
    ssl: boolean;
  };
  name: string;
  environment: Environment;
  tabs: ITab[];
  currentTabId: string | null;
}

interface State {
  connection: Connection[];
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

export enum TabType {
  Query = 'QUERY',
}

const getEmptyTab = (queryNumber: number): ITab => ({
  id: createUniqueId(),
  title: `Query #${queryNumber}`,
  content: {
    type: TabType.Query,
    query: '',
  },
});

const emptyTab = getEmptyTab(1);

const [state, setState] = createStore<State>({
  connection: [
    {
      id: createUniqueId(),
      tabs: [emptyTab],
      currentTabId: emptyTab.id,
      name: 'Default',
      environment: Environment.Dev,
      connectionInfo: {
        url: 'https://db.com',
        username: 'root',
        password: 'toor',
        database: 'db',
        port: 0,
        ssl: false,
      },
    },
  ],
});

export const currentConnectionIndex = 0;

export const currentConnection = createMemo(() => {
  const { connection } = state;
  return connection[currentConnectionIndex];
});

const getNumberOfQueries = (): number =>
  currentConnection().tabs.reduce(
    (acc, tab) => (tab.content.type === TabType.Query ? acc + 1 : acc),
    0
  );

export const addTab = () => {
  const tab = getEmptyTab(getNumberOfQueries() + 1);

  setState(
    produce((x) => {
      x.connection[currentConnectionIndex].tabs.push(tab);
      x.connection[currentConnectionIndex].currentTabId = tab.id;
    })
  );
};

export const currentTab = createMemo(() => {
  return currentConnection().tabs.find(
    (tab) => tab.id === state.connection[currentConnectionIndex].currentTabId
  );
});

const lastElementMatching = <T>(
  arr: T[],
  predicate: (x: T) => boolean
): T | undefined => {
  return [...arr].reverse().find(predicate);
};

export const removeTab = (tabId: string) => {
  const lastTabNotCurrent = lastElementMatching(
    currentConnection().tabs,
    (tab) => tab.id !== tabId
  );

  setState(
    produce((x) => {
      x.connection[currentConnectionIndex].tabs = x.connection[
        currentConnectionIndex
      ].tabs.filter((tab) => tab.id !== tabId);
      x.connection[currentConnectionIndex].currentTabId =
        tabId === state.connection[currentConnectionIndex].currentTabId
          ? lastTabNotCurrent?.id || null
          : state.connection[currentConnectionIndex].currentTabId;
    })
  );
};

export const setCurrentTab = (tabId: ITab['id']) => {
  setState(
    produce((x) => {
      x.connection[currentConnectionIndex].currentTabId = tabId;
    })
  );
};

export { state };
