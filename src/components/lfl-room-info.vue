<template>
    <div class="room-info clearfix">
        <div class="container">
            <div class="left" v-if="data">
                <img class="logo" src="/static/image/lol.png" />
                <div class="info">
                    <div class="title">{{data.name}}<span class="tag" :class="{'must': data.is_must_open == 1}">{{data.is_must_open == 1 ? '必开' : '非必开'}}</span></div>
                    <div class="desc">{{data.room_desc}}</div>
                    <div class="button room-detail-button">
                        <span>房间详情</span>
                        <div class="room-detail-box">
                            <div class="box prize">
                                <div class="title">奖金分配</div>
                                <div class="list">
                                    <VuePerfectScrollbar class="scrollbar">
                                        <div class="list-item" :class="'index-' + index" v-for="(item,index) in (data.prizeRuleList || prizeRuleList)" :key="index">
                                            <span>{{item.name}}</span>
                                            <span class="fr prize"><span>{{item.value}}</span><lfl-icon v-if="item.prize_type == 1" icon="fruit" class="fruit"></lfl-icon><lfl-icon v-if="item.prize_type == 2" icon="ticket" class="ticket"></lfl-icon></span>
                                        </div>
                                    </VuePerfectScrollbar>
                                </div>
                            </div>
                            <div class="box">
                                <div class="title">参与用户</div>
                                <div class="list">
                                    <VuePerfectScrollbar class="scrollbar">
                                        <div class="list-item" :class="'index-' + index" v-for="(item,index) in (data.users ? data.users.list : users.list)" :key="index">
                                            <img :src="item.avatar || '/static/image/avatar.jpg'" class="avatar" />
                                            <span class="nickname" :title="item.nickname">{{item.nickname}}</span>
                                            <span class="level" :class="'level-' + item.rank"></span>
                                            <!--<img v-if="item.badge_image" :src="item.badge_image" class="badge" />-->
                                            <span class="fr count">{{item.num}} 次</span>
                                        </div>
                                    </VuePerfectScrollbar>
                                </div>
                            </div>
                            <div class="box">
                                <div class="title">积分规则</div>
                                <VuePerfectScrollbar class="scrollbar">
                                    <div class="rules">
                                        <h2 class="rules_title">选手选择：</h2>
                                        <p class="rules_p">(1) 同一支战队可选择选手数量不限；<br>(2) 所选选手身价总和不能超过工资帽；<br>注：系统根据每位现役选手在一段时间的表现计算身价，身价会根据选手在真实赛事中的表现上下浮动，房间创建之后，选手身价不会变动。<br></p>
                                        <h2 class="rules_title">评分规则：</h2>
                                        <table class="rules_table">
                                            <tr> <td>击杀</td> <td>2分</td></tr>
                                            <tr> <td>死亡</td> <td>-1分</td></tr>
                                            <tr> <td>助攻</td> <td>1分</td></tr>
                                            <tr> <td>分均输出</td> <td>0.02分</td></tr>
                                            <tr> <td>分均承伤</td> <td>0.016分</td></tr>
                                            <tr> <td>分均插/排眼</td> <td>8分</td></tr>
                                            <tr> <td>单场击杀或助攻超过10</td> <td>2分</td></tr>
                                        </table>
                                        <p class="rules_p">注：一位选手在房间内参加了多局比赛，表现分取多局比赛的平均分，普通房间未上场选手算10分，毒奶房未上场选手算50分</p>
                                        <h2 class="rules_title">不可抗力机制说明：</h2>
                                        <p class="rules_p">对于因不可抗力或本站不能控制的原因（如自然灾害、官方取消等）造成的比赛延期或取消，房间将关闭并退还所有门票。为您造成的不便深表歉意，Score将保留对此类特殊情况的最终解释权。</p>
                                        <h2 class="rules_title">赛事方赛后修改数据情况说明：</h2>
                                        <p class="rules_p">如遇到赛事方在比赛结束后修改数据情况，Score将锁定房间结算时的所有数据及排名，以房间结算当时数据为准，不会发生数据及排名变动。</p>
                                        <h2 class="rules_title">公平竞赛机制：</h2>
                                        <p class="rules_p">为保障用户间公平竞赛，一旦发现您存在利用我们的规则漏洞进行任何形式的作弊行为（包括但不限于通过我们的竞赛获得不正当的经济利益），我们有权取消与利弊行为相关账户的奖励、追回您作弊获得的不正当利益、关闭作弊账户或与您相关的所有账户，并保留取消您后续使用我们服务的权利，必要时会依据严重程度追究您的法律责任。</p>
                                        <p><br/></p>
                                        <p class="rules_p">说明：最终解释权归Score所有。</p>
                                    </div>
                                </VuePerfectScrollbar>
                            </div>
                        </div>
                    </div>
                    <div class="room-share-button" @click="shareRoom" v-if="$route.name != 'room-custom-choose'">分享房间</div>
                </div>
            </div>
            <div class="right" v-if="data">
                <div class="col">
                    <div class="num time" v-if="roomStatus == 0">{{endTimeStr}}</div>
                    <div class="num live" v-if="roomStatus == 4">LIVE</div>
                    <div class="desc" :class="{'end': roomStatus != 0 && roomStatus != 4}">{{roomStatus | status}}</div>
                </div>
                <div class="col">
                    <div class="num"><span>{{data.member_at_times}}</span> / {{data.times}}</div>
                    <div class="desc">参与次数</div>
                </div>
                <div class="col">
                    <div class="num">{{data.at_times}} / {{data.num}}</div>
                    <div class="desc">参与人数</div>
                </div>
                <div class="col">
                    <div class="num"><span class="ticket">{{data.price}}<lfl-icon icon="ticket"></lfl-icon></span></div>
                    <div class="desc">入场费</div>
                </div>
                <div class="col">
                    <div class="num">
                        <span :class="[{'fruit': data.prize_type == 1},{'other': data.prize_type == 3}]">{{data.prize_type != 3 ? data.prize_amount : data.prize_amount}}</span>
                        <lfl-icon v-if="data.prize_type == 1" icon="fruit" class="fruit"></lfl-icon>
                        <lfl-icon v-if="data.prize_type == 2" icon="ticket" class="ticket"></lfl-icon>
                    </div>
                    <div class="desc">奖金总额</div>
                </div>
            </div>
            <div class="background" :style="{backgroundImage: 'url(\''+ data.cover_url +'\')'}"></div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            data: {
                type: Object,
                default: function () {
                    return {
                        roomID: '',
                        cover_url: '',
                        name: '',
                        num: '',
                        room_desc: '',
                        prize_type: '',
                        times: '',
                        at_end_time: '',
                        at_times: '',
                        prize_amount: '',
                        member_at_times: '',
                        is_must_open: false
                    }
                }
            }
        },
        data () {
            return {
                endTime: 0,
                endTimeStr: '- - : - - : - -',
                prizeRuleList: [],
                users: {
                    params: {
                        roomID: '',
                        limit: 100,
                        last_member_id: ''
                    },
                    list: []
                },
                countDownInterval: null
            }
        },
        computed: {
            roomStatus () {
                return this.data.room_status || this.data.status
            }
        },
        filters: {
            status (val) {
                let _status = {
                    0: '截止时间',
                    1: '已关闭',
                    2: '已结束',
                    3: '退款中',
                    4: '进行中',
                    5: '结算中'
                }
                return _status[val]
            }
        },
        methods: {
            shareRoom () {
                this.$root.hub.$emit('showShare', {id: this.data.roomID, name: this.data.name, code: this.data.secret_key})
            },
            countDown (time) {
                let targetDate = this.moment(time, 'X')
                let now = this.moment()
                let calc = {
                    hours: function() {
                        return targetDate.diff( now, 'hours' )
                    },
                    minutes: function() {
                        targetDate.subtract(calc.hours(), 'hours' )
                        let m = targetDate.diff( now, 'minutes' )
                        return m < 10 ? '0' + m : m
                    },
                    seconds: function() {
                        targetDate.subtract(calc.minutes(), 'minutes' )
                        let s = targetDate.diff( now, 'seconds')
                        return s < 10 ? '0' + s : s
                    }
                }
                this.endTimeStr = calc.hours() + ':' + calc.minutes() + ':' + calc.seconds()
            },
            requestPrizeRule () {
                this.api('/services/fantasy/reward_rule.php', {roomID: this.data.roomID}).then(req => {
                    if (req.code == 200) {
                        this.prizeRuleList = req.data.list
                    }
                })
            },
            requestUsers () {
                if (this.data.order_id) {
                    this.users.params.order_id = this.data.order_id
                }
                this.api('/services/fantasy/times_rank.php', this.users.params).then(req => {
                    if (req.code == 200) {
                        if (this.users.params.last_member_id == '') {
                            this.users.list = req.data.list
                        } else {
                            for (let i in req.data.list) {
                                this.users.list.push(req.data.list[i])
                            }
                        }
                    }
                })
            }
        },
        watch: {
            'data.roomID' (val) {
                this.users.params.roomID = val
                this.requestUsers()
                this.requestPrizeRule()
            },
            'data.at_end_time' (val) {
                let targetDate = this.moment(val, 'X')
                let now = this.moment()
                this.endTime = targetDate.diff( now, 'seconds')
                this.countDown(val)
                this.countDownInterval = setInterval( _ => {
                    if (this.endTime > 0) {
                        this.countDown(val)
                        this.endTime--
                    } else {
                        this.$emit('timeIsUp')
                        if (this.countDownInterval) {
                            clearInterval(this.countDownInterval)
                        }
                    }
                }, 1000)
            }
        },
    }
