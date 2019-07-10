<template>
    <div class="player-detail">
        <div class="close-btn" @click="$emit('closePlayerDetail')"><lfl-icon icon="close"></lfl-icon></div>
        <div class="player-info-wrap">
            <div class="top">
                <img v-if="player.info.player_country_image" class="flag" :src="player.info.player_country_image" />
                <div class="avatar" :style="{'background-image': 'url('+ (player.bg1 || '/static/image/bg1.png') +')' }">
                    <img :src="(player.player_image || '/static/image/unknow.png')" />
                </div>
                <div class="info">
                    <div class="player-name">{{player.nickname}}</div>
                    <div class="position">
                        <lfl-icon :icon="'pos-' + player.position_short_name.toLowerCase()"></lfl-icon><span>{{player.team_short_name}}</span><span class="split">/</span><span>{{player.position_name}}</span>
                    </div>
                    <div class="price"><span>$</span><span class="number">{{player.value}}</span><span class="badge" :class="'status-' + player.player_status">{{player.player_status | playerStatus}}</span></div>
                </div>
                <div class="score" v-loading="loading" v-if="player.info.win_rate">
                    <lfl-css-circle v-if="player.info.win_rate" color="#0c9dfc" :width="96" :font-size="20" :pv="player.info.win_rate == '' ? '-' : parseInt(player.info.win_rate) + '%'" :score="parseInt(player.info.total_win)" :total-score="parseInt(player.info.total_win) + parseInt(player.info.total_los)" :bold="8" text-bg-color='#ffffff' bg-color="#dbf1ff" text="胜率"></lfl-css-circle>
                    <div class="rhombus rhombus_bg1 fll">
                        <p>{{player.info.kda}}</p>
                        <p class="kda">{{player.info.kills}} / <span class="">{{player.info.deaths}}</span> / {{player.info.assists}}</p>
                    </div>
                    <div class="rhombus rhombus_bg2 fll">
                        <p>{{player.info.score}}</p>
                    </div>
                    <div class="clearfix"></div>
                    <div class="text">
                        <p class="v-circle">{{player.info.total_win == '' ? '-' : player.info.total_win}}胜 {{player.info.total_los == '' ? '-' : player.info.total_los}}败</p>
                        <p class="rhombus">KDA</p>
                        <p class="rhombus">平均分</p>
                    </div>
                </div>

            </div>
            <div class="data">
                <div class="col">
                    <div class="key">击杀</div>
                    <div class="val">{{player.kills}}</div>
                </div>
                <div class="col">
                    <div class="key">死亡</div>
                    <div class="val">{{player.deaths}}</div>
                </div>
                <div class="col">
                    <div class="key">助攻</div>
                    <div class="val">{{player.assists}}</div>
                </div>
                <div class="col">
                    <div class="key">分均伤害</div>
                    <div class="val">{{player.demage_dealt_m}}</div>
                </div>
                <div class="col">
                    <div class="key">分均承伤</div>
                    <div class="val">{{player.demage_taken_m}}</div>
                </div>
                <div class="col">
                    <div class="key">分均视野</div>
                    <div class="val">{{player.sight_m}}</div>
                </div>
                <div v-if="type == 'room'" class="select-player-button" @click="$emit('selectPlayer')">选择该选手<span>$<span>{{player.price}}</span></span></div>
            </div>
        </div>
        <div class="history-result-list" v-loading="loading">
            <div class="head clearfix">
                <div class="col">日期</div>
                <div class="col">比赛</div>
                <div class="col">场次</div>
                <div class="col">表现分</div>
                <div class="col">杀 / 死 / 助</div>
                <div class="col">分均伤害</div>
                <div class="col">分均承伤</div>
                <div class="col">分均视野</div>
            </div>
            <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                <div class="list">
                    <div class="list-item clearfix" v-for="(item,index) in player.info.match_list" :key="index">
                        <div class="col">{{item.start_time,'MM-DD' | datetime}}</div>
                        <div class="col">{{item.match}}</div>
                        <div class="col">{{item.bo}}</div>
                        <div class="col">{{item.score}}</div>
                        <div class="col">{{item.kills}} / {{item.deaths}} / {{item.assists}}</div>
                        <div class="col">{{item.totalDamageDealtToChampions}}</div>
                        <div class="col">{{item.totalDamageTaken}}</div>
                        <div class="col">{{item.wards}}</div>
                    </div>
                    <lfl-null v-if="!player.info.match_list.length" padding="90" width="220"></lfl-null>
                </div>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                type: String,
                default: ''
            },
            data: {
                type: Object
            }
        },
        watch: {
            data (data) {
                if (data) {
                    data.info = {
                        match_list: []
                    }
                    this.player = JSON.parse(JSON.stringify(data))
                    this.requestPlayerInfo(data.playerID)
                }
            }
        },
        data () {
            return {
                player: {
                    info: {
                        match_list: []
                    },
                    bg1: '',
                    player_image: '-',
                    nickname: '-',
                    team_short_name: '-',
                    positionID: 1,
                    position_short_name: 'TOP',
                    position_name: 'TOP',
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    demage_dealt_m: 0,
                    demage_taken_m: 0,
                    sight_m: 0,
                    value: 0,
                },
                pos: {
                    obj: {
                        1: {en: 'top', name: '上单', positionID: 3},
                        2: {en: 'jug', name: '打野', positionID: 4},
                        3: {en: 'mid', name: '中单', positionID: 2},
                        4: {en: 'adc', name: 'ADC', positionID: 1},
                        5: {en: 'sup', name: '辅助', positionID: 5}
                    }
                },
                loading: false
            }
        },
        methods: {
            requestPlayerInfo (playerID) {
                this.loading = true
                this.ajax('/player/'+ playerID +'.json', response => {
                    if (response.data) {
                        this.player.info = response.data
                    }
                    this.loading = false
                }, _ => {
                    this.$message.error('选手数据不存在')
                    this.loading = false
                })
            }
        }
    }
