import React, { useState, useEffect } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { url } from 'app/constants'

const StateList = ({ onSelect }) => {
    const [states, setStates] = useState([])
    const [selectedState, setSelectedState] = useState(null)

    useEffect(() => {
        // Fetch states from API using Axios
        // Replace the API endpoint with your actual API
        url.get('v1/in/states')
            .then((response) => setStates(response.data.data))
            .catch((error) => console.error('Error fetching states:', error))
    }, [])

    const options = states.map((state) => ({
        value: state.id,
        label: state.stateName,
    }))

    return (
        <Autocomplete
            options={options}
            value={selectedState}
            onChange={(event, selectedOption) => {
                setSelectedState(selectedOption)
                onSelect(selectedOption ? selectedOption.value : '')
            }}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select State"
                    variant="outlined"
                />
            )}
        />
    )
}

export default StateList
