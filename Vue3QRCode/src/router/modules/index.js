import viewQrcode from '@/views/view-qrcode';

// const reqFiles = require.context('./', true, /\.ts$/);

export const routes = [
    {
        path: '/',
        name: 'viewQrcode',
        // route level code-splitting
        // this generates a separate chunk (mine.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: viewQrcode,
        meta: {
            title: "二维码生成"
        }
    },
    {
        path: '/reader',
        name: 'viewReader',
        component: () => import('@/views/view-reader.vue'),
        meta: {
            title: "二维码识别"
        }
    },
    {
        path: "/:pathMatch(.*)",
        redirect: "/",
    },
];
