<template>
    <div id="room-match" :class="{'show-match': selectedMatch}">
        <div class="match-count fl">
            <div class="count">{{data.list.length}}</div>
            <div>比赛</div>
        </div>
        <div class="list-wrap fl">
            <div class="arrow prev fl" @click="matchScroll('prev')"></div>
            <div class="list fl">
                <div class="scroll-wrap" :style="{width: data.list.length * 130 + 'px', transform: 'translate('+ (data.index) * -130 + 'px' +', 0)'}">
                    <div class="item" v-for="(item,index) in data.list" @click="openMatch(item,index)" :class="[{'active': data.selectedIndex === index},{'not-click': !item.near_ten}]">
                        <div class="title">{{item.tournament_short_name}}</div>
                        <div class="team">
                            <img :src="item.team_a_image"/>
                            <span class="name">{{item.team_a_short_name}}</span>
                            <span class="score"><span class="date" v-if="item.status == 0">{{item.start_time, 'MM-DD' | datetime}}</span><span v-else>{{item.team_a_win}}</span></span>
                        </div>
                        <div class="team">
                            <img :src="item.team_b_image"/>
                            <span class="name">{{item.team_b_short_name}}</span>
                            <span class="score"><span class="date" v-if="item.status == 0">{{item.start_time, 'HH:mm' | datetime}}</span><span v-else>{{item.team_b_win}}</span></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="arrow next fr" @click="matchScroll('next')"></div>
            <div class="clear"></div>
        </div>
        <div class="clear"></div>
        <div class="match-info-wrap" :class="{'show': selectedMatch}">
            <div class="close-btn" @click="closeMatchInfoWin"><lfl-icon icon="close"></lfl-icon></div>
            <div class="team-wrap" v-if="selectedMatch" >
                <div class="team team-left">
                    <img class="fl" :src="selectedMatch.team_a_image" />
                    <div class="info fl">
                        <div class="short-name">{{selectedMatch.team_a_short_name}}</div>
                    </div>
                </div>
                <div class="vs">VS</div>
                <div class="team team-right">
                    <img class="fr" :src="selectedMatch.team_b_image" />
                    <div class="info fr">
                        <div class="short-name">{{selectedMatch.team_b_short_name}}</div>
                    </div>
                </div>
            </div>
            <div class="history-match-list" v-if="selectedMatch">
                <div class="head fix-bold-font">最近交战 {{selectedMatch.near_ten.length}} 场</div>
                <VuePerfectScrollbar class="scrollbar" :settings="scrollSettings">
                <div class="list">
                    <div class="list-item" v-for="(item,index) in selectedMatch.near_ten" :key="index">
                        <div class="match-data">
                            <span>{{item.start_time}}</span><span>{{item.tournament_name}}</span>
                        </div>
                        <div class="match-vs">
                            <span class="team-name team-a">{{item.team_short_name_a}}</span>
                            <img :src="item.team_image_thumb_a" />
                            <span class="score">{{item.team_a_win}}：{{item.team_b_win}}</span>
                            <img :src="item.team_image_thumb_b" />
                            <span class="team-name team-b">{{item.team_short_name_b}}</span>
                        </div>
                    </div>
                    <lfl-null v-if="!selectedMatch.near_ten.length" text="最近暂无交战记录" width="200"></lfl-null>
                </div>
                </VuePerfectScrollbar>
            </div>
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
                        index: 0,
                        selectedIndex: '',
                        matchInfoStyle: {
                            width: 787,
                            height: 680,
                            bottom: 0
                        },
                        list: [],
                    }
                }
            }
        },
        data () {
            return {
                scrollSettings: {}
            }
        },
        mounted () {
//            this.data.matchInfoStyle.bottom = this.data.matchInfoStyle.height * -1
        },
        computed: {
            selectedMatch () {
                return this.data.list[this.data.selectedIndex] || null
            }
        },
        methods: {
            matchScroll (action) {
                let max = this.data.list.length - 1
                let index = this.data.index
                if (action === 'prev' && index > 0) {
                    this.data.index--
                } else if(action === 'next' && index < (max > 4 ? max - 4 : 0)) {
                    this.data.index++
                }
            },
            closeMatchInfoWin () {
                this.data.currId = ''
                this.data.selectedIndex = ''
            },
            openMatch (item,index) {
                if (!item.near_ten) return
                if (this.data.selectedIndex !== index) {
                    this.data.currId = item.matchID
                    this.data.selectedIndex = index
                } else {
                    this.data.currId = ''
                    this.data.selectedIndex = ''
                }
            }
        }
    }
</script>

