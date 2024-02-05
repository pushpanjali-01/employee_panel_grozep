import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import { GrozpSnackbar } from 'app/components/'
import useAuth from 'app/hooks/useAuth'
import EmpAutocomplete from '../Zone/AllDeliveryBoy'
import { url } from 'app/constants'
import { formatDateTimeNew } from '../../dateUtils'
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
const CancleOrder = () => {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
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
            handleShowSnackbar('Select Delivery Boy', 'error')
        } else {
            try {
                setLoading(true)
                const dataToSend = {
                    employeeId: parseInt(EmpValue.employeeId),
                    storeCode: user.storeCode,
                    status: 'cancelled',
                }

                url.post('v1/in/orders/completed', dataToSend)
                    .then((res) => {
                        if (res.data.status === true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('data not found!', 'error')
                                setLoading(false)
                                setData([])
                            } else {
                                setData(res.data.data)
                                setLoading(false)
                            }
                        } else {
                            handleShowSnackbar('data not found!', 'error')
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
            return {
                ...item,
                sno: index + 1,
                orderDateTime: formatDateTimeNew(item.createdAt),
                address: address,
                totalAmount: finalAmount.toFixed(2),
            }
        })
    }
    const CollectAmount = async () => {
        try {
            setIsLoading(true)
            const idArray = data.map((item) => item.id)
            const dataToSend = {
                orderIds: idArray,
                isCollected: 'yes',
                storeCode: user.storeCode,
                employeeId: user.id,
            }

            const response = await url.put(
                'v1/in/orders/collected/cashier',
                dataToSend
            )

            if (response.data.status === true) {
                handleShowSnackbar('Collect Order Successfully!', 'success')
                setData([])
            } else {
                handleShowSnackbar('data not found!', 'error')
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

    // Usage example

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Cancle Orders' }]} />
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
                <SimpleCard title={`Cancle Order (${data.length})`}>
                    <Grid container alignItems="center">
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
                            Collect Cancle Order
                        </Button>
                    </Grid>

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

export default CancleOrder
