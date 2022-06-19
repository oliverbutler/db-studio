/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

import App from './App';

invoke('greet', { name: 'World!' }).then((response) => console.log(response));

render(() => <App />, document.getElementById('root') as HTMLElement);

console.log(await appWindow.theme());
