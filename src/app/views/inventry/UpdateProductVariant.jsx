import React, { useState } from 'react'
import { Button, Grid, Autocomplete, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
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

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const UpdateVariant = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingButton, setloadingButton] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [barcode, setBarcode] = useState('')
    const [packaging, setpackaging] = useState('')
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
        setSearchTerm(term)
        setLoading(true)
        if (term) {
            try {
                url.get(`/v1/search-global?q=${term}`)
                    .then((res) => {
                        setSearchResults(res.data.data)
                        setLoading(false)
                    })
                    .catch(() => {
                        console.log('Errors')
                    })
            } catch {
                console.log('Error')
            }
        }
        setBarcode('')
        setpackaging('')
        setLoading(false)
    }, 500)

    const handleFetchBarcode = async (productId) => {
        setBarcode(productId.barcode || '')
        setpackaging(productId.packaging || '')
    }

    const handleUpdateBarcode = async () => {
        setloadingButton(true)

        const prefix = 'https://media.grozep.com/images/products/'
        const modifiedUrls = selectedProduct.images.map((url) =>
            url.replace(prefix, '')
        )
        try {
            const updateData = {
                productId: parseInt(selectedProduct.productId),
                images: modifiedUrls,
                details: selectedProduct.details,
                barcode: barcode,
                packaging: packaging,
                productSizeId: selectedProduct.productSizeId,
                productColorId: selectedProduct.productColorId
                    ? selectedProduct.productColorId
                    : null,
            }
            const responseUpdate = await url.put(
                `v1/in/products-variants/${selectedProduct.id}`,
                updateData
            )
            if (responseUpdate.status === 200) {
                handleShowSnackbar('updated successfully', 'success')
                setBarcode('')
                setpackaging('')
                setloadingButton(false)
                setSelectedProduct(null)
                setSearchResults([])
            } else {
                handleShowSnackbar('Failed to update barcode', 'error')
            }
        } catch (error) {
            handleShowSnackbar(
                'An error occurred while updating barcode',
                'error'
            )
            setloadingButton(false)
        }
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
                    routeSegments={[{ name: 'Update Product Variant' }]}
                />
            </div>
            <Grid container>
                <Grid item lg={8} md={8} sm={12} xs={12}>
                    <SimpleCard
                        title={'Search Product '}
                        style={{ height: '100%' }}
                    >
                        <ValidatorForm
                            onSubmit={() => null}
                            onError={() => null}
                        >
                            <Autocomplete
                                options={searchResults}
                                getOptionLabel={(product) =>
                                    `${product.product.brand} - ${product.product.name} ${product.product.category} (${product.id})`
                                }
                                value={selectedProduct}
                                renderOption={(props, product) => (
                                    <li {...props}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {product.product.brand},
                                            {product.product.name},
                                            {product.product_size.value +
                                                product.product_size.unit}
                                            ,{product.product.category}
                                        </div>
                                    </li>
                                )}
                                onChange={(event, value) => {
                                    setSelectedProduct(value)
                                    setBarcode('') // Clear barcode when selecting a new product
                                    if (value) {
                                        handleFetchBarcode(value)
                                    }
                                }}
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
                                    />
                                )}
                            />

                            {/* Barcode Input Field */}
                            <TextField
                                label="Barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                            />
                            <TextField
                                label="Packaging"
                                value={packaging}
                                onChange={(e) => setpackaging(e.target.value)}
                            />
                            {/* Update Barcode Button */}

                            {/* Update Barcode Button */}

                            <Button
                                variant="contained"
                                onClick={handleUpdateBarcode}
                                disabled={loadingButton || !selectedProduct}
                            >
                                {loadingButton ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>
            </Grid>
            <br />
        </Container>
    )
}

export default UpdateVariant
