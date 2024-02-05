// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Button, Container, Typography, Box } from '@mui/material'
// import WifiOffIcon from '@mui/icons-material/WifiOff'
// import RefreshIcon from '@mui/icons-material/Refresh'

// const InternetConnectionTimeout = () => {
//     const navigate = useNavigate()

//     const refreshPage = () => {
//         navigate('/dashboard/default') // Navigate to dashboard on refresh
//         // window.location.reload()
//     }

//     // useEffect(() => {
//     //     const checkConnection = () => {
//     //         if (navigator.onLine) {
//     //             navigate('dashboard/default') // Navigate to dashboard if online
//     //         }
//     //     }

//     //     // const intervalId = setInterval(checkConnection, 1000) // Check connection every second

//     //     // return () => {
//     //     //     clearInterval(intervalId) // Clear interval when component unmounts
//     //     // }
//     // }, [navigate])

//     return (
//         <Container
//             maxWidth="sm"
//             sx={{ textAlign: 'center', marginTop: '100px' }}
//         >
//             <WifiOffIcon color="error" fontSize="large" />
//             <Typography variant="h4" color="textSecondary" gutterBottom>
//                 Internet Connection Timeout
//             </Typography>
//             <Typography variant="body1" color="textSecondary" paragraph>
//                 Please check your internet connection and try again.
//             </Typography>
//             <Box marginTop="20px">
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     startIcon={<RefreshIcon />}
//                     onClick={refreshPage}
//                 >
//                     Refresh Page
//                 </Button>
//             </Box>
//         </Container>
//     )
// }

// export default InternetConnectionTimeout
