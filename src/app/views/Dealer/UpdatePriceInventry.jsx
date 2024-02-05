import React, { useState } from 'react'
import { MDBDataTable } from 'mdbreact'
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

const UpdatePriceInventry = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [supplydata, setSupplydata] = useState([])
    const [severity, setSeverity] = useState('success')
    const [updatedValues, setUpdatedValues] = useState({})
    const [inventoryId, setinventoryId] = useState('')
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }
    const updateStock = (
        supplyid,
        batchNo,
        sellingPrice,
        retailPrice,
        tradePrice,
        remaining,
        sku,
        mfgDate,
        expDate,
        costPrice,
        updatedValues
    ) => {
        const isObjectNotEmpty = (obj) => {
            return Object.keys(obj).length > 0
        }
        const remaining1 = updatedValues[`remaining_${supplyid}`]
            ? updatedValues[`remaining_${supplyid}`]
            : remaining
        const costPrice1 = updatedValues[`costPrice_${supplyid}`]
            ? updatedValues[`costPrice_${supplyid}`]
            : costPrice
        const retailPrice1 = updatedValues[`retailPrice_${supplyid}`]
            ? parseFloat(updatedValues[`retailPrice_${supplyid}`])
            : parseFloat(retailPrice)

        const sellingPrice1 = updatedValues[`sellingPrice_${supplyid}`]
            ? parseFloat(updatedValues[`sellingPrice_${supplyid}`])
            : parseFloat(sellingPrice)

        const tradePrice1 = updatedValues[`tradePrice_${supplyid}`]
            ? parseFloat(updatedValues[`tradePrice_${supplyid}`])
            : parseFloat(tradePrice)
        const sku1 = updatedValues[`sku_${supplyid}`]
            ? updatedValues[`sku_${supplyid}`]
            : sku
        const batchNo1 = updatedValues[`batchNo_${supplyid}`]
            ? updatedValues[`batchNo_${supplyid}`]
            : batchNo
        const expDate1 = updatedValues[`expDate_${supplyid}`]
            ? updatedValues[`expDate_${supplyid}`]
            : expDate
        const mfgDate1 = updatedValues[`mfgDate_${supplyid}`]
            ? updatedValues[`mfgDate_${supplyid}`]
            : mfgDate
        if (isObjectNotEmpty(updatedValues)) {
            if (remaining1 < 0) {
                handleShowSnackbar('Stock not Less then Zero', 'error')
                return
            }

            if (retailPrice1 < costPrice1) {
                handleShowSnackbar(
                    'MRP cannot be less than the Cost Price.',
                    'error'
                )
                return
            }
            if (sellingPrice1 < costPrice1) {
                handleShowSnackbar(
                    'Rate cannot be less than the Cost Price.',
                    'error'
                )
                return
            }

            if (tradePrice1 < costPrice1) {
                handleShowSnackbar(
                    'Store Price cannot be less than the Cost Price.',
                    'error'
                )
                return
            }
            if (tradePrice1 > retailPrice1) {
                handleShowSnackbar(
                    'Store Price cannot be more than the Mrp.',
                    'error'
                )
                return
            }
            if (tradePrice1 > sellingPrice1) {
                handleShowSnackbar(
                    'Store Price cannot be more than the Rate.',
                    'error'
                )
                return
            }
            if (sellingPrice1 > retailPrice1) {
                handleShowSnackbar(
                    'Rate cannot be more than the Mrp .',
                    'error'
                )
                return
            } else {
                const dataToSend = {
                    quantity: parseInt(remaining1),
                    costPrice: costPrice1,
                    sellingPrice: sellingPrice1,
                    retailPrice: retailPrice1,
                    tradePrice: tradePrice1,
                    remaining: parseInt(remaining1),
                    sku: sku1,
                    batchNo: batchNo1,
                    mfgDate: mfgDate1,
                    expDate: expDate1,
                }

                // Perform the update request
                url.put('v1/in/dealers-stocks/' + supplyid, dataToSend)

                    .then((res) => {
                        setLoading(false)
                        setSupplydata([])
                        handleShowSnackbar(
                            'Update Inventry Stock successfully!',
                            'success'
                        )

                        // setProducts(null)
                        setSearchResults([])
                        setSelectedProduct(null)
                        setSearchTerm(null)
                    })
                    .catch((error) => {
                        setLoading(false)
                        setSearchResults([])
                        setSelectedProduct(null)
                        setSearchTerm(null)
                        // Handle error cases if needed
                    })
            }
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
        if (supplydata.length > 0) {
            filterSupplies(supplydata)
            const filteredSupplies = filterSupplies(supplydata)
            const supplies = filteredSupplies.map((item, index) => {
                const supplyId = item.id
                const batchNo = item.batchNo
                const costPrice = item.costPrice
                const expDate = item.expDate
                const mfgDate = item.mfgDate
                const remaining = item.remaining
                const retailPrice = item.retailPrice
                const sellingPrice = item.sellingPrice
                const tradePrice = item.tradePrice
                const sku = item.sku
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
                    // const newValue = Math.max(parseFloat(value), 0)
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`remaining_${supplyId}`]: value,
                    }))
                }

                const handleTradePriceChange = (event) => {
                    const { value } = event.target
                    const newValue = Math.max(parseFloat(value), 0)
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`tradePrice_${supplyId}`]: newValue,
                    }))
                }

                const handleSKUChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`sku_${supplyId}`]: value,
                    }))
                }
                const handleCostChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`costPrice_${supplyId}`]: value,
                    }))
                }
                const handlebatchNoChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`batchNo_${supplyId}`]: value,
                    }))
                }
                const handleexpDateChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`expDate_${supplyId}`]: value,
                    }))
                }

                const handlemfgDateChange = (event) => {
                    const { value } = event.target
                    setUpdatedValues((prevValues) => ({
                        ...prevValues,
                        [`mfgDate_${supplyId}`]: value,
                    }))
                }

                return {
                    sno: index + 1,
                    supplyId: supplyId,
                    // costPrice: costPrice,
                    costPrice: (
                        <TextField
                            type="number"
                            id={`batchNo_${supplyId}`}
                            defaultValue={costPrice}
                            variant="outlined"
                            onChange={handleCostChange}
                        />
                    ),
                    batchNo: (
                        <TextField
                            id={`batchNo_${supplyId}`}
                            defaultValue={batchNo}
                            variant="outlined"
                            onChange={handlebatchNoChange}
                        />
                    ),
                    mfgDate: (
                        <TextField
                            id={`mfgDate_${supplyId}`}
                            type="date"
                            defaultValue={mfgDate}
                            variant="outlined"
                            onChange={handlemfgDateChange}
                        />
                    ),
                    expDate: (
                        <TextField
                            id={`expDate_${supplyId}`}
                            type="date"
                            defaultValue={expDate}
                            variant="outlined"
                            onChange={handleexpDateChange}
                        />
                    ),
                    remaining: (
                        <TextField
                            type="number"
                            id={`remaining_${supplyId}`}
                            defaultValue={remaining}
                            variant="outlined"
                            onChange={handleRemainingChange}
                            validators={['minNumber:0']}
                            errorMessages={['Value must be >= 0']} //
                            inputProps={{
                                min: 0,
                            }} //
                        />
                    ),
                    retailPrice: (
                        <TextField
                            type="number"
                            id={`retailPrice_${supplyId}`}
                            defaultValue={retailPrice}
                            variant="outlined"
                            onChange={handleRetailPriceChange}
                            validators={['minNumber:0']} // Add the validation rule to enforce a minimum value of 0
                            errorMessages={['Value must be >= 0']}
                            inputProps={{
                                min: 0,
                            }} // Er
                        />
                    ),
                    sellingPrice: (
                        <TextField
                            type="number"
                            id={`sellingPrice_${supplyId}`}
                            defaultValue={sellingPrice}
                            variant="outlined"
                            onChange={handleSellingPriceChange}
                            validators={['minNumber:0']} // Add the validation rule to enforce a minimum value of 0
                            errorMessages={['Value must be >= 0']} // Er
                            inputProps={{
                                min: 0,
                            }} //
                        />
                    ),
                    tradePrice: (
                        <TextField
                            type="number"
                            id={`tradePrice_${supplyId}`}
                            defaultValue={tradePrice}
                            variant="outlined"
                            onChange={handleTradePriceChange}
                            validators={['minNumber:0']} // Add the validation rule to enforce a minimum value of 0
                            errorMessages={['Value must be >= 0']} // Er
                        />
                    ),
                    sku: (
                        <TextField
                            id={`sku_${supplyId}`}
                            defaultValue={sku}
                            variant="outlined"
                            onChange={handleSKUChange}
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
                                        batchNo,
                                        sellingPrice,
                                        retailPrice,
                                        tradePrice,
                                        remaining,
                                        sku,
                                        mfgDate,
                                        expDate,
                                        costPrice,
                                        updatedValues
                                    )
                                }
                            >
                                {loading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    'Update' // Removed "Updated" text
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
                label: 'Cost Price',
                field: 'costPrice',
                sort: 'asc',
            },
            {
                label: 'MRP',
                field: 'retailPrice',
                sort: 'asc',
            },
            {
                label: 'Store Price',
                field: 'tradePrice',
                sort: 'asc',
            },
            {
                label: 'Rate',
                field: 'sellingPrice',
                sort: 'asc',
            },
            {
                label: 'Stock',
                field: 'remaining',
                sort: 'asc',
            },
            {
                label: 'Batch',
                field: 'batchNo',
                sort: 'asc',
            },
            {
                label: 'Sku',
                field: 'sku',
                sort: 'sku',
            },
            {
                label: 'Mfg Date',
                field: 'mfgDate',
                sort: 'asc',
            },
            {
                label: 'Exp Date',
                field: 'expDate',
                sort: 'asc',
            },

            {
                label: 'Update Stock',
                field: 'verify',
            },
            // Add more columns as needed
        ],
        rows: generateSerialNumbers(supplydata),
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
                    // setSearchResults([])
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

    const handleSubmit = () => {
        setSupplydata([])
        if (!selectedProduct) {
            handleShowSnackbar('Please select a product!', 'error')
            return
        }
        try {
            const headers = {
                inventorycode: user.storeCode, // Replace with your actual inventory code
            }
            url.get(`v1/in/inventorysearch?q=${selectedProduct.id}`, {
                headers: headers,
            })
                .then((res) => {
                    if (res.data.data) {
                        setSupplydata(
                            res.data.data[0].inventory_listings[0]
                                .inventory_stocks
                        )
                        setLoading(false)
                    } else {
                        setLoading(false)
                        handleShowSnackbar(
                            'No Product in inventry Stock!',
                            'error'
                        )
                    }
                })
                .catch((error) => {
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
                <Breadcrumb
                    routeSegments={[{ name: 'Update Price Inventry' }]}
                />
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
                                    `${product.product.brand} - ${product.product.name} ${product.product.category} (${product.id})`
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

export default UpdatePriceInventry
