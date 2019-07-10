<template>
    <div id="room-custom">
        <div class="wrap container">
            <div class="step">
                <div class="step item" :class="{'active': stepIndex == 0}" @click="stepChange(0)"><span class="step">STEP 1</span><span>选择比赛组合</span></div>
                <div class="step item" :class="{'active': stepIndex == 1}" @click="stepChange(1)"><span class="step">STEP 2</span><span>设置房间参数</span></div>
                <div class="clearfix"></div>
            </div>
            <div class="box" v-show="stepIndex == 0">
                <div class="title">请为您的房间选择一组比赛</div>
                <div class="match-group-list">
                    <div class="match-group" v-for="(group,index) in group.list" :class="{'selected': customRoomData.group_id === group.group_id}" @click="selectGroup(index)">
                        <div class="title"><lfl-icon icon="selected"></lfl-icon><span>{{group.group_name}}</span></div>
                        <div class="list">
                            <div class="match-item" v-for="(match,matchIndex) in group.matches" :key="matchIndex">
                                <div class="team">
                                    <img :src="match.team_a_image_thumb" />
                                    <div class="team-name">{{match.team_a_short_name}}</div>
                                </div>
                                <div class="datetime">
                                    <div class="date">{{match.start_time | datetime('MM-DD')}}</div>
                                    <div class="time">{{match.start_time | datetime('HH:mm')}}</div>
                                </div>
                                <div class="team">
                                    <img :src="match.team_b_image_thumb" />
                                    <div class="team-name">{{match.team_b_short_name}}</div>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </div>
                <div class="actions">
                    <el-button type="primary" @click="stepChange(1)">下一步：设置房间参数</el-button>
                </div>
            </div>
            <div class="box" v-show="stepIndex == 1">
                <div class="form">
                    <div class="form-line">
                        <label>房间名称：</label>
                        <input placeholder="请输入房间名称（10字以内）" v-model="customRoomData.name" maxlength="10"><span class="require">必填</span>
                    </div>
                    <div class="form-line">
                        <label>房间描述：</label>
                        <input placeholder="请输入房间描述（15字以内）" v-model="customRoomData.room_desc" maxlength="15">
                    </div>
                    <div class="form-line">
                        <label>入场费：</label>
                        <el-select v-model="options.select_group_ticket" placeholder="门票 1 - 10 张可选" @change="requestOptions">
                            <el-option v-for="(item,index) in options.group_ticket" :key="index" :label="item" :value="item"></el-option>
                        </el-select>
                    </div>
                    <div class="form-line">
                        <label>参与人数：</label>
                        <el-select v-model="options.select_group_member_num" placeholder="人数 2 - 24 人可选" @change="requestOptions">
                            <el-option v-for="(item,index) in options.group_member_num" :key="index" :label="item" :value="item"></el-option>
                        </el-select>
                        <span class="tip">提示：创建8人房间需要1钥匙，参与人数每增长4人，所需钥匙数量加1</span>
                    </div>
                    <div class="form-line">
                        <label>消耗钥匙：</label>
                        <div class="text">
                            <span class="num">{{options.key}}</span><lfl-icon icon="key" class="key"></lfl-icon><span class="my-key">（我的钥匙：{{member.bank.fantasy_key}}<lfl-icon icon="key" class="key"></lfl-icon>）</span>
                        </div>
                    </div>
                    <div class="form-line">
                        <label>总奖金：</label>
                        <div class="text"><span class="num">{{options.reward_guozi}}</span><lfl-icon icon="fruit" class="fruit"></lfl-icon></div>
                    </div>
                    <div class="form-line rule">
                        <label>分配方式：</label>
                        <el-select v-model="options.select_assign_plan" placeholder="分配方式3种" @change="requestOptions">
                            <el-option v-for="(item,index) in options.assign_plan" :key="index" :label="item.value" :value="item.name"></el-option>
                        </el-select>
                    </div>
                    <div class="form-line rule-list">
                        <label></label>
                        <div class="text">
                            <div class="rule-list">
                                <div class="rule-item" v-for="(item,index) in options.assign_plan_rule" :key="index">
                                    <span class="name fl">{{item.name}}</span>
                                    <span class="value fr"><span class="num">{{item.value}}</span><lfl-icon icon="fruit" class="fruit"></lfl-icon></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <el-button type="default" @click="stepChange(0)">上一步</el-button>
                    <el-button type="primary" @click="chooseLineup">完成设置：挑选您的阵容</el-button>
                </div>

                <el-dialog title="提示" class="room-custom buy-key" top="30%" :visible.sync="dialog.buyKey.show" :close-on-click-modal="!dialog.buyKey.loading" :show-close="!dialog.buyKey.loading">
                    <p class="text"><lfl-icon icon="key" class="key"></lfl-icon><span>钥匙不足</span></p>
                    <div class="actions">
                        <el-button type="primary" class="cancel" @click="dialog.buyKey.show = false" :disabled="dialog.buyKey.loading">暂不购买</el-button>
                        <el-button type="primary" class="buy" @click="buyKey()" :disabled="dialog.buyKey.loading"><span>用</span><span class="num">{{keyNum * 2}}</span><lfl-icon icon="diamond"></lfl-icon><span>购买</span><span class="num">{{keyNum}}</span><lfl-icon icon="key"></lfl-icon></el-button>
                    </div>
                </el-dialog>

                <el-dialog title="钻石不足" class="room-custom buy-diamond" top="30%" :visible.sync="dialog.diamond.show">
                    <p class="text"><lfl-icon icon="diamond" class="diamond"></lfl-icon><span>您的钻石不足</span></p>
                    <div class="actions">
                        <el-button type="primary" @click="dialog.diamond.show = false;$router.push('/recharge/diamond')">购买钻石</el-button>
                        <el-button type="primary" @click="dialog.diamond.show = false">稍后再说</el-button>
                    </div>
                </el-dialog>

            </div>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                options: {
                    assign_plan: [],
                    assign_plan_rule: [],
                    group_member_num: [],
                    group_ticket: [],
                    key: '',
                    reward_guozi: '',
                    select_group_ticket: '',
                    select_group_member_num: '',
                    select_assign_plan: ''
                },
                dialog: {
                    buyKey: {
                        loading: false,
                        show: false
                    },
                    diamond: {
                        show: false
                    }
                },
                stepIndex: 0,
                customRoomData: {
                    group_id: '',
                    name: '',
                    room_desc: '',
                    group_ticket: '',
                    group_member_num: '',
                    assign_plan: ''
                },
                keyList: [],
                group: {
                    selectIndex: -1,
                    list: [],
                    params: {
                        start_id: '',
                        limit: 20
                    },
                    loading: false
                },
                optionsLoading: false
            }
        },
        watch: {
            options: {
                handler (data) {
                    this.customRoomData.group_ticket = data.select_group_ticket
                    this.customRoomData.group_member_num = data.select_group_member_num
                    this.customRoomData.assign_plan = data.select_assign_plan
                },
                deep: true
            }
        },
        mounted () {
            this.requestList()
//            this.requestKeyList()
            this.requestOptions()
        },
        computed: {
            member () {
                return this.$store.state.member
            },
            checkForm (){
                return this.options.select_group_ticket && this.options.select_group_member_num && this.options.select_assign_plan && this.customRoomData.name.length
            },
            keyNum () {
                return parseInt(this.options.key) - parseInt(this.member.bank.fantasy_key)
            },
            prizeRuleList () {
                let list = []
                for (let i in this.options.assign_plan_rule) {
                    let rule = this.options.assign_plan_rule[i]
                    rule.prize_type = 1
                    list.push(rule)
                }
                return list
            },
            selectedGroup () {
                return this.group.selectIndex != -1 ? this.group.list[this.group.selectIndex] : null
            }
        },
        methods: {
            selectGroup (index) {
                this.customRoomData.group_id = this.group.list[index].group_id
                this.group.selectIndex = index
            },
            stepChange (stepIndex) {
                if (stepIndex == 1) {
                    if (!this.customRoomData.group_id) {
                        this.$message.warning('请先选择一个组合')
                        return
                    }
                } else {
//                    this.requestList()
                }
                this.stepIndex = stepIndex
            },
            requestList () {
                this.group.loading = true
                this.api('/services/fantasy/group_list.php', this.group.params).then(req => {
                    this.group.list = req.data.list
                    this.group.loading = false
                })
            },
            requestKeyList () {
                this.api('/services/fantasy/key_list.php').then(req => {
                    if (req.code == 200) {
                        this.keyList = req.data.list
                        this.$root.hub.$emit('updateBank')
                    }
                })
            },
            buyKey () {
                this.dialog.buyKey.loading = true
                this.api('/services/fantasy/key_exchange.php', {sku_id: 999, number: this.keyNum}, _ => {}).then(req => {
                    if (req.code == 200) {
                        this.$root.hub.$emit('updateBank')
                        this.$message.success('购买成功')
                    } else if (req.code == 40405) {
                        this.dialog.diamond.show = true
                    } else {
                        this.$message.error('购买失败')
                    }
                    this.dialog.buyKey.loading = false
                    this.dialog.buyKey.show = false
                })
            },
            requestOptions () {
                this.api('/services/fantasy/set_room_param.php', {platform: 'web'}, {
                    group_ticket: this.options.select_group_ticket,
                    group_member_num: this.options.select_group_member_num,
                    assign_plan: this.options.select_assign_plan
                }).then(req => {
                    if (req.code == 200) {
                        this.options = req.data
                    }
                })
            },
            chooseLineup () {
                if (!this.customRoomData.name.length) {
                    this.$message.warning('请填写房间名称')
                    return
                }
                if (parseInt(this.options.key) > parseInt(this.member.bank.fantasy_key)) {
                    this.dialog.buyKey.show = true
                    return
                }
                let user =  this.member.info
                user.num = 0
                let data = {
                    data: this.customRoomData,
                    room: {
                        name: this.customRoomData.name,
                        room_desc: this.customRoomData.room_desc,
                        prizeRuleList: this.prizeRuleList,
                        is_must_open: 0,
                        users: {
                            list: [user]
                        },
                        member_at_times: 0,
                        times: 1,
                        at_times: 0,
                        num: this.options.select_group_member_num,
                        price: this.customRoomData.group_ticket,
                        prize_type: 1,
                        prize_amount: this.options.reward_guozi,
                        salary_cap: this.selectedGroup.salary_cap,
                        room_matches: this.selectedGroup.matches,
                        status: 0,
                        at_end_time: this.selectedGroup.at_end_time,
                        key: this.options.key
                    }
                }
                this.store.setItem('room-custom', data).then(req => {
                    this.$router.push('/room/custom/choose')
                })
            }
        }
    }
