import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom"; 
import store from "./redux/index.js";
import "./index.css";
import App from "./App.jsx";
import { NotificationProvider } from "./contestAPI/NotificationProvider.jsx";

createRoot(document.getElementById("root")).render(
    <NotificationProvider>
        <Provider store={store}>
            <BrowserRouter> 
                <App />
            </BrowserRouter> 
        </Provider>
    </NotificationProvider>
);