import classNames from 'classnames';
import { Component, createSelector, For, JSX, Match, Switch } from 'solid-js';
import { currentConnection } from '../../data/connections';
import { TabType } from '../../data/state';
import { addTab, currentTab, removeTab, setCurrentTab } from '../../data/tabs';
import { CurrentTab } from './CurrentTab';
import { TabTable } from './TabTable';

export const Tabs: Component = () => {
  const isTabActive = createSelector(
    () => currentConnection()?.currentTabId || false
  );

  const handleClickTabClose = (e: MouseEvent, tabId: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeTab(tabId);
  };

  return (
    <div class="h-full w-full">
      <div class="flex flex-row gap-2 ">
        <For each={currentConnection()?.tabs}>
          {(tab) => (
            <div
              onClick={() => setCurrentTab(tab.id)}
              class={classNames(`text-sm p-2 rounded-t-md`, {
                'bg-dark-900': isTabActive(tab.id),
              })}
            >
              {tab.title}
              <button
                class="ml-2"
                onClick={(e) => handleClickTabClose(e, tab.id)}
              >
                x
              </button>
            </div>
          )}
        </For>
        <button class="text-sm" onClick={addTab}>
          +
        </button>
      </div>
      <Switch fallback={<div>Not Tabs</div>}>
        <Match when={currentTab()?.content.type === TabType.Query}>
          <CurrentTab />
        </Match>
        <Match when={currentTab()?.content.type === TabType.Table}>
          <TabTable />
        </Match>
      </Switch>
    </div>
  );
};
