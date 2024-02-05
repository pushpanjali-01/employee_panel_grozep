import { Grid, styled, useTheme } from '@mui/material'
import { Fragment } from 'react'
import StatCards from './graph/StatCards'
import TopSellingTable from './graph/TopSellingTable'
import { SimpleCard } from 'app/components'
import LineChart from './graph/echarts/LineChart'
import DoughnutChart from './graph/echarts/Doughnut'
// import DeliveryBoyZoneList from './graph/DeliveryBoyZoneList'
import ExpenseReportList from './graph/ExpenseReportList'
import DamageReportList from './graph/DamageReportList'
import ActiveEmployeeList from './graph/ActiveEmployeeList'
import Collections from './graph/Collections'
import useAuth from 'app/hooks/useAuth'
const H4 = styled('h4')(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: '500',

    textTransform: 'capitalize',
    color: 'green',
}))
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
}))
const Dashboard = () => {
    const theme = useTheme()
    const { user } = useAuth()
    return (
        <Fragment>
            <Container>
                <H4>
                    <b>Welcome, {user.name}! </b>
                </H4>

                <Grid container spacing={3}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <StatCards />
                    </Grid>
                    {/* <Grid item lg={4} md={4} sm={12} xs={12}>
                        <SmallCard />
                    </Grid> */}
                    {user.role === 'Cashier' && (
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <Collections />
                        </Grid>
                    )}

                    {user.role === 'Inventry Manager' && (
                        <>
                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <SimpleCard title="Brand / Category / subcategory Graph">
                                    <DoughnutChart
                                        height="350px"
                                        color={[
                                            theme.palette.primary.dark,
                                            theme.palette.error.main,
                                            theme.palette.success.light,
                                        ]}
                                    />
                                </SimpleCard>
                            </Grid>

                            <Grid item lg={6} md={6} sm={12} xs={12}>
                                <TopSellingTable />
                            </Grid>
                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                <SimpleCard title="Sold Product Summary">
                                    <LineChart
                                        height="350px"
                                        color={[
                                            theme.palette.primary.main,
                                            theme.palette.primary.light,
                                        ]}
                                    />
                                </SimpleCard>
                            </Grid>
                        </>
                    )}
                    {user.role === 'StoreAdmin' && (
                        <>
                            {/* <Grid item lg={12} md={12} sm={12} xs={12}>
                                <StatCards />
                            </Grid> */}
                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                <SimpleCard title="Active Employee">
                                    <ActiveEmployeeList />
                                </SimpleCard>
                            </Grid>
                        </>
                    )}
                    {user.role === 'Cashier' && (
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <SimpleCard title="Active Employee">
                                <ActiveEmployeeList />
                            </SimpleCard>
                        </Grid>
                    )}

                    {user.role === 'StoreAdmin' ||
                        (user.role === 'Cashier' && (
                            <>
                                <Grid item lg={12} md={12} sm={12} xs={12}>
                                    <SimpleCard title="Expense Report">
                                        <ExpenseReportList />
                                    </SimpleCard>
                                </Grid>
                                <Grid item lg={12} md={12} sm={12} xs={12}>
                                    <SimpleCard title="Damage Report">
                                        <DamageReportList />
                                    </SimpleCard>
                                </Grid>
                                {/* <Grid item lg={12} md={12} sm={12} xs={12}>
                                    <SimpleCard title="Delivery Boy Zone">
                                        <DeliveryBoyZoneList />
                                    </SimpleCard>
                                </Grid> */}
                            </>
                        ))}
                </Grid>
            </Container>
        </Fragment>
    )
}

export default Dashboard
