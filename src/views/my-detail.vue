<template>
    <div id="my-detail" class="container">
        <div class="title fix-bold-font">我的明细<a class="back" href="javascript:history.back();">返回</a></div>
        <div class="main">
            <div class="nav">
                <div class="nav-item" v-for="(item,index) in leftNav.list" :key="index" :class="[item.type, {'active': leftNav.curr == index}]" @click="navHandle(index)">
                    <lfl-icon :icon="item.icon"></lfl-icon>
                    <div class="name">{{item.label}}</div>
                </div>
            </div>
            <div class="body" v-loading="item.loading" v-for="(item,index) in leftNav.list" :key="index" :class="[item.type, {'show': leftNav.curr == index}]">
                <div class="top">
                    <span class="key">我的{{item.label}}：</span><span class="val">{{item.value | number}}</span>
                    <div class="actions" v-if="item.type == 'diamond'">
                        <router-link to="/recharge/diamond" class="svg-button"><span>充值</span><lfl-icon icon="recharge"></lfl-icon></router-link>
                    </div>
                    <div class="actions" v-if="item.type == 'ticket'">
                        <router-link to="/recharge/ticket" class="svg-button"><span>购买</span><lfl-icon icon="recharge"></lfl-icon></router-link>
                    </div>
                    <div class="actions" v-if="item.type == 'fruit'">
                        <router-link to="/mall" class="svg-button"><span>兑换</span><lfl-icon icon="recharge"></lfl-icon></router-link>
                    </div>
                    <div class="actions" v-if="item.type == 'key'">
                        <router-link to="/recharge/key" class="svg-button"><span>购买</span><lfl-icon icon="recharge"></lfl-icon></router-link>
                    </div>
                </div>
                <div class="filter">
                    <!--<el-radio-group v-if="item.filter" v-model="item.filter.types.value">-->
                        <!--<el-radio-button v-for="(option,index) in item.filter.types.options" :label="index" :key="index">{{option.label}}</el-radio-button>-->
                    <!--</el-radio-group>-->
                    <div class="alert" v-show="item.type == 'fruit'">最近3个月果子明细</div>
                    <div class="fr">
                        <!--<div v-if="item.type == 'diamond'">-->
                            <!--<div class="input">-->
                                <!--<input type="text" placeholder="订单号" />-->
                                <!--<lfl-icon icon="search"></lfl-icon>-->
                            <!--</div>-->
                        <!--</div>-->
                    </div>
                </div>
                <div class="table" :class="leftNav.list[leftNav.curr].type" v-if="item.table.data.length">
                    <table>
                        <thead>
                            <tr>
                                <th :class="col.filed" v-for="(col,index) in item.table.column" :key="index">{{col.label}}</th>
                            </tr>
                        </thead>
                    </table>
                    <VuePerfectScrollbar id="scrollbar" class="scrollbar" @ps-y-reach-end="scrollEvent(item.type)">
                        <table>
                            <tbody>
                            <tr v-for="(row,index) in item.table.data" :key="index">
                                <td v-for="(col,index) in item.table.column" :key="index" :style="{width: col.width}" :class="[{'bold': col.number, 'red': col.number && row[col.filed] < 0, 'light': col.number && row[col.filed] >= 0}, col.filed]">
                                    <lfl-icon icon="fruit" v-if="item.type == 'fruit-normal' && col.number"></lfl-icon>
                                    <span v-if="col.datetime == true">{{row[col.filed],'YYYY-MM-DD HH:mm' | datetime}}</span>
                                    <span v-else><span v-if="col.number && row[col.filed] >= 0">+</span>{{row[col.filed]}}</span>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </VuePerfectScrollbar>
                </div>
                <lfl-null v-else padding="80" width="200" :text="'暂无' + item.label + '记录'"></lfl-null>
                <!--<div class="pagination">-->
                    <!--<el-pagination layout="prev, pager, next" :total="1000"></el-pagination>-->
                <!--</div>-->
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                leftNav: {
                    curr: '',
                    list: [
                        {
                            type: 'diamond',
                            icon: 'diamond',
                            label: '钻石',
                            value_field: 'diamond_number',
                            value: 0,
                            filter: {
                                types: {
                                    value: 0,
                                    options: [
                                        {label: '钻石明细', value: 0},
                                        {label: '收入明细', value: 1},
                                        {label: '支出明细', value: 2}
                                    ]
                                }
                            },
                            loading: false,
                            table: {
                                url: '/services/fantasy/diamond_log.php',
                                params: {
                                    start_id: '',
                                    limit: 200
                                },
                                lastCount: 0,
                                column: [
                                    {label: '日期', filed: 'time', datetime: true},
                                    {label: '收入/支出', filed: 'number', number: true},
                                    {label: '详细说明', filed: 'title'},
//                                    {label: '订单号', filed: 'order_id'}
                                ],
                                data: []
                            }
                        },
                        {
                            type: 'ticket',
                            icon: 'ticket',
                            value_field: 'ticket',
                            label: '门票',
                            value: 0,
                            filter: {
                                types: {
                                    value: 0,
                                    options: [
                                        {label: '门票明细', value: 0},
                                        {label: '收入明细', value: 1},
                                        {label: '支出明细', value: 2}
                                    ]
                                }
                            },
                            loading: false,
                            table: {
                                url: '/services/fantasy/ticket_log.php',
                                params: {
                                    start_id: '',
                                    limit: 200
                                },
                                lastCount: 0,
                                column: [
                                    {label: '日期', filed: 'time', datetime: true},
                                    {label: '收入/支出', filed: 'number', number: true},
                                    {label: '详细说明', filed: 'title'},
                                ],
                                data: []
                            }
                        },
                        {
                            type: 'fruit',
                            icon: 'fruit-normal',
                            value_field: 'guozi',
                            label: '果子',
                            value: 0,
                            loading: false,
                            table: {
                                url: '/services/task/my_guozi_list.php',
                                params: {
                                    page: 1,
                                    limit: 200
                                },
                                lastCount: 0,
                                column: [
                                    {label: '日期', filed: 'add_time', datetime: true},
                                    {label: '收入/支出', filed: 'guozi', number: true},
                                    {label: '项目', filed: 'keyword'},
                                    {label: '详细说明', filed: 'title'}
                                ],
                                data: []
                            }
                        },
                        {
                            type: 'key',
                            icon:'key',
                            value_field: 'fantasy_key',
                            label: '钥匙',
                            value: 0,
                            loading: false,
                            filter: {
                                types: {
                                    value: 0,
                                    options: [
                                        {label: '余额明细', value: 0},
                                        {label: '收入明细', value: 1},
                                        {label: '支出明细', value: 2}
                                    ]
                                }
                            },
                            table: {
                                url: '/services/fantasy/key_log.php',
                                params: {
                                    start_id: '',
                                    limit: 200
                                },
                                lastCount: 0,
                                column: [
                                    {label: '日期', filed: 'time', datetime: true},
                                    {label: '收入/支出', filed: 'number', number: true},
                                    {label: '详细说明', filed: 'title'}
                                ],
                                data: []
                            }
                        }
                    ]
                }
            }
        },
        computed: {
            member () {
                return this.$store.state.member
            },
            _nav () {
                let obj = {}
                for (let i in this.leftNav.list) {
                    obj[this.leftNav.list[i].type] = i
                }
                return obj
            }
        },
        watch: {
            '$route' (data) {
                this.navChange(data.params.type)
            },
            'leftNav.curr' (navIndex) {
                this.requestList(navIndex)
            }
        },
        mounted () {
            this.navChange(this.$route.params.type)
        },
        methods : {
            requestList (navIndex) {
                let _type = this.leftNav.list[navIndex]
                let _table = _type.table
                _type.loading = true
                this.api(_table.url, _table.params).then(req => {
                    if (req.code == 200) {
                        _table.lastCount = req.data.list.length
                        _type.value = req.data[_type.value_field]
                        if (_table.params.start_id == '' || _table.params.page == 1) {
                            _table.data = req.data.list
                        } else {
                            for (let i in req.data.list) {
                                _table.data.push(req.data.list[i])
                            }
                        }
                    }
                    _type.loading = false
                })
            },
            navChange (type) {
                this.leftNav.curr = this._nav[type]
            },
            navHandle (index) {
                this.$router.replace('/my/detail/' + this.leftNav.list[index].type)
                this.leftNav.curr = index
            },
            scrollEvent () {
//                let _type = this.leftNav.list[this.leftNav.curr]
//                let _table = _type.table
//                if (_type.loading && !_table.data.length && (_table.lastCount != 0 && _table.lastCount != _table.params.limit)) return
//                if (_table.params.start_id != undefined) {
//                    _table.params.start_id = _table.data[_table.data.length - 1].log_id
//                } else if (_table.params.page != undefined) {
//                    _table.params.page++
//                }
//                this.requestList(this.leftNav.curr)
            }
        }
    }
