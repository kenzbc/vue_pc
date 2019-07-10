<template>
    <div class="room-list-wrap" :class="'room-list-type-' + data.type">
        <div class="room-list-header fix-bold-font" v-show="data.list.length">
            <div class="col game">竞赛类别</div>
            <div class="col info">房间名称</div>
            <div class="col">{{status != 2 ? '参与人数' : '最终排名'}}</div>
            <div class="col">中奖范围</div>
            <div class="col">{{status == 0 ? '可' : '已'}}参与次数</div>
            <div class="col">奖金总额</div>
            <div class="col">{{status == 0 ? '截止时间' : status == 1 ? '当前排名' : '获得奖励'}}</div>
            <div class="col">{{options[data.type].label}}</div>
        </div>
        <div class="room-list" v-show="data.list.length">
            <div class="list-item" v-for="(item,index) in data.list" :key="index" @click="toRoom(item)">
                <div class="col game">
                    <img src="/static/image/lol.png">
                    <span class="fix-bold-font">英雄联盟</span>
                </div>
                <div class="col info">
                    <div class="name fix-bold-font"><span class="text" :title="item.name">{{item.name}}</span><span class="tag" :class="{'must': item.is_must_open == 1}">{{item.is_must_open == 1 ? '必开' : '非必开'}}</span></div>
                    <div class="desc">{{item.room_desc}}</div>
                </div>
                <div class="col" :class="[{'people': status != 2},{'final-rank': status == 2}]">
                    <div class="number"><span v-if="status != 2">{{item.at_times}} / {{item.num}}</span><span v-else><span class="rank" :class="{'win': item.order_prize_amount > 0}">{{item.rank}}</span> / {{item.at_times}}</span></div>
                    <div class="process" v-if="status != 2"><div :style="{width: parseInt(item.at_times)/parseInt(item.num) * 100 + '%'}"></div></div>
                    <div class="desc" v-if="item.is_must_open == 0 && status != 2">满{{item.num}}人开</div>
                </div>
                <div class="col fix-bold-font">{{item.prize_num}}</div>
                <div class="col join" :class="{'disabled': status != 0 || item.member_at_times == item.times}">
                    <div class="action-box" @click.stop="toRoom(item)">
                        <div class="number"><span>{{item.member_at_times}}</span> / {{item.times}}</div>
                        <div class="plus"></div>
                    </div>
                </div>
                <div class="col total">
                    <span>{{item.prize_amount}}</span>
                    <lfl-icon v-if="item.prize_type == 1" icon="fruit" class="fruit"></lfl-icon>
                    <lfl-icon v-if="item.prize_type == 2" icon="ticket" class="ticket"></lfl-icon>
                </div>
                <div class="col datetime" :class="options.extClass[status]">
                    <div class="date" v-if="status == 0">{{item.at_end_time,'YYYY-MM-DD' | datetime}}</div>
                    <div class="time" v-if="status == 0">{{item.at_end_time,'HH:mm' | datetime}}</div>
                    <div v-if="status == 1"><span>{{item.rank}}</span> / {{item.at_times}}</div>
                    <div v-if="status == 2 && item.prize_type == 1" :class="{'fail': !item.order_prize_amount}" :data-val="item.order_prize_amount" class="fruit"><lfl-icon icon="fruit"></lfl-icon></div>
                    <div v-if="status == 2 && item.prize_type == 2" :class="{'fail': !item.order_prize_amount}" :data-val="item.order_prize_amount" class="ticket"><lfl-icon icon="ticket"></lfl-icon></div>
                    <div v-if="status == 2 && item.prize_type == 3" :class="{'fail': !item.order_prize_amount}" class="other fix-bold-font">{{item.prize_amount}}</div>
                </div>
                <div class="col action" :class="[data.type, {'disabled': data.type == 'room' && status != 0 || item.member_at_times == item.times}]" @click.stop="toRoom(item)">
                    <a href="javascript:;">
                        <lfl-icon v-if="data.type =='room'" icon="ticket" class="icon-ticket"></lfl-icon>
                        <span>{{data.type == 'room' ? item.price : options[data.type].text}}</span>
                        <lfl-icon v-if="data.type =='room'" icon="arrow" class="icon-arrow"></lfl-icon>
                    </a>
                </div>
                <div class="type-flag" :class="'type-' + item.type">{{options.types[item.type]}}</div>
            </div>
            <div class="load-more" :class="{'not': !isMore}" @click="isMore ? $emit('loadingMore') : null">
                <div v-if="isMore"><span>LOAD</span><span class="load"><lfl-icon icon="add"></lfl-icon></span><span>MORE</span></div>
                <div v-else>沒有更多数据</div>
            </div>
        </div>
        <lfl-null text="暂无比赛房间"  v-show="data.list.length == 0"></lfl-null>
    </div>
