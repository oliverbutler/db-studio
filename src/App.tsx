import type { Component } from 'solid-js';
import { ConnectionBar } from './components/Connection/ConnectionBar';

const App: Component = () => {
  return (
    <div class="h-screen w-screen flex flex-col">
      <ConnectionBar />
      <div class="flex flex-col h-full">
        <div class="flex flex-row h-full ">
          <div class="flex flex-col w-1/4 pr-4 bg-zinc-800 border-r-2 border-r-zinc-900">
            sidebar
          </div>
          <div class="">tabs</div>
        </div>
      </div>
    </div>
  );
};

export default App;
