import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import { MDBDataTable } from 'mdbreact'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
    IconButton,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { useNavigate } from 'react-router-dom'
import { GrozpSnackbar } from 'app/components/'
import { debounce } from 'lodash'
import TextFields from '@material-ui/core/TextField'
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
const CenteredTable = styled(MDBDataTable)`
    text-align: center;
`

const UpdateProduct = () => {
    const { user } = useAuth()
    // Initialize cart state with data from local storage
    const [supplyBeingUpdated, setSupplyBeingUpdated] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [supplydata, setSupplydata] = useState([])
    const [severity, setSeverity] = useState('success')
    const [buttonValidated, setButtonValidated] = useState({})
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }
    const updateStock = (supplyid, reasonId, enterId) => {
        const reasonValue = document.getElementById(reasonId).value // Get the value from the reason input field
        const enterValue = document.getElementById(enterId).value // Get the value from the enter input field

        if (enterValue === '' || enterValue === null) {
            handleShowSnackbar('Enter Updated Quantity', 'error')
        } else if (reasonValue === '' || reasonValue === null) {
            handleShowSnackbar('Write some Reason', 'error')
        } else {
            setLoading(true)
            const dataToSend = {
                remaining: enterValue,
                message: reasonValue,
                employeeId: user.id,
            }

            // Perform the update request
            url.put('v1/in/listings-supplies/' + supplyid, dataToSend)
                .then(() => {
                    setLoading(false)
                    setSupplydata([])
                    handleShowSnackbar(
                        'Update Quantity successfully!',
                        'success'
                    )
                    setSelectedProduct(null)
                    setSearchResults([])
                    setSelectedProduct(null)
                    setSearchTerm(null)
                    // Clear the input field values after successful update
                    document.getElementById(reasonId).value = ''
                    document.getElementById(enterId).value = ''
                })
                .catch((error) => {
                    setLoading(false)
                    setSelectedProduct(null)
                    console.log(error)
                    // Handle error cases if needed
                })
            setSelectedProduct(null)
        }
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    const generateSerialNumbers = (supplydata) => {
        if (supplydata[0]) {
            const supplies = supplydata[0].supplies.map((item, index) => {
                const supplyId = item.id
                const MRP = item.pricings[0].retailPrice
                const Rate = item.pricings[0].sellingPrice
                const Stock = item.remaining
                const reasonId = `reason_${item.id}`
                const enterId = `enter_${item.id}`

                const handleEnterChange = (event) => {
                    const { value } = event.target
                    // Validate the entered value against the stock
                    // Prevent entering values below 0 or above the available stock
                    const newValue = Math.min(Math.max(value, 0))
                    // Update the input field value
                    document.getElementById(enterId).value = newValue
                }

                return {
                    supplyId: supplyId,
                    sno: index + 1,
                    MRP: MRP,
                    Rate: Rate,
                    Stock: Stock,
                    reason: (
                        <TextFields
                            type="text"
                            id={reasonId}
                            name={reasonId}
                            variant="outlined"
                        />
                    ), // Input field for reason
                    enter: (
                        <TextFields
                            type="number"
                            id={enterId}
                            name={enterId}
                            variant="outlined"
                            inputProps={{
                                min: 0,
                            }}
                            onChange={handleEnterChange}
                        />
                    ), // Input field for enter
                    verify: (
                        <div>
                            <Button
                                key={supplyId}
                                variant="outlined"
                                color="primary"
                                disabled={buttonValidated[supplyId] || loading}
                                className={
                                    buttonValidated[supplyId] ? 'validated' : ''
                                }
                                onClick={() =>
                                    updateStock(item.id, reasonId, enterId)
                                }
                            >
                                {loading && supplyId === supplyBeingUpdated ? (
                                    <CircularProgress size={20} />
                                ) : buttonValidated[supplyId] ? (
                                    'Updated'
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </div>
                    ),
                }
            })

            return supplies
        }
    }

    const tableData = {
        columns: [
            {
                label: 'Sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'Supply Id',
                field: 'supplyId',
                sort: 'asc',
            },
            {
                label: 'MRP',
                field: 'MRP',
                sort: 'asc',
            },
            {
                label: 'Rate',
                field: 'Rate',
                sort: 'asc',
            },
            {
                label: 'Stock',
                field: 'Stock',
                sort: 'asc',
            },
            {
                label: 'Updated Quantity',
                field: 'enter',
                // Add input attribute for the "Enter" field
                input: 'text',
                width: 100,
                // Enable editing for the field
            },
            {
                label: 'Reason',
                field: 'reason',
                // Add input attribute for the "Reason" field
                input: 'text',
                width: 200,
                // Enable editing for the field
            },

            {
                label: 'Update Stock',
                field: 'verify',
            },
            // Add more columns as needed
        ],
        rows: generateSerialNumbers(supplydata),
    }

    const handleSearchChange = debounce((event) => {
        const term = event.target.value.trim().toLowerCase()
        setSearchTerm(term)
        setLoading(true)
        if (term) {
            try {
                url.get(
                    `v1/in/search-listings?storeCode=${user.storeCode}&q=${term}&page=1`
                )
                    .then((res) => {
                        // setProducts(res.data.data)
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

    const handleSubmit = () => {
        if (!selectedProduct) {
            handleShowSnackbar('Please select a product!', 'error')
            return
        }

        try {
            url.get(
                `v1/in/search-listings?storeCode=${user.storeCode}&q=${selectedProduct.product_variant.id}&page=1`
            )
                .then((res) => {
                    setSupplydata(res.data.data)
                    setLoading(false)
                })
                .catch(() => {
                    console.log('Errors')
                })
        } catch {
            console.log('Error')
        }
        setSearchTerm('')
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
                <Breadcrumb routeSegments={[{ name: 'Update Stock' }]} />
            </div>
            <Grid container>
                <Grid item lg={8} md={8} sm={12} xs={12}>
                    <SimpleCard
                        title={'Search Product '}
                        style={{ height: '100%' }}
                    >
                        <ValidatorForm
                            onSubmit={handleSubmit}
                            onError={() => null}
                        >
                            <Autocomplete
                                options={searchResults}
                                value={selectedProduct}
                                getOptionLabel={(product) =>
                                    `${product.product_variant.product.brand} - ${product.product_variant.product.name} ${product.product_variant.product.category} (${product.product_variant.id})`
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
                            <br />
                        </ValidatorForm>
                    </SimpleCard>
                </Grid>
            </Grid>
            <br />
            {supplydata.length > 0 ? (
                <SimpleCard title="Supply Items">
                    <div className="table-responsive">
                        <CenteredTable
                            data={tableData}
                            noBottomColumns={true}
                            className="centered-cell"
                        />
                    </div>
                </SimpleCard>
            ) : null}
        </Container>
    )
}

export default UpdateProduct
