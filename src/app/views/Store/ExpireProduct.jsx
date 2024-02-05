import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import { GrozpSnackbar } from 'app/components/'
import { formatDateTimeNew } from '../../dateUtils'
import useAuth from 'app/hooks/useAuth'
import EmpAutocomplete from '../Zone/DeliveryBoyList'
import { url } from 'app/constants'
import CategoryAutocomplete from '../inventry/CategoryList'
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
const ExpireProduct = () => {
    const [loading, setLoading] = useState(false)
    const [categoryValue, setcategoryValue] = useState(null)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const { user } = useAuth()
    const [selectedOrders, setSelectedOrders] = useState([])

    const handleCategoryChange = (event, newValue) => {
        setcategoryValue(newValue)
    }
    const [data, setData] = useState([])
    // Start Alert  fun //

    const [empdata, setempdat] = useState([])
    useEffect(() => {
        fetch()
    }, [])

    const fetch = () => {
        try {
            url.get(
                `v1/in/tasks/pending?storecode=${user.storeCode}&task=packed&status=completed`
            )
                .then((res) => {
                    if (res.data.status === true) {
                        setData(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
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
    }
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
    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.email : ''
    }
    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const deliveryAddress = item.delivery_addresses[0]
            const address = deliveryAddress
                ? deliveryAddress.location.address
                : ''
            const employeeId =
                item.task_records.find((task) => task.taskName === 'prepared')
                    ?.employeeId || ''
            const employeesId =
                item.task_records.find((task) => task.taskName === 'packed')
                    ?.employeeId || ''
            const employeeEmail = getEmployeeEmailById(employeeId)
            const scannerEmail = getEmployeeEmailById(employeesId)

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
                select: (
                    <input
                        type="checkbox"
                        checked={selectedOrders.includes(item.id)}
                        onChange={() => handleOrderSelect(item.id)}
                    />
                ),
                sno: index + 1,
                orderDateTime: formatDateTimeNew(item.createdAt),
                address: address,
                totalAmount: finalAmount.toFixed(2),
                Packager: employeeEmail,
                Scanner: scannerEmail,
            }
        })
    }

    const handleOrderSelect = (orderId) => {
        setSelectedOrders((prevSelectedOrders) => {
            if (prevSelectedOrders.includes(orderId)) {
                return prevSelectedOrders.filter((id) => id !== orderId)
            } else {
                return [...prevSelectedOrders, orderId]
            }
        })
    }

    const handleSubmit = (event) => {
        // console.log(categoryValue.name)
        if (categoryValue === null || categoryValue === '') {
            return handleShowSnackbar('Select Delivery Boy', 'error')
        }
        if (!selectedOrders || selectedOrders.length === 0) {
            return handleShowSnackbar('Select Order ', 'error')
        }
        setLoading(true)
        // try {
        //     const dataToSend = {
        //         employeeId: categoryValue.employee.id,
        //         storeCode: user.storeCode,
        //         orderNumbers: selectedOrders,
        //     }

        //     url.post('v1/in/shippers/tasks/assign', dataToSend)
        //         .then((res) => {
        //             if (res.data.status === true) {
        //                 handleShowSnackbar(
        //                     'Order Asigned Successfully!',
        //                     'success'
        //                 )
        //                 fetch()
        //                 setEmpValue(null)
        //                 setSelectedOrders([])
        //                 setLoading(false)
        //             } else {
        //                 handleShowSnackbar('NO any Data', 'error')
        //                 setLoading(false)
        //                 setSelectedOrders([])
        //             }
        //         })
        //         .catch((error) => {
        //             setLoading(false)
        //             handleShowSnackbar('Server error', 'error')
        //         })
        // } catch {
        //     console.log('Error')
        // }
    }

    const tableData = {
        columns: [
            {
                label: 'Select',
                field: 'select',
                sort: 'disabled',
                width: 100,
                attributes: {
                    'aria-controls': 'DataTable',
                    'aria-label': 'Select',
                },
            },
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
            },
            {
                label: 'Packager',
                field: 'Packager',
                sort: 'asc',
            },
            {
                label: 'Scanner',
                field: 'Scanner',
                sort: 'asc',
            },
            // Add more columns as needed
        ],
        rows: generateSerialNumbers(data),
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Near About Expire Product' }]}
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
                                <CategoryAutocomplete
                                    value={categoryValue}
                                    onChange={handleCategoryChange}
                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={loading || categoryValue == null}
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

            <SimpleCard title={`Packed Order (${data.length})`}>
                <div className="table-responsive">
                    <MDBDataTable
                        checkbox
                        data={tableData}
                        noBottomColumns={true}
                        hover
                        getValueCheckBox={(e) => {
                            handleOrderSelect(e)
                        }}
                        className="custom-table"
                    />
                </div>
            </SimpleCard>
        </Container>
    )
}

export default ExpireProduct
