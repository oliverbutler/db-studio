import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <>
      <div data-tauri-drag-region class="pl-20 h-7 dark:bg-zinc-800"></div>
      <p class="text-4xl text-purple-700 font-bold text-center py-20">
        DB Studio! 🪄
      </p>
    </>
  );
};

export default App;
