<template>
    <div id="my-record">
        <div class="banner"></div>
        <div class="container">
            <div class="block" :class="type.color" v-for="(type,index) in record" :key="index">
                <div class="title">
                    <span class="badge">{{type.title}}战绩</span><span class="date">{{type.data.period}}</span>
                </div>
                <div class="body" v-loading="loading">
                    <div class="round">
                        <div class="rank" :class="{'small': type.data.position > 999}">{{type.data.position}}</div>
                        <div class="type"><lfl-icon icon="rank"></lfl-icon><span>{{type.title}}排名</span></div>
                    </div>
                    <div class="data">
                        <div class="row">
                            <div class="col">
                                <div class="val">
                                    <span class="light">{{type.data.win_times || '-'}}</span> / <span>{{type.data.total_times || '-'}}</span>
                                </div>
                                <div class="key">{{type.title}}战绩</div>
                            </div>
                            <div class="col">
                                <div class="val"><span class="light">{{type.data.win_num || '-'}}</span></div>
                                <div class="key">中奖率</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="val"><span>{{type.data.amount || '-'}}</span><lfl-icon v-if="type.data.amount > 0" icon="fruit"></lfl-icon></div>
                                <div class="key">{{type.title}}收益</div>
                            </div>
                            <div class="col">
                                <div class="val"><span>{{type.data.best_bet.length ? type.data.best_bet[0].prize_amount : '-'}}</span><lfl-icon v-if="type.data.amount > 0" icon="fruit"></lfl-icon></div>
                                <div class="key">单注最高</div>
                            </div>
                        </div>
                    </div>
                    <div class="detail">
                        <div class="title fix-bold-font"><lfl-icon icon="curve"></lfl-icon><span>单场最高收益</span></div>
                        <div class="box">
                            <div class="info">
                                <div v-if="type.data.best_bet.length">
                                    <div class="col badge"><span :class="'type-' + type.data.best_bet[0].room_type">{{options.roomType[type.data.best_bet[0].room_type]}}</span></div>
                                    <div class="col game">
                                        <img src="/static/image/lol.png" />
                                        <span class="name fix-bold-font">英雄联盟</span>
                                    </div>
                                    <div class="col room">
                                        <div class="name"><span class="text fix-bold-font">{{type.data.best_bet[0].name}}</span></div>
                                        <div class="desc">{{type.data.best_bet[0].desc}}</div>
                                    </div>
                                    <div class="col count">
                                        <div class="number">{{type.data.best_bet[0].join_times}} / {{type.data.best_bet[0].single_times}}</div>
                                        <div class="desc">参与次数</div>
                                    </div>
                                </div>
                                <div v-else class="not-data">你{{type.title.replace('总','')}}还没参与过，<router-link to="/" class="link">点此参与</router-link></div>
                            </div>
                            <div class="data">
                                <div class="col rank">
                                    <div class="val light">{{type.data.best_bet.length ? type.data.best_bet[0].rank : '-'}}</div>
                                    <div class="key fix-bold-font">最终排名</div>
                                </div>
                                <div class="col score">
                                    <div class="val light">{{type.data.best_bet.length ? type.data.best_bet[0].total_score : '-'}}</div>
                                    <div class="key fix-bold-font">阵容积分</div>
                                </div>
                                <div class="col bonus">
                                    <div class="val fruit"><span>{{type.data.best_bet.length ? type.data.best_bet[0].prize_amount : '-'}}</span><lfl-icon v-if="type.data.best_bet.length" icon="fruit"></lfl-icon></div>
                                    <div class="key fix-bold-font">获得奖金</div>
                                </div>
                                <div class="col people">
                                    <div class="val light">{{type.data.best_bet.length ? type.data.best_bet[0].join_people : '-'}} / {{type.data.best_bet.length ? type.data.best_bet[0].times : '-'}}</div>
                                    <div class="key fix-bold-font">参与人数</div>
                                </div>
                                <div class="col ticket">
                                    <div class="val light"><span>{{type.data.best_bet.length ? type.data.best_bet[0].price : '-'}}</span><lfl-icon icon="ticket" v-if="type.data.best_bet.length"></lfl-icon></div>
                                    <div class="key fix-bold-font">门票消耗</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                rank: [126,264,4123],
                record: [
                    {
                        title: '本周',
                        color: 'blue',
                        data: {
                            best_bet: []
                        }
                    },
                    {
                        title: '本月',
                        color: 'violet',
                        data: {
                            best_bet: []
                        }
                    },
                    {
                        title: '总',
                        color: 'red',
                        data: {
                            best_bet: []
                        }
                    },
                ],
                options: {
                    roomType: {
                        1: '新手',
                        2: '活动',
                        3: '日赛',
                        4: '周赛',
                        5: 'SOLO',
                        6: '名人',
                        7: '毒奶',
                        8: 'SOLO'
                    }
                },
                update:'',
                loading: false
            }
        },
        mounted (){
            this.requestRecord()
        },
        methods: {
            requestRecord (){
                this.loading = true
                this.api('/services/fantasy/fantasy_member_record.php').then(req => {
                    if (req.code == 200) {
                        this.record[0].data = req.data.week_record
                        this.record[1].data = req.data.month_record
                        this.record[2].data = req.data.total_record
                        this.update = req.data.update
                    }
                    this.loading = false
                })
            }
        }
    }
