import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
  },
  {
    path: "/product",
    name: "Product",
    component: () => import("../views/Product.vue"),
  },
  {
    path: "/product/stats",
    name: "ProductStats",
    component: () => import("../views/ProductStats.vue"),
  },
  {
    path: "/order",
    name: "Order",
    component: () => import("../views/Order.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../views/Cart.vue"),
  },
  {
    path: "/payment",
    name: "Payment",
    component: () => import("../views/Payment.vue"),
  },
  {
    path: "/review",
    name: "Review",
    component: () => import("../views/Review.vue"),
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("../views/Analytics.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
