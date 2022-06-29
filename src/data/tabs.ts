import { createMemo, createUniqueId } from 'solid-js';
import { produce } from 'solid-js/store';
import { lastElementMatching } from '../utils';
import { currentConnection } from './connections';
import { ITab, setState, state, TabType } from './state';

export const getEmptyTab = (queryNumber: number): ITab => ({
  id: createUniqueId(),
  title: `Query #${queryNumber}`,
  content: {
    type: TabType.Query,
    query: '',
    queryResponse: null,
  },
});

export const addTab = () => {
  const tab = getEmptyTab(getNumberOfQueries() + 1);

  setState(
    produce((x) => {
      x.connections[x.currentConnectionId!].tabs.push(tab);
      x.connections[x.currentConnectionId!].currentTabId = tab.id;
    })
  );
};

export const openTableTab = (table: string) => {
  const tab: ITab = {
    id: createUniqueId(),
    title: table,
    content: {
      type: TabType.Table,
      table,
      tableResponse: null,
    },
  };

  setState(
    produce((x) => {
      x.connections[x.currentConnectionId!].tabs.push(tab);
      x.connections[x.currentConnectionId!].currentTabId = tab.id;
    })
  );
};

export const currentTab = createMemo(() => {
  return currentConnection()?.tabs.find(
    (tab) => tab.id === currentConnection()?.currentTabId
  );
});

export const getNumberOfQueries = (): number =>
  currentConnection()?.tabs.reduce(
    (acc, tab) => (tab.content.type === TabType.Query ? acc + 1 : acc),
    0
  ) || 0;

export const removeTab = (tabId: string) => {
  const lastTabNotCurrent = lastElementMatching(
    [...currentConnection()!.tabs],
    (tab) => tab.id !== tabId
  );

  setState('connections', state.currentConnectionId!, 'tabs', (t) =>
    t.filter((t) => t.id !== tabId)
  );

  setState(
    'connections',
    state.currentConnectionId!,
    'currentTabId',
    lastTabNotCurrent?.id || null
  );
};

export const setCurrentTab = (tabId: ITab['id']) => {
  setState('connections', state.currentConnectionId!, 'currentTabId', tabId);
};

const isCurrentTab = (tab: ITab): boolean =>
  currentConnection()?.currentTabId === tab.id;

export const setCurrentTabValue = (value: string) => {
  setState(
    'connections',
    state.currentConnectionId!,
    'tabs',
    isCurrentTab,
    'content',
    'query',
    value
  );
};
