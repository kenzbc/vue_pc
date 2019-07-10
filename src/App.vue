<template>
    <div id="app" :data-page="$route.name" :class="{'scroll': scrollTop > 0}" @mousemove="mouseMoveHandler">
        <VuePerfectScrollbar ref="scrollbar" class="scrollbar" id="scrollbar" :settings="settings" @ps-scroll-y="scrollEvent">
            <lfl-header v-if="$route.name != '404'"></lfl-header>

            <router-view></router-view>

            <el-dialog id="login" top="20%" :visible.sync="login.dialogShow" :close-on-click-modal="!login.loading && !$route.meta.auth" :close-on-press-escape="!login.loading">
                <div class="main fl" v-loading="login.loading">
                    <div class="tabs">
                        <div class="tab">登录</div>
                    </div>
                    <div class="form">
                        <div class="form-input area-select-form">
                            <lfl-icon icon="earth"></lfl-icon>
                            <el-select class="area-select" filterable v-model="login.params.area_code" placeholder="请选择区号">
                                <el-option v-for="(item,index) in login.areaCodeList" :key="index" :label="item.country" :value="item.area_code">
                                    <span style="float: left">{{item.country}}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">+ {{item.area_code}}</span>
                                </el-option>
                            </el-select>
                            <span class="area-number">+ {{login.params.area_code}}</span>
                        </div>
                        <div class="form-input">
                            <lfl-icon icon="username"></lfl-icon>
                            <input name="username" v-model="login.params.uuid" placeholder="输入账号" @keydown.enter="submitLogin"/>
                        </div>
                        <div class="form-input">
                            <lfl-icon icon="password"></lfl-icon>
                            <input ref="password" @focus="passwordFocusEvent" v-model="login.params.key" placeholder="输入密码" @keydown.enter="submitLogin" autocomplete="off"/>
                        </div>
                    </div>
                    <!-- 第三方登录增加 class third-platform -->
                    <div class="actions third-platform">
                        <el-button class="button submit" @click="submitLogin" :disabled="!checkInput">登录</el-button>
                        <a :href="domain + '/services/weibo/login.php' + goUrl" class="button">
                            <lfl-icon icon="weibo" class="weibo"></lfl-icon>
                        </a><a :href="domain + '/services/qq/login.php' + goUrl" class="button">
                        <lfl-icon icon="qq" class="qq"></lfl-icon>
                    </a><a :href="domain + '/services/weixin/login.php' + goUrl" class="button">
                        <lfl-icon icon="wechat" class="wechat"></lfl-icon>
                    </a>
                    </div>
                    <div class="links">
                        <a :href="domain + '/register?redirect_url=' + redirect_url" class="fl">注册账号</a>
                        <a :href="domain + '/password'" target="_blank" class="fr">忘记密码？</a>
                    </div>
                </div>
                <div class="bg fr" @click="backHome"></div>
                <div class="clearfix"></div>
            </el-dialog>

            <el-dialog id="share" top="20%" :title="share.title" :visible.sync="share.dialogShow">
                <div class="room-info">
                    <div class="room-title">{{share.room.name}}</div>
                    <div class="room-code" v-if="parseInt(share.room.code) > 0">房间号：<span class="light">{{share.room.code}}</span></div>
                    <div class="clearfix"></div>
                </div>
                <div class="link-box">
                    <input readonly v-model="shareLink"/>
                    <el-button type="primary" v-clipboard="clipboardText" @success="$message.success('复制成功')" @error="$message.error('复制失败')">复制链接</el-button>
                </div>
            </el-dialog>

            <el-dialog id="pop" top="25%" :visible.sync="pop.dialogShow" :close-on-click-modal="false" :close-on-press-escape="false">
                <span class="close-btn" @click="pop.dialogShow = false">
                    <lfl-icon icon="close-btn-round"></lfl-icon>
                </span>
                <div class="background" :style="{backgroundImage: 'url(\''+ pop.data.image_url +'\')'}"><a target="_blank" :href="pop.data.jump_url_web.indexOf('famulei.com') != -1 ? fmlUrl(pop.data.jump_url_web, member, true) : pop.data.jump_url_web" v-if="pop.data.jump_url_web"></a></div>
            </el-dialog>

            <el-dialog :title="popTitle" :visible.sync="address.dialogAddress" id="popAddress" class="pop-address">
                <div class="address-details">
                    <ul>
                        <li class="region">
                            <span class="lable">省市：</span>
                            <el-select v-model="address.selected.province.text" @change="getSelectProvince" clearable placeholder="请选择省份" class="select-address">
                                <el-option
                                        v-for="item in address.regionsMap"
                                        :key="item.region_id"
                                        :label="item.local_name"
                                        :value="item.region_id">
                                </el-option>
                            </el-select>
                            <el-select v-model="address.selected.city.text" @change="getSelectCity" clearable placeholder="请选择城市" class="select-address" :disabled="isCitySelect">
                                <el-option
                                        v-for="item in filterCityData"
                                        :key="item.region_id"
                                        :label="item.local_name"
                                        :value="item.region_id">
                                </el-option>
                            </el-select>
                            <el-select v-model="address.selected.county.text" @change="getSelectCounty" clearable placeholder="请选择区县" class="select-address" :disabled="isCountySelect">
                                <el-option
                                        v-for="item in filterCountyData"
                                        :key="item.region_id"
                                        :label="item.local_name"
                                        :value="item.region_id">
                                </el-option>
                            </el-select>
                        </li>
                        <li><span class="lable">详细地址：</span>
                            <el-input v-model="address.updateAddress.addr" placeholder="" class="input-address"></el-input>
                        </li>
                        <li><span class="lable">邮编：</span>
                            <el-input v-model="address.updateAddress.zip" placeholder="" class="input-text"></el-input>
                        </li>
                        <li><span class="lable">收货人：</span>
                            <el-input v-model="address.updateAddress.name" placeholder="" class="input-text"></el-input>
                        </li>
                        <li><span class="lable">手机号码：</span>
                            <el-input v-model="address.updateAddress.mobile" placeholder="" class="input-text"></el-input>
                        </li>
                        <li class="btn-box">
                            <el-button type="primary" class="ok" @click="submitAddress()">确定</el-button>
                            <el-button type="primary" class="cancel" @click="address.dialogAddress = false">取消</el-button>
                        </li>
                    </ul>
                </div>
            </el-dialog>

        </VuePerfectScrollbar>
    </div>
