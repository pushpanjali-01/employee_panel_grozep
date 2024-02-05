import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { styled } from '@mui/system'
import { GrozpSnackbar } from 'app/components/'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
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
        marginBottom: '10px',
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
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const { user } = useAuth()
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

    const handleSubmit = () => {
        if (orderid === '' || orderid === null) {
            handleShowSnackbar('Enter Order Id', 'error')
            return
        }
        if (option === '' || option === null) {
            handleShowSnackbar('Select Any Reason', 'error')
            return
        }

        if (option === 'other') {
            if (otherValue === '' || otherValue === null) {
                handleShowSnackbar('Write Any Reason', 'error')
                return
            }
        }
        setLoading(true)
        try {
            const datatosend = {
                id: parseInt(orderid),
                phone: number,
                employeeId: user.id,
                reason: option === 'other' ? otherValue : option,
            }
            url.post(`v1/in/orders-cancel`, datatosend)
                .then((res) => {
                    if (res.data.status === true) {
                        handleShowSnackbar(
                            'Order Cancel Successfully',
                            'success'
                        )
                        setState('')
                        setOption('')
                        setLoading(false)
                    } else {
                        handleShowSnackbar(res.data.message, 'error')
                        setLoading(false)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                    handleShowSnackbar('Server error', 'error')
                })
        } catch {
            console.log('Error')
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
        const { name, value } = event.target

        if (name === 'number') {
            // Remove any non-digit characters (e.g., spaces, dashes)
            const cleanedValue = value.replace(/\D/g, '')

            // Limit the value to exactly 10 digits
            const truncatedValue = cleanedValue.slice(0, 10)

            setState({
                ...state,
                number: truncatedValue,
            })
        } else if (name === 'orderid') {
            // Check for negative values
            const numericValue = parseInt(value, 10)
            if (!isNaN(numericValue) && numericValue >= 0) {
                setState({
                    ...state,
                    orderid: numericValue.toString(),
                })
            }
        }
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'User Cancel Order' }]}
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
                                <TextField
                                    label="User Mobile Number"
                                    onChange={handleChange}
                                    type="text"
                                    maxLength={10}
                                    name="number"
                                    value={number || ''}
                                    validators={[
                                        'required',
                                        'isNumber',
                                        'minStringLength:10',
                                        'maxStringLength:10',
                                    ]}
                                    errorMessages={[
                                        'This field is required',
                                        'Invalid mobile number',
                                        'Mobile number must be 10 digits',
                                        'Mobile number must be 10 digits',
                                    ]}
                                />
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="option">
                                        Select Reason:
                                    </InputLabel>
                                    <Select
                                        id="option"
                                        value={option}
                                        onChange={handleOptionChange}
                                    >
                                        <MenuItem value="">Select</MenuItem>
                                        <MenuItem value="Currently Unavilable At Home">
                                            Currently Unavailable At Home
                                        </MenuItem>
                                        <MenuItem value="User Not Picking the call">
                                            User Not Picking the call
                                        </MenuItem>
                                        <MenuItem value="User Without Apply Coupon and Redeem Point">
                                            User Without Apply Coupon and Redeem
                                            Point
                                        </MenuItem>
                                        <MenuItem value="Delivery Address Change">
                                            Delivery Address Change
                                        </MenuItem>
                                        <MenuItem value="Not Delivered Area">
                                            Not Delivered Area
                                        </MenuItem>
                                        <MenuItem value="Customer Refused order">
                                            Customer Refused order
                                        </MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <br />
                                {option === 'other' && (
                                    <div>
                                        <TextField
                                            id="otherValue"
                                            label="Enter Reason"
                                            type="text"
                                            value={otherValue}
                                            onChange={handleOtherValueChange}
                                            fullWidth
                                        />
                                    </div>
                                )}
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
        </Container>
    )
}

export default UserAllOrders
