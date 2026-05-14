<template>
  <div class="product-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增商品</el-button>
            <el-button @click="handleBatchUpload">批量导入</el-button>
          </div>
        </div>
      </template>

      <div class="card-content-wrapper">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="商品名称">
          <el-input 
            v-model="queryForm.keyword" 
            placeholder="请输入商品名称" 
            style="width: 200px"
            @input="handleAutoQuery"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader 
            v-model="queryCategoryPath" 
            :options="categoryOptions" 
            placeholder="请选择分类" 
            style="width: 250px"
            :props="{ expandTrigger: 'hover', checkStrictly: true }"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select 
            v-model="queryForm.brandId" 
            placeholder="请选择品牌" 
            style="width: 150px"
            filterable
            @change="handleAutoQuery"
          >
            <el-option label="全部" value="" />
            <el-option 
              v-for="brand in brandList" 
              :key="brand.id" 
              :label="brand.name" 
              :value="brand.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="queryForm.status" 
            placeholder="请选择状态" 
            style="width: 120px"
            @change="handleAutoQuery"
          >
            <el-option label="全部" value="" />
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="queryForm.startDate"
            type="date"
            placeholder="开始日期"
            style="width: 150px"
            @change="handleAutoQuery"
          />
          <span style="margin: 0 10px">-</span>
          <el-date-picker
            v-model="queryForm.endDate"
            type="date"
            placeholder="结束日期"
            style="width: 150px"
            @change="handleAutoQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-wrapper">
        <div class="table-header">
          <div class="batch-toggle-container">
            <div 
              class="toggle-switch" 
              :class="{ active: showBatchActions }"
              @click="toggleBatchActions"
            >
              <div class="toggle-track">
                <div class="toggle-thumb"></div>
              </div>
              <span class="toggle-text">{{ showBatchActions ? '批量' : '取消' }}</span>
            </div>
            <div v-if="showBatchActions" class="batch-menu">
              <el-button type="success" @click.stop="handleBatchOnSale">一键上架</el-button>
              <el-button type="warning" @click.stop="handleBatchOffSale">一键下架</el-button>
              <el-button type="danger" @click.stop="handleBatchDelete">批量删除</el-button>
              <span class="selected-count">已选 {{ selectedProducts.length }} 件</span>
            </div>
          </div>
        </div>
      <el-table 
        ref="productTable"
        :data="sortedProducts" 
        border 
        width="100%"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"
        :class="{ 'batch-mode': showBatchActions }"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '500' }"
        :row-class-name="(row, index) => index % 2 === 0 ? 'even-row' : 'odd-row'"
        :resizable="false"
      >
        <el-table-column 
          type="selection" 
          width="55" 
          align="center"
        />
        <el-table-column 
          type="index" 
          label="序号" 
          width="80"
          align="center"
          :index="(index) => (currentPage - 1) * pageSize + index + 1"
        />
        <el-table-column 
          width="90"
          align="center"
        >
          <template #header>
            <span class="header-cell-inline">商品图</span>
          </template>
          <template #default="scope">
            <div class="product-image-cell">
              <div 
                v-if="scope.row.imageUrl" 
                class="image-placeholder"
                @click="previewImage(scope.row.imageUrl)"
              >
                <img 
                  :src="scope.row.imageUrl" 
                  class="product-thumbnail"
                />
              </div>
              <div v-else class="image-placeholder no-image-wrapper">
                <span class="no-image-text">暂无图片</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column 
          prop="name" 
          label="商品名称" 
          sortable="custom"
          min-width="150"
        >
          <template #default="scope">
            <div class="product-name-cell">
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column 
          prop="categoryPath" 
          label="分类" 
          sortable="custom"
          min-width="280"
        >
          <template #default="scope">
            <span class="category-text">{{ scope.row.categoryPath }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="brandName" 
          label="品牌" 
          sortable="custom"
          width="100"
          align="center"
        />
        <el-table-column 
          prop="price" 
          label="价格" 
          sortable="custom"
          width="100"
          align="right"
        >
          <template #default="scope">
            <span class="price-cell">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="stock" 
          label="库存" 
          sortable="custom"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < 10 }">
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="status" 
          label="状态" 
          sortable="custom"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span class="status-cell">
              <el-tag 
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="sales" 
          label="销量" 
          width="80"
          align="center"
        />
        <el-table-column 
          label="操作" 
          width="240"
          align="center"
        >
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-dropdown>
                <el-button size="small" type="default" class="more-button">
                  <span class="more-dots">···</span>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.native="handleToggleStatus(scope.row)">
                      {{ scope.row.status === 1 ? '下架' : '上架' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleDelete(scope.row)" divided class="delete-item">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[10, 30, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size-options="['10', '30', '50', '100']"
          total-text="共 {total} 条"
          page-size-text="条/页"
          prev-text="上一页"
          next-text="下一页"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-cascader 
            v-model="formCategoryPath" 
            :options="categoryOptions" 
            placeholder="请选择分类" 
            style="width: 100%"
            :props="{ expandTrigger: 'hover', checkStrictly: true }"
            filterable
            @change="handleFormCategoryChange"
          />
        </el-form-item>
        <el-form-item label="商品品牌" prop="brandId">
          <el-select v-model="form.brandId" placeholder="请选择品牌" filterable>
            <el-option label="请选择品牌" value="" />
            <el-option 
              v-for="brand in filteredBrandList" 
              :key="brand.id" 
              :label="brand.name" 
              :value="brand.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="商品图片">
          <div class="image-upload-container">
            <div class="image-preview-area">
              <div v-if="form.imageUrl" class="image-preview-wrapper">
                <img :src="form.imageUrl" class="preview-image" @click="previewImage(form.imageUrl)" />
                <div class="image-actions">
                  <el-button size="mini" type="text" @click="handleImageUploadClick">修改图片</el-button>
                  <el-button size="mini" type="text" @click="clearImage">删除图片</el-button>
                </div>
              </div>
              <div v-else class="image-upload-placeholder" @click="handleImageUploadClick">
                <span class="upload-icon">📷</span>
                <span class="upload-text">点击上传商品图片</span>
              </div>
            </div>
            <el-upload
              ref="imageUploadRef"
              class="image-upload-hidden"
              action="/api/product/manage/upload"
              :on-success="handleImageUpload"
              :before-upload="beforeImageUpload"
              :auto-upload="true"
              accept="image/*"
            >
              <el-button size="small" type="primary">选择图片</el-button>
            </el-upload>
            <el-input v-model="form.imageUrl" placeholder="图片URL" style="margin-top: 10px; display: none" />
          </div>
        </el-form-item>
        <el-form-item label="商品规格" prop="specifications">
          <el-input v-model="form.specifications" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="商品产地" prop="origin">
          <el-input v-model="form.origin" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item label="商品单位" prop="unit">
          <el-input v-model="form.unit" placeholder="件、个、套等" />
        </el-form-item>
        <el-form-item label="商品标签" prop="tags">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="showImagePreview" 
      title="图片预览" 
      width="600px"
      :close-on-click-modal="true"
      @close="closeImagePreview"
    >
      <div class="image-preview-modal">
        <img :src="previewImageUrl" class="preview-modal-image" />
      </div>
      <template #footer>
        <el-button @click="closeImagePreview">关闭</el-button>
        <el-button type="primary" @click="handleImageUploadClick">修改图片</el-button>
        <el-button type="danger" @click="confirmDeleteImage">删除图片</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchUploadVisible" title="批量导入商品" width="500px" :close-on-click-modal="false">
      <div class="batch-upload-container">
        <div class="import-tips">
          <p><strong>注意事项：</strong></p>
          <ul>
            <li>1. 请填写完整的商品信息，分类和品牌必须存在于系统中</li>
            <li>2. 分类/品牌可填写名称或ID</li>
            <li>3. 状态：0=禁用，1=启用</li>
          </ul>
        </div>
        
        <el-upload
          class="batch-upload-area"
          action="/api/product/manage/batch/upload"
          :on-success="handleBatchUploadSuccess"
          :before-upload="beforeBatchUpload"
          :file-list="batchFileList"
          accept=".xlsx,.xls"
          :auto-upload="false"
          ref="batchUploadRef"
          drag
        >
          <div class="upload-icon-wrapper">
            <el-icon class="upload-icon" size="60"><Upload /></el-icon>
          </div>
          <div class="upload-text">点击上传，或将文件拖拽到此处</div>
        </el-upload>
        
        <div class="upload-actions">
          <el-button type="primary" class="download-btn" @click="downloadTemplate" :disabled="downloadLoading">下载商品模版</el-button>
          <el-button class="download-btn" @click="downloadBrandList" :disabled="downloadLoading">下载品牌列表</el-button>
          <el-button class="download-btn" @click="downloadCategoryList" :disabled="downloadLoading">下载分类列表</el-button>
        </div>
        
        <div v-if="importResult" class="import-result">
          <el-divider />
          <div class="result-summary">
            <span class="success-count">成功：{{ importResult.successCount }} 条</span>
            <span class="fail-count">失败：{{ importResult.failCount }} 条</span>
          </div>
          <div v-if="importResult.failItems && importResult.failItems.length > 0" class="fail-list">
            <div class="result-title">失败详情：</div>
            <el-scrollbar height="150px">
              <div v-for="(item, index) in importResult.failItems" :key="index" class="fail-item">
                {{ item }}
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="batchUploadVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchUpload">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import { productManageApi, brandApi, categoryApi } from "../api/modules";

const products = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedProducts = ref([]);
const showBatchActions = ref(false);
const productTable = ref(null);

const dialogVisible = ref(false);
const batchUploadVisible = ref(false);
const isEdit = ref(false);
const batchUploadRef = ref(null);

const imageFileList = ref([]);
const batchFileList = ref([]);
const imageUploadRef = ref(null);
const previewImageUrl = ref('');
const showImagePreview = ref(false);

const brands = ref([]);
const categories = ref([]);
const batchForm = reactive({});
const importResult = ref(null);
const downloadLoading = ref(false);

const form = ref({
  id: "",
  name: "",
  categoryId: "",
  brandId: "",
  price: 0,
  stock: 0,
  description: "",
  imageUrl: "",
  specifications: "",
  origin: "",
  unit: "",
  tags: "",
  status: 1,
});

const brandList = ref([]);
const filteredBrandList = computed(() => {
  if (!form.value.categoryId) {
    return brandList.value;
  }
  const matched = brandList.value.filter(b => {
    if (!b.category) return false;
    const categoryPath = formCategoryPath.value || [];
    return categoryPath.includes(b.category);
  });
  return matched.length > 0 ? matched : brandList.value;
});

const categoryList = ref([]);

const queryCategoryPath = ref([]);
const formCategoryPath = ref([]);
const categoryOptions = computed(() => {
  return categoryList.value.map(cat => {
    const children = cat.children ? cat.children.map(child => {
      const grandchildren = child.children ? child.children.map(gc => ({
        value: gc.id,
        label: gc.name
      })) : [];
      return {
        value: child.id,
        label: child.name,
        children: grandchildren.length > 0 ? grandchildren : undefined
      };
    }) : [];
    return {
      value: cat.id,
      label: cat.name,
      children: children.length > 0 ? children : undefined
    };
  });
});

const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    queryForm.categoryId = value[value.length - 1];
  } else {
    queryForm.categoryId = "";
  }
  handleAutoQuery();
};

