import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
import { authRoles } from '../../auth/authRoles'
const ProductLists = Loadable(lazy(() => import('./ProductLists')))
const NewProduct = Loadable(lazy(() => import('./NewProduct')))
const Listing = Loadable(lazy(() => import('./NewListing')))
const ListingList = Loadable(lazy(() => import('./AddListing')))
const ProductDetailsUpdate = Loadable(
    lazy(() => import('./ProductDetailsUpdate'))
)
const AddAllotment = Loadable(lazy(() => import('./AddAllotment')))
const Stock = Loadable(lazy(() => import('./Stock')));
// const StoreAllotment = Loadable(lazy(() => import('./StoreAllotment')));
const UpdateVariant = Loadable(lazy(()=>import('./UpdateVarient')));
const UpdateProduct = Loadable(lazy(()=>import('./UpdateProduct')))
const StockInventry=Loadable(lazy(() => import('./StockInventry')))
const InventryListing =Loadable(lazy(() => import('./InventryListing')))
const UpdateImage = Loadable(lazy(() => import('./UpdateImage')))
const UpdateDealer =Loadable(lazy(()=>import('./UpdateDealer')))
const CheckUpdateInventryStock=Loadable(lazy(()=>import('./CheckUpdateInventryStock')))
const AddOfferProduct =Loadable(lazy(()=>import('./AddOfferProduct')))
const UpdateOfferProduct =Loadable(lazy(()=>import('./UpdateOfferProduct')))
const UpdateVariantBarcode =Loadable(lazy(()=>import('./UpdateProductVariant')))
const InventryRoute = [
    {
        path: '/inventry/add-inventry-listing',
        element: <InventryListing/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/inventry/update-dealer',
        element: <UpdateDealer/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/inventry/check-update-inventry-stock',
        element: <CheckUpdateInventryStock/>,
        auth: authRoles.productmanager,
    },
    {
        path: '/inventry/new-product',
        element: <NewProduct />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/product-lists',
        element: <ProductLists />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/product-details-update/:id',
        element: <ProductDetailsUpdate />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/new-listing',
        element: <Listing />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/listing-list',
        element: <ListingList />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/stock',
        element: <Stock />,
       auth: authRoles.guest,
    },
    {
        path: '/inventry/allotment',
        element: <AddAllotment />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/update-product',
        element: <UpdateProduct />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/update-varient',
        element: <UpdateVariant />,
       auth: authRoles.productmanager,
    },
    // {
    //     path: '/inventry/store-allotment',
    //     element: <StoreAllotment />,
    //    auth: authRoles.productmanager,
    // },
    {
        path: '/inventry/store-stock',
        element: <StockInventry />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/update-image',
        element: <UpdateImage />,
       auth: authRoles.productmanager,
    },
    {
        path: '/inventry/add-offer-product',
        element: <AddOfferProduct />,
       auth: authRoles.Cashier,
    },
    {
        path: '/inventry/update-offer-product',
        element: <UpdateOfferProduct />,
       auth: authRoles.Cashier,
    },
    {
        path: '/inventry/update-product-variant',
        element: <UpdateVariantBarcode />,
       auth: authRoles.productmanager,
    }
]

export default InventryRoute
