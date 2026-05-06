<template>
  <div class="review-manage">
    <el-card>
      <template #header>
        <span>评价管理</span>
      </template>
      
      <el-table :data="reviews" border>
        <el-table-column prop="id" label="评价ID" width="180" />
        <el-table-column prop="productId" label="商品ID" width="150" />
        <el-table-column prop="userId" label="用户ID" width="150" />
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="scope">
            <el-rate v-model="scope.row.rating" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" />
        <el-table-column prop="createTime" label="评价时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { reviewApi } from "../api/modules";

const reviews = ref([]);

const loadReviews = async () => {
  try {
    const result = await reviewApi.list({});
    if (result.code === 200) {
      reviews.value = result.data || [];
    }
  } catch (e) {
    console.error("加载评价失败:", e);
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该评价吗?", "提示", { type: "warning" });
    const result = await reviewApi.delete({ id: row.id });
    if (result.code === 200) {
      ElMessage.success("删除成功");
      loadReviews();
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

onMounted(() => {
  loadReviews();
});
</script>