const handleFormCategoryChange = (value) => {
  if (value && value.length > 0) {
    form.value.categoryId = value[value.length - 1];
  } else {
    form.value.categoryId = "";
  }
};

const queryForm = reactive({
  keyword: "",
  categoryId: "",
  brandId: "",
  status: "",
  startDate: "",
  endDate: "",
});

const sortInfo = reactive({
  sortBy: "name",
  sortDirection: "ASC",
});

let queryTimer = null;

const sortedProducts = computed(() => {
  return products.value;
});

const loadProducts = async () => {
  try {
    const request = {
      keyword: queryForm.keyword,
      categoryId: queryForm.categoryId,
      brandId: queryForm.brandId,
      status: queryForm.status,
      startDate: queryForm.startDate,
      endDate: queryForm.endDate,
      sortBy: sortInfo.sortBy,
      sortDirection: sortInfo.sortDirection,
      page: currentPage.value,
      size: pageSize.value,
    };
    const result = await productManageApi.list(request);
    if (result.code === 200) {
      products.value = result.data.records || result.data.list || [];
      total.value = result.data.total || 0;
    }
  } catch (e) {
    console.error("加载商品失败:", e);
  }
};

const handleAutoQuery = () => {
  if (queryTimer) {
    clearTimeout(queryTimer);
  }
  queryTimer = setTimeout(() => {
    currentPage.value = 1;
    loadProducts();
  }, 300);
};

