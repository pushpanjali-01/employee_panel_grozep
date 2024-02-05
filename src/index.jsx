import React from 'react'
import App from './app/App'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
// import * as serviceWorker from './serviceWorker.js'
import { StyledEngineProvider } from '@mui/styled-engine'
import { CssBaseline } from '@mui/material'
import 'mdb-react-ui-kit/dist/css/mdb.min.css'

console.disableYellowBox = true
console.warn = console.error = () => {}
console.error('Something bad happened.')
ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <BrowserRouter>
            <CssBaseline />
            <App />
        </BrowserRouter>
    </StyledEngineProvider>,
    document.getElementById('root')
)
