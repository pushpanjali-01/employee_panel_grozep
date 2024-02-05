import * as React from 'react'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { url } from 'app/constants'

export default function BasicSelect(props) {
    const [city, setcity] = React.useState(props.defaultValue || '')
    const [options, setOptions] = React.useState([])

    React.useEffect(() => {
        url.get('v1/in/cities')
            .then((response) => {
                setOptions(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching options:', error)
            })
    }, [])

    const handleChange = (event) => {
        setcity(event.target.value)
        props.onValueChange(event.target.value)
    }

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                    Select city
                </InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={city}
                    label="city"
                    onChange={handleChange}
                >
                    {options.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}
