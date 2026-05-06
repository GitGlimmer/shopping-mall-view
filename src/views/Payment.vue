<template>
  <div class="payment-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付管理</span>
          <el-button type="primary" @click="dialogVisible = true">发起支付</el-button>
        </div>
      </template>
      
      <el-table :data="payments" border>
        <el-table-column prop="id" label="支付ID" width="180" />
        <el-table-column prop="orderId" label="订单ID" width="180" />
        <el-table-column prop="amount" label="支付金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100" />
        <el-table-column prop="status" label="支付状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" title="发起支付" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="订单ID">
          <el-input v-model="form.orderId" />
        </el-form-item>
        <el-form-item label="支付金额">
          <el-input-number v-model="form.amount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="form.paymentMethod">
            <el-option label="微信支付" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="银行卡" value="BANK_CARD" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePay">确定支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { paymentApi } from "../api/modules";

const payments = ref([]);
const dialogVisible = ref(false);
const form = ref({
  orderId: "",
  amount: 0,
  paymentMethod: "WECHAT",
});

const getStatusType = (status) => {
  const types = { PENDING: "warning", SUCCESS: "success", FAILED: "danger" };
  return types[status] || "info";
};

const getStatusText = (status) => {
  const texts = { PENDING: "待支付", SUCCESS: "支付成功", FAILED: "支付失败" };
  return texts[status] || status;
};

const handlePay = async () => {
  try {
    const result = await paymentApi.create(form.value);
    if (result.code === 200) {
      ElMessage.success("支付发起成功");
      dialogVisible.value = false;
    } else {
      ElMessage.error(result.message || "支付失败");
    }
  } catch (e) {
    ElMessage.error("支付失败");
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
