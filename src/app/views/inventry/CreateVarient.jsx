import {
    Button,
    Icon,
    Grid,
    Autocomplete,
    CircularProgress,
    IconButton,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { styled } from '@mui/system'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect, Fragment } from 'react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { SimpleCard } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import { media_Url, url } from 'app/constants'

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const CustomInput = styled('input')({
    display: 'none',
})
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
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
const CreateVarient = (props) => {
    // const { enqueueSnackbar } = useSnackbar()
    const [state, setState] = useState({
        date: new Date(),
    })
    const [loadingIndex, setLoadingIndex] = useState(null)
    const [images, setImages] = useState([])
    const [file, setFile] = useState([])
    const [packaging, setpackaging] = useState('')
    const { value, color, barcode } = state
    const [unit, setunit] = useState(null)
    const [SizeList, setSizeList] = useState([])
    const [ColorList, setColorList] = useState([])
    const [hexCode, sethexCode] = useState(null)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [upload, setupload] = useState(false)
    const [inputFields, setInputFields] = useState([
        {
            label: '',
            value: '',
        },
    ])
    const [severity, setSeverity] = useState('success')
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
        async function fetchList() {
            url.get('v1/in/products-sizes?pid=' + props.productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setSizeList(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
            url.get('v1/in/products-colors?pid=' + props.productId)
                .then((response) => {
                    if (response.data.status === true) {
                        setColorList(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
        }

        fetchList()
    }, [props.productId])
    // select of Dibba

    const handleSizeChange = (event, newValue) => {
        setunit(newValue)
    }
    const handleColorChange = (event, newValue) => {
        sethexCode(newValue)
    }

    const handleImagesChange = (event) => {
        setupload(false)
        event.preventDefault()
        const files = event.target.files
        const urls = []
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader()
            reader.onload = (event) => {
                urls.push({
                    url: event.target.result,
                    lastModified: files[i].lastModified,
                })
                if (urls.length === files.length) {
                    // Sort the urls array based on the lastModified timestamp of each file
                    const sortedUrls = urls.sort((a, b) => {
                        return a.lastModified - b.lastModified
                    })
                    setImages([...images, ...sortedUrls.map((url) => url.url)])
                }
            }
            reader.readAsDataURL(files[i])
        }
        setFile(event.target.files)

        // handleUpload(event.target.files)
    }
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
                    handleShowSnackbar('Image Upload successfully', 'success')
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

    const handleSubmit = (event) => {
        event.preventDefault()

        let errorList = []
        if (images.length === 0) {
            errorList.push('Please Select atleast one image ,')
        }
        if (upload === false) {
            errorList.push('Please upload the image first ,')
        }
        if (unit === null) {
            errorList.push('Please Select Size type ,')
        }
        if (errorList.length < 1) {
            // setLoading(true)
            const isValid = inputFields.every(
                (field) => field.label !== '' && field.value !== ''
            )

            const dataToSend = {
                productId: parseInt(props.productId),
                images: file,
                details: isValid === true ? inputFields : null,
                barcode: barcode ? barcode : null,
                packaging: packaging ? packaging : null,
                productSizeId: unit.id,
                productColorId: hexCode ? hexCode.id : null,
            }

            url.post('v1/in/products-variants', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Variant added successfully',
                            'success'
                        )
                        props.onVariantCreated()
                        props.setUpdateVarient(true)
                    }
                })
                .catch((error) => {
                    //Error
                    console.log(error)
                })
                .finally(() => {
                    setState({ value: '', color: '', barcode: '' })
                    setpackaging('')
                    setImages([])
                    setpackaging('')
                    setunit(null)
                    sethexCode(null)
                    setLoading(false)
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
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value.replace(/\s/g, ''),
        })
    }
    const handleDeleteImage = (index) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }
    return (
        <SimpleCard title="Add Product variants">
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <div>
                <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <TextField
                                label="Product Id"
                                type="text"
                                name="Product Id"
                                disabled
                                value={props.productId}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                label="barcode"
                                type="text"
                                name="barcode"
                                value={barcode}
                                onChange={handleChange}
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
                        <Grid item xs={12}>
                            <Button
                                color="success"
                                variant="contained"
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
                                                handleChangeinput(index, evnt)
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
                                                handleChangeinput(index, evnt)
                                            }
                                            type="text"
                                            name="value"
                                            value={data.value}
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        {inputFields.length != 1 ? (
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
                                                    alt={`Image ${index + 1}`}
                                                    style={{
                                                        width: 70,
                                                        height: 70,
                                                        objectFit: 'cover',
                                                        borderRadius: '10%',
                                                        border: '1px solid #d1d1e0',
                                                        marginLeft: '0.5rem',
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
                                                    textTransform: 'capitalize',
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
                                <Grid item xs={3}>
                                    <CustomLabel htmlFor="image-upload">
                                        <i className="fa fa-cloud-upload"></i>{' '}
                                        Select Image
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
                                        label="value (EX:50/100/250/500)"
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
                                disabled
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
                                        label="Colour name (Ex:Orange)"
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
                </ValidatorForm>
            </div>
        </SimpleCard>
    )
}

export default CreateVarient
