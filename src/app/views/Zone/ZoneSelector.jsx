import React, { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { Breadcrumb, SimpleCard } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import EmpAutocomplete from '../Zone/DeliveryBoyList'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Span } from 'app/components/Typography'
import useAuth from 'app/hooks/useAuth'
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
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
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))

const ZoneSelector = () => {
    const [selectedZone, setSelectedZone] = useState(null)
    const [zones, setZones] = useState([])
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = useState(false)
    const [EmpValue, setEmpValue] = useState(null)
    const handleEmpChange = (event, newValue) => {
        setEmpValue(newValue)
    }
    const { user } = useAuth()
    useEffect(() => {
        url.get(`v1/in/deliveries/zones?storecode=${user.storeCode}`)
            .then((response) => {
                if (response.data.status === true) {
                    setZones(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])
    const handleZoneChange = (event, newValue) => {
        setSelectedZone(newValue)
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
    // close Alert fun //
    const handleSubmit = () => {
        if (EmpValue == null || EmpValue == '') {
            handleShowSnackbar('Select Delivery Boy,', 'error')
        }

        if (selectedZone == null || selectedZone == '') {
            handleShowSnackbar('Select Zone', 'error')
        } else {
            setLoading(true)
            const dataToSend = {
                employeeId: EmpValue.employeeId,
                deliveryZoneId: selectedZone.id,
            }
            url.post('v1/in/deliveries/zones/allocations', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar('Add Successfully!', 'success')
                        setLoading(false)
                    }
                })
                .catch((error) => console.log(error))
            setSelectedZone(null)
            setEmpValue(null)
        }
    }
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Delivery Boy Zone Selector' }]}
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
                                <EmpAutocomplete
                                    value={EmpValue}
                                    onChange={handleEmpChange}
                                />
                                <AutoComplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={zones}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedZone}
                                    onChange={handleZoneChange}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Zone" />
                                    )}
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
                                Next
                            </Span>
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
        </Container>
    )
}

export default ZoneSelector
