import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
function useCategoryList() {
    const [CategoryList, setCategoryList] = useState([])

    useEffect(() => {
        url.get('v1/in/categories')
            .then((response) => {
                if (response.data.status === true) {
                    setCategoryList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])

    return CategoryList
}

function CategoryAutocomplete({ value, onChange }) {
    const CategoryList = useCategoryList()

    return (
        <AutoComplete
            options={CategoryList}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Category"
                    variant="outlined"
                    fullWidth
                    required
                />
            )}
        />
    )
}

export default CategoryAutocomplete
