// import axios from 'axios'
// const api = axios.create({
//     baseURL: `https://api.grozep.com/`,
// })

// const api1 = axios.create({
//     baseURL: `https://media.grozep.com`,
// })

// // Brands
// // actions.js

// export const FETCH_BRANDS_REQUEST = 'FETCH_BRANDS_REQUEST'
// export const FETCH_BRANDS_SUCCESS = 'FETCH_BRANDS_SUCCESS'
// export const FETCH_BRANDS_FAILURE = 'FETCH_BRANDS_FAILURE'

// export const CREATE_BRAND_REQUEST = 'CREATE_BRAND_REQUEST'
// export const CREATE_BRAND_SUCCESS = 'CREATE_BRAND_SUCCESS'
// export const CREATE_BRAND_FAILURE = 'CREATE_BRAND_FAILURE'

// export const UPDATE_BRAND_REQUEST = 'UPDATE_BRAND_REQUEST'
// export const UPDATE_BRAND_SUCCESS = 'UPDATE_BRAND_SUCCESS'
// export const UPDATE_BRAND_FAILURE = 'UPDATE_BRAND_FAILURE'

// export const DELETE_BRAND_REQUEST = 'DELETE_BRAND_REQUEST'
// export const DELETE_BRAND_SUCCESS = 'DELETE_BRAND_SUCCESS'
// export const DELETE_BRAND_FAILURE = 'DELETE_BRAND_FAILURE'

// const apiUrl = 'https://example.com/api/v1/brands'

// // Action creators for fetching all brands
// export const fetchBrands = () => {
//     return (dispatch) => {
//         dispatch({ type: FETCH_BRANDS_REQUEST })
//         axios
//             .get(apiUrl)
//             .then((response) => {
//                 dispatch({
//                     type: FETCH_BRANDS_SUCCESS,
//                     payload: response.data.data,
//                 })
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: FETCH_BRANDS_FAILURE,
//                     error: error.message,
//                 })
//             })
//     }
// }

// // Action creators for creating a brand
// export const createBrand = (brandData) => {
//     return (dispatch) => {
//         dispatch({ type: CREATE_BRAND_REQUEST })
//         axios
//             .post(apiUrl, brandData)
//             .then((response) => {
//                 dispatch({
//                     type: CREATE_BRAND_SUCCESS,
//                     payload: response.data.data,
//                 })
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: CREATE_BRAND_FAILURE,
//                     error: error.message,
//                 })
//             })
//     }
// }

// // Action creators for updating a brand
// export const updateBrand = (id, brandData) => {
//     return (dispatch) => {
//         dispatch({ type: UPDATE_BRAND_REQUEST })
//         axios
//             .patch(`${apiUrl}/${id}`, brandData)
//             .then((response) => {
//                 dispatch({
//                     type: UPDATE_BRAND_SUCCESS,
//                     payload: response.data.data,
//                 })
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: UPDATE_BRAND_FAILURE,
//                     error: error.message,
//                 })
//             })
//     }
// }

// // Action creators for deleting a brand
// export const deleteBrand = (id) => {
//     return (dispatch) => {
//         dispatch({ type: DELETE_BRAND_REQUEST })
//         axios
//             .delete(`${apiUrl}/${id}`)
//             .then((response) => {
//                 dispatch({
//                     type: DELETE_BRAND_SUCCESS,
//                     payload: response.data.data,
//                 })
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: DELETE_BRAND_FAILURE,
//                     error: error.message,
//                 })
//             })
//     }
// }
// actions.js
export const sendDataToProductDetails = (data) => {
    return {
      type: 'SEND_DATA_TO_PRODUCT_DETAILS',
      payload: data,
    };
  };
  