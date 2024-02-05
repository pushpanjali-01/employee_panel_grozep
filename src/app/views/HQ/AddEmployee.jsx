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
import moment from 'moment'
import { url } from 'app/constants'
import { Span } from 'app/components/Typography'
import useAuth from 'app/hooks/useAuth'
import { useState } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle, DatePickPicker, GrozpSnackbar } from 'app/components'

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

const TextField = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
const AddEmployee = (props) => {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [state, setState] = useState('')
    const [dob, setdob] = useState(null)
    const [role, setrole] = useState(null)
    const { name, gender, domainMail, aadhaar, phone, email, address } = state
    const options = [
        'picker',
        'shipper',
        'Cleaner',
        'Cashier',
        'scanner',
        'QualityAssociate',
    ]

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

    const handleSubmitPersonal = (event) => {
        event.preventDefault()
        let errorList = []
        if (email === undefined) {
            errorList.push('Enter Email id,')
        }
        if (gender === undefined) {
            errorList.push('Select Gender,')
        }
        if (domainMail === undefined) {
            errorList.push('Enter Domian mail,')
        }

        if (role === undefined) {
            errorList.push('Select role,')
        }
        if (errorList.length < 1) {
            setLoading(true)
            const dataToSend = {
                name: name,
                email: email,
                domainMail: domainMail,
                dob: dob,
                phone: phone,
                aadhaar: aadhaar,
                gender: gender,
                storeCode: user.storeCode,
                address: address,
                role: role,
                status: 'active',
            }

            url.post('/v1/in/employees', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Add Employee Details successfully',
                            'success'
                        )
                        setLoading(false)
                        // localStorage.setItem('empId', response.data.data.id)
                        // setEmployeeid(response.data.data.id)
                        setdob('')
                        setrole('')
                        props.onVariantCreated()
                        props.setUpdateVarient(true)
                    } else {
                        handleShowSnackbar(
                            'Mobile & Email Id Already Registered!',
                            'error'
                        )
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

    const handleRoleChange = (event, newValue) => {
        setrole(newValue)
    }
    const handleChange = (event) => {
        event.persist()
        setState({
            ...state,
            [event.target.name]: event.target.value,
        })
    }
    const handleDateChange = (event) => {
        const newDate = moment(new Date(event.target.value)).format(
            'YYYY-MM-DD'
        )
        setdob(newDate)
    }
    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/employee.png"
                title="Add Employee"
            />
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />

            <ValidatorForm onSubmit={handleSubmitPersonal} onError={() => null}>
                <SimpleCard title="Personal Information">
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
                                {/* <StoreList
                                        value={StoreValue}
                                        onChange={handleStoreChange}
                                    /> */}
                                <TextField
                                    type="text"
                                    name="name"
                                    id="standard-basic"
                                    value={name || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Full Name (Ex:Johan Carter)"
                                    validators={[
                                        'required',
                                        'minStringLength: 4',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <TextField
                                    type="number"
                                    name="phone"
                                    id="standard-basic"
                                    value={phone || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Mobile Number (Ex:1122334455)"
                                    validators={[
                                        'required',
                                        'minStringLength: 10',
                                        'maxStringLength: 10',
                                    ]}
                                />
                                <TextField
                                    type="email"
                                    name="email"
                                    id="standard-basic"
                                    value={email || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Email id (Ex:jhon@gmail.com)"
                                />
                                <RadioGroup
                                    row
                                    name="gender"
                                    sx={{ mb: 2 }}
                                    value={gender || ''}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel
                                        value="male"
                                        label="Male"
                                        labelPlacement="end"
                                        control={<Radio color="primary" />}
                                    />

                                    <FormControlLabel
                                        value="female"
                                        label="Female"
                                        labelPlacement="end"
                                        control={<Radio color="primary" />}
                                    />
                                </RadioGroup>

                                <h6 style={{ marginBottom: '8px' }}>
                                    Date Of Birth
                                </h6>
                                <DatePickPicker
                                    setMinDate={true}
                                    value={dob}
                                    onChange={handleDateChange}
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
                                    type="number"
                                    name="aadhaar"
                                    id="standard-basic"
                                    value={aadhaar || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Uid Number (Ex:123456789012)"
                                    validators={[
                                        'required',
                                        'minStringLength: 12',
                                        'maxStringLength: 12',
                                    ]}
                                />
                                <TextField
                                    type="text"
                                    name="domainMail"
                                    id="standard-basic"
                                    value={domainMail || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Domain Mail (Ex:Jhon@grozep.com)"
                                />
                                <TextField
                                    type="text"
                                    name="address"
                                    id="standard-basic"
                                    value={address || ''}
                                    onChange={handleChange}
                                    errorMessages={['this field is required']}
                                    label="Address (Ex:Ward no-01,kerwa sukhbana)"
                                    validators={[
                                        'required',
                                        'minStringLength: 3',
                                        'maxStringLength: 20',
                                    ]}
                                />
                                <AutoComplete
                                    options={options}
                                    value={role}
                                    onChange={handleRoleChange}
                                    getOptionLabel={(option) => option}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Role"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
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
        </Container>
    )
}

export default AddEmployee
