import { Button, Icon, Grid } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { DatePicker } from '@mui/lab'
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
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
const Processing = () => {
    const [state, setState] = useState({
        date: new Date(),
    })
    // const [page, setPage] = React.useState(0)
    const data = {
        columns: [
            {
                label: '#',
                field: 'sno',
                sort: 'asc',
                width: 10,
            },
            {
                label: 'ORDER',
                field: 'OrderId',
                sort: 'asc',
                width: 100,
            },
            {
                label: 'DELIVERY DATE',
                field: 'date',
                sort: 'asc',
                width: 100,
            },
            {
                label: 'TIME SLOT',
                field: 'timeslot',
                sort: 'asc',
                width: 270,
            },
            {
                label: 'CUSTOMER',
                field: 'name',
                sort: 'asc',
                width: 200,
            },
            {
                label: 'TOTAL',
                field: 'amount',
                sort: 'asc',
                width: 100,
            },
            {
                label: 'ORDER STATUS',
                field: 'status',
                sort: 'asc',
                width: 100,
            },
        ],
        rows: [
            {
                sno: 1,
                OrderId: 123456,
                name: 'Tiger Nixon',
                timeslot: '22:30:00 - 23:30:00',
                date: '2011/04/25',
                status: 'Processing',
                amount: '$320',
            },
            {
                sno: 2,
                OrderId: 123456,
                name: 'Garrett Winters',
                timeslot: '22:30:00 - 23:30:00	',
                date: '2011/07/25',
                status: 'Pending',
                amount: '$170',
            },
            {
                sno: 3,
                OrderId: 123456,
                name: 'Ashton Cox',
                timeslot: '17:30:00 - 18:30:00',
                date: '2009/01/12',
                status: 'Pending',
                amount: '$86',
            },
            {
                sno: 4,
                OrderId: 123456,
                name: 'Cedric Kelly',
                timeslot: 'No Time Slot',
                date: '2012/03/29',
                status: 'Pending',
                amount: '$433',
            },
            {
                sno: 5,
                OrderId: 123456,
                name: 'Airi Satou',
                timeslot: 'No Time Slot',
                date: '2008/11/28',
                status: 'Pending',
                amount: '$162',
            },
        ],
    }
    // const handleChangePage = (event, newPage) => {
    //     setPage(newPage)
    // }

    // const handleChangeRowsPerPage = (event) => {
    //     setRowsPerPage(+event.target.value)
    //     setPage(0)
    // }
    useEffect(() => {
        ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
            console.log(value)

            if (value !== state.password) {
                return false
            }
            return true
        })
        return () => ValidatorForm.removeValidationRule('isPasswordMatch')
    }, [state.password])

    const handleSubmit = (event) => {
        console.log('submitted')
        console.log(mobile)
    }

    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }
    const handleDateChange = (date) => {
        setState({ ...state, date })
    }
    const { mobile, date } = state

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Processing' }]} />
                </div>

                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        value={date || ''}
                                        onChange={handleDateChange}
                                        renderInput={(props) => (
                                            <TextField
                                                {...props}
                                                // variant="Outlined"
                                                id="mui-pickers-date"
                                                label="Select Order date"
                                                sx={{ mb: 2, width: '100%' }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                        >
                            <Icon>send</Icon>
                            <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                                Filter
                            </Span>
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
            <br />
            <SimpleCard title="Processing (5)">
                <MDBDataTable
                    striped
                    checkbox
                    data={data}
                    noBottomColumns={true}
                    className="custom-table"
                    hover
                />
            </SimpleCard>
        </Container>
    )
}

export default Processing
