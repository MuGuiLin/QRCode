import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './modules'

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
