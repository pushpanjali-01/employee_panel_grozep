import { styled, useTheme } from '@mui/material'
import { SimpleCard } from 'app/components'

import DoughnutChart from './Doughnut'

const Container = styled('div')(({ theme }) => ({
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

const AppEchart = () => {
    const theme = useTheme()
    return (
        <Container>
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
        </Container>
    )
}

export default AppEchart
