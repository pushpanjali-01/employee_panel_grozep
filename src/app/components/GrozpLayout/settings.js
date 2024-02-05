import layout1Settings from './Layout1/Layout1Settings'
import { themes } from '../GrozpTheme/initThemes'

// UPDATE BELOW CODE
// DOC http://demos.ui-lib.com/Grozp-react-doc/layout.html
export const GrozpLayoutSettings = {
    activeLayout: 'layout1', // layout1, layout2
    activeTheme: 'blue', // View all valid theme colors inside GrozpTheme/themeColors.js
    perfectScrollbar: false,
    themes: themes,
    layout1Settings, // open Layout1/Layout1Settings.js

    secondarySidebar: {
        show: true,
        open: false,
        theme: 'slateDark1', // View all valid theme colors inside GrozpTheme/themeColors.js
    },
    // Footer options
    footer: {
        show: true,
        fixed: false,
        theme: 'slateDark1', // View all valid theme colors inside GrozpTheme/themeColors.js
    },
}
