import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
function useBrandList() {
    const [brandList, setBrandList] = useState([])

    useEffect(() => {
        url.get('v1/in/brands')
            .then((response) => {
                if (response.data.status === true) {
                    setBrandList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])

    return brandList
}

function BrandAutocomplete({ value, onChange }) {
    const brandList = useBrandList()

    return (
        <AutoComplete
            options={brandList}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Brand (Optional)"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    )
}

export default BrandAutocomplete
