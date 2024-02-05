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
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
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

function AddExpence(props) {
    const { user } = useAuth()
    const [state, setState] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const { amount, remark } = state

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
            amount: parseInt(amount),
            remark: remark,
            storeCode: user.storeCode,
        }

        url.post('v1/in/stores-expenses', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar('Add Expenses Successfully!', 'success')
                } else {
                    handleShowSnackbar('Somthing Went wrong!', 'success')
                }
            })
            .catch((error) => {
                //Error
                handleShowSnackbar(error, 'error')
            })
            .finally(() => {
                setState('')
                setLoading(false)
            })
    }

    const handleChange = (event) => {
        event.persist()
        const { name, value } = event.target

        if (name === 'amount') {
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
                title="Add Expense "
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title=" Expense Details ">
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
                                    name="amount"
                                    id="standard-basic"
                                    value={amount || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="amount(Ex:₹200)"
                                    validators={['required']}
                                />

                                <TextField
                                    type="text"
                                    name="remark"
                                    id="standard-basic"
                                    value={remark || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label=" Remark (Ex:Pollybag/Pen/Diary)"
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

export default AddExpence
