<template>
  <div class="content-body">
    <div class="container">
      <FullCalendar ref="calendar" :options="calendarOptions" class="calender" />
      <div v-if="showEventModal, showEditEventModal" id="modal-overlay" @click="closeEventModal"></div>
      <!-- Edit Event Modal -->
      <div v-show="showEditEventModal" id="event-modal">
        <h3>編輯活動</h3>
        <label for="edit-event-title">活動:</label>
        <input type="text" v-model="editEventTitle" id="edit-event-title" />
        <hr />
        <label for="edit-event-start-date">開始日期:</label>
        <input type="date" v-model="editEventStartDate" id="edit-event-start-date" />
        <input type="time" v-model="editEventStartTime" id="edit-event-start-time" />
        <hr />
        <label for="edit-event-end-date">結束日期:</label>
        <input type="date" v-model="editEventEndDate" id="edit-event-end-date" />
        <input type="time" v-model="editEventEndTime" id="edit-event-end-time" />
        <hr />
        <label for="edit-event-color">顏色:</label>
        <input type="color" v-model="editEventColor" id="edit-event-color" />
        <input type="hidden" v-model="editEventId" id="edit-event-id" />
        <hr />
        <button @click="updateEvent" class="btn btn-outline-primary">更新</button>
        <button @click="deleteEvent" class="btn btn-outline-primary">刪除</button>
        <button @click="closeEditEventModal" class="btn btn-outline-primary">取消</button>
      </div>

      <!-- 新增活動 Modal -->
      <div v-if="showEventModal" id="event-modal">
        <h3>新增活動</h3>
        <label for="event-title">活動:</label>
        <input type="text" v-model="eventTitle" id="event-title" placeholder="活動名稱" />
        <hr />
        <label for="event-start-date">開始日期:</label>
        <input type="date" v-model="eventStartDate" id="event-start-date" />
        <input type="time" v-model="eventStartTime" id="event-start-time" />
        <hr />
        <label for="event-end-date">結束日期:</label>
        <input type="date" v-model="eventEndDate" id="event-end-date" />
        <input type="time" v-model="eventEndTime" id="event-end-time" />
        <hr />
        <label for="event-color">顏色:</label>
        <input type="color" v-model="eventColor" id="event-color" />
        <hr />
        <button @click="addEvent" class="btn btn-outline-primary">新增</button>
        <button @click="closeAddEventModal" class="btn btn-outline-primary">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

const vendorId = 1
const calendar = ref(null);
const showEventModal = ref(false);
const showEditEventModal = ref(false);
const events = ref([]);
const eventTitle = ref('');
const eventStartDate = ref('');
const eventStartTime = ref('');
const eventEndDate = ref('');
const eventEndTime = ref('');
const eventColor = ref('#ffffff');

const editEventTitle = ref('');
const editEventStartDate = ref('');
const editEventStartTime = ref('');
const editEventEndDate = ref('');
const editEventEndTime = ref('');
const editEventColor = ref('#ffffff');
const editEventId = ref(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, resourceTimelinePlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  eventOverlap: false,
  events: events.value,
  eventDidMount: (info) => {
    console.log(info.event); // 调试：查看事件是否正确渲染
  },
  select: (info) => {
    eventStartDate.value = formatDate(info.start);
    eventStartTime.value = info.start.toISOString().substr(11, 5); // 使用選擇的開始時間
    eventEndDate.value = formatDate(info.end ? new Date(info.end - 1) : info.start);
    eventEndTime.value = info.end ? info.end.toISOString().substr(11, 5) : info.start.toISOString().substr(11, 5); // 設定結束時間
    showEventModal.value = true;
  },
  eventClick: (info) => {
    editEventId.value = info.event.id;
    editEventTitle.value = info.event.title;
    editEventStartDate.value = formatDate(info.event.start);
    editEventStartTime.value = info.event.start.toISOString().substr(11, 5); // 提取開始時間的 HH:mm
    editEventEndDate.value = info.event.end ? formatDate(info.event.end) : editEventStartDate.value;
    editEventEndTime.value = info.event.end ? info.event.end.toISOString().substr(11, 5) : '13:00'; // 結束時間
    editEventColor.value = info.event.backgroundColor;
    showEditEventModal.value = true;

  }
});