const toggleBatchActions = () => {
  showBatchActions.value = !showBatchActions.value;
  if (!showBatchActions.value) {
    if (productTable.value) {
      productTable.value.clearSelection();
    }
    selectedProducts.value = [];
  }
};

const handleAdd = async () => {
  await loadBrands(true);
  await loadCategories();
  
  form.value = {
    id: "",
    name: "",
    categoryId: "",
    brandId: "",
    price: 0,
    stock: 0,
    description: "",
    imageUrl: "",
    specifications: "",
    origin: "",
    unit: "",
    tags: "",
    status: 1,
  };
  imageFileList.value = [];
  isEdit.value = false;
  formCategoryPath.value = [];
  
  if (categoryList.value.length > 0) {
    const firstCat = categoryList.value[0];
    if (firstCat.children && firstCat.children.length > 0) {
      const secondCat = firstCat.children[0];
      if (secondCat.children && secondCat.children.length > 0) {
        formCategoryPath.value = [firstCat.id, secondCat.id, secondCat.children[0].id];
        form.value.categoryId = secondCat.children[0].id;
      } else {
        formCategoryPath.value = [firstCat.id, secondCat.id];
        form.value.categoryId = secondCat.id;
      }
    } else {
      formCategoryPath.value = [firstCat.id];
      form.value.categoryId = firstCat.id;
    }
  }
  
  if (brandList.value.length > 0) {
    const categoryPath = formCategoryPath.value || [];
    const matched = brandList.value.filter(b => {
      if (!b.category) return false;
      return categoryPath.includes(b.category);
    });
    if (matched.length > 0) {
      form.value.brandId = matched[0].id;
    } else {
      form.value.brandId = brandList.value[0].id;
    }
  }
  
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  await loadBrands(true);
  await loadCategories();
  
  form.value = {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId || "",
    brandId: row.brandId || "",
    price: row.price || 0,
    stock: row.stock || 0,
    description: row.description || "",
    imageUrl: row.imageUrl || "",
    specifications: row.specifications || "",
    origin: row.origin || "",
    unit: row.unit || "",
    tags: row.tags || "",
    status: row.status || 1,
  };
  imageFileList.value = [];
  isEdit.value = true;
  
  if (row.categoryId) {
    formCategoryPath.value = findCategoryPath(row.categoryId);
  } else {
    formCategoryPath.value = [];
  }
  
  dialogVisible.value = true;
};

