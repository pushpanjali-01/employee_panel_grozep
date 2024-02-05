import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { SnackbarProvider, useSnackbar } from 'notistack'
import AddSize from './AddSize'
import AddColour from './AddColour'
import BrandAutocomplete from '../inventry/BrandList'
import CategoryAutocomplete from '../inventry/CategoryList'
import SubCategoryAutocomplete from '../inventry/SubCategoryList'
import { Delete } from '@mui/icons-material'
import { url, media_Url } from 'app/constants'
import VarientList from './VarientList'

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
const H4 = styled('h4')(({ theme }) => ({
    fontSize: '1.2rem',
    fontWeight: '500',
    marginBottom: '16px',
    textTransform: 'capitalize',
    color: theme.palette.text.primary,
}))
const CustomInput = styled('input')({
    display: 'none',
})
const CustomLabel = styled('label')({
    border: '1px solid #ccc',
    display: 'inline-block',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#555',
    background: '#f2f2f2',
    '&:hover': {
        background: '#e6e6e6',
    },
})

function View1({ setActiveView }) {
    const { enqueueSnackbar } = useSnackbar()
    const [state, setState] = useState({
        date: new Date(),
    })
    const [loading, setLoading] = useState(false)
    const [catid, setcatid] = useState('')
    const [isAdult, setIsAdult] = useState(false)

    const handleChangesisAdult = (event) => {
        setIsAdult(event.target.value === 'true')
    }
    const [brandValue, setBrandValue] = useState(null)
    const [categoryValue, setcategoryValue] = useState(null)
    const [subCategoryValue, setSubCategoryValue] = useState(null)
    const {
        name,
        description,
        tags,
        hsncode,
        cgst,
        sgst,
        family,
        gender,
        group,
        classs,
    } = state

    const handleClickSnack = (msg, variant) => {
        enqueueSnackbar(msg, { variant })
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

    const handleSubmit = (event) => {
        setLoading(true)
        event.preventDefault()
        const dataToSend = {
            name: name,
            description: description,
            tags: tags,
            brand: brandValue ? brandValue.name : null,
            category: categoryValue.name,
            subcategory: subCategoryValue.name,
            hsnCode: hsncode,
            cgst: parseFloat(cgst),
            sgst: parseFloat(sgst),
            family: family ? family : null,
            gender: gender ? gender : null,
            group: group ? group : null,
            class: classs ? classs : null,
            isAdult: typeof isAdult === 'boolean' ? isAdult : null,
        }
        console.log(dataToSend)
        url.post('v1/in/products', dataToSend)
            .then((response) => {
                if (response.data.status === true) {
                    const productId = response.data.data.id
                    localStorage.setItem('productId', productId)
                    localStorage.setItem('stage', 1)
                    setActiveView({ name: 'view2', productId })
                    handleClickSnack(
                        'Product Basic added successfully',
                        'success'
                    )
                }
            })
            .catch((error) => {
                //Error
                if (error.response) {
                    handleClickSnack('Somthing went Wrong!', 'error')
                }
            })
            .finally(() => {
                setState('')
                setLoading(false)
            })
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
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Product Basic Details' }]}
                    />
                </div>

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
                                    label="Product Name*(Ex:Masala Munch)"
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    id="standard-basic"
                                    value={name || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />

                                <TextField
                                    label="Description(Ex:India's favorite snacks.)(Optional)"
                                    type="text"
                                    name="description"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={description || ''}
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
                                    label="Tag*(Ex:Chini,cini,sugr,...)"
                                    type="text"
                                    name="tags"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={tags || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="Hsncode*(Ex:1234567890)"
                                    type="number"
                                    name="hsncode"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={hsncode || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
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
                                    label="CGST*(Ex:18)"
                                    type="number"
                                    name="cgst"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={cgst || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="SGST*(Ex:18)"
                                    type="number"
                                    name="sgst"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={sgst || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <TextField
                                    label="Family (Ex:Chilli Chatka/Green Chutney Style)(Optional)"
                                    type="text"
                                    name="family"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={family || ''}
                                />
                                <TextField
                                    label="Gender (Ex:Woman/Man/Unisex)(Optional)"
                                    type="text"
                                    name="gender"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={gender || ''}
                                />
                                <TextField
                                    label="Group (Ex:Teen/kid/Adult)(Optional)"
                                    type="text"
                                    name="group"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={group || ''}
                                />
                                <TextField
                                    label="Classs (Ex:Summer)(Optional)"
                                    type="text"
                                    name="classs"
                                    id="standard-basic"
                                    onChange={handleChange}
                                    value={classs || ''}
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
function View2({ setActiveView, productId }) {
    const [loading, setLoading] = useState(false)
    const [size, setstze] = useState(false)
    const [color, setcolor] = useState(false)
    const { enqueueSnackbar } = useSnackbar()
    const [inputFields, setInputFields] = useState([
        {
            label: '',
            value: '',
        },
    ])

    const handleChange = (index, evnt) => {
        const { name, value } = evnt.target
        const list = [...inputFields]
        list[index][name] = value
        setInputFields(list)
    }
    const removeInputFields = (index) => {
        const rows = [...inputFields]
        rows.splice(index, 1)
        setInputFields(rows)
    }
    const addInputField = () => {
        setInputFields([
            ...inputFields,
            {
                label: '',
                value: '',
            },
        ])
    }

    const handleClickSnack = (msg, variant) => {
        enqueueSnackbar(msg, { variant })
    }

    const handleSubmit = (event) => {
        if (size == false) {
            handleClickSnack('Add Atleast one size', 'error')
        } else {
            event.preventDefault()
            setLoading(true)
            const dataToSend = {
                productId: parseInt(productId),
                details: inputFields,
            }
            url.post('v1/in/products-details', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        setActiveView({ name: 'view3', productId })
                        localStorage.setItem('stage', 2)
                        handleClickSnack(
                            'Product Details added successfully',
                            'success'
                        )
                    }
                })
                .catch((error) => {
                    //Error
                    handleClickSnack(error, 'error')
                })
                .finally(() => {
                    setLoading(false)
                    setInputFields([
                        {
                            label: '',
                            value: '',
                        },
                    ])
                })
        }
    }

    return (
        <Container>
            <SimpleCard title="Add Size Varient">
                <AddSize productId={productId} size={size} setstze={setstze} />
            </SimpleCard>
            <br />
            <SimpleCard title="Add Colour Varient">
                <AddColour
                    productId={productId}
                    color={color}
                    setcolor={setcolor}
                />
            </SimpleCard>
            <br />
            <SimpleCard title="Add Details">
                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button
                                    color="success"
                                    variant="contained"
                                    type="submit"
                                    onClick={addInputField}
                                >
                                    <Icon>add</Icon>
                                    <Span
                                        sx={{
                                            pl: 1,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        Add
                                    </Span>
                                </Button>
                                <br />
                            </Grid>
                            {inputFields.map((data, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Grid item xs={5} key={'index'}>
                                            <TextField
                                                label="label(Ex:About Company)"
                                                onChange={(evnt) =>
                                                    handleChange(index, evnt)
                                                }
                                                type="text"
                                                name="label"
                                                value={data.label}
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField
                                                label="value(Ex:Pepsico pvt ltd)"
                                                onChange={(evnt) =>
                                                    handleChange(index, evnt)
                                                }
                                                type="text"
                                                name="value"
                                                value={data.value}
                                                validators={['required']}
                                                errorMessages={[
                                                    'this field is required',
                                                ]}
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            {inputFields.length !== 1 ? (
                                                <Button
                                                    color="error"
                                                    variant="outlined"
                                                    type="reset"
                                                    disabled={loading}
                                                    onClick={() =>
                                                        removeInputFields(index)
                                                    }
                                                    size="large"
                                                >
                                                    <Icon>close</Icon>
                                                    <Span
                                                        sx={{
                                                            textTransform:
                                                                'capitalize',
                                                        }}
                                                    ></Span>
                                                </Button>
                                            ) : (
                                                ''
                                            )}
                                        </Grid>
                                    </Fragment>
                                )
                            })}
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

function View3({ setActiveView, productId }) {
    const navigate = useNavigate()
    const [loadingIndex, setLoadingIndex] = useState(null)
    const { enqueueSnackbar } = useSnackbar()
    const [state, setState] = useState({
        date: new Date(),
    })
    const [images, setImages] = useState([])
    const [packaging, setpackaging] = useState('')
    const { value, color, barcode } = state
    const [unit, setunit] = useState(null)
    const [SizeList, setSizeList] = useState([])
    const [ColorList, setColorList] = useState([])
    const [hexCode, sethexCode] = useState(null)
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState([])
    const [upload, setupload] = useState(false)
    const [inputFields, setInputFields] = useState([
        {
            label: '',
            value: '',
        },
    ])
    const [activenext, setactivenext] = useState('')
    const [datastoend, setdatastoend] = useState(false)
    const [finshdata, setfinishdata] = useState(true)
    const handleChangeinput = (index, evnt) => {
        const { name, value } = evnt.target
        const list = [...inputFields]
        list[index][name] = value
        setInputFields(list)
    }
    const removeInputFields = (index) => {
        const rows = [...inputFields]
        rows.splice(index, 1)
        setInputFields(rows)
    }
    const addInputField = () => {
        setInputFields([
            ...inputFields,
            {
                label: '',
                value: '',
            },
        ])
    }
    const nextPage = () => {
        localStorage.removeItem('productId')
        localStorage.removeItem('stage')
        navigate('/inventry/product-lists')
    }
    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/products-sizes?pid=' + productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setSizeList(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
            url.get('v1/in/products-colors?pid=' + productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setColorList(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
            url.get('v1/in/products/' + productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setactivenext(
                            response.data.data.product_variants.length
                        )
                    }
                })
                .catch((error) => console.log(error))
        }

        fetchList()
    }, [productId, finshdata])
    // select of Dibba

    const handleClickSnack = (msg, variant) => {
        enqueueSnackbar(msg, { variant })
    }
    const handleSizeChange = (event, newValue) => {
        setunit(newValue)
    }
    const handleColorChange = (event, newValue) => {
        sethexCode(newValue)
    }
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }
    const handleImagesChange = (event) => {
        setupload(false)
        event.preventDefault()
        const files = event.target.files
        const urls = []
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader()
            reader.onload = (event) => {
                urls.push(event.target.result)
                if (urls.length === files.length) {
                    setImages([...images, ...urls])
                }
            }
            reader.readAsDataURL(files[i])
        }

        event.preventDefault()
        setFile(event.target.files)
    }

    function handleUpload() {
        const formData = new FormData()
        setLoadingIndex(1)
        for (let i = 0; i < file.length; i++) {
            formData.append('images', file[i])
        }
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        }
        media_Url
            .post('v1/products/images', formData, config)
            .then((response) => {
                if (response.data.status === true) {
                    handleClickSnack('Image Upload successfully!', 'success')
                    setFile(response.data.data.image)
                    setupload(true)
                }
            })
            .catch((error) => {
                //Error
                console.log(error)
            })
            .finally(() => {
                setLoadingIndex(false)
            })
    }
    const renderLoadingAnimation = (index) => {
        if (loadingIndex === index) {
            return <StyledProgress size={24} className="buttonProgress" />
        }
        return null
    }
    const handleSubmit = (event) => {
        setfinishdata(true)
        event.preventDefault()
        let errorList = []
        if (images.length === 0) {
            errorList.push('Please Select atleast one image ,')
        }
        if (upload === false) {
            errorList.push('Please upload the image first ')
        }
        if (unit === null) {
            errorList.push('Please Select Size type ,')
        }
        if (errorList.length < 1) {
            setLoading(true)
            const dataToSend = {
                productId: parseInt(productId),
                images: file,
                details: inputFields ? inputFields : null,
                barcode: barcode ? barcode : null,
                packaging: packaging ? packaging : '',
                productSizeId: unit.id,
                productColorId: hexCode ? hexCode.id : null,
            }

            url.post('v1/in/products-variants', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleClickSnack(
                            'Product added successfully',
                            'success'
                        )
                        setdatastoend(true)
                        setfinishdata(false)
                    }
                })
                .catch((error) => {
                    //Error
                    console.log(error)
                })
                .finally(() => {
                    setactivenext(true)
                    setLoading(false)
                    setdatastoend(false)
                    setState('')
                    setpackaging('')
                    setImages([])
                    setunit(null)
                    sethexCode(null)
                    setInputFields([
                        {
                            label: '',
                            value: '',
                        },
                    ])
                })
        } else {
            handleClickSnack(errorList, 'error')
        }
    }
    const handleDeleteImage = (index) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }

    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb
                        routeSegments={[{ name: 'Add Product variants' }]}
                    />
                </div>

                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        <Grid container spacing={2}>
                            <Grid item xs={10}>
                                <TextField
                                    label="Product Id"
                                    type="text"
                                    name="Product Id"
                                    disabled
                                    value={productId}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Barcode *(Ex:562575372)"
                                    type="text"
                                    name="barcode"
                                    onChange={handleChange}
                                    value={barcode || ''}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Packaging Type *(Ex:Packet,Box,...etc)"
                                    onChange={(event) =>
                                        setpackaging(event.target.value)
                                    }
                                    type="text"
                                    name="label"
                                    value={packaging}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={10}>
                                {images != '' ? (
                                    <>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {images.map((url, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        marginRight: 8,
                                                        marginBottom: 8,
                                                        position: 'relative',
                                                    }}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Image ${
                                                            index + 1
                                                        }`}
                                                        style={{
                                                            width: 70,
                                                            height: 70,
                                                            objectFit: 'cover',
                                                            borderRadius: '10%',
                                                            border: '1px solid #d1d1e0',
                                                            marginLeft:
                                                                '0.5rem',
                                                        }}
                                                    />

                                                    {upload ? null : (
                                                        <IconButton
                                                            color="error"
                                                            onClick={() =>
                                                                handleDeleteImage(
                                                                    index
                                                                )
                                                            }
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                top: -20,
                                                                right: -10,
                                                            }}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {upload ? null : (
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleUpload()}
                                                disabled={loadingIndex}
                                            >
                                                <Span
                                                    sx={{
                                                        pl: 1,
                                                        textTransform:
                                                            'capitalize',
                                                    }}
                                                >
                                                    {renderLoadingAnimation(1)}
                                                    Upload Image
                                                </Span>
                                            </Button>
                                        )}

                                        {upload
                                            ? 'Uploaded ' +
                                              file.length +
                                              ' files successfully!'
                                            : null}
                                    </>
                                ) : (
                                    <Grid item xs={4}>
                                        <CustomLabel htmlFor="image-upload">
                                            <i className="fa fa-cloud-upload"></i>{' '}
                                            Select Multiple Image
                                        </CustomLabel>
                                        <CustomInput
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            onChange={handleImagesChange}
                                            inputProps={{
                                                accept: 'image/jpeg, image/png',
                                            }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                            <Grid item xs={5}>
                                <Autocomplete
                                    options={SizeList}
                                    value={value}
                                    onChange={handleSizeChange}
                                    getOptionLabel={(option) => option.value}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Product Size (EX:50/100/250/500)"
                                            variant="outlined"
                                            fullWidth
                                            disabled
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <Autocomplete
                                    options={SizeList}
                                    value={unit}
                                    onChange={handleSizeChange}
                                    disabled // Add the disabled prop here
                                    getOptionLabel={(option) => option.unit}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Size"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={5} key={'index'}>
                                <Autocomplete
                                    options={ColorList}
                                    value={color}
                                    onChange={handleColorChange}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Product Colour (Ex:Orange)"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <Autocomplete
                                    options={ColorList}
                                    value={hexCode}
                                    onChange={handleColorChange}
                                    disabled
                                    getOptionLabel={(option) => option.hexCode}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Colour hexcode (Ex:#45ce30)"
                                            variant="outlined"
                                            fullWidth
                                            disabled
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    color="success"
                                    variant="contained"
                                    type="submit"
                                    onClick={addInputField}
                                >
                                    <Icon>add</Icon>
                                    <Span
                                        sx={{
                                            pl: 1,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        Add Product Label
                                    </Span>
                                </Button>
                                <br />
                            </Grid>
                            {inputFields.map((data, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Grid item xs={5} key={'index'}>
                                            <TextField
                                                label="label(Ex:About Company)"
                                                onChange={(evnt) =>
                                                    handleChangeinput(
                                                        index,
                                                        evnt
                                                    )
                                                }
                                                type="text"
                                                name="label"
                                                value={data.label}
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField
                                                label="value(Ex:Pepsico pvt ltd)"
                                                onChange={(evnt) =>
                                                    handleChangeinput(
                                                        index,
                                                        evnt
                                                    )
                                                }
                                                type="text"
                                                name="value"
                                                value={data.value}
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            {inputFields.length !== 1 ? (
                                                <Button
                                                    color="error"
                                                    variant="outlined"
                                                    type="reset"
                                                    disabled={loading}
                                                    onClick={() =>
                                                        removeInputFields(index)
                                                    }
                                                    size="large"
                                                >
                                                    <Icon>close</Icon>
                                                    <Span
                                                        sx={{
                                                            textTransform:
                                                                'capitalize',
                                                        }}
                                                    ></Span>
                                                </Button>
                                            ) : (
                                                ''
                                            )}
                                        </Grid>
                                    </Fragment>
                                )
                            })}
                        </Grid>

                        {activenext === SizeList.length ? (
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => nextPage()}
                            >
                                <Icon>send</Icon>
                                <Span
                                    sx={{ pl: 1, textTransform: 'capitalize' }}
                                >
                                    Finish
                                </Span>
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                disabled={loading}
                            >
                                <Icon>add</Icon>
                                <Span
                                    sx={{ pl: 1, textTransform: 'capitalize' }}
                                >
                                    {loading && (
                                        <StyledProgress
                                            size={24}
                                            className="buttonProgress"
                                        />
                                    )}
                                    Submit
                                </Span>
                            </Button>
                        )}
                    </ValidatorForm>
                </div>
            </SimpleCard>
            <br />
            <VarientList
                datasend={datastoend}
                productId={productId}
                checklength={value}
            />
        </Container>
    )
}

const NewProduct = () => {
    const [activeView, setActiveView] = useState({
        name: 'view1',
        productId: '',
    })

    useEffect(() => {
        const productId = window.localStorage.getItem('productId')
        const LabelData = window.localStorage.getItem('stage')

        if (parseInt(LabelData) === 1) {
            setActiveView({ name: 'view2', productId })
        } else if (parseInt(LabelData) === 2) {
            setActiveView({ name: 'view3', productId })
        } else {
            setActiveView({ name: 'view1' })
        }
    }, [])

    function renderActiveView() {
        switch (activeView.name) {
            case 'view1':
                return <View1 setActiveView={setActiveView} />
            case 'view2':
                return (
                    <View2
                        setActiveView={setActiveView}
                        productId={activeView.productId}
                    />
                )
            case 'view3':
                return (
                    <View3
                        setActiveView={setActiveView}
                        productId={activeView.productId}
                    />
                )

            default:
                return null
        }
    }

    return (
        <Container>
            <SnackbarProvider maxSnack={3}>
                {''}
                <H4>Add New Product</H4>
                {renderActiveView()}
            </SnackbarProvider>
        </Container>
    )
}

export default NewProduct
