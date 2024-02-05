import { SimpleCard } from 'app/components'
import { Button, Grid, Icon, styled, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { url } from 'app/constants'
import { GrozpSnackbar } from 'app/components'
// styles

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
// end style

// sub page function

const UpdateVarient = () => {
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [VarientId, setVarientId] = useState('')
    const [ProductID, setProductID] = useState('')

    // remove Input field

    // Snack Bar

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

    // submit function

    const handleSubmit = (event) => {
        event.preventDefault()

        if (VarientId === '') {
            handleShowSnackbar('Enter Product Variant Id', 'error')
            return
        }

        if (ProductID === '') {
            handleShowSnackbar('Enter Product Id', 'error')
            return
        }

        setLoadingIndex(true)

        url.patch(`/v1/in/products-variants/${VarientId}`, {
            productId: ProductID,
        })
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar(
                        'Update New Product ID successfully',
                        'success'
                    )
                    setVarientId('')
                    setProductID('')
                } else {
                    handleShowSnackbar('Product Variant Id not found!', 'error')
                }
            })
            .catch((error) => {
                // Handle any errors
                console.error(error)
            })
            .finally(() => {
                setLoadingIndex(false)
            })
    }

    // Define the handleChangedetails

    // input and radio button change fucntion

    return (
        <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
            <SimpleCard title={'Update Product ID'}>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <Grid container spacing={2}>
                    <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                        <TextField
                            label="Enter Varient Id"
                            onChange={(event) =>
                                setVarientId(event.target.value)
                            }
                            type="number"
                            name="VarientId"
                            value={VarientId}
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                        <TextField
                            label="Update Product Id"
                            onChange={(event) =>
                                setProductID(event.target.value)
                            }
                            type="number"
                            name="productId"
                            value={ProductID}
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                    </Grid>
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
            </SimpleCard>
        </ValidatorForm>
    )
}
// main function

export default UpdateVarient
