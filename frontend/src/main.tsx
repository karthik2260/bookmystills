import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import '../public/css/animation.css'
import { Provider } from 'react-redux'
import { store,persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter as Router } from 'react-router-dom'
import {ToastContainer} from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ToastContainer />          
          <App />
        </Router>
    </PersistGate>
  </Provider>
)