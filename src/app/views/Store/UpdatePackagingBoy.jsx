import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { GrozpSnackbar } from 'app/components/'
import { url } from 'app/constants'
import EmpAutocomplete from '../Zone/PackagingBoy'
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
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

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const UserAllOrders = () => {
    const [option, setOption] = useState('')
    const [otherValue, setOtherValue] = useState('')
    const [state, setState] = useState('')
    const { orderid, number } = state
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const [EmpValue, setEmpValue] = useState(null)
    const handleEmpChange = (event, newValue) => {
        setEmpValue(newValue)
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

    const handleSubmit = (event) => {
        event.preventDefault() // Prevent form submission

        if (orderid === '' || orderid === null) {
            handleShowSnackbar('Enter Order Id', 'error')
            return
        }

        if (EmpValue === '' || EmpValue === null) {
            handleShowSnackbar('Select Packaging Boy First', 'error')
            return
        }

        setLoading(true)

        try {
            const data = {
                orderId: parseInt(orderid),
                employeeId: EmpValue.employeeId,
                taskName: 'prepared',
            }
            url.post('v1/in/tasks-employee', data)
                .then((res) => {
                    if (res.data.status === true) {
                        handleShowSnackbar(
                            'Packaging Boy Update Successfully',
                            'success'
                        )
                        setEmpValue(null)
                        setState('')
                        setLoading(false)
                    } else {
                        setState('')
                        setEmpValue(null)
                        handleShowSnackbar(res.data.message, 'error')
                        setLoading(false)
                    }
                })
                .catch((error) => {
                    console.log('Error:', error)

                    handleShowSnackbar('Server error', 'error')
                    setLoading(false)
                })
        } catch (error) {
            console.log('Error:', error)
        }
    }

    const handleOptionChange = (event) => {
        const selectedOption = event.target.value
        setOption(selectedOption)

        // Reset the other value when a different option is selected
        if (selectedOption !== 'other') {
            setOtherValue('')
        }
    }

    const handleOtherValueChange = (event) => {
        setOtherValue(event.target.value)
    }
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Update Packaging Boy' }]}
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
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <TextField
                                    label="Order Id"
                                    onChange={handleChange}
                                    type="text"
                                    name="orderid"
                                    value={orderid || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <EmpAutocomplete
                                    value={EmpValue}
                                    onChange={handleEmpChange}
                                />
                            </Grid>
                        </Grid>

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
        </Container>
    )
}

export default UserAllOrders
