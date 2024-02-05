import React from 'react'
import { styled, Box } from '@mui/system'
import useSettings from 'app/hooks/useSettings'
import { Link } from 'react-router-dom'

const BrandRoot = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 18px 20px 29px',
}))

const IMG = styled('img')(() => ({
    width: '70%',
    height: '70%',
}))

const Brand = ({ children }) => {
    const { settings } = useSettings()
    const leftSidebar = settings.layout1Settings.leftSidebar
    const { mode } = leftSidebar

    return (
        <BrandRoot>
            <Link to={'/'}>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <IMG src="/assets/grozep/grozep_logo.svg" alt="" />
                </Box>
            </Link>
            <Box
                className="sidenavHoverShow"
                sx={{ display: mode === 'compact' ? 'none' : 'block' }}
            >
                {children || null}
            </Box>
        </BrandRoot>
    )
}

export default Brand
