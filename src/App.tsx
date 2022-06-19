import type { Component } from 'solid-js';
import { ConnectionBar } from './components/Connection/ConnectionBar';
import { Tabs } from './components/Tabs/Tabs';

const App: Component = () => {
  return (
    <div class="h-screen w-screen">
      <div data-tauri-drag-region class="pl-20 h-7 dark:bg-zinc-800"></div>
      <div class="flex flex-col grow">
        <div class="flex flex-row">
          <div class="flex flex-col w-1/4 pr-4 "></div>
          <div class="w-full">{<Tabs />}</div>
        </div>
      </div>
    </div>
  );
};

export default App;
