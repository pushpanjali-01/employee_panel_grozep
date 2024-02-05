import React, { useState } from 'react'
import { MDBDataTable } from 'mdbreact'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import { StoreList } from 'app/components'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
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

    const [searchTerm, setSearchTerm] = useState('')
    const [updatedValues, setUpdatedValues] = useState({})
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [StoreValue, setStoreValue] = useState(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [supplydata, setSupplydata] = useState([])
    const [severity, setSeverity] = useState('success')

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleStoreChange = (event, newValue) => {
        setStoreValue(newValue)
        setSelectedProduct(null)
        setSearchResults([])
    }

    const updateStock = (
        supplyid,
        reasonId,
        sellingPrice,
        retailPrice,
        remaining,
        costPrice,
        priceid,
        updatedValues
    ) => {
        const reasonValue = document.getElementById(reasonId).value
        const isObjectNotEmpty = (obj) => Object.keys(obj).length > 0
        const remaining1 = updatedValues[`remaining_${supplyid}`] || remaining
        const retailPrice1 =
            parseFloat(updatedValues[`retailPrice_${supplyid}`]) ||
            parseFloat(retailPrice)
        const sellingPrice1 =
            parseFloat(updatedValues[`sellingPrice_${supplyid}`]) ||
            parseFloat(sellingPrice)

        if (isObjectNotEmpty(updatedValues)) {
            if (remaining1 < 0) {
                handleShowSnackbar('Stock not Less than Zero', 'error')
                return
            }
            if (
                retailPrice1 < costPrice ||
                sellingPrice1 < costPrice ||
                sellingPrice1 > retailPrice1
            ) {
                handleShowSnackbar('MRP and Rate constraints violated', 'error')
                return
            }
            if (!reasonValue) {
                handleShowSnackbar('Write some Reason', 'error')
                return
            }

            const dataToSend = {
                remaining: parseInt(remaining1),
                message: reasonValue,
                employeeId: user.id,
                sellingPrice: sellingPrice1,
                retailPrice: retailPrice1,
                priceId: priceid,
            }

            // Perform the update request
            url.put('v1/in/listings-supplies/' + supplyid, dataToSend)
                .then(() => {
                    setLoading(false)
                    setSupplydata([])
                    handleShowSnackbar(
                        'Update Store Stock successfully!',
                        'success'
                    )
                    setSearchResults([])
                    setSelectedProduct(null)
                })
                .catch(() => {
                    setLoading(false)
                    setSearchResults([])
                    setSelectedProduct(null)
                })
            setSelectedProduct(null)
        } else {
            handleShowSnackbar('No updates to send.', 'error')
        }
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    function filterSupplies(supplies) {
        const filteredSupplies = supplies.filter(
            (supply) => supply.remaining >= 1
        )

        if (filteredSupplies.length === 0) {
            // If there are no supplies with remaining >= 1, return the last supply
            return [supplies[supplies.length - 1]]
        }

        return filteredSupplies
    }

    const generateSerialNumbers = (supplydata) => {
        if (supplydata[0]) {
            filterSupplies(supplydata)
            const filteredSupplies = filterSupplies(supplydata[0].supplies)
            const supplies = filteredSupplies.map((item, index) => {
                const supplyId = item.id
                const costPrice = item.pricings[0].costPrice
                const retailPrice = item.pricings[0].retailPrice
                const sellingPrice = item.pricings[0].sellingPrice
                const remaining = item.remaining
                const reasonId = `reason_${item.id}`

                const handleRetailPriceChange = (event) => {
                    const { value } = event.target
                    const newValue = Math.max(parseFloat(value), 0)
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`retailPrice_${supplyId}`]: newValue,
                    }))
                }

                const handleSellingPriceChange = (event) => {
                    const { value } = event.target
                    const newValue = Math.max(parseFloat(value), 0)
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`sellingPrice_${supplyId}`]: newValue,
                    }))
                }

                const handleRemainingChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`remaining_${supplyId}`]: value,
                    }))
                }

                return {
                    supplyId: supplyId,
                    sno: index + 1,
                    MRP: retailPrice,
                    Rate: sellingPrice,
                    Stock: remaining,
                    CP: costPrice,
                    remaining: (
                        <TextField
                            type="number"
                            id={`remaining_${supplyId}`}
                            defaultValue={remaining}
                            variant="outlined"
                            onChange={handleRemainingChange}
                            validators={['minNumber:0']}
                            errorMessages={['Value must be >= 0']}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    ),
                    retailPrice: (
                        <TextField
                            type="number"
                            id={`retailPrice_${supplyId}`}
                            defaultValue={retailPrice}
                            variant="outlined"
                            onChange={handleRetailPriceChange}
                            validators={['minNumber:0']}
                            errorMessages={['Value must be >= 0']}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    ),
                    sellingPrice: (
                        <TextField
                            type="number"
                            id={`sellingPrice_${supplyId}`}
                            defaultValue={sellingPrice}
                            variant="outlined"
                            onChange={handleSellingPriceChange}
                            validators={['minNumber:0']}
                            errorMessages={['Value must be >= 0']}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    ),
                    reason: (
                        <TextFields
                            type="text"
                            id={reasonId}
                            name={reasonId}
                            variant="outlined"
                        />
                    ),
                    verify: (
                        <div>
                            <Button
                                key={supplyId}
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                    updateStock(
                                        item.id,
                                        reasonId,
                                        sellingPrice,
                                        retailPrice,
                                        remaining,
                                        costPrice,
                                        item.pricings[0].id,
                                        updatedValues
                                    )
                                }
                            >
                                Update
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
            { label: 'Sno', field: 'sno', sort: 'asc' },
            { label: 'Supply Id', field: 'supplyId', sort: 'asc' },
            { label: 'Cost Price', field: 'CP', sort: 'asc' },
            { label: 'Stock', field: 'Stock', sort: 'asc' },
            { label: 'MRP', field: 'retailPrice', input: 'number', width: 100 },
            {
                label: 'Rate',
                field: 'sellingPrice',
                input: 'number',
                width: 100,
            },
            { label: 'Update Quantity', field: 'remaining', sort: 'asc' },
            { label: 'Reason', field: 'reason', input: 'text', width: 200 },
            { label: 'Update Stock', field: 'verify' },
        ],
        rows: generateSerialNumbers(supplydata),
    }

    const handleSearchChange = debounce((event) => {
        const term = event.target.value.trim().toLowerCase()
        setSearchTerm(term)
        setLoading(true)
        if (term && StoreValue) {
            try {
                url.get(
                    `v1/in/search-listings?storeCode=${StoreValue.code}&q=${term}&page=1`
                )
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

    const handleSubmit = () => {
        setSupplydata([])
        if (!selectedProduct || !StoreValue) {
            handleShowSnackbar('Please select a product and store!', 'error')
            return
        }

        try {
            url.get(
                `v1/in/search-listings?storeCode=${StoreValue.code}&q=${selectedProduct.product_variant.id}&page=1`
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
                <Breadcrumb routeSegments={[{ name: 'Update Store Stock' }]} />
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
                            <StoreList
                                value={StoreValue}
                                onChange={handleStoreChange}
                            />
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
                                            {`${
                                                product.product_variant.product
                                                    .brand
                                            }, ${
                                                product.product_variant.product
                                                    .name
                                            }, ${
                                                product.product_variant
                                                    .product_size.value +
                                                product.product_variant
                                                    .product_size.unit
                                            }, ${
                                                product.product_variant.product
                                                    .category
                                            }`}
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
                            <br />
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
                        <ValidatorForm onSubmit={handleSubmit}>
                            <CenteredTable
                                data={tableData}
                                noBottomColumns={true}
                                className="centered-cell"
                            />
                        </ValidatorForm>
                    </div>
                </SimpleCard>
            ) : null}
        </Container>
    )
}

export default UpdateProduct
