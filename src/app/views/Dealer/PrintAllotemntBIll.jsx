import { SimpleCard } from 'app/components'
import { Button, Grid, Icon, styled, Box, Autocomplete } from '@mui/material'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
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
const PrintAllotemnetBill = () => {
    const [invoiceData, setInvoiceData] = useState(null)
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

    const handleClose = (event, reason) => {
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
        url.get(`v1/in/orders/${orderId}`)
            .then((response) => {
                if (response.data.status == true) {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        const {
                            orderNumber,
                            orderDateTime,
                            name,
                            phone,
                            paymentType,
                            status,
                            address,
                            items,
                            totalQuantitys,
                            orderAmount,
                            deliveryCharge,
                            couponAmount,
                            redeemPoint,
                            confirmingTime,
                            packagingBoy,
                            packagingtime,
                            deliverBoy,
                            deliveryTime,
                            cancellingTime,
                            userName,
                        } = response.data.data
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
                              <strong class="invoice-details__label">Invoice ID:</strong>
                              <span class="invoice-details__value">${orderNumber}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Date & Time:</strong>
                              <span class="invoice-details__value">${orderDateTime}</span>
                            </div>
                            <div class="invoice-details__section">
                            <strong class="invoice-details__label">Confirmed Time:</strong>
                            <span class="invoice-details__value">
                              ${confirmingTime}
                            </span>
                          </div>
                          <div class="invoice-details__section">
                          <strong class="invoice-details__label">Packaging Boy:</strong>
                          <span class="invoice-details__value">
                            ${packagingBoy}
                          </span>
                          <strong class="invoice-details__label">Packaging Time:</strong>
                          <span class="invoice-details__value">
                          ${packagingtime}
                        </span>
                        </div>
                        <div class="invoice-details__section">
                        <strong class="invoice-details__label">Deliver Boy :</strong>
                        <span class="invoice-details__value">
                          ${deliverBoy}
                        </span>
                        <strong class="invoice-details__label">Delivery Time:</strong>
                        <span class="invoice-details__value">
                        ${deliveryTime}
                      </span>
                      </div>
                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">Cancel Time:</strong>
                      <span class="invoice-details__value">
                        ${cancellingTime}
                      </span>
                    </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Name:</strong>
                              <span class="invoice-details__value">${userName}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Phone:</strong>
                              <span class="invoice-details__value">${phone}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Payment Type:</strong>
                              <span class="invoice-details__value">${paymentType}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Status:</strong>
                              <span class="invoice-details__value">${status}</span>
                            </div>
                            <div class="invoice-details__section">
                              <strong class="invoice-details__label">Address:</strong>
                              <span class="invoice-details__value">
                                ${address}
                              </span>
                            </div>
                            <div class="invoice-details__separator" />
                            <h3 class="invoice-details__title">Items (${totalQuantitys})</h3>
                            <table class="invoice-details__table">
                              <thead>
                                <tr>
                                  <th>Sno</th>
                                  <th>Item Name</th>
                                  <th>Price</th>
                                  <th>Quantity</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${items
                                    .map(
                                        (item, index) => `
                                      <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.name}</td>
                                        <td>₹${item.mrp}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${
                                            parseFloat(item.mrp) * item.quantity
                                        }</td>
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
                              <span class="invoice-details__total-value">₹${orderAmount}</span>
                            </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Delivery Charge:</span>
                              <span class="invoice-details__total-value">₹${deliveryCharge}</span>
                            </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Promo Discount:</span>
                              <span class="invoice-details__total-value">₹${couponAmount}</span>
                            </div>
                            <div class="invoice-details__total">
                              <span class="invoice-details__total-label">Loyalty Points:</span>
                              <span class="invoice-details__total-value">₹${redeemPoint}</span>
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
                setInvoiceData(null)
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

export default PrintAllotemnetBill
