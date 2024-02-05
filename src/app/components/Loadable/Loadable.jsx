import React, { Suspense } from 'react'
import Loading from '../GrozpLoading/GrozpLoading'

const Loadable = (Component) => (props) =>
    (
        <Suspense fallback={<Loading />}>
            <Component {...props} />
        </Suspense>
    )

export default Loadable
