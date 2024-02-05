import { SimpleCard } from 'app/components'
import {
    Button,
    Grid,
    Icon,
    styled,
    Box,
    CircularProgress,
} from '@mui/material'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))

function AddDimage(props) {
    const { user } = useAuth()
    const [state, setState] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const { quantity, remark, productVariantId } = state

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
    const handleSubmit = (event) => {
        event.preventDefault()
        setLoading(true)
        const dataToSend = {
            quantity: quantity,
            remark: remark,
            createdBy: user.id,
            productVariantId: productVariantId,
            storeCode: user.storeCode,
        }
        url.post('v1/in/stores-damages', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar(
                        'Add Dimage Product Successfully',
                        'success'
                    )
                    setState('')
                } else {
                    handleShowSnackbar('Somthing Went wrong!', 'error')
                }
            })
            .catch((error) => {
                //Error
                handleShowSnackbar(error, 'error')
            })
            .finally(() => {
                // setState('')
                setLoading(false)
            })
    }

    const handleChange = (event) => {
        event.persist()
        const { name, value } = event.target

        if (name === 'productVariantId' || name === 'quantity') {
            // Ensure that the entered value is a valid non-negative number
            if (/^\d+$/.test(value) || value === '') {
                setState({
                    ...state,
                    [name]: value,
                })
            } else if (value === '-') {
                // Allow "-" only if it's the first character
                setState({
                    ...state,
                    [name]: value,
                })
            }
        } else {
            // For other fields (e.g., "remark"), update the state directly
            setState({
                ...state,
                [name]: value,
            })
        }
    }

    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/budget.png"
                title="Add Damage Product "
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title="Dimage Product Details ">
                    <Box overflow="auto">
                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <TextField
                                    type="text"
                                    name="productVariantId"
                                    id="standard-basic"
                                    value={productVariantId || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Product Variant Id(Ex:123)"
                                    validators={['required']}
                                />

                                <TextField
                                    type="text"
                                    name="quantity"
                                    id="standard-basic"
                                    value={quantity || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Quantity (Ex:10)"
                                    validators={['required']}
                                />

                                <TextField
                                    type="text"
                                    name="remark"
                                    id="standard-basic"
                                    value={remark || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label=" Remark (Ex:Oil Pouch leakage )"
                                    validators={['required']}
                                />
                            </Grid>
                        </Grid>
                    </Box>
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
                </SimpleCard>
            </ValidatorForm>
        </Container>
    )
}

export default AddDimage