</script>

<style lang="stylus">
    #my-record {
        .banner {
            background-image url('/static/image/ranking-banner.png')
            height 200px
            .title {
                height 60px
                padding-top 60px
                line-height 60px
                font-size 40px
                color #FAFBFD
            }
        }

        .block {
            height 300px
            background #FFFFFF
            border 1px solid #E7EDF1
            border-radius 2px
            margin-top 20px
            line-height 20px
            box-shadow: 0 1px 4px 0 rgba(5,17,25,0.06);
            transition-duration .3s

            &:hover {
                box-shadow: 0 0 10px 2px rgba(5,17,25,0.06);
            }

            + .block {
                margin-top 15px
            }

            &.blue {
                > .title {
                    .badge {
                        background: #0C9DFC;
                    }
                }
                > .body {
                    .round {
                        background-image linear-gradient(-29deg, #1CCCFE 0%, #0C9DFC 100%)
                        box-shadow 0 1px 4px 0 rgba(5,17,25,0.06)
                    }
                    .col .light {
                        color #0C9DFC
                    }
                }
            }

            &.violet {
                > .title {
                    .badge {
                        background: #5F66C9;
                    }
                }
                > .body {
                    .round {
                        background-image: linear-gradient(143deg, #5F66C9 0%, #A46DD7 100%);
                        box-shadow 0 3px 6px 0 rgba(118,104,206,0.30)
                    }
                    .col .light {
                        color #5F66C9
                    }
                }
            }

            &.red {
                > .title {
                    .badge {
                        background: #DD4848;
                    }
                }
                > .body {
                    .round {
                        background-image linear-gradient(-26deg, #F56851 5%, #D01934 95%)
                        box-shadow 0 3px 7px 0 rgba(255,0,0,0.30)
                    }
                    .col .light {
                        color #DD4848
                    }
                }
            }


            > .title {
                height 50px
                border-bottom 1px solid #E7EDF1
                padding 15px
                font-size: 14px;
                color: #5F6575;

                .badge {
                    border-radius: 4px;
                    width 70px
                    height 20px
                    font-size 14px
                    text-align center
                    color #fff
                    margin-right 12px
                    display inline-block
                }

                .date {
                    font-size: 14px;
                    color: #5F6575;
                }
            }

            .body {
                height 250px
                position relative

                .round {
                    box-shadow: 0 3px 6px 0 rgba(17,173,252,0.30);
                    width 160px
                    height 160px
                    color: #FFFFFF;
                    font-family: TradeGothicLT-bold
                    border-radius 50%
                    position absolute
                    left 47px
                    top 45px
                    text-align center
                    padding-top 44px

                    .rank {
                        height 62px
                        line-height 62px
                        font-size 52px

                        &.small {
                            font-size 44px
                        }
                    }

                    .type {
                        font-size 14px
                        height 18px
                        line-height 18px
                        margin-top 2px

                        span,.icon {
                            display inline-block
                            vertical-align middle
                        }
                        .icon {
                            margin-right 5px
                            width 11px
                            height 11px
                        }
                    }
                }

                > .data {
                    position absolute
                    left 233px
                    top 59px

                    .row {
                        .col {
                            width 100px
                            display inline-block
                            text-align center

                            + .col {
                                margin-left 20px
                            }

                            &:first-child {
                                width 130px
                            }

                            .val {
                                font-family: TradeGothicLT-bold
                                height 28px
                                line-height 28px
                                font-size 24px
                                color #5F6575
                                overflow hidden
                                text-overflow ellipsis
                                white-space nowrap
                            }

                            .space {
                                letter-spacing 5px
                            }

                            .split {
                                font-family: TradeGothicLT-bold
                                font-size 22px
                                color #A5A8B2
                                margin 0 4px
                            }

                            .key {
                                height 18px
                                line-height 18px
                                margin-top 3px
                                font-size 14px
                                color #586077
                            }

                        }

                        + .row {
                            margin-top 36px
                            .col {
                                .val {
                                    color #FFA646
                                    span,.icon {
                                        display inline-block
                                        vertical-align middle
                                    }
                                    .icon {
                                        font-size 15px
                                        margin-left 4px
                                    }
                                }
                            }
                        }
                    }
                }

                .detail {
                    position absolute
                    top 21px
                    right 30px
                    width 640px

                    > .title {
                        height 20px
                        line-height 20px
                        font-weight bold
                        color #586077
                        font-size 14px

                        span,.icon {
                            display inline-block
                            vertical-align middle
                        }

                        .icon {
                            margin-right 8px
                        }
                    }

                    .box {
                        height 160px
                        margin-top 10px

                        > div {
                            height 80px
                            .col {
                                float left
                            }

                            &.info {
                                background-color #F3F5F7
                                padding 20px 0

                                .not-data {
                                    height 40px
                                    line-height 40px
                                    text-align center
                                    .link {
                                        color #0c9dfc
                                    }
                                }

                                .col {
                                    &.badge {
                                        width 77px
                                        text-align center

                                        span {
                                            padding 0 5px
                                            height 18px
                                            line-height 18px
                                            background #30BF63
                                            color #fff
                                            font-size 12px
                                            text-align center
                                            border-radius 2px
                                            margin-top 10px
                                            display inline-block

                                            roomTypeColors = #29a7ff #ffbb2a #00cfd7 #ff1a65 #373a41 #fe892c #b00000 #373a41
                                            for color, i in roomTypeColors {
                                                &.{'type-' + (i + 1)} {
                                                    background-color color
                                                }
                                            }

                                            &.type-5 {
                                                font-family TradeGothicLT-Bold
                                            }
                                        }
                                    }

                                    &.game {
                                        width 131px

                                        img,span {
                                            display inline-block
                                            vertical-align middle
                                        }
                                        img {
                                            margin 5px 0
                                            height 30px
                                        }

                                        .name {
                                            height 40px
                                            line-height 40px
                                            font-size 14px
                                            margin-left 13px
                                        }
                                    }

                                    &.room {
                                        width 340px
                                        .name {
                                            height 21px
                                            overflow hidden
                                            text-overflow ellipsis
                                            white-space nowrap

                                            span {
                                                display inline-block
                                                vertical-align middle
                                            }

                                            .text {
                                                height 21px
                                                line-height 21px
                                                font-size: 16px;
                                            }

                                            .badge {
                                                color #fff
                                                font-size 12px
                                                width 32px
                                                line-height 17px
                                                height 17px
                                                background: #FA9B3C;
                                                border-radius: 2px;
                                                text-align center
                                                margin-left 5px
                                            }
                                        }

                                        .desc {
                                            height 16px
                                            line-height 16px
                                            font-size 12px
                                            color #0C9DFC
                                            margin-top 2px
                                            overflow hidden
                                            text-overflow ellipsis
                                            white-space nowrap
                                        }
                                    }

                                    &.count {
                                        float right
                                        margin-right 23px
                                        text-align right

                                        .number {
                                            height 21px
                                            line-height 21px
                                            font-size 16px
                                        }

                                        .desc {
                                            margin-top 2px
                                            height 16px
                                            line-height 16px
                                            font-size: 12px;
                                            color: #A5A8B2;
                                        }
                                    }
                                }
                            }

                            &.data {
                                background-color #FAFBFD
                                padding 15px 0

                                .col {
                                    text-align center
                                    colWidths = 150 124 202 152 106
                                    font-family: TradeGothicLT-Bold

                                    &.rank {
                                        width 116px

                                    }

                                    &.score {
                                        width 100px
                                    }

                                    &.bonus {
                                        width 155px
                                        border-right 1px solid #D0D8E1

                                        .val {
                                            color #FFA646
                                        }
                                    }

                                    &.people {
                                        width 155px
                                        .val {
                                            font-size 18px
                                        }
                                    }

                                    &.ticket {
                                        width 110px
                                        .val {
                                            font-size 20px
                                        }
                                    }

                                    .val {
                                        height 28px
                                        line-height 28px
                                        font-family TradeGothicLT-Bold
                                        font-size 24px

                                        span,.icon {
                                            display inline-block
                                            vertical-align middle
                                        }
                                        .icon {
                                            font-size 15px
                                            margin-left 4px
                                        }
                                    }

                                    .key {
                                        height 20px
                                        line-height 20px
                                        margin-top 2px
                                        font-size 14px
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>
