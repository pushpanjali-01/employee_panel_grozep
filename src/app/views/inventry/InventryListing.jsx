import React, { useState } from 'react'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import DealerAutocomplete from '../Dealer/DealerList'
import { GrozpSnackbar } from 'app/components/'
import { debounce } from 'lodash'

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

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const InventryListing = () => {
    const { user } = useAuth()
    // Initialize cart state with data from local storage
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [minCapacity, setminCapacity] = useState(1)
    const [maxCapacity, setmaxCapacity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [dealerValue, setdealerValue] = useState(null)
    const [products, setProducts] = useState([''])
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    // const inventoryCode = 'INGRH001'

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

    const handleSearchChange = debounce((event) => {
        const term = event.target.value.trim().toLowerCase()
        if (term) {
            setSearchTerm(term)
            setLoading(true)
            try {
                url.get(`v1/search-global?q=${term}`)
                    .then((res) => {
                        setProducts(res.data.data)
                        setSearchResults(res.data.data)
                        setLoading(false)
                    })
                    .catch(() => {
                        console.log('Errors')
                    })
            } catch {
                console.log('Error')
            }
        } else {
            setProducts([])
            setSearchResults([])
            setLoading(false)
        }
    }, 500)

    const handledealerChange = (event, newValue) => {
        setdealerValue(newValue)
    }

    const handleSubmit = () => {
        if (!selectedProduct) {
            handleShowSnackbar('Please select a product!', 'error')
            return
        }

        if (minCapacity > maxCapacity) {
            handleShowSnackbar(
                'Minimum capacity cannot be greater than maximum capacity!',
                'error'
            )
            return
        }

        if (!dealerValue) {
            handleShowSnackbar('Please select a dealer!', 'error')
            return
        }

        const orderData = {
            listing: [
                {
                    productVariantId: selectedProduct.id,
                    inventoryCode: user.storeCode,
                    dealerId: dealerValue.id,
                    minCapacity: minCapacity,
                    maxCapacity: maxCapacity,
                },
            ],
        }
        url.post('v1/in/inventory-listings', orderData)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar(
                        'Inventry Listing Add successfully!',
                        'success'
                    )
                    setdealerValue(null)
                } else {
                    handleShowSnackbar('Listing already created!', 'error')
                }
            })
            .catch(() => {
                handleShowSnackbar('Listing already created!', 'error')
            })

        setSelectedProduct(null)
        setminCapacity(1)
        setmaxCapacity(1)
        setSearchTerm('')
        setSearchResults([])
    }

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[{ name: 'Inventry Product Listing' }]}
                />
            </div>
            <Grid container>
                <Grid item lg={8} md={8} sm={12} xs={12}>
                    <SimpleCard
                        title={'Add Product Listing'}
                        style={{ height: '100%' }}
                    >
                        <ValidatorForm
                            onSubmit={handleSubmit}
                            onError={() => null}
                        >
                            <Autocomplete
                                options={searchResults}
                                value={selectedProduct}
                                getOptionLabel={(product) => {
                                    let label = ''
                                    if (product.product.brand) {
                                        label += `${product.product.brand} - `
                                    }
                                    label += `${product.product.name},(${product.id})`
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
                                            {product.product_size
                                                ? product.product_size.value +
                                                  ' ' +
                                                  product.product_size.unit
                                                : null}
                                            ,{product.category}
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
                                        label="Search products By name/categroy/subcateory/productVariantId/brand.."
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

                            <DealerAutocomplete
                                value={dealerValue}
                                onChange={handledealerChange}
                            />

                            <TextField
                                label="Max Capacity"
                                type="number"
                                value={maxCapacity}
                                onChange={(e) => {
                                    const value = Math.max(
                                        1,
                                        parseInt(e.target.value)
                                    )
                                    setmaxCapacity(value)
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

                            <TextField
                                label="Min Capacity"
                                type="number"
                                value={minCapacity}
                                onChange={(e) => {
                                    const value = Math.max(
                                        1,
                                        parseInt(e.target.value)
                                    )
                                    setminCapacity(value)
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

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={loading || !selectedProduct}
                                    >
                                        <Icon>send</Icon>
                                        <Span
                                            sx={{
                                                pl: 1,
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {loading && (
                                                <StyledProgress
                                                    size={24}
                                                    className="buttonProgress"
                                                />
                                            )}
                                            Submit
                                        </Span>
                                    </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>
            </Grid>
        </Container>
    )
}

export default InventryListing
