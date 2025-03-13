import ShopIndex from '@/views/shop/ShopIndex.vue';
import ShopCheckout from '@/views/shop/ShopCheckout.vue';
import ShopOrderHistory from '@/views/shop/ShopOrderHistory.vue';
import ShopOrderDetail from '@/views/shop/ShopOrderDetail.vue';
import VendorAdminProfile from '@/views/vendor_admin/VendorAdminProfile.vue';
import VendorAdminActivity from '@/views/vendor_admin/VendorAdminActivity.vue';
import VendorAdminActivityDetail from '@/views/vendor_admin/VendorAdminActivityDetail.vue';
import VendorAdminAddActivity from '@/views/vendor_admin/VendorAdminAddActivity.vue';
import VendorAdminReviews from '@/views/vendor_admin/VendorAdminReviews.vue';
import VendorAdminActivityReviews from '@/views/vendor_admin/VendorAdminActivityReviews.vue';
import VendorAdminActivityReviews2 from '@/views/vendor_admin/VendorAdminActivityReviews2.vue';
import VendorAdminActivityRegistration from '@/views/vendor_admin/VendorAdminActivityRegistration.vue';


export default [
    {
        path: '/vendor/admin/profile',
        name: 'VendorAdminProfile',
        component: VendorAdminProfile
    },
    {
        path: '/vendor/admin/activity',
        name: 'VendorAdminActivity',
        component: VendorAdminActivity
    },

    {
        path: '/vendor/admin/activity/detail/:id',
        name: 'VendorAdminActivityDetail',
        component: VendorAdminActivityDetail
    },

    {
        path: '/vendor/admin/activity/add',
        name: 'VendorAdminAddActivity',
        component: VendorAdminAddActivity
    },

    {
        path: '/vendor/admin/reviews',
        name: 'VendorAdminReviews',
        component: VendorAdminReviews
    },

    {
        path: '/vendor/admin/activity/reviews',
        name: 'VendorAdminActivityReviews',
        component: VendorAdminActivityReviews
    },

    {
        path: '/vendor/admin/activity/registration/:id',
        name: 'VendorAdminActivityRegistration',
        component: VendorAdminActivityRegistration
    }
];
