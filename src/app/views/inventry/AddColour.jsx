import React, { useState, useEffect, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import Swal from 'sweetalert2'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { GrozpSnackbar } from 'app/components/'
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const AddColour = (props) => {
    const [values, setValues] = useState([{ name: '', hexCode: '' }])
    const productId = props.productId
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [update, setupdate] = useState(false)
    const [severity, setSeverity] = useState('success')
    const addInputField = () => {
        setValues([...values, { name: '', hexCode: '', editing: true }])
    }

    const [filledIndexes, setFilledIndexes] = useState([])
    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
    }
    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/products-colors?pid=' + productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setValues(response.data.data)
                        if (response.data.data.length > 0) {
                            props.setcolor(true)
                        }
                    } else {
                        setValues([])
                    }
                })
                .catch((error) => console.log(error))
        }
        fetchList()
    }, [productId, update])

    const handleChange = (index, evnt) => {
        const { name, value } = evnt.target
        const list = [...values]
        list[index][name] = value
        setValues(list)
        const newFilledIndexes = filledIndexes.includes(index)
            ? filledIndexes // index already filled
            : [...filledIndexes, index] // add new filled index
        setFilledIndexes(newFilledIndexes)
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
                            url.delete('v1/in/products-colors/' + id)
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

    const addNewColor = (index, data) => {
        if (productId) {
            let errorList = []
            setupdate(true)
            if (data.name === '' || data.hexCode === '') {
                errorList.push('Please Enter Colour Name & Colour Hex code ,')
            }
            if (errorList.length < 1) {
                setLoadingIndex(index)
                const dataToSend = {
                    productId: parseInt(productId),
                    name: data.name,
                    hexCode: data.hexCode,
                }
                url.post('v1/in/products-colors', dataToSend)
                    .then((response) => {
                        if (response.data.status === true) {
                            handleShowSnackbar('Add Colour Successfully')
                            props.setcolor(true)
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

    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    const updateInputField = async (index) => {
        const updatedData = values[index]
        if (updatedData.name === '' || updatedData.hexCode === '') {
            return handleShowSnackbar('Please Enter Color & hexcode', 'error')
        }
        if (updatedData.id) {
            try {
                setLoadingIndex(index)
                const response = await url.put(
                    'v1/in/products-colors/' + updatedData.id,
                    updatedData
                )
                if (response.data.status === true) {
                    handleShowSnackbar('Colour Updated Successfully', 'success')
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
    return (
        <ValidatorForm onError={() => null}>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Grid container spacing={2}>
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
                            Add Colour
                        </Span>
                    </Button>
                    <br />
                </Grid>
                {values.map((data, index) => {
                    return (
                        <Fragment key={index}>
                            <Grid item xs={5} key={'index'}>
                                <TextField
                                    label="Colour name (Ex:Orange)"
                                    onChange={(evnt) =>
                                        handleChange(index, evnt)
                                    }
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    disabled={!data.editing}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Colour HexCode (Ex:#675432)"
                                    onChange={(evnt) =>
                                        handleChange(index, evnt)
                                    }
                                    type="text"
                                    name="hexCode"
                                    disabled={!data.editing}
                                    value={data.hexCode}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
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
                                                    addNewColor(index, data)
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
                                        {/* </>
                                        )} */}
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

export default AddColour
