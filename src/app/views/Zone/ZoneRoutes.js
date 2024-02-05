import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable';
import { authRoles } from '../../auth/authRoles'
const Zone = Loadable(lazy(() => import("./ZoneSelector")));
const AddZone = Loadable(lazy(()=> import("./ZoneList")));
const EditZone =Loadable(lazy(()=> import("./EditZone")));
const ZoneList = Loadable(lazy(()=>import("./ZoneList")));
const ZoneRoutes = [
    {
        path: '/Zone/zone-selector',
        element: <Zone />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/Zone/add-zone',
        element: <AddZone />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/Zone/list-zone',
        element: <ZoneList />,
        auth: authRoles.StoreCashier,
    },
    {
        path: '/Zone/edit-zone/:id',
        element: <EditZone />,
        auth: authRoles.StoreCashier,
    },

]
// Wrapper component for the EditZone component

export default ZoneRoutes
