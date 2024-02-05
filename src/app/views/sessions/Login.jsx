// import package
import { Grid, Button, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paragraph } from 'app/components/Typography'
import { Box, styled, useTheme } from '@mui/system'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { url } from 'app/constants'
// end import package

// style start
const theme = createTheme({
    palette: {
        neutral: {
            main: '#06c167',
            contrastText: '#fff',
        },
    },
})

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))

const FlexBox = styled(Box)(() => ({
    alignItems: 'center',
}))
const IMG = styled('img')(() => ({
    width: '40%',

    '@media (min-width: 600px)': {
        width: '60%',
    },

    '@media (min-width: 960px)': {
        width: '40%',
    },
}))

// style end
function Copyright(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {'Copyright © '}
            <Link color="inherit" href="https://www.grozep.com/">
                www.grozep.com
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    )
}
// main class
const Login = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    // define
    const [userInfo, setUserInfo] = useState({
        mobile: '',
    })
    const [message, setMessage] = useState('')
    const handleChange = (e) => {
        const { name, value } = e.target

        // Remove any non-digit characters from the input
        const newValue = value.replace(/\D/g, '')

        // Ensure the value is not longer than 10 digits
        if (newValue.length <= 10) {
            setUserInfo({ ...userInfo, [name]: newValue })
        }
    }
    const { palette } = useTheme()
    const textError = palette.error.main
    const handleFormSubmit = async (event) => {
        setLoading(true)
        event.preventDefault()
        const number = userInfo.mobile
        const response = await url.post('v1/employee/login/phone', {
            number,
        })
        if (response.data.status === false) {
            setMessage('Mobile number not Registered !')
        } else if (response.data.sentSMS === false) {
            setMessage(response.data.message)
        } else {
            if (response.data.status === true) {
                setMessage('Otp Send!')
                navigate('/session/otp', { state: { mobile: userInfo.mobile } })
            }
        }
        setLoading(false)
    }
    ValidatorForm.addValidationRule('isTenDigits', (value) => {
        if (value.length === 10) {
            return true
        }
        return false
    })

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={8}
                    sx={{
                        backgroundImage: 'url(/assets/images/home.jpg)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light'
                                ? t.palette.grey[50]
                                : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                ></Grid>
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={4}
                    component={Paper}
                    elevation={6}
                    square
                >
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <IMG
                            src="/assets/grozep/grozep_logo.svg"
                            alt=""
                            style={{ alignSelf: 'center' }}
                            sx={{ mb: 5 }}
                        />
                        <h4 mb={2}>
                            <b>Sign In</b>
                        </h4>
                        <h5 style={{ color: '#06c167' }}>Welcome back!</h5>
                        <ValidatorForm onSubmit={handleFormSubmit}>
                            <TextValidator
                                sx={{ mb: 5, width: '100%' }}
                                variant="outlined"
                                size="small"
                                label="Mobile Number"
                                onChange={handleChange}
                                type="text"
                                name="mobile"
                                value={userInfo.mobile}
                                validators={['required', 'isTenDigits']}
                                errorMessages={[
                                    'this field is required',
                                    'Mobile number must be 10 digits',
                                ]}
                                inputProps={{
                                    onKeyDown: (e) => {
                                        if (
                                            !/^\d$/.test(e.key) &&
                                            e.key !== 'Backspace'
                                        ) {
                                            e.preventDefault()
                                        }
                                    },
                                }}
                            />

                            {message && (
                                <Paragraph sx={{ color: textError }}>
                                    {message}
                                </Paragraph>
                            )}

                            <FlexBox mb={2} flexWrap="wrap">
                                <Box position="relative">
                                    <ThemeProvider theme={theme}>
                                        <Button
                                            variant="contained"
                                            color="neutral"
                                            disabled={loading}
                                            type="submit"
                                            fullWidth
                                        >
                                            {loading && (
                                                <StyledProgress
                                                    size={24}
                                                    className="buttonProgress"
                                                />
                                            )}
                                            LOGIN
                                        </Button>
                                    </ThemeProvider>
                                </Box>
                            </FlexBox>
                        </ValidatorForm>
                        <Copyright sx={{ mt: 5 }} />
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}
// end class
export default Login