</script>

<style lang="stylus" scoped>
    #room-custom {

        .icon {
            margin-left 5px
            &.key {
                color #DABE9B
                width 14px
                height 14px
            }
            &.fruit {
                width 15px
                height 15px
            }
            &.diamond {
                color #4BDCBA
            }
        }

        .wrap {
            margin-top 40px
            padding 40px 50px
            background #FFFFFF
            border 1px solid #E7EDF1
            box-shadow 0 1px 4px 0 rgba(5,17,25,0.06)
            border-radius 2px

            .step {
                height 40px
                line-height 40px
                background-size cover
                position relative
                font-size 16px

                span.step {
                    font-weight bold
                    margin-right 15px
                }

                &.item {
                    user-select none
                    width 50%
                    text-align center
                    float left
                    cursor pointer

                    &:not(.active) {
                        background-color #F3F5F7
                    }

                    &:before,&:after {
                        content ''
                        display block
                        position absolute
                        top 0
                        bottom 0
                    }

                    &:after {
                        right 0
                        border-top 20px solid transparent
                        border-bottom 20px solid transparent
                        border-left 10px solid #F3F5F7
                    }

                    &:nth-child(1) {
                        &:before {
                            border-top 20px solid transparent
                            border-bottom 20px solid transparent
                            border-left 10px solid #fff
                        }
                        &:after {
                            border-top 20px solid #F3F5F7
                            border-bottom 20px solid #F3F5F7
                        }
                    }

                    &:nth-child(2) {
                        &:before {
                            border-top 20px solid transparent
                            border-bottom 20px solid transparent
                            border-left 10px solid #F3F5F7
                        }
                        &:after {
                            border-top 20px solid #fff
                            border-bottom 20px solid #fff
                        }
                        &.active {
                            &:before {
                                border-left 10px solid #F3F5F7
                            }
                            &:after {
                                border-top 20px solid #fff
                                border-bottom 20px solid #fff
                            }
                        }
                    }

                    &.active {
                        color #fff
                        background-image linear-gradient(53deg, #0C9DFC 0%, #1CCCFE 100%)

                        &:before {
                            border-top 20px solid #0C9DFC
                            border-bottom 20px solid #0C9DFC
                            border-left 10px solid #fff
                        }

                        &:after {
                            border-top 20px solid #F3F5F7
                            border-bottom 20px solid #F3F5F7
                            border-left 10px solid #1CCCFE
                        }
                    }
                }
            }

            .box {
                padding 0 10px

                > .title {
                    font-size 14px
                    height 20px
                    line-height 20px
                    margin-top 30px
                    margin-bottom 15px
                }

                .match-group-list {

                    .match-group {
                        background-color #fff
                        cursor pointer
                        display inline-block
                        border-radius 2px
                        font-size 14px
                        box-shadow 0 2px 4px 0 rgba(5,17,25,0.06)
                        float left
                        clear both
                        box-sizing border-box
                        position relative
                        transition-duration .3s

                        + .match-group {
                            margin-top 30px
                        }

                        &:after {
                            content ''
                            display block
                            position absolute
                            left 0
                            right 0
                            bottom 0
                            top 0
                            z-index 1
                            border 1px solid #E7EDF1
                        }

                        &:before {
                            content ''
                            display block
                            position absolute
                            left -1px
                            right -1px
                            bottom -1px
                            top -1px
                            border 2px solid transparent
                            border-radius 2px
                            transition-duration .3s
                            z-index 2
                        }

                        &:hover{
                            box-shadow 0 2px 8px 3px rgba(5,17,25,0.06)

                            &.selected {
                                background #F9FBFD
                                border-radius 2px
                            }
                            &:before {
                                border 2px solid #0C9DFC
                            }
                        }

                        &.selected {
                            > .title .icon {
                                color #0C9DFC
                            }
                            &:before {
                                border 2px solid #0C9DFC
                            }
                        }

                        > .title {
                            height 40px
                            line-height 40px
                            padding 0 15px
                            font-size 14px
                            border-bottom 1px solid #E7EDF1

                            .icon,span {
                                display inline-block
                                vertical-align middle
                            }

                            .icon {
                                width 13px
                                height 13px
                                margin-right 8px
                                color rgba(165, 168, 178, 0.5)
                                transition-duration .3s
                            }
                        }

                        .list {
                            .match-item {
                                font-family TradeGothicLT-Bold
                                width 269px
                                height 100px
                                float left
                                padding 12px 0 15px
                                text-align center
                                border-bottom 1px solid #E7EDF1
                                border-right 1px solid #E7EDF1

                                &:hover {
                                    background-color #ccc
                                }

                                &:nth-child(4n + 0) {
                                    border-right none
                                }

                                > * {
                                    display inline-block
                                    vertical-align middle
                                }

                                .team {
                                    img {
                                        width 52px
                                        height 52px
                                    }

                                    .team-name {

                                    }

                                }

                                .datetime {
                                    font-family TradeGothicLT
                                    font-weight bold
                                    margin 0 25px
                                    color #A5A8B2

                                    .time {
                                        margin-top 3px
                                    }
                                }
                            }
                        }
                    }
                }

                .form {
                    padding-left 18px
                    margin-top 70px

                    .form-line {
                        height 40px
                        line-height 40px
                        margin-bottom 20px

                        &.rule-list {
                            height inherit
                        }

                        &.rule {
                            margin-bottom 0
                        }

                        .text {
                            display inline-block
                            font-size 14px

                            .num {
                                font-family TradeGothicLT-Bold
                                font-size 16px
                            }

                            .my-key {
                                margin-left 20px
                            }

                            span,.icon {
                                display inline-block
                                vertical-align middle
                            }
                        }

                        .el-select {
                            width 180px
                        }

                        .rule-list {
                            margin-top 5px
                            .rule-item {
                                width 180px
                                height 40px
                                line-height 40px
                                padding 0 5px
                                clear both

                                spam,.icon {
                                    display inline-block
                                    vertical-align middle
                                }

                                + .rule-item {
                                    border-top 1px dashed #D0D9E1
                                }
                            }
                        }

                        .el-input__inner {
                            padding 0 20px
                            height 40px
                        }

                        label {
                            display inline-block
                            width 70px
                            margin-right 10px
                            font-size 14px
                            text-align right
                        }

                        span.require {
                            color #FA9B3C
                            font-size 12px
                            margin-left 15px
                        }

                        span.tip {
                            font-size 14px
                            color #A5A8B2
                            margin-left 20px
                        }

                        input {
                            padding 0 20px
                            width 500px
                            background #FAFBFD
                            border 1px solid #DDE4E9
                            border-radius 4px
                            height 40px
                            font-size 14px
                            transition-duration .3s

                            &:focus {
                                background-color #fff
                            }

                            &::-moz-placeholder {color: #A5A8B2;opacity .5;}
                            &:-ms-input-placeholder {color: #A5A8B2;opacity .5;}
                            &::-webkit-input-placeholder {color: #A5A8B2;opacity .5;}
                        }
                    }
                }

                > .actions {
                    margin-top 50px
                    text-align center
                }
            }
        }
    }
</style>
