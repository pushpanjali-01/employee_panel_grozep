import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'

const NotFound = Loadable(lazy(() => import('./NotFound')))
const OtpVerification = Loadable(lazy(() => import('./OtpVerification')))
const Login = Loadable(lazy(() => import('./Login')))
const TimeOut = Loadable(lazy(() => import('./ConnectionOut.jsx')))

const sessionRoutes = [
    {
        path: '/session/login',
        element: <Login />,
    },
    {
        path: '/session/otp',
        element: <OtpVerification />,
    },
    {
        path: '/session/404',
        element: <NotFound />,
    },
    {
        path: '/session/ConnectionOut',
        element: <TimeOut />,
    },
]

export default sessionRoutes
