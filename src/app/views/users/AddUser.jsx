import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import React, { useState } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { url } from 'app/constants'
import { GrozpSnackbar } from 'app/components/'
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
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
const AddUser = () => {
    const [state, setState] = useState({
        date: new Date(),
    })
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')

    const handleClose = (reason) => {
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
    const handleSubmit = async (event) => {
        event.preventDefault()

        if (mobile === '') {
            handleShowSnackbar('Enter Mobile number!', 'error')
        } else if (!/^\d{10}$/.test(mobile)) {
            handleShowSnackbar('Invalid Mobile number!', 'error')
        } else {
            setIsLoading(true)
            const data = {
                number: mobile,
                name: username,
            }

            try {
                const response = await url.post('v1/in/users', data)
                const responseData = response.data

                if (responseData.status) {
                    handleShowSnackbar('User Created Successfully!', 'success')
                    setState('')
                } else {
                    handleShowSnackbar(
                        'Mobile number Already registered',
                        'error'
                    )
                }
            } catch (error) {
                console.log('Error:', error)
            }

            setIsLoading(false)
        }
    }

    const handleChange = (event) => {
        event.persist()
        const { name, value } = event.target
        if (name === 'mobile') {
            // Remove any non-digit characters (e.g., spaces, dashes)
            const cleanedValue = value.replace(/\D/g, '')

            // Limit the value to exactly 10 digits
            const truncatedValue = cleanedValue.slice(0, 10)

            setState({
                ...state,
                mobile: truncatedValue,
            })
        } else if (name === 'username') {
            // Check if the length of the entered value is within the valid range

            // If the length is outside the valid range, do not update the state
            setState({
                ...state,
                username: value,
            })
        }
    }

    const [isLoading, setIsLoading] = useState(false)
    const { username, mobile } = state

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'New User' }]} />
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
                                    label="Mobile Nubmer"
                                    onChange={handleChange}
                                    type="text"
                                    name="mobile"
                                    value={mobile || ''}
                                    maxLength={10}
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
                                <TextField
                                    type="text"
                                    name="username"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={username || ''}
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                    ]}
                                    label="Username (Min length 4, Max length 9)"
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                        >
                            <Icon>send</Icon>{' '}
                            {isLoading && (
                                <StyledProgress
                                    size={24}
                                    className="buttonProgress"
                                />
                            )}
                            Submit
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
        </Container>
    )
}

export default AddUser
