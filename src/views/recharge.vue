<template>
    <div>
        <div id="recharge" class="container">
            <div id="wechat" v-show="diamond.wechat">
                <div class="title fix-bold-font"><span>{{diamond.buy.list.length ? diamond.buy.list[diamond.buy.index].sku_name : ''}}</span>收款方：上海厚翰信息科技有限公司</div>
                <div class="pay">
                    <div class="title">微信扫码支付</div>
                    <div class="code-img" v-loading="diamond.wechatLoading">
                        <img v-if="diamond.order" :src="'//www.famulei.com/services/picture/qrcode.php?img_size=8&margin=0&http_url=' + diamond.order.code_url" class="wechat" />
                        <img src="/static/image/pay-code-view.png" class="phone-view" />
                    </div>
                    <div class="desc"><lfl-icon icon="scan"></lfl-icon><span>打开微信手机客户端扫一扫</span></div>
                    <table class="info">
                        <tr>
                            <td>交易金额</td>
                            <td class="light">{{diamond.buy.list.length ? diamond.buy.list[diamond.buy.index].sku_price : ''}}元</td>
                        </tr>
                        <tr>
                            <td>支付方式</td>
                            <td class="light">微信支付</td>
                        </tr>
                    </table>
                    <div class="actions">
                        <el-button type="primary" @click="finishPay" :disabled="diamond.checkLoading || diamond.wechatLoading">完成支付</el-button>
                        <el-button type="primary" @click="reSelectPayType" :disabled="diamond.checkLoading || diamond.wechatLoading">重新选择支付方式</el-button>
                    </div>
                </div>
            </div>

            <div class="title fix-bold-font">充值中心<a class="back" href="javascript:history.back();">返回</a></div>
            <div class="main">
                <div class="nav">
                    <div class="nav-item" v-for="(item,index) in leftNav.list" :key="index" :class="[item.type, {'active': leftNav.curr == index},{'disabled': item.disabled}]" @click="leftNav.curr = index">
                        <lfl-icon :icon="item.type"></lfl-icon>
                        <div class="name">{{item.label}}</div>
                    </div>
                </div>

                <div class="body" :class="['diamond', {'show': leftNav.curr == 0}]" v-loading="diamond.loading">
                    <VuePerfectScrollbar class="scrollbar">
                        <div class="alert">
                            <span>防骗声明</span>：近期有以代充为借口向您索要账号密码的行为，纯属诈骗。任何情况下都不要将密码泄露给他人！
                        </div>
                        <div class="wrap" v-if="member.info">
                            <div class="row account">
                                <div class="label fix-bold-font">充值帐号：</div>
                                <div class="content">
                                    <img :src="member.info.avatar || '/static/image/avatar.jpg'" class="avatar" />
                                    <span class="nickname">{{member.info.nickname}}</span>
                                </div>
                            </div>
                            <div class="row diamond clearfix">
                                <div class="label fix-bold-font">购买钻石：</div>
                                <div class="content">
                                    <div class="item" :class="[{'flag': item.has_pmt == 1 || (item.has_first_prize == 0 && item.first_prize != 0)},{'rule': item.has_pmt == 1 && (item.first_prize == 0 || item.has_first_prize == 1)}, {'first': item.has_first_prize == 0 && item.first_prize != 0}, {'active': diamond.buy.index === index}]" v-for="(item,index) in diamond.buy.list" :key="index" @click="diamond.buy.index = index">
                                        <lfl-icon icon="diamond-item"></lfl-icon>
                                        <lfl-icon icon="diamond-item" class="hover"></lfl-icon>
                                        <lfl-icon icon="diamond-item-active" class="active"></lfl-icon>
                                        <div class="inner">
                                            <lfl-icon icon="diamond" class="product"></lfl-icon>
                                            <lfl-icon icon="selected" class="selected"></lfl-icon>
                                            <div class="info">
                                                <div class="name">
                                                    <span class="name-text fix-bold-font">{{item.sku_name}}</span><span class="active-text" v-if="item.has_first_prize != 1 && item.first_desc">{{item.first_desc}}</span>
                                                </div>
                                                <div class="desc"><span v-if="item.rule_desc">活动：</span>{{item.rule_desc ? item.rule_desc : item.sku_desc}}</div>
                                            </div>
                                        </div>
                                        <div class="price">{{item.sku_price}}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="row pay-type">
                                <div class="label fix-bold-font">支付方式：</div>
                                <div class="content">
                                    <div class="play-type-item alipay" :class="{'active': diamond.payType === 3}" @click="diamond.payType = 3">
                                        <lfl-icon icon="alipay" class="logo"></lfl-icon>
                                        <lfl-icon icon="selected" class="selected"></lfl-icon>
                                    </div>
                                    <div class="play-type-item wechat-pay" :class="{'active': diamond.payType === 2}" @click="diamond.payType = 2">
                                        <lfl-icon icon="wechat-pay" class="logo"></lfl-icon>
                                        <lfl-icon icon="selected" class="selected"></lfl-icon>
                                    </div>
                                </div>
                            </div>
                            <div class="row pay-money">
                                <div class="label fix-bold-font">应付金额：</div>
                                <div class="content">
                                    <span class="amount">{{diamond.buy.list.length ? diamond.buy.list[diamond.buy.index].sku_price : 0}}</span><span class="yuan">元</span>
                                    <span class="total">（可获{{availableDiamond}}钻石）</span>
                                </div>
                            </div>
                            <div class="row actions">
                                <div class="label"></div>
                                <div class="content">
                                    <el-button class="button" type="primary" @click="buyDiamond">立即支付</el-button>
                                </div>
                            </div>
                        </div>
                    </VuePerfectScrollbar>
                </div>

                <div class="body" :class="['ticket', {'show': leftNav.curr == 1}]" v-loading="ticket.loading">
                    <VuePerfectScrollbar class="scrollbar">
                        <div class="wrap" v-if="member.info">
                            <div class="row account">
                                <div class="label fix-bold-font">购买帐号：</div>
                                <div class="content">
                                    <img :src="member.info.avatar || '/static/image/avatar.jpg'" class="avatar" />
                                    <span class="nickname">{{member.info.nickname}}</span>
                                </div>
                            </div>
                            <div class="row ticket clearfix">
                                <div class="label fix-bold-font">购买门票：</div>
                                <div class="content">
                                    <div class="item" v-for="(item,index) in ticket.buy.list" :key="index" :class="{'active': ticket.buy.index === index}" @click="ticket.buy.index = index">
                                        <lfl-icon icon="ticket-item"></lfl-icon>
                                        <lfl-icon icon="ticket-item" class="hover"></lfl-icon>
                                        <lfl-icon icon="ticket-item-active" class="active"></lfl-icon>
                                        <lfl-icon icon="ticket" class="mark"></lfl-icon>
                                        <div class="inner">
                                            <lfl-icon icon="ticket" class="product"></lfl-icon>
                                            <lfl-icon icon="selected" class="selected"></lfl-icon>
                                            <div class="number">{{item.ticket}}</div>
                                            <div class="text">- 门票 - </div>
                                            <div class="price"><lfl-icon icon="diamond"></lfl-icon><span>{{item.diamond_number}}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row diamond-balance">
                                <div class="label fix-bold-font">我的钻石：</div>
                                <div class="content"><span>{{member.bank.diamond}}</span><lfl-icon icon="diamond"></lfl-icon></div>
                            </div>
                            <div class="row pay-money">
                                <div class="label fix-bold-font">应付金额：</div>
                                <div class="content">
                                    <span class="amount">{{ticket.buy.list.length ? ticket.buy.list[ticket.buy.index].diamond_number : 0}}</span><span class="yuan">钻石</span><span class="total">（可获{{ticket.buy.list.length ? ticket.buy.list[ticket.buy.index].ticket : 0}}门票）</span>
                                </div>
                            </div>
                            <div class="row actions">
                                <div class="label"></div>
                                <div class="content">
                                    <el-button class="button" type="primary" @click="ticket.dialog.show = true">立即购买</el-button>
                                </div>
                            </div>
                        </div>
                    </VuePerfectScrollbar>
                </div>

                <div class="body" :class="['key', {'show': leftNav.curr == 2}]" v-loading="key.loading">
                    <VuePerfectScrollbar class="scrollbar">
                        <div class="wrap" v-if="member.info">
                            <div class="row account">
                                <div class="label fix-bold-font">购买帐号：</div>
                                <div class="content">
                                    <img :src="member.info.avatar || '/static/image/avatar.jpg'" class="avatar" />
                                    <span class="nickname">{{member.info.nickname}}</span>
                                </div>
                            </div>
                            <div class="row key clearfix">
                                <div class="label fix-bold-font">购买钥匙：</div>
                                <div class="content">
                                    <div class="item" v-for="(item,index) in key.buy.list" :key="index" :class="{'active': key.buy.index === index}" @click="key.buy.index = index">
                                        <lfl-icon icon="key-item"></lfl-icon>
                                        <lfl-icon icon="key-item" class="hover"></lfl-icon>
                                        <lfl-icon icon="key-item-active" class="active"></lfl-icon>
                                        <lfl-icon icon="key" class="mark"></lfl-icon>
                                        <div class="inner">
                                            <lfl-icon icon="key" class="product"></lfl-icon>
                                            <lfl-icon icon="selected" class="selected"></lfl-icon>
                                            <div class="number">{{item.fantasy_key}}</div>
                                            <div class="text">- 钥匙 - </div>
                                            <div class="price"><lfl-icon icon="diamond"></lfl-icon><span>{{item.diamond_number}}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row diamond-balance">
                                <div class="label fix-bold-font">我的钻石：</div>
                                <div class="content"><span>{{member.bank.diamond}}</span><lfl-icon icon="diamond"></lfl-icon></div>
                            </div>
                            <div class="row pay-money">
                                <div class="label fix-bold-font">应付金额：</div>
                                <div class="content">
                                    <span class="amount">{{key.buy.list.length ? key.buy.list[key.buy.index].diamond_number : 0}}</span><span class="yuan">钻石</span><span class="total">（可获{{key.buy.list.length ? key.buy.list[key.buy.index].fantasy_key : 0}}钥匙）</span>
                                </div>
                            </div>
                            <div class="row actions">
                                <div class="label"></div>
                                <div class="content">
                                    <el-button class="button" type="primary" @click="key.dialog.show = true">立即购买</el-button>
                                </div>
                            </div>
                        </div>
                    </VuePerfectScrollbar>
                </div>

                <el-dialog title="支付提示" class="paying" top="30%" :visible.sync="diamond.dialog.show" :close-on-click-modal="false" :show-close="false">
                    <p>请在新打开的页面完成支付</p>
                    <div class="desc">
                        <ul>
                            <li>完成支付前请勿关闭此窗口</li>
                            <li>支付完成后，请根据结果选择</li>
                        </ul>
                    </div>
                    <div class="actions">
                        <el-button type="primary" @click="finishPay" :disabled="diamond.checkLoading">完成支付</el-button>
                        <el-button type="primary" @click="reSelectPayType" :disabled="diamond.checkLoading">重新选择支付方式</el-button>
                    </div>
                </el-dialog>

                <el-dialog :title="currType.orderDialog.result == true ? '购买成功' : '购买失败'" class="mini recharge" :class="currType.name" top="30%" :visible.sync="currType.orderDialog.show" :close-on-click-modal="!currType.buyLoading" :show-close="!currType.buyLoading" v-loading="currType.buyLoading">
                    <div class="type" v-if="currType.orderDialog.result == true">
                        <span>获得{{currType.label}}</span><lfl-icon :icon="currType.name" :class="currType.name"></lfl-icon>
                    </div>
                    <div class="value light" v-if="currType.orderDialog.data">
                        <span v-if="currType.orderDialog.data.ticket">{{currType.buy.list[currType.buy.index].ticket}}</span>
                        <span v-if="currType.orderDialog.data.fantasy_key">{{currType.buy.list[currType.buy.index].fantasy_key}}</span>
                        <span v-else>{{currType.orderDialog.data.buy_number}}</span>
                    </div>
                    <div class="error" v-if="currType.orderDialog.result == false">
                        <div v-if="currType.name == 'diamond' ">
                            <div class="desc">您的支付可能遇到了问题请稍候查看，或联系客服</div>
                            <div class="qq"><span class="q">QQ</span><span><a href="tencent://message/?uin=325745639">325745639</a></span></div>
                        </div>
                        <div v-else class="message">{{currType.orderDialog.message}}</div>
                    </div>
                    <div class="actions">
                        <el-button type="primary" @click="currType.orderDialog.show = false">朕知道了</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="购买门票" class="mini recharge ticket" top="30%" :visible.sync="ticket.dialog.show">
                    <div class="type">
                        <span>门票</span><lfl-icon icon="ticket" class="ticket"></lfl-icon>
                    </div>
                    <div class="value light">{{ticket.buy.list.length ? ticket.buy.list[ticket.buy.index].ticket : 0}}</div>
                    <div class="desc">消耗钻石 {{ticket.buy.list.length ? ticket.buy.list[ticket.buy.index].diamond_number : 0}}<lfl-icon icon="diamond" class="diamond"></lfl-icon></div>
                    <div class="actions">
                        <el-button type="primary" @click="buyTicket" :loading="ticket.buyLoading">确认购买</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="购买钥匙" class="mini recharge key" top="30%" :visible.sync="key.dialog.show">
                    <div class="type">
                        <span>钥匙</span><lfl-icon icon="key" class="key"></lfl-icon>
                    </div>
                    <div class="value light">{{key.buy.list.length ? key.buy.list[key.buy.index].fantasy_key : 0}}</div>
                    <div class="desc">消耗钻石 {{key.buy.list.length ? key.buy.list[key.buy.index].diamond_number : 0}}<lfl-icon icon="diamond" class="diamond"></lfl-icon></div>
                    <div class="actions">
                        <el-button type="primary" @click="buyKey" :loading="key.buyLoading">确认购买</el-button>
                    </div>
                </el-dialog>

            </div>
            <div class="clearfix"></div>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>

    export default {
        data () {
            return {
                leftNav: {
                    curr: '0',
                    list: [
                        {
                            type: 'diamond',
                            label: '钻石充值'
                        },
                        {
                            type: 'ticket',
                            label: '门票购买'
                        },
                        {
                            type: 'key',
                            label: '钥匙购买'
                        },
                    ]
                },
                diamond: {
                    name: 'diamond',
                    label: '钻石',
                    dialog: {
                        show: false
                    },
                    orderDialog: {
                        result: false,
                        data: null,
                        show: false
                    },
                    wechat: false,
                    wechatLoading: false,
                    checkOrderInterval: null,
                    loading: false,
                    buyLoading: false,
                    checkLoading: false,
                    orderResult: {},
                    order: null,
                    url :'diamond_list.php',
                    buy: {
                        index: 0,
                        list: []
                    },
                    payType: 3
                },
                ticket: {
                    name: 'ticket',
                    label: '门票',
                    dialog: {
                        show: false
                    },
                    orderDialog: {
                        result: false,
                        data: null,
                        show: false,
                        message: ''
                    },
                    loading: false,
                    buyLoading: false,
                    url :'ticket_list.php',
                    buy: {
                        index: 0,
                        list: []
                    }
                },
                key: {
                    name: 'key',
                    label: '钥匙',
                    dialog: {
                        show: false
                    },
                    orderDialog: {
                        result: false,
                        data: null,
                        show: false,
                        message: ''
                    },
                    loading: false,
                    buyLoading: false,
                    url :'key_list.php',
                    buy: {
                        index: 0,
                        list: []
                    }
                }
            }
        },
        beforeDestroy() {
            if (this.diamond.checkOrderInterval) {
                clearInterval(this.diamond.checkOrderInterval)
            }
        },
        computed: {
            member () {
                return this.$store.state.member
            },
            currType () {
                return this[this.leftNav.list[this.leftNav.curr].type]
            },
            diamondOrderParams () {
                return {
                    platform: 'web',
                    sku_id: this.diamond.buy.list[this.diamond.buy.index].sku_id,
                    pay_type: this.diamond.payType
                }
            },
            availableDiamond () {
                let _diamond = 0
                if (this.diamond.buy.list.length) {
                    let select = this.diamond.buy.list[this.diamond.buy.index]
                    _diamond = parseInt(select.diamond_number)
                    if (select.first_prize > 0 && select.has_first_prize == 0) {
                        _diamond += parseInt(select.first_prize)
                    }
                    if (select.pmt_prize_diamond_number > 0) {
                        _diamond += parseInt(select.pmt_prize_diamond_number)
                    }
                }
                return _diamond
            },
            navList () {
                let arr = []
                for (let i in this.leftNav.list) {
                    arr.push(this.leftNav.list[i].type)
                }
                return arr
            }
        },
        watch:{
            '$store.state.member.info' (data) {
                if (data) {
                    this.requestList(this.leftNav.curr)
                } else {
                    this.$router.replace('/')
                }
            },
            'leftNav.curr' (index) {
                this.$router.replace('/recharge/' + this.leftNav.list[index].type)
                this.requestList(index)
            },
            'diamond.wechat' (bool) {
                if (bool) {
                    this.checkOrderInterval = setInterval(this.checkOrder, 3000)
                } else {
                    clearInterval(this.checkOrderInterval)
                }
            },
            'ticket.orderDialog.show' (bool) {
                if (!bool) {
                    setTimeout(_ => {
                        this.ticket.orderDialog.data = null
                        this.ticket.orderDialog.result = false
                    }, 500)
                }
            },
            '$route.params.type' (val) {
                this.leftNav.curr = this.navList.indexOf(val)
            }
        },
        mounted () {
            if (this.$route.query.out_trade_no) {
                this.checkOrder(this.$route.query.out_trade_no)
            } else {
                this.leftNav.curr = this.navList.indexOf(this.$route.params.type)
                if (!this.$store.state.member.token) {
                    this.$router.push('/')
                }
            }
        },
        methods: {
            requestList (navIndex) {
                let _type = this[this.leftNav.list[navIndex].type]
                _type.loading = true

                this.api('/services/fantasy/' + _type.url).then(req => {
                    if (req.code == 200) {
                        _type.buy.list = req.data.list
                    }
                    _type.loading = false
                })

            },
            buyDiamond () {
                if(!this.$store.state.member.token){
                    window.location.href='/login'
                }
                this.diamond.buyLoading = true
                let win
                if (this.diamond.payType == 3) {
                    win = window.open('', "_blank")
                } else if (this.diamond.payType == 2) {
                    this.diamond.wechat = true
                    this.diamond.wechatLoading = true
                }
                this.api('/services/fantasy/get_pay_info.php', this.diamondOrderParams).then(req=> {
                    if (req.code == 200) {
                        this.diamond.order = req.data
                        if (this.diamond.payType == 3) {
                            this.diamond.dialog.show = true
                            win.location.href = req.data.orderString
                        } else if (this.diamond.payType == 2) {
                            this.diamond.wechatLoading = false
                        }
                    }
                })
            },
            buyTicket () {
                this.ticket.buyLoading = true
                this.api('/services/fantasy/ticket_exchange.php', {sku_id: this.ticket.buy.list[this.ticket.buy.index].sku_id},_=> {}).then(req=> {
                    this.ticket.orderDialog.result = req.code == 200
                    if (req.code == 200) {
                        this.ticket.orderDialog.data = req.data
                        this.$root.hub.$emit('updateBank')
                    }
                    this.ticket.orderDialog.message = req.message
                    this.ticket.dialog.show = false
                    this.ticket.orderDialog.show = true
                    this.ticket.buyLoading = false
                })
            },
            buyKey () {
                this.key.buyLoading = true
                this.api('/services/fantasy/key_exchange.php', {sku_id: this.key.buy.list[this.key.buy.index].sku_id},_=> {}).then(req=> {
                    this.key.orderDialog.result = req.code == 200
                    if (req.code == 200) {
                        this.key.orderDialog.data = req.data
                        this.$root.hub.$emit('updateBank')
                    }
                    this.key.orderDialog.message = req.message
                    this.key.dialog.show = false
                    this.key.orderDialog.show = true
                    this.key.buyLoading = false
                })
            },
            finishPay () {
                this.diamond.dialog.show = false
                this.diamond.buyLoading = false
                this.diamond.checkLoading = true
                if (this.diamond.payType == 2) {
                    this.diamond.wechat = false
                }
                this.api('/services/fantasy/get_pay_result.php', {platform:'web',order_id: this.diamond.order.order_id},_=> {}).then(req=> {
                    this.diamond.orderDialog.result = req.code == 200
                    if (req.code == 200) {
                        this.requestList(this.leftNav.curr)
                        this.diamond.orderDialog.data = req.data
                        this.$root.hub.$emit('updateBank')
                    }
                    this.diamond.orderDialog.show = true
                    this.diamond.checkLoading = false
                    this.diamond.order = null
                })
            },
            checkOrder (order_id) {
                this.api('/services/fantasy/get_pay_result.php', {platform:'web',order_id: order_id || this.diamond.order.order_id},_=> {}).then(req=> {
                    if (req.code == 200) {
                        this.requestList(this.leftNav.curr)
                        this.diamond.orderDialog.data = req.data
                        this.diamond.buyLoading = false
                        this.diamond.wechat = false
                        this.diamond.orderDialog.show = true
                        this.diamond.orderDialog.result = true
                        this.$root.hub.$emit('updateBank')
                    }
                    if (order_id && req.code != 200) {
                        this.$message.error(req.message)
                    }
                })
            },
            clearOrder () {
                this.diamond.order = null
            },
            reSelectPayType (){
                if (this.diamond.payType == 2) {
                    this.diamond.wechat = false
                }
                this.clearOrder()
                this.diamond.dialog.show = false
                this.diamond.buyLoading = false

            }
        }
    }
