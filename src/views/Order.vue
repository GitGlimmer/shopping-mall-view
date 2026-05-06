<template>
  <div class="order-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="dialogVisible = true">创建订单</el-button>
        </div>
      </template>
      
      <el-table :data="orders" border>
        <el-table-column prop="id" label="订单ID" width="180" />
        <el-table-column prop="userId" label="用户ID" width="150" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" title="创建订单" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="form.userId" />
        </el-form-item>
        <el-form-item label="商品ID">
          <el-input v-model="form.productId" />
        </el-form-item>
        <el-form-item label="商品数量">
          <el-input-number v-model="form.quantity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { orderApi } from "../api/modules";

const orders = ref([]);
const dialogVisible = ref(false);
const form = ref({
  userId: "",
  productId: "",
  quantity: 1,
});

const getStatusType = (status) => {
  const types = {
    PENDING: "warning",
    PAID: "success",
    SHIPPED: "primary",
    COMPLETED: "success",
    CANCELLED: "info",
  };
  return types[status] || "info";
};

const getStatusText = (status) => {
  const texts = {
    PENDING: "待支付",
    PAID: "已支付",
    SHIPPED: "已发货",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return texts[status] || status;
};

const handleCreate = async () => {
  try {
    const result = await orderApi.create(form.value);
    if (result.code === 200) {
      ElMessage.success("订单创建成功");
      dialogVisible.value = false;
    } else {
      ElMessage.error(result.message || "创建失败");
    }
  } catch (e) {
    ElMessage.error("创建失败");
  }
};

onMounted(() => {
  // Load orders if API available
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
