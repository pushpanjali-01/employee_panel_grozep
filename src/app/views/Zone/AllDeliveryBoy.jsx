import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))

function useEmpList() {
    const [empList, setempList] = useState([])
    const { user } = useAuth()

    useEffect(() => {
        const role = 'shipper'
        url.get(
            `v1/in/employees/status?storecode=${user.storeCode}&role=${role}`
        )
            .then((response) => {
                if (response.data.status === true) {
                    setempList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])

    return empList
}

function EmpAutocomplete({ value, onChange }) {
    const empList = useEmpList()

    return (
        <AutoComplete
            options={empList}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) => option.employee.domainMail}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Delivery Boy"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    )
}

export default EmpAutocomplete
