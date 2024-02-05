import { SimpleCard } from 'app/components'
import {
    Button,
    FormControlLabel,
    Grid,
    Icon,
    Radio,
    RadioGroup,
    styled,
    Box,
    CircularProgress,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle, GrozpSnackbar } from 'app/components'
import { url } from 'app/constants'
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
function AddZone(props) {
    const { user } = useAuth()
    const [state, setState] = useState({})
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [severity, setSeverity] = useState('success')
    const { label, longitude, latitude, radius } = state
    const [status, setStatus] = useState('active')
    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    const handleSubmit = (event) => {
        event.preventDefault()

        if (!status) {
            handleShowSnackbar('Please select a status', 'error')
            return
        }
        setLoadingIndex(1)
        const dataToSend = {
            storecode: user.storeCode,
            status: status,
            label: label,
            radius: radius,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        }

        url.post('v1/in/deliveries/zones', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar('Add New Zone successfully', 'success')
                    props.onVariantCreated()
                    props.setUpdateVarient(true)
                }
            })
            .catch((error) => {
                //Error
                handleShowSnackbar(error, 'error')
            })
            .finally(() => {
                setState('')
                setStatus('active')
                setLoadingIndex(false)
            })
    }
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

    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }
    const handleChangeStatus = (event) => {
        setStatus(event.target.value) // Update the status state with the selected value
    }
    return (
        <Container>
            <LogoWithTitle src="/assets/Orders/Zone.png" title="Add Zone" />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title="Zone Information">
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
                                    name="label"
                                    id="standard-basic"
                                    value={label || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Zone Code (Ex:GHD-SB02)"
                                    validators={['required']}
                                />
                                <TextField
                                    type="number"
                                    name="radius"
                                    id="standard-basic"
                                    value={radius || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Area Radious (Ex:3)"
                                    validators={['required']}
                                />
                                <RadioGroup
                                    row
                                    name="status"
                                    sx={{ mb: 2 }}
                                    value={status}
                                    onChange={handleChangeStatus}
                                >
                                    <FormControlLabel
                                        value="active"
                                        label="Active"
                                        labelPlacement="end"
                                        control={<Radio color="success" />}
                                    />
                                    <FormControlLabel
                                        value="inactive"
                                        label="Inactive"
                                        labelPlacement="end"
                                        control={<Radio color="error" />}
                                    />
                                </RadioGroup>
                            </Grid>

                            <Grid
                                item
                                lg={6}
                                md={6}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <TextField
                                    type="number"
                                    name="latitude"
                                    id="standard-basic"
                                    value={latitude || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Latitude (Ex:24.18273152236848)"
                                    validators={['required']}
                                />
                                <TextField
                                    type="number"
                                    name="longitude"
                                    id="standard-basic"
                                    value={longitude || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Longitude (Ex:83.80390719701957)"
                                    validators={['required']}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </SimpleCard>
                <br />

                <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={loadingIndex}
                >
                    <Icon>send</Icon>
                    <Span
                        sx={{
                            pl: 1,
                            textTransform: 'capitalize',
                        }}
                    >
                        Submit
                    </Span>
                    {renderLoadingAnimation(1)}
                </Button>
            </ValidatorForm>
        </Container>
    )
}
export default AddZone