</script>

<style lang="stylus">
    #recharge {
        height 760px
        margin-top 40px
        background #FFFFFF
        border 1px solid #E7EDF1
        box-shadow 0 1px 4px 0 rgba(5,17,25,0.06)
        overflow hidden
        border-radius 2px

        #wechat {
            height 760px
            background: #FFFFFF;
            border-radius: 2px;

            > .title {
                padding 0 20px
                background #FFFFFF
                border-bottom 2px solid #0C9DFC
                height 40px
                line-height 40px
                font-size 14px

                span {
                    margin-right 20px
                    font-weight bold
                    font-size 16px
                }
            }

            .pay {
                padding-top 110px
                width 320px
                margin 0 auto
                text-align center

                > .title {
                    height 40px
                    line-height 40px
                    font-size: 32px;
                }

                .code-img {
                    width 220px
                    height 220px
                    position relative
                    text-align center
                    margin 30px auto 0

                    .wechat {
                        width 100%
                        height 100%
                    }

                    .phone-view {
                        width 225px
                        height 221px
                        position absolute
                        right -240px
                        top -100px
                    }
                }

                .desc {
                    font-size 14px
                    height 20px
                    line-height 20px
                    margin-top 20px
                    .icon {
                        margin-right 10px
                        width 20px
                        height 20px
                    }
                    span,.icon {
                        display inline-block
                        vertical-align middle
                    }
                }

                .info {
                    width 320px
                    height 80px
                    border-collapse collapse
                    margin-top 40px
                    font-size 14px

                    td {
                        height 40px
                        line-height 40px
                        padding-left 22px
                        border 1px solid #E7EDF1

                        &:first-child {
                            text-align center
                        }

                        &.light {
                            color #0C9DFC
                            font-weight bold
                            text-align left
                        }
                    }
                }

                .actions {
                    margin-top 40px
                }
            }
        }

        > .title {
            height 40px
            line-height 40px
            border-bottom 1px solid #E7EDF1
            padding 0 20px
            font-size 15px
            font-weight bold

            .back {
                float right
                font-size 14px
                color #A5A8B2
            }
        }

        .main {
            .nav {
                width 140px
                height 100%
                float left
                border-right 1px solid #E7EDF1

                .nav-item {
                    height 240px
                    background-color #FAFBFD
                    padding-top 80px
                    text-align center
                    cursor pointer
                    position relative
                    border-left 2px solid transparent
                    user-select none
                    transition-duration .5s

                    .icon,.name {
                        transition-duration .3s
                    }

                    &.disabled {
                        .icon,.name {
                            opacity .1
                        }
                    }

                    &:hover {
                        .icon,.name {
                            opacity .5
                        }

                        &.diamond {
                            .icon,.name {
                                color #4BDCBA
                            }
                        }

                        &.ticket {
                            .icon,.name {
                                color #0C9DFC
                            }
                        }
                    }

                    &.active {
                        background-color #fff

                        .name,
                        .icon {
                            opacity 1
                        }

                        &:after,&:before {
                            content ''
                            display block
                            position absolute
                        }

                        &:after {
                            border-left 7px solid #fff
                            border-top 7px solid transparent
                            border-bottom 7px solid transparent
                            right -7px
                            top 169px
                            z-index 2
                        }

                        &:before {
                            right -8px
                            top 168px
                            border-left 8px solid #E7EDF1
                            border-top 8px solid transparent
                            border-bottom 8px solid transparent
                            z-index 1
                        }

                        &.diamond {
                            border-left-color #4BDCBA
                            .icon,.name {
                                color #4BDCBA
                            }
                        }

                        &.ticket {
                            border-left-color #0C9DFC
                            .icon,.name {
                                color #0C9DFC
                            }
                        }

                        &.key {
                            border-left-color #CB9B7A
                            .icon,.name {
                                color #CB9B7A
                            }
                        }
                    }

                    .icon {
                        display block
                        margin 0 auto
                        width 42px
                        height 42px
                        color #586077
                        opacity .7
                    }

                    .name {
                        margin-top 10px
                        opacity: 0.7;
                        font-size: 16px;
                        color: #586077;
                    }

                    + .nav-item {
                        border-top 1px solid #E7EDF1
                    }
                }
            }

            .body {
                width calc(100% - 140px)
                height 720px
                float right
                display none

                .scrollbar {
                    padding 15px 40px 30px
                    height 718px
                }

                &.show {
                    display block
                }


                &.diamond {
                    .top,.light {
                        color #4BDCBA
                    }
                }

                &.ticket {
                    .top,.light {
                        color #0C9DFC
                    }
                }

                .alert {
                    height 36px
                    line-height 36px
                    padding-left 97px
                    font-size 13px
                    color #438A79
                    background #F8FFFD
                    border 1px solid #92E3D0
                    border-radius 3px
                    > span {
                        font-weight bold
                    }
                }

                .wrap {
                    margin-top 27px

                    .row {
                        .label,.content {
                            float left
                        }

                        .label {
                            width 100px
                            font-size 14px
                            padding-top 5px
                        }

                        > .content {
                            width calc(100% - 100px)
                            padding-left 4px
                        }

                        &.account {
                            height 54px
                            line-height 54px
                            margin-top 27px

                            > .content {
                                height 54px
                                line-height 54px
                                position relative
                            }

                            .avatar {
                                height 54px
                                width 54px
                                border-radius 50%
                                border 2px solid #fff
                                box-shadow 0 2px 2px 0 #cecece
                                margin-right 20px
                                position absolute
                                z-index 1
                            }

                            .nickname {
                                position absolute
                                display block
                                top 10px
                                left 27px
                                height 42px
                                line-height 42px
                                padding-left 45px
                                font-size 15px
                                background-image: linear-gradient(90deg, #F3F5F7 0%, #FFFFFF 100%);
                            }
                        }


                        &.ticket,&.diamond,&.key {
                            margin-top 40px

                            .content {
                                padding-left 0
                            }

                            .item {
                                float left
                                width calc((100% - 40px) / 2)
                                height 80px
                                margin-top 20px
                                position relative
                                cursor pointer
                                transition-duration .3s
                                user-select none

                                &.flag {
                                    &:after,&:before {
                                        content ''
                                        position absolute
                                        background-size 100%
                                    }

                                    &.first {
                                        &:after {
                                            background-image url('/static/image/first-prize-flag.png')
                                        }
                                        &:before {
                                            background-image url('/static/image/first-prize-flag-bottom.png')
                                        }
                                    }

                                    &.rule {
                                        &:after {
                                            background-image url('/static/image/active-prize-flag.png')
                                        }
                                        &:before {
                                            background-image url('/static/image/active-prize-flag-bottom.png')
                                        }
                                    }

                                    &:after {
                                        width 43px
                                        height 57px
                                        left -3px
                                        top -6px
                                        z-index 10
                                    }

                                    &:before {
                                        width 17px
                                        height 21px
                                        left -3px
                                        top 37px
                                        z-index 0
                                    }
                                }

                                &:nth-child(2n) {
                                    margin-left 40px
                                }

                                .inner {
                                    position absolute
                                    z-index 5
                                    left 0
                                    right 0
                                    top 0
                                    bottom 0

                                    > * {
                                        position absolute
                                    }

                                    > .icon {
                                        width 42px
                                        height 42px
                                        color #4BDCBA
                                        top 20px
                                        left 28px
                                        z-index 1
                                        transition-duration .3s

                                        &.selected {
                                            visibility hidden
                                            color #00C193
                                            transform scale(0)
                                            opacity 0
                                        }
                                    }
                                }

                                > .icon {
                                    position absolute
                                    left 0
                                    right 0
                                    bottom 0
                                    height 100%
                                    width 100%
                                    top 0
                                    z-index 1
                                    transition-duration .3s

                                    &.hover {
                                        z-index -1
                                        opacity 0
                                    }

                                    &.active{
                                        z-index -1
                                        opacity 1
                                    }

                                    &.mark {
                                        top -60px
                                        height 200px
                                        bottom -60px
                                        color #fff
                                        opacity .15
                                        z-index 3
                                    }
                                }

                                &.active {
                                    opacity 1

                                    .icon.active {
                                        z-index 3
                                        opacity 1
                                    }

                                    .inner {
                                        .icon.selected {
                                            z-index 2
                                            visibility visible
                                            transform scale(.86)
                                            opacity 1
                                        }
                                        .icon.product {
                                            visibility hidden
                                            transform scale(0)
                                            opacity 0
                                        }
                                    }
                                }

                                &:not(.active) {
                                    opacity .7
                                }

                                &:hover {
                                    opacity 1
                                    .icon.hover {
                                        z-index 2
                                        opacity 1
                                    }
                                }

                                &:nth-child(1),&:nth-child(2) {
                                    margin-top 0
                                }
                            }
                        }

                        &.diamond {
                            margin-top 40px

                            .content {
                                padding-left 0
                            }

                            .item {

                                .inner {
                                    .info {
                                        left 83px
                                        top 20px

                                        .name {
                                            font-size 16px
                                            > span {
                                                height 20px
                                                line-height 20px
                                                display inline-block
                                                vertical-align middle
                                            }

                                            .active-text {
                                                font-size: 12px;
                                                color: #FF5C5C;
                                                margin-left 8px

                                                .first {
                                                    display inline-block
                                                    width 36px
                                                    height 18px
                                                    line-height 18px
                                                    margin-right 5px
                                                    font-size 14px
                                                    color #FFFFFF
                                                    background #00c193
                                                    text-align center
                                                    border-radius 8px
                                                }
                                            }
                                        }

                                        .desc {
                                            margin-top 3px
                                            font-size: 12px;
                                            height 16px
                                            line-height 16px

                                            span {
                                                font-weight bold
                                                color: #FFA646;
                                            }
                                        }
                                    }
                                }



                                .price {
                                    position absolute
                                    right 20px
                                    bottom 8px
                                    font-family: TradeGothicLT-Bold;
                                    font-size: 32px;
                                    color: #FAFBFD;
                                    letter-spacing: 0;
                                    z-index 3

                                    &:before {
                                        content '￥'
                                        font-size: 20px;
                                        color: #FAFBFD;
                                        position relative
                                        top -1px
                                    }
                                }
                            }
                        }

                        &.ticket {
                            .item {
                                overflow hidden
                                .inner {
                                    .icon {
                                        color #fff

                                        &.selected {
                                            color #fff
                                        }
                                    }

                                    div {
                                        height 38px
                                        line-height 38px
                                        top 21px
                                        position absolute
                                        color #fff
                                    }

                                    .number {
                                        font-family: TradeGothicLT-Bold;
                                        font-size: 26px;
                                        left 85 px
                                    }

                                    .text {
                                        left 170px
                                        font-size 20px
                                    }

                                    .price {
                                        width 120px
                                        text-align center
                                        right 5px
                                        font-family: TradeGothicLT-Bold;
                                        font-size: 32px;
                                        color: #4BDCBA;
                                        letter-spacing: 0;

                                        span,.icon {
                                            display inline-block
                                            vertical-align middle
                                        }

                                        .icon {
                                            width 18px
                                            height 18px
                                            color #4BDCBA
                                            margin-right 4px
                                        }
                                    }
                                }
                            }
                        }

                        &.key {
                            .item {
                                overflow hidden

                                .icon.mark {
                                    top -12px
                                    height 105px
                                }

                                .inner {
                                    .icon {
                                        color #fff

                                        &.selected {
                                            color #fff
                                        }
                                    }

                                    div {
                                        height 38px
                                        line-height 38px
                                        top 21px
                                        position absolute
                                        color #fff
                                    }

                                    .number {
                                        font-family: TradeGothicLT-Bold;
                                        font-size: 26px;
                                        left 85 px
                                    }

                                    .text {
                                        left 170px
                                        font-size 20px
                                    }

                                    .price {
                                        width 120px
                                        text-align center
                                        right 5px
                                        font-family: TradeGothicLT-Bold;
                                        font-size: 32px;
                                        color: #BD8A67;
                                        letter-spacing: 0;

                                        span,.icon {
                                            display inline-block
                                            vertical-align middle
                                        }

                                        .icon {
                                            width 18px
                                            height 18px
                                            color #BD8A67
                                            margin-right 4px
                                        }
                                    }
                                }
                            }
                        }

                        &.pay-type {
                            height 50px
                            margin-top 30px

                            .label {
                                line-height 50px
                                padding-top 0
                            }

                            .play-type-item {
                                width 140px
                                height 50px
                                float left
                                background: #FFFFFF;
                                border: 1px solid #D4DAE0;
                                border-radius: 4px
                                text-align center
                                cursor pointer
                                user-select none
                                position relative
                                transition-duration .3s

                                + .play-type-item {
                                    margin-left 15px
                                }

                                .icon.selected {
                                    position absolute
                                    right -11px
                                    top -11px
                                    width 22px
                                    height 22px
                                    margin-top 0
                                    background-color #fff
                                    transition-duration .3s
                                    transform scale(0)
                                }

                                &.active {
                                    .icon.selected {
                                        transform scale(1)
                                    }
                                }

                                &.alipay {
                                    .icon.logo {
                                        width 110px
                                        height 32px
                                        margin-top 8px
                                    }
                                    .icon.selected {
                                        color #009FE8
                                    }
                                    &.active {
                                        background: #FFFFFF;
                                        border: 1px solid #009FE8;
                                        border-radius: 4px;
                                    }
                                }

                                &.wechat-pay {
                                    .icon.logo {
                                        width 110px
                                        height 36px
                                        margin-top 6px
                                    }
                                    .icon.selected {
                                        color #00B700
                                    }
                                    &.active {
                                        border: 1px solid #00B700;
                                        border-radius: 4px;
                                    }
                                }

                            }
                        }

                        &.pay-money {
                            height 46px
                            margin-top 20px
                            font-size: 14px;

                            .label {
                                line-height 46px
                            }

                            span {
                                display inline-block
                                vertical-align baseline
                                height 47px
                            }

                            .amount {
                                line-height 47px
                                font-size: 36px;
                                color: #FFA646;
                                font-weight bold
                                position relative
                                bottom -2px
                            }

                            .yuan {
                                margin-left 8px
                                font-weight bold
                            }

                            .total {
                                color: #A5A8B2;
                                margin-left 13px
                            }
                        }

                        &.diamond-balance {
                            margin-top 30px
                            height 26px
                            line-height 26px

                            .content {
                                color #4BDCBA
                                font-weight bold
                                font-size 20px

                                span,.icon {
                                    display inline-block
                                    vertical-align middle
                                }

                                .icon,span {
                                    display inline-block
                                    vertical-align middle
                                }

                                .icon {
                                    margin-left 7px
                                    width 15px
                                    height 15px
                                }
                            }
                        }

                        &.actions {
                            margin-top 30px

                            .button {
                                display inline-block
                                color #fff
                                font-size 14px
                                font-weight bold
                                cursor pointer
                                user-select none
                                height 40px
                                line-height 38px
                                background: #4CDCBA;
                                border: 1px solid #3BD4B0;
                                box-shadow: 0 2px 4px 0 rgba(76,220,186,0.40);
                                border-radius: 4px;
                                padding 0 32px
                            }
                        }
                    }
                }


                &.ticket {
                    padding-top 36px
                    .wrap {
                        .row {
                            &.pay-money .amount {
                                color #4BDCBA
                            }
                            &.actions {
                                .button {
                                    background: #0C9DFC;
                                    border: 1px solid #0497F8;
                                    box-shadow: 0 2px 4px 0 rgba(12,157,252,0.40);
                                }
                            }
                        }
                    }

                }

                &.key {
                    padding-top 36px
                    .wrap {
                        .row {
                            &.pay-money .amount {
                                color #4BDCBA
                            }
                            &.actions {
                                .button {
                                    background: #BD8A67;
                                    border: 1px solid #BD8A67;
                                    box-shadow: 0 2px 4px 0 rgba(189,138,103,0.40);
                                }
                            }
                        }
                    }

                }
            }
        }

    }
</style>
