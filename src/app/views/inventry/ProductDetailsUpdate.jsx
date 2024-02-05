import * as React from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import { useMediaQuery } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { styled } from '@mui/system'
import { SimpleCard } from 'app/components'
import { useParams } from 'react-router-dom'
import AddVarient from './AddVarient'
import AddSize from './AddSize'
import AddColour from './AddColour'

// import CreatePrice from './AddPricing'
import ProductBasicUpdate from './ProductBasicUpdate'
import AddLabel from './AddLabel'
// styels
// context api redux

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

function ProductDetailsUpdate() {
    const { id } = useParams()
    const [value, setValue] = React.useState('1')
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'))
    const handleChangetab = (event, newValue) => {
        setValue(newValue)
    }

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={handleChangetab}
                        variant={isSmallScreen ? 'scrollable' : 'standard'}
                        scrollButtons={isSmallScreen ? 'auto' : false}
                    >
                        <Tab
                            label="Product Basic Details Update"
                            value="1"
                            textColor="secondary"
                            indicatorColor="secondary"
                        />
                        <Tab label="Product Details Update" value="2" />
                        <Tab label="Product variants Update" value="3" />
                        {/* <Tab label="Product Listing Create" value="4" /> */}
                        {/* <Tab label="Product Pricing Create" value="5" /> */}
                    </TabList>
                </Box>
                {/* product basic details */}

                <TabPanel value="1">
                    <ProductBasicUpdate productId={id} />
                </TabPanel>
                {/* close basic details */}
                <TabPanel value="2">
                    <Container>
                        <SimpleCard title="Add Size Varient">
                            <AddSize productId={id} />
                        </SimpleCard>
                        <br />
                        <SimpleCard title="Add Colour Varient">
                            <AddColour productId={id} />
                        </SimpleCard>
                        <br />
                        <SimpleCard title="Add Label">
                            <AddLabel productId={id} />
                        </SimpleCard>
                    </Container>
                </TabPanel>
                <TabPanel value="3">
                    <Container>
                        <AddVarient productId={id} />
                    </Container>
                </TabPanel>
                {/* <TabPanel value="4">
                    <Container>
                        <AddListing productId={id} />
                    </Container>
                </TabPanel> */}
                {/* <TabPanel value="5">
                    <Container>
                        <CreatePrice productId={id} />
                    </Container>
                </TabPanel> */}
            </TabContext>
        </Box>
    )
}
export default ProductDetailsUpdate
