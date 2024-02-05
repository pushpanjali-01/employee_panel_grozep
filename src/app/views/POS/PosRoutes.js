import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const MakeOrder = Loadable(lazy(() => import('./MakeOrder')))
const Orders = Loadable(lazy(() => import('./POSList')))
const PosRoutes = [
    {
        path: '/pos/make-order',
        element: <MakeOrder/>,
        auth: authRoles.Cashier,
    },
    {
        path: '/pos/offline-orders',
        element: <Orders/>,
        auth: authRoles.Cashier,
    },
]

export default PosRoutes
