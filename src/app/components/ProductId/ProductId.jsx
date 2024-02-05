import React, { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { url } from 'app/constants'
const ProductId = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const handleChange = async (event) => {
        setSearchTerm(event.target.value)

        try {
            const response = await url.get(`v1/search?q=${event.target.value}`)
            // console.log(response)
            setSearchResults(response.data.data.predictions)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const handleSelect = async (event, value) => {
        try {
            const response = await url.get(`v1/search?q=${event.target.value}`)
            setSearchResults(response.data.data.suggestions)

            if (response.data.data.suggestions.length > 0) {
                const selectedId = response.data.data.suggestions[0].id
                onSelect(selectedId) // Call the callback function with the selected ID
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    return (
        <Autocomplete
            options={searchResults}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Product"
                    value={searchTerm}
                    onChange={handleChange}
                />
            )}
            onChange={handleSelect}
        />
    )
}

export default ProductId
