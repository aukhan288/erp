import React from 'react';
import '../css/app.css';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.jsx';
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById('app')).render(
    <Provider store={store}>
        <ThemeProvider>
        <App />
        </ThemeProvider>
    </Provider>
);