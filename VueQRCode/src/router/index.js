import Vue from 'vue'
import VueRouter from 'vue-router'
import Qrcode from '../views/Qrcode.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Qrcode',
    component: Qrcode
  },
  {
    path: '/reader',
    name: 'Reader',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Reader.vue')
  }
]

const router = new VueRouter({
  mode: 'hash', // history
  base: process.env.BASE_URL,
  routes
})

export default router