</script>

<style lang="stylus">
    #my-detail {
        height 640px
        margin-top 40px
        background #FFFFFF
        border 1px solid #E7EDF1
        box-shadow 0 1px 4px 0 rgba(5,17,25,0.06)
        overflow hidden
        border-radius 2px

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
            height 600px

            .nav {
                width 120px
                height 100%
                float left
                border-right 1px solid #E7EDF1

                .nav-item {
                    height 150px
                    background-color #FAFBFD
                    padding-top 45px
                    text-align center
                    cursor pointer
                    position relative
                    border-left 2px solid transparent
                    user-select none
                    transition-duration .5s

                    &.disabled {
                        cursor no-drop
                        .icon,.name {
                            opacity .1
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
                            top 68px
                            z-index 2
                        }

                        &:before {
                            right -8px
                            top 67px
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

                        &.fruit {
                            border-left-color #FFA626
                            .icon,.name {
                                color #FFA626
                            }
                        }

                        &.key {
                            border-left-color #cba77a
                            .icon,.name {
                                color #cba77a
                            }
                        }
                    }

                    .icon {
                        display block
                        margin 0 auto
                        width 26px
                        height 26px
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
                width calc(100% - 120px)
                height 100%
                float right
                padding 15px 35px 0
                display none

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

                &.fruit {
                    .top,.light {
                        color #FFA626
                    }
                }

                &.key {
                    .top,.light {
                        color #cba77a
                    }
                }

                .red {
                    color #FF5C5C
                }

                .top {
                    height 40px
                    line-height 40px

                    span {
                        display inline-block
                        vertical-align middle
                    }

                    .key {
                        font-size 20px
                    }

                    .val {
                        font-size 28px
                        font-family TradeGothicLT
                        font-weight bold
                    }

                    .actions {
                        float right
                        .svg-button {
                            display inline-block
                            height 40px
                            position relative

                            span {
                                position: absolute;
                                display: block;
                                left: 0;
                                right: 0;
                                text-align: center;
                                font-size: 16px;
                                color: #fff;
                                z-index: 1;
                            }
                            .icon {
                                width: 70px;
                                height: 40px;
                                color: #0c9dfc;
                            }
                        }
                    }
                }

                .filter {
                    height 36px
                    margin-top 15px

                    .alert {
                        height 36px
                        line-height 36px
                        background #FFFCF8
                        border 1px solid #FFE8D0
                        text-align center
                        font-size 14px
                        color #FFA646
                    }

                    .input {
                        width 240px
                        height 36px
                        border: 1px solid #DDE4E9;
                        border-radius: 4px;
                        overflow hidden
                        position relative

                        input {
                            width 100%
                            height 100%
                            padding 0 36px 0 14px
                            border none
                            background: #FAFBFD;

                            &::-webkit-input-placeholder{color:#A5A8B2;}
                            &:-moz-placeholder{color:#A5A8B2;}
                            &::-ms-input-placeholder{color:#A5A8B2;}
                        }

                        .icon {
                            width 36px
                            height 36px
                            position absolute
                            top 0
                            right 0
                            padding 10px
                            color #A5A8B2
                        }

                    }

                }

                .table {
                    margin-top 20px
                    height 440px
                    border 1px solid #e7edf1

                    .scrollbar {
                        height 400px
                    }

                    table {
                        width 100%
                        color #586077
                        border-collapse collapse

                        td,th {
                            height 40px
                            font-size 14px
                            text-align center

                            &:nth-child(1) {
                                width 250px
                            }

                            &:nth-child(2) {
                                width 250px
                            }
                        }

                        thead {
                            tr {
                                th {

                                }
                            }
                        }

                        tbody {
                            tr {
                                &:nth-child(odd) {
                                    background-color #F3F5F7
                                }
                                td {
                                    &.bold {
                                        font-weight bold
                                    }
                                    &.number {
                                        text-align right
                                        padding-right 110px
                                    }
                                }
                            }
                        }
                    }

                    &.fruit {
                        table {
                            td,th {
                                &:nth-child(3),&:nth-child(4) {
                                    width 253px
                                }
                            }
                        }
                    }

                }

                .pagination  {
                    text-align right
                    margin-top 25px
                    height 30px
                    line-height 30px
                    .el-pagination {
                        padding 0

                        button {
                            border none
                            margin 0 10px

                            &.btn-prev .el-icon
                            &.btn-next .el-icon {
                                font-size 14px
                                color #586077
                            }

                            &.disabled {
                                &.btn-prev .el-icon
                                &.btn-next .el-icon {
                                    font-size 14px
                                    color #A5A8B2
                                }

                            }
                        }

                        .el-icon-arrow-left:before {
                            content '上一页'
                        }

                        .el-icon-arrow-right:before　{
                            content '下一页'
                        }

                        .el-pager {
                            li {
                                color #586077
                                width 30px
                                height 30px
                                padding 0
                                font-size 14px
                                font-family MicrosoftYaHei-Bold
                                margin 0 4px
                                border none
                                &.number {
                                    &.active {
                                        background #586077
                                        border-radius 4px
                                        color #fff
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        .el-radio-button__inner {
            user-select none
            color #586077
            &:hover {
                color #586077
            }

        }

        .el-radio-button__orig-radio {
            &:checked {
                + .el-radio-button__inner {
                    background-color #586077
                    border-color #586077
                    box-shadow -1px 0 0 0 #586077
                    color #fff
                    &:hover {
                        color #fff
                    }

                }
            }
        }
    }
</style>