const findCategoryPath = (categoryId) => {
  const path = [];
  const findPath = (categories, targetId) => {
    for (const cat of categories) {
      if (cat.id === targetId) {
        path.unshift(cat.id);
        return true;
      }
      if (cat.children && findPath(cat.children, targetId)) {
        path.unshift(cat.id);
        return true;
      }
    }
    return false;
  };
  findPath(categoryList.value, categoryId);
  return path;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该商品吗?", "提示", {
      type: "warning",
    });
    const result = await productManageApi.delete({ id: row.id });
    if (result.code === 200) {
      ElMessage.success("删除成功");
      loadProducts();
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning("请选择要删除的商品");
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedProducts.value.length} 件商品吗?`, "提示", {
      type: "warning",
    });
    for (const product of selectedProducts.value) {
      await productManageApi.delete({ id: product.id });
    }
    ElMessage.success(`成功删除 ${selectedProducts.value.length} 件商品`);
    loadProducts();
    showBatchActions.value = false;
    selectedProducts.value = [];
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    const result = await productManageApi.updateStatus({ id: row.id, status: newStatus });
    if (result.code === 200) {
      ElMessage.success(newStatus === 1 ? "上架成功" : "下架成功");
      loadProducts();
    } else {
      ElMessage.error(result.message || "操作失败");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const handleSubmit = async () => {
  try {
    let result;
    if (isEdit.value) {
      result = await productManageApi.update(form.value);
    } else {
      result = await productManageApi.add(form.value);
    }
    if (result.code === 200) {
      ElMessage.success(isEdit.value ? "修改成功" : "添加成功");
      dialogVisible.value = false;
      loadProducts();
    } else {
      ElMessage.error(result.message || "操作失败");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const handleReset = () => {
  queryForm.keyword = "";
  queryForm.categoryId = "";
  queryForm.brandId = "";
  queryForm.status = "";
  queryForm.startDate = "";
  queryForm.endDate = "";
  queryCategoryPath.value = [];
  sortInfo.sortBy = "createTime";
  sortInfo.sortDirection = "DESC";
  currentPage.value = 1;
  if (productTable.value) {
    productTable.value.clearSort();
  }
  loadProducts();
};

const handleSortChange = (sort) => {
  sortInfo.sortBy = sort.prop;
  sortInfo.sortDirection = sort.order === "ascending" ? "ASC" : "DESC";
  loadProducts();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadProducts();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadProducts();
};

const handleSelectionChange = (selected) => {
  selectedProducts.value = selected;
};

const handleBatchOnSale = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning("请选择要上架的商品");
    return;
  }
  try {
    const ids = selectedProducts.value.map(p => p.id);
    const result = await productManageApi.batchStatus({ ids, status: 1 });
    if (result.code === 200) {
      ElMessage.success(`成功上架 ${result.data} 件商品`);
      loadProducts();
    } else {
      ElMessage.error(result.message || "操作失败");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const handleBatchOffSale = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning("请选择要下架的商品");
    return;
  }
  try {
    const ids = selectedProducts.value.map(p => p.id);
    const result = await productManageApi.batchStatus({ ids, status: 0 });
    if (result.code === 200) {
      ElMessage.success(`成功下架 ${result.data} 件商品`);
      loadProducts();
    } else {
      ElMessage.error(result.message || "操作失败");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const handleBatchUpload = async () => {
  await loadBatchBrands();
  await loadBatchCategories();
  importResult.value = null;
  batchForm.brandName = '';
  batchForm.categoryName = '';
  batchUploadVisible.value = true;
};

const loadBatchBrands = async () => {
  try {
    const result = await productManageApi.getBrands();
    if (result.code === 200) {
      brands.value = result.data || [];
    }
  } catch (e) {
    console.error("加载品牌失败:", e);
  }
};

const loadBatchCategories = async () => {
  try {
    const result = await productManageApi.getCategories();
    if (result.code === 200) {
      categories.value = result.data || [];
    }
  } catch (e) {
    console.error("加载分类失败:", e);
  }
};

const handleBatchUploadSuccess = (response) => {
  if (response.code === 200) {
    importResult.value = response.data;
    ElMessage.success(`导入完成，成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`);
    if (response.data.successCount > 0) {
      loadProducts();
    }
  } else {
    ElMessage.error(response.message || "导入失败");
  }
};

const beforeBatchUpload = (file) => {
  const isExcel = file.type === "application/vnd.ms-excel" || 
                  file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (!isExcel) {
    ElMessage.error("只能上传Excel文件");
    return false;
  }
  return true;
};

const submitBatchUpload = () => {
  if (batchUploadRef.value && batchFileList.value.length > 0) {
    const action = `/api/product/manage/batch/upload`;
    batchUploadRef.value.$el.querySelector('form').action = action;
    batchUploadRef.value.submit();
  } else {
    ElMessage.warning("请选择要导入的文件");
  }
};

const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('下载失败');
    }
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    ElMessage.error(error.message || '下载失败');
  }
};

const downloadTemplate = (event) => {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (downloadLoading.value) return;
  downloadLoading.value = true;
  downloadFile("/api/product/manage/template/download", '批量添加商品模版.xlsx');
  setTimeout(() => {
    downloadLoading.value = false;
  }, 2000);
};

const downloadBrandList = (event) => {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (downloadLoading.value) return;
  downloadLoading.value = true;
  downloadFile("/api/product/manage/brands/download", '品牌列表.xlsx');
  setTimeout(() => {
    downloadLoading.value = false;
  }, 2000);
};

const downloadCategoryList = (event) => {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (downloadLoading.value) return;
  downloadLoading.value = true;
  downloadFile("/api/product/manage/categories/download", '分类列表.xlsx');
  setTimeout(() => {
    downloadLoading.value = false;
  }, 2000);
};

const handleImageUpload = (response) => {
  if (response.code === 200) {
    form.value.imageUrl = response.data;
    ElMessage.success("图片上传成功");
  } else {
    ElMessage.error(response.message || "图片上传失败");
  }
};

const handleImageUploadClick = () => {
  if (imageUploadRef.value) {
    const uploadInput = imageUploadRef.value.$refs.input;
    if (uploadInput) {
      uploadInput.click();
    }
  }
};

const clearImage = () => {
  form.value.imageUrl = '';
  imageFileList.value = [];
};

const previewImage = (url) => {
  previewImageUrl.value = url;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
};

const confirmDeleteImage = async () => {
  try {
    await ElMessageBox.confirm("确定要删除这张图片吗？", "提示", {
      type: "warning",
    });
    clearImage();
    closeImagePreview();
    ElMessage.success("图片删除成功");
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过2MB");
    return false;
  }
  return true;
};

const sortByName = (list) => {
  return [...list].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB, 'zh-CN', { sensitivity: 'base' });
  });
};

const loadBrands = async (forceRefresh = false) => {
  try {
    if (forceRefresh || brandList.value.length === 0) {
      const result = await brandApi.all();
      if (result.code === 200) {
        brandList.value = sortByName(result.data || []);
      }
    }
  } catch (e) {
    console.error("加载品牌列表失败:", e);
  }
};

const loadCategories = async (forceRefresh = false) => {
  try {
    if (forceRefresh || categoryList.value.length === 0) {
      const result = await categoryApi.tree();
      if (result.code === 200) {
        categoryList.value = result.data || [];
      }
    }
  } catch (e) {
    console.error("加载分类列表失败:", e);
  }
};

const truncatePath = (path) => {
  if (!path) return '';
  if (path.length <= 20) return path;
  return path.substring(0, 20) + '...';
};


onMounted(() => {
  loadBrands();
  loadCategories();
});

loadProducts();
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-left: 10px;
  border-left: 1px solid #dcdfe6;
}

.selected-count {
  color: #606266;
  font-size: 14px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

.batch-toggle-container {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 2px 4px;
}

.toggle-track {
  width: 40px;
  height: 22px;
  background-color: #E5E5E5;
  border-radius: 11px;
  position: relative;
  transition: all 0.3s ease;
  border: none;
}

.toggle-switch.active .toggle-track {
  background-color: #34C759;
}

.toggle-thumb {
  width: 18px;
  height: 18px;
  background-color: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 1px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
  background-color: #FFFFFF;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 1px rgba(0, 0, 0, 0.1);
}

.toggle-text {
  font-size: 12px;
  font-weight: 500;
  color: #888;
  transition: all 0.3s ease;
  min-width: 28px;
}

.toggle-switch.active .toggle-text {
  color: #4CAF50;
}

.batch-menu {
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 100;
  animation: slideInRight 0.25s ease;
  white-space: nowrap;
}

.card-content-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px;
}

.table-wrapper {
  width: 100%;
  margin-top: 20px;
  overflow-x: auto;
}

:deep(.el-card__body) {
  overflow-x: auto;
  padding: 0;
  margin: 0;
}

:deep(.el-card__body > .card-content-wrapper) {
  padding: 20px;
  box-sizing: border-box;
}

:deep(.el-table .el-table__header th.gutter) {
  display: block;
  width: 17px;
}

:deep(.el-table__column-resize) {
  display: none !important;
  width: 0 !important;
}

:deep(.el-table .el-table__header th) {
  cursor: default !important;
}

:deep(.el-table .el-table__header .el-table__column-resize) {
  display: none !important;
}

:deep(.el-pagination .el-pagination__jump) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-pagination .el-pagination__jump .el-input) {
  width: 50px;
  margin: 0 4px;
}

:deep(.el-pagination) {
  font-size: 13px;
}

:deep(.el-pagination .el-pagination__jump) {
  font-size: 13px;
  font-weight: normal;
}

:deep(.el-pagination .el-pagination__jump .el-input .el-input__inner) {
  font-size: 13px;
  height: 28px;
  line-height: 28px;
}

:deep(.el-pagination .el-pagination__sizes .el-select .el-input .el-input__inner) {
  font-size: 13px;
  height: 28px;
  line-height: 28px;
}

.more-button {
  width: 32px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.more-dots {
  font-size: 16px;
  color: #606266;
  font-weight: bold;
}

:deep(.el-dropdown-menu__item.delete-item) {
  color: #F56C6C !important;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-table:not(.batch-mode) .el-table-column--selection .el-checkbox) {
  opacity: 0;
  pointer-events: none;
}

:deep(.el-table .el-table__body .el-table__row .action-buttons) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 160px;
  flex-wrap: nowrap;
}

:deep(.el-table .el-table__body .el-table__row .action-buttons .el-button) {
  flex-shrink: 0;
  white-space: nowrap;
}

:deep(.el-table .el-table__body .el-table__row.even-row) {
  background-color: #fafafa;
}

:deep(.el-table .el-table__body .el-table__row.odd-row) {
  background-color: #ffffff;
}

:deep(.el-table .el-table__body .el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table .el-table__header th) {
  font-weight: 600;
}

.product-name-cell {
  font-weight: 500;
  color: #303133;
  padding: 4px 0;
  white-space: nowrap;
}

.category-path-cell {
  padding: 4px 0;
  white-space: nowrap;
}

.category-text {
  font-size: 12px;
  color: #409EFF;
  background-color: #ECF5FF;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #B3D8FF;
  white-space: nowrap;
}

.price-cell {
  font-weight: 600;
  color: #E6A23C;
  font-size: 14px;
}

.low-stock {
  color: #F56C6C;
  font-weight: 600;
}

.status-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.product-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 42px;
  height: 28px;
  border-radius: 3px;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.image-placeholder:hover {
  border-color: #409EFF;
  background-color: #f0f5ff;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.no-image-wrapper {
  cursor: default;
}

.no-image-wrapper:hover {
  border-color: #d9d9d9;
  background-color: #fafafa;
}

.no-image-text {
  font-size: 10px;
  color: #909399;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
}

.header-cell {
  white-space: nowrap;
  word-break: keep-all;
  font-size: 13px;
}

.header-cell-inline {
  display: inline-block;
  white-space: nowrap !important;
  word-break: keep-all !important;
  font-size: 13px;
  line-height: 1;
}

.image-upload-container {
  width: 100%;
}

.image-preview-area {
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.image-preview-area:hover {
  border-color: #409EFF;
  background-color: #f0f5ff;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.upload-icon {
  font-size: 36px;
}

.upload-text {
  font-size: 13px;
}

.batch-upload-container {
  padding: 20px;
}

.batch-upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #fafafa;
  
  &:hover {
    border-color: #409EFF;
    background-color: #f0f5ff;
  }
  
  &.is-dragover {
    border-color: #409EFF;
    background-color: #e6f7ff;
  }
}

.upload-icon-wrapper {
  margin-bottom: 16px;
  
  .upload-icon {
    font-size: 60px;
    color: #52c41a;
  }
}

.upload-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.download-btn {
  width: 140px;
  height: 40px;
  font-size: 14px;
  background-color: #1890ff;
  border-color: #1890ff;
  border-radius: 20px;
  color: #fff !important;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.import-result {
  margin-top: 16px;
}

.result-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.success-count {
  color: #67c23a;
  font-weight: 500;
}

.fail-count {
  color: #f56c6c;
  font-weight: 500;
}

.result-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.fail-list {
  font-size: 12px;
  color: #606266;
}

.fail-item {
  padding: 4px 0;
  border-bottom: 1px solid #f2f6fc;
}

.image-preview-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 20px 10px 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview-wrapper:hover .image-actions {
  opacity: 1;
}

.image-actions .el-button {
  color: white;
  font-size: 12px;
}

.image-actions .el-button:hover {
  color: #409EFF;
}

.image-upload-hidden {
  display: none;
}

.image-preview-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-modal-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
}

:deep(.el-table .el-table__body .el-table__row td) {
  padding: 12px 8px;
}

:deep(.el-table .el-table__header th) {
  padding: 14px 8px;
  white-space: nowrap !important;
  word-break: keep-all !important;
}

:deep(.el-table .el-table__header th .cell) {
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>