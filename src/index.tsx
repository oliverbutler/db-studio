/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';

// Initialize state
import './data/state';

import App from './App';

render(() => <App />, document.getElementById('root') as HTMLElement);
