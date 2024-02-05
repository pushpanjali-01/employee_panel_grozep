import React, { useEffect, useState, useRef } from 'react'
import { Grid, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { GrozpSnackbar } from 'app/components/'
import { debounce } from 'lodash'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import useAuth from 'app/hooks/useAuth'
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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}))

const UpdateOfferProduct = () => {
    const containerRef = useRef()
    const { user } = useAuth()
    const [bannerList, setbannerList] = useState([])
    const [selecetBanner, setselectBanner] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [loadingImages, setLoadingImages] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    useEffect(() => {
        const fetchData = async () => {
            setLoadingImages(true)
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
    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
    }, [])

    const handleScroll = () => {
        const container = containerRef.current
        if (container) {
            const scrollTop = container.scrollTop
            const scrollHeight = container.scrollHeight
            const clientHeight = container.clientHeight

            if (scrollHeight - scrollTop === clientHeight) {
                // User has reached the bottom, load more data
                loadMoreData()
            }
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

    const handleChange = debounce((event) => {
        setselectBanner(event.target.value)
        if (event.target.value.id) {
            setLoading(true)
            try {
                const config = {
                    headers: {
                        storecode: user.storeCode, // Replace 'your_store_value_here' with the actual store value
                    },
                }

                url.get(
                    `v1/in/banner-products/${event.target.value.id}?page=1`,
                    config
                )
                    .then((res) => {
                        setSearchResults(res.data.data)
                        setLoading(false)
                    })
                    .catch((error) => {
                        console.log('Error:', error)
                    })
            } catch (error) {
                console.log('Error:', error)
            }
        } else {
            setSearchResults([])
            setLoading(false)
        }
    }, 500)
    const loadMoreData = () => {
        // Increment the current page number
        setCurrentPage(currentPage + 1)

        // Load more data using the updated page number
        if (selecetBanner.id) {
            setLoading(true)
            try {
                const config = {
                    headers: {
                        storecode: user.storeCode,
                    },
                }

                url.get(
                    `v1/in/banner-products/${selecetBanner.id}?page=${
                        currentPage + 1
                    }`,
                    config
                )
                    .then((res) => {
                        setSearchResults((prevResults) => [
                            ...prevResults,
                            ...res.data.data,
                        ])
                        setLoading(false)
                    })
                    .catch((error) => {
                        console.log('Error:', error)
                    })
            } catch (error) {
                console.log('Error:', error)
            }
        }
    }
    const handleStatusChange = (productVariantId) => {
        // Find the product in searchResults with the given productVariantId
        const productToUpdate = searchResults.find(
            (product) => product.id === productVariantId
        )

        if (!productToUpdate) {
            // Product not found, handle the error or return early
            return
        }

        // Calculate the new status (toggled)
        const newStatus = !productToUpdate.isActive
        // Make an API request to update the status
        url.patch(`v1/in/banner-products/${productVariantId}`, {
            isActive: newStatus,
        })
            .then((response) => {
                // Assuming the API returns the updated product data, update the local state
                setSearchResults((prevSearchResults) => {
                    return prevSearchResults.map((product) => {
                        if (product.id === productVariantId) {
                            const updatedProduct = {
                                ...product,
                                isActive: newStatus,
                            }

                            handleShowSnackbar(
                                `Status ${newStatus ? 'Active' : 'Inactive'}`,
                                `${newStatus ? 'success' : 'error'}`
                            )

                            return updatedProduct
                        }
                        return product
                    })
                })
            })
            .catch((error) => {
                console.error('Error updating product status:', error)
                // Handle the error, e.g., show a notification
                handleShowSnackbar('Error updating product status', 'error')
            })
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
                    routeSegments={[{ name: ' Update offer Product' }]}
                />
            </div>

            <Grid container spacing={2}>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                    <SimpleCard title={'Update offer Product'}>
                        <ValidatorForm onError={() => null}>
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
                            </FormControl>
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>
            </Grid>
            <br />
            {searchResults.length > 0 ? <h4> Offer Products</h4> : null}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{
                    maxHeight: '500px', // Set a maximum height for the scrollable container
                    overflowY: 'auto',
                }}
            >
                {!loading || searchResults.length > 0 ? (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                            }}
                        >
                            {searchResults.map((product) => {
                                const selectedSizeId =
                                    product.productVariantId.productVariant[0]
                                        .sizeId
                                const selectedSize =
                                    product.productVariantId.sizes.find(
                                        (size) => size.id === selectedSizeId
                                    )

                                return (
                                    <Item
                                        key={product.id}
                                        sx={{
                                            width: 'calc(25% - 16px)', // Adjust the width as needed
                                            marginBottom: '16px',
                                            marginTop: '10px',
                                            marginLeft: '10px',
                                        }}
                                    >
                                        <h6>
                                            {product.productVariantId.brand},{' '}
                                            {product.productVariantId.name}
                                        </h6>

                                        <Switch
                                            checked={product.isActive}
                                            color="success"
                                            onChange={() =>
                                                handleStatusChange(product.id)
                                            }
                                        />

                                        {/* Additional Product Details */}
                                        <div>
                                            <img
                                                src={
                                                    product.productVariantId
                                                        .productVariant[0]
                                                        .imageURL[0]
                                                }
                                                alt={product.id}
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                }}
                                            />
                                        </div>
                                        <p>
                                            Size:{' '}
                                            {selectedSize
                                                ? `${selectedSize.value} ${selectedSize.unit}`
                                                : 'N/A'}
                                        </p>
                                        <p>
                                            <b>
                                                MRP: ₹
                                                {
                                                    product.productVariantId
                                                        .productVariant[0]
                                                        .supplies[0].mrp
                                                }
                                            </b>
                                        </p>
                                        <p>
                                            <b>
                                                Rate: ₹
                                                {product.productVariantId
                                                    .productVariant[0]
                                                    .supplies[0].mrp -
                                                    product.productVariantId
                                                        .productVariant[0]
                                                        .supplies[0].off}
                                            </b>
                                        </p>
                                    </Item>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} />
                    </div>
                )}
            </div>
        </Container>
    )
}

export default UpdateOfferProduct
