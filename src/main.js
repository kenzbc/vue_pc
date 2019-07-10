import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import moment from 'moment';
import 'moment/locale/zh-cn';
import axios from 'axios';
import router from './router';
import store from './store';
import 'animate.css';
import qs from 'qs';

import VueClipboards from 'vue-clipboards';

Vue.use(VueClipboards);

import ElementUI from 'element-ui';

Vue.use(ElementUI);

import './assets/svg';

Vue.use(Vuex);

import localForage from 'localforage';

localForage.config({
    name: 'lfl',
    storeName: 'store',
    version: '1'
});

Vue.directive('focus', {
    update: function (el, {value}) {
        if (value) {
            el.focus();
        }
    }
});

Vue.prototype.store = localForage;
const storage = Vue.prototype.storage = {
    setItem(key, value) {
        if (arguments.length === 2) {
            var v = value;
            if (typeof v == 'object') {
                v = JSON.stringify(v);
                v = 'obj-' + v;
            } else {
                v = 'str-' + v;
            }
            window.localStorage.setItem(key, v);
        }
    },
    getItem(key) {
        var v = window.localStorage.getItem(key);
        if (!v) return null;
        if (v.indexOf('obj-') === 0) {
            v = v.slice(4);
            return JSON.parse(v);
        } else if (v.indexOf('str-') === 0) {
            return v.slice(4);
        }
    },
    removeItem(key) {
        if (key) {
            window.localStorage.removeItem(key);
        }
    }
};

import components from './components/';

Object.keys(components).forEach(key => {
    Vue.component(key, components[key]);
});

const playerStatus = {
    0: '未选择',
    1: '主力',
    2: '替补',
    3: '退役',
    4: '不活跃'
};

Vue.filter('playerStatus', function (value) {
    return playerStatus[value];
});

Vue.filter('image', function (value, w, h) {
    return value + '?x-oss-process=image/resize,m_fill,h_' + h + ',w_' + w;
});

Vue.filter('datetime', function (value, format) {
    return moment(value, 'X').format(format || 'YYYY-MM-DD HH:mm:ss');
});

Vue.filter('number', function (value) {
    return value > 1000000 ? (value / 1000000).toFixed(1) + ' M' : value > 100000 ? (value / 1000).toFixed(0) + 'K' : value;
});

let hub = Vue.prototype.hub = Vue.prototype.hub || new Vue();

let host = {
    'localhost': 'staging-1',
    // 'localhost': 'dev',
    'lfl.gg': 'www',
    'dev.lfl.gg': 'dev',
    'staging-1.lfl.gg': 'staging-1',
    'staging-2.lfl.gg': 'staging-2',
    'staging-3.lfl.gg': 'staging-3',
};
let domain = 'https://' + (host[location.hostname] || 'www') + '.famulei.com';

let hostJson = {
  'localhost': 'stag1/third_exchange_goods_home_new3',
  // 'localhost': 'dev/third_exchange_goods_home3',
  'dev.lfl.gg': 'dev/third_exchange_goods_home_new3',
  'staging-1.lfl.gg': 'stag1/third_exchange_goods_home_new3',
  'staging-2.lfl.gg': 'stag1/third_exchange_goods_home_new3',
  'staging-3.lfl.gg': 'stag1/third_exchange_goods_home_new3',
  'lfl.gg': 'third_exchange_goods_home_new3',
};
let doJson = 'https://img1.famulei.com/' + hostJson[location.hostname] + '/1.json';

Vue.prototype.doJson = doJson; // JSON 数据

