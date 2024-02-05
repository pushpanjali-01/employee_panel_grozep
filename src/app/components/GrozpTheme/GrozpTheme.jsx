import React from 'react'
import useSettings from 'app/hooks/useSettings'
import { CssBaseline, ThemeProvider } from '@mui/material'

const GrozpTheme = ({ children }) => {
    const { settings } = useSettings()
    let activeTheme = { ...settings.themes[settings.activeTheme] }
    return (
        <ThemeProvider theme={activeTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}

export default GrozpTheme
