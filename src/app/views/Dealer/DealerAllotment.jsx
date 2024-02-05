import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
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
import { debounce } from 'lodash'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
}))

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const useStyles = makeStyles({
    tableContainer: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f0faf2',
    },
    tableCell: {
        padding: '2px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
    },
    tableCellBold: {
        fontWeight: 'bold',
    },
})

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
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

const DealerAllotment = () => {
    const { user } = useAuth()
    // Initialize cart state with data from local storage
    const initialCart = localStorage.getItem('cart')
    const [cart, setCart] = useState(initialCart ? JSON.parse(initialCart) : [])
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [delaerid, setdealerid] = useState([])
    const [buttonLoading, setbuttonLoading] = useState(false)
    const [inventoryId, setinventoryId] = useState('')
    useEffect(() => {
        getdata()
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])
    const getdata = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id
                setinventoryId(inventoryId)
                // Fetch the dealers based on the inventoryId
                const dealersResponse = await url.get(
                    `v1/in/dealers?inventoryId=${inventoryId}`
                )

                // Check the response of the dealers API
                if (dealersResponse.data.status === true) {
                    setdealerid(dealersResponse.data.data)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }

    const getEmployeeEmailById = (did) => {
        const employee = delaerid.find((employee) => employee.id === did)
        return employee ? employee.name : ''
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
        // Extract the product IDs and quantities from the cart
        if (cart.length === 0) {
            handleShowSnackbar('Add Product In bag!', 'error')
            return
        } else {
            setbuttonLoading(true)
            const orderItems = cart.map((item) => ({
                productVariantId: item.id,
                quantity: item.quantity,
                dealerId: item.dealerId,
                inventoryListingId: item.inventoryListingId,
            }))

            // Prepare the data to send to the server
            const orderData = {
                items: orderItems,
                employeeId: user.id,
            }
            const transformedData = {
                employeeId: orderData.employeeId,
                inventoryId: inventoryId,
                items: orderData.items.reduce(
                    (result, { dealerId, ...items }) => {
                        const dealerItem = result.find(
                            (items) => items.dealerId === dealerId
                        )
                        if (dealerItem) {
                            dealerItem.item.push(items)
                        } else {
                            result.push({
                                dealerId,
                                item: [items],
                            })
                        }
                        return result
                    },
                    []
                ),
            }

            url.post('v1/in/dealers/allotments', transformedData)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Place Allotment successfully !',
                            'success'
                        )
                        setCart([])
                        localStorage.removeItem('cart')
                        setbuttonLoading(false)
                    } else {
                        handleShowSnackbar('Allotment Not Placed !', 'error')
                        setbuttonLoading(false)
                    }
                })
                .catch((error) => {
                    handleShowSnackbar('Server Error ,Try again!', 'error')
                    setbuttonLoading(false)
                })
        }
    }

    const handleSearchChange = debounce(async (event) => {
        const term = event.target.value.trim().toLowerCase()
        if (term) {
            setSearchTerm(term)
            setLoading(true)
            try {
                const headers = {
                    inventorycode: user.storeCode, // Replace with your actual inventory code
                }
                const response = await url.get(
                    `v1/in/inventorysearch?q=${term}`,
                    {
                        headers: headers,
                    }
                )

                if (response.data.status === true) {
                    setSearchResults(response.data.data)
                    setLoading(false)
                } else {
                    // Handle the case where response status is not true
                    setSearchResults([])
                }
            } catch (error) {
                console.log('Error:', error)
            } finally {
                setLoading(false)
            }
        } else {
            setSearchResults([])
            setLoading(false)
        }
    }, 500)

    const handleAddToCart = () => {
        if (selectedProduct) {
            const isProductAdded = cart.some(
                (item) => item.id === selectedProduct.id
            )
            if (isProductAdded) {
                handleShowSnackbar('Product already added in cart', 'error')
                setQuantity(1)
                setSelectedProduct(null)
            } else {
                const lastStockIndex =
                    selectedProduct.inventory_listings[0].inventory_stocks
                        .length - 1

                let lastStockRetailPrice = null
                if (lastStockIndex >= 0) {
                    lastStockRetailPrice =
                        selectedProduct.inventory_listings[0].inventory_stocks[
                            lastStockIndex
                        ].retailPrice
                }
                // Check if quantity exceeds available stock
                const item = {
                    id: selectedProduct.id,
                    brand: selectedProduct.product.brand,
                    name: selectedProduct.product.name,
                    size:
                        selectedProduct.product_size.value +
                        selectedProduct.product_size.unit,
                    mrp: lastStockRetailPrice,
                    quantity: quantity,
                    dealerId: selectedProduct.inventory_listings[0].dealerId,
                    image: selectedProduct.images[0],
                    inventoryListingId:
                        selectedProduct.inventory_listings[0].id,
                    // Include the image property
                }
                setCart([...cart, item])
                setSelectedProduct(null)
                setSearchResults([])
                setQuantity(1)
                setSearchTerm('')
            }
        }
    }

    const handleRemoveFromCart = (productVariantid) => {
        const updatedCart = cart.filter((item) => item.id !== productVariantid)
        setCart(updatedCart)
    }

    const handleQuantityChange = (productVariantid, newQuantity) => {
        const updatedCart = cart.map((item) => {
            if (item.id === productVariantid) {
                return { ...item, quantity: newQuantity }
            }
            return item
        })
        setCart(updatedCart)
    }
    const classes = useStyles()

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Grid container spacing={4}>
                <Grid
                    item
                    lg={4}
                    md={4}
                    sm={12}
                    xs={12}
                    style={{ height: '100%' }}
                >
                    <SimpleCard
                        title={'Product Section'}
                        style={{ height: '100%' }}
                    >
                        <ValidatorForm
                            onSubmit={() => null}
                            onError={() => null}
                        >
                            <Autocomplete
                                options={searchResults}
                                value={selectedProduct}
                                getOptionLabel={(product) => {
                                    let label = ''
                                    const lastStockIndex =
                                        product.inventory_listings[0]
                                            .inventory_stocks.length - 1

                                    let lastStockRetailPrice = null
                                    if (lastStockIndex >= 0) {
                                        lastStockRetailPrice =
                                            product.inventory_listings[0]
                                                .inventory_stocks[
                                                lastStockIndex
                                            ].retailPrice
                                    }
                                    if (product.product.brand) {
                                        label += `${product.product.brand} - `
                                    }
                                    label += `${product.product.name},(${product.id}),MRP:₹${lastStockRetailPrice}`
                                    return label
                                }}
                                renderOption={(props, product) => (
                                    <li {...props}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <img
                                                src={product.images[0]}
                                                alt="Product"
                                                style={{
                                                    marginRight: '8px',
                                                    width: '50px',
                                                    height: '50px',
                                                }}
                                            />
                                            {product.product.brand},
                                            {product.product.name},
                                            {product.product_size &&
                                                `${product.product_size.value}${product.product_size.unit}`}
                                            ,{product.id}, MRP:₹
                                            {product.inventory_listings.length >
                                            0
                                                ? product.inventory_listings[0]
                                                      .inventory_stocks.length >
                                                  0
                                                    ? product
                                                          .inventory_listings[0]
                                                          .inventory_stocks[
                                                          product
                                                              .inventory_listings[0]
                                                              .inventory_stocks
                                                              .length - 1
                                                      ].retailPrice
                                                    : 'N/A'
                                                : 'N/A'}
                                        </div>
                                    </li>
                                )}
                                onChange={(event, value) =>
                                    setSelectedProduct(value)
                                }
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search products By name/category/subcategory/productVariantId/brand.."
                                        onChange={handleSearchChange}
                                        type="text"
                                        name="searchTerm"
                                        id="standard-basic"
                                        value={searchTerm}
                                        validators={['required']}
                                        errorMessages={[
                                            'this field is required',
                                        ]}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? (
                                                        <CircularProgress
                                                            color="inherit"
                                                            size={20}
                                                        />
                                                    ) : null}
                                                    {
                                                        params.InputProps
                                                            .endAdornment
                                                    }
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />

                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const value = Math.max(
                                            1,
                                            parseInt(e.target.value)
                                        )
                                        setQuantity(value)
                                    }}
                                    validators={[
                                        'required',
                                        'isNumber',
                                        'minNumber:1',
                                    ]}
                                    errorMessages={[
                                        'This field is required',
                                        'Invalid number',
                                        'Quantity must be at least 1',
                                    ]}
                                />
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddToCart}
                                        disabled={!selectedProduct}
                                    >
                                        Add to Bag
                                    </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>

                <Grid item lg={8} md={8} sm={12} xs={12}>
                    <SimpleCard
                        title={'Dealer Allotment'}
                        style={{ height: '100%' }}
                    >
                        <ValidatorForm
                            onSubmit={() => null}
                            onError={() => null}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    {cart.length > 0 ? (
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            onClick={placeorder}
                                            disabled={buttonLoading}
                                        >
                                            <Span
                                                sx={{
                                                    pl: 1,
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {buttonLoading && (
                                                    <StyledProgress
                                                        size={24}
                                                        className="buttonProgress"
                                                    />
                                                )}
                                                Place Allotment
                                            </Span>
                                        </Button>
                                    ) : null}
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                        <br />
                        <div style={{ height: '600px', overflowY: 'scroll' }}>
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
                                                Sno
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Variant Id
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Image
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Brands & Product
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Size
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                MRP
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Quantity
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Dealer
                                            </TableCell>
                                            <TableCell
                                                className={`${classes.tableCell} ${classes.tableCellBold}`}
                                            >
                                                Remove
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cart.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell
                                                    className={
                                                        classes.tableCell
                                                    }
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    className={
                                                        classes.tableCell
                                                    }
                                                >
                                                    {item.id}
                                                </TableCell>
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
                                                    {item.brand}{' '}
                                                    {item.name
                                                        .split(' ')
                                                        .slice(0, 3)
                                                        .join(' ')}
                                                    {item.name.split(' ')
                                                        .length > 3 && '...'}
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
                                                    {item.mrp}
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
                                                                    item.id,
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
                                                                    item.id,
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
                                                    {getEmployeeEmailById(
                                                        item.dealerId
                                                    )}
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
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        <Icon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            delete
                                                        </Icon>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </SimpleCard>
                </Grid>
            </Grid>
        </Container>
    )
}

export default DealerAllotment
