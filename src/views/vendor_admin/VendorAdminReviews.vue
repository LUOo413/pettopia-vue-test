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
          <input type="text" v-model="searchQuery" class="form-control" placeholder="搜尋評價內容..."
            @input="searchReviews" />
        </div>

        <!-- 評價表格 -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover shadow-sm rounded">
            <thead class="text-light">
              <tr>
                <th>評論者</th>
                <th>評價時間</th>
                <th>評價內容</th>
                <th>平均評分</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="reviewsTable">
              <tr v-for="(review, index) in filteredReviews" :key="review.id" @click="toggleReviewDetails(review)">
                <td>{{ review.memberId }}</td>
                <td>{{ formatReviewDate(review.reviewTime) }}</td>
                <td>{{ review.reviewContent }}</td>
                <td>⭐ ({{ calculateAverageRating(review) }})</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteReview($event, review.id)">刪除</button>
                </td>
              </tr>

            </tbody>
          </table>

          <!-- 評論詳情卡片 -->
          <div v-if="reviewDetailVisible" class="review-card">
            <div class="card">
              <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0">評論詳情</h5>
                <button class="btn-close" @click="reviewDetailVisible = false"></button>
              </div>
              <div class="card-body">
                <p><strong>環境評分：</strong> {{ generateStars(Math.round(selectedReview.ratingEnvironment)) }} ({{
                  selectedReview.ratingEnvironment }})</p>
                <p><strong>價格評分：</strong> {{ generateStars(Math.round(selectedReview.ratingPrice)) }} ({{
                  selectedReview.ratingPrice }})</p>
                <p><strong>服務評分：</strong> {{ generateStars(Math.round(selectedReview.ratingService)) }} ({{
                  selectedReview.ratingService }})</p>
                <hr>
                <div class="photo-container">
                  <img v-for="photoId in reviewPhotos" :key="photoId"
                    :src="`http://localhost:8080/review_photos/download?photoId=${photoId}`" alt="Review Photo"
                    class="review-photo" @click="showPhotoModal(photoId)">
                </div>
              </div>
            </div>
          </div>
          <!-- 圖片放大模態視窗 -->
          <div v-if="photoModalVisible" class="photo-modal" @click="photoModalVisible = false">
            <div class="photo-modal-content">
              <img :src="selectedPhoto" alt="Full Image">
            </div>
          </div>
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

const reviewDetailVisible = ref(false) // 控制卡片是否顯示
const selectedReview = ref(null)       // 存儲當前選中的評論
const reviewPhotos = ref([])           // 存儲評論的照片列表
const photoModalVisible = ref(false)
const selectedPhoto = ref('')
const ratingsData = ref({ reviews: [] })
const searchQuery = ref('')
const overallRating = ref('-')
let myChart = null
let dataTable = null

const showPhotoModal = (photoId) => {
  selectedPhoto.value = `http://localhost:8080/review_photos/download?photoId=${photoId}`
  photoModalVisible.value = true
}

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

// 切換評論詳情顯示
const toggleReviewDetails = (review) => {
  if (selectedReview.value && selectedReview.value.id === review.id) {
    reviewDetailVisible.value = false // 如果已打開，則關閉
    selectedReview.value = null
    reviewPhotos.value = []
    return
  }

  // 設置當前選中的評論
  selectedReview.value = review
  reviewDetailVisible.value = true

  // 獲取評論照片
  axios.get(`http://localhost:8080/review_photos/ids?vendorReviewId=${review.id}`, {
    headers: { 'Accept': 'application/json' }
  })
    .then(response => {
      reviewPhotos.value = response.data
    })
    .catch(error => {
      console.error('獲取評論照片失敗:', error)
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

.review-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  z-index: 1050;

  border-radius: 12px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

th {
  background-color: #F4D8B1 !important;
}

.card-header {
  background: #F4D8B1 !important;
  color: rgb(0, 1, 3) !important;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: 20px;
  font-size: 16px;
}

.photo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.review-photo {
  max-width: 100px;
  max-height: 100px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.review-photo:hover {
  transform: scale(1.1);
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: white;
}

.btn-close:hover {
  color: #ffcccc;
}

/* 圖片放大模態視窗 */
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.photo-modal-content img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
}
</style>