import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))
function useStoreList() {
    const { user } = useAuth()
    const [StoreList, setStoreList] = useState([])
    const fetchStoreCodes = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id
                // Fetch the dealers based on the inventoryId
                const storeResponse = await url.get(
                    `v1/in/stores?inventoryId=${inventoryId}`
                )

                // Check the response of the dealers API
                if (storeResponse.data.status === true) {
                    setStoreList(storeResponse.data.data)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
        // try {
        //     setIsLoading(true)

        //     const response = await url.get('v1/in/stores')
        //     setStoreCodes(response.data.data)
        //     setIsLoading(false)
        // } catch (error) {
        //     console.log('Error fetching store codes:', error)
        //     setIsLoading(false)
        // }
    }
    useEffect(() => {
        fetchStoreCodes()
    }, [])

    return StoreList
}

function StoreAutocomplete({ value, onChange }) {
    const StoreList = useStoreList()

    return (
        <AutoComplete
            options={StoreList}
            value={value}
            onChange={onChange}
            getOptionLabel={(option) =>
                `${option.code} - ${option.location.locality}`
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Store"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    )
}

export default StoreAutocomplete
