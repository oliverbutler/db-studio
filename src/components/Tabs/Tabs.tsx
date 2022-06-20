import classNames from 'classnames';
import { Component, createSelector, For, JSX } from 'solid-js';
import { currentConnection } from '../../data/connections';
import { ITab } from '../../data/state';
import { addTab, removeTab, setCurrentTab } from '../../data/tabs';
import { CurrentTab } from './CurrentTab';

export const Tabs: Component = () => {
  const isTabActive = createSelector(
    () => currentConnection()?.currentTabId || false
  );

  const handleClickTabClose = (e: MouseEvent, tab: ITab) => {
    e.stopPropagation();
    e.preventDefault();
    removeTab(tab.id);
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
              <button class="ml-2" onClick={(e) => handleClickTabClose(e, tab)}>
                x
              </button>
            </div>
          )}
        </For>
        <button class="text-sm" onClick={addTab}>
          +
        </button>
      </div>
      <CurrentTab />
    </div>
  );
};
