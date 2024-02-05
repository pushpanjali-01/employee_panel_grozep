import { SimpleCard } from 'app/components'
import React, { useEffect, useState } from 'react'
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
import { Span } from 'app/components/Typography'

import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle, GrozpSnackbar } from 'app/components'
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
function AddStore(props) {
    const { user } = useAuth()
    const [inventoryId, setinventoryId] = useState('')
    const [state, setState] = useState({})
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [severity, setSeverity] = useState('success')
    const {
        code,
        radius,
        city,
        status,
        label,
        locality,
        pinCode,
        nearby,
        district,
        states,
        longitude,
        latitude,
    } = state
    const fetchStoreCodes = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id
                setinventoryId(inventoryId)
                // Fetch the dealers based on the inventoryId
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }
    useEffect(() => {
        fetchStoreCodes()
    }, [])
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
            code: code,
            radius: parseInt(radius),
            status: status,
            city: city,
            inventoryId: inventoryId,
            location: {
                label: label,
                locality: locality,
                pinCode: parseInt(pinCode),
                nearby: nearby,
                city: city,
                district: district,
                state: states,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            },
        }

        url.post('v1/in/stores', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar('Add New Store successfully', 'success')
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
    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/newstore.png"
                title="Add Store"
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title="Store Information">
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
                                    name="code"
                                    id="standard-basic"
                                    value={code || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="StoreName (Ex:JHGRH002)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="nearby"
                                    id="standard-basic"
                                    value={nearby || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Near By (Ex:Near Railway Station Road)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="locality"
                                    id="standard-basic"
                                    value={locality || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Locality (Ex:Garhwa)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="label"
                                    id="standard-basic"
                                    value={label || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Label (Ex:Home/Office/Other)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 10',
                                    ]}
                                />
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
                                    type="text"
                                    name="city"
                                    id="standard-basic"
                                    value={city || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="City (Ex:Garhwa)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="district"
                                    id="standard-basic"
                                    value={district || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="District (Ex:Garhwa)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="states"
                                    id="standard-basic"
                                    value={states || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="State (Ex:Jharkhand)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="number"
                                    name="pinCode"
                                    id="standard-basic"
                                    value={pinCode || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="PinCode (Ex:822114)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 10',
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </SimpleCard>
                <br />
                <SimpleCard title={'Store Location'}>
                    <Grid container spacing={6}>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
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
                            <TextField
                                type="number"
                                name="radius"
                                id="standard-basic"
                                value={radius || ''}
                                onChange={handleChange}
                                errorMessages={['this field is required']}
                                label="Coverage(km) (Ex:3)"
                                validators={['required']}
                            />
                            <RadioGroup
                                row
                                name="status"
                                sx={{ mb: 2 }}
                                value={status || ''}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="active"
                                    label="Active"
                                    labelPlacement="end"
                                    control={<Radio color="success" />}
                                />

                                <FormControlLabel
                                    value="inactive"
                                    label="inactive"
                                    labelPlacement="end"
                                    control={<Radio color="error" />}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
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
export default AddStore