</template>

<script>
	export default {
		props: {
			data: {
				type: Object,
				default: function () {
					return {
						pageTotal: 0,
						count: 0,
						list: [],
						params: {
							limit: 10,
							page: 0
						},
						type: 'room'
					}
				}
			},
			status: {
				type: String,
				default: ''
			},
			path: {
				type: String,
				default: '/room/'
			},
			field: {
				type: String,
				default: ''
			}
		},
		computed: {
			member () {
				return this.$store.state.member
			},
			isMore () {
				return this.data.count == this.data.params.limit
			}
		},
		data () {
			return {
				options: {
					types: {
						1: '新手',
						2: '活动',
						3: '日赛',
						4: '周赛',
						5: 'SOLO',
						6: '名人',
						7: '毒奶',
						8: 'SOLO',
						9: '自定义',
					},
					extClass: {
						0: 'datetime',
						1: 'rank',
						2: 'reward'
					},
					room: {
						label: '入场费'
					},
					order : {
						label: '详情',
						text: '查看详情'
					}
				},
				random: Math.random() * 10
			}
		},
		methods: {
			joinHandle (item) {
				if (!this.member.info) {
					this.$root.hub.$emit('showLogin')
					return
				}

				if (item.status == 0) {
					if (parseInt(item.member_at_times) >= parseInt(item.times)) {
						this.$message.error('超过该房间参与上限')
						return
					}
				} else {
					this.$message.error(item.status == 1 ? '房间进行中，无法参与' : '房间已结束，无法参与')
					return
				}

				this.$router.push('/room/' + item.roomID)
			},
			toRoom (item) {
				if (item.member_at_times == item.times) {
					this.$router.push('/my/room/' + item.roomID)
				} else {
					let url = this.path + item.roomID
					this.$router.push(url)
				}
			},
			format () {

			}
		}
	}
</script>

