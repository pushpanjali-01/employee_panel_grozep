import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const AllOrder = Loadable(lazy(() => import('./AllOrder')))
const Orders = Loadable(lazy(() => import('./Order')))
const Pending = Loadable(lazy(() => import('./Pending')))
const OrderPacked = Loadable(lazy(() => import('./OrderPacked')))
const Delivered = Loadable(lazy(() => import('./Delivered')))
const Cancle = Loadable(lazy(() => import('./Cancle')))
const Return = Loadable(lazy(() => import('./Return')))
const OrderDetails = Loadable(lazy(() => import('./OrderDetails')))
const PrintBilling = Loadable(lazy(() => import('./PrintBill')))
const PreparedOrder = Loadable(lazy(() => import('./PreparedOrder')))
const PackedProcessing = Loadable(lazy(() => import('./PackedProcessing')))
const Orderupdates = Loadable(lazy(() => import('./OrderUpdate.jsx')))

const OrderRoutes = [
    {
        path: '/orders/all-orders',
        element: <AllOrder />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/orders/orders',
        element: <Orders />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/orders/pending-orders',
        element: <Pending />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/packed-orders',
        element: <OrderPacked />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/prepared-orders',
        element: <PreparedOrder />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/packed-processing',
        element: <PackedProcessing />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/delivered-orders',
        element: <Delivered />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/orders/cancel-orders',
        element: <Cancle />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/return-orders',
        element: <Return />,
        auth: authRoles.guest,
    },
    {
        path: '/orders/order-update',
        element: <Orderupdates />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/orders/order-details',
        element: <OrderDetails />,
  
    },
    {
        path: '/orders/order-details/:id',
        element: <OrderDetails />,
  
    },
    {
        path: '/orders/print-bill',
        element: <PrintBilling />,
      
    },
]

export default OrderRoutes
