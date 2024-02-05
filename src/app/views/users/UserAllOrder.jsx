import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { GrozpSnackbar } from 'app/components/'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import { url } from 'app/constants'
import { formatDateTimeNew } from '../../dateUtils'

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
        marginBottom: '10px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const UserAllOrders = () => {
    const [data, setData] = useState([])
    const [state, setState] = useState('')
    const { mobile } = state
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const [userName, setUserName] = useState('')
    const [numberStatus, setNumberStatus] = useState('')

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

    // fetch user all order start
    const handleSubmit = (event) => {
        setLoading(true)
        try {
            const dataToSend = {
                phone: mobile,
            }

            url.post('v1/in/orders', dataToSend)
                .then((res) => {
                    if (res.data.status === true) {
                        if (res.data.data.length <= 0) {
                            handleShowSnackbar('data not found!', 'error')
                            setLoading(false)
                            setData([])
                        } else {
                            setData(res.data.data)
                            setState('')
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
    // fetch user all order end

    // set order data in table start
    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const totalAmount = item.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)
            const couponCodes = item.teamwork_coupon_usages.map(
                (couponUsage) => couponUsage.couponCode
            )
            let finalAmount =
                totalAmount +
                item.deliveryCharge -
                item.loyaltyPoint -
                item.promoDiscount
            if (finalAmount < 0) {
                finalAmount = 0
            }
            let lastTaskName = 'Cancelled'

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
                        lastTaskName = 'Cancelled'
                    }
                } else if (lastTask.status === 'progress') {
                    if (lastTask.taskName === 'delivered') {
                        lastTaskName = 'Out for Delivery'
                    } else {
                        lastTaskName = `${lastTask.taskName} (Progress)`
                    }
                }
            }
            return {
                ...item,
                sno: index + 1,
                orderDateTime: formatDateTimeNew(item.createdAt),
                totalAmount: finalAmount.toFixed(2),
                couponCodes: couponCodes.join(','),
                status: lastTaskName,
                details: (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => fetchOrderDetails(item.id)}
                    >
                        Details
                    </Button>
                ),
            }
        })
    }
    // set order data in table end

    // order details fetch start
    const fetchOrderDetails = async (orderId) => {
        url.get(`v1/in/orders/details?id=${orderId}`)
            .then((response) => {
                if (response.data.status === true && response.data.data) {
                    setState('')
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        const data = response.data.data
                        const totalQuantity = data.orderItem.reduce(
                            (total, item) => total + item.quantity,
                            0
                        )
                        const returnAmount = data.orderItem.reduce(
                            (total, item) =>
                                total + item.removedQuantity * item.price,
                            0
                        )
                        let lastTaskName = ''
                        if (data.taskStatus.length > 0) {
                            const lastTask =
                                data.taskStatus[data.taskStatus.length - 1]

                            if (lastTask.taskStatus === 'completed') {
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
                                if (data.orderStatus.status === 'cancelled') {
                                    lastTaskName = 'Order Cancelled'
                                }
                            } else if (
                                lastTask.taskStatus === 'progress' ||
                                lastTask.taskStatus === 'pending'
                            ) {
                                if (lastTask.taskName === 'delivered') {
                                    lastTaskName = 'Out for Delivery'
                                } else {
                                    lastTaskName = `${lastTask.taskName} (Progress)`
                                }
                            } else if (lastTask.taskStatus === 'cancelled') {
                                lastTaskName = 'cancelled'
                            }
                        }
                        const confirmedTime = data.taskStatus.find(
                            (task) => task.taskName === 'confirmed'
                        )?.startDateTime

                        const packagingTime =
                            data.taskStatus.find(
                                (task) => task.taskName === 'prepared'
                            )?.finishDateTime || ''

                        const scanningTime =
                            data.taskStatus.find(
                                (task) => task.taskName === 'packed'
                            )?.finishDateTime || ''

                        const outForDeliveryTime =
                            data.taskStatus.find(
                                (task) => task.taskName === 'delivered'
                            )?.startDateTime || ''
                        const deliveryTime =
                            data.taskStatus.find(
                                (task) =>
                                    task.taskName === 'delivered' &&
                                    task.taskStatus === 'completed'
                            )?.finishDateTime || ''
                        const packingboy =
                            data.taskStatus.find(
                                (task) => task.taskName === 'prepared'
                            )?.employeeId || ''
                        const scannigboy =
                            data.taskStatus.find(
                                (task) => task.taskName === 'packed'
                            )?.employeeId || ''
                        const deliveryboy =
                            data.taskStatus.find(
                                (task) => task.taskName === 'delivered'
                            )?.employeeId || ''

                        printWindow.document.write(`
                      <html>
                        <head>
                          <title>Print Invoice</title>
                          <style>
                            /* Add your custom styles for the printable invoice here */
                            /* For example: */
                            .invoice-details {
                              /* styles for the invoice details section */
                            }
                            
                            .invoice-details__table {
                              border-collapse: collapse;
                              width: 100%;
                            }
                            
                            .invoice-details__table th,
                            .invoice-details__table td {
                              border: 1px solid black;
                              padding: 8px;
                              text-align: left;
                            }
                            
                            .invoice-details__table th {
                              background-color: #f2f2f2;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="invoice-details">
                            <h2 class="invoice-details__title">Order Details</h2>
                            <div class="invoice-details__section">
                            <strong class="invoice-details__label">Store Code:</strong>
                            <span class="invoice-details__value">${
                                data.storeCode
                            }(${data.storeAddress})</span>
                          </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Invoice ID:</strong>
                              <span class="invoice-details__value">${
                                  data.invoiceId
                              }</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Date & Time:</strong>
                              <span class="invoice-details__value">${
                                  data.orderDateTime
                              }</span>
                            </div>
                            <div class="invoice-details__section">
                            <strong class="invoice-details__label">Confirmed Time:</strong>
                            <span class="invoice-details__value">
                              ${confirmedTime}
                            </span>
                          </div>
                          <div class="invoice-details__section">
                          <strong class="invoice-details__label">Packaging Boy:</strong>
                          <span class="invoice-details__value">
                            ${packingboy},
                          </span>
                          <strong class="invoice-details__label">Packaging Time:</strong>
                          <span class="invoice-details__value">
                          ${packagingTime}
                        </span>
                        </div>
                        <div class="invoice-details__section">
                        <strong class="invoice-details__label">Scanning Boy:</strong>
                        <span class="invoice-details__value">
                          ${scannigboy},
                        </span>
                        <strong class="invoice-details__label">Scanning Time:</strong>
                        <span class="invoice-details__value">
                        ${scanningTime}
                      </span>
                      </div>
                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">Out For Delivery Time:</strong>
                      <span class="invoice-details__value">
                      ${outForDeliveryTime}
                    </span>
                    </div>
                        <div class="invoice-details__section">
                        <strong class="invoice-details__label">Delivery Boy :</strong>
                        <span class="invoice-details__value">
                          ${deliveryboy},
                        </span>
                        <strong class="invoice-details__label">Delivered Time:</strong>
                        <span class="invoice-details__value">
                        ${deliveryTime}
                      </span>
                      </div>
                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">Cancel Reason:</strong>
                      <span class="invoice-details__value">
                      ${data.orderStatus.reason}
                    </span>
                    </div>
                    
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Name:</strong>
                              <span class="invoice-details__value">${
                                  data.name
                              }</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Phone:</strong>
                              <span class="invoice-details__value">${
                                  data.phone
                              }</span>
                            </div>
                            <div class="invoice-details__section">
                            <strong class="invoice-details__label">Alternet Phone:</strong>
                            <span class="invoice-details__value">${
                                data.phoneAlt
                            }</span>
                          </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Payment Type:</strong>
                              <span class="invoice-details__value">${
                                  data.billingInfo.paymentType
                              }</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Status:</strong>
                              <span class="invoice-details__value">${lastTaskName}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Address:</strong>
                              <span class="invoice-details__value">
                                ${data.address}
                              </span>
                            </div>
                            <div class="invoice-details__separator" />
                            <h3 class="invoice-details__title">Items (${totalQuantity})</h3>
                            <table class="invoice-details__table">
                              <thead>
                                <tr>
                                  <th>Sno</th>
                                  <th>Image</th>
                                  <th>Item Name</th>
                                  <th>MRP</th>
                                  <th>Price</th>
                                  <th>Quantity</th>
                                  <th>Subtotal</th>
                                  <th>Remove Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                              ${data.orderItem
                                  .map(
                                      (item, index) => `
                                      <tr>
                                    <td>${index + 1}</td>
                                    <td><img src="${item.imageUrl}" alt="${
                                          item.itemName
                                      }" width="50" height="50"></td> 
                                    <td>${item.itemName},${item.size}</td>
                                    <td>₹${item.mrp}</td>
                                    <td>₹${item.price.toFixed(2)} </td>
                                    <td>${item.quantity}</td>
                                    <td>₹${(
                                        parseFloat(item.price) * item.quantity
                                    ).toFixed(2)}</td>
                                    <td style="
                                    ${
                                        item.removedQuantity > 0
                                            ? 'color: red;'
                                            : ''
                                    }
                                    ${
                                        item.removedQuantity > 0
                                            ? 'background-color: white;'
                                            : ''
                                    }
                                  ">
                                    ${item.removedQuantity}
                                  </td>
                                    </tr>
                                  `
                                  )
                                  .join('')}
                            </tbody>
                            </table>
                            <div class="invoice-details__separator" />
                            &nbsp;
                            &nbsp;
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Total Amount:</span>
                              <span class="invoice-details__total-value">₹${
                                  data.billingInfo.itemTotal
                              }</span>
                            </div>
                            <div class="invoice-details__total">
                            <span class="invoice-details__total-label">Sub Total Amount:</span>
                            <span class="invoice-details__total-value">₹${data.billingInfo.subTotal.toFixed(
                                2
                            )}</span>
                          </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Delivery Charge:</span>
                              <span class="invoice-details__total-value">₹${
                                  data.billingInfo.deliveryCharge
                              }</span>
                            </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Promo Discount:</span>
                              <span class="invoice-details__total-value">₹${
                                  data.billingInfo.promoDiscount
                              }</span>
                            </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Loyalty Points:</span>
                              <span class="invoice-details__total-value">₹${
                                  data.billingInfo.loyaltyPoints
                              }</span>
                            </div>
                            <div class="invoice-details__total">
                            <span class="invoice-details__total-label">Return Amount:</span>
                            <span class="invoice-details__total-value">₹${returnAmount}</span>
                          </div>
                            <div class="invoice-details__total">
                            <span class="invoice-details__total-label">Payable Amount:</span>
                            <span class="invoice-details__total-value">₹${data.billingInfo.grandTotal.toFixed(
                                2
                            )}</span>
                            
                            <div class="invoice-details__total">
                            <span class="invoice-details__total-label">Refund Point:</span>
                            <span class="invoice-details__total-value">₹${data.billingInfo.returnPoint.toFixed(
                                2
                            )}</span>
                          </div>
                            <div class="invoice-details__separator" />
                            <div class="invoice-details__footer">
                              <p>Thank you for shopping with us!</p>
                              <p>For any queries, contact customer support at 8448-444-943.</p>
                            </div>
                            <script>
                              window.onafterprint = function () {
                                window.close();
                              };
                            </script>
                          </div>
                        </body>
                      </html>
                    `)
                        printWindow.document.close()
                    } else {
                        console.error('Failed to open the print window.')
                    }
                } else {
                    handleShowSnackbar('Order Id Not found !', 'error')
                }
            })
            .catch((error) => {
                handleShowSnackbar('Error fetching data', 'error')
            })
    }
    // order details fetch end

    const fetchUserData = async (phoneNumber) => {
        try {
            const response = await url.post('v1/in/users/details', {
                phone: phoneNumber,
            })
            const responseData = response.data

            if (responseData.status === true) {
                setUserName(responseData.data.name)
                setNumberStatus('Registered')
            } else {
                setNumberStatus('Not Registered')
                setUserName('')
            }
        } catch (error) {
            console.log('Error', error)
            setNumberStatus('Error')
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
                label: 'Status',
                field: 'status',
                sort: 'asc',
            },
            {
                label: 'Serial Number',
                field: 'couponCodes',
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
                label: 'Channel',
                field: 'orderChannel',
                sort: 'asc',
            },

            {
                label: 'Details',
                field: 'details',
                sort: 'asc',
            },

            // Add more columns as needed
        ],
        rows: generateSerialNumbers(data),
    }
    const isNumber = (value) => {
        return /^\d+$/.test(value)
    }

    const isTenDigits = (value) => {
        return value.length === 10
    }

    const handleChange = (event) => {
        event.persist()

        const { name, value } = event.target
        const cleanedValue = value.replace(/\D/g, '')
        const truncatedValue = cleanedValue.slice(0, 10)

        if (name === 'mobile') {
            if (isNumber(truncatedValue) && isTenDigits(truncatedValue)) {
                fetchUserData(truncatedValue)
            } else {
                setUserName('')
                setNumberStatus('Invalid Number')
            }
        }

        setState((prevState) => ({
            ...prevState,
            [name]: truncatedValue,
        }))
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'User  All Orders' }]}
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
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                {numberStatus === 'Registered' && (
                                    <p style={{ color: 'green' }}>{userName}</p>
                                )}
                                {numberStatus === 'Not Registered' && (
                                    <p style={{ color: 'red' }}>
                                        Not Registered
                                    </p>
                                )}
                                {numberStatus === 'Invalid Number' && (
                                    <p style={{ color: 'red' }}>
                                        Invalid Number
                                    </p>
                                )}
                                {numberStatus === 'Error' && (
                                    <p style={{ color: 'red' }}>
                                        An error occurred while checking the
                                        number
                                    </p>
                                )}
                                <TextField
                                    label="Mobile Nubmer"
                                    onChange={handleChange}
                                    type="text"
                                    name="mobile"
                                    value={mobile || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                        </Grid>
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
                <SimpleCard
                    title={`${data[0].userName} All Orders (${data.length})`}
                >
                    <div className="table-count">
                        <p> {data[0].phone}</p>
                    </div>

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

export default UserAllOrders
