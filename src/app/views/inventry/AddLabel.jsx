import * as React from 'react'
import { useState, useEffect, Fragment } from 'react'
import { styled } from '@mui/system'
import MuiAlert from '@mui/material/Alert'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Span } from 'app/components/Typography'
import Swal from 'sweetalert2'
import { Button, Icon, Grid, Snackbar, CircularProgress } from '@mui/material'
import { url } from 'app/constants'
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})
// styeles
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const AddLabel = (props) => {
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [open, setOpen] = React.useState(false)
    const [msg, setmsg] = React.useState('')
    const [inputFields, setInputFields] = useState([
        {
            label: '',
            value: '',
        },
    ])
    useEffect(() => {
        getdata()
    }, [props.productId])
    const getdata = () => {
        url.get('v1/in/products/' + props.productId)
            .then((response) => {
                if (response.data.status === true) {
                    setInputFields(response.data.data.product_details)
                }
            })
            .catch((error) => console.log(error))
    }
    const handleClick = (msg) => {
        setOpen(true)
        setmsg(msg)
    }
    const handleChangedetails = (index, evnt) => {
        const { name, value } = evnt.target
        const list = [...inputFields]
        list[index][name] = value
        setInputFields(list)
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
    }
    const updateinputfield = (index, data) => {
        if (data.id) {
            setLoadingIndex(index)
            const dataToSend = {
                label: data.label,
                value: data.value,
            }
            url.put('v1/in/products-details/' + data.id, dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleClick('Update Details Successfully')
                        getdata()
                    }
                })
                .catch((error) => {
                    //Error
                    console.log(error)
                })
                .finally(() => {
                    setLoadingIndex(false)
                })
        } else if (data.label && data.value) {
            const dataToSend = {
                productId: parseInt(props.productId),
                details: [data],
            }

            url.post('v1/in/products-details', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleClick('Add Details Successfully')
                        getdata()
                    }
                })
                .catch((error) => {
                    //Error
                    console.log(error)
                })
                .finally(() => {
                    setLoadingIndex(false)
                })
        }
    }

    // remove details
    const removeInputFields = (index, id) => {
        if (id) {
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
                            url.delete('v1/in/products-details/' + id)
                                .then((res) => {
                                    //send api delete request here, then refetch or update local table data for re-render
                                    const rows = [...inputFields]
                                    rows.splice(index, 1)
                                    setInputFields(rows)
                                    getdata()
                                    resolve()
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
                                .finally(() => { })
                        })
                    }
                })
            ) {
                return
            }
        }
        const rows = [...inputFields]
        rows.splice(index, 1)
        setInputFields(rows)
    }
    const addInputField = () => {
        setInputFields([
            ...inputFields,
            {
                label: '',
                value: '',
            },
        ])
    }
    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {msg}!
                </Alert>
            </Snackbar>
            <div>
                <ValidatorForm onError={() => null}>
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
                                    Add
                                </Span>
                            </Button>
                            <br />
                        </Grid>
                        {inputFields.map((data, index) => {
                            return (
                                <Fragment key={index}>
                                    <Grid item xs={5} key={'index'}>
                                        <TextField
                                            label="label"
                                            onChange={(evnt) =>
                                                handleChangedetails(index, evnt)
                                            }
                                            type="text"
                                            name="label"
                                            value={data.label}
                                            validators={['required']}
                                            errorMessages={[
                                                'this field is required',
                                            ]}
                                        />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TextField
                                            label="value"
                                            onChange={(evnt) =>
                                                handleChangedetails(index, evnt)
                                            }
                                            type="text"
                                            name="value"
                                            value={data.value}
                                            validators={['required']}
                                            errorMessages={[
                                                'this field is required',
                                            ]}
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        {inputFields.length !== 0 ? (
                                            <>
                                                {' '}
                                                {data.id ? null : (
                                                    <Button
                                                        color="success"
                                                        variant="outlined"
                                                        type="submit"
                                                        disabled={
                                                            loadingIndex ===
                                                            index
                                                        }
                                                        onClick={() =>
                                                            updateinputfield(
                                                                index,
                                                                data,
                                                                data.productId
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
                                                        ></Span>{' '}
                                                        {renderLoadingAnimation(
                                                            index
                                                        )}
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
                                                            textTransform:
                                                                'capitalize',
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
            </div>
        </>
    )
}

export default AddLabel
