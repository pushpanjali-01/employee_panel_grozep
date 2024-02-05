import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
function useDealerList() {
    const { user } = useAuth()
    const [DealerList, setDealerList] = useState([])
    useEffect(() => {
        getdata()
    }, [])
    const getdata = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id
                // Fetch the dealers based on the inventoryId
                const dealersResponse = await url.get(
                    `v1/in/dealers?inventoryId=${inventoryId}`
                )

                // Check the response of the dealers API
                if (dealersResponse.data.status === true) {
                    setDealerList(dealersResponse.data.data)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }
    return DealerList
}

function DealerAutocomplete({ value, onChange }) {
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
                    label="Select Dealer"
                    variant="outlined"
                    fullWidth
                    required
                />
            )}
        />
    )
}

export default DealerAutocomplete
