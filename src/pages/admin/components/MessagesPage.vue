<template>
  <div class="page-content">
    <div class="page-header">
      <h2 class="page-title">留言管理</h2>
      <p class="page-subtitle">管理所有的留言内容</p>
    </div>

    <el-card shadow="hover" class="h-full flex flex-col">
      <template #header>
        <div class="card-header">
          <span>留言列表</span>
          <div class="filters">
            <el-input
              v-model="filter.form.keyword"
              placeholder="搜索留言内容..."
              clearable
              style="width: 220px"
            />
            <el-select
              v-model="filter.form.status"
              placeholder="状态"
              clearable
              style="width: 120px"
            >
              <el-option label="已审核" value="approved" />
              <el-option label="待审核" value="pending" />
            </el-select>
            <el-button type="primary" @click="handleFetch">查询</el-button>
            <el-button plain @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredMessages" stripe v-loading="loading">
        <el-table-column label="头像" width="70">
          <template #default="scope">
            <div
              v-if="scope.row.avatar"
              class="avatar-html"
              v-html="scope.row.avatar"
            ></div>
            <el-avatar :size="36" v-else>{{
              scope.row.name?.slice(0, 1) || "访"
            }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="留言者"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="200"
        ></el-table-column>
        <el-table-column
          prop="content"
          label="内容"
          min-width="320"
        ></el-table-column>
        <el-table-column prop="browser" label="浏览器" width="160">
          <template #default="scope">
            <span class="info-cell">
              <Globe class="info-icon" />
              {{ scope.row.browser || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="os" label="操作系统" width="160">
          <template #default="scope">
            <span class="info-cell">
              <component :is="getOsIcon(scope.row.os)" class="info-icon" />
              {{ scope.row.os || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceType" label="设备" width="120">
          <template #default="scope">
            <span class="info-cell">
              <component
                :is="getDeviceIcon(scope.row.deviceType)"
                class="info-icon"
              />
              {{ scope.row.deviceType || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="定位" width="200">
          <template #default="scope">
            <span class="info-cell">
              <MapPin class="info-icon" />
              {{ formatLocation(scope.row.location) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'approved' ? 'success' : 'warning'"
            >
              {{ scope.row.status === "approved" ? "已审核" : "待审核" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleView(scope.row)"
              >查看</el-button
            >
            <el-button
              link
              type="success"
              size="small"
              :disabled="scope.row.status === 'approved'"
              @click="handleApprove(scope.row)"
              >审核通过</el-button
            >
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="filter.form.page"
          v-model:page-size="filter.form.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleFetch"
          @current-change="handleFetch"
        />
      </div>
    </el-card>

    <el-drawer v-model="drawerVisible" title="留言详情" size="40%">
      <div class="detail">
        <div><strong>留言者：</strong>{{ currentRow?.name }}</div>
        <div><strong>邮箱：</strong>{{ currentRow?.email }}</div>
        <div><strong>网站：</strong>{{ currentRow?.website || "-" }}</div>
        <div><strong>浏览器：</strong>{{ currentRow?.browser || "-" }}</div>
        <div><strong>操作系统：</strong>{{ currentRow?.os || "-" }}</div>
        <div>
          <strong>设备类型：</strong>{{ currentRow?.deviceType || "-" }}
        </div>
        <div><strong>IP：</strong>{{ currentRow?.ip || "-" }}</div>
        <div>
          <strong>定位：</strong>{{ formatLocation(currentRow?.location) }}
        </div>
        <div>
          <strong>时间：</strong>{{ formatDate(currentRow?.createdAt) }}
        </div>
        <div class="detail-content">
          <strong>内容：</strong>{{ currentRow?.content }}
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/api/request";
import { useMessageFilterForm } from "@/composables/useMessageFilterForm";
import { useTableFetch } from "@/composables/useTableFetch";
import {
  Globe,
  Monitor,
  Smartphone,
  MapPin,
  Apple,
  Laptop,
} from "lucide-vue-next";

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  website?: string;
  avatar?: string;
  content: string;
  status: "approved" | "pending";
  createdAt: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  ip?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    isp?: string;
  };
}

const filter = useMessageFilterForm();
const {
  data: messages,
  total,
  loading,
  fetch: fetchMessages,
} = useTableFetch<MessageItem, Record<string, any>>((params) =>
  request.get("/admin/messages", { params }),
);
const drawerVisible = ref(false);
const currentRow = ref<MessageItem | null>(null);

const filteredMessages = computed(() => {
  const keyword = filter.form.keyword.trim();
  if (!keyword) return messages.value;
  return messages.value.filter((item) => item.content?.includes(keyword));
});

const handleFetch = async () => {
  try {
    await fetchMessages(filter.toParams());
  } catch (error: any) {
    ElMessage.error(error?.message || "加载留言失败");
  }
};

const handleReset = () => {
  filter.reset();
  handleFetch();
};

const handleView = (row: MessageItem) => {
  currentRow.value = row;
  drawerVisible.value = true;
};

const handleApprove = async (row: MessageItem) => {
  try {
    await ElMessageBox.confirm("确认审核通过该留言吗？", "提示", {
      type: "warning",
    });
    await request.patch(`/admin/messages/${row._id}/approve`);
    ElMessage.success("已审核");
    handleFetch();
  } catch (error: any) {
    if (error?.message) ElMessage.error(error.message);
  }
};

const handleDelete = async (row: MessageItem) => {
  try {
    await ElMessageBox.confirm("确认删除该留言吗？此操作不可恢复。", "提示", {
      type: "warning",
    });
    await request.delete(`/admin/messages/${row._id}`);
    ElMessage.success("已删除");
    handleFetch();
  } catch (error: any) {
    if (error?.message) ElMessage.error(error.message);
  }
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatLocation = (location?: MessageItem["location"]) => {
  if (!location) return "-";
  const parts = [location.country, location.region, location.city].filter(
    Boolean,
  );
  return parts.length ? parts.join(" / ") : "-";
};

const getOsIcon = (os?: string) => {
  const value = (os || "").toLowerCase();
  if (value.includes("mac") || value.includes("os x") || value.includes("ios"))
    return Apple;
  if (value.includes("windows") || value.includes("win")) return Laptop;
  return Monitor;
};

const getDeviceIcon = (device?: string) => {
  const value = (device || "").toLowerCase();
  if (value.includes("mobile") || value.includes("phone")) return Smartphone;
  if (value.includes("desktop") || value.includes("pc")) return Monitor;
  return Monitor;
};

onMounted(() => {
  handleFetch();
});
</script>

<style scoped lang="scss">

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  color: #1f2937;
}

.avatar-html {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.avatar-html :deep(svg) {
  width: 36px;
  height: 36px;
}

.info-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  width: 14px;
  height: 14px;
  color: #6b7280;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}

.detail-content {
  white-space: pre-wrap;
}

:deep(.el-table .cell),
:deep(.el-table__body-wrapper .cell) {
  white-space: normal !important;
  word-break: break-word;
}

:deep(.el-table__body td) {
  white-space: normal;
}

:deep(.el-table__fixed-right) {
  background: #ffffff;
}

.dark :deep(.el-table__fixed-right) {
  background: #111827;
}
</style>
