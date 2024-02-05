import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const BannerList = Loadable(lazy(() => import('./banner-list')))
const BannerCreate = Loadable(lazy(() => import('./banner-create')))
const BannerUpdate = Loadable(lazy(() => import('./banner-update')))


const BannerRoutes = [
    {
        path: '/Banner/banner-list',
        element: <BannerList />,
        auth: authRoles.Cashier,
    },
    {
        path: '/Banner/banner-create',
        element: <BannerCreate />,
        auth: authRoles.Cashier,
    },
    {
        path: '/Banner/banner-update',
        element: <BannerUpdate />,
        auth: authRoles.Cashier,
    },


]

export default BannerRoutes


