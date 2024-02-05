import axios from 'axios'

const url = axios.create({
    baseURL: 'https://testapi.grozep.com/',
})

const media_Url = axios.create({
    baseURL: 'https://media.grozep.com/',
})

export { url, media_Url }
