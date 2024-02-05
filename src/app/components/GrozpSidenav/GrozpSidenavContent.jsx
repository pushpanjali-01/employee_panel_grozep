import React from 'react'
import { styled } from '@mui/system'

const Content = styled('div')(() => ({
    flexGrow: 1,
    height: '100%',
    position: 'relative',
}))

const GrozpSidenavContent = ({ children }) => {
    return <Content>{children}</Content>
}

export default GrozpSidenavContent
