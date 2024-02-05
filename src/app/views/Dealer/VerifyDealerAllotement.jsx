import { Button, Icon, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material'
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { Span } from 'app/components/Typography'
import { useState, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import moment from 'moment'
import { url } from 'app/constants'
import DealerAllotemnt from '../inventry/DealerAlltomentList'
import React from 'react'
import useAuth from 'app/hooks/useAuth'
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const CenteredTable = styled(MDBDataTable)`
    text-align: center;
`
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
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
const VerifyDealerAllotement = () => {
    const { user } = useAuth()
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const [opend, setOpend] = useState(false)
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [allotmnetid, setallotmnetid] = useState(null)
    const [variantcode, setVarientcode] = useState(null)
    const [dealerAllotmentId, setdealerAllotmentId] = useState(null)
    const [buttonValidated, setButtonValidated] = useState({})
    const [inventoryListingId, setinventoryListingId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [refetchCallback, setrefetchCallback] = useState(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [inputFields, setInputFields] = useState([
        {
            mfgDate: '',
            expDate: '',
            batchNo: '',
            sku: '',
            quantity: '',
            retailPrice: '',
            costPrice: '',
            sellingPrice: '',
            tradePrice: '',
            remaining: '',
        },
    ])

    // remove Input Fields
    const removeInputFields = (index) => {
        const rows = [...inputFields]
        rows.splice(index, 1)
        setInputFields(rows)
    }
    // delete InputField

    // add Input Field
    const addInputField = () => {
        setInputFields([
            ...inputFields,
            {
                mfgDate: '',
                expDate: '',
                batchNo: '',
                sku: '',
                quantity: '',
                retailPrice: '',
                costPrice: '',
                sellingPrice: '',
                tradePrice: '',
                remaining: '',
            },
        ])
    }

    const handleClosed = () => {
        setOpend(false)
        setInputFields([
            {
                ...inputFields[0],
                mfgDate: '',
                expDate: '',
                batchNo: '',
                sku: '',
                quantity: '',
                retailPrice: '',
                costPrice: '',
                tradePrice: '',
                remaining: '',
                sellingPrice: '',
            },
        ])
    }
    // end Add input field

    const handleChangeAllotemnt = (event, newValue) => {
        setallotmnetid(newValue)
    }
    // change mfg and exp date

    // change details
    const handleChangedetails = (event, index, fieldName) => {
        const newData = [...inputFields]
        newData[index][fieldName] = event.target.value
        if (fieldName === 'quantity') {
            newData[index].remaining = event.target.value
        }
        setInputFields(newData)
    }

    // date change
    const handleChangedetailsdate = (event, index, fieldName) => {
        const newData = [...inputFields]
        const newDate = moment(new Date(event.target.value)).format(
            'YYYY-MM-DD'
        )
        newData[index][fieldName] = newDate
        setInputFields(newData)
    }

    const handleSubmit = async (event) => {
        try {
            setLoading(true)
            setrefetchCallback(false)
            const response = await url.get(
                `v1/in/dealers-items?dealerAllotmentId=${allotmnetid.id}`
            )
            const data = response?.data || {}
            if (data.status === true) {
                setData(data.data)
                setLoading(false)
            } else {
                handleShowSnackbar('No data available!', 'error')
                setData([])
                setLoading(false)
            }
        } catch (error) {
            handleShowSnackbar(`Error fetching data: ${error.message}`, 'error')
            setLoading(false)
        }
    }

    const Update = (varinetid, dealerAllotmentId, inventoryListingId) => {
        setOpend(true)
        setVarientcode(varinetid)
        setinventoryListingId(inventoryListingId)
        setdealerAllotmentId(dealerAllotmentId)
    }

    const updateStock = (event) => {
        event.preventDefault()
        let errorList = []
        if (variantcode === null) {
            errorList.push('Select Variant Id')
        }

        inputFields.forEach((item) => {
            if (parseFloat(item.retailPrice) < parseFloat(item.costPrice)) {
                errorList.push('Cost Price is not more than MRP ,')
            }
            if (parseFloat(item.sellingPrice) <= parseFloat(item.costPrice)) {
                errorList.push(
                    'Selling Price is less than Cost Price and equal,'
                )
            }
            if (parseFloat(item.tradePrice) <= parseFloat(item.costPrice)) {
                errorList.push(
                    'Store Price is less than Cost Price  and equal,'
                )
            }
            if (parseFloat(item.sellingPrice) > parseFloat(item.retailPrice)) {
                errorList.push('Selling Price is more than Retail Price,')
            }
            if (parseFloat(item.tradePrice) > parseFloat(item.sellingPrice)) {
                errorList.push('Store Price is more than Selling Price,')
            }
            if (parseFloat(item.tradePrice) > parseFloat(item.retailPrice)) {
                errorList.push('Store Price is more than Retail Price')
            }
            if (parseFloat(item.sellingPrice) === parseFloat(item.tradePrice)) {
                errorList.push('Store Price and Selling Price not be same')
            }
            if (item.mfgDate === '' || item.expDate === '') {
                errorList.push('Please select Mfg & Exp Date')
            }
        })

        if (errorList.length < 1) {
            setLoadingIndex(true)
            const dataToSend = {
                dealerAllotmentItemId: parseInt(dealerAllotmentId),
                createdBy: user.email,
                supplies: inputFields.map((inputField) => ({
                    ...inputField,
                    inventoryCode: user.storeCode,
                    inventoryListingId: inventoryListingId,
                    quantity: parseInt(inputField.quantity),
                    remaining: parseInt(inputField.remaining),
                    costPrice: parseFloat(inputField.costPrice),
                    sellingPrice: parseFloat(inputField.sellingPrice),
                    tradePrice: parseFloat(inputField.tradePrice),
                    retailPrice: parseFloat(inputField.retailPrice),
                    sku: inputField.sku,
                    batchNo: inputField.batchNo,
                    mfgDate: inputField.mfgDate,
                    expDate: inputField.expDate,
                })),
            }

            url.post('v1/in/dealers-stocks', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Update New Stock successfully',
                            'success'
                        )
                        setOpend(false)
                        setButtonValidated((prevValidations) => ({
                            ...prevValidations,
                            [variantcode]: true,
                        }))
                    } else {
                        handleShowSnackbar(response.data.data, 'error')
                    }
                })
                .catch((error) => {
                    const errorMessage = error.message || 'An error occurred' // Extract error message or use a default message
                    handleShowSnackbar(errorMessage, 'error')
                })
                .finally(() => {
                    setVarientcode('')
                    setinventoryListingId('')
                    setLoadingIndex(false)
                    setInputFields([
                        {
                            ...inputFields[0],
                            mfgDate: '',
                            expDate: '',
                            batchNo: '',
                            sku: '',
                            quantity: '',
                            retailPrice: '',
                            costPrice: '',
                            tradePrice: '',
                            remaining: '',
                            sellingPrice: '',
                        },
                    ])
                })
        } else {
            handleShowSnackbar(errorList, 'error')
        }
    }

    const responseData = (data) => {
        return data.map((item, index) => {
            const image = item.product_variant.images[0]
            const name = item.product_variant.product.name
            const brand = item.product_variant.product.brand
            const productname = brand + ',' + name
            const category = item.product_variant.product.category
            const subcategory = item.product_variant.product.subcategory
            const barcode = item.product_variant.barcode
            const size =
                item.product_variant.product_size.value +
                item.product_variant.product_size.unit
            const lastInventoryListing =
                item.product_variant.inventory_listings[
                item.product_variant.inventory_listings.length - 1
                ] // Get the last inventory_listing
            const lastInventoryStock =
                lastInventoryListing &&
                lastInventoryListing.inventory_stocks[
                lastInventoryListing.inventory_stocks.length - 1
                ] // Get the last inventory_stock
            const Mrp =
                lastInventoryStock && lastInventoryStock.retailPrice
                    ? lastInventoryStock.retailPrice
                    : 'New'
            const StorePrice =
                lastInventoryStock && lastInventoryStock.tradePrice
                    ? lastInventoryStock.tradePrice
                    : 'New'
            const SellingPrice =
                lastInventoryStock && lastInventoryStock.sellingPrice
                    ? lastInventoryStock.sellingPrice
                    : 'New'
            const CostPrice =
                lastInventoryStock && lastInventoryStock.costPrice
                    ? lastInventoryStock.costPrice
                    : 'New'
            return {
                ...item,
                sno: index + 1,
                image: (
                    <img
                        src={image}
                        height={50}
                        loading="lazy"
                        style={{
                            borderRadius: '10%',
                            border: '1px solid #d1d1e0',
                        }}
                        alt="Product Image"
                    />
                ),
                productname: productname,
                category: category,
                subcategory: subcategory,
                barcode: barcode,
                size: size,
                mrp: Mrp,
                StorePrice: StorePrice,
                SellingPrice: SellingPrice,
                CostPrice: CostPrice,
                verify: (
                    <div>
                        <Button
                            key={item.productVariantId}
                            variant="outlined"
                            color="primary"
                            disabled={buttonValidated[item.productVariantId]}
                            className={
                                buttonValidated[item.productVariantId]
                                    ? 'validated'
                                    : ''
                            }
                            onClick={() =>
                                Update(
                                    item.productVariantId,
                                    item.id,
                                    item.inventoryListingId
                                )
                            } // Replace 'item.id' with the actual property containing the ID for verification
                        >
                            {buttonValidated[item.productVariantId]
                                ? 'Updated'
                                : 'Update'}
                        </Button>
                    </div>
                ),
            }
        })
    }

    const tableData = {
        columns: [
            {
                label: 'Sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'VariantId',
                field: 'productVariantId',
                sort: 'asc',
            },
            {
                label: 'Image',
                field: 'image',
            },
            {
                label: 'Brand & Name',
                field: 'productname',
                sort: 'asc',
            },
            {
                label: 'Category',
                field: 'category',
                sort: 'asc',
            },
            {
                label: 'Subcategory',
                field: 'subcategory',
                sort: 'asc',
            },
            {
                label: 'Size',
                field: 'size',
                sort: 'asc',
            },
            {
                label: 'Mrp',
                field: 'mrp',
                sort: 'asc',
            },
            {
                label: 'Selling Price',
                field: 'SellingPrice',
                sort: 'asc',
            },
            {
                label: 'Store Price',
                field: 'StorePrice',
                sort: 'asc',
            },
            {
                label: 'Cost Price',
                field: 'CostPrice',
                sort: 'asc',
            },
            {
                label: 'Qunatity',
                field: 'quantity',
                sort: 'asc',
            },
            {
                label: 'Update Stock',
                field: 'verify',
            },

            // Add more columns as needed
        ],
        rows: responseData(data),
    }

    // Start Alert  fun //
    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleClose = (reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
    }

    const verifyAllotment = async () => {
        try {
            setIsLoading(true)
            const response = await url.put(
                `v1/in/dealers/allotments/${allotmnetid.id}`,
                { status: 'completed' } // Replace 'verified' with the desired value for the status
            )
            const data = response.data
            if (data.status === true) {
                handleShowSnackbar(
                    'Allotment verified successfully!',
                    'success'
                )
                setrefetchCallback(true)
                setData([])

                setallotmnetid(null)
                setIsLoading(false)
            } else {
                handleShowSnackbar('No data available!', 'error')
                setData([])

                setallotmnetid(null)
                setIsLoading(false)
            }
        } catch (error) {
            setLoading(false)
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    // close Alert fun //
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Verify Dealer Allotment' }]}
                    />
                </div>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={4}
                                md={4}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <DealerAllotemnt
                                    value={allotmnetid}
                                    onChange={handleChangeAllotemnt}
                                    refetchCallback={refetchCallback}
                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={loading}
                        >
                            <Icon>send</Icon>
                            <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                                {loading && (
                                    <StyledProgress
                                        size={24}
                                        className="buttonProgress"
                                    />
                                )}
                                Submit
                            </Span>
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
            <br />
            {/* {data.length > 0 ? (
                <SimpleCard title="Allotment Items Details">
                    <Grid
                        container
                        alignItems="center"
                        // justify="flex-end"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={verifyAllotment}
                            sx={{ width: '100%' }}
                            disabled={isLoading}
                        >
                            {' '}
                            {isLoading && (
                                <StyledProgress
                                    size={24}
                                    className="buttonProgress"
                                />
                            )}
                            Verify Allotment
                        </Button>
                    </Grid>
                    {/* <div className="table-responsive">
                        <CenteredTable
                            data={tableData}
                            noBottomColumns={true}
                            className="centered-cell"
                        />
                    </div> 
                 </SimpleCard> 
             ) : null}  */}

            {data.length > 0 ? (
                <SimpleCard title="Allotment Items Details">
                    <Grid
                        container
                        alignItems="center"
                    // justify="flex-end"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={verifyAllotment}
                            sx={{ width: '100%' }}
                            disabled={isLoading}
                        >
                            {' '}
                            {isLoading && (
                                <StyledProgress
                                    size={24}
                                    className="buttonProgress"
                                />
                            )}
                            Verify Allotment
                        </Button>
                    </Grid>
                    <div className="table-responsive">
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {tableData.columns.map((column) => (
                                            <TableCell key={column.label} sx={{ fontSize: '14px', padding: '8px', textAlign:'center',width:'180px' }}>
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <TableRow key={row.sno}>
                                            {tableData.columns.map((column) => (
                                                <TableCell key={column.field} sx={{ fontSize: '12px', padding: '8px',textAlign:'center' }}>
                                                    {row[column.field]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={tableData.rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                </SimpleCard>
            ) : null}


            <Dialog open={opend} onClose={handleClosed}>
                <DialogTitle>Update Stock</DialogTitle>
                <DialogContent>
                    <ValidatorForm onSubmit={updateStock} onError={() => null}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <TextField
                                    label="Varient Id"
                                    type="number"
                                    name="variantcode"
                                    value={variantcode}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    color="success"
                                    variant="contained"
                                    type="submit"
                                    onClick={addInputField}
                                >
                                    <Icon>add</Icon>
                                    <Span
                                        sx={{
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        Add Supply
                                    </Span>
                                </Button>
                                <br />
                            </Grid>

                            {inputFields.map((data, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Grid
                                            item
                                            lg={5}
                                            md={5}
                                            sm={12}
                                            xs={12}
                                            sx={{ mt: 2 }}
                                        >
                                            <TextField
                                                label="Quantity(Ex:500)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'quantity'
                                                    )
                                                }
                                                type="number"
                                                name="quantity"
                                                value={
                                                    data.quantity <= 0
                                                        ? ''
                                                        : data.quantity
                                                }
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />

                                            <TextField
                                                label="MRP(Ex:₹200)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'retailPrice'
                                                    )
                                                }
                                                type="number"
                                                name="quantity"
                                                value={
                                                    data.retailPrice <= 0
                                                        ? ''
                                                        : data.retailPrice
                                                }
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />

                                            <TextField
                                                label="costPrice(Cost Price Ex:₹10)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'costPrice'
                                                    )
                                                }
                                                type="number"
                                                name="costPrice"
                                                value={
                                                    data.costPrice <= 0
                                                        ? ''
                                                        : data.costPrice
                                                }
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                            <TextField
                                                label="SellingPrice(Store Price Ex:₹10)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'sellingPrice'
                                                    )
                                                }
                                                type="number"
                                                name="sellingPrice"
                                                value={
                                                    data.sellingPrice <= 0
                                                        ? ''
                                                        : data.sellingPrice
                                                }
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                            <TextField
                                                label="Store Price(Store Price Ex:₹10)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'tradePrice'
                                                    )
                                                }
                                                type="number"
                                                name="tradePrice"
                                                value={
                                                    data.tradePrice <= 0
                                                        ? ''
                                                        : data.tradePrice
                                                }
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                        </Grid>
                                        <Grid
                                            item
                                            lg={5}
                                            md={5}
                                            sm={12}
                                            xs={12}
                                            sx={{ mt: 2 }}
                                        >
                                            <TextField
                                                label="Batch No(Ex: #025)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'batchNo'
                                                    )
                                                }
                                                type="text"
                                                name="batchNo"
                                                value={data.batchNo}
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                            <TextField
                                                label="SKU(Ex:A-1)*"
                                                onChange={(evnt) =>
                                                    handleChangedetails(
                                                        evnt,
                                                        index,
                                                        'sku'
                                                    )
                                                }
                                                type="text"
                                                name="sku"
                                                value={data.sku}
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                            <h6
                                                style={{
                                                    marginBottom: '15px',
                                                    marginTop: '7px',
                                                }}
                                            >
                                                Date Of Manufacture*
                                            </h6>
                                            <DatePickPicker
                                                value={data.mfgDate}
                                                setMinDate={false}
                                                onChange={(event) =>
                                                    handleChangedetailsdate(
                                                        event,
                                                        index,
                                                        'mfgDate'
                                                    )
                                                }
                                            />
                                            <h6
                                                style={{
                                                    marginBottom: '10px',
                                                    marginTop: '7px',
                                                }}
                                            >
                                                Date Of Expiry*
                                            </h6>
                                            <DatePickPicker
                                                value={data.expDate}
                                                setMinDate={true}
                                                onChange={(event) =>
                                                    handleChangedetailsdate(
                                                        event,
                                                        index,
                                                        'expDate'
                                                    )
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={2}>
                                            {inputFields.length !== 1 ? (
                                                <Button
                                                    color="error"
                                                    variant="outlined"
                                                    type="reset"
                                                    onClick={() =>
                                                        removeInputFields(index)
                                                    }
                                                    size="large"
                                                >
                                                    <Icon>close</Icon>
                                                    <Span
                                                        sx={{
                                                            textTransform:
                                                                'capitalize',
                                                        }}
                                                    ></Span>
                                                </Button>
                                            ) : (
                                                ''
                                            )}
                                        </Grid>
                                    </Fragment>
                                )
                            })}
                        </Grid>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={loadingIndex}
                        >
                            <Icon>send</Icon>
                            <Span
                                sx={{
                                    pl: 1,
                                    textTransform: 'capitalize',
                                }}
                            >
                                Update
                            </Span>
                            {loadingIndex && (
                                <StyledProgress
                                    size={24}
                                    className="buttonProgress"
                                />
                            )}
                        </Button>
                        <br />
                        <br />
                        <Button
                            color="error"
                            variant="contained"
                            type="submit"
                            onClick={handleClosed}
                        >
                            <Icon>close</Icon>
                            <Span
                                sx={{
                                    pl: 1,
                                    textTransform: 'capitalize',
                                }}
                            >
                                Close
                            </Span>
                        </Button>
                    </ValidatorForm>
                </DialogContent>
            </Dialog>
        </Container>
    )
}

export default VerifyDealerAllotement
