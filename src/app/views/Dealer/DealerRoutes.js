import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const Dealer = Loadable(lazy(() => import('./AddDealer')))
const DealerAllotmentList = Loadable(lazy(() => import('./DealerAllotmentList')))
const StoreAllotmentList = Loadable(lazy(() => import('./StoreAllotmentList')))
const FreeItem = Loadable(lazy(() => import('./FreeItemList')))
const DealerAlltoment =Loadable(lazy(() => import('./DealerAllotment')))
const VerifyDealerAllotement=Loadable(lazy(() => import('./VerifyDealerAllotement')))
const InventryStock = Loadable(lazy(() => import('./InventeryStock')))
const UpdateInventryPrice = Loadable(lazy(() => import('./UpdatePriceInventry.jsx')))

const DealerRoutes = [

    {
        path: '/Dealer/verify-dealer-allotement',
        element: <VerifyDealerAllotement/>,
        auth: authRoles.productmanager,
    },
    
    {
        path: '/Dealer/add-dealer',
        element: <Dealer/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/Dealer/dealer-allotment-list',
        element: <DealerAllotmentList/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/Dealer/Store-allotment-list',
        element: <StoreAllotmentList/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/Dealer/free-item',
        element: <FreeItem/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/Dealer/dealer-allotment',
        element: <DealerAlltoment/>,
        auth: authRoles.productmanager,  
    },
    {
        path: '/Dealer/inventry-stock',
        element: <InventryStock/>,
        auth: authRoles.productmanager,  
    },
    {
        path: '/Dealer/inventry-price-update',
        element: <UpdateInventryPrice/>,
        auth: authRoles.productmanager,  
    }
]

export default DealerRoutes
