import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import { formatDateTimeNew } from '../../dateUtils'
import useAuth from 'app/hooks/useAuth'
import moment from 'moment'
import '../dashboard/graph/dashboard.css'
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
        marginBottom: '10px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

const AllOrder = () => {
    const [empdata, setempdat] = useState([])
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const { user } = useAuth()
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        try {
            url.get(`v1/in/${user.storeCode}/employees`)
                .then((res) => {
                    if (res.data.status === true) {
                        setempdat(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    const handleSubmit = (event) => {
        if (startDate === null || startDate === '') {
            handleShowSnackbar('Select Date First', 'error')
        }
        if (endDate === '' || endDate === null) {
            handleShowSnackbar('Select Date First', 'error')
        } else {
            setLoading(true)
            try {
                const dataToSend = {
                    startDate: startDate,
                    endDate: endDate,
                    storeCode: user.storeCode,
                }

                url.post('v1/in/orders/all', dataToSend)
                    .then((res) => {
                        // console.log(res.data.data)
                        if (res.data.status === true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('No record found!', 'error')
                                setLoading(false)
                                setData([])
                            } else {
                                setData(res.data.data)
                                setLoading(false)
                            }
                        } else {
                            handleShowSnackbar('No record found!', 'error')
                            setData([])
                            setLoading(false)
                        }
                    })
                    .catch((error) => {
                        console.log('Error')
                    })
            } catch {
                console.log('Error')
            }
        }
    }
    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.email : ''
    }

    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            // console.log(item)
            const address = item.delivery_addresses[0].location.address
                ? item.delivery_addresses[0].location.address
                : ''
            const employeeId =
                item.task_records.find((task) => task.taskName === 'prepared')
                    ?.employeeId || ''
            const employeesId =
                item.task_records.find((task) => task.taskName === 'packed')
                    ?.employeeId || ''
            const employeessId =
                item.task_records.find((task) => task.taskName === 'delivered')
                    ?.employeeId || ''
            const employeeEmail = getEmployeeEmailById(employeeId)
            const scannerEmail = getEmployeeEmailById(employeesId)
            const shipperEmail = getEmployeeEmailById(employeessId)
            const totalAmount = item.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)

            let finalAmount =
                totalAmount +
                item.deliveryCharge -
                item.loyaltyPoint -
                item.promoDiscount
            if (finalAmount < 0) {
                finalAmount = 0
            }
            let lastTaskName = ''
            const deliveredTask =
                item.task_records.find(
                    (task) => task.taskName === 'delivered'
                ) || {}

            if (item.task_records.length > 0) {
                const lastTask = item.task_records[item.task_records.length - 1]

                if (lastTask.status === 'completed') {
                    switch (lastTask.taskName) {
                        case 'confirmed':
                            lastTaskName = 'Queue'
                            break
                        case 'prepared':
                            lastTaskName = 'Order Prepared'
                            break
                        case 'packed':
                            lastTaskName = 'Order Packed'
                            break
                        case 'delivered':
                            lastTaskName = 'Delivered'
                            break
                        case 'collected': // If last task is "collected", consider it as "Delivered"
                            lastTaskName = 'Delivered'
                            break
                        default:
                            lastTaskName = ''
                            break
                    }
                    if (item.status === 'cancelled') {
                        lastTaskName = 'Order Cancelled'
                    }
                } else if (
                    lastTask.status === 'progress' ||
                    lastTask.status === 'pending'
                ) {
                    if (lastTask.taskName === 'delivered') {
                        lastTaskName = 'Out for Delivery'
                    } else {
                        lastTaskName = `${lastTask.taskName} (Progress)`
                    }
                } else if (lastTask.status === 'cancelled') {
                    lastTaskName = 'cancelled'
                } else if (item.status === 'cancelled') {
                    lastTaskName = 'cancelled'
                }
            }

            return {
                ...item,
                sno: index + 1,
                address: address,
                statuss: lastTaskName,
                orderDateTime: formatDateTimeNew(item.createdAt),
                deliveryTime: deliveredTask.updatedAt
                    ? formatDateTimeNew(deliveredTask.updatedAt)
                    : '',
                totalAmount: finalAmount.toFixed(2),
                Packager: employeeEmail,
                scanner: scannerEmail,
                shipper: shipperEmail,
            }
        })
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
                label: 'Delivery Date',
                field: 'deliveryTime',
                sort: 'asc',
            },
            {
                label: 'OrderNumber',
                field: 'id',
                sort: 'asc',
            },
            {
                label: 'Status',
                field: 'statuss',
                sort: 'asc',
                filter: true,
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
                label: 'Phone',
                field: 'phone',
                sort: 'asc',
            },
            {
                label: 'Address',
                field: 'address',
                sort: 'asc',
            },

            {
                label: 'Packager',
                field: 'Packager',

                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
                sort: 'asc',
            },
            {
                label: 'scanner',
                field: 'scanner',

                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
                sort: 'asc',
            },
            {
                label: 'shipper',
                field: 'shipper',
                sort: 'asc',
                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
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
    // close Alert fun //
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'All Orders' }]} />
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
                                    value={startDate}
                                    setMinDate={false}
                                    setMaxDate={true}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'start')
                                    }
                                />
                            </Grid>
                            <Grid
                                item
                                lg={4}
                                md={4}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
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
                <SimpleCard title="Order Details">
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
            ) : null}
        </Container>
    )
}

export default AllOrder
