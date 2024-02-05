import { SimpleCard } from 'app/components'
import * as React from 'react'
import {
    Button,
    Grid,
    Icon,
    styled,
    Box,
    CircularProgress,
} from '@mui/material'
import { url } from 'app/constants'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { StateList, CityList, Breadcrumb } from 'app/components'
import CategoryAutocomplete from '../inventry/CategoryList'
import { GrozpSnackbar } from 'app/components'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const AddEmployee = () => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [selectedState, setSelectedState] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [categoryValue, setcategoryValue] = useState(null)
    const handleCategoryChange = (event, newValue) => {
        setcategoryValue(newValue)
    }

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
        let errorList = []
        if (selectedState === '') {
            errorList.push('Select State,')
        }
        if (selectedCity === '') {
            errorList.push('Select City,')
        }
        if (errorList.length < 1) {
            setLoading(true)
            const dataToSend = {
                cityId: selectedCity,
                category: categoryValue.id,
            }
            url.post('v1/in/city-category', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Add Category with city successfully',
                            'success'
                        )
                        setLoading(false)
                    } else {
                        handleShowSnackbar(response.data.error, 'error')
                        setLoading(false)
                    }
                })
                .catch((error) => {
                    //Error
                    handleShowSnackbar(error, 'error')
                })
        } else {
            handleShowSnackbar(errorList, 'error')
        }
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Add Category With City' }]}
                    />
                </div>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />

                <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
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
                                <StateList onSelect={setSelectedState} />
                                <br />
                                <CityList
                                    stateId={selectedState}
                                    onSelect={setSelectedCity}
                                />
                                <br />
                                <CategoryAutocomplete
                                    value={categoryValue}
                                    onChange={handleCategoryChange}
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
                    </Box>
                </ValidatorForm>
            </SimpleCard>
            <br />
            <SimpleCard></SimpleCard>
        </Container>
    )
}

export default AddEmployee
