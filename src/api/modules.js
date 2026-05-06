import request from "./index";

export const productManageApi = {
  list: (data) => request.post("/product/manage/list", data),
  add: (data) => request.post("/product/manage", data),
  update: (data) => request.put("/product/manage", data),
  delete: (data) => request.post("/product/manage/delete", data),
  detail: (data) => request.post("/product/manage/detail", data),
  updateStatus: (data) => request.post("/product/manage/status", data),
  batchStatus: (data) => request.post("/product/manage/batch/status", data),
};

export const brandApi = {
  all: () => request.get("/brand/all"),
};

export const categoryApi = {
  tree: () => request.get("/category/tree"),
};

export const productStatsApi = {
  hot: (data) => request.post("/product/stats/hot", data),
  recommended: () => request.post("/product/stats/recommended"),
  newProducts: () => request.post("/product/stats/new"),
  topRated: (data) => request.post("/product/stats/rating/top", data),
  topViewed: (data) => request.post("/product/stats/view/top", data),
  topFavorite: (data) => request.post("/product/stats/favorite/top", data),
};

export const orderApi = {
  create: (data) => request.post("/order", data),
};

export const cartApi = {
  list: (userId) => request.get(`/cart/${userId}`),
};

export const paymentApi = {
  create: (data) => request.post("/payment/create", data),
};

export const reviewApi = {
  list: (data) => request.post("/review/list", data),
  delete: (data) => request.post("/review/delete", data),
};

export const analyticsApi = {
  overview: () => request.get("/analytics/overview"),
  hotProducts: () => request.get("/analytics/hotProducts"),
  salesTrendData: (period, days) => request.get(`/analytics/salesTrend?period=${period}&days=${days}`),
  realtime: () => request.get("/analytics/realtime"),
  alerts: () => request.get("/analytics/alerts"),
};
