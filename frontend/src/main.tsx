import { createRoot } from "react-dom/client";

import App from "./App";

import "./index.css";
import "../public/css/animation.css";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./redux/store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <ToastContainer />
        <App />
      </Router>
    </PersistGate>
  </Provider>,
);
