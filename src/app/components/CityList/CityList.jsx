import React, { useState, useEffect } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { url } from 'app/constants'

const CityList = ({ stateId, onSelect }) => {
    const [cities, setCities] = useState([])
    const [selectedCity, setSelectedCity] = useState(null)

    useEffect(() => {
        if (!stateId) {
            // If no state is selected, clear the cities
            setCities([])
            return
        }

        // Fetch cities based on the selected state using Axios
        // Replace the API endpoint with your actual API
        url.get(`v1/in/cities?stateId=${stateId}`)
            .then((response) => setCities(response.data.data))
            .catch((error) => console.error('Error fetching cities:', error))
    }, [stateId])

    const options = cities.map((city) => ({
        value: city.id,
        label: city.name,
    }))

    return (
        <Autocomplete
            options={options}
            value={selectedCity}
            onChange={(event, selectedOption) => {
                setSelectedCity(selectedOption)
                onSelect(selectedOption ? selectedOption.value : '')
            }}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
                <TextField {...params} label="Select City" variant="outlined" />
            )}
            disabled={stateId === ''}
        />
    )
}

export default CityList