const loadEvents = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/vendor_admin/calender/${vendorId}`);
    const events = response.data; // 假设后端返回的事件数据是一个数组

    const calendarApi = calendar.value?.getApi();
    if (calendarApi) {
      events.forEach(event => {
        calendarApi.addEvent({
          title: event.eventTitle,
          start: event.startTime, // 確保格式正確
          end: event.endTime,
          backgroundColor: event.color || "#ffffff"
        });
      });
    }
  } catch (error) {
    console.error("获取活动失败", error);
  }
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addEvent = async () => {
  if (!eventTitle.value || !eventStartDate.value || !eventStartTime.value) {
    alert("請填寫完整的活動名稱與開始時間");
    return;
  }

  const formData = new FormData();
  formData.append("vendorId", 1);  // 你需要用正確的 vendor_id
  formData.append("eventTitle", eventTitle.value);
  formData.append("start_time", `${eventStartDate.value}T${eventStartTime.value}`);
  formData.append("end_time", eventEndDate.value && eventEndTime.value
    ? `${eventEndDate.value}T${eventEndTime.value}`
    : `${eventStartDate.value}T${eventStartTime.value}`);
  formData.append("color", eventColor.value);  // 发送颜色;
  try {
    const response = await axios.post("http://localhost:8080/api/vendor_admin/calender/add", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',  // 发送表单数据时需要设置此头部
      },
    });

    if (response.status === 201) {
      alert("活動新增成功！");

      events.value = [];

      // 你可以根据需要在日历中添加新事件
      const savedEvent = response.data;
      // **直接更新 FullCalendar**
      const calendarApi = calendar.value.getApi();
      calendarApi.addEvent({
        title: savedEvent.eventTitle,
        start: savedEvent.start_time,
        end: savedEvent.end_time,
        backgroundColor: savedEvent.color || "#ffffff",
      });

      // **手動更新 `events.value` (可選)**
      events.value.push({
        title: savedEvent.eventTitle,
        start: savedEvent.start_time,
        end: savedEvent.end_time,
        backgroundColor: savedEvent.color || "#ffffff",
      });

      console.log(savedEvent);

      calendarApi.refetchEvents();
      clearEventForm();
      showEventModal.value = false;
      events.value = [];
      loadEvents()
      // await fetchEvents();
    }
  } catch (error) {
    console.error("新增活動失敗", error);
    alert("新增活動失敗");
  }
};



const updateEvent = () => {
  const calendarApi = calendar.value?.getApi();
  if (!calendarApi) return;

  const event = calendarApi.getEventById(editEventId.value);
  if (event) {
    event.setProp("title", editEventTitle.value);
    event.setStart(`${editEventStartDate.value}T${editEventStartTime.value}`);
    event.setEnd(`${editEventEndDate.value}T${editEventEndTime.value}`);
    event.setProp("backgroundColor", editEventColor.value);
  }

  clearEditEventForm();
  showEditEventModal.value = false;
};

const deleteEvent = () => {
  const calendarApi = calendar.value?.getApi();
  if (!calendarApi) return;

  const event = calendarApi.getEventById(editEventId.value);
  if (event) {
    event.remove();
  }

  clearEditEventForm();
  showEditEventModal.value = false;
};

const closeEditEventModal = () => {
  clearEditEventForm();
  showEditEventModal.value = false;
};

const closeAddEventModal = () => {
  clearEventForm();
  showEventModal.value = false;
};

const clearEventForm = () => {
  eventTitle.value = "";
  eventStartDate.value = "";
  eventStartTime.value = "";
  eventEndDate.value = "";
  eventEndTime.value = "";
  eventColor.value = "#ffffff";
};

const clearEditEventForm = () => {
  editEventTitle.value = "";
  editEventStartDate.value = "";
  editEventStartTime.value = "";
  editEventEndDate.value = "";
  editEventEndTime.value = "";
  editEventColor.value = "#ffffff";
  editEventId.value = null;
};

onMounted(async () => {
  // fetchEvents()
  const events = await loadEvents();
  calendarOptions.value.events = events;
});
</script>


<style scoped>
#event-modal {
  position: fixed;
  /* 固定位置 */
  top: 10%;
  /* 距離畫面上方 10% */
  left: 50%;
  transform: translate(-50%, 0);
  /* 讓模態框水平居中 */
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 400px;
  z-index: 1000;
  text-align: center;
  /* 讓內容置中 */
}

/* 遮罩層，當顯示 Modal 時，背景變暗 */
#modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  /* 半透明黑色背景 */
  z-index: 999;
}

/* 讓按鈕好看一點 */
button {
  margin: 5px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.fc-event {
  font-size: 14px;
  padding: 2px;
  border-radius: 4px;
}

.calender {
  width: 80%;
  /* 設置行事曆的寬度 */
  margin: 0 auto;
  /* 使用自動邊距來水平居中 */
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
  /* 垂直居中 */
}

.content-body {
  display: flex;
  justify-content: center;
  /* 水平居中整個內容 */
}
</style>
