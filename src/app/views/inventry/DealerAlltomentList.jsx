import { useState, useEffect } from 'react'
import { Autocomplete } from '@mui/lab'
import { TextField, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
const AutoComplete = styled(Autocomplete)(() => ({
    marginBottom: '16px',
}))

function useAllotmentList(refetchCallback) {
    const [allotmentList, setAllotmentList] = useState([])
    const [dealerData, setDealerData] = useState({})
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    useEffect(() => {
        // const fetchDealerData = async () => {
        //     try {
        //         const response = await url.get('v1/in/dealers')
        //         if (response.data.status === true) {
        //             const dealers = response.data.data
        //             const dealerMap = {}
        //             dealers.forEach((dealer) => {
        //                 dealerMap[dealer.id] = dealer
        //             })
        //             setDealerData(dealerMap)
        //         }
        //     } catch (error) {
        //         console.log(error)
        //     }
        // }
        // const fetchData = async () => {
        //     try {
        //         const response = await url.get(
        //             `v1/in/dealers/allotments?status=pending&inventoryId=${inventoryId}`
        //         )
        //         if (response.data.status === true) {
        //             const fetchedAllotmentList = response.data.data
        //             setAllotmentList(fetchedAllotmentList)
        //         }
        //     } catch (error) {
        //         console.log(error)
        //     } finally {
        //         setLoading(false)
        //     }
        // }
        getdata()
    }, [refetchCallback])
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
                    const dealers = dealersResponse.data.data
                    const dealerMap = {}
                    dealers.forEach((dealer) => {
                        dealerMap[dealer.id] = dealer
                    })
                    setDealerData(dealerMap)

                    // Fetch the allotments based on the inventoryId and status
                    try {
                        const allotmentsResponse = await url.get(
                            `v1/in/dealers/allotments?status=pending&inventoryId=${inventoryId}`
                        )

                        // Check the response of the allotments API
                        if (allotmentsResponse.data.status === true) {
                            const fetchedAllotmentList =
                                allotmentsResponse.data.data
                            setAllotmentList(fetchedAllotmentList)
                        } else {
                            // Handle the case where allotments response status is not true
                        }
                    } catch (error) {
                        console.log(error)
                    } finally {
                        setLoading(false)
                    }
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

    return { allotmentList, dealerData, loading }
}

function DealerAllotment({ value, onChange, refetchCallback }) {
    const { allotmentList, dealerData, loading } =
        useAllotmentList(refetchCallback)

    const getOptionLabel = (option) => {
        const dealerName = dealerData[option.dealerId]
            ? dealerData[option.dealerId].name
            : 'N/A'
        return ` ${option.id} (${dealerName})`
    }

    return (
        <AutoComplete
            options={allotmentList}
            value={value}
            onChange={onChange}
            getOptionLabel={getOptionLabel}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Dealer Allotment"
                    variant="outlined"
                    fullWidth
                    required
                />
            )}
            loading={loading}
            loadingText="Loading..."
            noOptionsText={loading ? 'Loading...' : 'No options'}
        />
    )
}

export default DealerAllotment
