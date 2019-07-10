<template>
    <div id="room-solo" :class="{'fixed-nav': $store.state.scrollTop >= 120}">
        <div class="container">
            <div class="col" :class="'s-' + typeIndex" v-for="(typeItem,typeIndex) in data" :key="typeIndex" v-loading="typeItem.loading">
                <div class="head">
                    <div class="fl">
                        <span>奖励</span>
                        <lfl-icon icon="fruit-normal"></lfl-icon>
                        <span class="number">{{typeItem.rule.fruit}}</span>
                    </div>
                    <div class="fr">
                        <span>花费</span>
                        <lfl-icon icon="ticket"></lfl-icon>
                        <span class="number">{{typeItem.rule.ticket}}</span>
                    </div>
                </div>
                <lfl-null v-if="!typeItem.list.length" width="240" text="暂无房间"></lfl-null>
                <div class="room" v-else v-for="(room,roomIndex) in typeItem.list" :key="roomIndex">
                    <div class="match-ing">
                        <lfl-icon icon="user"></lfl-icon>
                        <span class="number">{{room.at_times}}</span>
                        <span>人正在匹配</span>
                    </div>
                    <div class="tournament-name" v-if="room.room_matches">{{room.room_matches[0].tournament_name}}</div>
                    <div class="match-list">
                        <div class="list-item" v-for="(match,matchIndex) in room.room_matches" :key="matchIndex">
                            <span class="date fl">{{match.start_time_string}}</span>
                            <div class="fr">
                            <span class="team l">
                                <span class="name">{{match.team_a_short_name}}</span>
                                <img :src="match.team_a_image_thumb" />
                            </span>
                                <span class="vs">VS</span>
                                <span class="team r">
                                     <img :src="match.team_b_image_thumb" />
                                <span class="name">{{match.team_b_short_name}}</span>
                            </span>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                    <el-button class="join-button" @click="toRoom(room.roomID)">进入房间挑选阵容</el-button>
                </div>
                <div class="clearfix"></div>
            </div>
            <div class="clearfix"></div>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                data: {
                    0: {
                        list: [{at_times: '-'}],
                        loading: false,
                        rule: {
                            ticket: '-',
                            fruit: '-'
                        }
                    },
                    1: {
                        list: [{at_times: '-'}],
                        loading: false,
                        rule: {
                            ticket: '-',
                            fruit: '-'
                        }
                    },
                    2: {
                        list: [{at_times: '-'}],
                        loading: false,
                        rule: {
                            ticket: '-',
                            fruit: '-'
                        }
                    }
                }
            }
        },
        mounted () {
            this.requestList(0)
            this.requestList(1)
            this.requestList(2)
        },
        methods: {
            requestList (type) {
                this.data[type].loading = true
                this.api('/services/fantasy/room_8_list.php', {type: type}).then(req => {
                    this.data[type].list = req.data.list
                    this.data[type].rule.ticket = req.data.rule[type].ticket
                    this.data[type].rule.fruit = req.data.rule[type].guozi
                    this.data[type].loading = false
                })
            },
            toRoom (roomID) {
                if(!this.$store.state.member.info){
                    this.$root.hub.$emit('showLogin')
                    return
                }
                this.$router.push('/room/' + roomID)
            }
        }
    }
</script>

