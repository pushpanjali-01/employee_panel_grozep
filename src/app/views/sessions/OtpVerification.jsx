// import package
import { Grid, Button, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import useAuth from 'app/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Box, styled, useTheme } from '@mui/system'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { Paragraph } from 'app/components/Typography'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { useLocation } from 'react-router-dom'
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

// main class
const OtpVerification = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    // define
    const [userInfo, setUserInfo] = useState({
        mobile: location.state.mobile,
        password: '',
    })

    const [message, setMessage] = useState('')

    const { login } = useAuth()

    const handleChange = ({ target: { name, value } }) => {
        let temp = { ...userInfo }
        temp[name] = value
        setUserInfo(temp)
    }

    const { palette } = useTheme()
    const textError = palette.error.main

    const handleFormSubmit = async (event) => {
        setLoading(true)
        try {
            await login(userInfo.mobile, userInfo.password)
            navigate('/')
        } catch (error) {
            setMessage('Invalid OTP')
            setLoading(false)
        }
    }

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
                            <b>OTP </b>
                        </h4>

                        <ValidatorForm onSubmit={handleFormSubmit}>
                            <TextValidator
                                sx={{ mb: 5, width: '100%' }}
                                variant="outlined"
                                size="small"
                                label="Enter OTP"
                                onChange={handleChange}
                                type="text"
                                name="password"
                                value={userInfo.password}
                                pattern="\d{6}"
                                maxLength={6}
                                minLength={6}
                                validators={['required', 'matchRegexp:\\d{6}']}
                                errorMessages={[
                                    'This field is required',
                                    'OTP is not valid',
                                ]}
                                inputProps={{
                                    maxLength: 6,
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
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}
// end class
export default OtpVerification
