<template>
  <div class="product-stats">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>商品统计</span>
          </template>
          <el-button-group>
            <el-button :type="activeTab === 'hot' ? 'primary' : ''" @click="activeTab = 'hot'">热门商品</el-button>
            <el-button :type="activeTab === 'recommended' ? 'primary' : ''" @click="activeTab = 'recommended'">推荐商品</el-button>
            <el-button :type="activeTab === 'new' ? 'primary' : ''" @click="activeTab = 'new'">新品上架</el-button>
            <el-button :type="activeTab === 'rating' ? 'primary' : ''" @click="activeTab = 'rating'">评分排行</el-button>
            <el-button :type="activeTab === 'view' ? 'primary' : ''" @click="activeTab = 'view'">浏览排行</el-button>
            <el-button :type="activeTab === 'favorite' ? 'primary' : ''" @click="activeTab = 'favorite'">收藏排行</el-button>
          </el-button-group>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <el-table :data="products" border>
            <el-table-column prop="id" label="商品ID" width="180" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="sales" label="销量" width="80" />
            <el-table-column prop="rating" label="评分" width="80">
              <template #default="scope">
                <el-rate v-model="scope.row.rating" disabled text-color="#ff9900" />
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览量" width="80" />
            <el-table-column prop="favoriteCount" label="收藏数" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { productStatsApi } from "../api/modules";

const activeTab = ref("hot");
const products = ref([]);

const loadData = async () => {
  try {
    let result;
    switch (activeTab.value) {
      case "hot":
        result = await productStatsApi.hot({ limit: 20 });
        break;
      case "recommended":
        result = await productStatsApi.recommended();
        break;
      case "new":
        result = await productStatsApi.newProducts();
        break;
      case "rating":
        result = await productStatsApi.topRated({ limit: 20 });
        break;
      case "view":
        result = await productStatsApi.topViewed({ limit: 20 });
        break;
      case "favorite":
        result = await productStatsApi.topFavorite({ limit: 20 });
        break;
    }
    if (result.code === 200) {
      products.value = result.data || [];
    }
  } catch (e) {
    console.error("加载数据失败:", e);
  }
};

watch(activeTab, () => {
  loadData();
});

loadData();
</script>
