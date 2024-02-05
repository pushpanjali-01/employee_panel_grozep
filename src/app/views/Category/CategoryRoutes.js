import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'
const AddCategory = Loadable(lazy(() => import('./AddCategory')))
const AddSubCategory = Loadable(lazy(() => import('./AddSubCategory')))
const AddBrand = Loadable(lazy(() => import('./AddBrand')))
const AllCategorySetup = Loadable(lazy(() => import('./AllCategorySetup')))
const AddCityCategory=Loadable(lazy(()=>import('./AddCityCategory')))

const CategoryRoutes = [
    {
        path: '/Category/AddBrand',
        element: <AddBrand />,
    },
    {
        path: '/Category/AddCategory',
        element: <AddCategory />,
    },
    {
        path: '/Category/AddSubCategory',
        element: <AddSubCategory />,
    },
    {
        path: '/Category/all-category-setup',
        element: <AllCategorySetup />,
    },
    {
        path: '/Category/all-city-category-setup',
        element: <AddCityCategory />,
    },
]

export default CategoryRoutes
