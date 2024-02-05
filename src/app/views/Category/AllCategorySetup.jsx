import { Grid, styled } from '@mui/material'
import { Fragment } from 'react'
import AddBrand from '../Category/AddBrand'
import AddCategory from '../Category/AddCategory'
import AddSubCategory from '../Category/AddSubCategory'

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
const Dashboard = () => {
    return (
        <Fragment>
            <Container>
                <Grid container spacing={3}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <AddBrand />
                    </Grid>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <AddCategory />
                    </Grid>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <AddSubCategory />
                    </Grid>
                </Grid>
            </Container>
        </Fragment>
    )
}

export default Dashboard