Vue.prototype.domain = domain;
Vue.prototype.fmlUrl = (path, member, isDomain) => {
    let url = (isDomain ? '' : domain) + path;
    if (member.member_id && member.token) {
        url = domain + '/services/web_redirect.php?member_id=' + member.member_id + '&token=' + member.token + '&url=' + decodeURI(url);
    }
    return url;
};
Vue.prototype.moment = moment;
Vue.prototype.base64 = require('js-base64').Base64;
Vue.prototype.ajax = function () {
    const HOST = '/services/fantasy/';
    let _params = {};
    let _method = 'get';
    let _then = null;
    let _catch = null;
    for (let i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'string') {
            _method = arguments[i];
        } else if (typeof arguments[i] === 'object') {
            _params = arguments[i];
        } else if (typeof arguments[i] === 'function' && !_then) {
            _then = arguments[i];
        } else if (typeof arguments[i] === 'function' && !_catch) {
            _catch = arguments[i];
        }
    }
    let _host = HOST;
    let url = arguments[0];

    let aliApi = ['/player/', '/tournament/'];

    if (url.indexOf('/services/') == 0) {
        _host = '';
    } else {
        for (let i in aliApi) {
            if (url.indexOf(aliApi[i]) != -1) {
                _host = 'https://img1.famulei.com';
                if (location.hostname != 'www.famulei.com' && location.hostname != 'lfl.gg') {
                    url = url.replace(aliApi[i], aliApi[i] + 'test/');
                }
                break;
            }
        }
    }

    let _config = {
        method: _method,
        url: url,
        baseURL: _host,
    };
    if (_method === 'get') {
        _config.params = _params;
    } else {
        _config.data = qs.stringify(_params);
    }
    return axios(_config).then(_then).catch(_catch);
};

Vue.prototype.axios = axios;

Vue.prototype.api = function () {
    let member = this.$store.state.member;
    let Base64 = require('js-base64').Base64;

    const HOST = {
        'dev.lfl.gg': 'dev-api',
        'staging-1.lfl.gg': 'https://staging-api-1',
        'staging-2.lfl.gg': 'https://staging-api-2',
        'staging-3.lfl.gg': 'https://staging-api-3',
        'localhost': 'https://staging-api-1',
        // 'localhost': 'https://dev-api',
        'lfl.gg': 'https://api-v2'
    };
    const _HOST = HOST[location.hostname] + '.famulei.com';
    //const _HOST = '//' + HOST[location.hostname] + '.famulei.com'

    const KEY = 'FWAPIKFML';
    let _params = {};
    let errorFunction = null;

    for (let i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'object') {
            _params = arguments[i];
        } else if (typeof arguments[i] === 'function' && !errorFunction) {
            errorFunction = arguments[i];
        }
    }

    let urlPath = '/services/webAPI/';
    let url = 'handler.php';

    let config = {
        method: 'post',
        url: urlPath + url,
        baseURL: _HOST,
        timeout: 10000
    };

    if (member.member_id) _params.member_id = member.member_id;
    else delete _params.member_id;

    _params.api_version = '9.9.9';
    _params.platform = 'web';
    _params.ts = moment().unix();

    if (arguments[0].indexOf('refresh_token.php') != -1) {
        _params.token = member.token;
        config.method = 'get';
        config.url = arguments[0] + '?' + qs.stringify(_params);
    } else {
        let param = Base64.encode(Base64.encode(qs.stringify(_params)) + KEY);
        let data = {
            path: arguments[0],
            param: param,
            token: member.token
        };
        config.data = qs.stringify(data);
    }

    if (location.hostname.indexOf('localhost') != -1 || location.hostname.indexOf('staging') != -1 || location.hostname.indexOf('dev') != -1) {
        // console.log('%c%s', 'color: #0c9dfc;font-weight: bold;', arguments[0])
        // console.log('%c%s', 'color: #009829;font-weight: bold;', JSON.stringify(_params))
        // console.log('')
    }

    let ajax = axios(config).then(req => {
        if (req.data.code != 200) {
            if (errorFunction) {
                errorFunction(req.data);
            } else {
                if (req.data.code == 40500) {
                    if (storage.getItem('member')) {
                        this.$message.warning('登录信息失效，请重新登录');
                    }
                    this.$root.hub.$emit('removeMember');
                } else {
                    this.$message.error(req.data.message);
                }
            }
        }
        return req.data;
    }).catch(error => {
        if (error.code == 'ECONNABORTED') {
            this.$message.error('请求超时');
        }
        return error;
    });

    return ajax;
};

router.beforeEach((to, from, next) => {

    let params = to.query;
    if (params.token != null && params.member_id != null) {
        store.commit('setMemberItem', {key: 'token', val: params.token});
        store.commit('setMemberItem', {key: 'member_id', val: params.member_id});
    }

    let {auth = false} = to.meta;
    let isLogin = Boolean(store.state.member.token);
    if (auth && !isLogin) {
        hub.$emit('showLogin');
        // return next({path: from.path})
    }
    next();
});

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});
