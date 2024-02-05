import React from 'react'
import { GrozpLayouts } from './index'
import { GrozpSuspense } from 'app/components'
import useSettings from 'app/hooks/useSettings'

const GrozpLayout = (props) => {
    const { settings } = useSettings()
    const Layout = GrozpLayouts[settings.activeLayout]

    return (
        <GrozpSuspense>
            <Layout {...props} />
        </GrozpSuspense>
    )
}

export default GrozpLayout