</script>

<style lang="stylus" scoped>
    .room-info {
        height 140px
        background-image: linear-gradient(0deg, #1A202A 0%, #0C0A20 79%);
        padding 33px 0 24px
        position relative

        .container {
            height 83px
            position relative
            z-index 16

            .background {
                position absolute
                z-index -1
                left 0
                right 0
                bottom -24px
                top -33px
                background-size contain
                background-position -200px 0
                background-repeat no-repeat
                -webkit-mask-image url('/static/image/mask.png')
                //-webkit-mask-image linear-gradient(to right, rgba(255,255,255,0) 0%, #fff 40%, rgba(255,255,255,0) 60%)
                -webkit-mask-repeat no-repeat
            }

            .left {
                float left

                .logo {
                    width 32px
                    height auto
                    margin-right 15px
                    float left
                }

                .info {
                    float left

                    > .title {
                        font-size: 20px;
                        color: #fff;
                        height 26px
                        line-height 26px

                        span {
                            background: #0c9dfc;
                            border-radius: 2px;
                            padding 0 4px
                            height 20px
                            line-height 20px
                            font-size 14px
                            vertical-align middle
                            margin-left 14px
                            font-weight: bold;
                            display inline-block
                            position relative
                            top -2px

                            &.must {
                                background: #FA9B3C;
                            }
                        }
                    }

                    > .desc {
                        font-size: 13px;
                        color: #0C9DFC;
                        height 17px
                        line-height 17px
                        margin-top 2px
                    }

                    .room-share-button {
                        user-select none
                        position relative
                        display inline-block
                        z-index 12
                        padding 0 15px
                        height 24px
                        line-height 22px
                        background: #13ce66
                        border: 1px solid #13ce66;
                        box-shadow: 0 2px 4px 1px rgba(5, 24, 37, 0.2);
                        color #fff
                        border-radius: 4px;
                        transition-duration .3s
                        font-size 14px
                        margin-left 10px
                        cursor pointer
                    }

                    .room-detail-button {
                        height 24px
                        margin-top 16px
                        font-weight bold
                        font-size 14px
                        position relative
                        display inline-block

                        > span {
                            position relative
                            display inline-block
                            padding 0 15px
                            height 24px
                            line-height 22px
                            background: #0C9DFC;
                            border: 1px solid #0497F8;
                            box-shadow: 0 2px 4px 1px rgba(5, 24, 37, 0.2);
                            color #fff
                            border-radius: 4px;
                            transition-duration .3s
                            z-index 16
                        }

                        .room-detail-box {
                            width 0
                            height 0
                            position absolute
                            top 12px
                            left 39px
                            z-index 15
                            visibility hidden
                            transition-duration .3s
                            background: #FAFBFD;
                            border: 1px solid #E7EDF1;
                            box-shadow: 0 1px 4px 0 rgba(5,17,25,0.1);
                            border-radius 2px
                            padding 0
                            overflow hidden

                            .box {
                                height 430px
                                float left
                                font-weight normal
                                background #FFFFFF
                                border 1px solid #E7EDF1
                                visibility hidden
                                opacity 0
                                transition-duration .3s
                                width calc((100% - 30px) / 3)
                                box-shadow: 0 1px 4px 0 rgba(5,17,25,0.07);
                                position relative

                                &:hover {
                                    box-shadow: 0 1px 10px 1px rgba(5,17,25,0.1);
                                }

                                + .box {
                                    margin-left 15px
                                }

                                > .title {
                                    height 30px
                                    line-height 30px
                                    padding 0 10px
                                    border-bottom 1px solid #E7EDF1

                                    .remark {
                                        float right
                                        height 30px

                                        .desc {
                                            position absolute
                                            top 30px
                                            height 80px
                                            left 0
                                            right 0
                                            padding 12px 15px
                                            font-size: 12px;
                                            color: #A5A8B2;
                                            line-height: 18px;
                                            background: #FFFFFF;
                                            box-shadow: 0 1px 4px 0 rgba(5,17,25,0.10);
                                            z-index 3
                                            transition-duration .3s
                                        }
                                    }
                                }

                                > .desc {
                                    height 80px
                                    padding 15px
                                    font-size: 12px;
                                    color: #A5A8B2;
                                    line-height: 18px;
                                    border-bottom 1px solid #E7EDF1
                                }

                                > .list {
                                    height 400px
                                    overflow hidden

                                    .scrollbar {
                                        height 400px
                                    }


                                    .list-item {
                                        height 50px
                                        padding 10px
                                        font-size: 13px;
                                        border-bottom 1px solid #E7EDF1

                                        &:nth-child(odd) {
                                            background-color #FBFDFE
                                        }

                                        &:not(.index-0):last-child {
                                            border-bottom none
                                        }

                                        .avatar {
                                            width 30px
                                            height 30px
                                            border: 1px solid #F5F5F5;
                                            border-radius 50%
                                        }

                                        .nickname {
                                            margin-left 8px
                                            max-width 110px
                                            height 30px
                                            line-height 30px
                                            overflow hidden
                                            text-overflow ellipsis
                                            white-space nowrap
                                        }

                                        .level {
                                            height 15px
                                            margin-left 3px
                                        }

                                        .badge {
                                            width 14px
                                            height 14px
                                            margin-left 6px
                                        }

                                        .fr {
                                            float right
                                            text-align right
                                        }

                                        .count {
                                            color: #0C9DFC;
                                        }

                                        .prize {
                                            .icon {
                                                width 14px
                                                height 14px
                                                margin-left 5px
                                                display inline-block

                                                &.ticket {
                                                    color #0C9DFC
                                                }
                                            }
                                        }

                                        > * {
                                            height 30px
                                            line-height 30px
                                            display inline-block
                                            vertical-align middle
                                        }
                                    }
                                }
                            }
                        }

                        &:hover {
                            > span {
                                box-shadow none
                                border-radius 0
                                border 1px solid transparent
                                background-color transparent
                                color #373a41
                            }

                            .room-detail-box {
                                padding 30px 15px 15px
                                visibility visible
                                width 900px
                                top -3px
                                left 0
                                height 475px

                                .box {
                                    visibility visible
                                    opacity 1

                                    .scrollbar {
                                        height 400px
                                    }

                                    .rules {
                                        padding 0 10px 15px
                                        .users_style .app_h5_list li {
                                            padding: 0 30px 0 24px;
                                        }

                                        .user_img {
                                            display: block;
                                            width: 34px;
                                            height: 34px;
                                            border-radius: 50%;
                                            margin: 6px 14px 0 0;
                                        }

                                        .money_tips {
                                            line-height: 28px;
                                            font-size: 14px;
                                            color: #373a41;
                                            background-color: #f5f5f5;
                                            padding: 8px 24px;
                                        }

                                        .app_h5_list li {
                                            line-height: 46px;
                                            font-size: 14px;
                                            color: #373a41;
                                            background-color: #f5f5f5;
                                            padding: 0 24px;
                                        }

                                        .app_h5_list li:nth-child(even) {
                                            background-color: #fff;
                                        }

                                        .app_h5_list li span.flr em {
                                            margin-right: 8px;
                                        }

                                        .badge_image {
                                            width: 28px;
                                            margin-top: 12px;
                                        }

                                        .icon_guozi {
                                            width: 20px;
                                            height: 20px;
                                            margin-top: 13px;
                                            float: right;
                                        }

                                        .rules_style {
                                            padding: 0 30px;
                                        }

                                        .rules_title {
                                            line-height: 36px;
                                            font-size: 14px;
                                            color: #fe892c;
                                            padding: 6px 0 2px 0;
                                        }

                                        .rules_p {
                                            line-height: 28px;
                                            font-size: 14px;
                                            color: #444444;
                                        }

                                        .rules_table {
                                            width: 100%;
                                            border-collapse: collapse;
                                            margin-bottom: 15px;
                                            margin-top: 5px;
                                        }

                                        .rules_table tr td {
                                            height: 36px;
                                            line-height: 36px;
                                            font-size: 12px;
                                            text-align: center;
                                            color: #808080;
                                            border: 1px solid #e3e3e3;
                                        }

                                        .scroll_table {
                                            color: #3a3d44;
                                            font-size: 12px;
                                        }

                                        .scroll_table th,
                                        .scroll_table td {
                                            min-width: 75px;
                                            height: 34px;
                                            text-align: center;
                                        }

                                        #sTable {
                                            z-index: -1;
                                        }

                                        .fixedCol {
                                            position: fixed;
                                            left: 0;
                                            background: #00cfd7;
                                            color: #fff;
                                            z-index: 1;
                                        }

                                        #fHeader {
                                            background: #00cfd7;
                                            color: #fff;
                                            position: fixed;
                                            z-index: 1;
                                        }

                                        .fixedA1 {
                                            background: #00cfd7;
                                            position: fixed;
                                            color: #fff;
                                            left: 0;
                                            z-index: 2;
                                        }

                                        #sTable tr {
                                            background: #fff;
                                        }

                                        #sTable th,
                                        #sTable tr:nth-child(2n) {
                                            background: #f5f5f5;
                                        }

                                        .no_data {
                                            padding: 20px;
                                        }

                                        .no_data p {
                                            text-align: center;
                                            opacity: 0.6;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .right {
                float right
                margin-top 8px

                .col {
                    height 70px
                    min-width 130px
                    padding 0 20px
                    float left
                    text-align center

                    + .col {
                        border-left 1px solid rgba(231, 237, 241, 0.1)
                    }

                    /*
                    colWidths = 170 127 147 107 97
                    for colWidth, col in colWidths {
                        &:nth-of-type({col + 1}) {
                            width colWidth px
                        }
                    }
                    */

                    .num {
                        font-family TradeGothicLT
                        font-weight bold
                        height 30px
                        line-height 30px
                        font-size 16px
                        color #FFFFFF

                        &.time {
                            font-size 24px
                            color #0C9DFC
                        }

                        &.live {
                            color #992828
                            font-size 26px
                            font-family TradeGothicLT-Bold
                            letter-spacing 1px
                        }

                        span {
                            color #0C9DFC
                            &.fruit {
                                color #DABE9B
                            }

                            .icon {
                                margin-left 5px
                            }

                            &.other {
                                display block
                                height 20px
                                line-height 18px
                                padding 0 20px
                                color #fff
                                font-size 12px
                            }
                        }

                        img {
                            height 16px
                            margin-left 5px
                        }
                    }

                    .desc {
                        margin-top 8px
                        font-size 14px
                        color #A5A8B2
                        height 20px
                        line-height 20px

                        &.end {
                            line-height 50px
                            font-weight bold
                            height 60px
                            font-size: 24px;
                            color: #0C9DFC;
                        }
                    }
                }

            }
        }
    }
</style>
