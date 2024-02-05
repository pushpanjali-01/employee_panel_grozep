import { Icon, Grid, CircularProgress } from '@mui/material'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Typography,
} from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import { GrozpSnackbar } from 'app/components/'
import EmpAutocomplete from '../Zone/AllDeliveryBoy'
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
const Return = () => {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
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

    const openModal = (product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedProduct(null)
        setIsModalOpen(false)
    }

    const handleSubmit = () => {
        if (EmpValue === null || EmpValue === '') {
            handleShowSnackbar('Select Delivery Boy', 'error')
        } else {
            try {
                setLoading(true)
                url.get(`v1/store/orders/returned?id=${EmpValue.employeeId}`)
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
            const address = item.address ? item.address : ''
            const totalAmount = item.totalAmount
            return {
                ...item,
                sno: index + 1,
                orderDateTime: item.orderDateTime,
                OrderNumber: item.invoiceId,
                name: item.name,
                phone: item.phone,
                phoneAlt: item.phoneAlt,
                address: address,
                totalAmount: totalAmount.toFixed(2),
                paymentMode: item.paymentMethod,
                View: (
                    <div>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => openModal(item.orderItem)}
                        >
                            View
                        </Button>
                    </div>
                ),
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
                label: 'OrderNumber',
                field: 'OrderNumber',
                sort: 'asc',
            },
            {
                label: 'Payment Mode',
                field: 'paymentMode',
                sort: 'asc',
            },
            {
                label: 'Name',
                field: 'name',
                sort: 'asc',
            },
            {
                label: 'Phone',
                field: 'phone',
                sort: 'asc',
            },
            {
                label: 'Alternet phone',
                field: 'phoneAlt',
                sort: 'asc',
            },
            {
                label: 'Return Amount',
                field: 'totalAmount',
                sort: 'asc',
            },

            {
                label: 'Address',
                field: 'address',
                sort: 'asc',
            },
            {
                label: 'View',
                field: 'View',
                sort: 'asc',
            },

            // Add more columns as needed
        ],
        rows: generateSerialNumbers(data),
    }

    const CollectAmount = async () => {
        try {
            setIsLoading(true)
            const dataToSend = {
                orders: data.map((item) => {
                    return { invoiceId: item.invoiceId }
                }),
            }
            const response = await url.put(
                'v1/store/orders/returned',
                dataToSend
            )

            if (response.data.status === true) {
                handleShowSnackbar(
                    'Collect Return Item Successfully!',
                    'success'
                )
                setData([])
            } else {
                handleShowSnackbar('data not found', 'error')
                setData([])
            }
        } catch (error) {
            handleShowSnackbar('An error occurred', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Return Products' }]} />
                </div>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <Dialog open={isModalOpen} onClose={closeModal}>
                    {selectedProduct && (
                        <>
                            <DialogTitle>Product List</DialogTitle>
                            <DialogContent>
                                <div
                                    style={{
                                        maxHeight: '400px',
                                        overflowY: 'scroll',
                                    }}
                                >
                                    <Paper>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Sno
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Image
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Item Name
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Size
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Mrp
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Rate
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Remove Qty
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedProduct.map(
                                                    (product, index) => (
                                                        <TableRow
                                                            key={product.id}
                                                        >
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        product.imageUrl
                                                                    }
                                                                    alt={
                                                                        product.itemName
                                                                    }
                                                                    width="80%"
                                                                    height="80%"
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        product.itemName
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        product.size
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        product.mrp
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        product.price
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        product.removedQuantity
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={closeModal}
                                    color="error"
                                    variant="contained"
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

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
                <SimpleCard title="Return Products ">
                    <Grid
                        container
                        alignItems="center"
                        // justify="flex-end"
                    >
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
                            Collect Return Products
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

export default Return
