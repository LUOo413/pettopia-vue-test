<template>
    <div id="main-wrapper">
      <div class="content-body">
        <div class="container mt-4">
          <h4>
            總平均評分: <span id="overallRating" class="text-primary fw-bold">{{ overallRating }}</span>
          </h4>
  
          <!-- 評分圖表 -->
          <div class="chart-container mb-4">
            <canvas id="ratingChart" style="width: 80%; max-width: 800px; margin: auto;"></canvas>
          </div>
  
          <!-- 搜尋欄 -->
          <div class="mb-3">
            <input type="text" v-model="searchQuery" class="form-control" placeholder="搜尋評價內容..." @input="searchReviews" />
          </div>
  
          <!-- 評價表格 -->
          <div class="table-responsive">
            <table class="table table-bordered table-hover shadow-sm rounded">
              <thead class="table-dark text-light">
                <tr>
                  <th>評論者</th>
                  <th>評價時間</th>
                  <th>評價內容</th>
                  <th>平均評分</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="reviewsTable">
                <tr v-for="(review, index) in filteredReviews" :key="review.id" @click="toggleReviewDetails(index, review)">
                  <td>{{ review.memberId }}</td>
                  <td>{{ formatReviewDate(review.reviewTime) }}</td>
                  <td>{{ review.reviewContent }}</td>
                  <td>⭐ ({{ calculateAverageRating(review) }})</td>
                  <td>
                    <button class="btn btn-danger btn-sm" @click="deleteReview($event, review.id)">刪除</button>
                  </td>
                </tr>
                <tr v-for="(review, index) in ratingsData" :data-index="index" :key="review.id">
  <!-- 这里是评论内容 -->
</tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'
 // 导入 Chart.js 所需模块
import { Chart as ChartJS, LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import DataTable from 'datatables.net-dt';
// 注册比例尺和其他必要的模块
ChartJS.register(LinearScale, BarController, BarElement, CategoryScale, Title, Tooltip, Legend);

  
  const ratingsData = ref({ reviews: [] })
  const searchQuery = ref('')
  const overallRating = ref('-')
  let myChart = null
  let dataTable = null
  // 計算平均評分
  const calculateAverageRating = (review) => {
    const avgRating = ((review.ratingEnvironment + review.ratingPrice + review.ratingService) / 3).toFixed(1)
    return avgRating
  }
  
  // 計算總平均評分
  const calculateOverallRating = () => {
    let total = 0, count = ratingsData.value.reviews.length
    ratingsData.value.reviews.forEach(r => total += (r.ratingEnvironment + r.ratingPrice + r.ratingService) / 3)
    overallRating.value = count ? (total / count).toFixed(1) : '-'
    console.log(overallRating.value)
  }
  
  // 更新評價圖表
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
  
  // 更新評價表格
  const updateReviews = () => {
    ratingsData.value.reviews.forEach((review, index) => {
      review.avgRating = calculateAverageRating(review)
    })
  }
  
  // 搜尋功能
  const searchReviews = () => {
    const keyword = searchQuery.value.trim().toLowerCase()
    filteredReviews.value = ratingsData.value.reviews.filter(review => {
      const reviewText = `${review.memberId} ${formatReviewDate(review.reviewTime)} ${review.reviewContent} ${calculateAverageRating(review)}`.toLowerCase()
      return reviewText.includes(keyword)
    })
  }
  
  // 格式化日期
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? '下午' : '上午'
  
    hours = hours % 12
    hours = hours ? hours : 12
  
    return `${year}年${month}月${day}日 ${period} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`
  }
  
  // 刪除評論
  const deleteReview = (event, reviewId) => {
    event.stopPropagation()
    if (!confirm("確定要刪除此評論嗎？")) return
  
    axios.delete(`http://localhost:8080/api/vendor_admin/review/delete/${reviewId}`)
      .then(() => {
        alert("刪除成功")
        fetchReviews()
      })
      .catch(() => {
        alert("刪除評論失敗")
      })
  }
  
  // 切換評論細節
const toggleReviewDetails = (index, review) => {
  let existingDetailRow = $(`#reviewsTable tr[data-index="${index}"]`).next('.review-detail-row')

  // 如果详情已经存在，删除它
  if (existingDetailRow.length > 0) {
    existingDetailRow.remove()
    return
  }

  // 如果详情不存在，插入详情行
  axios.get(`http://localhost:8080/review_photos/ids?vendorReviewId=${review.id}`, {
    headers: { 'Accept': 'application/json' }
  })
    .then(response => {
      const photoIds = response.data
      let photoHtml = ''
      photoIds.forEach(photoId => {
        photoHtml += `<img src="http://localhost:8080/review_photos/download?photoId=${photoId}" alt="Review Photo" style="max-width: 100px; max-height: 100px; margin: 5px;" loading="lazy">`
      })

      const detailRowHtml = `
        <tr class="review-detail-row">
          <td colspan="5">
            <div class="review-detail">
              <strong>環境評分：</strong> ${generateStars(Math.round(review.ratingEnvironment))}(${review.ratingEnvironment})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>價格評分：</strong> ${generateStars(Math.round(review.ratingPrice))}(${review.ratingPrice})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>服務評分：</strong> ${generateStars(Math.round(review.ratingService))} (${review.ratingService})
            </div>
            <div class="review-detail">
              ${photoHtml}
            </div>
          </td>
        </tr>
      `

      // 使用 DataTable 插件动态插入新行
      const row = $(`#reviewsTable tr[data-index="${index}"]`)
      row.after(detailRowHtml)

      // 重新初始化 DataTable（如果已经初始化）
      if (dataTable) {
        dataTable.clear().destroy()
      }

      dataTable = $('#reviewsTable').DataTable()  // 重新激活 DataTable 插件
    })
    .catch(error => {
      console.error('获取评论照片失败:', error)
    })
}
  
  // 生成星級顯示
  const generateStars = (rating) => {
    let stars = ''
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '⭐ ' : ' '
    }
    return stars
  }
  
  // 獲取評論資料
  const fetchReviews = () => {
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
  
  onMounted(() => {
    fetchReviews()
    calculateOverallRating()
    updateChart()
    updateReviews()
  })
  
  const filteredReviews = computed(() => ratingsData.value.reviews.filter(review => {
    const keyword = searchQuery.value.trim().toLowerCase()
    const memberId = String(review.memberId)
    return memberId.toLowerCase().includes(keyword) || review.reviewContent.toLowerCase().includes(keyword)
  }))
  </script>
  

    
<style>
    .table-hover tbody tr:hover {
	background-color: #f8f9fa;
	cursor: pointer;
}

.review-detail {
	background: #fdfdfd;
	border-left: 5px solid #007bff;
	padding: 10px;
	margin-top: 5px;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.star {
	color: gold;
	font-size: 1.2em;
}

h4 {
	text-align: center;
}
</style>