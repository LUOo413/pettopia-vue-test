<template>
    <div class="container">
        <!-- 图表部分 -->
        <div class="charts">
            <div class="chart">
                <h3>报名人数分布</h3>
                <v-chart :options="pieOptions" />
            </div>
            <div class="chart">
                <h3>报名人数增长趋势</h3>
                <v-chart :options="lineOptions" />
            </div>

            <!-- 評分圖表 -->
            <div class="chart-container mb-4">
                <canvas id="ratingChart" style="width: 80%; max-width: 800px; margin: auto;"></canvas>
            </div>
        </div>

        <!-- 表格部分 -->
        <div class="table-container">
            <h3>报名人员列表</h3>
            <table>
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>年龄</th>
                        <th>活动名称</th>
                        <th>报名时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(person, index) in participants" :key="index">
                        <td>{{ person.name }}</td>
                        <td>{{ person.age }}</td>
                        <td>{{ person.activity }}</td>
                        <td>{{ person.registeredAt }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { defineComponent } from 'vue';
import VChart from 'vue-echarts';  // 确保正确导入 vue-echarts
import * as echarts from 'echarts';  // 导入 echarts 库
import { Chart as ChartJS, LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// 注册比例尺和其他必要的模块
ChartJS.register(LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend);

const fetchRegistration = () => {
    axios.get('http://localhost:8080/api/vendor_admin/review?vendorId=1', {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log('獲取的評論資料:', response.data);  // 應該是評論數組
            ratingsData.value.reviews = response.data;
            // 确保数据加载完成后再计算和更新图表
            calculateOverallRating();  // 更新总评分
            updateChart();             // 更新图表
            updateReviews();
        })
        .catch(error => {
            console.error('獲取評論資料失敗:', error);
        });
}


const updateChart = () => {
    const ctx = document.getElementById('ratingChart').getContext('2d')
    if (myChart) myChart.destroy()

    const avgEnv = (ratingsData.value.reviews.reduce((sum, r) => sum + r.ratingEnvironment, 0) / ratingsData.value.reviews.length).toFixed(1);
    const avgPrice = (ratingsData.value.reviews.reduce((sum, r) => sum + r.ratingPrice, 0) / ratingsData.value.reviews.length).toFixed(1);
    const avgService = (ratingsData.value.reviews.reduce((sum, r) => sum + r.ratingService, 0) / ratingsData.value.reviews.length).toFixed(1);
    const avgOverall = overallRating.value
    console.log(avgEnv)
    console.log(ratingsData.value.reviews)
    myChart = new ChartJS(ctx, {
        type: 'bar',
        data: {
            labels: ['環境', '價格', '服務', '總平均評分'],
            datasets: [{
                label: '平均評分',
                data: [avgEnv, avgPrice, avgService, avgOverall],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 5 }
            }
        }
    })
}
// 假数据：圆饼图的数据
const pieOptions = {
    tooltip: {
        trigger: 'item',
    },
    legend: {
        orient: 'vertical',
        left: 'left',
    },
    series: [
        {
            name: '报名情况',
            type: 'pie',
            radius: '50%',
            data: [
                { value: 70, name: '已报名' },
                { value: 30, name: '未报名' },
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
        },
    ],
};

// 假数据：直线图的数据（模拟报名人数的增长）
const lineOptions = {
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            label: {
                show: true,
            },
            data: [50, 80, 120, 150, 200, 250],
            type: 'line',
            borderColor: '#4bc0c0',
            fill: false,
            smooth: true,
        },
    ],
};

// 假数据：报名人员的列表
const participants = [
    { name: '张三', age: 25, activity: '跑步比赛', registeredAt: '2025-03-01' },
    { name: '李四', age: 30, activity: '羽毛球比赛', registeredAt: '2025-03-02' },
    { name: '王五', age: 22, activity: '游泳比赛', registeredAt: '2025-03-03' },
    { name: '赵六', age: 28, activity: '篮球比赛', registeredAt: '2025-03-04' },
];
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.charts {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.chart {
    width: 45%;
}

.table-container {
    margin-top: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

table th,
table td {
    padding: 10px;
    text-align: center;
    border: 1px solid #ddd;
}

table th {
    background-color: #f4f4f4;
}

table tbody tr:hover {
    background-color: #f0f0f0;
}
</style>
