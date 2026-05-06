<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon product">
          <span>📦</span>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ formatNumber(productCount) }}</p>
          <p class="stat-label">商品总数</p>
          <p :class="['stat-change', productTrend >= 0 ? 'positive' : 'negative']">
            {{ productTrend >= 0 ? '+' : '' }}{{ productTrend }}%
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon order">
          <span>📋</span>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ formatNumber(orderCount) }}</p>
          <p class="stat-label">订单数量</p>
          <p :class="['stat-change', orderTrend >= 0 ? 'positive' : 'negative']">
            {{ orderTrend >= 0 ? '+' : '' }}{{ orderTrend }}%
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sales">
          <span>💰</span>
        </div>
        <div class="stat-content">
          <p class="stat-value">¥{{ formatNumber(totalSales) }}</p>
          <p class="stat-label">总销售额</p>
          <p :class="['stat-change', salesTrend >= 0 ? 'positive' : 'negative']">
            {{ salesTrend >= 0 ? '+' : '' }}{{ salesTrend }}%
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon user">
          <span>👥</span>
        </div>
        <div class="stat-content">
          <p class="stat-value">{{ formatNumber(userCount) }}</p>
          <p class="stat-label">用户数量</p>
          <p :class="['stat-change', userTrend >= 0 ? 'positive' : 'negative']">
            {{ userTrend >= 0 ? '+' : '' }}{{ userTrend }}%
          </p>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="chart-section">
        <div class="section-header">
          <h3>销售趋势分析</h3>
          <div class="period-tabs">
            <button 
              v-for="tab in periodTabs" 
              :key="tab.value"
              :class="['tab-btn', { active: currentPeriod === tab.value }]"
              @click="changePeriod(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-inner">
            <div class="chart-y-axis">
              <span>高</span>
              <span></span>
              <span></span>
              <span></span>
              <span>低</span>
            </div>
            <div class="chart-main">
              <svg class="chart-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight + chartLabelHeight + chartTopPadding}`">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.2" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#f5576c" />
                    <stop offset="100%" style="stop-color:#f093fb" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <g class="grid-lines">
                  <line v-for="i in 5" :key="'grid-'+i" 
                    :x1="0" :y1="chartTopPadding + (i-1) * (chartHeight / 4)" 
                    :x2="chartWidth" :y2="chartTopPadding + (i-1) * (chartHeight / 4)" 
                    class="grid-line" />
                </g>
                <g class="bars">
                  <rect 
                    v-for="(item, index) in displaySalesData" 
                    :key="'bar-'+index"
                    :x="index * (chartWidth / displaySalesData.length) + barPadding"
                    :y="chartTopPadding + chartHeight - (item.percent / 100) * chartHeight - 20"
                    :width="barWidth"
                    :height="(item.percent / 100) * chartHeight"
                    fill="url(#barGradient)"
                    class="bar"
                    :style="{ transform: `translateY(20px)` }"
                  />
                </g>
                <g class="line-chart">
                  <path 
                    :d="linePath" 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    stroke-width="3"
                    filter="url(#glow)"
                    class="trend-line"
                  />
                  <g v-for="(item, index) in displaySalesData" :key="'point-'+index" class="data-point-group">
                    <circle 
                      :cx="index * (chartWidth / displaySalesData.length) + barPadding + barWidth / 2"
                      :cy="chartTopPadding + chartHeight - (item.percent / 100) * chartHeight"
                      r="4"
                      fill="#f5576c"
                      class="data-point"
                    />
                    <circle 
                      :cx="index * (chartWidth / displaySalesData.length) + barPadding + barWidth / 2"
                      :cy="chartTopPadding + chartHeight - (item.percent / 100) * chartHeight"
                      r="12"
                      fill="transparent"
                      class="data-point-hit"
                    />
                    <g class="data-tooltip" :transform="`translate(${index * (chartWidth / displaySalesData.length) + barPadding + barWidth / 2}, ${chartTopPadding + chartHeight - (item.percent / 100) * chartHeight - 8})`">
                      <rect 
                        x="-35"
                        y="-18"
                        width="70"
                        height="16"
                        rx="4"
                        fill="#1f2937"
                      />
                      <text 
                        x="0" 
                        y="-6"
                        text-anchor="middle"
                        fill="white"
                        font-size="10"
                      >¥{{ formatNumber(item.revenue) }}</text>
                    </g>
                  </g>
                </g>
                <g class="x-axis-labels">
                  <text 
                    v-for="(item, index) in displaySalesData" 
                    :key="'label-'+index"
                    :x="index * (chartWidth / displaySalesData.length) + barPadding + barWidth / 2"
                    :y="chartTopPadding + chartHeight + 20"
                    text-anchor="middle"
                    fill="#6b7280"
                    font-size="11"
                  >
                    {{ formatDayLabel(item) }}
                  </text>
                </g>
              </svg>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color bar"></span>
              <span class="legend-text">销售额</span>
            </div>
            <div class="legend-item">
              <span class="legend-color line"></span>
              <span class="legend-text">趋势线</span>
            </div>
          </div>
        </div>
        <div class="chart-summary">
          <div class="summary-item">
            <span class="summary-label">平均销售额</span>
            <span class="summary-value">¥{{ formatNumber(averageRevenue) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最高销售额</span>
            <span class="summary-value highlight">¥{{ formatNumber(maxRevenue) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最低销售额</span>
            <span class="summary-value">¥{{ formatNumber(minRevenue) }}</span>
          </div>
        </div>
        
        <div class="hot-products-scroll">
          <div class="hot-products-header">
            <h4>🔥 热门商品</h4>
          </div>
          <div class="hot-products-list">
            <div 
              v-for="(item, index) in hotProducts" 
              :key="index" 
              class="hot-product-item"
            >
              <span class="product-rank" :class="getRankClass(index)">{{ index + 1 }}</span>
              <span class="product-name">{{ item.name }}</span>
              <span class="product-sales">销量: {{ formatNumber(item.sales) }}</span>
            </div>
            <div v-if="hotProducts.length === 0" class="empty-hot-products">
              暂无热门商品数据
            </div>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="mini-card realtime-card">
          <div class="mini-header">
            <h4>实时数据概览</h4>
          </div>
          <div class="realtime-grid">
            <div class="realtime-item">
              <span class="realtime-value">{{ onlineUsers }}</span>
              <span class="realtime-label">在线用户</span>
            </div>
            <div class="realtime-item">
              <span class="realtime-value">{{ activeOrders }}</span>
              <span class="realtime-label">活跃订单</span>
            </div>
            <div class="realtime-item">
              <span class="realtime-value">{{ conversionRate }}%</span>
              <span class="realtime-label">转化率</span>
            </div>
            <div class="realtime-item">
              <span class="realtime-value">{{ avgOrderValue }}</span>
              <span class="realtime-label">客单价</span>
            </div>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-header">
            <h4>分类销售占比</h4>
          </div>
          <div class="category-chart">
            <div v-for="cat in categoryStats" :key="cat.name" class="category-item">
              <span class="cat-name">{{ cat.name }}</span>
              <div class="cat-bar-wrapper">
                <div class="cat-bar" :style="{ width: cat.percent + '%', background: cat.color }"></div>
              </div>
              <span class="cat-percent">{{ cat.percent }}%</span>
            </div>
          </div>
        </div>

        <div class="mini-card alert-scroll-card">
          <div class="mini-header">
            <h4>销售数据</h4>
          </div>
          <div class="alert-tabs">
            <button 
              v-for="alert in alerts" 
              :key="alert.id"
              :class="['alert-tab', { active: currentAlertTab === alert.id }]"
              @click="currentAlertTab = alert.id"
            >
              <span class="tab-icon">{{ alert.icon }}</span>
              <span class="tab-title">{{ alert.title }}</span>
            </button>
          </div>
          <div class="alert-content-scroll">
            <div v-for="(item, index) in sortedAlertItems" :key="index" class="alert-product-item">
              <span v-if="currentAlertTab !== 1" class="product-rank" :class="getRankClass(index)">{{ index + 1 }}</span>
              <span class="product-name">{{ item.name }}</span>
              <span class="product-extra" :class="{ 'low-stock-text': isLowStock(item) }">{{ getAlertItemExtra(item) }}</span>
            </div>
            <div v-if="sortedAlertItems.length === 0" class="empty-alert">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { analyticsApi } from '../api/modules'

const productCount = ref(0)
const orderCount = ref(0)
const totalSales = ref(0)
const userCount = ref(0)
const hotProducts = ref([])
const salesData = ref([])
const currentPeriod = ref('daily')

const productTrend = ref(0)
const orderTrend = ref(0)
const salesTrend = ref(0)
const userTrend = ref(0)

const chartWidth = 600
const chartHeight = 200
const chartLabelHeight = 30
const chartTopPadding = 40
const barWidth = 40
const barPadding = 20

const onlineUsers = ref(0)
const activeOrders = ref(0)
const conversionRate = ref(0)
const avgOrderValue = ref(0)

const categoryStats = ref([])
const alerts = ref([])
const currentAlertTab = ref(1)

const periodTabs = [
  { label: '每日', value: 'daily' },
  { label: '每月', value: 'monthly' },
  { label: '每年', value: 'yearly' }
]

const displaySalesData = computed(() => {
  return salesData.value.length > 0 ? salesData.value : []
})

const maxRevenue = computed(() => {
  if (displaySalesData.value.length === 0) return 0
  return Math.max(...displaySalesData.value.map(item => item.revenue || 0))
})

const minRevenue = computed(() => {
  if (displaySalesData.value.length === 0) return 0
  return Math.min(...displaySalesData.value.map(item => item.revenue || 0))
})

const averageRevenue = computed(() => {
  if (displaySalesData.value.length === 0) return 0
  const sum = displaySalesData.value.reduce((acc, item) => acc + (item.revenue || 0), 0)
  return Math.round(sum / displaySalesData.value.length)
})

const linePath = computed(() => {
  if (displaySalesData.value.length === 0) return ''
  const points = displaySalesData.value.map((item, index) => {
    const x = index * (chartWidth / displaySalesData.value.length) + barPadding + barWidth / 2
    const y = chartTopPadding + chartHeight - (item.percent / 100) * chartHeight
    return `${x},${y}`
  })
  return `M${points.join(' L')}`
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const formatDayLabel = (item) => {
  if (item.date) {
    const dateParts = item.date.split('-')
    if (dateParts.length === 3) {
      return parseInt(dateParts[2]) + '号'
    }
  }
  return item.day || item.label || ''
}

const getRankClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

const getBarWidth = (sales) => {
  if (hotProducts.value.length === 0) return 0
  const maxSales = Math.max(...hotProducts.value.map(p => p.sales || 1))
  return (sales / maxSales) * 100
}

const currentAlertItems = computed(() => {
  const alert = alerts.value.find(a => a.id === currentAlertTab.value)
  return alert && alert.items ? alert.items : []
})

const sortedAlertItems = computed(() => {
  const items = [...currentAlertItems.value]
  const alert = alerts.value.find(a => a.id === currentAlertTab.value)
  
  if (alert && alert.type === 'warning') {
    items.sort((a, b) => {
      const aLow = parseInt(a.stock) < 10
      const bLow = parseInt(b.stock) < 10
      if (aLow && !bLow) return -1
      if (!aLow && bLow) return 1
      return parseInt(a.stock) - parseInt(b.stock)
    })
  }
  return items
})

const isLowStock = (item) => {
  const alert = alerts.value.find(a => a.id === currentAlertTab.value)
  if (alert && alert.type === 'warning') {
    return parseInt(item.stock) < 10
  }
  return false
}

const getAlertItemExtra = (item) => {
  const alert = alerts.value.find(a => a.id === currentAlertTab.value)
  if (!alert) return ''
  
  if (alert.type === 'warning') {
    return `剩余: ${item.stock}件`
  } else if (alert.type === 'success') {
    return `销量: ${item.total_sales || 0}件`
  } else if (alert.type === 'info') {
    return `¥${item.price || '0'}`
  }
  return ''
}

const loadOverview = async () => {
  const result = await analyticsApi.overview()
  if (result.code === 200 && result.data) {
    productCount.value = result.data.productCount || 0
    orderCount.value = result.data.orderCount || 0
    totalSales.value = result.data.totalSales || 0
    userCount.value = result.data.userCount || 0
    
    productTrend.value = result.data.productTrend || 0
    orderTrend.value = result.data.orderTrend || 0
    salesTrend.value = result.data.salesTrend || 0
    userTrend.value = result.data.userTrend || 0
  }
}

const loadHotProducts = async () => {
  const result = await analyticsApi.hotProducts()
  if (result.code === 200 && result.data) {
    hotProducts.value = result.data.map(item => ({
      id: item.id,
      name: item.name || 'Unknown',
      sales: item.sales || 0,
      revenue: item.revenue || 0
    }))
  }
}

const loadSalesTrend = async (period = 'daily', days = 7) => {
  const result = await analyticsApi.salesTrendData(period, days)
  if (result.code === 200 && result.data) {
    const maxRev = Math.max(...result.data.map(item => item.revenue || 0)) || 1
    salesData.value = result.data.map((item, index) => ({
      ...item,
      percent: ((item.revenue || 0) / maxRev) * 100
    }))
  }
}

const loadRealtimeData = async () => {
  const result = await analyticsApi.realtime()
  if (result.code === 200 && result.data) {
    onlineUsers.value = result.data.onlineUsers !== undefined && result.data.onlineUsers !== null ? result.data.onlineUsers : 1260
    activeOrders.value = result.data.activeOrders !== undefined && result.data.activeOrders !== null ? result.data.activeOrders : 86
    conversionRate.value = result.data.conversionRate !== undefined && result.data.conversionRate !== null ? result.data.conversionRate : '3.2'
    avgOrderValue.value = result.data.avgOrderValue !== undefined && result.data.avgOrderValue !== null ? result.data.avgOrderValue : 159
  }
}

const loadCategoryStats = async () => {
  const categories = [
    { name: '电子产品', percent: 35, color: '#667eea' },
    { name: '服装鞋帽', percent: 25, color: '#f5576c' },
    { name: '食品饮料', percent: 20, color: '#43e97b' },
    { name: '家居用品', percent: 12, color: '#4facfe' },
    { name: '其他', percent: 8, color: '#969799' },
  ]
  categoryStats.value = categories
}

const loadAlerts = async () => {
  const result = await analyticsApi.alerts()
  if (result.code === 200 && result.data) {
    alerts.value = result.data
  } else {
    const alertList = [
      { id: 1, type: 'warning', icon: '⚠️', title: '库存预警', desc: '暂无库存预警信息' },
      { id: 2, type: 'success', icon: '✅', title: '热销提醒', desc: '暂无热销商品数据' },
      { id: 3, type: 'info', icon: 'ℹ️', title: '新品上架', desc: '今日暂无新品上架' },
    ]
    alerts.value = alertList
  }
}

const changePeriod = (period) => {
  currentPeriod.value = period
  const days = period === 'yearly' ? 5 : 7
  loadSalesTrend(period, days)
}

const loadData = async () => {
  await Promise.all([
    loadOverview(),
    loadHotProducts(),
    loadSalesTrend('daily', 7),
    loadRealtimeData(),
    loadCategoryStats(),
    loadAlerts()
  ])
}

let refreshTimer = null

const refreshData = async () => {
  await Promise.all([
    loadOverview(),
    loadHotProducts(),
    loadSalesTrend('daily', 7),
    loadRealtimeData(),
    loadCategoryStats(),
    loadAlerts()
  ])
}

onMounted(() => {
  loadData()
  
  refreshTimer = setInterval(() => {
    refreshData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 20px;
}

.stat-icon.product {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.order {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.sales {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.user {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin: 6px 0 4px 0;
  line-height: 1.2;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  align-items: stretch;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bottom-section {
  margin-bottom: 24px;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.period-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e5e7eb;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.sort-info {
  font-size: 13px;
  color: #9ca3af;
}

.chart-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.chart-inner {
  display: flex;
  height: 240px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
  padding-right: 12px;
  font-size: 11px;
  color: #9ca3af;
  width: 24px;
  flex-shrink: 0;
}

.chart-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-svg {
  flex: 1;
  height: 200px;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.bar {
  rx: 4px;
  ry: 4px;
  transition: height 0.3s ease;
}

.trend-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.data-point {
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

.chart-x-axis {
  display: flex;
  margin-top: 5px;
  padding-left: 20px;
  position: relative;
}

.x-label {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  padding: 0;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 4px;
  border-radius: 2px;
}

.legend-color.bar {
  background: linear-gradient(135deg, #667eea 0%, #667eea 100%);
}

.legend-color.line {
  background: linear-gradient(90deg, #f5576c 0%, #f093fb 100%);
}

.legend-text {
  font-size: 12px;
  color: #6b7280;
}

.chart-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.summary-value.highlight {
  color: #667eea;
}

.hot-products-scroll {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 250px;
}

.hot-products-header {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.hot-products-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.hot-products-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
  margin: 0;
  padding: 0;
}

.hot-products-list::-webkit-scrollbar {
  width: 6px;
}

.hot-products-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.hot-products-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.hot-products-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.hot-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.hot-product-item:last-child {
  border-bottom: none;
}

.product-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: #e5e7eb;
  color: #6b7280;
  flex-shrink: 0;
}

.product-rank.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.product-rank.silver {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
}

.product-rank.bronze {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
}

.product-name {
  flex: 1;
  font-size: 13px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-sales {
  font-size: 12px;
  color: #6b7280;
  margin-right: 12px;
  white-space: nowrap;
}

.product-revenue {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
}

.empty-hot-products {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: #f3f4f6;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: #e5e7eb;
  color: #6b7280;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  white-space: nowrap;
}

.stat-item {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.stat-divider {
  color: #d1d5db;
  flex-shrink: 0;
}

.product-bar-wrapper {
  width: 100px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.product-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.mini-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mini-header h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.category-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-name {
  width: 80px;
  font-size: 13px;
  color: #6b7280;
}

.cat-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.cat-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.cat-percent {
  width: 36px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.realtime-item {
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.realtime-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.realtime-label {
  font-size: 12px;
  color: #9ca3af;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
}

.alert-item.warning {
  background: #fef3c7;
}

.alert-item.success {
  background: #dcfce7;
}

.alert-item.info {
  background: #dbeafe;
}

.alert-icon {
  font-size: 16px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.alert-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.alert-scroll-card {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 250px;
}

.alert-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.alert-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.alert-tab:hover {
  background: #e5e7eb;
}

.alert-tab.active {
  background: #667eea;
  color: white;
}

.tab-icon {
  font-size: 12px;
}

.tab-title {
  font-weight: 500;
}

.alert-content-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
  max-height: 180px;
  padding-right: 8px;
}

.alert-content-scroll::-webkit-scrollbar {
  width: 6px;
}

.alert-content-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.alert-content-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.alert-content-scroll::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.alert-product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #1f2937;
}

.alert-product-item .product-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-product-item .product-extra {
  color: #6b7280;
  white-space: nowrap;
}

.low-stock-text {
  color: #dc2626 !important;
  font-weight: 600;
}

.data-tooltip {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.data-point-group:hover .data-tooltip {
  opacity: 1;
}

.data-point-hit {
  cursor: pointer;
}

.alert-product-item:last-child {
  border-bottom: none;
}

.empty-alert {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .side-panel {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .side-panel .mini-card {
    flex: 1;
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .side-panel {
    flex-direction: column;
  }
}
</style>