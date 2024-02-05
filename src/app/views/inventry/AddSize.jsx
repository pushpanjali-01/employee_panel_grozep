import React, { useState, useEffect, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import { Span } from 'app/components/Typography'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import Swal from 'sweetalert2'
import { GrozpSnackbar } from 'app/components/'
// styles start //
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
// style end

// main function
const AddSize = (props) => {
    const productId = parseInt(props.productId)
    // const size = props.size
    const [values, setValues] = useState([{ value: '', unit: '' }])
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [open, setOpen] = useState(false)
    const [update, setupdate] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const addInputField = () => {
        setValues([...values, { value: '', unit: '', editing: true }])
    }

    const options = [
        'kg',
        'g',
        'ltr',
        'ml',
        'm',
        'cm',
        'Satge',
        'garm Jar',
        'gram refil',
        'kg jar',
        'kg refil',
        'S',
        'M',
        'L',
        'XL',
        'XXL',
        'pc',
        'Custom Size',
    ]

    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/products-sizes?pid=' + productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setValues(response.data.data)
                        if (response.data.data.length > 0) {
                            props.setstze(true)
                        }
                    } else {
                        setValues([])
                    }
                })
                .catch((error) => console.log(error))
        }
        fetchList()
    }, [productId, update])

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

    // onchange fun
    const handleChange = (index, e, value) => {
        const newValues = [...values]
        newValues[index][e.target.name] = e.target.value
        newValues[index].unit = value || ''
        setValues(newValues)
    }

    // end onchange fun

    const addNewSize = (index, data) => {
        if (productId) {
            let errorList = []
            setupdate(true)
            if (data.value === '' || data.unit === '') {
                errorList.push('Please Enter Size & Select Size type ,')
            }
            if (errorList.length < 1) {
                setLoadingIndex(index)
                const unit = data.unit === 'Custom Size' ? '' : data.unit
                const dataToSend = {
                    productId: parseInt(productId),
                    unit: unit,
                    value: data.value,
                }

                url.post('v1/in/products-sizes', dataToSend)
                    .then((response) => {
                        if (response.data.status === true) {
                            handleShowSnackbar(
                                'Add Size Successfully',
                                'success'
                            )
                            props.setstze(true)
                        }
                    })
                    .catch((error) => {
                        //Error
                        console.log(error)
                    })
                    .finally(() => {
                        setLoadingIndex(false)
                        setupdate(false)
                    })
            } else {
                handleShowSnackbar(errorList, 'error')
            }
        }
    }
    // remove details
    const removeInputFields = (index, id) => {
        if (id) {
            setupdate(true)
            if (
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'You want to delete this Details!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        new Promise((resolve) => {
                            url.delete('v1/in/products-sizes/' + id)
                                .then((res) => {
                                    if (res.data.status === true) {
                                        Swal.fire(
                                            'Deleted!',
                                            'Your file has been deleted.',
                                            'success'
                                        )
                                    }
                                })
                                .catch((error) => {
                                    // setErrorMessages(['Delete failed! Server error'])
                                    // setIserror(true)
                                    resolve()
                                })
                                .finally(() => {
                                    setupdate(false)
                                })
                        })
                    }
                })
            ) {
                return
            }
        }
        const rows = [...values]
        rows.splice(index, 1)
        setValues(rows)
    }
    const updateInputField = async (index) => {
        const updatedData = values[index]
        if (updatedData.value === '' || updatedData.unit === '') {
            return handleShowSnackbar(
                'Please Enter Size & Select Size type',
                'error'
            )
        }
        const unit = updatedData.unit === 'Custom Size' ? '' : updatedData.unit
        if (updatedData.id) {
            try {
                setLoadingIndex(index)
                const response = await url.put(
                    'v1/in/products-sizes/' + updatedData.id,
                    {
                        unit: unit,
                        value: updatedData.value,
                    }
                )
                if (response.data.status === true) {
                    handleShowSnackbar('Size Updated Successfully', 'success')
                } else {
                    handleShowSnackbar('Update failed! Server error', 'error')
                }
            } catch (error) {
                handleShowSnackbar('Update failed! Server error', 'error')
            } finally {
                setLoadingIndex(null)
                setupdate(!update) // Refresh the data after an update
            }
        }
    }
    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    return (
        <ValidatorForm onError={() => null}>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Grid container spacing={2}>
                <Grid item xs={5}>
                    <TextField
                        label="Product Id"
                        type="text"
                        name="Product Id"
                        disabled
                        value={productId}
                        validators={['required']}
                        errorMessages={['this field is required']}
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
                                pl: 1,
                                textTransform: 'capitalize',
                            }}
                        >
                            Add Size
                        </Span>
                    </Button>
                    <br />
                </Grid>
                {values.map((data, index) => {
                    return (
                        <Fragment key={index}>
                            <Grid item xs={5} key={'index'}>
                                <TextField
                                    label="value (EX:50/100/250/500)"
                                    onChange={(evnt) =>
                                        handleChange(index, evnt)
                                    }
                                    type="text"
                                    name="value"
                                    // disabled={data.id || data.editing}
                                    disabled={!data.editing}
                                    value={data.value}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    inputProps={{ min: '0' }}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <AutoComplete
                                    options={options}
                                    value={data.unit}
                                    onChange={(e, value) =>
                                        handleChange(index, e, value)
                                    }
                                    getOptionLabel={(option) => option}
                                    // disabled={data.id || data.editing}
                                    disabled={!data.editing}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Size"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                {values.length !== 0 ? (
                                    <>
                                        {data.id ? (
                                            <>
                                                {data.editing ? (
                                                    <Button
                                                        color="success"
                                                        variant="outlined"
                                                        type="button"
                                                        disabled={
                                                            loadingIndex ===
                                                            index
                                                        }
                                                        onClick={() =>
                                                            updateInputField(
                                                                index
                                                            )
                                                        }
                                                        size="large"
                                                    >
                                                        <Icon>done</Icon>
                                                        <Span
                                                            sx={{
                                                                textTransform:
                                                                    'capitalize',
                                                            }}
                                                        ></Span>
                                                        {renderLoadingAnimation(
                                                            index
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        color="info"
                                                        variant="outlined"
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedValues =
                                                                [...values]
                                                            updatedValues[
                                                                index
                                                            ].editing = true
                                                            setValues(
                                                                updatedValues
                                                            )
                                                        }}
                                                        size="large"
                                                    >
                                                        <Icon>edit</Icon>
                                                        <Span
                                                            sx={{
                                                                textTransform:
                                                                    'capitalize',
                                                            }}
                                                        ></Span>
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <Button
                                                color="success"
                                                variant="outlined"
                                                type="submit"
                                                disabled={
                                                    loadingIndex === index
                                                }
                                                onClick={() =>
                                                    addNewSize(index, data)
                                                }
                                                size="large"
                                            >
                                                <Icon>done</Icon>
                                                <Span
                                                    sx={{
                                                        textTransform:
                                                            'capitalize',
                                                    }}
                                                ></Span>{' '}
                                                {renderLoadingAnimation(index)}
                                            </Button>
                                        )}{' '}
                                        <Button
                                            color="error"
                                            variant="outlined"
                                            type="reset"
                                            onClick={() =>
                                                removeInputFields(
                                                    index,
                                                    data.id
                                                )
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
                                    </>
                                ) : (
                                    ''
                                )}
                            </Grid>
                        </Fragment>
                    )
                })}
            </Grid>
        </ValidatorForm>
    )
}

export default AddSize
