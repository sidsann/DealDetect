import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/joy/styles';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';


ReactDOM.createRoot(document.querySelector("#root")!).render(
    <GoogleOAuthProvider clientId="887891451791-861c3ko1s0v9v30lqu97kho5jhaj6n3m.apps.googleusercontent.com">
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <App/>
            </StyledEngineProvider>
        </React.StrictMode>
    </GoogleOAuthProvider>
);