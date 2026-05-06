<template>
  <div class="cart-manage">
    <el-card>
      <template #header>
        <span>购物车管理</span>
      </template>
      
      <el-form :inline="true">
        <el-form-item label="用户ID">
          <el-input v-model="userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCart">查询</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="cartItems" border style="margin-top: 20px">
        <el-table-column prop="id" label="购物车ID" width="180" />
        <el-table-column prop="userId" label="用户ID" width="150" />
        <el-table-column prop="productId" label="商品ID" width="150" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="scope">
            ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { cartApi } from "../api/modules";

const userId = ref("");
const cartItems = ref([]);

const loadCart = async () => {
  if (!userId.value) {
    return;
  }
  try {
    const result = await cartApi.list(userId.value);
    if (result.code === 200) {
      cartItems.value = result.data || [];
    }
  } catch (e) {
    console.error("加载购物车失败:", e);
  }
};
</script>
