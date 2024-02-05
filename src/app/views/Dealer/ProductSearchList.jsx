import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
function useDealerList() {
    const [DealerList, setDealerList] = useState([])

    useEffect(() => {
        url.get('v1/in/dealers')
            .then((response) => {
                if (response.data.status === true) {
                    setDealerList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])

    return DealerList
}

function ProductSearch({ value, onChange }) {
    const DealerList = useDealerList()

    return (
        <AutoComplete
            options={DealerList}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Dealer (Optional)"
                    variant="outlined"
                    fullWidth
                    required
                />
            )}
        />
    )
}

export default ProductSearch
