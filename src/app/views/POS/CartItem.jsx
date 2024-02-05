import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import {
    Button,
    Icon,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import { GrozpSnackbar } from 'app/components/'
import VoucherSelection from './VoucherSelector'

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

const useStyles = makeStyles({
    tableContainer: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        fontSize: 'smaller',
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f0faf2',
        position: 'sticky',
    },
    tableCell: {
        padding: '8px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '12px',
    },
    tableCellBold: {
        fontWeight: 'bold',
        fontSize: '12-x',
    },
})

const TextFields = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const QuantityInput = styled('input')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
    },
}))

const QuantityControl = styled('div')({
    display: 'flex',
    alignItems: 'center',
})

const QuantityButton = styled(IconButton)(({ theme }) => ({
    padding: 0,
    width: '30px',
    height: '30px',
}))

const QuantityDisplay = styled(Span)({
    margin: '0 10px',
    display: 'inline-block',
    minWidth: '30px', // Add this line to set the minimum width
})

const CartItem = () => {
    const { user } = useAuth()
    // Initialize storecart state with data from local storage
    const [searchTerm, setSearchTerm] = useState('')
    const [totalAmount, setTotalAmount] = useState(1000)
    const [voucheramount, setVoucherAmount] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [products, setProducts] = useState([''])
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [mobileNumber, setMobileNumber] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [selectedQuantities, setSelectedQuantities] = useState({})
    const [userdata, setUserdata] = useState('')
    const [voucherdata, setVoucherdata] = useState([])
    const [Redeemdata, setRedeemtData] = useState('')
    const [RedeemPoint, setRedeemPoint] = useState('')
    const [payamount, setPayamount] = useState('')
    useEffect(() => {
        try {
            url.get(`v1/in/listings/stores?storeCode=${user.storeCode}`)
                .then((res) => {
                    setProducts(res.data.data)
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    useEffect(() => {
        if (mobileNumber.length === 10) {
            try {
                const data = {
                    phone: mobileNumber,
                }

                url.post('v1/in/users/details', data)
                    .then((res) => {
                        setUserdata(res.data.data)
                    })
                    .catch((error) => {
                        console.log('Error')
                    })
                const formDataToSend = new FormData()
                formDataToSend.append('mobileNumber', mobileNumber)
                url.post(
                    'https://www.buy4earn.com/React_App/GrozepPoint.php',
                    formDataToSend
                ).then((res) => {
                    // console.log(res.data);
                    setRedeemtData(res.data.UserData.total_points)
                })

                url.post(
                    'https://www.buy4earn.com/React_App/GrozepVoucherList.php',
                    formDataToSend
                )
                    .then((res) => {
                        // console.log(res.data);
                        setVoucherdata(res.data.CoupanData)
                    })
                    .catch((error) => {
                        console.log('Error')
                    })
            } catch {
                console.log('Error')
            }
        }

        setUserdata('')
        setVoucherdata([])
    }, [mobileNumber])
    useEffect(() => {
        // Load selected quantities from local storage on initial render
        const storedQuantities = localStorage.getItem('selectedQuantities')
        if (storedQuantities) {
            setSelectedQuantities(JSON.parse(storedQuantities))
        }
    }, [])

    useEffect(() => {
        // Update local storage whenever selected quantities change
        localStorage.setItem(
            'selectedQuantities',
            JSON.stringify(selectedQuantities)
        )
    }, [selectedQuantities])

    const handlePageChange = (event, newPage) => {
        setPage(newPage)
    }

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }
    const generateBillPDF = async (orderData) => {
        if (orderData) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                const items = orderData.storecart
                // const dealername = orderData.dealerValue
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
                    <h2 class="invoice-details__title">Allotmnet Details</h2>
                    <div class="invoice-details__section">
                      <strong class="invoice-details__label">Invoice ID:</strong>
              
                    </div>
                 
                    <div class="invoice-details__section">
                      <strong class="invoice-details__label">Address:</strong>
                
                    </div>
                
                    <table class="invoice-details__table">
                      <thead>
                        <tr>
                          <th>Sno</th>
                          <th>Item Name</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items
                            .map(
                                (item, index) => `
                              <tr>
                                <td>${index + 1}</td>
                                <td>${item.name}</td>
                              
                                <td>${item.quantity}</td>
                              
                              </tr>
                            `
                            )
                            .join('')}
                      </tbody>
                    </table>
                    <div class="invoice-details__separator" />
                    &nbsp;
                    &nbsp;
               
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

    const placeorder = () => {
        // Extract the product IDs and quantities from the storecart
        // if (storecart.length <= 0) {
        //     handleShowSnackbar('Add Product In bag!', 'error')
        // } else {
        //     const orderItems = storecart.map((item) => ({
        //         productVariantId: item.id,
        //         quantity: item.quantity,
        //     }))
        //     // Prepare the data to send to the server
        //     const orderData = {
        //         items: orderItems,
        //         employeeId: user.id,
        //     }
        //     url.post('v1/in/dealers/allotments', orderData)
        //         .then((response) => {
        //             if (response.data.status == true) {
        //                 generateBillPDF({ storecart })
        //                 handleShowSnackbar(
        //                     'Place Order successfully !',
        //                     'success'
        //                 )
        //                 setstorecart([])
        //                 localStorage.removeItem('storecart')
        //             } else {
        //                 handleShowSnackbar('Allotment Not Place !', 'error')
        //             }
        //         })
        //         .catch((error) => {
        //             handleShowSnackbar('Server Error ,Try again!', 'error')
        //         })
        // }
    }

    const handleSearchChange = () => {
        const results = products.filter((product) => {
            const nameMatch =
                product.name && product.name.toLowerCase().includes(searchTerm)
            const variantIdMatch =
                product.variant.id === parseInt(searchTerm, 10)
            const productIdMatch =
                product.productId === parseInt(searchTerm, 10)
            const brandMatch =
                product.brand &&
                product.brand.toLowerCase().includes(searchTerm)
            const categoryMatch =
                product.category &&
                product.category.toLowerCase().includes(searchTerm)
            const subcategoryMatch =
                product.subcategory &&
                product.subcategory.toLowerCase().includes(searchTerm)

            return (
                nameMatch ||
                variantIdMatch ||
                brandMatch ||
                categoryMatch ||
                subcategoryMatch ||
                productIdMatch
            )
        })
        setPage(0)
        setSearchResults(results)
        setLoading(false)
    }

    const handleAddToCart = (product) => {
        const productId = product.id
        const currentQuantity = selectedQuantities[productId]
            ? selectedQuantities[productId].quantity
            : 0
        const newQuantity = currentQuantity + 1

        if (newQuantity > product.stock) {
            // Do not add to cart if quantity exceeds stock
            return
        }

        setSelectedQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productId]: {
                quantity: newQuantity,
                name: product.name,
                imageUrl: product.variant.imageURL[0],
                brand: product.brand,
                size: product.size,
                color: product.color,
                category: product.category,
                subcategory: product.subcategory,
                gender: product.gender,
                family: product.family,
                group: product.group,
                class: product.product,
                packaging: product.variant.packaging,
                barcode: product.variant.barcode,
                supplies: product.variant.supplies,
                variantId: product.variant.id,
                productId: product.productId,
            },
        }))
    }
    const handleRemoveFromCart = (productId) => {
        // Implement your component-specific logic here
        handleRemoveFromCart(
            productId,
            selectedQuantities,
            setSelectedQuantities
        )
    }

    const getQuantity = (productId) => {
        // Implement your component-specific logic here
        return selectedQuantities[productId]?.quantity || ''
    }

    const isProductSelected = (productId) => {
        // Implement your component-specific logic here
        return selectedQuantities.hasOwnProperty(productId)
    }

    const handleQuantityChange = (productId, quantity) => {
        // Implement your component-specific logic here
        handleQuantityChange(
            productId,
            quantity,
            products,
            selectedQuantities,
            setSelectedQuantities
        )
    }
    // const handleRemoveFromCart = (product) => {
    //     const productId = product.id
    //     const updatedQuantities = { ...selectedQuantities }
    //     delete updatedQuantities[productId]
    //     setSelectedQuantities(updatedQuantities)
    // }
    // const getQuantity = (productId) => {
    //     return selectedQuantities[productId]
    //         ? selectedQuantities[productId].quantity
    //         : ''
    // }
    // const isProductSelected = (productId) => {
    //     return !!selectedQuantities[productId]
    // }
    // const handleQuantityChange = (productId, quantity) => {
    //     if (Number.isNaN(quantity) || quantity <= 0) {
    //         // Remove the product from the cart if quantity is NaN or less than or equal to 0
    //         handleRemoveFromCart({ id: productId })
    //     } else {
    //         const product = product.find((item) => item.id === productId)
    //         if (
    //             product &&
    //             quantity >
    //                 product.variant.supplies.reduce(
    //                     (acc, supply) => acc + supply.quantity,
    //                     0
    //                 )
    //         ) {
    //             // Do not update the quantity if it exceeds the stock
    //             quantity = product.variant.supplies.reduce(
    //                 (acc, supply) => acc + supply.quantity,
    //                 0
    //             )
    //         }

    //         setSelectedQuantities((prevQuantities) => ({
    //             ...prevQuantities,
    //             [productId]: {
    //                 ...prevQuantities[productId],
    //                 quantity: quantity,
    //             },
    //         }))
    //     }
    // }
    const classes = useStyles()

    const handleVouchersSelected = (selectedVouchers) => {
        const amount = selectedVouchers.reduce((total, voucher) => {
            return total + parseInt(voucher.OfferAmount)
        }, 0)
        setVoucherAmount(amount)
    }
    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Grid container spacing={4}>
                <Grid item lg={5} md={5} sm={12} xs={12}>
                    <SimpleCard title={'Cart Items'} style={{ height: '100%' }}>
                        <ValidatorForm
                            onSubmit={() => null}
                            onError={() => null}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item lg={12} md={12} sm={12} xs={12}>
                                    {userdata != '' ? (
                                        userdata.name
                                    ) : (
                                        <h6>New User</h6>
                                    )}

                                    <TextFields
                                        type="number"
                                        name="mobileNumber"
                                        id="standard-basic"
                                        value={mobileNumber || ''}
                                        onChange={(event) => {
                                            setMobileNumber(event.target.value)
                                        }}
                                        label="Mobile Number"
                                        validators={[
                                            'required',
                                            'isNumber',
                                            'minStringLength:10',
                                            'maxStringLength:10',
                                        ]}
                                        errorMessages={[
                                            'This field is required',
                                            'Invalid mobile number',
                                            'Mobile number must be 10 digits',
                                            'Mobile number must be 10 digits',
                                        ]}
                                    />
                                    {voucherdata.length > 0 ? (
                                        <VoucherSelection
                                            vouchers={voucherdata}
                                            onSelectVouchers={
                                                handleVouchersSelected
                                            }
                                            totalAmount={totalAmount}
                                        />
                                    ) : null}

                                    {Redeemdata ? (
                                        <TextFields
                                            type="number"
                                            name="RedeemPoint"
                                            id="standard-basic"
                                            value={RedeemPoint || ''}
                                            onChange={(event) => {
                                                setRedeemPoint(
                                                    event.target.value
                                                )
                                            }}
                                            label="Reddem Point"
                                            validators={[
                                                'required',
                                                'isNumber',
                                            ]}
                                            errorMessages={[
                                                'This field is required',
                                                'Invalid mobile number',
                                            ]}
                                        />
                                    ) : null}
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                        <div style={{ height: '400px', overflowY: 'scroll' }}>
                            <TableContainer
                                component={Paper}
                                className={classes.tableContainer}
                            >
                                <Table className={classes.table}>
                                    <TableHead className={classes.tableHeader}>
                                        <TableRow>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Image
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Product
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Size
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Quantity
                                            </TableCell>

                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Remove
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(selectedQuantities).map(
                                            ([productId, item]) => (
                                                <TableRow
                                                    key={item.productVariantId}
                                                >
                                                    <TableCell
                                                        className={
                                                            classes.tableCell
                                                        }
                                                    >
                                                        <img
                                                            src={item.image}
                                                            alt="Product"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCell
                                                        }
                                                    >
                                                        {item.name}
                                                    </TableCell>

                                                    <TableCell
                                                        className={
                                                            classes.tableCell
                                                        }
                                                    >
                                                        {item.size}
                                                    </TableCell>

                                                    <TableCell
                                                        className={
                                                            classes.tableCell
                                                        }
                                                    >
                                                        <QuantityControl>
                                                            <QuantityButton
                                                                color="secondary"
                                                                disabled={
                                                                    item.quantity ===
                                                                    1
                                                                } // Disable minus button when quantity is 1
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        productId,
                                                                        item.quantity -
                                                                            1
                                                                    )
                                                                }
                                                            >
                                                                <RemoveIcon />
                                                            </QuantityButton>
                                                            <QuantityDisplay>
                                                                {item.quantity}
                                                            </QuantityDisplay>
                                                            <QuantityButton
                                                                color="secondary"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        productId,
                                                                        item.quantity +
                                                                            1
                                                                    )
                                                                }
                                                            >
                                                                <AddIcon />
                                                            </QuantityButton>
                                                        </QuantityControl>
                                                    </TableCell>

                                                    <TableCell
                                                        className={
                                                            classes.tableCell
                                                        }
                                                    >
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() =>
                                                                handleRemoveFromCart(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Icon>delete</Icon>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        <br />
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={placeorder}
                                >
                                    Place Order
                                </Button>
                            </Grid>
                        </Grid>
                    </SimpleCard>
                </Grid>
            </Grid>
        </Container>
    )
}

export default CartItem
