<template>
  <div class="analytics">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据分析</span>
          </template>
          
          <el-form :inline="true">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadData">查询</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>销售趋势</span>
          </template>
          <div v-if="salesTrend.length" class="chart-container">
            <div v-for="item in salesTrend" :key="item.date" class="trend-item">
              <span class="date">{{ item.date }}</span>
              <span class="amount">¥{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分类销售</span>
          </template>
          <div v-if="categorySales.length" class="chart-container">
            <div v-for="item in categorySales" :key="item.category" class="category-item">
              <span class="category">{{ item.category }}</span>
              <span class="amount">¥{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { analyticsApi } from "../api/modules";

const dateRange = ref([]);
const salesTrend = ref([]);
const categorySales = ref([]);

const loadData = async () => {
  try {
    const result = await analyticsApi.salesTrend({});
    if (result.code === 200) {
      salesTrend.value = result.data || [];
    }
    
    const result2 = await analyticsApi.categorySales({});
    if (result2.code === 200) {
      categorySales.value = result2.data || [];
    }
  } catch (e) {
    console.error("加载数据失败:", e);
  }
};

loadData();
</script>

<style scoped>
.chart-container {
  max-height: 300px;
  overflow-y: auto;
}

.trend-item,
.category-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.trend-item .date,
.category-item .category {
  color: #303133;
}

.trend-item .amount,
.category-item .amount {
  color: #409eff;
  font-weight: bold;
}
</style>
