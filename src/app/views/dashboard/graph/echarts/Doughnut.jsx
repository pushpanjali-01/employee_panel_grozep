import { useTheme } from '@mui/system'
import ReactEcharts from 'echarts-for-react'
import { useEffect, useState } from 'react'
import { url } from 'app/constants'

const DoughnutChart = ({ height, color = [] }) => {
    const [brandList, setBrandList] = useState([])
    const [CategoryList, setCategoryList] = useState([])
    const [SubCategoryList, setSubCategoryList] = useState([])
    const theme = useTheme()
    useEffect(() => {
        url.get('v1/in/brands').then((response) => {
            if (response.data.status === true) {
                setBrandList(response.data.data)
            }
        })
        url.get('v1/in/categories').then((response) => {
            if (response.data.status === true) {
                setCategoryList(response.data.data)
            }
        })
        url.get('v1/in/subcategories')
            .then((response) => {
                if (response.data.status === true) {
                    setSubCategoryList(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])
    const option = {
        legend: {
            show: true,
            itemGap: 20,
            icon: 'circle',
            bottom: 0,
            textStyle: {
                color: theme.palette.text.secondary,
                fontSize: 13,
            },
        },
        tooltip: {
            show: true,
            trigger: 'item',
        },
        xAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
        yAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],

        series: [
            {
                name: 'Data',
                type: 'pie',
                radius: ['45%', '72.55%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                hoverOffset: 5,
                stillShowZeroSum: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center', // shows the description data to center, turn off to show in right side
                        textStyle: {
                            color: theme.palette.text.secondary,
                            fontSize: 13,
                        },
                        formatter: '{a}',
                    },
                    emphasis: {
                        show: true,
                        textStyle: { fontSize: '14', fontWeight: 'normal' },
                    },
                },
                labelLine: { normal: { show: false } },
                data: [
                    { value: brandList.length, name: 'Brand' },
                    { value: CategoryList.length, name: 'Category' },
                    { value: SubCategoryList.length, name: 'Subcategory' },
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    }

    return (
        <ReactEcharts
            style={{ height: height }}
            option={{ ...option, color: [...color] }}
        />
    )
}

export default DoughnutChart