<style lang="stylus">
    #room-solo {
        margin-top 40px

        &.fixed-nav {
            padding-top 70px
            .col .head {
                position fixed
                top 0
                width 376px
                z-index 20
                border-radius 0
            }
        }

        .col {
            width 376px
            float left
            min-height 70px

            #null {
                background-color #fff
            }

            .head {
                height 70px
                line-height 70px
                border-radius 2px 2px 0 0
                padding 0 50px
                color #fff

                > div {
                    span,.icon {
                        display inline-block
                        vertical-align middle
                        font-size 14px
                    }

                    &.fr {
                        text-align right
                    }

                    .icon {
                        width 24px
                        height 24px
                        margin 0 2px 0 10px
                    }


                    .number {
                        font-weight bold
                        font-size 20px
                    }
                }
            }

            .room {
                margin-bottom 15px
                background-color #fff
                padding-bottom 20px
                box-shadow: 0 1px 4px 0 rgba(5,17,25,0.06);
                border-radius 2px
                transition-duration .3s
                min-height 100px

                &:hover {
                    box-shadow: 0 1px 10px 2px rgba(5,17,25,0.1)
                }

                .match-ing {
                    clear both
                    height 32px
                    line-height 32px
                    padding-top 15px
                    box-sizing content-box
                    text-align center
                    font-size 14px
                    margin-bottom 10px

                    .icon {
                        height 20px
                        width 20px
                        margin-right 8px
                    }

                    .icon, span {
                        display inline-block
                        vertical-align middle
                    }

                    .number {
                        font-family: TradeGothicLT
                        font-weight bold
                        font-size: 26px
                        margin-right 10px
                    }

                    span {

                    }
                }

                .tournament-name {
                    margin 0 20px
                    text-align center
                    font-size 14px
                    color #8c9196
                    line-height 40px
                    height 40px
                    font-family: TradeGothicLT
                    font-weight bold
                    border-bottom 1px dashed #e3eaf0
                }

                .match-list {
                    padding 0 20px 20px
                    .list-item {
                        padding 5px 0
                        border-bottom 1px dashed #e3eaf0
                        text-align right
                        font-family: TradeGothicLT
                        font-weight bold
                        font-size: 14px

                        .date {
                            color #858585
                            padding-left 5px
                        }

                        .vs {
                            width 20px
                            color #b1b1b1
                            margin 0 5px
                        }


                        .fr {
                            width 240px
                            text-align center
                        }

                        .team {
                            width 100px
                            .name {
                                display inline-block
                            }

                            &.l {
                                text-align right
                            }

                            &.r {
                                text-align left
                            }
                        }

                        span,img {
                            height 40px
                            line-height 40px
                            display inline-block
                            vertical-align middle
                        }

                        img {
                            width 32px
                            height 32px
                            margin 0 5px
                        }
                    }
                }

                .join-button {
                    height 36px
                    line-height 34px
                    color #fff
                    border-radius: 4px;
                    margin 0 auto
                    display block
                    font-weight bold
                    box-sizing content-box
                }
            }

            &.s-0 {
                .head {
                    background-image: linear-gradient(-53deg, #1CCCFE 0%, #1CCCFE 0%, #0C9DFC 100%);
                    box-shadow: 0 3px 6px 0 rgba(17,173,252,0.30);
                }

                .join-button {
                    background: #0C9DFC
                    border: 1px solid #0497F8
                    box-shadow: 0 2px 4px 0 rgba(12,157,252,0.40);
                }

                .match-ing {
                    .number,.icon {
                        color #0497F8
                    }
                }
            }

            &.s-1 {
                margin 0 36px
                .head {
                    background-image: linear-gradient(135deg, #5F66C9 0%, #A46DD7 100%);
                    box-shadow: 0 3px 6px 0 rgba(118,104,206,0.30);
                }

                .join-button {
                    background: #5F66C9;
                    border: 1px solid #575EC4;
                    box-shadow: 0 2px 4px 0 rgba(95,102,201,0.40);
                }

                .match-ing {
                    .number,.icon {
                        color #5F66C9
                    }
                }
            }

            &.s-2 {
                .head {
                    background-image: linear-gradient(-45deg, #F56851 0%, #D01934 100%);
                    box-shadow: 0 3px 7px 0 rgba(255,0,0,0.30);
                }

                .join-button {
                    background: #DD4848;
                    border: 1px solid #DB4343;
                    box-shadow: 0 2px 4px 0 rgba(221,72,72,0.40);
                }

                .match-ing {
                    .number,.icon {
                        color #DD4848
                    }
                }
            }
        }
    }
</style>
