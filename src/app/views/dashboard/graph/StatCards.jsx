import {
    Box,
    Card,
    Grid,
    Icon,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material'
import { green, red } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import useAuth from 'app/hooks/useAuth'
import { Small } from 'app/components/Typography'
import { url } from 'app/constants'
const H4 = styled('h4')(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '16px',
    textTransform: 'capitalize',
    color: theme.palette.text.secondary,
}))
const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px !important',
    background: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: { padding: '16px !important' },
}))

const Heading = styled('h6')(({ theme }) => ({
    margin: 0,
    marginTop: '4px',
    fontSize: '30px',
    fontWeight: '500',
}))

const StatCards = () => {
    const { user } = useAuth()
    // Helper function to format date
    const formatDate = (date) => {
        const formattedDate = new Date(date)
        const year = formattedDate.getFullYear()
        const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0')
        const day = formattedDate.getDate().toString().padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    // Helper function to get the previous day's date
    const getPreviousDay = (date) => {
        const previousDay = new Date(date)
        previousDay.setDate(previousDay.getDate() - 1)
        return previousDay
    }

    // State variables

    const [totalOrderAmountToday, setTotalOrderAmountToday] = useState(0)
    const [totalOrderAmountYesterday, setTotalOrderAmountYesterday] =
        useState(0)
    const [todayordercount, setordercount] = useState(0)
    const [yesterdayordercount, setyesterdayordercount] = useState(0)

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                // Get the current date
                const currentDate = new Date()
                const formattedDate = formatDate(currentDate)
                // Get the previous day's date
                const previousDay = getPreviousDay(currentDate)
                const formattedPreviousDay = formatDate(previousDay)

                // Make API call for current date
                const dataToSendCurrent = {
                    storeCode: user.storeCode,
                    startDate: formattedDate,
                    endDate: formattedDate,
                    status: 'completed',
                }
                url.post(`v1/in/orders/all`, dataToSendCurrent)
                    .then((res) => {
                        if (res.data.status === true) {
                            const order = res.data.data
                            // const order = res.data.data.filter(
                            //     (entry) =>
                            //         entry.status === 'completed' ||
                            //         entry.status === 'pending'
                            // )

                            // Calculate total amount for today's orders and set the state
                            const totalAmountToday = calculateTotalAmount(order)
                            setTotalOrderAmountToday(totalAmountToday)
                            setordercount(order.length)
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching today orders:', error)
                    })

                // Make API call for previous day
                const dataToSendPrevious = {
                    storeCode: user.storeCode,
                    startDate: formattedPreviousDay,
                    endDate: formattedPreviousDay,
                    status: 'completed',
                }

                url.post(`v1/in/orders/all`, dataToSendPrevious)
                    .then((res) => {
                        if (res.data.status === true) {
                            // const previousData = res.data.data.filter(
                            //     (entry) =>
                            //         entry.status === 'completed' ||
                            //         entry.status === 'pending'
                            // )
                            const previousData = res.data.data

                            // Calculate total amount for yesterday's orders and set the state
                            const totalAmountYesterday =
                                calculateTotalAmount(previousData)
                            setTotalOrderAmountYesterday(totalAmountYesterday)
                            setyesterdayordercount(previousData.length)
                        }
                    })
                    .catch((error) => {
                        console.log('Error fetching yesterday orders:', error)
                    })
            } catch (error) {
                console.log('Error:', error)
            }
        }

        fetchOrderData()
    }, []) // Make sure to pass an empty dependency array to run the effect only once

    const calculateTotalAmount = (orders) => {
        let totalAmount = 0

        orders.forEach((order) => {
            order.order_items.forEach((item) => {
                if (
                    !item ||
                    typeof item.mrp !== 'string' ||
                    typeof item.off !== 'string' ||
                    typeof item.quantity !== 'number'
                ) {
                    return // Skip this item if data is not valid
                }

                const mrp = parseFloat(item.mrp)
                const off = parseFloat(item.off)
                const quantity = item.quantity - item.removedQty
                const discountedPrice = mrp - off

                totalAmount += discountedPrice * quantity
            })

            totalAmount += order.deliveryCharge
        })

        // Check if totalAmount is negative, and if so, set it to zero
        if (totalAmount < 0) {
            totalAmount = 0
        }

        return totalAmount
    }

    let percentageChange =
        yesterdayordercount !== 0
            ? ((todayordercount - yesterdayordercount) /
                  Math.abs(yesterdayordercount)) *
              100
            : 0

    let percentageAmountChange =
        totalOrderAmountYesterday !== 0
            ? ((totalOrderAmountToday - totalOrderAmountYesterday) /
                  Math.abs(totalOrderAmountYesterday)) *
              100
            : 0
    const changeSymbol = percentageChange >= 0 ? '+' : '-'
    const percentageColor = percentageChange >= 0 ? green[500] : red[500]
    const amountChangeSymbol = percentageAmountChange >= 0 ? '+' : '-'
    const amountPercentageColor =
        percentageAmountChange >= 0 ? green[500] : red[500]
    const cardList = [
        {
            name: (
                <span>
                    {changeSymbol}
                    <Box component="span" sx={{ color: percentageColor }}>
                        {Math.abs(percentageChange).toFixed(2)}%
                    </Box>{' '}
                    From previous day ({yesterdayordercount})
                </span>
            ),
            amount: `${todayordercount}`,
            icon: 'shopping_cart',
        },
        {
            name: (
                <span>
                    {amountChangeSymbol}
                    <Box component="span" sx={{ color: amountPercentageColor }}>
                        {Math.abs(percentageAmountChange).toFixed(2)}%
                    </Box>{' '}
                    From previous day (₹{totalOrderAmountYesterday.toFixed(2)})
                </span>
            ),
            amount: `${totalOrderAmountToday.toFixed(2)}`,
            icon: '₹',
        },
    ]

    return (
        <>
            <H4>
                <b>Inventory Details</b>
            </H4>
            <Grid container spacing={2} sx={{ mb: '24px' }}>
                {cardList.map((item, index) => (
                    <Grid item xs={12} md={3} key={index}>
                        <StyledCard elevation={6}>
                            <Grid
                                container
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Grid item>
                                    <Tooltip title={item.name} placement="top">
                                        <IconButton>
                                            <Icon
                                                color="success"
                                                style={{ fontSize: 40 }}
                                            >
                                                {item.icon}
                                            </Icon>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    <Box mt={2} textAlign="center">
                                        <Heading>{item.amount}</Heading>
                                        <Small>{item.name}</Small>
                                    </Box>
                                </Grid>
                            </Grid>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

export default StatCards
