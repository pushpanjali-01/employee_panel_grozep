import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const VerifyAllotment = Loadable(lazy(() => import('./VerifyAllotment')))
const Allotment =Loadable(lazy(() => import('./Allotment')))
const CollectCashier = Loadable(lazy(() => import('./CollectCashier')))
const CollectionReport =Loadable(lazy(()=> import('./CollectionReport')))
const StoreAllotemnet = Loadable(lazy(() => import('./StoreAllotement')))
const VerifyAllotemnt=Loadable(lazy(() => import('./VerifyStoreAllotemnt')))
const UpdateStock =Loadable(lazy(()=> import('./UpdateStock')))
const UpdateStorePrice = Loadable(lazy(() => import('./UpdateStorePrice')))
const UpdateDeliveryBoy =Loadable(lazy(()=> import('./UpdateDeliveryBoy')))
const UpdatePackagingBoy =Loadable(lazy(()=> import('./UpdatePackagingBoy')))
const SaleCollectionReport=Loadable(lazy(() => import('./SaleCollectionReport')))
const StoreAllotementList = Loadable(lazy(() => import('./StoreAllotementList')))
const ExpireProduct=Loadable(lazy(()=>import('./ExpireProduct')))
const StoreRoutes = [
    {
        path: 'store/verify-allotments',
        element: <VerifyAllotment />,
       auth: authRoles.StoreCashier,
    },
    {
        path: 'store/update-delivery-boy',
        element: <UpdateDeliveryBoy />,
       auth: authRoles.StoreCashier,
    },
    {
        path: 'store/update-packaging-boy',
        element: <UpdatePackagingBoy />,
       auth: authRoles.StoreCashier,
    },
    {
        path: 'Store/allotment-list',
        element: <Allotment />,
       auth: authRoles.StoreCashier,
    },
    {
        path: 'Store/collect-cashier',
        element: <CollectCashier />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/collection-report',
        element: <CollectionReport />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/store-allotment',
        element: <StoreAllotemnet />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/store-allotement-list',
        element: <StoreAllotementList />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/verify-store-allotement',
        element: <VerifyAllotemnt />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/update-stock',
        element: <UpdateStock />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/update-store-price',
        element: <UpdateStorePrice />,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/order-collection-report',
        element: <SaleCollectionReport/>,
       auth: authRoles.StoreAdmin,
    },
    {
        path: 'Store/expire-product',
        element: <ExpireProduct/>,
        auth: authRoles.StoreAdmin,
    }
]

export default StoreRoutes