</script>

<style lang="stylus">
    .player-detail {
        background-color #FAFBFD
        position absolute
        width 100%
        z-index 14
        transition-duration .3s
        padding 40px 25px
        visibility hidden
        bottom 0
        top 0
        overflow hidden
        opacity 0
        box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.08);

        .scrollbar {
            height 480px
        }

        &.show {
            visibility visible
            opacity 1
        }

        .close-btn {
            position absolute
            right 0
            top 0
            height 34px
            width 34px
            color #fff
            opacity .3
            transition-duration .3s
            cursor pointer
            z-index 12
            border-bottom-left-radius 4px
            background-color #ff252f
            color #fff

            .icon {
                width 14px
                height 14px
                margin 10px
            }

            &:hover {
                opacity 1
            }
        }

        .player-info-wrap,
        .history-result-list {
            background: #FFFFFF;
            border: 1px solid #E7EDF1;
            box-shadow: 0 1px 4px 0 rgba(5, 17, 25, 0.06);
            border-radius: 2px;
        }

        .player-info-wrap {
            height 240px
            .top {
                height 170px
                border-bottom 1px solid #E7EDF1
                overflow hidden
                position relative

                .flag {
                    position absolute
                    left 10px
                    top 5px
                    width 32px
                    height auto
                    z-index 10
                }

                .avatar {
                    width 207px
                    height 170px
                    background-size cover
                    background-position right
                    float left

                    img {
                        height 160px
                        position absolute
                        bottom 0
                        left 15px
                    }
                }

                .info {
                    position absolute
                    left 222px
                    top 38px
                    width 180px
                    font-family TradeGothicLT
                    font-weight bold

                    .player-name {
                        font-size 24px
                        height 28px
                        line-height 28px
                    }

                    .position {
                        font-size 14px
                        margin-top 9px
                        height 18px
                        line-height 18px

                        span, .icon {
                            display inline-block
                            vertical-align middle
                        }

                        .icon {
                            width 16px
                            height 16px
                            margin-right 7px
                        }

                        .split {
                            color #D8D8D8;
                            margin 0 14px
                        }
                    }

                    .price {
                        height 28px
                        line-height 28px
                        font-size 24px
                        color #DABE9B
                        margin-top 20px

                        span {
                            display inline-block
                            vertical-align middle
                        }

                        &.number {
                            margin-left 2px
                        }

                        .badge {
                            padding 0 3px
                            height 18px
                            line-height 18px
                            border-radius 2px
                            font-size 12px
                            text-align center
                            margin-left 5px
                            color #fff
                            background-color #000

                            &.status-1 {
                                background-color #0C9DFC
                            }

                            &.status-2 {
                                background-color #bebebe
                            }

                            &.status-4 {
                                background-color #ffb30f
                            }
                        }
                    }
                }

                .score {
                    float right
                    width 380px
                    padding-top 25px
                    padding-right 15px

                    .rhombus {
                        width 116px
                        height 96px
                        text-align center
                        font-size 14px
                    }

                    .rhombus_bg1 {
                        float left
                        background url('/static/image/player-detail-data-bg.png') no-repeat center
                        background-size 84px

                        p {
                            font-size 12px
                            color #373a41
                            font-family TradeGothicLT-Bold

                            &.kda {
                                height 30px
                                line-height 30px
                                background-color #fff
                            }

                            span {
                                font-size 12px
                                color #ff6262
                            }
                        }

                        p:first-Child {
                            margin-top 25px
                            font-size 26px
                            color #0c9dfc
                            font-family TradeGothicLT-Bold
                        }
                    }

                    .rhombus_bg2 {
                        float right
                        background url('/static/image/player-detail-data-bg.png') no-repeat center
                        background-size 84px

                        p {
                            font-size 26px
                            line-height 96px
                            color #0c9dfc
                            font-family TradeGothicLT-Bold
                        }
                    }

                    .text{
                        font-size 14px
                        margin-top 8px
                        width 100%
                        height 20px
                        line-height 20px
                        overflow hidden

                        .v-circle {
                            width 96px
                            text-align center
                            float left
                        }

                        .rhombus{
                            text-align center
                            float left
                        }
                    }
                }
            }
            .data {
                height 70px
                padding 15px

                .col {
                    float left
                    height 40px
                    margin 0 20px
                    text-align center

                    div {
                        height 20px
                        line-height 20px
                    }

                    .key {
                        font-size 14px
                    }

                    .val {
                        font-family TradeGothicLT-Bold
                        font-size 16px
                        color #0C9DFC
                    }
                }

                .select-player-button {
                    user-select none
                    cursor pointer
                    float right
                    width 154px
                    height 40px
                    line-height 40px
                    text-align center
                    background: #0C9DFC;
                    border: 1px solid #0497F8;
                    border-radius: 4px;
                    margin-right 15px
                    font-size 14px
                    color #fff
                    transition-duration .3s
                    > span {
                        font-family: TradeGothicLT
                        font-weight bold
                        font-size: 14px;
                        margin-left 13px
                        span {
                            margin-left 2px
                        }
                    }

                    &:hover {
                        box-shadow: 0 2px 4px 0 rgba(12, 157, 252, 0.40);
                    }
                }
            }
        }


        .history-result-list {
            margin-top 15px
            height 480px
            overflow hidden

            .head {
                height 50px
                line-height 50px
                border-bottom 1px solid #E7EDF1
            }
            .list {
                .list-item {
                    height 50px
                    line-height 50px
                    border-bottom 1px solid #E7EDF1
                    font-family TradeGothicLT
                    font-weight bold
                    font-size 14px
                }
            }
            .scrollbar {
                height 430px
                overflow hidden
            }
            .col {
                font-size 14px
                float left
                text-align center
                colWidths = 80 90 60 80 120 100 100 90
                for colWidth, col in colWidths {
                    &:nth-of-type({col + 1}) {
                        width colWidth px
                    }
                }

            }

            .list .list-item {
                .col:nth-child(2) {
                    padding-left
                }
            }

        }

        &.order {
            .history-result-list {
                height 445px

                .scrollbar {
                    height 393px
                }
            }
        }

        &.lineup {
            .history-result-list {
                height 550px

                .scrollbar {
                    height 500px
                }
            }
        }
    }
</style>