import { SimpleCard } from 'app/components'
import {
    Button,
    FormControlLabel,
    Grid,
    Icon,
    Radio,
    RadioGroup,
    styled,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { useNavigate } from 'react-router-dom'
import { Fragment, useEffect, useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import { url } from 'app/constants'
import moment from 'moment'
// styles

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
// end style

// sub page function

const NewListing = (props) => {
    const { user } = useAuth()
    // variable declaration
    const navigate = useNavigate()
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [state, setState] = useState('')
    const { status = 'true' } = state
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [VarientId, setVarientId] = useState([])
    const [Storelist, setStorelist] = useState([])
    const [Storecode, setStorecode] = useState(null)
    const [variantcode, setVarientcode] = useState(null)
    const [nextbutton, setnextbutton] = useState(false)
    const [inputFields, setInputFields] = useState([
        {
            mfgDate: '',
            expDate: '',
            batchNo: '',
            sku: '',
            quantity: '',
            mrp: '',
            off: '',
            saleFlag: 'false',
        },
    ])

    // remove Input field
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
                mrp: '',
                off: '',
                saleFlag: '',
            },
        ])
    }

    // Snack Bar
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

    // call main fucntion

    useEffect(() => {
        getdata()
    }, [props.productId])

    // fetch Varient & Stores
    const getdata = () => {
        url.get('v1/in/products/' + props.productId)
            .then((response) => {
                if (response.data.status === true) {
                    setVarientId(response.data.data.product_variants)
                }
            })
            .catch((error) => console.log(error))
        url.get('v1/in/stores')
            .then((response) => {
                if (response.data.status === true) {
                    setStorelist(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }
    // end fetch

    // submit function

    const handleSubmit = (event) => {
        event.preventDefault()
        let errorList = []

        if (Storecode === null) {
            errorList.push('Please Select Store,')
        }
        if (variantcode === null) {
            errorList.push('Select Varient Id,')
        }
        if (inputFields.length > 0) {
            var tempmsg = ''
            for (const item of inputFields) {
                if (parseFloat(item.mrp) <= parseFloat(item.off)) {
                    tempmsg = false
                }
            }
            if (tempmsg === false) {
                errorList.push(' Price Off is not more then Mrp')
            }
        }
        if (errorList.length < 1) {
            setLoadingIndex(true)
            const dataToSend = {
                storeCode: Storecode.code,
                productVariantId: parseInt(variantcode),
                isActive: status,
                employeeId: user.id,
                supplies: inputFields,
            }

            url.post('v1/in/listings', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Add New Listing successfully',
                            'success'
                        )
                        // props.onVariantCreated()
                        // props.setUpdateVarient(true)
                    } else {
                        handleShowSnackbar(
                            'Product Variant Id not found!',
                            'error'
                        )
                    }
                })
                .catch((error) => {
                    //Error
                    handleShowSnackbar(error, 'error')
                })
                .finally(() => {
                    setState({
                        status: 'true',
                    })
                    setnextbutton(true)
                    setStorecode(null)
                    setVarientcode('')
                    setLoadingIndex(false)
                    setInputFields((prevInputFields) => [
                        {
                            ...prevInputFields[0],
                            mfgDate: '',
                            expDate: '',
                            batchNo: '',
                            sku: '',
                            quantity: '',
                            mrp: '',
                            off: '',
                            saleFlag: 'false',
                        },
                    ])
                })
        } else {
            handleShowSnackbar(errorList, 'error')
        }
    }

    //Store & Varient change function

    const handleChangeStore = (event, newValue) => {
        if (newValue && newValue.inputValue) {
            setStorecode({
                label: newValue.inputValue,
            })
            return
        }
        setStorecode(newValue)
    }

    const Finishbutton = () => {
        localStorage.removeItem('stage')
        localStorage.removeItem('productId')
        handleShowSnackbar('Product Add Successfully !', 'success')
        navigate('/inventry/product-lists')
    }
    //Store & Varient change function
    // const handleChangeVarient = (event, newValue) => {
    //     if (newValue && newValue.inputValue) {
    //         setVarientcode({
    //             label: newValue.inputValue,
    //         })
    //         return
    //     }
    //     setVarientcode(newValue)
    // }

    // Define the handleChangedetails
    const handleChangedetails = (event, index, fieldName) => {
        const newData = [...inputFields]
        newData[index][fieldName] = event.target.value
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
    // input and radio button change fucntion
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <SimpleCard title={'Create New Listing'}>
                <Grid container spacing={2}>
                    <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                        <AutoComplete
                            options={Storelist}
                            value={Storecode}
                            onChange={handleChangeStore}
                            getOptionLabel={(option) => option.code}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Store*"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />
                        <TextField
                            label="Enter Varient Id"
                            onChange={(event) =>
                                setVarientcode(event.target.value)
                            }
                            type="number"
                            name="variantcode"
                            value={variantcode}
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                        {/* <AutoComplete
                            options={VarientId}
                            value={variantcode}
                            onChange={handleChangeVarient}
                            getOptionLabel={(option) => option.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Varient Id*"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        /> */}

                        <RadioGroup
                            row
                            name="status"
                            sx={{ mb: 2 }}
                            value={status || ''}
                            onChange={handleChange}
                        >
                            <FormControlLabel
                                value="true"
                                label="Active"
                                labelPlacement="end"
                                control={<Radio color="success" />}
                            />

                            <FormControlLabel
                                value="false"
                                label="inactive"
                                labelPlacement="end"
                                control={<Radio color="error" />}
                            />
                        </RadioGroup>
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
                                Add
                            </Span>
                        </Button>
                        <br />
                    </Grid>

                    {inputFields.map((data, index) => {
                        return (
                            <Fragment key={index}>
                                <Grid item xs={5}>
                                    <h6 style={{ marginBottom: '8px' }}>
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
                                </Grid>
                                <Grid item xs={5}>
                                    <h6 style={{ marginBottom: '8px' }}>
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

                                <Grid item xs={5} key={'index'}>
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
                                </Grid>
                                <Grid item xs={5}>
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
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        label="MRP(Ex:₹200)*"
                                        onChange={(evnt) =>
                                            handleChangedetails(
                                                evnt,
                                                index,
                                                'mrp'
                                            )
                                        }
                                        type="number"
                                        name="quantity"
                                        value={data.mrp <= 0 ? '' : data.mrp}
                                        validators={['required']}
                                        errorMessages={[
                                            'this field is required',
                                        ]}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Off(Ex:₹10)*"
                                        onChange={(evnt) =>
                                            handleChangedetails(
                                                evnt,
                                                index,
                                                'off'
                                            )
                                        }
                                        type="number"
                                        name="off"
                                        value={data.off <= 0 ? '' : data.off}
                                        validators={['required']}
                                        errorMessages={[
                                            'this field is required',
                                        ]}
                                    />
                                </Grid>
                                <Grid item xs={5} key={'index'}>
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
                                </Grid>

                                <Grid item xs={3}>
                                    <RadioGroup
                                        row
                                        name="saleFlag"
                                        value={data.saleFlag || ''}
                                        onChange={(evnt) =>
                                            handleChangedetails(
                                                evnt,
                                                index,
                                                'saleFlag'
                                            )
                                        }
                                    >
                                        <p style={{ marginRight: '1rem' }}>
                                            Sale Flag{' '}
                                        </p>

                                        <FormControlLabel
                                            value="true"
                                            label="True"
                                            labelPlacement="end"
                                            control={<Radio color="primary" />}
                                        />
                                        <FormControlLabel
                                            value="false"
                                            label="False"
                                            labelPlacement="end"
                                            control={<Radio color="error" />}
                                        />
                                    </RadioGroup>
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
                                                    textTransform: 'capitalize',
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
                    <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                        Submit
                    </Span>
                    {loadingIndex && (
                        <StyledProgress size={24} className="buttonProgress" />
                    )}
                </Button>
                <span> </span>
                {props.finsh && nextbutton === true ? (
                    <Button
                        color="success"
                        variant="contained"
                        onClick={() => Finishbutton()}
                    >
                        <Icon>send</Icon>
                        <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                            Finish
                        </Span>
                    </Button>
                ) : null}
            </SimpleCard>
        </ValidatorForm>
    )
}
// main function

export default NewListing
