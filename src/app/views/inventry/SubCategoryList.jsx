import React, { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { url } from 'app/constants'
import { styled } from '@mui/system'

const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))

function useSubCategoryList() {
    const [subCategoryList, setSubCategoryList] = useState([])

    useEffect(() => {
        url.get('v1/in/subcategories')
            .then((response) => {
                if (response.data.status === true) {
                    setSubCategoryList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])

    return subCategoryList
}

function SubCategoryAutocomplete({ value, onChange, id }) {
    const subCategoryList = useSubCategoryList()
    const filteredSubcategories = subCategoryList.filter(
        (subcategory) => subcategory.categoryId === id
    )

    return (
        <AutoComplete
            options={filteredSubcategories}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="SubCategory"
                    variant="outlined"
                    fullWidth
                    required
                />
            )}
        />
    )
}

export default SubCategoryAutocomplete
