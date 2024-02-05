import React, { Suspense } from 'react'
import { Loading } from 'app/components'

const GrozpSuspense = ({ children }) => {
    return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export default GrozpSuspense