<style lang="stylus">
    #room-match {
        border-top 1px solid #e7edf1
        border-bottom 1px solid #e7edf1
        background-color: #fff;
        position relative

        .match-count,
        .list-wrap,
        .list-wrap .list,
        .list-wrap .arrow
        .list-wrap .list {
            height: 80px;
        }

        .match-count {
            background: #0C9DFC;
            border: 1px solid #0397F9;
            box-shadow: 0 0 4px 0 rgba(12, 157, 252, 0.40);
            width: 70px;
            font-size: 14px;
            text-align: center;
            height 80px
            padding-top 14px

            > div {
                line-height: 25px;
                color: #fff;
            }

            .count {
                font-size: 22px;
                font-weight: bold;
            }
        }

        .list-wrap {
            width: calc(100% - 70px);
            height 80px

            .list {
                width: calc(100% - 44px)
                overflow: hidden;

                .scroll-wrap {
                    transition-duration: .3s;
                }

                .item {
                    user-select none
                    width 130px
                    height 80px
                    padding 0 15px
                    border-right 1px solid #E7EDF1
                    font-family TradeGothicLT-Bold
                    text-align center
                    font-size 12px
                    float left
                    cursor pointer

                    &:not(.active):hover {
                        background-color #f3f3f3
                    }

                    &.not-click {
                        cursor default
                    }


                    .title {
                        height: 16px;
                        line-height: 16px;
                        margin-top 6px
                        font-size: 13px;
                        text-align: center;
                        font-weight: bold;
                        overflow hidden
                        text-overflow ellipsis
                        white-space nowrap
                    }

                    .team {
                        margin-top 6px
                        height: 15px;
                        line-height: 15px;
                        text-align: left;

                        .score {
                            float right

                            .date {
                                opacity 0.7
                                line-height 16px
                                height 16px
                                color #A5A8B2
                            }
                        }

                        .name {
                            margin-left: 3px
                            text-overflow ellipsis
                            white-space nowrap
                            width 40px
                            overflow hidden
                        }

                        + .team {
                            margin-top 8px
                        }

                        &:before {
                            content ''
                            display block
                            clear both
                        }

                        & > * {
                            display inline-block
                            vertical-align middle
                            height 20px
                            line-height 20px
                        }

                        > img {
                            height 20px
                            width 20px
                        }
                    }

                    &.active {
                        background-color: #0C9DFC;
                        color: #fff;

                        .date {
                            color: #fff;
                            opacity: 1;
                        }

                        .team {
                            .score .date {
                                color #fff
                                opacity .8
                            }
                        }
                    }

                }
            }

            .arrow {
                width: 22px;
                font-family: 'icon';
                line-height: 80px;
                text-align: center;
                color: #a7a7a7;
                cursor: pointer;
                transition-duration: .3s;
                user-select none

                &.prev {
                    border-right: 1px solid #E7EDF1;
                    &:before {
                        transform: rotate(-180deg) scale(.8);
                    }
                }

                &.next {
                    border-left: 1px solid #E7EDF1;
                }

                &:before {
                    content: '\e600';
                    font-size: 12px;
                    display: block;
                    transform: scale(.8);
                }

                &:hover {
                    background-color: #f3f3f3;
                    color: #868686;
                }
            }
        }


        > .match-info-wrap {
            background-color #FAFBFD
            position absolute
            left 0
            right 0
            z-index 14
            transition-duration .3s
            visibility hidden
            height 0
            opacity 0
            bottom -1px
            overflow hidden
            box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.08);

            .scrollbar {
                height 480px
            }

            &.show {
                visibility visible
                height 680px
                bottom -681px
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
                background-color #ff252f
                border-bottom-left-radius 4px

                .icon {
                    width 14px
                    height 14px
                    margin 10px
                }

                &:hover {
                    opacity 1
                    color #fff
                }
            }

            .team-wrap {
                position relative
                height 140px

                .vs {
                    width 40px
                    height 48px
                    line-height 48px
                    top 49px
                    left 50%
                    margin-left -20px
                    position absolute
                    font-family TradeGothicLT
                    font-weight bold
                    font-size 30px
                }

                .team {
                    position absolute
                    top 40px

                    img {
                        width 74px
                        height 74px
                        display block
                    }

                    &.team-left {
                        left 70px
                        .info {
                            margin-left 23px
                        }
                    }

                    &.team-right {
                        right 70px
                        .info {
                            margin-right 23px
                        }
                    }

                    .info {
                        .short-name {
                            height 37px
                            line-height 37px
                            font-family TradeGothicLT
                            font-weight bold
                            font-size 20px
                            margin-top 19px
                        }
                    }
                }
            }

            .history-match-list {
                border: 1px solid #E7EDF1
                box-shadow: 0 1px 3px 1px rgba(0,0,0,0.03)
                width calc(100% - 50px)
                margin 0 auto
                height 510px
                overflow hidden

                .head {
                    height 30px
                    line-height 30px
                    padding 0 17px
                    font-size 14px
                    border-bottom 1px solid #E7EDF1
                }

                .list {
                    .list-item {
                        height 50px
                        line-height 50px
                        padding 0 17px
                        font-family TradeGothicLT
                        font-weight bold
                        font-size 14px
                        clear both
                        border-bottom 1px solid #E7EDF1

                        .match-data {
                            float left
                            span + span {
                                margin-left 20px
                            }
                        }
                        .match-vs {
                            float right
                            span,img {
                                display inline-block
                                vertical-align middle
                                margin 0 13px
                            }

                            img {
                                width 30px
                                height 30px
                            }

                            .score {
                                width 60px
                                text-align center
                            }

                            .team-name {
                                width 80px

                                &.team-a {
                                    text-align right
                                }

                                &.team-b {
                                    text-align left
                                }
                            }
                        }
                    }
                }
            }
        }

    }
</style>
