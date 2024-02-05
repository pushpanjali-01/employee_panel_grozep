import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const StoreList = Loadable(lazy(() => import('./StoreList')))

const AddCoupan = Loadable(lazy(() => import('./CoupanList')))
const AddCity = Loadable(lazy(() => import('./AddCity')))
const EmployeeList = Loadable(lazy(() => import('./EmployeeList')))
const HQRoutes = [
    {
        path: '/HQ/store-list',
        element: <StoreList />,
        auth: authRoles.productmanager,
    },
    {
        path: '/HQ/employee-list',
        element: <EmployeeList />,
        auth: authRoles.StoreAdmin,
    },
    {
        path: '/HQ/add-city',
        element: <AddCity />,
        auth: authRoles.productmanager,
    },
    {
        path: '/HQ/add-coupon',
        element: <AddCoupan />,
        auth: authRoles.productmanager,
    },
]

export default HQRoutes
