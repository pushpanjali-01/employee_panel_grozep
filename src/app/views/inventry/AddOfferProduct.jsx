import React, { useEffect, useState } from 'react'
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
import { GrozpSnackbar } from 'app/components/'
import { debounce } from 'lodash'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
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

const AddOfferProduct = () => {
    // Initialize cart state with data from local storage
    const [searchTerm, setSearchTerm] = useState('')
    const { user } = useAuth()
    const [bannerList, setbannerList] = useState([])
    const [selecetBanner, setselectBanner] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [loadingImages, setLoadingImages] = useState(true)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await url.post('v1/in/bannersall')
                setbannerList(response.data.data)
                setLoadingImages(false)
            } catch (error) {
                console.error('Error fetching banner data:', error)
            }
        }

        fetchData()
    }, [])
    const handleChange = (event) => {
        setselectBanner(event.target.value)
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

    const handleSearchChange = debounce((event) => {
        const term = event.target.value.trim().toLowerCase()
        if (term) {
            setSearchTerm(term)
            setLoading(true)
            try {
                // 1/in/search-listings?storeCode=${user.storeCode}&q=${term}&page=1
                url.get(
                    `v1/in/search-listings?storeCode=${user.storeCode}&q=${term}&page=1`
                )
                    .then((res) => {
                        console.log(res.data.data)
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
            setSearchResults([])
            setLoading(false)
        }
    }, 500)

    const handleSubmit = () => {
        if (!selectedProduct || selectedProduct.length === 0) {
            handleShowSnackbar('Please select at least one product!', 'error')
            return
        }

        if (!selecetBanner) {
            handleShowSnackbar('Please select a banner!', 'error')
            return
        }

        // Remove duplicate product IDs using a Set
        const uniqueProductIdsSet = new Set(
            selectedProduct.map((product) => product.id)
        )

        // Convert the Set back to an array
        const uniqueProductIds = Array.from(uniqueProductIdsSet)
        // // Extract productVariantIds from selected products

        // Extract productVariantIds from selected products
        const productVariantIds = uniqueProductIds.map((productVariantId) => ({
            bannerId: selecetBanner.id,
            productVariantId: productVariantId,
        }))

        setLoading(true)
        url.post('v1/in/banner-products', productVariantIds)
            .then((response) => {
                if (response.data.status === true) {
                    setLoading(false)
                    handleShowSnackbar(
                        ' Added Offer Product with Banner!',
                        'success'
                    )
                } else {
                    handleShowSnackbar(response.data.message, 'error')
                }
            })
            .catch((error) => {
                //Error
                console.log(error)
            })
            .finally(() => {
                setLoading(false)
                setSelectedProduct([])
                setSearchTerm('')
                setselectBanner('')
            })
    }

    return (
        <Container>
            <SimpleCard>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: ' Add offer Product' }]}
                    />
                </div>
                <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                    <Grid container spacing={6}>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Select Banner
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selecetBanner}
                                    label="Select Banner"
                                    onChange={handleChange}
                                >
                                    {bannerList.map((option) => (
                                        <MenuItem
                                            key={option.id}
                                            value={option}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {loadingImages ? (
                                                    <CircularProgress
                                                        size={24}
                                                    />
                                                ) : (
                                                    <img
                                                        src={option.imageUrl}
                                                        alt={`Image for ${option.imageUrl}`}
                                                        style={{
                                                            marginRight: '8px',
                                                            width: '700px',
                                                            height: '350px',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                                <br />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            type="submit"
                                            onClick={handleSubmit}
                                            disabled={
                                                loading || !selectedProduct
                                            }
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
                            </FormControl>
                        </Grid>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                            {' '}
                            <Autocomplete
                                multiple
                                options={searchResults}
                                value={selectedProduct}
                                getOptionLabel={(product) =>
                                    `${
                                        product.product_variant.product.brand
                                    } - ${
                                        product.product_variant.product.name
                                    } ${
                                        product.product_variant.product_size
                                            ? `${
                                                  product.product_variant
                                                      .product_size.value
                                              } ${
                                                  product.product_variant
                                                      .product_size.unit
                                                      ? product.product_variant
                                                            .product_size.unit
                                                      : ''
                                              }`
                                            : null
                                    }
                              (${product.id})`
                                }
                                renderOption={(props, product) => (
                                    <li {...props}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <img
                                                src={
                                                    product.product_variant
                                                        .images[0]
                                                }
                                                alt="Product"
                                                style={{
                                                    marginRight: '8px',
                                                    width: '50px',
                                                    height: '50px',
                                                }}
                                            />
                                            {
                                                product.product_variant.product
                                                    .brand
                                            }
                                            ,
                                            {
                                                product.product_variant.product
                                                    .name
                                            }
                                            ,
                                            {product.product_variant
                                                .product_size.value +
                                                product.product_variant
                                                    .product_size.unit}
                                            ,
                                            {
                                                product.product_variant.product
                                                    .category
                                            }
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
                        </Grid>
                    </Grid>
                </ValidatorForm>
            </SimpleCard>
        </Container>
    )
}

export default AddOfferProduct
