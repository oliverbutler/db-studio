import { Component, Show } from 'solid-js';
import { currentTab } from '../../state';

export const CurrentTab: Component = () => {
  return (
    <Show when={currentTab()}>
      {(tab) => (
        <div class="bg-black h-full">
          <pre>{tab.content.query}</pre>
        </div>
      )}
    </Show>
  );
};
