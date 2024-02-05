import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import { useState, useEffect } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import moment from 'moment'
import useAuth from 'app/hooks/useAuth'

import { url } from 'app/constants'
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
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
const CollectionReport = () => {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const { user } = useAuth()
    const [empdata, setempdat] = useState([])
    const [data, setData] = useState([])
    // Start Alert  fun //
    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleClose = (reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
    }
    useEffect(() => {
        try {
            url.get(`v1/in/${user.storeCode}/employees`)
                .then((res) => {
                    if (res.data.status === true) {
                        setempdat(res.data.data)
                    }
                })
                .catch(() => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])
    const handleSubmit = () => {
        if (
            startDate === null ||
            startDate === '' ||
            endDate === null ||
            endDate === ''
        ) {
            handleShowSnackbar('Select Date', 'error')
        } else {
            try {
                setLoading(true)
                const dataToSend = {
                    startDate: startDate,
                    endDate: endDate,
                    managerId: user.id,
                }
                url.post('v1/in/daily-collection', dataToSend)
                    .then((res) => {
                        if (res.data.status === true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('NO any Data', 'error')
                                setLoading(false)
                                setData([])
                            } else {
                                setData(res.data.data)
                                setLoading(false)
                            }
                        } else {
                            handleShowSnackbar('NO any Data', 'error')
                            setData([])
                            setLoading(false)
                        }
                    })
                    .catch(() => {
                        console.log('Error')
                    })
            } catch {
                console.log('Error')
            }
        }
    }
    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const employeeEmail = getEmployeeEmailById(item.employeeId)
            return {
                ...item,
                sno: index + 1,
                orderDateTime: moment(item.createdAt).format('LLL'),
                employeeEmail: employeeEmail,
            }
        })
    }

    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.email : ''
    }

    const tableData = {
        columns: [
            {
                label: 'Sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'Date & Time',
                field: 'orderDateTime',
                sort: 'asc',
            },

            {
                label: 'OrderNumber',
                field: 'orderInvoiceId',
                sort: 'asc',
            },
            {
                label: 'Payment Mode',
                field: 'paymentMode',
                sort: 'asc',
            },
            {
                label: 'Coupon Amount',
                field: 'promoDiscount',
                sort: 'asc',
            },
            {
                label: 'Redeem Amount',
                field: 'loyaltyPoint',
                sort: 'asc',
            },
            {
                label: 'Amount',
                field: 'totalAmount',
                sort: 'asc',
            },
            {
                label: 'Collect By',
                field: 'employeeEmail',
                sort: 'asc',
            },

            // Add more columns as needed
        ],
        rows: generateSerialNumbers(data),
    }
    const handleDateChange = (event, dateType) => {
        const newDate = moment(new Date(event.target.value)).format(
            'YYYY-MM-DD'
        )
        if (dateType === 'start') {
            setStartDate(newDate)
        } else if (dateType === 'end') {
            setEndDate(newDate)
        }
    }
    const calculateTotalSum = (data) => {
        let totalSum = 0
        let totalLoyaltyPoints = 0
        let totalPromoDiscount = 0

        data.forEach((item) => {
            totalSum += parseFloat(item.totalAmount) || 0
            totalLoyaltyPoints += parseFloat(item.loyaltyPoint) || 0
            totalPromoDiscount += parseFloat(item.promoDiscount) || 0
        })
        if (totalSum < 0) {
            totalSum = 0
        }

        return {
            totalSum: totalSum.toFixed(2),
            totalLoyaltyPoints: totalLoyaltyPoints.toFixed(2),
            totalPromoDiscount: totalPromoDiscount.toFixed(2),
        }
    }

    // Usage example
    const totals = calculateTotalSum(data)
    let totalSum = totals.totalSum
    let totalLoyaltyPoints = totals.totalLoyaltyPoints
    let totalPromoDiscount = totals.totalPromoDiscount

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Collection Report' }]}
                    />
                </div>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={4}
                                md={4}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <h6 style={{ marginBottom: '8px' }}>
                                    Start Date
                                </h6>

                                <DatePickPicker
                                    setMaxDate={true}
                                    setMinDate={false}
                                    value={startDate}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'start')
                                    }
                                />

                                <h6 style={{ marginBottom: '8px' }}>
                                    End Date
                                </h6>

                                <DatePickPicker
                                    setMaxDate={true}
                                    setMinDate={false}
                                    value={endDate}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'end')
                                    }
                                />
                                <br />
                            </Grid>
                        </Grid>
                        <br />
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={loading}
                        >
                            <Icon>send</Icon>
                            <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                                {loading && (
                                    <StyledProgress
                                        size={24}
                                        className="buttonProgress"
                                    />
                                )}
                                Submit
                            </Span>
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
            <br />
            {data.length > 0 ? (
                <>
                    <SimpleCard title="Collection Summary">
                        <Grid>
                            <h6>Total Cash Collect Amount: {totalSum} </h6>
                            <h6>Total Offer Amount: {totalPromoDiscount} </h6>
                            <h6>Total Redeem Point: {totalLoyaltyPoints}</h6>
                        </Grid>
                    </SimpleCard>

                    <br />
                    <SimpleCard title="Collect Order Summery">
                        <div className="table-responsive">
                            <MDBDataTable
                                checkbox
                                data={tableData}
                                noBottomColumns={true}
                                hover
                                className="custom-table"
                            />
                        </div>
                    </SimpleCard>
                </>
            ) : null}
        </Container>
    )
}

export default CollectionReport