<style lang="stylus">
    .room-wrap {
        .room-list-wrap {
            margin-top 15px
        }
        .room-list-header,
        .room-list {
            .list-item {
                padding 0 30px
                margin-top 15px
            }

            .load-more {
                margin-top 15px
                height 60px
                line-height 60px
                text-align center
                border-radius 2px
                font-family TradeGothicLT-Bold
                font-size 14px
                color rgba(153, 153, 153, 0.5)

                &:not(.not) {
                    background-color #fff
                    border 1px solid #E7EDF1
                    box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
                    cursor pointer
                    user-select none
                }

                div {
                    > span {
                        display inline-block
                        vertical-align middle
                    }
                }

                &:hover {
                    .load {
                        &:before {
                            animation: scale 2s infinite
                        }
                    }
                }

                @keyframes scale {
                    0% {
                        transform scale(1)
                        background-color rgba(12, 157, 252, 0.2)
                    }
                    50% {
                        transform scale(1.15)
                        background-color rgba(12, 157, 252, 0.3)
                    }
                    100% {
                        transform scale(1)
                        background-color rgba(12, 157, 252, 0.2)
                    }
                }


                .load {
                    width 32px
                    height 32px
                    position relative
                    margin 0 16px
                    display inline-block

                    .icon {
                        width 20px
                        height 20px
                        color #0c9dfc
                        left 6px
                        top 6px
                        position absolute
                        z-index 1
                    }

                    &:before {
                        content ''
                        width 32px
                        height 32px
                        position absolute
                        left 0
                        top 0
                        background-color rgba(12, 157, 252, 0.2)
                        border-radius 50%
                        z-index 0
                    }
                }

            }
        }

        .room-list-header {
            background #FFFFFF
            border 1px solid #E7EDF1
            box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
            border-radius 2px
            padding 0 25px 0 30px
            height 50px
            line-height 50px

            .col {
                float left
                text-align center
                font-size 14px
                font-weight bold

                colWidths = 140 320 150 100 100 110 130 90
                for colWidth, col in colWidths {
                    &:nth-of-type({col + 1}) {
                        width colWidth px
                    }
                }

                &.info, &.game {
                    text-align left
                }
            }
        }

        .room-list {
            margin-top 15px

            .list-item {
                user-select none
                cursor pointer
                height 100px
                background #FFFFFF
                border 1px solid #E7EDF1
                box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
                border-radius 2px
                position relative
                padding 30px 25px 30px 30px
                transition-duration .3s
                transform scale(1)

                &:hover {
                    box-shadow 0 0 10px 3px rgba(5, 17, 25, 0.05)
                }

                .type-flag {
                    padding 0 6px
                    height 18px
                    text-align center
                    border-radius 0 0 8px 0
                    font-size 12px
                    color #fff
                    left 0
                    top 0
                    position absolute

                    roomTypeColors = #29a7ff #ffbb2a #00cfd7 #ff1a65 #373a41 #fe892c #b00000 #373a41 #009902
                    for color, i in roomTypeColors {
                        &.{'type-' + (i + 1)} {
                            background-color color
                        }
                    }

                    &.type-5 {
                        font-family TradeGothicLT-Bold
                    }

                }

                .col {
                    height 40px
                    line-height 40px
                    text-align center
                    font-size 14px
                    float left

                    colWidths = 140 320 150 100 100 110 130 90
                    for colWidth, col in colWidths {
                        &:nth-of-type({col + 1}) {
                            width colWidth px
                        }
                    }

                    &.game {
                        text-align left

                        img {
                            width auto
                            height 32px
                            display inline-block
                            vertical-align middle
                            margin-right 13px
                        }

                        span {
                            height 20px
                            line-height 20px
                            display inline-block
                        }
                    }

                    &.info {
                        text-align left

                        .name {
                            height 21px
                            line-height 21px

                            .text {
                                font-size 16px
                                display inline-block
                                vertical-align middle
                                max-width 236px
                                overflow hidden
                                text-overflow ellipsis
                                white-space nowrap
                            }

                            .tag {
                                margin-left 7px
                                text-align center
                                display inline-block
                                vertical-align middle
                                background #0C9DFC
                                height 18px
                                line-height 18px
                                padding 0 4px
                                border-radius 2px
                                font-size 12px
                                color #fff

                                &.must {
                                    background #FA9B3C
                                }
                            }
                        }

                        .desc {
                            height 16px
                            line-height 16px
                            overflow hidden
                            text-overflow ellipsis
                            white-space nowrap
                            margin-top 5px
                            font-size 12px
                            color #0C9DFC
                        }
                    }

                    &.final-rank {
                        .number {
                            font-family TradeGothicLT
                            font-weight bold

                            .rank {
                                color #c3c4c6
                                &.win {
                                    color #FA9B3C
                                }
                            }
                        }
                    }

                    &.people {
                        padding 0 25px
                        .number {
                            height 17px
                            line-height 17px
                            font-size 14px
                            font-family TradeGothicLT
                            font-weight bold
                        }

                        .process {
                            height 10px
                            line-height 10px
                            margin-top 6px
                            background #E7EDF1
                            border-radius 8px
                            overflow hidden

                            div {
                                transition-duration .5s
                                transition-delay .3s
                                width 0
                                height 10px
                                background #0C9DFC
                                border-radius 8px
                            }
                        }

                        .desc {
                            font-size 12px
                            color #A5A8B2
                            height 16px
                            line-height 16px
                            font-weight bold
                            margin-top 5px
                        }
                    }

                    &.join {

                        &.disabled .action-box {
                            opacity 0.3
                            border 1px solid #373A41

                            .number {
                                font-weight bold
                                span {
                                    color #373A41
                                }
                            }
                            .plus {
                                background #373A41
                            }
                        }

                        .action-box {
                            user-select none
                            cursor pointer
                            width 48px
                            height 40px
                            margin 0 auto
                            background #fff
                            border 1px solid #0497F8
                            box-shadow 0 2px 4px 0 rgba(12, 157, 252, 0.40)
                            border-radius 2px
                            transition-duration .3s

                            &:not(.disabled):hover {
                                box-shadow 0 0 6px 1px rgba(12, 157, 252, 0.4)
                            }

                            .number {
                                height 19px
                                line-height 19px
                                font-family TradeGothicLT
                                font-weight bold

                                font-size 13px
                                color #19001D
                                span {
                                    color #0C9DFC
                                }
                            }

                            .plus {
                                background #0C9DFC
                                height 19px
                                position relative
                                cursor pointer

                                &:before, &:after {
                                    opacity .75
                                    content ''
                                    position absolute
                                    background-color #fff
                                    display block
                                    z-index 1
                                    transition-duration .3s
                                }

                                &:hover {
                                    &:before, &:after {
                                        opacity .95
                                    }
                                }

                                &:before {
                                    width 8px
                                    height 2px
                                    top 9px
                                    left 20px
                                }

                                &:after {
                                    width 2px
                                    height 8px
                                    top 6px
                                    left 23px
                                }
                            }
                        }
                    }
                    &.total {
                        font-family TradeGothicLT
                        font-weight bold

                        span {
                            display inline-block
                            vertical-align middle
                            margin-right 5px
                        }

                        .ticket {
                            color #0C9DFC
                        }
                    }
                    &.datetime {
                        font-family TradeGothicLT
                        font-weight bold

                        div {
                            height 17px
                            line-height 17px

                            + div {
                                margin-top 2px
                            }
                        }
                    }
                    &.rank {
                        font-family TradeGothicLT
                        font-weight bold
                        span {
                            color #0C9DFC
                        }
                        div {
                            height 34px
                            line-height 34px
                        }
                    }
                    &.reward {
                        text-align right
                        padding-right 30px

                        div {
                            height 24px
                            line-height 24px
                            display inline-block
                            border-radius 4px
                            position relative
                            margin-top 8px

                            .icon {
                                width 24px
                                height 22px
                                padding 3px 3px
                            }

                            &.ticket {
                                border: 1px solid #0497F8;

                                .icon {
                                    color #0497F8
                                }

                                &:before {
                                    background-color #0C9DFC
                                }
                            }

                            &.fruit {
                                border: 1px solid #FFA646;

                                &:before {
                                    background-color #FFA646
                                }
                            }


                            &.fail {
                                border-color #ccc
                                &:before {
                                    background-color #ccc
                                }
                                filter: grayscale(1)
                                -webkit-filter: grayscale(1)
                            }

                            &:before {
                                display block
                                float left
                                position relative
                                height 22px
                            }

                            &:before {
                                left 0
                                content attr(data-val)
                                padding 0 9px
                                font-family TradeGothicLT
                                font-weight bold
                                color #fff
                            }

                            &.other {
                                font-weight bold
                                height 40px
                                width 50px
                                line-height 20px
                                padding 0 5px

                                &:before {
                                    display none
                                }
                            }
                        }
                    }
                    &.action {
                        a {
                            display inline-block
                            color #fff
                            font-weight bold
                            background-color #0C9DFC
                            border 1px solid #0497F8
                            border-radius 4px
                            width 86px
                            height 36px
                            line-height 36px
                            text-align center
                        }

                        &:not(.disabled) a {
                            box-shadow 0 2px 4px 0 rgba(12, 157, 252, 0.40)
                        }

                        &.order a {
                            background-color #FFFFFF
                            border 1px solid #0497F8
                            border-radius 4px
                            box-shadow none
                            font-size 14px
                            color #0C9DFC
                            transition-duration .3s

                            &:hover {
                                background-color #0497F8
                                color #fff
                            }
                        }

                        &.room {

                            &.disabled {
                                a {
                                    background-color #373a41
                                    opacity .3
                                    border 1px solid #373a41
                                }
                            }

                            a {
                                color #fff
                                font-family TradeGothicLT
                                .icon-ticket {
                                    width 16px
                                    height 16px
                                }
                                .icon-arrow {
                                    width 11px
                                    margin-left 6px
                                }

                            }
                        }
                    }
                }

            }

        }

        .room-list-type-order {
            .room-list .col.info,
            .room-list-header .col.info {
                width 290px
            }
        }
    }
</style>
