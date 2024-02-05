import AuthGuard from 'app/auth/AuthGuard'
import React from 'react'
import NotFound from 'app/views/sessions/NotFound'
import dashboardRoutes from 'app/views/dashboard/DashboardRoutes'
import CategoryRoutes from 'app/views/Category/CategoryRoutes'
import sessionRoutes from 'app/views/sessions/SessionRoutes'
import GrozpLayout from '../components/GrozpLayout/GrozpLayout'
import InventryRoute from 'app/views/inventry/InventryRoute'
import OrdersRoute from 'app/views/orders/OrdersRoutes'
import HQRoutes from 'app/views/HQ/HQRoutes'
import DealerRoutes from 'app/views/Dealer/DealerRoutes'
import ZoneRoutes from 'app/views/Zone/ZoneRoutes'
import ScannerRoutes from 'app/views/Scanner/ScannerRoutes'
import ReportRoutes from 'app/views/Report/ReportRoutes'
import PosRoutes from 'app/views/POS/PosRoutes'
import StoreRoutes from 'app/views/Store/StoreRoutes'
import UsersRoutes from 'app/views/users/UsersRoutes'
import BannerRoutes from 'app/views/Banner/BannerRoutes'

import { Navigate } from 'react-router-dom'

const adminRoutes = [
    ...dashboardRoutes,
    ...OrdersRoute,
    ...CategoryRoutes,
    ...InventryRoute,
    ...HQRoutes,
    ...DealerRoutes,
    ...ZoneRoutes,
    ...ScannerRoutes,
    ...ReportRoutes,
    ...PosRoutes,
    ...StoreRoutes,
    ...UsersRoutes,
    ...BannerRoutes,
]

export const AllPages = () => {
    const all_routes = [
        {
            element: (
                <AuthGuard>
                    <GrozpLayout />
                </AuthGuard>
            ),
            children: adminRoutes,
        },
        ...sessionRoutes,
        {
            path: '/',
            element: <Navigate to="dashboard/default" />,
        },
        {
            path: '*',
            element: <NotFound />,
        },
    ]

    return all_routes
}
