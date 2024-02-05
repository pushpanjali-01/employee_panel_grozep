import * as React from 'react'
import { styled } from '@mui/system'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { useState, useEffect } from 'react'
import { Span } from 'app/components/Typography'
import {
    Button,
    Icon,
    Grid,
    Radio,
    RadioGroup,
    FormControlLabel,
    CircularProgress,
} from '@mui/material'
import { SimpleCard } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import BrandAutocomplete from '../inventry/BrandList'
import CategoryAutocomplete from '../inventry/CategoryList'
import SubCategoryAutocomplete from '../inventry/SubCategoryList'
import { url } from 'app/constants'
// styels

// styeles
const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

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

const ProductBasicUpdate = (props) => {
    const [catid, setcatid] = useState('')
    const [brandValue, setBrandValue] = useState(null)
    const [categoryValue, setcategoryValue] = useState(null)
    const [subCategoryValue, setSubCategoryValue] = useState(null)
    const [status, setStatus] = useState('')
    const [isAdult, setIsAdult] = useState(false)
    const [tags, setTags] = useState('')
    const [data, setdata] = useState({})
    const [loadingIndex, setLoadingIndex] = useState(null)
    const productId = props.productId
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')

    useEffect(() => {
        getdata()
    }, [productId])
    const getdata = () => {
        url.get('v1/in/products/' + productId)
            .then((response) => {
                if (response.data.status === true) {
                    datasetapi(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }
    // data fetch update
    const datasetapi = (fetchdata) => {
        setBrandValue({ name: fetchdata.brand })
        setcategoryValue({ name: fetchdata.category })
        setSubCategoryValue({ name: fetchdata.subcategory })
        setStatus(fetchdata.status)
        setIsAdult(fetchdata.isAdult)
        setdata(fetchdata)
        setTags(fetchdata.tags)
    }
    // close update
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
        setLoadingIndex(1)
        event.preventDefault()
        const dataToSend = {
            name: data.name,
            description: data.description,
            tags: tags,
            brand: brandValue ? brandValue.name : '',
            category: categoryValue.name,
            subcategory: subCategoryValue.name,
            hsnCode: data.hsnCode,
            cgst: parseFloat(data.cgst),
            sgst: parseFloat(data.sgst),
            family: data.family ? data.family : '',
            gender: data.gender ? data.gender : '',
            group: data.group ? data.group : '',
            status: status,
            isAdult: isAdult,
            class: data.class ? data.class : '',
        }

        url.put('v1/in/products/' + productId, dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    handleShowSnackbar('Update Details Successfully', 'success')
                }
            })
            .catch((error) => {
                //Error
                handleShowSnackbar(error, 'error')
            })
            .finally(() => {
                setLoadingIndex(false)
            })
    }

    const handleTagsChange = (event) => {
        // Split input value by commas to create an array of tags
        setTags(event.target.value)
    }

    const handleChange = (event) => {
        event.persist()
        setdata({
            ...data,
            [event.target.name]: event.target.value,
        })
    }
    const handleBrandChange = (event, newValue) => {
        setBrandValue(newValue)
    }
    const handleCategoryChange = (event, newValue) => {
        setcategoryValue(newValue)
        setcatid(newValue.id)
    }
    const handleSubCategoryChange = (event, newValue) => {
        setSubCategoryValue(newValue)
    }

    // set status
    const handleChanges = (event) => {
        setStatus(event.target.value)
    }
    const handleChangesisAdult = (event) => {
        setIsAdult(event.target.value === 'true')
    }

    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    return (
        <Container>
            <SimpleCard>
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
                                    label="Product ID(Ex:123)"
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    id="standard-basic"
                                    value={productId || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    disabled
                                />
                                <TextField
                                    label="Product Name(Ex:Masala Munch)"
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    id="standard-basic"
                                    value={data.name || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />

                                <TextField
                                    label="Description(Ex:India's favorite snacks.)"
                                    type="text"
                                    name="description"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.description || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />

                                <BrandAutocomplete
                                    value={brandValue}
                                    onChange={handleBrandChange}
                                />
                                <CategoryAutocomplete
                                    value={categoryValue}
                                    onChange={handleCategoryChange}
                                />
                                <SubCategoryAutocomplete
                                    id={catid}
                                    value={subCategoryValue}
                                    onChange={handleSubCategoryChange}
                                />
                                <TextField
                                    label="Tag (Ex:Chini,cini,sugr,...)"
                                    type="text"
                                    name="tags"
                                    id="standard-basic"
                                    onChange={handleTagsChange}
                                    value={tags || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <span color="error">
                                    <b>Is Adult(+18)</b>
                                </span>
                                <RadioGroup
                                    row
                                    name="isAdult"
                                    sx={{ mb: 2 }}
                                    value={isAdult}
                                    onChange={handleChangesisAdult}
                                >
                                    <FormControlLabel
                                        value="true"
                                        label="Yes"
                                        labelPlacement="end"
                                        control={<Radio color="primary" />}
                                    />

                                    <FormControlLabel
                                        value="false"
                                        label="No"
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
                                    label="Hsncode (Ex:1234567890)"
                                    type="number"
                                    name="hsnCode"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.hsnCode || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="CGST*(Ex:18)"
                                    type="number"
                                    name="cgst"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.cgst || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="SGST*(Ex:18)"
                                    type="number"
                                    name="sgst"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.sgst || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="Family (Ex:Grocery/Electronic/Dairy)"
                                    type="text"
                                    name="family"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.family || ''}
                                />
                                <TextField
                                    label="Gender (Ex:Grocery/Electronic/Dairy)"
                                    type="text"
                                    name="gender"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.gender || ''}
                                />
                                <TextField
                                    label="Group (Ex:Grocery/Electronic/Dairy)"
                                    type="text"
                                    name="group"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.group || ''}
                                />
                                <TextField
                                    label="Class (Ex:Summer)"
                                    type="text"
                                    name="class"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={data.class || ''}
                                />
                                <RadioGroup
                                    row
                                    name="status"
                                    sx={{ mb: 2 }}
                                    value={status}
                                    onChange={handleChanges}
                                >
                                    <FormControlLabel
                                        value="active"
                                        label="Active"
                                        labelPlacement="end"
                                        control={<Radio color="primary" />}
                                    />

                                    <FormControlLabel
                                        value="inactive"
                                        label="Inactive"
                                        labelPlacement="end"
                                        control={<Radio color="error" />}
                                    />
                                </RadioGroup>
                            </Grid>
                        </Grid>
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
                                Update
                            </Span>
                            {renderLoadingAnimation(1)}
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
        </Container>
    )
}

export default ProductBasicUpdate