</template>

<script>

    export default {
        watch: {
            '$route'(data) {
                let scrollbar = document.getElementById('scrollbar');
                scrollbar.scrollTop = 0;
            },
            'login.dialogShow'(isShow) {
                if (isShow) {
                    if (!this.login.areaCodeList.length) {
                        this.getAreaCodeList();
                    }
                }
            }
        },
        data() {
            return {
                popTitle: '',
                address: {
                    dialogAddress: false,
                    isDisabledCity: true,
                    isDisabledCounty: true,
                    getSuccess: false,
                    auth: false,
                    initial: false,
                    selected: {
                        province: {
                            id: '',
                            text: '',
                        },
                        city: {
                            id: '',
                            text: '',
                        },
                        county: {
                            id: '',
                            text: '',
                        }
                    },
                    action: 'add',
                    updateAddress: {
                        addr: '',
                        addr_id: '',
                        addr_name: '',
                        def_addr: 0,
                        name: '',
                        mobile: '',
                        zip: '',
                        region_id: ''
                    },
                    regionsMap: [],
                    provinceList: [],
                    currSelectCityList: [],
                    currSelectCountyList: [],
                    data: {
                        list: []
                    },
                },
                areaNumber: '+ 86',
                settings: {
                    wheelSpeed: .8,
                    minScrollbarLength: 10,
                    wheelPropagation: false
                },
                scrollTop: 0,
                refreshTimeout: null,
                login: {
                    params: {
                        uuid: '',
                        key: '',
                        type: '999',
                        area_code: '86'
                    },
                    areaCodeList: [],
                    focus: false,
                    loading: false,
                    dialogShow: false
                },
                share: {
                    dialogShow: false,
                    title: '分享房间',
                    room: {
                        id: '',
                        name: '',
                        code: ''
                    }
                },
                pop: {
                    isShow: false,
                    dialogShow: false,
                    data: {
                        image_url: '',
                        type: -1,
                        jump_url_web: ''
                    }
                }
            };
        },
        mounted() {
            let loading = document.getElementById('loading');
            setTimeout(_ => {
                loading.setAttribute('class', 'hide');
                setTimeout(_ => {
                    loading.style.display = 'none';
                }, 800);
            }, 500);

            // 地址弹窗
            this.$root.hub.$on('showAddress', _ => {
                this.address.action = 'add';
                this.address.dialogAddress = true;
                this.resetFormData();
                this.getRegionsMap();
                this.popTitle = "添加新地址";
            });
            //修改地址
            this.$root.hub.$on('modAddress', (detail) => {
                this.address.dialogAddress = true;
                this.popTitle = "修改收货地址";
                this.modAddressHandle(detail);
            });
            this.$root.hub.$on('scrollDown', _ => {
                this.scrollDown();
            });

            this.$root.hub.$on('refreshToken', _ => {
                this.refreshToken();
            });

            this.$root.hub.$on('showLogin', _ => {
                this.login.dialogShow = true;
            });

            this.$root.hub.$on('showShare', room => {
                this.share.room = room;
                this.share.dialogShow = true;
            });

            this.$root.hub.$on('showPop', pop => {
                this.pop.data = pop;
                this.popDataHandler();
            });

            this.$root.hub.$on('removeMember', room => {
                this.$store.commit('setMemberItem', {key: 'info', val: null});
                this.$store.commit('setMemberItem', {key: 'bank', val: null});
                this.$store.commit('setMemberItem', {key: 'token', val: null});
                this.$store.commit('setMemberItem', {key: 'member_id', val: null});
                this.storage.removeItem('member');
            });

            this.$root.hub.$on('updateBank', _ => {
                this.getMemberBank();
            });

            this.getMemberInfo();
            this.getMemberBank();
        },
        created() {
            let params = this.$route.query;
            if (params.token != null && params.member_id != null) {
                this.$store.commit('setMemberItem', {key: 'token', val: params.token});
                this.$store.commit('setMemberItem', {key: 'member_id', val: params.member_id});
            } else if (params.key != null && params.uuid != null && params.type != null) {
                this.submitLogin(params);
            } else {
                let member = this.storage.getItem('member');
                if (member) {
                    this.$store.commit('setMemberItem', {key: 'info', val: member.data});
                    this.$store.commit('setMemberItem', {key: 'token', val: member.token});
                    this.$store.commit('setMemberItem', {key: 'member_id', val: member.member_id});
                }
            }
        },
        computed: {
            filterCityData() {
                return this.address.currSelectCityList;
            },
            filterCountyData() {
                return this.address.currSelectCountyList;
            },
            isCitySelect() {
                return this.address.currSelectCityList.length > 0 ? false : true;
            },
            isCountySelect() {
                return this.address.currSelectCountyList.length > 0 ? false : true;
            },
            member() {
                return this.$store.state.member;
            },
            shareContent() {
                return '你的好友喊你来幻联赛《' + this.share.room.name + '》PK，比拼LOL游戏理解，链接 ';
            },
            shareLink() {
                return location.origin + '/room/' + this.share.room.id;
            },
            clipboardText() {
                return this.shareContent + this.shareLink;
            },
            domain() {
                let url = '';
                let host = {
                    'localhost': 'dev',
                    'lfl.gg': 'www',
                    'dev.lfl.gg': 'dev',
                    'staging-1.lfl.gg': 'staging-1',
                    'staging-2.lfl.gg': 'staging-2',
                    'staging-3.lfl.gg': 'staging-3',
                };
                url = 'http://' + host[location.hostname] + '.famulei.com';
                return url;
            },
            redirect_url() {
                return location.href;
            },
            goUrl() {
                return '?go_url=' + this.base64.encode(location.origin + location.pathname);
            },
        },
        methods: {
            getRegionsMap() {
                if (this.address.getSuccess) return;
                this.api('/services/userCenter/get_regions_all.php').then(req => {
                    if (req.code == 200) {
                        this.address.regionsMap = req.data || [];
                        this.address.getSuccess = true;
                    }
                });

            },
            //提交地址
            submitAddress() {
                let options = {
                    name: this.address.updateAddress.name || '',
                    mobile: this.address.updateAddress.mobile || '',
                    zipcode: this.address.updateAddress.zip || '',
                    region_id: this.address.updateAddress.region_id || '',
                    addr: this.address.updateAddress.addr || '',
                    addr_id: this.address.updateAddress.addr_id || '',
                };
                if (options.region_id == '') return this.$message.warning('请选择完整的地区信息！');
                if (options.addr == '') return this.$message.warning('请填写一个详细地址！');
                if (options.zipcode == '') return this.$message.warning('请填写一个邮政编码！');
                if (options.name == '') return this.$message.warning('请填写一个收货人！');
                if (options.mobile == '') return this.$message.warning('请填写一个手机号码！');

                this.api('/services/userCenter/my_address_save.php', options).then(req => {
                    if (req.code == '200') {
                        this.address.dialogAddress = false;
                        this.address.action == "add" ? this.$message.success('地址添加成功！') : this.$message.success('地址修改成功！');
                        this.api('/services/userCenter/my_address_list.php', {limit: 50}).then(req => {
                            if (req.code == '200') {
                                this.address.data = req.data.list;
                                this.$store.commit("address", req.data.list);
                            }
                        });
                    }
                });
            },
            // 省份
            getSelectProvince(value) {
                let data = this.address.regionsMap.filter(item => {
                    return item.region_id == value;
                });
                this.address.currSelectCityList = data.length ? data[0].items : [];

                if (data.length) {
                    this.address.selected.city.text = '';
                    this.address.selected.county.text = '';
                }
            },
            // 二级地区
            getSelectCity(value) {
                let data = this.address.currSelectCityList.filter(item => {
                    return item.region_id == value;
                });
                this.address.currSelectCountyList = data.length ? data[0].items : [];

                // 如果没有三级地区，则默认或选择的二级地区的region_id
                if (data.length && data[0].items.length > 0) {
                    this.address.updateAddress.region_id = '';
                } else if (typeof value === 'number' || /^[0-9]*$/.test(value)) {
                    this.address.updateAddress.region_id = value;
                }
            },
            // 三级地区
            getSelectCounty(value) {
                if (this.address.currSelectCountyList.length) {
                    this.address.updateAddress.region_id = value;
                }
            },
            // 修改地址弹窗显示
            modAddressHandle(detail) {
                this.address.action = 'update';
                this.resetFormData();
                this.getRegionsMap();
                let addr = detail.item.addr_name.split('-') || [];
                this.address.selected.province.text = addr[0];
                this.address.selected.city.text = addr[1];
                this.address.selected.county.text = addr[2];

                this.address.updateAddress.addr = detail.item.addr || '';
                this.address.updateAddress.addr_id = detail.item.addr_id || '';
                this.address.updateAddress.addr_name = detail.item.addr_name || '';
                this.address.updateAddress.def_addr = detail.item.def_addr || '';
                this.address.updateAddress.name = detail.item.name || '';
                this.address.updateAddress.mobile = detail.item.mobile || '';
                this.address.updateAddress.zip = detail.item.zip || '';
                this.address.updateAddress.region_id = detail.item.region_id || '';



            },
            // 重置地址数据
            resetFormData() {
                this.address.selected.province.text = '';
                this.address.selected.city.text = '';
                this.address.selected.county.text = '';

                this.address.updateAddress.addr = '';
                this.address.updateAddress.addr_id = '';
                this.address.updateAddress.addr_name = '';
                this.address.updateAddress.def_addr = '';
                this.address.updateAddress.name = '';
                this.address.updateAddress.mobile = '';
                this.address.updateAddress.zip = '';
                this.address.updateAddress.region_id = '';

                this.address.currSelectCityList = [];
                this.address.currSelectCountyList = [];
            },
            getAreaCodeList() {
                this.login.loading = true;
                this.api('/services/member/country_code_list.php').then(req => {
                    if (req.code == 200) {
                        this.login.areaCodeList = req.data;
                    }
                    this.login.loading = false;
                });
            },
            passwordFocusEvent() {
                this.$refs['password'].type = 'password';
            },
            getMemberInfo() {
                if (!this.member.member_id) return;
                let member_id = this.member.member_id;
                this.api('/services/member/get_user_info.php', {broadcast_id: member_id, member_id}).then(req => {
                    if (req.code == 200) {
                        this.saveMember(req.data);
                    }
                });
            },
            getMemberBank() {
                if (!this.member.token) return;
                this.api('/services/userCenter/my_bank.php').then(req => {
                    if (req.code == 200) {
                        this.$store.commit('setMemberItem', {key: 'bank', val: req.data});
                    }
                });
            },
            popDataHandler() {
                if (this.pop.isShow) return;
                let oldData = this.storage.getItem('pop');
                let newData = this.pop.data;
                if (newData.id) {
                    switch (newData.type) {
                        case '0': {
                            this.pop.dialogShow = true;
                        }
                        case '1': {
                            let today = this.moment().format('YYYY-MM-DD');
                            if (!oldData || (oldData && oldData.id == newData.id && (!oldData.day || oldData.day != today))) {
                                this.pop.dialogShow = true;
                            }
                            newData.day = today;
                            break;
                        }
                        case '2': {
                            if (!oldData || (oldData && oldData.id == newData.id && !oldData.show)) {
                                this.pop.dialogShow = true;
                            }
                            newData.show = true;
                            break;
                        }
                    }
                    if (!oldData || (oldData && oldData.id != newData.id)) {
                    }
                    this.storage.setItem('pop', newData);
                }
                this.pop.isShow = true;
            },
            refreshToken() {
                if (this.refreshTimeout) {
                    clearTimeout(this.refreshTimeout);
                }
                let member = this.storage.getItem('member');
                this.refreshTimeout = setTimeout(_ => {
                    this.api('/services/webAPI/refresh_token.php', req => {
                        this.$root.hub.$emit('removeMember');
                        this.$message.error(req.message);
                    }).then(req => {
                        this.$store.commit('setMemberItem', {key: 'token', val: req.data.w_token});
                        member.token = req.data.w_token;
                        this.storage.setItem('member', member);
                    });

                }, 1000 * 60 * 30);
            },
            scrollEvent() {

                this.$store.commit('scrollTop', event.target.scrollTop);
                //this.scrollTop = event.target.scrollTop
            },
            scrollDown() {
                let scrollbar = document.getElementById('scrollbar');
                scrollbar.scrollTop = scrollbar.scrollHeight;
            },
            submitLogin(params) {
                if (!params.uuid) {
                    if (!this.checkInput) return;
                }

                let _params = params.uuid ? params : this.login.params;
                if (!_params.uuid.length) {
                    this.$message.error('账号不能为空');
                    return;
                }
                if (!_params.key.length) {
                    this.$message.error('密码不能为空');
                    return;
                }

                this.login.loading = true;

                this.api('/services/webAPI/login.php', _params).then(req => {
                    if (req.code == 200) {
                        this.login.dialogShow = false;
                        this.saveMember(req.data);
                        this.getMemberBank();
                        this.login.params.key = '';
                        this.$message.success('登录成功');
                    } else {
                        this.$message.error(req.message);
                        this.$root.hub.$emit('removeMember');
                    }
                    //this.$router.replace(this.$route.path)
                    this.login.loading = false;
                });
            },
            saveMember(data) {
                this.$store.commit('setMemberItem', {key: 'info', val: data});
                this.$store.commit('setMemberItem', {key: 'member_id', val: data.member_id});
                if (data.w_token) {
                    this.$store.commit('setMemberItem', {key: 'token', val: data.w_token});
                }
                this.storage.setItem('member', {
                    data: data,
                    token: data.w_token || this.member.token,
                    member_id: data.member_id,
                    expire_time: this.moment(this.moment().add(1, 'h')).format('YYYY-MM-DD HH:mm:ss'),
                    expire_second: this.moment(this.moment().add(1, 'h')).unix(),
                });
                if (this.$route.query.token != null) {
                    if (this.$route.query.id) {
                        this.$router.replace(this.$route.path + '?id=' + this.$route.query.id);
                    } else {
                        this.$router.replace(this.$route.path);
                    }

                }
            },
            checkInput() {
                let bool = true;
                if (this.login.params.uuid.length == 0 || this.login.params.key.length == 0) {
                    bool = false;
                }
                return bool;
            },
            backHome() {
                this.login.dialogShow = false;
                this.$router.replace('/');
            },
            mouseMoveHandler(e) {
                if (this.$route.name == 'invitation') {
                    this.$root.hub.$emit('mousemove', e);
                }
            }
        }
    };
</script>

<style lang="stylus">
    @import '../static/css/element.css'
    @import '../static/css/style.styl'
    @import '../static/css/app.styl'
    // @import '../static/css/mobile.styl'
</style>
