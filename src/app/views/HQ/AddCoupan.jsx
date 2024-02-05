import { SimpleCard } from 'app/components'
import { Button, Grid, Icon, styled, Box, Autocomplete } from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { Span } from 'app/components/Typography'
import { useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle } from 'app/components'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import { DatePicker } from '@mui/lab'
import BrandAutocomplete from '../inventry/BrandList'
import CategoryAutocomplete from '../inventry/CategoryList'
import SubCategoryAutocomplete from '../inventry/SubCategoryList'
import { GrozpSnackbar } from 'app/components/'
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
// const AutoComplete = styled(Autocomplete)(() => ({
//     marginBottom: '16px',
// }))
function AddStore(props) {
    const [state, setState] = useState({
        startDate: null,
        endDate: null,
    })
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const {
        code,
        variantId,
        minAmount,
        startDate,
        endDate,
        maxLimit,
        maxItems,
        description,
        maxAmount,
        minItems,
        productId,
    } = state
    const options = ['Discount', 'Voucher']
    const [brandValue, setBrandValue] = useState(null)
    const [categoryValue, setcategoryValue] = useState(null)
    const [subCategoryValue, setSubCategoryValue] = useState(null)
    const [couponType, setCouponType] = useState('')

    const handleBrandChange = (event, newValue) => {
        setBrandValue(newValue)
    }
    const handleCategoryChange = (event, newValue) => {
        setcategoryValue(newValue)
    }
    const handleSubCategoryChange = (event, newValue) => {
        setSubCategoryValue(newValue)
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
    const handleSubmit = (event) => {
        event.preventDefault()

        const dataToSend = {
            code: code,
            description: description,
            couponType: couponType,
            constraints: {
                maxLimit: parseInt(maxLimit),
                minAmount: parseInt(minAmount),
                maxAmount: parseInt(maxAmount),
                minItems: parseInt(minItems),
                maxItems: parseInt(maxItems),
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString(),
            },
            itemConstraints: {
                variantId: variantId ? parseInt(variantId) : null,
                productId: productId ? parseInt(productId) : null,
                brandId: brandValue ? brandValue.id : null,
                categoryId: categoryValue ? categoryValue.id : null,
                subcategoryId: subCategoryValue ? subCategoryValue.id : null,
            },
        }
        url.post('v1/coupons', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar('Add New Coupon successfully', 'success')
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
                setCouponType('')
                setState({
                    startDate: null,
                    endDate: null,
                })
                setBrandValue(null)
                setcategoryValue(null)
                setSubCategoryValue(null)
            })
    }
    const handleChangecoupon = (event, value) => {
        setCouponType(value)
    }

    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }
    const handleDateChange = (startDate) => setState({ ...state, startDate })
    const handleChangeExpiry = (endDate) => setState({ ...state, endDate })
    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/coupon.png"
                title="Coupon Setup"
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                <SimpleCard title="Coupon Information ">
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
                                <Autocomplete
                                    options={options}
                                    value={couponType}
                                    onChange={handleChangecoupon}
                                    getOptionLabel={(option) => option}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Coupon Type"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                                <TextField
                                    type="text"
                                    name="code"
                                    id="standard-basic"
                                    value={code || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Coupon Code (Ex:WELCM23)"
                                    validators={[
                                        'required',
                                        'minStringLength: 2',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="description"
                                    id="standard-basic"
                                    value={description || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Description (Ex:Get flat 50% off)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="number"
                                    name="maxLimit"
                                    id="standard-basic"
                                    value={maxLimit || ''}
                                    onChange={handleChange}
                                    label="Max limit For User (Ex:10)"
                                    errorMessages={['this field is required']}
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        value={startDate}
                                        onChange={handleDateChange}
                                        slotProps={{
                                            textField: {
                                                helperText: 'DD / MM / YYYY',
                                            },
                                        }}
                                        renderInput={(props) => (
                                            <TextField
                                                {...props}
                                                label="Start Date"
                                                id="mui-pickers-date"
                                                sx={{ mb: 2, width: '100%' }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
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
                                    name="minAmount"
                                    id="standard-basic"
                                    value={minAmount || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label=" Minimum Purchase Amount (Ex:200)"
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                                <TextField
                                    type="number"
                                    name="maxAmount"
                                    id="standard-basic"
                                    value={maxAmount || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Maximum PurchaseAmount (Ex:2000)"
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                                <TextField
                                    type="number"
                                    name="minItems"
                                    id="standard-basic"
                                    value={minItems || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Minimum Item (Ex:10)"
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                                <TextField
                                    type="number"
                                    name="maxItems"
                                    id="standard-basic"
                                    value={maxItems || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Maximum Items (Ex:20)"
                                    validators={[
                                        'required',
                                        'minStringLength: 1',
                                    ]}
                                    inputProps={{ min: '0' }}
                                />
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        value={endDate}
                                        onChange={handleChangeExpiry}
                                        slotProps={{
                                            textField: {
                                                helperText: 'DD / MM / YYYY',
                                            },
                                        }}
                                        renderInput={(props) => (
                                            <TextField
                                                {...props}
                                                label="End"
                                                id="mui-pickers-date"
                                                sx={{ mb: 2, width: '100%' }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Box>
                </SimpleCard>
                <br />
                <SimpleCard title={'Coupon On Product'}>
                    <Grid container spacing={6}>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                            <TextField
                                type="number"
                                name="productId"
                                id="standard-basic"
                                value={productId || ''}
                                onChange={handleChange}
                                errorMessages={['this field is required']}
                                label="Product Id (Ex:10)"
                            />

                            <BrandAutocomplete
                                value={brandValue}
                                onChange={handleBrandChange}
                            />
                        </Grid>
                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2 }}>
                            <TextField
                                type="number"
                                name="variantId"
                                id="standard-basic"
                                value={variantId || ''}
                                onChange={handleChange}
                                errorMessages={['this field is required']}
                                label="Variant Id (Ex:3)"
                            />
                            <CategoryAutocomplete
                                value={categoryValue}
                                onChange={handleCategoryChange}
                            />
                            <SubCategoryAutocomplete
                                value={subCategoryValue}
                                onChange={handleSubCategoryChange}
                            />
                        </Grid>
                    </Grid>
                    <Button color="primary" variant="contained" type="submit">
                        <Icon>send</Icon>
                        <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                            Submit
                        </Span>
                    </Button>
                </SimpleCard>

                <br />
            </ValidatorForm>
        </Container>
    )
}

export default AddStore
