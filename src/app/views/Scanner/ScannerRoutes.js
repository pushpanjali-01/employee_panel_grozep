import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const Scanner = Loadable(lazy(() => import('./Scanner')))


const ScannerRoutes = [
    {
        path: '/Scanner/Scanner',
        element: <Scanner/>,
        auth: authRoles.scanner,
    },
  
]

export default ScannerRoutes
