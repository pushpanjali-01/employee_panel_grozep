import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable';
import { authRoles } from '../../auth/authRoles'
const UserAllOrder= Loadable(lazy(()=>import("./UserAllOrder")))
const UserOrderCancel = Loadable(lazy(() => import("./UserOrderCancel")));
const AddUser= Loadable(lazy(()=>import("./AddUser")));

const PagesRoutes = [

    {
        path: '/users/user-order-cancel',
        element: <UserOrderCancel />,
        auth: authRoles.guest,
    },
    {
        path: '/users/user-all-orders',
        element: <UserAllOrder />,
        auth: authRoles.guest,
    },
    {
        path: '/users/add-user',
        element: <AddUser />,
        auth: authRoles.guest,
    },

]

export default PagesRoutes
