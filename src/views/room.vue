<template>
    <div id="room">
        <lfl-room-info :data="room" @timeIsUp="requestRoomInfo" v-loading="loading.roomInfo"></lfl-room-info>
        <div class="main">
            <div class="container">
                <div class="left fl" :class="{'saved': page.savedShow}">
                    <lfl-player-detail type="room" :data="selectedPlayer" @closePlayerDetail="closePlayerDetail" @selectPlayer="selectPlayerPos[selectedPlayer.positionID] = selectedPlayer;selectedPlayer = null" :class="{'show': selectedPlayer}"></lfl-player-detail>
                    <div class="select-box">
                        <div class="title"><span>挑选阵容</span><span class="fr"><span class="return-btn" @click="$router.go(-1)">返回</span></span></div>
                        <lfl-room-match :data="match" v-loading="loading.roomInfo"></lfl-room-match>
                        <div class="pos-nav">
                            <div class="pos-item" v-for="(item,_pos) in pos.obj" :class="[{active: item.positionID == pos.currPos},{'selected': selectPlayer[item.positionID]}]" @click="pos.currPos = item.positionID">
                                <lfl-icon :icon="'pos-' + item.en"></lfl-icon>
                                <span class="pos-name">{{item.name}}</span>
                                <lfl-icon icon="selected" class="select"></lfl-icon>
                            </div>
                        </div>
                        <div class="player-list" ref="player-list">
                            <lfl-null v-if="!posPlayerList.length"></lfl-null>
                            <div class="head" v-if="posPlayerList.length">
                                <div class="col player">选手</div>
                                <div class="col data" @click="sortPlayer('score')"><span>平均表现</span>
                                    <lfl-icon :icon="sort.score == '' ? 'sort' : 'sort-desc'" :class="sort.score"></lfl-icon>
                                </div>
                                <div class="col price" @click="sortPlayer('price')"><span>身价</span>
                                    <lfl-icon :icon="sort.price == '' ? 'sort' : 'sort-desc'" :class="sort.price"></lfl-icon>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <VuePerfectScrollbar class="scrollbar" @ps-scroll-down="playerSelectScrollDown">
                                <div class="list">
                                    <div class="player-item" v-for="(item,index) in posPlayerList" :class="{'gary': selectPlayer[item.positionID] && selectPlayer[item.positionID].id != item.id}">
                                        <div class="avatar" :style="{'background-image': 'url('+ (item.bg1 || '/static/image/bg1.png') +')' }" @click="selectedPlayer = item">
                                            <img :src="(item.player_image || '/static/image/unknow.png')"/>
                                        </div>
                                        <div class="info">
                                            <div class="player-name" @click="selectedPlayer = item">
                                                <span>{{item.nickname}}</span><span class="badge" :class="'status-' + item.player_status">{{item.player_status | playerStatus}}</span>
                                            </div>
                                            <div class="team-name">{{item.team_short_name}}</div>
                                            <div class="vs-team-list">
                                                <div class="vs-team" v-for="(team,index) in item.match_info"
                                                     :key="index" v-if="index < 3">vs {{team.vs_team}}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="avg-score">
                                            <lfl-line-chart class="chart" :avgScore="item.score" :scoreList="item.score_list" :id="item.playerID"></lfl-line-chart>
                                            <div class="score">平均分：{{item.score}}</div>
                                        </div>
                                        <div class="price good" :class="{'red': item.value > number.lavePay && selectPlayer[item.positionID] && selectPlayer[item.positionID].id != item.id}">$<span>{{item.value}}</span></div>
                                        <div class="action">
                                            <div class="dialog" v-if="(!member.info && index == 1) || (member.info && member.info.fantasy_count == 0)" v-show="dialog.selectPlayer">
                                                <a href="javascript:;" class="close" @click="dialog.selectPlayer = false"></a>
                                                <div class="title">创建您的阵容</div>
                                                <div class="text">请选择正确的位置并添加选手</div>
                                            </div>
                                            <div v-if="selectPlayer[item.positionID] && selectPlayer[item.positionID].playerID == item.playerID" class="btn remove" @click.stop="removePosPlayer(item)"></div>
                                            <div class="btn add" @click.stop="selectPlayerPos[item.positionID] = item" v-else></div>
                                        </div>
                                    </div>
                                </div>
                            </VuePerfectScrollbar>
                        </div>
                    </div>
                    <div class="saved-box">
                        <div class="filter">
                            <div class="btn-group">
                                <a href="javascript:;" :class="{'active': saved.type =='match'}" @click="saved.type ='match'">快速匹配</a><a href="javascript:;" :class="{'active': saved.type =='favorite'}" @click="saved.type ='favorite'">已收藏阵容</a>
                            </div>
                            <span class="desc"><lfl-icon icon="mark"></lfl-icon><span>收藏的阵容可以在【个人信息】->【我的阵容】中编辑</span></span>
                            <span class="close" @click="page.savedShow = false"><lfl-icon icon="close-btn"></lfl-icon></span>
                        </div>
                        <div class="group-list">
                            <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                                <div class="group" v-if="(saved.type == 'favorite' && group.available) || saved.type == 'match'" v-for="group in saved.list[saved.type]" :class="{'disabled': saved.type == 'favorite' && !group.available}">
                                    <div class="title" v-if="saved.type == 'favorite'">
                                        <lfl-icon icon="group"></lfl-icon>
                                        {{group.name}}
                                    </div>
                                    <div class="list">
                                        <div class="item" v-for="item in group.player_list">
                                            <div class="avatar" :style="{'background-image': 'url(\'' + item.bg2 + '\')' }">
                                                <span class="score">{{item.score}}</span>
                                                <img :src="(item.player_image || '/static/image/unknow.png')"/>
                                            </div>
                                            <div class="name">{{item.nickname}}</div>
                                            <div class="pos">
                                                <lfl-icon :icon="'pos-' + item.position_short_name.toLowerCase()"></lfl-icon>
                                                <span>{{item.position_short_name.toUpperCase()}} - {{item.team_short_name.toUpperCase()}}</span>
                                            </div>
                                        </div>
                                        <div class="clear"></div>
                                    </div>
                                    <div class="actions">
                                        <div class="fl">
                                            <!--<div><span>参加房间数：</span><span class="blue">2</span></div>-->
                                            <div><span>阵容总分：</span><span class="blue">{{sumGroupScore(group.player_list)}}</span>
                                            </div>
                                        </div>
                                        <div class="fr">
                                            <el-button class="btn favorite" :disabled="compareLineup(group.player_list)" v-if="saved.type == 'match'" @click="favoriteGroup(group.player_list)"><lfl-icon icon="favorite"></lfl-icon><span>{{!compareLineup(group.player_list) ? '收藏' : '已收藏'}}</span></el-button>
                                            <el-button class="btn setGroup" :disabled="saved.type == 'favorite' && !group.available" @click="setSelectGroup(group.player_list)"><span>布阵</span><lfl-icon icon="set"></lfl-icon></el-button>
                                        </div>
                                    </div>
                                </div>
                                <lfl-null v-if="(saved.type == 'match' && savedMatchLineupCount == 0) || (saved.type == 'favorite' && saved.list.favorite.length == 0)" :text="'暂无'+ saved.str[saved.type] +'阵容'"></lfl-null>
                            </VuePerfectScrollbar>
                        </div>
                    </div>
                </div>

                <div class="right fr" v-loading="loading.orderInfo">
                    <div class="title"><span>已选阵容</span></div>
                    <div class="action-and-info">
                        <div class="actions">
                            <a href="javascript:;" class="clear" @click="clearSelect">清除阵容</a>
                            <a href="javascript:;" class="recommend" @click="recommendSelect">灵活组排</a>
                            <a href="javascript:;" class="saved" :class="{'selected': page.savedShow}" @click="page.savedShow = !page.savedShow;selectedPlayer = null">已存阵容
                                <el-badge v-if="!page.savedShow && (savedMatchLineupCount + savedFavoriteLineupCount) > 0" class="mark" :value="savedMatchLineupCount + savedFavoriteLineupCount"/>
                            </a>
                            <div class="clear"></div>
                        </div>
                        <div class="info">
                            <div class="item">
                                <div class="dialog" v-show="(!member.info && dialog.usePay) || (dialog.usePay && member.info && member.info.fantasy_count == 0)">
                                    <a href="javascript:;" class="close" @click="dialog.usePay = false"></a>
                                    <div class="title">注意您的可用工资</div>
                                    <div class="text">超出将无法提交您的阵容</div>
                                </div>
                                <div class="val good" :class="{'red': number.lavePay < 0,'bump': number.lavePayAnimate}">$<span>{{number.lavePay}}</span></div>
                                <div class="key">可用工资</div>
                            </div>
                            <div class="item">
                                <div class="val good">$<span>{{avgPay}}</span></div>
                                <div class="key">人均工资</div>
                            </div>
                            <div class="item">
                                <div class="val blue">{{avgScore}}</div>
                                <div class="key">阵容平均分</div>
                            </div>
                            <div class="clear"></div>
                        </div>
                    </div>
                    <div class="select-player-list" v-loading="loading.playerRecommend || loading.orderInfo">
                        <div class="player-item" v-for="(item,index) in _selectPlayer" :class="[{'null': !item}]" @click.stop="changePosNav(index)">
                            <div class="avatar" :style="{'background-image': 'url('+ (item && item.bg1 ? item.bg1 : '/static/image/bg1.png') +')' }">
                                <img :src="(item && item.player_image ? item.player_image : '/static/image/unknow.png')"/>
                            </div>
                            <div class="info" v-if="item">
                                <div class="player-name"><span>{{item.nickname}}</span></div>
                                <div class="team-name">
                                    <lfl-icon :icon="'pos-' + pos.obj[index].en"></lfl-icon>
                                    <span>{{item.position_short_name}} - {{item.team_short_name}}</span>
                                </div>
                                <div class="player-status">
                                    <span class="badge" :class="'status-' + item.player_status">{{item.player_status | playerStatus}}</span>
                                </div>
                            </div>
                            <div class="avg-score" v-if="item">{{item.score}}</div>
                            <div class="price good" v-if="item">$<span>{{item.value}}</span></div>
                            <div class="action" v-if="item">
                                <a href="javascript:;" class="btn remove" @click.stop="removePosPlayer(item)"></a>
                            </div>
                            <div v-if="!item" class="pos">
                                <lfl-icon :icon="'pos-' + pos.obj[index].en"></lfl-icon>
                                <span>{{pos.obj[index].name}}</span>
                            </div>
                            <div v-if="!item" class="tip">点击选人</div>
                        </div>
                    </div>
                </div>
                <div class="clear"></div>

                <el-dialog title="保存阵容" class="saveLineUp" top="30%" :visible.sync="editSubmit.dialog.show" :close-on-click-modal="!loading.editSubmit" :show-close="!loading.editSubmit">
                    <p>保存阵容会自动替换原有阵容</p>
                    <div class="actions">
                        <el-button type="primary" @click="submitEditRequest" :disabled="loading.editSubmit">确定保存</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="订单支付" class="mini order-dialog other" :visible.sync="submit.dialog.show" :close-on-click-modal="!loading.submit" :show-close="!loading.submit">
                    <div class="join-price">
                        <span class="fix-bold-font">参与单价</span>：<span class="light">{{room.price}}</span><lfl-icon icon="ticket" class="light"></lfl-icon>
                    </div>
                    <div class="join-count">
                        <span class="fix-bold-font">参与次数：</span>
                        <span @click="changeJoinCount(false,submit.count <= 1)"><lfl-icon icon="remove" :class="{'light': submit.count > 1}" class="reduce"></lfl-icon></span>
                        <span class="count"><span class="light">{{submit.count}}</span> / <span>{{availableTimes}}</span></span>
                        <span @click="changeJoinCount(true,submit.count >= (room.times - room.member_at_times))"><lfl-icon icon="add" :class="{'light': submit.count < (room.times - room.member_at_times)}" class="plus"></lfl-icon></span>
                    </div>
                    <div class="actions">
                        <div class="info">
                            <div class="my-ticket fl">
                                <div class="key fix-bold-font">我的门票</div>
                                <div class="val"><span>{{member.bank.ticket}}</span>
                                    <lfl-icon icon="ticket"></lfl-icon>
                                </div>
                            </div>
                            <div class="use-ticket fr">
                                <div class="key fix-bold-font">本次消耗</div>
                                <div class="val"><span>{{useTicket}}</span>
                                    <lfl-icon icon="ticket"></lfl-icon>
                                </div>
                            </div>
                        </div>
                        <el-button class="submit-button" type="primary" @click="submitRequest" :loading="loading.submit">提交阵容</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="订单支付" class="mini order-dialog custom" :visible.sync="submit.customDialog.show" :close-on-click-modal="!loading.submit" :show-close="!loading.submit">
                    <div class="text">
                        <span>创建房间：消耗</span><span class="num">{{room.key || 0}}</span><lfl-icon icon="key" class="key"></lfl-icon>
                    </div>
                    <div class="info arrow">
                        <div class="title">{{room.name}}</div>
                        <div class="row">
                            <div class="col">
                                <div class="val light"><span class="num">{{room.price}}</span><lfl-icon icon="ticket" class="tocket"></lfl-icon></div>
                                <div class="key">入场费</div>
                            </div>
                            <div class="col">
                                <div class="val light"><span class="num">{{room.num}}</span></div>
                                <div class="key">参与人数</div>
                            </div>
                            <div class="col">
                                <div class="val"><span class="num fruit">{{room.prize_amount}}</span><lfl-icon icon="fruit" class="fruit"></lfl-icon></div>
                                <div class="key">奖金总额</div>
                            </div>
                        </div>
                    </div>
                    <div class="text">选择阵容参与房间</div>
                    <div class="join-info arrow">
                        <span class="fl">参与单价：<span class="light num">{{room.price}}<lfl-icon icon="ticket" class="light"></lfl-icon></span></span>
                        <span class="fr">参与次数：<span class="num light">1</span></span>
                    </div>
                    <div class="actions">
                        <div class="order-info">
                            <div class="fl"><span>我的门票</span><span class="light num">{{member.bank.ticket}}<lfl-icon icon="ticket" class="ticket"></lfl-icon></span></div>
                            <div class="fr"><span>我的钥匙</span><span class="num">{{useTicket}}<lfl-icon icon="key" class="key"></lfl-icon></span></div>
                            <div class="this-use fl">本次消耗 <span class="num light">{{room.price}}<lfl-icon icon="ticket" class="ticket"></lfl-icon></span> <span class="num">+ {{room.key}}</span> <lfl-icon icon="key" class="key"></lfl-icon></div>
                        </div>
                        <div class="clearfix"></div>
                        <el-button class="submit-button" type="primary" @click="submitGroupRequest" :loading="loading.submit">提交阵容</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="提示" class="quick-buy ticket" top="30%" :visible.sync="dialog.ticket" :close-on-click-modal="!loading.buyTicket" :show-close="!loading.buyTicket">
                    <p class="text"><lfl-icon icon="ticket" class="ticket"></lfl-icon><span>门票不足</span></p>
                    <div class="actions">
                        <el-button type="primary" class="cancel" @click="dialog.ticket = false" :disabled="loading.buyTicket">暂不购买</el-button>
                        <el-button type="primary" class="buy" @click="buyTicket" :disabled="loading.buyTicket"><span>用</span><span class="num">{{useTicket - member.bank.ticket}}</span><lfl-icon icon="diamond"></lfl-icon><span>购买</span><span class="num">{{useTicket - member.bank.ticket}}</span><lfl-icon icon="ticket"></lfl-icon></el-button>
                    </div>
                </el-dialog>

                <el-dialog title="钻石不足" class="quick-buy diamond" top="30%" :visible.sync="dialog.diamond">
                    <p class="text"><lfl-icon icon="diamond" class="diamond"></lfl-icon><span>您的钻石不足</span></p>
                    <div class="actions">
                        <el-button type="primary" @click="dialog.diamond = false;$router.push('/recharge/diamond')">购买钻石</el-button>
                        <el-button type="primary" @click="dialog.diamond = false">稍后再说</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="提示" class="mini match-lineup-error" top="30%" :visible.sync="lineupMatch.messageDialog">
                    <div class="block" v-for="(item,index) in lineupMatch.message" :key="index">
                        <p class="title"><lfl-icon icon="mark"></lfl-icon><span>{{item.title}}</span></p>
                        <p v-for="(room,roomIndex) in item.list" :key="roomIndex">{{room.name}}</p>
                    </div>
                    <div class="actions">
                        <el-button type="primary" @click="lineupMatch.messageDialog = false">重新选择</el-button>
                    </div>
                </el-dialog>

                <el-dialog title="匹配成功" class="match-lineup-success" top="30%" :visible.sync="lineupMatch.successDialog">
                    <p class="text">匹配成功</p>
                    <div class="actions">
                        <el-button type="primary" @click="$router.push('/')">返回大厅</el-button>
                        <el-button type="primary" @click="lineupMatch.successDialog = false;matchLineupRequest();">再次匹配</el-button>
                    </div>
                </el-dialog>

                <el-dialog id="lineup-match" :class="{'room-show': lineupMatch.roomShow}" top="15%" :visible.sync="lineupMatch.dialogShow" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
                    <div class="main" v-loading="loading.matchLineup">
                        <div class="msg">
                            <lfl-icon icon="yes"></lfl-icon><span>阵容提交成功</span>
                        </div>
                        <div class="player-list clearfix">
                            <div class="player-item" v-for="(item,index) in _selectPlayer" :key="index">
                                <div v-if="item" class="avatar" :style="{'background-image': 'url(\''+ item.bg2 +'\')'}"><span class="score">{{item.score}}</span> <img :src="item.player_image"></div>
                                <div v-if="item" class="info">
                                    <div class="nickname">{{item.nickname}}</div>
                                    <div class="position">
                                        <lfl-icon :icon="'pos-' + item.position_short_name.toLowerCase()"></lfl-icon><span>{{item.position_short_name}} - {{item.team_short_name}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="actions">
                            <el-button type="primary" @click="toRoom()">进入房间</el-button>
                            <el-button type="primary" @click="$router.push('/')">返回大厅</el-button>
                            <el-button :type="lineupMatch.roomShow ? 'primary' : ''" @click="lineupMatch.roomShow = !lineupMatch.roomShow" :disabled="!lineupMatch.room.length">{{lineupMatch.room.length ? '匹配更多房间' : '暂无可匹配房间'}}</el-button>
                        </div>
                    </div>
                    <div class="room-list" v-loading="loading.matchLineup">
                        <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: false}">
                            <div class="room-list-item" v-for="(item,index) in lineupMatch.room" :key="index">
                                <div class="body">
                                    <div class="col info">
                                        <div class="name"><span :title="item.name" class="text">{{item.name}}</span><span class="tag" :class="{'must': item.is_must_open == 1}">{{item.is_must_open == 1 ? '必开' : '非必开'}}</span></div>
                                        <div class="desc">{{item.room_desc}}</div>
                                    </div>
                                    <div class="col price">
                                        <div class="val"><lfl-icon icon="ticket"></lfl-icon><span>{{item.price}}</span></div>
                                        <div class="key">入场费</div>
                                    </div>
                                    <div class="col range">
                                        <div class="val">{{item.prize_num}}</div>
                                        <div class="key">中奖范围</div>
                                    </div>
                                    <div class="col join">
                                        <div class="val"><span class="light">{{item.member_at_times}}</span> / <span>{{item.times}}</span></div>
                                        <div class="key">参与次数</div>
                                    </div>
                                    <div class="col total">
                                        <div class="val">
                                            <span>{{item.prize_amount}}</span><lfl-icon v-if="item.prize_type == 1" icon="fruit" class="fruit"></lfl-icon><lfl-icon v-if="item.prize_type == 2" icon="ticket" class="ticket"></lfl-icon>
                                        </div>
                                        <div class="key">奖金总额</div>
                                    </div>
                                    <div class="col select-btn" :class="{'active': item.selected}" @click="item.selected = !item.selected">
                                        <lfl-icon icon="selected"></lfl-icon>
                                    </div>
                                    <div class="type-flag" :class="'type-' + item.type">{{options.types[item.type]}}</div>
                                </div>
                                <div class="ext">
                                    <div class="fl">{{item.at_end_time,'YYYY-MM-DD HH:mm' | datetime}}</div>
                                    <div class="fr"><lfl-icon icon="username"></lfl-icon><span>{{item.at_times}} / {{item.num}}</span></div>
                                </div>
                            </div>
                            <lfl-null v-if="!lineupMatch.room.length" text="暂无可匹配房间" padding="30" width="200"></lfl-null>
                        </VuePerfectScrollbar>
                        <div class="control">
                            <div class="fl">
                            <span class="label">
                                <span class="key">我的门票</span>
                                <span class="val"><lfl-icon icon="ticket"></lfl-icon><span>{{member.bank.ticket}}</span></span>
                            </span>
                                <div class="label">
                                    <span class="key">本次消耗</span>
                                    <span class="val"><lfl-icon icon="ticket"></lfl-icon><span>{{matchLineupRoomTicketTotal}}</span></span>
                                </div>
                            </div>
                            <div class="fr">
                                <el-button type="primary" @click="submitLineupOrderRequest()" :disabled="!matchLineupRoomSelected">提交阵容</el-button>
                            </div>
                        </div>
                    </div>
                </el-dialog>

            </div>
        </div>
        <div class="footer">
            <div class="container">
                <span class="join"><span>已选择</span> <span class="count">{{selectCount}} / 5</span></span>
                <el-button type="primary" class="fr" :disabled="selectCount != 5 || number.lavePay < 0 || loading.playerRecommend" @click="submitLineup" v-if="action == 'room'">提交阵容</el-button>
                <el-button type="primary" class="fr" :disabled="selectCount != 5 || number.lavePay < 0 || loading.playerRecommend" @click="editSubmit.dialog.show = true" v-if="action == 'room-edit'">保存阵容</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                action: 'room',
                submit: {
                    dialog: {
                        show: false
                    },
                    customDialog: {
                        show: false
                    },
                    count: 1
                },
                editSubmit: {
                    dialog: {
                        show: false
                    },
                    count: 1
                },
                scrollSettings: {},
                page: {
                    savedShow: false
                },
                dialog: {
                    selectPlayer: true,
                    usePay: false,
                    isFirst: true,
                    ticket: false,
                    diamond: false
                },
                saved: {
                    list: {
                        match: [],
                        favorite: []
                    },
                    type: 'match',
                    str: {
                        match: '匹配',
                        favorite: '收藏'
                    }
                },
                avgVal: 0,
                pos: {
                    currPos: 3,
                    obj: {
                        1: {en: 'top', name: '上单', positionID: 3},
                        2: {en: 'jug', name: '打野', positionID: 4},
                        3: {en: 'mid', name: '中单', positionID: 2},
                        4: {en: 'adc', name: 'ADC', positionID: 1},
                        5: {en: 'sup', name: '辅助', positionID: 5}
                    },
                    revers: {
                        1: 4,
                        2: 3,
                        3: 1,
                        4: 2,
                        5: 5
                    },
                    str: {
                        'adc': 1,
                        'mid': 2,
                        'top': 3,
                        'jug': 4,
                        'sup': 5
                    },
                    arr: ['top', 'jun', 'mid', 'adc', 'sup']
                },
                isHoverPlayerList: false,
                selectPlayer: {
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null
                },
                selectPlayerPos: {
                    1: '',
                    2: '',
                    3: '',
                    4: '',
                    5: ''
                },
                sort: {
                    type: '',
                    price: '',
                    score: ''
                },
                playerList: {},
                number: {
                    lavePay: 0,
                    _lavePay: 0,
                    lavePay_true: 0,
                    lavePayAnimate: false,
                    countChangeInterval: null,
                    animateTimeout: null
                },
                room: {},
                match: {
                    index: 0,
                    selectedIndex: '',
                    list: []
                },
                loading: {
                    submit: false,
                    playerInfo: false,
                    playerRecommend: false,
                    roomInfo: false,
                    editSubmit: false,
                    orderInfo: false,
                    favoriteLineup: false,
                    buyTicket: false,
                    matchLineup: false
                },
                selectedPlayer: null,
                playerListScrollOrientation: '',
                customData: null,
                lineupMatch: {
                    dialogShow: false,
                    roomShow: false,
                    params: {
                        order_id: '',
                        room_ids: ''
                    },
                    message: [],
                    messageDialog: false,
                    successDialog: false,
                    room: []
                },
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
                    }
                },
            }
        },
        watch: {
            room(data) {
                if (data) {
                    if (data.type == 8) {
                        data.num = 2
                    }
                    if (this.$route.name != 'room-order') {
                        if (data.status == 4 && data.member_at_times == 0) {
                            this.$message.warning('本房间已开始，去大厅看看吧')
                            this.$router.replace('/')
                        } else if (data.status == 1 || data.status == 2 || data.status == 3 || data.status == 5) {
                            this.$message.warning('本房间已关闭，去大厅看看吧')
                            this.$router.replace('/')
                        } else if (data.type != 8 && (data.status == 0 && data.member_at_times == data.times) || (data.status == 4 && data.member_at_times != 0)) {
                            this.$router.replace('/my/room/' + data.roomID)
                        }
                    }
                }
            },
            'saved.list.match'(list) {
                if (list) {
                    for (let i in list) {
                        let player_list = {}
                        for (let pos in list[i]) {
                            player_list[this.pos.revers[pos]] = (this.players[list[i][pos]])
                        }
                        list[i].player_list = player_list
                    }
                }
            },
            '$store.state.member.token'(login) {
                if (this.isCustom) {

                } else {
                    this.requestRoomInfo()
                }
            },
            selectPlayerPos: {
                handler(data) {
                    for (let i in data) {
                        this.selectPlayer[i] = data[i]
                    }
                },
                deep: true
            },
            'pos.currPos'() {
                this.$refs['player-list'].scrollTop = 0
            },
            'selectPlayer': {
                handler: function (data) {
                    if (this.dialog.isFirst) {
                        this.dialog.selectPlayer = false
                        this.dialog.usePay = true
                        this.dialog.isFirst = false
                    }
                    for (let i in data) {
                        if (!data[i]) {
                            this.selectPlayerPos[i] = ''
                        }
                    }
                },
                deep: true
            },
            selectCount(count, old) {
                if (count === 5 && (this.avgVal - this.sumPay) < 0) {
                    this.dialog.usePay = true
                }
                if (old === 5) {
                    this.dialog.usePay = false
                }
            },
            lavePay(val, old) {
                let number = val - old
                let number_true = val - old

                this.number.lavePayAnimate = false

                if (this.number.countChangeInterval) {
                    clearInterval(this.number.countChangeInterval)
                }
                if (this.number.animateTimeout) {
                    clearTimeout(this.number.animateTimeout)
                }
                this.number.lavePay_true = parseInt(this.number.lavePay_true) + parseInt(number_true)
                let s = 1
                this.number.countChangeInterval = setInterval( _ => {
                    if (number < 0) {
                        this.number.lavePay-=s
                        number++
                    } else if (number > 0) {
                        this.number.lavePay+=s
                        number--
                    } else {
                        this.number.lavePay = this.number.lavePay_true
                        this.number.lavePayAnimate = true
                        this.number.animateTimeout = setTimeout(_ => {
                            this.number.lavePayAnimate = false
                        }, 150)
                        clearInterval(this.number.countChangeInterval)
                    }
                }, 300 / Math.abs(number),Math.abs(number))
            }
        },
        computed: {
            matchLineupRoomSelected () {
                let list = []
                for (let i in this.lineupMatch.room) {
                    if (this.lineupMatch.room[i].selected) {
                        list.push(this.lineupMatch.room[i].roomID)
                    }
                }
                return list.join()
            },
            matchLineupRoomTicketTotal () {
                let number = 0
                for (let i in this.lineupMatch.room) {
                    let room = this.lineupMatch.room[i]
                    if (room.selected) {
                        number += parseInt(room.price)
                    }
                }
                return number
            },
            isCustom () {
                return this.$route.name == 'room-custom-choose'
            },
            savedMatchLineupCount() {
                let count = 0
                for (let i in this.saved.list.match) {
                    if (this.saved.list.match[i]) count++
                }
                return count
            },
            savedFavoriteLineupCount() {
                let count = 0
                for (let i in this.saved.list.favorite) {
                    if (this.saved.list.favorite[i].available) count++
                }
                return count
            },
            availableTimes() {
                let times = 0
                if (this.room.type == 8) {
                    times = 1
                } else {
                    // 房间可参与次数
                    let roomAvailableTimes = this.room.num - this.room.at_times
                    // 用户可参与次数
                    let userTimes = this.room.times - this.room.member_at_times
                    if (userTimes > roomAvailableTimes) {
                        times = roomAvailableTimes
                    } else if (roomAvailableTimes == 0) {
                        times = 0
                    } else {
                        times = userTimes
                    }
                }
                return times
            },
            _selectPlayer() {
                let selectPlayer = {}
                for (let i in this.selectPlayer) {
                    selectPlayer[this.pos.revers[i]] = this.selectPlayer[i]
                }
                return selectPlayer
            },
            member() {
                return this.$store.state.member
            },
            players() {
                let obj = {}
                for (let pos in this.playerList) {
                    for (let i in this.playerList[pos]) {
                        obj[this.playerList[pos][i].playerID] = this.playerList[pos][i]
                    }
                }
                return obj
            },
            posPlayerList() {
                let list = this.playerList[this.pos.currPos]
                if (!list) return []
                return list.sort((a, b) => {
                    if (parseFloat(a[this.sort.type]) < parseFloat(b[this.sort.type])) {
                        return this.sort[this.sort.type] === 'asc' ? 1 : -1
                    } else if (parseFloat(a[this.sort.type]) > parseFloat(b[this.sort.type])) {
                        return this.sort[this.sort.type] === 'asc' ? -1 : 1
                    } else {
                        return 0
                    }
                })
            },
            selectCount() {
                let i = 0
                for (let z in this.selectPlayer) {
                    if (this.selectPlayer[z]) i++
                }
                return i
            },
            sumPay() {
                let val = 0
                for (let pos in this.selectPlayer) {
                    if (this.selectPlayer[pos]) {
                        val += parseInt(this.selectPlayer[pos].value)
                    }
                }
                return val
            },
            avgPay() {
                let val = 0
                let num = 5
                for (let pos in this.selectPlayer) {
                    if (this.selectPlayer[pos]) {
                        val += parseInt(this.selectPlayer[pos].value)
                        num--
                    }
                }
                if (num > 0) {
                    return val ? ((this.number._lavePay - val) / num).toFixed(0) : this.number._lavePay / num
                } else {
                    return this.number._lavePay - val
                }
            },
            avgScore() {
                let val = 0
                for (let pos in this.selectPlayer) {
                    if (this.selectPlayer[pos]) {
                        val += parseFloat(this.selectPlayer[pos].score)
                    }
                }
                return val.toFixed(2)
            },
            lavePay() {
                return this.avgVal - this.sumPay
            },
            lineUpData() {
                let data = {
                    roomID: this.room.roomID,
                    num: this.submit.count
                }
                for (let i in this.selectPlayer) {
                    data['p' + i] = this.selectPlayer[i] ? this.selectPlayer[i].playerID : ''
                }
                return data
            },
            customLineUpData () {
                let data = this.customData.data
                for (let i in this.selectPlayer) {
                    data['p' + i] = this.selectPlayer[i] ? this.selectPlayer[i].playerID : ''
                }
                return data
            },
            editLineUpData() {
                let data = {
                    roomID: this.$route.params.roomId,
                    order_id: this.$route.params.orderId
                }
                for (let i in this.selectPlayer) {
                    data['p' + i] = this.selectPlayer[i] ? this.selectPlayer[i].playerID : ''
                }
                return data
            },
            useTicket() {
                return this.submit.count * this.room.price
            },
            favoriteLineup () {
                return this.storage.getItem('favorite-lineup')
            }
        },
        mounted() {
            document.title = '幻联赛大厅';
            if (this.$route.name == 'room-custom-choose') {
                this.store.getItem('room-custom').then(data => {
                    if (!data) {
                        this.$router.replace('/room/custom')
                        return
                    }
                    this.customData = data
                    this.room = data.room
                    this.number.lavePay = this.room.salary_cap
                    this.number._lavePay = this.room.salary_cap
                    this.number.lavePay_true = this.room.salary_cap
                    this.match.list = this.room.room_matches
                    this.requestPlayerList({group_id: data.data.group_id})
                    if (this.member.token) {
                        this.requestFavoriteList()
                    }
                })
            } else {
                if (this.$route.params.orderId) {
                    this.action = 'room-edit'
                }
                this.requestRoomInfo()
            }

            if (!this.member.info) {
                 this.$root.hub.$emit('showLogin')
            }

        },
        beforeDestroy () {
            this.store.removeItem('room-custom')
        },
        methods: {
            toRoom () {
                this.$router.push('/my/room/' + this.room.roomID)
            },
            requestOrderInfo() {
                this.loading.orderInfo = true
                this.api('/services/fantasy/get_order_info.php', {order_id: this.$route.params.orderId}).then(req => {
                    if (req.code == 200) {
                        let playerList = req.data.player_list
                        for (let i in playerList) {
                            this.selectPlayerPos[playerList[i].positionID] = playerList[i]
                        }
                    }
                    this.loading.orderInfo = false
                })
            },
            requestFavoriteList() {
                this.api('/services/fantasy/lineup_list.php').then(req => {
                    if (req.code == 200) {
                        let list = req.data.list
                        for (let i in list) {
                            list[i].player_list = []
                            list[i].available = true
                            for (let key in this.pos.arr) {
                                let pos = this.pos.arr[key]
                                let _player = list[i][pos]
                                if (!this.players[_player.playerID]) {
                                    list[i].available = false
                                }
                                list[i].player_list.push(_player)
                                delete list[i][pos]
                            }
                            if (list[i].available && this.sumGroupPrice(list[i].player_list) > this.room.salary_cap) {
                                list[i].available = false
                            }
                        }
                        this.saved.list.favorite = list
                    }
                })
            },
            requestRoomInfo() {
                this.loading.roomInfo = true
                this.api('/services/fantasy/room_info.php', {roomID: this.$route.params.roomId}).then(req => {
                    if (req.code == 200) {
                        if (!req.data.roomID) {
                            this.$router.push('/404')
                            return
                        }
                        this.room = req.data
                        if (!this.number.lavePay) {
                            this.number.lavePay = this.room.salary_cap
                            this.number._lavePay = this.room.salary_cap
                            this.number.lavePay_true = this.room.salary_cap
                        }
                        this.match.list = this.room.room_matches
                        this.setPlayerList()
                        if (this.member.info) {
                            this.requestFavoriteList()
                        }
                    }
                    this.loading.roomInfo = false
                })
            },
            matchSavedLineup(list) {
                this.store.getItem('match-lineup', (err, lineUp) => {
                    if (lineUp) {
                        let match = []
                        for (let i in list) {
                            match.push(list[i].matchID)
                        }
                        let currMath = 'match/' + match.join('-')
                        if (lineUp[currMath]) {
                            this.saved.list.match = lineUp[currMath]
                        }
                    }
                })
            },
            requestPlayerList (params) {
                this.loading.roomInfo = true
                this.api('/services/fantasy/room_player.php', params).then(req => {
                    if (req.code == 200) {
                        this.room.room_players = req.data
                        this.setPlayerList()
                    }
                    this.loading.roomInfo = false
                })
            },
            setPlayerList() {
                let data = {}
                for (let i in this.room.room_players) {
                    let _pos = this.room.room_players[i]
                    for (let k in this.room.room_players[i].list) {
                        let player = this.room.room_players[i].list[k]
                        player.pos = _pos.positionID
                        player.price = player.value
                        if (!data[player.positionID]) {
                            data[player.positionID] = []
                        }
                        data[_pos.positionID].push(player)
                    }
                }
                this.playerList = data
                if (this.action == 'room-edit') {
                    this.requestOrderInfo()
                }
                this.matchSavedLineup(this.match.list)
            },
            requestMatchList() {
                this.api('/services/fantasy/room_match.php', {roomID: this.$route.params.roomId}).then(req => {
                    this.match.list = req.data
                })
            },
            removePosPlayer(item) {
                this.pos.currPos = item.positionID
                this.selectPlayer[item.positionID] = null
            },
            changePosNav(pos) {
                this.page.savedShow = false
                this.match.selectedIndex = ''
                this.selectedPlayer = null
                this.pos.currPos = this.pos.obj[pos].positionID
            },
            clearSelect() {
                for (let pos in this.selectPlayer) {
                    this.selectPlayer[pos] = null
                }
            },
            recommendSelect() {
                let params = {}
                if (this.$route.name == 'room-custom-choose') {
                    params = {groupID: this.customData.data.group_id}
                } else {
                    if (!this.$store.state.member.info) {
                        this.$root.hub.$emit('showLogin')
                        return
                    }
                    params = {roomID: this.room.roomID}
                }
                this.loading.playerRecommend = true
                this.api('/services/fantasy/recommend_lineup.php', params).then(req => {
                    if (req.code == 200) {
                        if (!req.data.list.length) {
                            this.$alert('暂无灵活组排', '提示', {
                                closeOnClickModal: true
                            })
                        } else {
                            for (let pos in req.data.list[0]) {
                                let _player = req.data.list[0][pos]
                                this.selectPlayerPos[_player.positionID] = _player
                            }
                        }
                    }
                    this.loading.playerRecommend = false
                })
            },
            sortPlayer(type) {
                this.sort.type = type
                this.sort[type === 'price' ? 'score' : 'price'] = ''
                this.sort[type] = this.sort[type] === 'asc' ? 'desc' : 'asc'
            },
            sumGroupScore(group) {
                let score = 0
                for (let i in group) {
                    score += parseFloat(group[i].score)
                }
                return score.toFixed(1)
            },
            sumGroupPrice(group) {
                let value = 0
                for (let i in group) {
                    value += parseFloat(group[i].value)
                }
                return value.toFixed(1)
            },
            setSelectGroup(group) {
                for (let i in group) {
                    this.selectPlayerPos[group[i].positionID] = group[i]
                }
            },
            compareLineup (group) {
                let key = this.lineupKey(this.room.room_matches,group)
                let favoriteLineup = this.storage.getItem('favorite-lineup')
                return favoriteLineup && favoriteLineup[key]
            },
            lineupKey(matches,players) {
                let match = []
                for (let i in matches) {
                    match.push(matches[i].matchID)
                }
                let matchKey = 'match/' + match.join('-')

                let player = []
                for (let i in players) {
                    player.push(players[i].positionID + '=' + players[i].playerID)
                }
                let playerKey = 'player/' + player.join('-')
                return matchKey + '@' + playerKey
            },
            favoriteGroup(group) {
                this.loading.favoriteLineup = true
                let params = {
                    name: '我的阵容 ' + this.moment().format('YYYY-MM-DD HH:mm:ss')
                }
                for (let i in group) {
                    params['playerID_' + i] = group[i] ? group[i].playerID : ''
                }
                this.api('/services/fantasy/lineup_add.php', params).then(req => {
                    if (req.code == 200) {
                        this.requestFavoriteList()
                        this.$message.success(req.message)
                        this.updateFavoriteLineup(group)
                        this.saved.type = 'favorite'
                    } else {
                        this.$message.error(req.message)
                    }
                    this.loading.favoriteLineup = false
                })
            },
            updateFavoriteLineup (group) {
                let key = this.lineupKey(this.room.room_matches,group)
                let favoriteLineup = this.storage.getItem('favorite-lineup')
                if (!favoriteLineup) {
                    favoriteLineup = {}
                }
                console.log(key)
                favoriteLineup[key] = true
                this.storage.setItem('favorite-lineup', favoriteLineup)
            },
            closePlayerDetail() {
                this.selectedPlayer = null
            },
            changeJoinCount(opr,bool) {
                if (bool) return
                let count = this.submit.count
                let max = this.room.times - this.room.member_at_times
                if ((opr && count === max) || (!opr && count === 1)) return
                if (opr) {
                    this.submit.count++
                } else {
                    this.submit.count--
                }
            },
            submitEditRequest() {
                this.loading.editSubmit = true
                this.api('/services/fantasy/edit_order.php', this.editLineUpData, req=> {
                    if (req.code == 40304) {
                        this.$root.hub.$emit('showLogin')
                    }
                }).then(req => {
                    if (req.code == 200) {
                        this.saveMatchLineup()
                        this.$router.push('/my/room/' + this.editLineUpData.roomID)
                        this.$message.success(req.message)
                    } else {
                        this.$message.error(req.message)
                    }
                    this.loading.editSubmit = false
                })
            },
            submitRequest() {
                this.loading.submit = true
                this.api('/services/fantasy/create_order.php', this.lineUpData, req => {
                    if (req.code == 40305) {
                        this.dialog.ticket = true
                    } else {
                        this.$message.error(req.message)
                    }
                }).then(req => {
                    if (req.code == 200) {
                        this.submit.dialog.show = false
                        this.saveMatchLineup()
//                        this.$router.push('/my/room')
                        this.$root.hub.$emit('updateBank')
                        this.lineupMatch.params.order_id = req.data.order_id
                        this.matchLineupRequest()
                    } else {
                        this.$message.error(req.message)
                    }
                    this.loading.submit = false
                })
            },
            matchLineupRequest () {
                this.loading.matchLineup = true
                this.lineupMatch.dialogShow = true
                this.api('/services/fantasy/room_lineup_list.php', {order_id: this.lineupMatch.params.order_id}).then(req => {
                    if (req.code == 200) {
                        for (var i in req.data.list) {
                            req.data.list[i].selected = false
                        }
                        this.lineupMatch.room = req.data.list
                    } else {
                        this.$message.error(req.message)
                    }
                    this.loading.matchLineup = false
                })
            },
            submitLineupOrderRequest () {
                this.loading.matchLineup = true
                this.lineupMatch.params.room_ids = this.matchLineupRoomSelected
                this.api('/services/fantasy/create_lineup_order.php', this.lineupMatch.params, req => {
                    if (req.code == 0) {
                        this.lineupMatch.message = req.data
                        this.lineupMatch.messageDialog = true
                    } else {
                        this.$message.error(req.message)
                    }
                }).then(req => {
                    if (req.code == 200) {
                        this.lineupMatch.successDialog = true
                        this.$root.hub.$emit('updateBank')
                    }
                    this.loading.matchLineup = false
                })
            },
            submitGroupRequest () {
                this.loading.submit = true
                this.api('/services/fantasy/create_group_room.php', this.customLineUpData, req => {
                    if (req.code == 40304) {
                        this.dialog.ticket = true
                    } else {
                        this.$message.error(req.message)
                    }
                }).then(req => {
                    if (req.code == 200) {
                        this.saveMatchLineup()
                        this.$router.push('/my/room/' + req.data.roomID)
                        this.$message.success(req.message)
                        this.$root.hub.$emit('updateBank')
                        this.$root.hub.$emit('showShare', {id: req.data.roomID, name: this.room.name, code: req.data.secret_key})
                    }
                    this.loading.submit = false
                })
            },
            saveMatchLineup() {
                let key = 'match-lineup'
                this.store.getItem(key, (err, value) => {
                    let matchLineup = value || {}
                    let lineup = {
                        match: '',
                        player_key: [],
                        players: {}
                    }
                    let match = []
                    for (let i in this.room.room_matches) {
                        match.push(this.room.room_matches[i].matchID)
                    }
                    lineup.match = 'match/' + match.join('-')
                    for (let i in this.selectPlayer) {
                        lineup.players[this.selectPlayer[i].positionID] = this.selectPlayer[i].playerID
                        lineup.player_key.push(this.selectPlayer[i].positionID + '=' + this.selectPlayer[i].playerID)
                    }

                    if (!matchLineup[lineup.match]) {
                        matchLineup[lineup.match] = {}
                    }
                    let playerKey = 'player/' + lineup.player_key.join('-')
                    if (!matchLineup[lineup.match][playerKey]) {
                        matchLineup[lineup.match][playerKey] = lineup.players
                    }
                    this.store.setItem(key, matchLineup)
                })
            },
            submitLineup() {
                if (!this.$store.state.member.info) {
                    this.$root.hub.$emit('showLogin')
                    return
                }
                if (this.room.type != 8) {
                    if (parseInt(this.room.num) == parseInt(this.room.at_times)) {
                        this.$message.error('房间已满，无法参与')
                        return
                    }
                }
                if (this.room.type != 8 && parseInt(this.room.member_at_times) >= parseInt(this.room.times)) {
                    this.$message.error('超过该房间参与上限')
                    return
                }

                if (this.isCustom) {
                    this.submit.customDialog.show = true
                } else {
                    this.submit.dialog.show = true
                }
            },
            playerSelectScrollDown () {
                this.$root.hub.$emit('scrollDown')
            },
            buyTicket () {
                this.loading.buyTicket = true
                this.api('/services/fantasy/ticket_exchange.php', {sku_id: 999, number: this.useTicket - this.member.bank.ticket}, _ => {}).then(req => {
                    if (req.code == 200) {
                        this.$root.hub.$emit('updateBank')
                        this.$message.success('购买成功')
                    } else if (req.code == 40405) {
                        this.dialog.diamond = true
                    } else {
                        this.$message.error('购买失败')
                    }
                    this.loading.buyTicket = false
                    this.dialog.ticket = false
                })
            }
        }
    }
</script>

<style lang="stylus">
    @import "../../static/css/room.styl";
</style>
