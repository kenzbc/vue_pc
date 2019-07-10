import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from '../views/home.vue'
import room from '../views/room.vue'
import roomMatch from '../views/room-match.vue'
import roomCustom from '../views/room-custom.vue'
import myRoom from '../views/my-room.vue'
import myRoomDetail from '../views/my-room-detail.vue'
import myRecord from '../views/my-record.vue'
import myLineup from '../views/my-lineup.vue'
import myDetail from '../views/my-detail.vue'
import ranking from '../views/ranking.vue'
import mall from '../views/mall.vue'
import recharge from '../views/recharge.vue'
import invitation from '../views/invitation.vue'
import page404 from '../views/404.vue'
import mallDetail from '../views/mall-detail.vue'

let mode = 'history'

export default new VueRouter({
    mode: mode,
    routes: [
        {path: '/', name: 'home', component: home},
        {path: '/room/match', name: 'room-match', component: roomMatch},
        {path: '/room/custom', name: 'room-custom', component: roomCustom, meta: {auth: true}},
        {path: '/room/custom/choose', name: 'room-custom-choose', component: room, meta: {auth: true}},
        {path: '/room/:roomId', name: 'room', component: room, meta: {auth: true}},
        {path: '/room/:roomId/:orderId', name: 'room-order', component: room, meta: {auth: true}},

        {path: '/my', redirect: '/my/room/0'},
        {path: '/my/room/', redirect: '/my/room/0', meta: {auth: true}},
        {path: '/my/room/0', name: 'my-room-0', component: myRoom, meta: {auth: true}},
        {path: '/my/room/1', name: 'my-room-1', component: myRoom, meta: {auth: true}},
        {path: '/my/room/2', name: 'my-room-2', component: myRoom, meta: {auth: true}},
        {path: '/my/room/:roomId', name: 'my-room-detail', component: myRoomDetail, meta: {auth: true}},
        {path: '/my/record', name: 'my-record', component: myRecord, meta: {auth: true}},
        {path: '/my/detail', redirect: '/my/detail/diamond', meta: {auth: true}},
        {path: '/my/detail/:type', name: 'my-detail', component: myDetail, meta: {auth: true}},
        {path: '/my/lineup', name: 'my-lineup', component: myLineup, meta: {auth: true}},

        {path: '/ranking', name: 'ranking', component: ranking},
        {path: '/mall', name: 'mall', component: mall},
        //{path: '/mall/:id', name: 'mall-detail', component: mall},
        {path: '/mall/:id', name: 'mall-detail', component: mallDetail},
        // {path: '/mall/:id', name: 'mall-recommend', component: mall},
        // {path: '/mall/:id', name: 'mall-select', component: mall},
        {path: '/recharge', redirect: '/recharge/diamond'},
        {path: '/recharge/:type', name: 'recharge', component: recharge, meta: {auth: true}},

        {path: '/invitation', name: 'invitation', component: invitation, meta: {auth: true}},
        {path: '/404', name: '404', component: page404},
        {path: '/:type', name: 'home-type', component: home},
        {path: '*', redirect: '/404'}
    ]
})