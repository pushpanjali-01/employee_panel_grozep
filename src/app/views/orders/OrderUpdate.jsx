import React, { useState } from 'react'
import { Span } from 'app/components/Typography'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import {
    Button,
    Grid,
    CircularProgress,
    Box,
    Icon,
    TextField,
} from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { GrozpSnackbar } from 'app/components'

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
const TextFields = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const CenteredTable = styled('table')`
    width: 100%;
    text-align: center;
    border-collapse: collapse;
    margin-top: 16px;

    th,
    td {
        border: 1px solid #ddd;
        padding: 8px;
    }

    th {
        background-color: #f2f2f2;
    }
`

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))

const OrderUpdate = () => {
    const [orderId, setorderId] = useState('')
    const [orderData, setOrderData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')

    const handleUpdateQuantity = (productId, newQuantity) => {
        // Assuming orderData is an array of objects, and each object has a productVariantId field
        const updatedOrderData = orderData.map((item) => {
            if (item.productVariantId === productId) {
                // Update the quantity for the specific product
                return { ...item, quantity: newQuantity }
            }
            return item
        })

        // Update the state with the modified orderData
        setOrderData(updatedOrderData)
    }

    const handleRemoveProduct = (productId) => {
        console.log(`Removing product ${productId}`)
    }

    const handleUpdateProduct = (productId) => {
        console.log(`Updating product ${productId}`)
    }

    const handleChange = (event) => {
        setorderId(event.target.value)
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleSubmit = () => {
        setLoading(true)

        url.get(`v1/in/orders/details?id=${orderId}`)
            .then((res) => {
                if (
                    (res.data.status === true && res.data.data != null) ||
                    res.data.data.length > 0
                ) {
                    // console.log(res.data.data.length)
                    setOrderData(res.data.data)
                    setLoading(false)
                } else {
                    handleShowSnackbar('No any record', 'error')
                    setLoading(false)
                }
            })
            .catch((error) => {
                console.log('Error fetching order:', error)
                setLoading(false)
            })
    }

    const generateTableRows = () => {
        if (orderData) {
            return orderData.orderItem.map((item, index) => (
                <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.id}</td>
                    <td>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '100px', height: '100px' }}
                        />
                    </td>
                    <td>{item.itemName}</td>
                    <td>{item.size}</td>
                    <td>{item.mrp}</td>
                    <td>{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>
                        <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(event) =>
                                handleUpdateQuantity(
                                    item.productVariantId,
                                    event.target.value
                                )
                            }
                        />
                    </td>
                    <td>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() =>
                                handleUpdateProduct(item.productVariantId)
                            }
                        >
                            Update
                        </Button>
                    </td>
                    <td>
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={() =>
                                handleRemoveProduct(item.productVariantId)
                            }
                        >
                            Remove
                        </Button>
                    </td>
                </tr>
            ))
        }
        return null
    }

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard>
                    <div className="breadcrumb">
                        <Breadcrumb
                            routeSegments={[{ name: 'Order Update' }]}
                        />
                    </div>
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
                                <TextFields
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
            <br />
            {orderData ? (
                <SimpleCard title="Order Details">
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <div className="table-responsive">
                            <CenteredTable>
                                <thead>
                                    <tr>
                                        <th>Sno</th>
                                        <th>ID</th>
                                        <th>Image</th>
                                        <th>Product Name</th>
                                        <th>Size</th>
                                        <th>MRP</th>
                                        <th>Rate</th>
                                        <th>Quantity</th>
                                        <th>Update Quantity</th>
                                        <th>Update</th>
                                        <th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>{generateTableRows()}</tbody>
                            </CenteredTable>
                        </div>
                    </Grid>
                </SimpleCard>
            ) : null}
        </Container>
    )
}

export default OrderUpdate
