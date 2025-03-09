import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import store from './store/store.js'
import './index.css'
import App from './App.jsx'


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev/index.js";

createRoot(document.getElementById('root')).render(
    // <StrictMode>
        <Provider store={store}>

            <DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}
            >
                <App/>
            </DevSupport>

        </Provider>
    // </StrictMode>,
)
