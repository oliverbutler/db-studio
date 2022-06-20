import type { Component } from 'solid-js';
import { ConnectionBar } from './components/Connection/ConnectionBar';
import { ConnectionSidebar } from './components/Connection/ConnectionSidebar';
import { Tabs } from './components/Tabs/Tabs';

const App: Component = () => {
  return (
    <div class="h-screen w-screen flex flex-col">
      <ConnectionBar />
      <div class="flex flex-col h-full">
        <div class="flex flex-row h-full ">
          <div class="flex flex-col w-1/4 pr-4 border-r-2 border-r-dark-900 bg-dark-900/50">
            <ConnectionSidebar />
          </div>
          <div class="w-full">
            <Tabs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
