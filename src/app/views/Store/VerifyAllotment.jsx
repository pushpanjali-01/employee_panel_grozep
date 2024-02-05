import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'

import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import moment from 'moment'
import { url } from 'app/constants'
import DealerAllotemnt from '../inventry/DealerAlltomentList'

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
const VerifyAllotment = () => {
    const [state, setState] = useState('')
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const [opend, setOpend] = React.useState(false)
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [empdata, setempdat] = useState([])
    const [allotmnetid, setallotmnetid] = useState(null)
    const [variantcode, setVarientcode] = useState(null)
    const [dealerAllotmentId, setdealerAllotmentId] = useState(null)
    const [buttonValidated, setButtonValidated] = useState({})
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

    const removeInputFields = (index) => {
        const rows = [...inputFields]
        rows.splice(index, 1)
        setInputFields(rows)
    }

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
    const handleChangeAllotemnt = (event, newValue) => {
        setallotmnetid(newValue)
    }

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
    useEffect(() => {
        try {
            url.get(`v1/in/dealers`)
                .then((res) => {
                    if (res.data.status === true) {
                        setempdat(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])
    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.name : ''
    }
    const handleSubmit = async (event) => {
        try {
            setLoading(true)
            const response = await url.get(
                `v1/in/dealers-items?dealerAllotmentId=${allotmnetid.id}`
            )
            const data = response.data
            if (data.status == true) {
                setData(data.data)
                setLoading(false)
            } else {
                handleShowSnackbar('No any data available!', 'error')
                setData([])
                setLoading(false)
            }
        } catch (error) {
            console.error('Error fetching bank data:', error)
            setLoading(false)
        }
    }

    const Update = (varinetid, dealerAllotmentId) => {
        setOpend(true)
        setVarientcode(varinetid)
        setdealerAllotmentId(dealerAllotmentId)
    }

    const handleSubmit2 = (event) => {
        event.preventDefault()

        let errorList = []
        if (variantcode === null) {
            errorList.push('Select Variant Id')
        }

        inputFields.forEach((item) => {
            if (parseFloat(item.retailPrice) < parseFloat(item.costPrice)) {
                errorList.push('Cost Price is not more than MRP')
            }
            if (parseFloat(item.costPrice) > parseFloat(item.tradePrice)) {
                errorList.push('Store Price is not less than Cost Price')
            }
            if (parseFloat(item.costPrice) > parseFloat(item.sellingPrice)) {
                errorList.push('Selling Price is not less than Cost Price')
            }
            if (item.mfgDate === '' || item.expDate === '') {
                errorList.push('Please select Mfg & Exp Date')
            }
        })

        if (errorList.length < 1) {
            setLoadingIndex(true)
            const dataToSend = {
                dealerAllotmentItemId: parseInt(dealerAllotmentId),
                supplies: inputFields.map((inputField) => ({
                    ...inputField,
                    quantity: parseInt(inputField.quantity),
                    remaining: parseInt(inputField.remaining),
                    costPrice: parseInt(inputField.costPrice),
                    sellingPrice: parseInt(inputField.sellingPrice),
                    tradePrice: parseInt(inputField.tradePrice),
                    retailPrice: parseInt(inputField.retailPrice),
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
                        handleShowSnackbar(
                            'Product Variant Id not found!',
                            'error'
                        )
                    }
                })
                .catch((error) => {
                    const errorMessage = error.message || 'An error occurred' // Extract error message or use a default message
                    handleShowSnackbar(errorMessage, 'error')
                })
                .finally(() => {
                    setState({
                        status: 'true',
                    })
                    setVarientcode('')
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

    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const dealr = item.dealerAllotmentId ? item.dealerAllotmentId : ''
            const delarid = getEmployeeEmailById(dealr)
            const image = item.product_variant.images[0]
            const name = item.product_variant.product.name
            const brand = item.product_variant.product.brand
            const productname = brand + ',' + name
            const category = item.product_variant.product.category
            const subcategory = item.product_variant.product.subcategory
            const barcode = item.product_variant.barcode

            return {
                ...item,
                sno: index + 1,
                dealerid: delarid,
                productname: productname,
                category: category,
                subcategory: subcategory,
                barcode: barcode,
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
                                Update(item.productVariantId, item.id)
                            } // Replace 'item.id' with the actual property containing the ID for verification
                        >
                            {buttonValidated[item.productVariantId]
                                ? 'Updated'
                                : 'Update'}
                        </Button>
                        <Dialog open={opend} onClose={handleClosed}>
                            <DialogTitle>Update Stock</DialogTitle>
                            <DialogContent>
                                <ValidatorForm
                                    onSubmit={handleSubmit2}
                                    onError={() => null}
                                >
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
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
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
                                                        textTransform:
                                                            'capitalize',
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
                                                                data.quantity <=
                                                                0
                                                                    ? ''
                                                                    : data.quantity
                                                            }
                                                            validators={[
                                                                'required',
                                                            ]}
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
                                                                data.retailPrice <=
                                                                0
                                                                    ? ''
                                                                    : data.retailPrice
                                                            }
                                                            validators={[
                                                                'required',
                                                            ]}
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
                                                                data.costPrice <=
                                                                0
                                                                    ? ''
                                                                    : data.costPrice
                                                            }
                                                            validators={[
                                                                'required',
                                                            ]}
                                                            errorMessages={[
                                                                'this field is required',
                                                            ]}
                                                        />
                                                        <TextField
                                                            label="sellingPrice(Store Price Ex:₹10)*"
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
                                                                data.sellingPrice <=
                                                                0
                                                                    ? ''
                                                                    : data.sellingPrice
                                                            }
                                                            validators={[
                                                                'required',
                                                            ]}
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
                                                                data.tradePrice <=
                                                                0
                                                                    ? ''
                                                                    : data.tradePrice
                                                            }
                                                            validators={[
                                                                'required',
                                                            ]}
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
                                                            validators={[
                                                                'required',
                                                            ]}
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
                                                            validators={[
                                                                'required',
                                                            ]}
                                                            errorMessages={[
                                                                'this field is required',
                                                            ]}
                                                        />
                                                        <h6
                                                            style={{
                                                                marginBottom:
                                                                    '15px',
                                                                marginTop:
                                                                    '7px',
                                                            }}
                                                        >
                                                            Date Of Manufacture*
                                                        </h6>
                                                        <DatePickPicker
                                                            setMinDate={false}
                                                            value={data.mfgDate}
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
                                                                marginBottom:
                                                                    '10px',
                                                                marginTop:
                                                                    '7px',
                                                            }}
                                                        >
                                                            Date Of Expiry*
                                                        </h6>
                                                        <DatePickPicker
                                                            setMinDate={true}
                                                            value={data.expDate}
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
                                                        {inputFields.length !==
                                                        1 ? (
                                                            <Button
                                                                color="error"
                                                                variant="outlined"
                                                                type="reset"
                                                                onClick={() =>
                                                                    removeInputFields(
                                                                        index
                                                                    )
                                                                }
                                                                size="large"
                                                            >
                                                                <Icon>
                                                                    close
                                                                </Icon>
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
                    </div>
                ),
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
                label: 'Barcode',
                field: 'barcode',
                sort: 'asc',
            },
            {
                label: 'Dealer',
                field: 'dealerid',
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
        rows: generateSerialNumbers(data),
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
    // close Alert fun //
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Verify Dealer Allotmnet' }]}
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
            {data.length > 0 ? (
                <SimpleCard title="Allotment Items Details">
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

export default VerifyAllotment
