import { SimpleCard } from 'app/components'
import React, { useState } from 'react'
import { Button, Grid, Icon, styled, Box } from '@mui/material'
import { Span } from 'app/components/Typography'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import { url } from 'app/constants'

import '../styles/InvoiceDetails.css'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const OrderDetails = () => {
    const [state, setState] = useState('')
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const { orderId } = state
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }

    const handleClose = (reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleSubmit = () => {
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
                                    lastTaskName = 'cancelled'
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
                        const confirmedTime =
                            data.taskStatus.find(
                                (task) => task.taskName === 'confirmed'
                            )?.startDateTime || ''

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
                            )?.finishDateTime || ' '
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

    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/invoice.png"
                title="Order Details "
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title="Order Details ">
                    <Box overflow="auto">
                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <TextField
                                    type="number"
                                    name="orderId"
                                    id="standard-basic"
                                    value={orderId || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Order ID(Ex:123)"
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Button color="primary" variant="contained" type="submit">
                        <Icon>send</Icon>
                        <Span
                            sx={{
                                pl: 1,
                                textTransform: 'capitalize',
                            }}
                        >
                            Submit
                        </Span>
                    </Button>
                </SimpleCard>
            </ValidatorForm>
        </Container>
    )
}

export default OrderDetails
