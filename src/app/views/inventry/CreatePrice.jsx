import { SimpleCard } from 'app/components'
import * as React from 'react'
import {
    Button,
    FormControlLabel,
    Grid,
    Icon,
    Radio,
    RadioGroup,
    styled,
    Box,
    Autocomplete,
    CircularProgress,
} from '@mui/material'
import { GrozpSnackbar } from 'app/components/'
import { Span } from 'app/components/Typography'
import { useEffect, useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { url } from 'app/constants'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const CreatePrice = (props) => {
    const [state, setState] = useState('')
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const { mrp, off, saleFlag } = state
    const [citylist, setcitylist] = useState([])
    const [cityname, setcityname] = useState(null)
    const [VarientId, setVarientId] = useState([])
    const [variantcode, setVarientcode] = useState(null)
    const [loadingIndex, setLoadingIndex] = useState(null)
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

    useEffect(() => {
        async function fetchData() {
            url.get('v1/in/products/' + props.productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setVarientId(response.data.data.productVariant)
                    }
                })
                .catch((error) => console.log(error))
            url.get('v1/in/cities')
                .then((response) => {
                    if (response.data.status === true) {
                        setcitylist(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
        }
        fetchData()
    }, [])
    //Store & Varient change function
    const handleChangeVarient = (event, newValue) => {
        if (newValue && newValue.inputValue) {
            setVarientcode({
                label: newValue.inputValue,
            })
            return
        }
        setVarientcode(newValue)
    }
    // select of genre
    const handleChangeoption = (event, newValue) => {
        if (newValue && newValue.inputValue) {
            setcityname({
                label: newValue.inputValue,
            })

            return
        }
        setcityname(newValue)
    }
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let errorList = []
        if (cityname === null) {
            errorList.push('Select City,')
        }
        if (variantcode === null) {
            errorList.push('Select Varient Code')
        }
        if (saleFlag === undefined) {
            errorList.push('Select Sale Flag Status')
        }
        if (errorList.length < 1) {
            setLoadingIndex(true)
            const dataToSend = {
                city: cityname.name,
                productVariantId: parseInt(variantcode.id),
                mrp: parseInt(mrp),
                off: parseInt(off),
                saleFlag: saleFlag,
            }

            url.post('v1/in/pricing', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Add New Pricing successfully',
                            'success'
                        )
                        props.onVariantCreated()
                        props.setUpdateVarient(true)
                    }
                })
                .catch((error) => {
                    //Error
                    handleShowSnackbar(error, 'error')
                })
                .finally(() => {
                    setLoadingIndex(false)
                    setState('')
                    setcityname(null)
                    setVarientcode(null)
                })
        } else {
            handleShowSnackbar(errorList, 'error')
        }
    }
    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }

    return (
        <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
            <SimpleCard title="Pricing Details">
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <Box overflow="auto">
                    <Grid container spacing={6}>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                            <AutoComplete
                                options={citylist}
                                value={cityname}
                                onChange={handleChangeoption}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City"
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                            <AutoComplete
                                options={VarientId}
                                value={variantcode}
                                onChange={handleChangeVarient}
                                getOptionLabel={(option) => option.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Varient*"
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                            <TextField
                                type="number"
                                name="mrp"
                                id="standard-basic"
                                value={mrp || ''}
                                onChange={handleChange}
                                errorMessages={['this field is required']}
                                label="Mrp (Ex:201)"
                                validators={['required', 'minStringLength: 1']}
                                inputProps={{ min: '0' }}
                            />
                            <TextField
                                type="number"
                                name="off"
                                id="standard-basic"
                                value={off || ''}
                                onChange={handleChange}
                                errorMessages={['this field is required']}
                                label="off (Ex:50)"
                                validators={['required', 'minStringLength: 1']}
                                inputProps={{ min: '0' }}
                            />

                            <p>Sale Flag</p>
                            <RadioGroup
                                row
                                name="saleFlag"
                                value={saleFlag || ''}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="true"
                                    label="True"
                                    labelPlacement="end"
                                    control={<Radio color="primary" />}
                                />

                                <FormControlLabel
                                    value="false"
                                    label="False"
                                    labelPlacement="end"
                                    control={<Radio color="error" />}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                </Box>
                <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={loadingIndex}
                >
                    <Icon>send</Icon>
                    <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                        Submit
                        {renderLoadingAnimation}
                    </Span>
                </Button>
            </SimpleCard>
            <br />
        </ValidatorForm>
    )
}

export default CreatePrice
