// import {
//     ADD_BRAND,
//     UPLOAD_BRAND_IMAGES,
//     UPDATE_BRAND_LIST,
//     GET_BRAND_LIST,
//     DELETE_BRAND,
//     FETCH_BRANDS_REQUEST,
//     FETCH_BRANDS_SUCCESS,
//     FETCH_BRANDS_FAILURE,
//     // ADD_PRODUCT_TO_CART,
//     // DELETE_PRODUCT_FROM_CART,
//     // GET_CART_LIST,
//     // GET_CATEGORY_LIST,
//     // GET_PRODUCT_LIST,
//     // GET_RATING_LIST,
//     // UPDATE_CART_AMOUNT,
// } from '../actions/EcommerceActions'

// const initialState = {
//     productList: [],
//     cartList: [],
//     categoryList: [],
//     brandList: [],
//     images: '',
//     loading: false,
//     error: null,
// }

// const EcommerceReducer = function (state = initialState, action) {
//     switch (action.type) {
//         case FETCH_BRANDS_REQUEST:
//             return {
//                 ...state,
//                 loading: true,
//                 error: null,
//             }
//         case FETCH_BRANDS_SUCCESS:
//             return {
//                 ...state,
//                 brandList: action.payload,
//                 loading: false,
//             }
//         case FETCH_BRANDS_FAILURE:
//             return {
//                 ...state,
//                 loading: false,
//                 error: action.error,
//             }
//         default:
//             return state
//     }
//     // switch (action.type) {
//     //     case GET_BRAND_LIST: {
//     //         return {
//     //             ...state,
//     //             brandList: [...action.payload],
//     //         }
//     //     }

//     //     case ADD_BRAND: {
//     //         return {
//     //             ...state,
//     //             brandList: [...action.payload],
//     //         }
//     //     }
//     //     case UPLOAD_BRAND_IMAGES: {
//     //         return {
//     //             ...state,
//     //             images: [...action.payload],
//     //         }
//     //     }
//     //     case UPDATE_BRAND_LIST: {
//     //         return {
//     //             ...state,
//     //             brandList: [...action.payload],
//     //         }
//     //     }

//     //     // case DELETE_BRAND: {
//     //     //     console.log(...action.payload)
//     //     //     return {
//     //     //         ...state,
//     //     //         brandList: state.brandList.filter(
//     //     //             (brand) => brand.id !== action.payload.id
//     //     //         ),
//     //     //     }
//     //     // }
//     //     // case ADD_PRODUCT_TO_CART: {
//     //     //     return {
//     //     //         ...state,
//     //     //         cartList: [...action.payload],
//     //     //     }
//     //     // }
//     //     // case DELETE_PRODUCT_FROM_CART: {
//     //     //     return {
//     //     //         ...state,
//     //     //         cartList: [...action.payload],
//     //     //     }
//     //     // }
//     //     // case UPDATE_CART_AMOUNT: {
//     //     //     return {
//     //     //         ...state,
//     //     //         cartList: [...action.payload],
//     //     //     }
//     //     // }
//     //     default: {
//     //         return {
//     //             ...state,
//     //         }
//     //     }
//     // }
// }

// export default EcommerceReducer
