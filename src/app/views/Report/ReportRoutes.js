import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const AddExpence = Loadable(lazy(() => import('./AddExpence')))
const AddDimage = Loadable(lazy(() => import('./AddDimage')))
const ReportRoutes = [
    {
        path: '/Report/add-expence',
        element: <AddExpence/>,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/Report/add-damage',
        element: <AddDimage/>,
        auth: authRoles.StoreCashier,
    },
  
]

export default ReportRoutes
