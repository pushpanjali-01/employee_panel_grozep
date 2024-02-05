import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import moment from 'moment'
import useAuth from 'app/hooks/useAuth'
import EmpAutocomplete from '../Zone/CashierList'
import { formatDateTimeNew } from '../../dateUtils'
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
const CollectCashier = () => {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()
    const [EmpValue, setEmpValue] = useState(null)
    const handleEmpChange = (event, newValue) => {
        setEmpValue(newValue)
    }
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

    const handleSubmit = (event) => {
        if (EmpValue === null || EmpValue === '') {
            handleShowSnackbar('Select Cashier Boy', 'error')
        } else {
            try {
                setLoading(true)
                const dataToSend = {
                    startDate: startDate === 'Invalid date' ? null : startDate,
                    endDate: endDate === 'Invalid date' ? null : endDate,
                    employeeId: parseInt(EmpValue.employeeId),
                    storeCode: user.storeCode,
                }

                url.post('v1/in/orders/admin', dataToSend)
                    .then((res) => {
                        if (res.data.status === true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('data not found', 'error')
                                setLoading(false)
                                setData([])
                            } else {
                                setData(res.data.data)
                                setLoading(false)
                            }
                        } else {
                            handleShowSnackbar('data not found', 'error')
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
    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            // Assuming there's only one address in the array
            const address = item.delivery_addresses[0].location.address
                ? item.delivery_addresses[0].location.address
                : ''

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
            totalSum += finalAmount
            return {
                ...item,
                sno: index + 1,
                orderDateTime: formatDateTimeNew(item.createdAt),
                address: address,
                totalAmount: finalAmount.toFixed(2),
            }
        })
    }

    const formattedData = data.map((entry) => {
        const totalAmount = entry.order_items.reduce((sum, orderItem) => {
            const price = parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
            const quantity = orderItem.quantity - orderItem.removedQty
            return sum + price * quantity
        }, 0)
        let finalAmount =
            totalAmount +
            entry.deliveryCharge -
            entry.loyaltyPoint -
            entry.promoDiscount
        if (finalAmount < 0) {
            finalAmount = 0
        }
        return {
            orderInvoiceId: entry.id,
            loyaltyPoint: entry.loyaltyPoint,
            deliveryCharge: entry.deliveryCharge,
            promoDiscount: entry.promoDiscount,
            paymentMode: entry.paymentMode,
            totalAmount: finalAmount.toFixed(2), // Format finalAmount as a fixed decimal number
            orderedAt: formatDateTimeNew(entry.createdAt),
        }
    })

    const CollectAmount = async () => {
        try {
            setIsLoading(true)
            const dataToSend = {
                employeeId: parseInt(EmpValue.employeeId),
                managerId: user.id,
                items: formattedData,
            }
            const response = await url.put(
                'V1/in/orders/collected/admin',
                dataToSend
            )

            if (response.data.status === true) {
                handleShowSnackbar('Collect Payment Successfully!', 'success')
                setIsLoading(false)
                setEmpValue(null)
                setStartDate('')
                setEndDate('')
                setData([])
            } else {
                handleShowSnackbar('No any Data', 'error')
                setIsLoading(false)
                setData([])
            }
        } catch (error) {
            handleShowSnackbar('An error occurred', 'error')
        } finally {
            setIsLoading(false)
        }
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
                field: 'id',
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
                label: 'Status',
                field: 'status',
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
    const calculateTotalSum = (data) => {
        let totalLoyaltyPoints = 0
        let totalPromoDiscount = 0
        data.forEach((item) => {
            totalLoyaltyPoints += item.loyaltyPoint || 0
            totalPromoDiscount += item.promoDiscount || 0
        })

        return {
            totalLoyaltyPoints: totalLoyaltyPoints.toFixed(2),
            totalPromoDiscount: totalPromoDiscount.toFixed(2),
        }
    }
    const calculateTotalSums = (data) => {
        let subtoatl = 0
        data.forEach((order) => {
            const totalAmount = order.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)
            let finalAmount =
                totalAmount +
                order.deliveryCharge -
                order.loyaltyPoint -
                order.promoDiscount
            if (finalAmount < 0) {
                finalAmount = 0
            }

            subtoatl += finalAmount
        })
        return subtoatl.toFixed(2)
    }
    let totalSum = calculateTotalSums(data)
    // Usage example
    const totals = calculateTotalSum(data)

    let totalLoyaltyPoints = totals.totalLoyaltyPoints
    let totalPromoDiscount = totals.totalPromoDiscount
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Collect Orders' }]} />
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
                                <EmpAutocomplete
                                    value={EmpValue}
                                    onChange={handleEmpChange}
                                />
                                <h6 style={{ marginBottom: '8px' }}>
                                    Start Date
                                </h6>

                                <DatePickPicker
                                    setMinDate={false}
                                    setMaxDate={true}
                                    value={
                                        startDate !== 'Invalid date'
                                            ? startDate
                                            : null
                                    }
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'start')
                                    }
                                />

                                <h6 style={{ marginBottom: '8px' }}>
                                    End Date
                                </h6>

                                <DatePickPicker
                                    value={
                                        endDate !== 'Invalid date'
                                            ? endDate
                                            : null
                                    }
                                    setMaxDate={true}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'end')
                                    }
                                    setMinDate={false}
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
                            <h6>
                                Total Cash Collect Amount:{' '}
                                <b>
                                    <span
                                        style={{
                                            color: 'green',
                                            fontSize: 'bold',
                                        }}
                                    >
                                        {totalSum}{' '}
                                    </span>
                                </b>
                            </h6>
                            <h6>
                                Total Offer Amount:{' '}
                                <b>
                                    <span
                                        style={{
                                            color: 'blue',
                                            fontSize: 'bold',
                                        }}
                                    >
                                        {totalPromoDiscount}{' '}
                                    </span>
                                </b>{' '}
                            </h6>
                            <h6>
                                Total Redeem Point:{' '}
                                <b>
                                    <span
                                        style={{
                                            color: 'red',
                                            fontSize: 'bold',
                                        }}
                                    >
                                        {totalLoyaltyPoints}{' '}
                                    </span>
                                </b>{' '}
                            </h6>
                        </Grid>
                        <Grid container>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={CollectAmount}
                                sx={{ width: '100%' }}
                                disabled={isLoading}
                            >
                                {' '}
                                {isLoading && (
                                    <StyledProgress
                                        size={24}
                                        className="buttonProgress"
                                    />
                                )}
                                Collect Amount
                            </Button>
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

export default CollectCashier
