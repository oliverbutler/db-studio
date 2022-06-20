import { Component, Show } from 'solid-js';
import { currentTab, setCurrentTabValue } from '../../data/tabs';

export const CurrentTab: Component = () => {
  return (
    <Show when={currentTab()}>
      {(tab) => (
        <div class="bg-dark-900 h-full w-full">
          <textarea
            autoCapitalize="off"
            class="bg-transparent h-full"
            value={tab.content.query}
            onInput={(e) => {
              setCurrentTabValue(e.currentTarget.value || '');
            }}
          ></textarea>
        </div>
      )}
    </Show>
  );
};
