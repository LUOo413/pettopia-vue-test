<template>
    <div class="container">
        <!-- 图表部分 -->
        <div class="charts">
            <!-- <div class="chart">
                <h3>性別分布</h3>
                <v-chart :options="pieOptions" />
            </div>
            <div class="chart">
                <h3>年齡分布</h3>
                <v-chart :options="lineOptions" />
            </div> -->

            <!-- 評分圖表 -->
            <div class="chart-container mb-4">
                <canvas id="ratingChart" style="width: 80%; max-width: 800px; margin: auto;"></canvas>
            </div>
        </div>

        <!-- 表格部分 -->
        <div class="table-container">
            <h3>報名會員</h3>
            <table id="reviewsTable" class="table table-bordered table-hover shadow-sm rounded">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>會員ID</th>
                        <th>會員姓名</th>
                        <th>年齡</th>
                        <th>電話</th>
                        <th>mail</th>
                        <th>報名時間</th>
                        <th>報名狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody v-if="registers.length > 0">
                    <tr v-for="(register, index) in registers" :key="register.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ register.member.id }}</td>
                        <td>{{ register.member.name }}</td>
                        <td>{{ calculateAge(register.member.birthdate) }}</td>
                        <td>{{ register.member.phone }}</td>
                        <td>{{ register.member.user.email }}</td>
                        <td>{{ register.registrationTime }}</td>
                        <td>{{ getStatusLabel(register.status) }}</td>
                        <td>
                            <button class="btn btn-primary" v-if="register.status === 'pending'"
                                @click="changeStatus(register.id, 'confirmed')">已確認</button>
                            <button class="btn btn-primary" v-if="register.status === 'pending'"
                                @click="changeStatus(register.id, 'canceled')">取消</button>

                            <button class="btn btn-primary" v-if="register.status === 'confirmed'"
                                @click="changeStatus(register.id, 'canceled')">取消</button>

                            <!-- 只有在取消状态下显示删除按钮 -->
                            <button class="btn btn-danger" v-if="register.status === 'canceled'"
                                @click="deleteRegistration(register.id)">刪除</button>



                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { defineComponent, onMounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const route = useRoute();  // 取得當前路由資訊
import * as echarts from 'echarts';  // 导入 echarts 库
import { Chart as ChartJS, LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import DataTable from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
// 注册比例尺和其他必要的模块
ChartJS.register(LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend);
const registers = ref([])
let dataTable = null
// 初始化 DataTables
const initializeDataTable = () => {
    nextTick(() => {
        if (dataTable) {
            dataTable.destroy()  // 销毁旧实例
        }
        dataTable = new DataTable('#reviewsTable', {
            pageLength: 5, // 每頁顯示 5 筆資料
            lengthMenu: [5, 10, 20, 50],
            searching: true, // 啟用搜尋
            ordering: true,  // 啟用排序
            responsive: true,
            language: {
                search: "搜尋：",
                lengthMenu: "顯示 _MENU_ 筆資料",
                info: "顯示第 _START_ 筆到第 _END_ 筆，共 _TOTAL_ 筆",
                paginate: {
                    first: "首頁",
                    previous: "上一頁",
                    next: "下一頁",
                    last: "最後一頁"
                }
            }
        })
    })
}

const fetchRegistration = async () => {
    const activityId = route.params.id;
    axios.get(`http://localhost:8080/api/vendor_admin/activity/registration?activityId=${activityId}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log('獲取的活動報名:', response.data);  // 應該是評論數組
            registers.value = response.data;
            console.log(registers.value);

            nextTick(() => {
                initializeDataTable();  // 重新初始化 DataTable
            });
            // 确保数据加载完成后再计算和更新图表
            // calculateOverallRating();  // 更新总评分
            // updateChart();             // 更新图表
            // updateReviews();
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

// 計算年齡的函數
const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;  // 如果還沒過生日，減一歲
    }
    return age;
}

const changeStatus = async (registerId, targetStatus) => {
    console.log(targetStatus)
    try {
        const response = await axios.put(`http://localhost:8080/api/vendor_admin/activity/confirmById/${registerId}`, {

        });

        // 更新本地状态
        const updatedRegister = registers.value.find(register => register.id === registerId);
        if (updatedRegister) {
            updatedRegister.status = targetStatus;
        }
    } catch (error) {
        console.error('更新狀態失敗:', error);
    }
}

const deleteRegistration = async (registerId) => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/vendor_admin/registration/${registerId}`);
        console.log("刪除成功:", response.data);
        // 这里可以根据需要，重新拉取数据，更新界面
        fetchRegistration();  // 重新加载报名数据
    } catch (error) {
        console.error("刪除失败:", error);
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'pending':
            return '待審核';
        case 'confirmed':
            return '已確認';
        case 'canceled':
            return '取消';
    }
}

onMounted(async () => {
    await fetchRegistration()
    nextTick(() => {
        setTimeout(() => {
            initializeDataTable();  // 稍微延迟初始化 DataTable
        }, 100);  // 延迟 100 毫秒再初始化
    });
})
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

th {
    background-color: #F4D8B1 !important;
}

table th {
    background-color: #f4f4f4;
}

table tbody tr:hover {
    background-color: #f0f0f0;
}
</style>
