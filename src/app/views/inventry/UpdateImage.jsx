import React, { useState } from 'react'
import {
    Button,
    Grid,
    Autocomplete,
    CircularProgress,
    IconButton,
    Typography,
    Input,
} from '@mui/material'
import { Card, CardMedia, CardActions } from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { styled } from '@mui/system'
import { url, media_Url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import RemoveIcon from '@mui/icons-material/Remove'
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
const MinusButton = styled(IconButton)(() => ({
    backgroundColor: 'red',
    borderRadius: '50%',
    padding: '4px', // Adjust the padding to make the circle smaller
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '20px', // Set the width and height to control the circle size
    height: '20px',
    '& .MuiSvgIcon-root': {
        color: 'white',
        fontSize: '24px', // Increase the font size for a bolder minus icon
        fontWeight: 'bold',
    },
}))

const UpdateImage = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingButton, setloadingButton] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [selectedFiles, setSelectedFiles] = useState([])

    const handleFileChange = (event) => {
        setSelectedFiles([...selectedFiles, ...event.target.files])
    }

    const handleDeleteImage = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index)
        setSelectedFiles(updatedFiles)
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
        setLoading(false)
    }, 500)

    const handleUploadImages = async () => {
        if (!selectedProduct || selectedFiles.length === 0) {
            return
        }
        try {
            // Upload images

            setloadingButton(true)
            const formData = new FormData()
            selectedFiles.forEach((file) => {
                formData.append('images', file)
            })
            const config = {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            }
            const responseUpload = await media_Url.post(
                'v1/products/images', // Update this with the correct URL
                formData,
                config
            )

            if (responseUpload.status === 200) {
                const imageUrls = responseUpload.data.data.image
                const updateData = {
                    productId: parseInt(selectedProduct.productId),
                    images: imageUrls,
                    details: selectedProduct.details,
                    barcode: selectedProduct.barcode
                        ? selectedProduct.barcode
                        : null,
                    packaging: selectedProduct.packaging
                        ? selectedProduct.packaging
                        : null,
                    productSizeId: selectedProduct.productSizeId,
                    productColorId: selectedProduct.productColorId
                        ? selectedProduct.productColorId
                        : null,
                }

                // Update product with new images
                const responseUpdate = await url.put(
                    `v1/in/products-variants/${selectedProduct.id}`,
                    updateData
                )

                if (responseUpdate.status === 200) {
                    handleShowSnackbar(
                        'Images uploaded and product updated successfully',
                        'success'
                    )
                    setSelectedProduct(null)
                    setSelectedFiles([])
                    setSearchResults([])
                    setloadingButton(false)
                } else {
                    handleShowSnackbar('Product update failed', 'error')
                    setloadingButton(false)
                }
            } else {
                handleShowSnackbar('Image upload failed', 'error')
            }
        } catch (error) {
            handleShowSnackbar('An error occurred', 'error')
        }
        setloadingButton(false)
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
                    routeSegments={[{ name: 'Update Product Image' }]}
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
                                            {product.product_size.value +
                                                product.product_size.unit}
                                            ,{product.product.category}
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

                            <Input
                                type="file"
                                inputProps={{
                                    multiple: true,
                                    accept: 'image/*', // Allow only image files
                                }}
                                onChange={handleFileChange}
                                onClick={(e) => {
                                    // Clear the selected files when the input is clicked
                                    e.target.value = null
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    marginTop: '16px',
                                }}
                            >
                                {selectedFiles.length > 0 ? (
                                    selectedFiles.map((file, index) => (
                                        <Card
                                            key={index}
                                            style={{
                                                width: '150px',
                                                margin: '8px',
                                                position: 'relative',
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                alt={`Image ${index}`}
                                                height="150"
                                                image={URL.createObjectURL(
                                                    file
                                                )}
                                            />
                                            <CardActions
                                                style={{
                                                    position: 'absolute', // Position the delete button
                                                    top: 0, // Align at the top
                                                    right: 0, // Align at the right
                                                }}
                                            >
                                                <MinusButton
                                                    onClick={() =>
                                                        handleDeleteImage(index)
                                                    }
                                                >
                                                    <RemoveIcon />
                                                </MinusButton>
                                            </CardActions>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography>No images selected</Typography>
                                )}
                            </div>
                            <Button
                                variant="contained"
                                onClick={handleUploadImages}
                                disabled={
                                    loadingButton ||
                                    !selectedProduct ||
                                    selectedFiles.length === 0
                                }
                            >
                                {loadingButton ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    'Upload'
                                )}
                            </Button>
                            <br />
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>
            </Grid>
            <br />
        </Container>
    )
}

export default UpdateImage
