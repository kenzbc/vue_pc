<template>
  <div id="mall-detail-container">
    <div class="top-container">
      <div class="mall-top">
        <div class="detail-top-in" v-loading="loading" element-loading-text="拼命加载中">
          <div class="left">
            <img class="detail-pic"
                 :src="goods.goodsDetails.image_url ? goods.goodsDetails.image_url + '?x-oss-process=image/resize,m_fill,h_360,w_360,limit_0' : '/static/image/default-goods-pic.jpg'"/>
          </div>
          <div class="right">
            <ul class="goods-cont">
              <li class="property">
                <img class="lable-pic" src="/static/image/entity_detail.png"
                     v-if="goods.goodsDetails.goods_type == 2"/>
                <img class="lable-pic" src="/static/image/xuni_detail.png" v-else/>
                <span class="category">{{ goods.goodsDetails.category_name | formatMenuTitle }}</span>
              </li>
              <li class="name" v-text="goods.goodsDetails.goods_name"></li>
              <li class="storage-time"
                  v-if="goods.goodsDetails.action_type_id != 3"
                  :class="{'ok': goods.goodsDetails.action_type_id != 2 && goods.goodsDetails.action_type_id != 3}">
                <span :class="{miaoshaStorage:goods.goodsDetails.action_type_id==2}">剩余：{{goods.goodsDetails.exchange_times}}件</span>
                <span class="seperate"
                      v-if="goods.goodsDetails.action_type_id != 2 && goods.goodsDetails.action_type_id != 3"></span>
                <span class="mobile"
                      v-if="goods.goodsDetails.action_type_id != 2 && goods.goodsDetails.action_type_id != 3">截止到 {{moment(goods.goodsDetails.end_time * 1000).format('YYYY-MM-DD')}}</span>
              </li>

              <!--秒杀模块-->
              <li class="miaosha-container model-container"
                  :class="goods.goodsDetails.start_time*1000 < Date.now() && goods.goodsDetails.end_time*1000 > Date.now() ? 'start' : 'before' "
                  v-if="goods.goodsDetails.action_type_id==2">
                <div class="func-show">
                  <img class="pic" src="/static/image/miaosha-start.png" alt=""
                       v-if="goods.goodsDetails.start_time*1000 < Date.now() && goods.goodsDetails.end_time*1000 > Date.now()">
                  <img class="pic" src="/static/image/miaosha-before-over.png" alt="" v-else>
                  <img class="sale" src="/static/image/SALE.jpg" alt="">
                  <div class="text">
                    <p class="start" v-if="goods.goodsDetails.start_time*1000 > Date.now()">
                      <span>即将开始</span>
                      <span class="start-time">
                        距开始
                        <span><span class="num">{{time_count.days}}</span>天</span>
                        <span><span class="num">{{time_count.hours}}</span>时</span>
                        <span><span class="num">{{time_count.minutes}}</span>分</span>
                        <span><span class="num">{{time_count.seconds}}</span>秒</span>
                      </span>
                    </p>
                    <p v-else-if="goods.goodsDetails.start_time*1000 < Date.now()&&goods.goodsDetails.end_time*1000 > Date.now()">
                      秒杀进行中</p>
                    <p v-else>秒杀已结束</p>
                  </div>
                </div>
                <div class="price-show">
                  <div class="all">
                    <div class="price" :class="{'zuanshi' : goods.goodsDetails.e_type == '1'}">
                      <span>{{goods.goodsDetails.price}}</span>
                      <lfl-icon :icon="'diamond'" class="zuanshi"
                                v-if="goods.goodsDetails.e_type == '1'"></lfl-icon>
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                    </div>
                    <div class="mark">
                      <span>原价</span>
                      <span class="line">{{goods.goodsDetails.original_price}}</span>
                    </div>
                  </div>
                </div>
              </li>
              <!--竞拍模块-->
              <li class="auction-container model-container"
                  v-if="goods.goodsDetails.action_type_id == 3">
                <div class="func-show">
                  <img class="sale" src="/static/image/SALE.jpg" alt="">
                  <div class="text" v-if="goods.goodsDetails.auction_status == 0">
                    <p class="start" v-if="goods.goodsDetails.start_time*1000 > Date.now()
                                        || goods.goodsDetails.start_time*1000 < Date.now()&&goods.goodsDetails.end_time*1000 > Date.now()">
                      <span>{{goods.goodsDetails.start_time*1000 > Date.now() ? '即将开始' : '正在进行'}}</span>
                      <span class="start-time">
                        {{goods.goodsDetails.start_time*1000 > Date.now() ? '距开始' : '距结束'}}
                        <span><span class="num">{{time_count.days}}</span>天</span>
                        <span><span class="num">{{time_count.hours}}</span>时</span>
                        <span><span class="num">{{time_count.minutes}}</span>分</span>
                        <span><span class="num">{{time_count.seconds}}</span>秒</span>
                      </span>
                    </p>
                  </div>
                  <div class="text" v-else-if="goods.goodsDetails.auction_status == 1">
                    <p>本场竞拍已成交</p>
                  </div>
                  <div class="text" v-else-if="goods.goodsDetails.auction_status == 2">
                    <p>本场竞拍已流拍</p>
                  </div>
                  <div class="text" v-else-if="goods.goodsDetails.auction_status == 3">
                    <p>本场竞拍已关闭</p>
                  </div>
                </div>
                <div class="price-show" :class="{'zuanshi' : goods.goodsDetails.e_type == '1'}">
                  <div class="all">
                    <p>{{goods.goodsDetails.start_time*1000 > Date.now() || goods.goodsDetails.now_price == 0 ? '起拍价' : goods.goodsDetails.auction_status == 1 ? '成交价' : '当前价'}}</p>
                    <div class="price" :class="{'zuanshi' : goods.goodsDetails.e_type == '1'}">
                      <span>{{goods.goodsDetails.start_time*1000 > Date.now() ? goods.goodsDetails.starting_price : (goods.goodsDetails.now_price == 0 ? goods.goodsDetails.starting_price : goods.goodsDetails.now_price )}}</span>
                      <lfl-icon :icon="'diamond'" class="zuanshi"
                                v-if="goods.goodsDetails.e_type == '1'"></lfl-icon>
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                    </div>
                  </div>
                  <p>{{goods.goodsDetails.start_time*1000 > Date.now() || goods.goodsDetails.now_price == 0 ? '起拍价' : goods.goodsDetails.auction_status == 1 ? '成交价' : '当前价'}}</p>
                  <div class="clock"
                       @click="mallDetailPop(goods.goodsDetails.action_id, goods.goodsDetails.price, goods.goodsDetails.max_price, goods.goodsDetails.e_type, 4, goods.goodsDetails.address_id)">
                    <img src="/static/image/clock.png" alt="">
                    <span>提醒</span>
                  </div>
                </div>
              </li>
              <li class="auction-detail"
                  v-if="goods.goodsDetails.action_type_id == 3">
                <section>
                  <div class="item in">
                    <div class="bj"></div>
                    <div class="model-card in">
                      <span>起拍价：</span>
                      <span class="num">{{goods.goodsDetails.starting_price}}</span>
                      <img v-if="goods.goodsDetails.e_type == '1'" src="/static/image/diamond-orange.png" alt="钻石icon">
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                    </div>
                  </div>
                  <div class="item in">
                    <div class="bj"></div>
                    <div class="model-card in">
                      <span>一口价：</span>
                      <span class="num">{{goods.goodsDetails.max_price == 0 ? '无' : goods.goodsDetails.max_price}}</span>
                      <i v-if="goods.goodsDetails.max_price != 0">
                        <img v-if="goods.goodsDetails.e_type == '1' " src="/static/image/diamond-orange.png" alt="钻石icon">
                        <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                      </i>
                    </div>
                  </div>
                </section>
                <section class="in">
                  <div class="item">
                    <div class="model-card">
                      <span>开拍时间：</span>
                      <span>{{moment(goods.goodsDetails.start_time * 1000).format("MM月DD日 HH:mm")}}</span>
                    </div>
                  </div>
                  <div class="item">
                    <div class="model-card">
                      <span>结束时间：</span>
                      <span>{{moment(goods.goodsDetails.end_time * 1000).format("MM月DD日 HH:mm")}}</span>
                    </div>
                  </div>
                  <div class="item">
                    <div class="model-card">
                      <span>竞价延时：</span>
                      <span>{{goods.goodsDetails.delay_time}} 分钟</span>
                    </div>
                  </div>
                </section>
              </li>
              <!--普通模块-->
              <li class="ordinary-container" v-if="goods.goodsDetails.action_type_id != 2 && goods.goodsDetails.action_type_id != 3">
                <div class="price-show">
                  <div class="all">
                    <div class="price" :class="{'zuanshi' : goods.goodsDetails.e_type == '1'}">
                      <span>{{goods.goodsDetails.price}}</span>
                      <lfl-icon :icon="'diamond'" class="zuanshi"
                                v-if="goods.goodsDetails.e_type == '1'"></lfl-icon>
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                    </div>
                    <div class="storage-time">截止到 {{moment(goods.goodsDetails.end_time *
                      1000).format('YYYY-MM-DD')}}
                    </div>
                  </div>
                </div>
              </li>
              <li class="exchange-btn">
                <section
                        v-if="goods.goodsDetails.action_type_id == 2 && goods.goodsDetails.exchange_times>0">
                  <el-button v-show="goods.goodsDetails.start_time*1000>Date.now()"
                             v-text="'即将开始'"
                             type="primary" class="now-exchange-btn miaosha-before-start"
                             :disabled="true">
                  </el-button>
                  <el-button
                          v-show="goods.goodsDetails.exchange_times>0&&goods.goodsDetails.start_time*1000<Date.now()"
                          type="primary" class="now-exchange-btn miaosha-pro" @click="upExchange()"
                          :disabled="goods.exchange_status != '立即兑换'">{{goods.exchange_status}}
                  </el-button>
                </section>
                <section v-else-if="goods.goodsDetails.auction_status == 0
                        && goods.goodsDetails.action_type_id == 3
                        && goods.goodsDetails.exchange_times>0">

                  <el-button v-if="goods.goodsDetails.start_time*1000 > Date.now()"
                             v-text="'即将开始'"
                             type="primary" class="now-exchange-btn miaosha-before-start"
                             :disabled="true">
                  </el-button>
                  <div class="auction-btn"
                       :class="{'double' : goods.goodsDetails.max_price != 0}"
                       v-else-if="goods.goodsDetails.exchange_times > 0 && goods.goodsDetails.start_time*1000 < Date.now()">
                    <el-button type="primary" class="now-exchange-btn auction-pro left-btn"
                               v-if="goods.goodsDetails.max_price != 0"
                               @click="mallDetailPop(goods.goodsDetails.action_id, goods.goodsDetails.price, goods.goodsDetails.max_price, goods.goodsDetails.e_type, 1, goods.goodsDetails.address_id)">
                      一口价 {{goods.goodsDetails.max_price}} <img src="/static/image/diamond.png"
                                                                alt=""
                                                                v-if="goods.goodsDetails.e_type == '1'"><img
                            src="/static/image/guozi-white.png" alt="" v-else>
                    </el-button>
                    <el-button type="primary" class="now-exchange-btn auction-pro right-btn"
                               @click="mallDetailPop(goods.goodsDetails.action_id, goods.goodsDetails.price, goods.goodsDetails.max_price, goods.goodsDetails.e_type, 2, goods.goodsDetails.address_id)">
                      竞价 {{goods.goodsDetails.price}} <img src="/static/image/diamond.png" alt=""
                                                           v-if="goods.goodsDetails.e_type == '1'"><img
                            src="/static/image/guozi-white.png" alt="" v-else>
                    </el-button>
                  </div>
                  <el-button v-else
                             v-text="'已结束'"
                             type="primary" class="now-exchange-btn miaosha-before-start"
                             :disabled="true">
                  </el-button>
                </section>
                <section v-else-if="goods.goodsDetails.auction_status == 1">
                  <el-button type="primary" class="now-exchange-btn"
                             v-text="'已成交'"
                             :disabled="goods.goodsDetails.button != '立即兑换'">
                  </el-button>
                </section>
                <section v-else-if="goods.goodsDetails.auction_status == 2">
                  <el-button type="primary" class="now-exchange-btn"
                             v-text="'已流拍'"
                             :disabled="goods.goodsDetails.button != '立即兑换'">
                  </el-button>
                </section>
                <section v-else-if="goods.goodsDetails.auction_status == 3">
                  <el-button type="primary" class="now-exchange-btn"
                             v-text="'已关闭'"
                             :disabled="goods.goodsDetails.button != '立即兑换'">
                  </el-button>
                </section>
                <section v-else>
                  <el-button type="primary" class="now-exchange-btn"
                             v-text="goods.goodsDetails.button ? goods.goodsDetails.button : '已抢完'"
                             @click="upExchange()"
                             :disabled="goods.goodsDetails.button != '立即兑换'">
                  </el-button>
                </section>

              </li>
            </ul>
          </div>
        </div>
        <ul class="mobile-miaosha">
          <li class="miaosha miaosha-before"
              v-show="goods.goodsDetails.action_type_id==2&&goods.goodsDetails.start_time*1000>Date.now()">
            <img src="/static/image/miaosha-before-over.png" alt="">
            <div><span>{{moment(goods.goodsDetails.start_time * 1000).format('MM月DD日 HH:mm')}}</span><span>开抢</span>
            </div>
            <img src="/static/image/SALE.jpg" alt="">
          </li>
          <li class="miaosha miaosha-start"
              v-show="goods.goodsDetails.action_type_id==2&&goods.goodsDetails.exchange_times>0&&goods.goodsDetails.start_time*1000<Date.now()&&goods.goodsDetails.end_time*1000>Date.now()">
            <img src="/static/image/miaosha-start.png" alt="">
            <span>秒杀进行中</span>
            <img src="/static/image/SALE.jpg" alt="">
          </li>
          <li class="miaosha miaosha-over"
              v-show="goods.goodsDetails.action_type_id==2&&goods.goodsDetails.exchange_times==0">
            <img src="/static/image/miaosha-before-over.png" alt=""/>
            <span>秒杀已结束</span>
            <img src="/static/image/SALE.jpg" alt="">
          </li>
        </ul>
      </div>
    </div>

    <div class="detail-bottom" :class="{'auction' : goods.goodsDetails.action_type_id == 3}">
      <div class="left">
        <div class="tab-nav">
          <ul>
            <li :class="{'active': tabIndex == index}"
                v-for="(item, index) in detailList.title"
                :key="index"
                @click="toggleTabs(index, goods.goodsDetails.action_id)">
              <p>{{item}}</p>
              <div class="bj"></div>
            </li>
          </ul>
        </div>
        <div class="tab-content">
          <div class="dec" v-if="tabIndex == 0">
            <div class="explain">
              <div v-html="goods.goodsDetails.description"></div>
            </div>
            <div class="important-explain">
              <span>{{detailList.des.tips_title}}</span>
              <span>{{detailList.des.tips_text}}</span>
            </div>
          </div>
          <div class="record" v-else-if="tabIndex == 1">
            <div class="record-list" v-if="!isDetailData">
              <div class="record-thead">
                <ul>
                  <li :class="{'in': detailList.record.list_data.a_type == 0}">
                    <div :class="item.class" v-for="(item, index) in detailList.record.status_text" >
                      {{index == 0 && detailList.record.list_data.a_type == 1 ? '昵称' : item.text}}
                    </div>
                  </li>
                </ul>
              </div>
              <div class="record-tbody">
                <ul>
                  <li v-for="(item, index) in detailList.record.list_data.list" :class="{'in': index == 0}">
                    <div class="info" v-if="detailList.record.list_data.a_type == 0">
                      <span class="mark" v-if="item.member_id == member.member_id">我</span>
                      <span class="status">{{index == 0 ? detailList.record.list_data.auction_status == 1 ? '成交' : '领先' : '被超越'}}</span>
                      <span class="success"
                            v-if="index == 0 && detailList.record.list_data.auction_status == 1">
                        <lfl-icon :icon="'queren'"></lfl-icon>
                      </span>
                    </div>
                    <div class="info" v-else>
                      <span class="avatar">
                        <img :src="item.avatar ? item.avatar + '?x-oss-process=image/resize,m_fill,h_30,w_30,limit_0' : '/static/image/avatar.jpg'" alt="">
                      </span>
                      <span class="nickname">{{item.nickname}}</span>
                      <span class="success"
                            v-if="index == 0  && detailList.record.list_data.auction_status == 1">
                        <lfl-icon :icon="'queren'"></lfl-icon>
                      </span>
                    </div>
                    <div class="price">
                      <span>{{item.price}}</span>
                      <lfl-icon :icon="'fruit'" v-if="detailList.record.list_data.e_type == 0 && index == 0"></lfl-icon>
                      <img v-else-if="detailList.record.list_data.e_type == 1 && index == 0" src="/static/image/diamond-orange.png" alt="">
                      <img v-else-if="detailList.record.list_data.e_type == 0" src="/static/image/guozi-gray.png" alt="">
                      <img v-else-if="detailList.record.list_data.e_type == 1" src="/static/image/diamond-gray.png" alt="">
                    </div>
                    <div class="time">
                      <span>{{moment(item.add_time * 1000).format("MM-DD HH:mm:ss")}}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="no-data" v-if="isDetailData">
              <p>暂无记录</p>
            </div>
            <div class="load-more" :class="{'not': !isMore}" @click="isDetailMore()" v-if="!isDetailData">
              <div v-if="isMore"><span>LOAD</span><span class="load"><lfl-icon icon="add"></lfl-icon></span><span>MORE</span></div>
              <div v-else>沒有更多数据</div>
            </div>
          </div>
          <div class="auction-doc" v-else-if="tabIndex == 2">
            <ul>
              <li v-for="(item, index) in detailList.AuctionDoc.list">
                <p class="title">
                  <!--<i class="orange"></i>-->
                  {{ item.title }}
                </p>
                <p class="text">{{ item.text }}</p>
                <viewer v-if="index == 1" class="pic">
                  <img :src="item.image" alt="" >
                </viewer>
              </li>
            </ul>

          </div>

        </div>
      </div>
      <div class="right" v-loading="loading" element-loading-text="拼命加载中">
        <div class="recommend">
          <span></span>
          <span>推荐商品</span>
        </div>
        <div class="recommend-container">
          <ul class="recommend-detail" v-for="item in recommendGoods" :key="item.action_id"
              @click="mallDetailLink(item.action_id)">
            <li>
              <div class="goods">
                <div class="goods-pic-wrap">
                  <img :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_150,w_150,limit_0' : '/static/image/default-goods-pic.jpg'">
                </div>
                <ul class="goods-desc">
                  <li class="name">{{item.goods_name}}</li>
                  <li class="storage" :class="{miaosha:item.action_type_id==2}">
                    剩余：{{item.exchange_times}}件
                  </li>
                  <li class="category">
                    <lfl-icon :icon="'entity-exchange'" class="entity-exchange"
                              v-if="item.type == 2"></lfl-icon>
                    <lfl-icon :icon="'virtual-exchange'" class="virtual-exchange" v-else></lfl-icon>
                    <span>{{item.category_name | formatMenuTitle}}</span>
                  </li>
                  <li class="price-wrap">
                  <span class="price" style="color:rgba(15,142,252,1);" v-if="item.e_type == '1'"
                        v-text="item.price"></span>
                    <span class="price" v-text="item.price" v-else></span>
                    <lfl-icon :icon="'diamond'" class="zuanshi"
                              v-if="item.e_type == '1'"></lfl-icon>
                    <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <el-dialog title="选择收货地址" :visible.sync="exchangeTableVisible" class="pop-shopping-addr"
               @close="popSwitch = false">
      <VuePerfectScrollbar class="scrollbar" @ps-scroll-y="mallScrollEvent" @ps-y-reach-end="$emit('scrollDown')">
        <div class="addr-select">
          <div class="add-btn" v-show="address.data.count > -1" @click="addCall()"><img
                  src="/static/image/add.png">添加新地址
          </div>
          <ul>
            <li class="row" @click="chooseAddress(index)" v-for="(item,index) in  myAddrList"
                :class="{active: item.addr_id == goods.radio}" :key="index">
              <div>
                <div class="bj"></div>
                <div class="left">
                  <div>
                    <span class="default-sign" v-show="item.def_addr == 1">默认</span>
                    <span class="name" v-text="item.name"></span>
                    <span class="mobile" v-text="item.mobile"></span>
                  </div>
                  <div>
                    <span class="addr">{{ item.addr_name.split("-").join('') }} </span>
                    <span class="addr addr2">{{item.addr }}</span>
                  </div>
                </div>
                <div class="right">
                  <img @click.stop="modAddress({item:item,index:index})"
                       :src="item.addr_id == goods.radio ? edit_url[1] : edit_url[0]"/>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <P class="tip" v-show="address.data.list.length == 0">暂无收货地址，请添加新的收货地址</P>
      </VuePerfectScrollbar>
      <div class="btn-box">
        <el-button type="primary" class="exchange" @click="confirmExchange()"
                   v-show="address.data.list.length > 0">兑换
        </el-button>
        <el-button type="primary" class="cancel" @click="exchangeCancel">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="confirmBoxVisible" width="30%" class="confirmBox">
      <lfl-icon :icon="'pop-close'" class="pop-close" @click.native="confirmBoxVisible=false"></lfl-icon>
      <div>
        <span>您确定要支付</span><span class="price">{{goods.goodsDetails.price}}</span>
        <lfl-icon :icon="'diamond'" class="zuanshi" v-if="goods.goodsDetails.e_type == '1'"></lfl-icon>
        <lfl-icon :icon="'fruit'" v-else></lfl-icon>
        <span>兑换该商品吗</span>
      </div>
      <span slot="footer" class="dialog-footer">
         <el-button @click="closeDialog(1)">再想想</el-button>
         <!--<el-button @click.native="confirmBoxVisible == false">再想想</el-button>-->
         <el-button type="primary" @click="updataExchange">确定</el-button>
         </span>
    </el-dialog>
    <el-dialog :visible.sync="fruitDialogVisible" width="30%" class="fruit-warning">
      <lfl-icon :icon="'pop-close'" class="pop-close" @click.native="fruitDialogVisible=false"></lfl-icon>
      <div>
        <lfl-icon :icon="'warning'"></lfl-icon>
        <span>您的果子余额不足</span>
      </div>
      <div>
        <span>当前余额：</span><span class="price">{{this.goods.goodsDetails.guozi}}</span>
        <lfl-icon :icon="'fruit'"></lfl-icon>
      </div>
      <span slot="footer" class="dialog-footer">
         <el-button @click.native="fruitDialogVisible = false">知道了</el-button>
     </span>
    </el-dialog>
    <el-dialog :visible.sync="diamondDialogVisible" width="30%" class="diamond-warning">
      <lfl-icon :icon="'pop-close'" class="pop-close" @click.native="diamondDialogVisible=false"></lfl-icon>
      <div>
        <lfl-icon :icon="'warning'"></lfl-icon>
        <span>钻石不足，是否充值？</span>
      </div>
      <div>
        <span>当前余额：</span><span class="diamond-price">{{this.goods.goodsDetails.diamond}}</span>
        <lfl-icon :icon="'diamond'" class="zuanshi"></lfl-icon>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click.native="diamondDialogVisible = false">稍后再说</el-button>
    <el-button type="primary" @click="diamondCharge">确 定</el-button>
     </span>
    </el-dialog>
    <div class="mobile-btn">
      <el-button v-show="goods.goodsDetails.action_type_id==2&&goods.goodsDetails.start_time*1000>Date.now()"
                 type="primary" class="now-exchange-btn miaosha-before-start miaosha-before" :disabled="true">
        <span>距开始</span>
        <span class="block">{{time_count.days}}</span>
        <span >天</span><span class="block">{{time_count.hours}}</span>时<span
              class="block">{{time_count.minutes}}</span>分<span
              class="block">{{time_count.seconds}}</span>秒
      </el-button>
      <el-button
              v-show="goods.goodsDetails.action_type_id==2&&goods.goodsDetails.exchange_times>0&&goods.goodsDetails.start_time*1000<Date.now()"
              type="primary" class="now-exchange-btn miaosha-pro" :disabled="goods.exchange_status != '立即兑换'"
              @click="upExchange()">{{goods.exchange_status}}
      </el-button>
      <el-button v-show="goods.goodsDetails.action_type_id!=2" type="primary" class="now-exchange-btn"
                 v-text="goods.goodsDetails.button" @click.stop="upExchange()"
                 :disabled="goods.goodsDetails.button != '立即兑换'"></el-button>

    </div>

    <!--竞拍弹窗-->
    <!--<mall-auction-pop :data="popInfo" @comebackData="getComebackData" @closeDialog="closeDialog()" :isShow="popInfo.loading"></mall-auction-pop>-->
    <mall-auction-pop :data="popInfo" @comebackData="getComebackData" v-if="actionPop"></mall-auction-pop>
    <lfl-footer></lfl-footer>
  </div>
</template>

<script>

  import Vue from 'vue';
  import moment from 'moment';
  import Viewer from 'v-viewer'
  import 'viewerjs/dist/viewer.css'

  Vue.use(Viewer);
  Viewer.setDefaults({
    Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
  });

  export default {
    data() {
      return {
        exchangeTableVisible: false, // 选择收获地址弹窗
        dialogTableVisible: false,
        fruitDialogVisible: false,
        diamondDialogVisible: false,
        confirmBoxVisible: false, // 兑换商品弹窗
        loading: false,
        isDetailData: true,
        recommendGoods: [],
        time_count: {
          days: '',
          hours: '',
          minutes: '',
          seconds: ''
        },
        address: {
          data: {
            list: []
          }
        },
        goods: {
          goodsDetails: {},
          radio: '',
          exchange_status: "立即兑换",
          code: 0
        },
        edit_url: ['/static/image/Edit.png', '/static/image/Edit-active.png'],  //编辑icon
        t: '', //定时器
        detailList:{
          title: ['商品详情'],
          des: {
            title: '商品详情',
            tips_title: '重要说明',
            tips_text: '商品兑换请仔细阅读并参照商品详情的“兑换流程”、“注意事项”与“使用有效期”。除商品本身无法正常兑换的情况之外，商品一经兑换，一律不退还积分。',
          },
          record: {
            title: '出价记录',
            status_text: [
              {
                text: '状态',
                class: 'info'
              },
              {
                text: '价格',
                class: 'price'
              },
              {
                text: '时间',
                class: 'time'
              }
            ],
            list_data: []
          },
          AuctionDoc: {
            title: '竞拍说明',
            list: [
              {
                title: '竞拍规则',
                text: '参与竞拍时，您每次出价都会有一定的加价幅度，您在出价时，需实时支付您的出价额度，若您的出价被其他用户超越，您已支付的果子/钻石将会退还到您的账户，您可以重新出价。'
              },
              {
                title: '竞价延时',
                text: '每场竞拍都有预计的结束时间，除非有人一口价拍下商品，否则竞拍不会提前结束。若某场竞拍的“竞价延时”为15分钟（以15分钟为例），在竞拍结束前15分钟内若有人出价，竞拍会在此次出价时间基础上往后延长15分钟/次，依此类推，直到无人出价，倒计时归零时竞拍结束，出价最高的用户成功拍得该商品。',
                image: '/static/image/delay-period-cn.png'
              },
              {
                title: '竞拍成功',
                text: '若商品为实体商品，竞拍成功后，请核对您的收货地址是否正确（若不正确，请及时联系客服处理），我们会在7个工作日内为您发货。若商品为虚拟商品，竞拍成功后，请您在兑换记录中联系客服，确定具体的发放方式与时间。'
              }
            ]
          }
        },
        tabIndex: 0,  //tab切换参数

        count: 0,
        isMore: false,
        params: {
          limit: 20,
          page: 1
        },
        popInfo: {
          loading: false,
          action_id: '',
          address_id: 0,
          info: {
            title: '我的竞价',
            // btn_text: ['在想想', '确定'],
            btn_text: ['确认出价'], // 按钮文字
            price: 0,  // 最小出价
            change_price: 0, //变更价格
            max_price: 0,
            e_type: 1,  //0：果子，1：钻石
          },
          status: 2,   // 1: 一口价弹窗   2: 竞价弹窗   3: 提示弹窗  4: 提醒  5:竞拍成功
          clocksStatus: [], //提醒选择
        },
        finalPrice: '',
        actionPop: false,
        is_refresh: false,
        isLoadingApi: false, // 是否加载完API
      };
    },
    filters: {
      formatMenuTitle(value) {
        if (!value) return '';
        return value.trim().slice(0, 4);
      }
    },
    //监听路由变化
    watch: {
      $route: {
        handler: function (val, oldVal) {
          var id = val.query.id;
          this.loading = true;
          var vueScrollBar = document.getElementById("scrollbar");
          if (vueScrollBar) {
            vueScrollBar.scrollTop = 0;
          }
          this.getApi('/services/exchangeGoods/action_info.php', {action_id: id});
        },
        immediate: true,
        deep: true
      },
      '$store.state.member.info'() {
        var id = this.$route.query.id;
        this.getApi('/services/exchangeGoods/action_info.php', {action_id: id});
      }
    },
    mounted() {
      var vueScrollBar = document.getElementById("scrollbar");
      vueScrollBar.scrollTop = 0;
      this.loading = true;
      this.getRecommends();
    },

    computed: {

      member() {
        return this.$store.state.member;
      },
      myAddrList() {
        if (this.$store.state.address.length > 0) {
          this.address.data.list = this.$store.state.address;
        }
        return this.address.data.list;
      }
    },
    methods: {
      // 关闭弹窗
      closeDialog(type){
        type ? this.confirmBoxVisible = false : this.popInfo.loading = false;
      },

      // 竞拍弹窗返回数据
      getComebackData (res){
        this.actionPop = false;
        // status  1: 一口价弹窗   2: 竞价弹窗   3: 提示弹窗  4: 提醒  5:竞拍成功
        if (res.is_ok == false || res.status && res.status == 4 ) { // is_ok==false 只关掉弹窗 不做交互
          return false;
        } else if (res.refresh){ // 判断是否在竞价弹窗停留30秒，停留30秒刷新数据再弹窗
          this.is_refresh = res.refresh;
          this.getApi('/services/exchangeGoods/action_info.php', {action_id: this.popInfo.action_id});
        } else if ( res.status && res.status == 3) { // 关闭弹窗,更新数据
          this.getApi('/services/exchangeGoods/action_info.php', {action_id: this.popInfo.action_id});
        } else { // 走兑换
          this.popInfo.info.change_price = res.price;
          this.finalPrice = res.price;
          this.upExchange();
        }
      },

      // 判断登陆
      isLogin() {
        if (!this.member.info) {
          this.$root.hub.$emit('showLogin');
        }
      },

      // 推荐商品json 数据
      getRecommends() {
        // 测试环境

        this.axios.get(this.doJson).then(req => {
          if (req.data.code == 200) {
            var newArr = [];
            var arr = req.data.data.goods_list;
            for (var i = 0; i < 4; i++) {
              var index = Math.floor(Math.random() * arr.length);
              newArr.push(arr[index]);
              arr.splice(index, 1);
            }
            this.recommendGoods = newArr;
          }
          this.loading = false;
        });
      },

      // action_info API 接口
      getApi(url, id, btn_status) {
        var _this = this; // 绑定this
        this.api(url, id).then(req => {
          // 清楚定时器
          clearTimeout(_this.t);

          if (req.code == 200) {
            _this.goods.goodsDetails = req.data;
            document.title = req.data.goods_name;


            if (_this.goods.goodsDetails.action_record_list
              && _this.goods.goodsDetails.action_record_list.length > 0
              && _this.member.info
              && _this.goods.goodsDetails.action_record_list[0].member_id == _this.member.info.member_id
              && _this.popInfo.status == 2 && btn_status) {
              _this.$message.warning('您的出价已为当前最高价，无需再次出价');
              // _this.isLoadingApi = false;
            } else if (_this.popInfo.status == 2 && btn_status){
              // 加载完返回成功参数
              _this.popInfo.info.price = _this.goods.goodsDetails.price;
              _this.popInfo.info.change_price = _this.goods.goodsDetails.price;
              _this.popInfo.info.max_price = _this.goods.goodsDetails.max_price;
              _this.popInfo.info.e_type = _this.goods.goodsDetails.e_type;
              _this.popInfo.status = 2;
              _this.popInfo.action_id = _this.goods.goodsDetails.action_id;
              _this.popInfo.address_id = _this.goods.goodsDetails.address_id;
              _this.popInfo.info.title = '我的竞价';
              _this.popInfo.info.btn_text = ['确认出价'];
              _this.actionPop = true;
              // _this.isLoadingApi = true;
              // _this.$root.hub.$emit("actionInfoApiSuccess");
            }


            // 判断竞拍成功商品，在第一次进入详情弹窗
            _this.popInfo.info.goods_type = _this.goods.goodsDetails.goods_type;
            if (_this.goods.goodsDetails.action_type_id == 3
                && _this.goods.goodsDetails.success_member_id != 0
                && _this.member.info.member_id == _this.goods.goodsDetails.success_member_id
                && _this.member.info) {

              var successActionId = localStorage.getItem("successActionId") ?  JSON.parse(localStorage.getItem("successActionId")) : [];
              if (successActionId.length > 0) {
                var temp = [];
                var is_ok = '';
                temp[0] = _this.goods.goodsDetails.action_id;
                for (var i in successActionId) {
                  // 去重
                  if ( temp.indexOf(successActionId[i]) == -1 ){
                    temp.push(successActionId[i]);
                    is_ok += '0';
                  } else {
                    is_ok += '1';
                  }
                }

                console.log(_this.member.info)
                if (is_ok.indexOf('1')){
                    _this.popInfo.status = 5;
                    _this.popInfo.info.title = '恭喜您竞拍成功！';
                    _this.popInfo.info.btn_text = ['去兑换记录查看'];
                    _this.actionPop = true;
                }
                successActionId = temp;

              } else {
                successActionId.push(_this.goods.goodsDetails.action_id);
                _this.popInfo.status = 5;
                _this.popInfo.info.title = '恭喜您竞拍成功！';
                _this.popInfo.info.btn_text = ['去兑换记录查看'];

                _this.actionPop = true;
              }

              localStorage.setItem("successActionId", JSON.stringify(successActionId));

            }

            if (_this.is_refresh == true) {
              _this.is_refresh = false;
              _this.mallDetailPop (_this.goods.goodsDetails.action_id,
                _this.goods.goodsDetails.price,
                _this.goods.goodsDetails.max_price,
                _this.goods.goodsDetails.e_type,
                2, _this.goods.goodsDetails.address_id
              );
            }




            // 竞拍-更换描述
            if (_this.goods.goodsDetails.action_type_id == 3) {
              _this.detailList.title = ['活动描述', '出价记录', '竞拍说明'];
              _this.detailList.des = {
                title: '活动描述',
                tips_title: '友情提示',
                tips_text: '竞拍前请仔细阅读竞拍说明，竞拍成功后，若非商品本身问题，您支付的果子/钻石不予退还。',
              };
            } else {
              _this.tabIndex = 0
              _this.detailList.title = ['商品详情'];
              _this.detailList.des = {
                title: '商品详情',
                tips_title: '重要说明',
                tips_text: '商品兑换请仔细阅读并参照商品详情的“兑换流程”、“注意事项”与“使用有效期”。除商品本身无法正常兑换的情况之外，商品一经兑换，一律不退还积分。',
              };
              _this.detailList.record.list_data = [];
            }

            if (_this.goods.goodsDetails.action_type_id == 2 && _this.goods.goodsDetails.exchange_times > 0 && _this.goods.goodsDetails.start_time * 1000 < Date.now()) {
              _this.goods.exchange_status = req.data.button;
            }






            //倒计时
            var Time;
            var nowTime = Date.now();

            // 判断是否未开始/进行中
            if (_this.goods.goodsDetails.start_time * 1000 > nowTime) {
              Time = _this.goods.goodsDetails.start_time * 1000;
            } else if (_this.goods.goodsDetails.start_time * 1000 < nowTime && _this.goods.goodsDetails.end_time * 1000 > nowTime) {
              Time = _this.goods.goodsDetails.end_time * 1000;
            }

            var newDate;
            var duration;

            // Time = 1551155913 * 1000
            // 秒杀 + 竞拍  倒计时
            if (Time - nowTime > 1000 &&
              (_this.goods.goodsDetails.action_type_id == 2 || (_this.goods.goodsDetails.action_type_id == 3 && _this.goods.goodsDetails.auction_status == 0) )) {
              function countDown(Time) {
                newDate = Date.now();
                duration = moment.duration(moment(Time).diff(newDate));
                var days = parseInt((Time - nowTime)/(1000*60*60*24));
                var _days = days;
                var hours = duration.get('hours');
                var _hours = hours > 9 ? hours : '0' + hours;
                var minutes = duration.get('minutes');
                var _minutes = minutes > 9 ? minutes : '0' + minutes;
                var seconds = duration.get('seconds');
                var _seconds = seconds > 9 ? seconds : '0' + seconds;



                _this.time_count.days = _days;
                _this.time_count.hours = _hours;
                _this.time_count.minutes = _minutes;
                _this.time_count.seconds = _seconds;

                if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
                  setTimeout(function () {
                    _this.$root.hub.$emit('updateBank');
                    _this.getApi('/services/exchangeGoods/action_info.php', {action_id: _this.$route.query.id});
                  }, 1000);
                  return false;
                }

                _this.t = setTimeout(function () {
                  countDown(Time);
                }, 1000);
              }
              countDown(Time);
            }





            _this.loading = false;
          }
        });
      },

      //兑换商品
      upExchange() {
        this.isLogin();
        if (!this.member.info) return;

        var id = this.$route.query.id;
        var that = this;
        var diamondOwn = parseFloat(this.$store.state.member.bank.diamond);
        var fruitOwn = parseInt(this.$store.state.member.bank.guozi1);
        if (this.goods.goodsDetails.e_type == '1') {  // 钻石
          if (diamondOwn < parseInt(this.goods.goodsDetails.price)) {
            this.diamondDialogVisible = true;
          } else {
            this.goods.goodsDetails.action_type_id ==3 ? this.confirmExchange()   : this.confirmBox();
          }
        } else { //果子商品兑换
          if ((fruitOwn) < parseInt(this.goods.goodsDetails.price)) {
            this.fruitDialogVisible = true;
          } else {
            this.goods.goodsDetails.action_type_id ==3 ? this.confirmExchange() : this.confirmBox();
          }
        }
      },

      diamondCharge() {
        this.diamondDialogVisible = false;
        this.$router.push({path: '/recharge/diamond'});
      },

      confirmBox() {
        this.exchangeTableVisible = false;
        this.confirmBoxVisible = true;
      },

      // 地址列表
      updataExchange() {
        this.confirmBoxVisible = false;
        // 根据兑换类型选择弹不弹选择地址    兑换类型：1 虚拟（例如激活码） 2 实体，3：徽章
        // 走弹出地址列表

        if (this.goods.goodsDetails.goods_type == 2) {

          // 根据addr_id 判断是否已经有地址address_id
          this.exchangeTableVisible = true;
          this.api('/services/userCenter/my_address_list.php', {limit: 50}).then(req => {
            if (req.code == 200) {
              this.address.data = req.data;
              for (let i in this.address.data.list) {
                let item = this.address.data.list[i];
                if (item.def_addr == 1) {
                  this.goods.radio = item.addr_id;
                }
              }
              this.popSwitch = true;
            }
          });
        } else {  // 走兑换
          this.postExchange({action_id: this.goods.goodsDetails.action_id});
        }
      },

      // 选择地址 兑换按钮 交互
      confirmExchange() {
        this.confirmBoxVisible = false;
        // 根据兑换类型选择弹不弹选择地址    兑换类型：1 虚拟（例如激活码） 2 实体，3：徽章
        // 走弹出地址列表
        if ( this.goods.goodsDetails.goods_type == 2 ) {

          if (!this.goods.radio && this.goods.goodsDetails.address_id == 0) {
            this.updataExchange ();
            return false;
          } else {
            this.postExchange({address_id: this.goods.radio, action_id: this.goods.goodsDetails.action_id});
            // this.confirmBoxVisible = false;
          }
        }else {
          this.postExchange({action_id: this.goods.goodsDetails.action_id});
          // this.confirmBoxVisible = false;
        }
      },

      //最终兑换
      postExchange(params) {
        if (this.finalPrice != '') {
          params.price = this.finalPrice;
        }

        var id = this.$route.query.id;
        this.api('/services/exchangeGoods/member_exchange.php', params).then(req => {
          this.exchangeTableVisible = false;
          if (req.code == 200) {
            this.exchangeCancel();

            // 竞拍提示弹窗
            if (this.goods.goodsDetails.action_type_id == 3 ) {
              // 提示
              // 一口价竞拍成功
              if (parseInt(this.finalPrice) == parseInt(this.popInfo.info.max_price)) {

                this.popInfo.status = 5;
                this.popInfo.info.title = '恭喜您竞拍成功！';
                this.popInfo.info.btn_text = ['去兑换记录查看'];
              } else {
                // 竞价出价成功
                this.popInfo.status = 3;
                this.popInfo.info.title = '您的出价已成功！';
                this.popInfo.info.btn_text = ['知道了'];
                if (req.data.auction_end_time != 0 ) this.popInfo.info.auction_end_time = req.data.auction_end_time;
              }
              this.popInfo.info.goods_type = this.goods.goodsDetails.goods_type;
              this.finalPrice = '';
              this.actionPop = true;
            } else {
              this.$message.success('商品兑换成功！');
            }

            // 更新数据
            this.$root.hub.$emit('updateBank');
            this.api('/services/exchangeGoods/action_info.php', {action_id: id}).then(req => {
              if (req.code == 200) {
                this.goods.goodsDetails = req.data;
                this.goods.exchange_status = req.data.button;
              }
            });

          }
        });
      },

      exchangeCancel() {
        this.exchangeTableVisible = false;
        this.popSwitch = false;
      },

      //选择收货地址
      chooseAddress(index) {
        let item = this.address.data.list[index];
        this.goods.radio = item.addr_id;
      },

      addCall() {
        this.$root.hub.$emit('showAddress');
      },

      modAddress(detail) {
        this.$root.hub.$emit('modAddress', detail);
      },

      mallScrollEvent(event) {
        if (this.scrollTimeout) return;
        this.scrollTimeout = setTimeout(() => {
          this.scrollTop = event.target.scrollTop;
          this.scrollTimeout = null;
        }, 50);
      },

      // 跳转详情页
      mallDetailLink(action_id, action_type_id) {
        this.$router.push({
          name: 'mall-detail',
          params: {id: 'detail'},
          query: {id: action_id}
        });

      },

      // 竞价弹窗
      mallDetailPop (action_id, price, max_price, e_type, status, address_id) {
        // status  1: 一口价弹窗   2: 竞价弹窗   3: 提示弹窗  4: 提醒  5:竞拍成功
        if (!this.member.info) {
          this.$root.hub.$emit('showLogin'); // 确认登录
        } else {

          // 判断是否领先
          // if (this.goods.goodsDetails.action_record_list
          //   && this.goods.goodsDetails.action_record_list.length > 0
          //   && this.goods.goodsDetails.action_record_list[0].member_id == this.member.info.member_id
          //   && status == 2) {
          //   // 先确定是否是最新价格
          //   // this.isLoadingApi = false;
          //   this.popInfo.status = 2
          //   this.getApi('/services/exchangeGoods/action_info.php', {action_id: action_id}, true);
          //   // this.$root.hub.$on("actionInfoApiSuccess", _ => {
          //   // this.isLoadingApi = false;
          //   // if (this.isLoadingApi == true) {
          //   //   var _this = this;
          //   //   setTimeout(function () {
          //   //     _this.isLoadingApi = false;
          //   //   // this.$root.hub.$on("actionInfoApiSuccess", _ => {
          //   //     _this.$message.warning('您的出价已为当前最高价，无需再次出价');
          //   //   // });
          //   //
          //   //   }, 400);
          //   // }
          // } else {
            this.popInfo.info.price = price;
            this.popInfo.info.change_price = price;
            this.popInfo.info.max_price = max_price;
            this.popInfo.info.e_type = e_type;
            this.popInfo.status = status;
            this.popInfo.action_id = action_id;
            this.popInfo.address_id = address_id;

            if (status == 1) {
              this.popInfo.info.title = '';
              this.popInfo.info.btn_text = ['在想想', '确定'];
              this.actionPop = true;
            } else if (status == 2) {
              // 先确定是否是最新价格
              this.popInfo.status = 2
              this.getApi('/services/exchangeGoods/action_info.php', {action_id: action_id}, true);
              // this.$root.hub.$on("actionInfoApiSuccess", _ => {
              // if (this.isLoadingApi == true) {
              //   this.$root.hub.$on("actionInfoApiSuccess", _ => {
              //   // setTimeout(function () {
              //   //   this.isLoadingApi = false;
              //     this.popInfo.info.title = '我的竞价';
              //     this.popInfo.info.btn_text = ['确认出价'];
              //     this.actionPop = true;
              //
              //   // }, 400);
              //   });
              // }

            } else if (status == 4) {
              this.popInfo.info.title = '请选择需要提醒的事项';
              this.popInfo.info.btn_text = ['确认'];
              this.getRemindMeApi(action_id);
            }
          // }
        }
      },

      // 提醒数据
      getRemindMeApi(action_id){
        this.api('/services/exchangeGoods/remind_me_info.php', {action_id: action_id}).then(res => {
          if (res.code == 200) {
            if (res.data.remind_start_time == 1) this.popInfo.clocksStatus.push (0);
            if (res.data.remind_end_time == 1) this.popInfo.clocksStatus.push (1);
            if (res.data.remind_for_overtaken == 1) this.popInfo.clocksStatus.push (2);
            this.actionPop = true;
          }
        });
      },

      // tab 切换
      toggleTabs (index, action_id) {
        this.params.page = 1; // 出价记录初始
        this.isDetailData = true;
        this.isMore = false;
        // 出价记录处理
        if (index == 1) {
          this.tabIndex = index;
          this.getRecordApi(action_id)
        } else {
          this.tabIndex = index
        }
      },

      // 获取竞拍记录
      getRecordApi (action_id) {

        var params = {
          action_id: action_id,
          page: this.params.page,
        };
        var _this = this;
        this.api('/services/exchangeGoods/action_record_list.php', params).then(req => {
          if (req.code == 200) {

            if (req.data.list && req.data.list.length == 0 ) {
              if (_this.params.page == 1){
                _this.isDetailData = true
              } else {
                _this.isMore = false;
              }
            } else {
              if (_this.params.page != 1) {
                var dataList = _this.detailList.record.list_data.list;
                dataList = dataList.concat(req.data.list);
                _this.detailList.record.list_data.list = dataList;
              } else {
                _this.detailList.record.list_data = req.data;
              }
              _this.isDetailData = false;
              _this.isMore = true;
              _this.params.page ++;
            }
          }
        });
      },

      // 加载更多
      isDetailMore () {
        this.getRecordApi(this.goods.goodsDetails.action_id);
      }
    }
  };
</script>

<style lang="stylus">
  body {
    background #FCFCFD
  }

  // 图片弹窗
  .viewer-canvas {
    img {
      background #fff
      padding 0 12px
    }
  }

  #mall-detail-container {
    .top-container {
      width 100%
      background #fff
      box-shadow 0 4px 20px -10px rgba(0, 0, 0, 0.08)
      margin-bottom 20px
      .mall-top {
        padding 20px 0
        margin 0 auto
        max-width 1020px

        .detail-top-in {
          overflow hidden

          .left {
            width 362px
            height 362px
            margin-right 22px
            float left
            border-radius 8px
            border 1px solid rgba(0, 0, 0, 0.04)
            overflow hidden

            .mobile-miaosha {
              display: none;
            }
            > img {
              width 100%
            }
          }
          .right {
            display block
            width calc(100% - 398px)
            margin 4px 0 0 384px

            .goods-cont {
              position relative
              padding-right 54px
              height 356px

              .property {
                display flex
                align-items center

                .category {
                  display: inline-block;
                  background: #F2F4F7;
                  border-radius: 8px;
                  font-size: 12px;
                  color: #818899;
                  margin-left: 8px;
                  line-height: 22px;
                  padding 0 6px
                  text-align: center;
                }
              }
              .name {
                font-size: 20px;
                font-weight: bold;
                color: #2D2F33;
                margin: 6px 0 3px 0;
                line-height: 28px;

              }
              .storage-time {
                font-size: 13px;
                font-weight: 400;
                color: #A8ABB3;
                line-height: 18px;
                margin-bottom: 5px;

                .miaoshaStorage {
                  color: #FF5C69;
                }
                .seperate {
                  margin: 0 12px;
                  width: 1px;
                  height: 10px;
                  background: #EBEBED;
                  display: inline-block;
                }
              }
              .mobile-storage {
                display: none;
              }
              // 秒杀
              .model-container {
                border-radius 8px
                box-shadow 0 5px 16px -4px rgba(37, 0, 127, 0.06)

                .func-show {
                  color #fff
                  border-top-right-radius 8px
                  border-top-left-radius 8px
                  width 100%
                  height 40px
                  position relative

                  .pic {
                    display block
                    float left
                    width 112px
                    height 40px
                  }
                  .sale {
                    position absolute
                    bottom 0
                    right 3px
                    width 112px
                    height 31px
                  }
                  .text {
                    margin-left 122px
                    > p {
                      width calc(100% - 10px)
                      line-height 40px
                    }
                    .start {
                      position relative
                      font-size 14px

                      .start-time {
                        display flex
                        position absolute
                        right 0
                        top 0

                        .num {
                          display inline-block
                          vertical-align middle
                          text-align center
                          width 26px
                          height 22px
                          line-height 22px
                          color #8949FF
                          background #fff
                          box-shadow 0 6px 9px -2px rgba(59, 0, 134, 0.06)
                          border-radius 3px
                          font-size 16px
                          font-weight bold
                          margin 0 5px
                          font-family D-DINExp-Bold
                        }
                      }
                    }
                  }
                }
              }

              .miaosha-container {
                &.before {
                  .func-show {
                    background linear-gradient(90deg, #5751FF 0%, #A245FF 100%)
                  }
                }
                &.start {
                  .func-show {
                    background linear-gradient(90deg, #FA3E57 0%, #FA4B97 100%)
                  }
                }
              }

              // 竞拍
              .auction-container {
                border-radius 8px
                box-shadow 0 5px 16px -4px rgba(37, 0, 127, 0.06)

                .func-show {
                  background linear-gradient(90deg, rgba(255, 54, 54, 1) 0%, rgba(255, 91, 59, 1) 28%, rgba(255, 114, 71, 1) 100%)


                  .text {
                    margin-left 14px

                    .start {
                      .start-time {
                        .num {
                          color #FF6942
                        }
                      }
                    }

                  }
                }

                .price-show {
                  position relative
                  p {
                    font-size 13px
                    color #FF6942
                  }
                  >p {
                    display block
                  }
                  .all {
                    >p {
                      display none
                    }
                  }
                  .clock {
                    position absolute
                    top 50%
                    right 20px
                    transform translate(0, -50%)
                    width 86px
                    height 30px
                    border 1px solid #FF6942
                    border-radius 15px
                    line-height 30px
                    display flex
                    cursor pointer

                    img {
                      display block
                      width 24px
                      height 24px
                      margin 3px 3px 3px 12px
                    }
                    span {
                      display block
                      color #FF6942
                      font-size 14px

                    }
                  }

                  &.zuanshi {
                    >p {
                      color #0f8efc
                    }
                    .all {
                      >p {
                        color #0f8efc
                      }
                    }
                  }
                }
              }
              .auction-detail {
                margin-top 14px
                overflow hidden

                .item {
                  padding 0 10px
                  position relative
                  width calc((100% - 12px)/2)
                  float left

                  &:nth-of-type(2n) {
                    margin-left 12px
                  }

                  &.in {
                    margin-bottom 4px
                  }

                  &.max-price-none {
                    visibility hidden
                  }

                  .model-card {
                    line-height 20px
                    color #656973
                    font-size 12px
                    padding 6px
                    border-bottom 1px dashed #EBEBED

                    &.in {
                      border-bottom none
                      color #FF6942

                      .num {
                        font-weight bold
                      }
                    }

                    span, svg, img {
                      vertical-align middle
                      display inline-block
                    }

                    img {
                      width 20px
                      height 20px
                    }

                    svg {
                      margin-bottom -3px
                    }
                  }

                  .bj {
                    position absolute
                    top 0
                    bottom 0
                    left 0
                    right 0
                    width 100%
                    height 100%
                    background #FF6942
                    opacity .06
                    border-radius 16px
                    border-bottom 0
                  }
                }

              }
              // 普通
              .ordinary-container {
                background #FAFAFA
                border-radius 8px

                .storage-time {
                  display none
                }
              }

              // 公用价格小模块
              .price-show {
                padding 7px 14px
                .all {
                  display flex
                  line-height 30px
                  .price {
                    color #FF8863
                    font-size 28px
                    font-weight bold

                    svg {
                      width 20px
                      height 20px
                    }

                    &.zuanshi {
                      span {
                        color #0F8EFC
                      }
                    }
                  }
                  .mark {
                    color #A8ABB3
                    margin-left 12px
                    font-size 14px
                    .line {
                      padding-left 3px
                      text-decoration line-through
                    }
                  }
                }
              }

              .price-wrap {
                .price-wrap-in {
                  background: rgba(250, 250, 250, 1);
                  border-radius: 0.148148rem;
                  display: flex;
                  align-items: center;
                  height: 0.925925rem;
                  &.miaosha {
                    background: rgba(255, 255, 255, 1);
                    box-shadow: 0 5px 16px -4px rgba(37, 0, 127, 0.06);
                    border-radius: 8px;
                  }
                  .price-wrap-inner {
                    display: flex;
                    align-items: center;
                    padding-left: 0.222222rem;
                    .icon {
                      width: 20px;
                      height: 20px;
                      margin-right: 4px;
                      vertical-align: 0em;
                    }
                    .price {
                      font-size: 0.518519rem;
                      font-family: D-DINExp-Bold;
                      font-weight: bold;
                      color: rgba(255, 105, 66, 1);
                      margin-right: 2px;
                    }
                    .mobile-time {
                      display: none;
                    }
                    .original-price {
                      display: inline-block;
                      font-size: 0.259259rem;
                      font-weight: 400;
                      color: rgba(168, 171, 179, 1);
                      line-height: 0.37037rem;
                      margin-left: 10px;
                      > span:nth-child(1) {
                        margin-right: 2px;
                      }
                    }

                  }
                }

              }

              .exchange-btn {
                position absolute
                bottom 0

                .now-exchange-btn {
                  min-width 204px
                  height 44px
                  border-radius 24px
                  font-size 16px
                  color #fff
                  border none

                  &.miaosha-over, &.miaosha-before-start {
                    background #D2D4D9
                  }

                  &.miaosha-pro {
                    background linear-gradient(90deg, #FF4C6A 0%, #FF6B89 100%)
                  }

                  &.is-disabled {
                    background #d2d4d9
                  }
                }

                .auction-btn {
                  .auction-pro {
                    &:first-child {
                      background linear-gradient(90deg, rgba(255, 130, 76, 1) 0%, rgba(255, 188, 112, 1) 100%)


                      &:hover {
                        box-shadow 0px 8px 22px -8px rgba(255,139,61,0.6)
                      }
                    }
                    &:last-child {
                      background linear-gradient(90deg, rgba(255, 82, 82, 1) 0%, rgba(255, 114, 71, 1) 100%)

                      &:hover {
                        box-shadow 0px 8px 22px -8px rgba(255,139,61,0.6)
                      }
                    }
                  }
                  .el-button {
                    img {
                      display initial
                      vertical-align middle
                      width 20px
                      height 20px
                      margin-top -4px
                    }
                  }
                }
              }

            }
          }
        }
        .mobile-miaosha {
          display: none;
        }
      }
    }

    .detail-bottom {
      width: 1020px;
      margin: 0 auto;
      padding 0 15px
      overflow hidden

      .left {
        width: calc(100% - 350px);
        margin: 0 20px 20px 0;
        box-shadow: 0 5px 20px -6px rgba(0, 0, 0, 0.04);
        border-radius: 6px;
        padding: 16px 24px;
        // padding-bottom 60px
        background #fff
        float left
        min-height 530px

        .tab-nav {
          padding 0 4px

          ul {
            overflow hidden
            border-bottom 1px dashed #F5F6F7

            li {
              float left
              font-size 20px
              line-height 28px
              color #656973
              padding 0 4px 12px
              margin-right 22px
              cursor pointer
            }
          }
        }


        .tab-content {
          .record {
            margin-top 19px
            // 公用
            .no-data {
              min-height 430px
              position relative

              p {
                position absolute
                top 40%
                width 100%
                text-align center
                font-size 16px
                color #A8ABB3
              }
            }
            li {
              margin-bottom 6px
              color #B3B3B3

              > div {
                display inline-block
                text-align center

                &.info {
                  width 40%
                  text-align left
                }
                &.price {
                  width 24%
                }
                &.time {
                  width 34%

                }
              }
            }

            .record-thead {
              li {
                line-height 26px
                background #FCF9FC
                border-radius 13px
                font-size 14px
                font-weight bold
                .info {
                  padding-left 36px
                }

                &.in {
                  .info {
                    padding-left 20px
                  }
                }
              }
            }
            .record-tbody {
              li {
                line-height 20px
                padding 7px 0
                background #FAFAFA
                border-radius 16px
                font-size 14px

                .info {
                  position relative

                  .success {
                    display inline-block
                    width 16px
                    height 16px
                    line-height 16px
                    text-align center
                    vertical-align middle
                    background #FF6942
                    border-radius 50%

                    svg {
                      width 12px
                      fill #fff
                    }
                  }
                  .avatar {
                    position absolute
                    top 50%
                    left 8px
                    transform translate(0, -50%)
                    width 20px
                    height 20px
                    border-radius 50%
                    overflow hidden

                    img {
                      width 100%
                    }
                  }
                  .mark {
                    position absolute
                    top 50%
                    left -8px
                    transform translate(0, -50%)
                    width 18px
                    height 18px
                    text-align center
                    line-height 17px
                    border-radius 50%
                    overflow hidden
                    background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%);
                    box-shadow 0 5px 6px -3px rgba(255,85,66,0.32)
                    font-size 11px
                    font-weight bold
                    color #fff
                  }
                  .status {
                     margin-left 20px
                  }
                  .nickname {
                    margin-left 36px
                    line-height 20px
                  }
                }
                .price {

                  span, svg, img {
                    vertical-align middle
                    display inline-block
                  }
                  svg {
                    // margin-bottom -3px
                  }
                  img {
                    width 20px
                    height 20px
                  }

                }
                .time {

                }
                &.in {
                  color #FF6942
                  font-weight bold
                  background #fef7f7

                  .info {

                  }
                }
              }
            }
          }
          /*竞拍说明样式*/
          .auction-doc {
            .title {
              >p {
                text-align: center;
                font-size: 17px;
                font-weight: 400;
                margin-right: 30px;
              }
            }

            ul {
              margin: 15px 0;
              li {
                padding-bottom: 12px;
                border-bottom: 1px dashed #EBEBED;
                margin-bottom: 12px;

                &:last-child {
                  padding-bottom: 0;
                  border-bottom: none;
                }

                .title {
                  height: 20px;
                  line-height: 20px;
                  font-size: 14px;
                  font-weight: bold;
                  color: #2D2F33;
                  margin-bottom: 6px;
                  position: relative;

                  i {
                    display: block;
                    position: absolute;
                    width: 4px;
                    height: 12px;
                    top: 50%;
                    left: 0;
                    transform: translate(0, -50%);
                  }
                }
                .text {
                  line-height: 24px;
                  font-size: 14px;
                  color: #656973;
                }
                .pic {
                  img {
                    width 100%
                    max-width 494px
                  }
                }
              }
            }

            /*颜色*/
            .orange {
              background: #FF6942;
            }

          }
        }

        .explain {
          padding: 16px 8px;
          font-size: 15px;
          color: #2D2F33;
          line-height: 26px;
          word-wrap: break-word;

        }
        .important-explain {
          padding: 10px 16px;
          height auto
          background: #FCFAF5;
          border-radius: 8px;

          > span:nth-child(1) {
            font-size: 14px;
            font-weight: bold;
            color: #FF8863;
            line-height: 20px;
            display: inline-block;
            margin-bottom 8px
          }
          > span:nth-child(2) {
            font-size: 14px;
            font-family: PingFangSC-Regular;
            color: #737373;
            line-height: 22px;
            display: inline-block;
          }
        }

        // 加载更多
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
            // border 1px solid #E7EDF1
            // box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
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

      .right {
        width: 330px;
        border-radius: 6px;
        box-shadow: 0 5px 20px -6px rgba(0, 0, 0, 0.04);
        padding: 0 14px
        margin-bottom 20px
        float left
        background #fff


        .recommend-container {
          padding 4px 0
          .recommend-detail {
            cursor: pointer;
            padding 8px 0
            border-bottom: 1px dotted #EBEBED;

            .goods {
              .goods-pic-wrap {
                width: 90px;
                height: 90px;
                float: left;
                border-radius 6px
                margin-right: 10px;
                overflow hidden

                > img {
                  width: 100%;
                }
              }
              .goods-desc {
                display: flex;
                flex-direction: column;
                padding-top: 3px;

                .name {
                  font-size: 14px;
                  font-weight: blod;
                  color: #2D2F33;
                  white-space nowrap
                  overflow hidden
                  text-overflow ellipsis
                  line-height: 20px;
                }
                .storage {
                  font-size: 12px;
                  font-weight: normal;
                  line-height: 17px;
                  color: #A8ABB3;
                  margin 1px 0 4px
                  &.miaosha {
                    color: #fa6e8a;
                  }
                }
                .category {
                  display: flex;
                  align-items: center;
                  margin-bottom: 7px;
                  .icon {
                    width: 36px;
                    height: 20px;
                    margin-right: 6px;
                  }
                  > span {
                    border-radius: 8px;
                    font-size: 11px;
                    color: #818899;
                    line-height: 18px;
                    padding: 1px 6px;
                    margin-right: 4px;
                    text-align: center;
                  }

                  > span:nth-child(2) {
                    background: rgba(242, 244, 247, 1);
                  }

                  > span:nth-child(3) {
                    border: 1px solid rgba(140, 54, 245, 1);
                    color: rgba(140, 54, 245, 1);
                    &.miaoshaStart {
                      color: rgba(250, 68, 117, 1);
                      border: 1px solid rgba(250, 68, 117, 1);
                    }
                  }
                }
                .price-wrap {
                  .icon {
                    width: 16px;
                    height: 16px;
                    margin-bottom -3px
                  }
                  .price {
                    font-size: 17px;
                    font-family: D-DINExp-Bold;
                    font-weight: bold;
                    color: #FF8863;
                  }
                }
              }
            }

            &:last-child {
              border-bottom 0
            }
          }
        }

      }



      // 详情-tab
      .active {
        color #2D2F33
        font-weight bold
        position relative

        .bj {
          position absolute
          height 3px
          width 60px
          background #0D8DFC
          bottom 0
          left 50%
          transform translate(-50%, 0)
        }
      }


      // 推荐商品
      .recommend {
        line-height: 40px;
        border-bottom: 1px solid #F0F1F2;

        > span:nth-child(1) {
          width: 4px;
          height: 12px;
          background: #0D8DFC;
          display: inline-block;
          margin-right: 5px;
        }
        > span:nth-child(2) {
          font-size: 15px;
          font-weight: bold;
          color: #2D2F33;
          line-height: 40px;
        }
      }

      // 颜色处理
      &.auction {
        .active {
          .bj {
            background #FF6942
          }
        }
        .recommend {
          > span:nth-child(1) {
            background: #FF6942;
          }
        }
      }

    }

    .mobile-btn {
      display: none;
    }

    .pop-shopping-addr {
      .el-dialog {
        width 360px
        height 400px
        left: calc(50% - 180px)
        transform: none !important

        .el-dialog__header {
          text-align left
          line-height: 40px;
          width: 100%;
          background: #0D8DFC;
          border-radius: 4px 4px 0 0;

          .el-dialog__headerbtn {
            margin-top: 10px;
          }
          .el-dialog__title {
            font-weight: bold;
            color: #fff;
            font-size: 16px;
          }
          .el-dialog__headerbtn .el-dialog__close {
            z-index: 999
            color #fff
          }
        }
        .el-dialog__body {
          padding 20px 0
          .scrollbar {
            height 270px
          }
          .addr-select {
            margin 0 20px
            width calc(100% - 40px)
            .row {
              box-sizing: border-box
              width: 100%;
              height: 58px;
              border-radius: 8px;
              border: 1px solid #F0F1F2;
              cursor: pointer;
              margin-top 10px
              > div {
                height 58px
                position relative

                .bj {
                  position absolute
                  top 0
                  bottom 0
                  right 0
                  left 0
                  width 100%
                  height 100%
                  background none
                }

              }
              &.active {
                border: 1px solid #0D8DFC;
                .bj {
                  background rgba(13, 141, 252, 0.06)
                }
                .left {
                  border-right: 1px solid #0D8DFC;
                }
              }
              &:hover {
                background #f7f8fa
              }
              .left {
                height 56px
                width calc(100% - 40px)
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding 10px 14px
                border-right: 1px solid #F0F1F2;

                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                .default-sign {
                  background: linear-gradient(135deg, rgba(13, 126, 255, 1) 0%, rgba(15, 151, 255, 1) 100%);
                  border-radius 20px
                  font-size: 14px;
                  font-weight: bold;
                  line-height: 20px;
                  padding 0 6px
                  display inline-block
                  text-align center
                  color #fff
                }
                .name, .mobile {
                  font-size: 14px;
                  font-weight: bold;
                  font-family: "Microsoft YaHei", "TradeGothicLT-Bold", "PingFang SC", 'Source Han Sans CN', sans-serif;
                  color: #2D2F33;
                }
                .addr {
                  font-size: 11px;
                  font-weight: normal;
                  color: #656973;
                  line-height: 16px;

                  &.addr2 {
                    display inline block
                  }
                }
              }
              .right {
                position: absolute;
                right: 10px;
                top: 50%;
                transform translate(0, -50%)
                cursor: pointer;

                img {
                  width 20px
                  height 20px
                }
              }
              .name, .mobile {
                margin-right 5px
              }
            }
          }
          .tip {
            text-align center
            margin-top: 30px;
            color: #bbb;
          }
          .add-btn {
            cursor: pointer;
            display: flex;
            align-items: center;
            width: 100%;
            line-height: 40px;
            padding-left: 14px;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #f0f1f2;
            font-size: 14px;
            color #A8ABB3

            > img {
              width: 16px;
              height: 16px;
              margin-right: 8px;
            }
          }
          .btn-box {
            height 70px
            text-align center
            position relative

            button {
              position absolute
              top 50%
              transform translate(0, -50%)
              width: 110px;
              height: 34px;
              line-height: 34px;

              span {
                display block
              }
            }

            .el-button {
              background: rgba(13, 141, 252, 1);
              border-radius: 24px;
              font-size: 14px;
              font-weight: normal;
              border 1px solid #0D8DFC
              font-family: "Microsoft YaHei", "TradeGothicLT-Bold", "PingFang SC", 'Source Han Sans CN', sans-serif;
            }
            .exchange {
              left 50px
            }
            .cancel {
              right 50px
              background #fff
              color: rgba(101, 105, 115, 1);
              border 1px solid #EBEBED
              &:hover {
                box-shadow 0 1px 4px 0 rgba(150, 150, 150, .4)
              }
            }
          }

        }

      }
    }

    .confirmBox {
      .el-dialog {
        width: 360px;
        height: 170px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.03);
        border-radius: 4px;
        position: relative;

        .el-dialog__header {
          display: none;
        }
        .pop-close {
          position: absolute;
          width: 16px;
          height: 16px;
          right: 12px;
          top: 12px;
          cursor: pointer;
        }
        .el-dialog__body {
          padding: 58px 25px 28px;
          > div {
            text-align: center;
            font-size: 16px;
            font-weight: 400;
            color: rgba(45, 47, 51, 1);
            line-height: 22px;
            .icon {
              width: 20px;
              height: 20px;
            }
            .price {
              font-size: 18px;
              font-family: D-DINExp-Bold;
              font-weight: bold;
              color: #ff8863;
              margin: 0px 4px;
            }
          }
        }
        .el-dialog__footer {
          text-align: center
          margin-bottom: 16px;
          .dialog-footer {
            .el-button {
              width: 130px;
              height: 34px;
              font-size: 13px;
              line-height: 34px;
              border-radius: 18px;
            }
            .el-button:nth-child(1) {
              color: rgba(101, 105, 115, 1);
              border: 1px solid rgba(235, 235, 237, 1);
              &:hover {
                box-shadow: 0 2px 4px 2px rgba(235, 235, 237, 1);
              }
            }
          }
        }
      }
    }

    .fruit-warning, .diamond-warning {
      .el-dialog {
        width: 280px;
        height: 170px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.03);
        border-radius: 4px;
        text-align: center;
        position: realtive;
        .pop-close {
          position: absolute;
          width: 16px;
          height: 16px;
          right: 12px;
          top: 12px;
          cursor: pointer;
        }
        .el-dialog__header {
          display: none;
        }
        .el-dialog__body {
          padding: 40px 20px 10px;
          > div:nth-child(2) {
            font-size: 16px;
            font-weight: 400;
            color: rgba(45, 47, 51, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            .icon {
              width: 20px;
              height: 20px;
              margin-right: 10px;
            }
          }
          > div:nth-child(3) {
            font-size: 14px;
            font-weight: 400;
            color: rgba(101, 105, 115, 1);
            line-height: 20px;
            .price {
              color: #FF6942
              margin-left: 6px;
            }
            .icon {
              width: 16px;
              height: 16px;
            }
          }
        }
        .el-dialog__footer {
          padding: 20px 20px 15px;
          text-align: center;
          .el-button {
            width: 160px;
            height: 34px;
            background: rgba(13, 141, 252, 1);
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: rgba(255, 255, 255, 1);
          }
        }
      }
    }

    .diamond-warning {
      .el-dialog {
        width: 300px;
        .el-dialog__body {
          > div {
            .diamond-price {
              color: #0D8DFC;
            }
          }
        }
        .el-dialog__footer {
          .el-button {
            width: 110px;
            height: 34px;
            border-radius: 20px;
          }
          .el-button:nth-child(1) {
            background: none;
            border: 1px solid rgba(235, 235, 237, 1);
            font-size: 13px;
            font-weight: 400;
            color: rgba(101, 105, 115, 1);
            line-height: 18px;
            &:hover {
              box-shadow: 0 2px 4px 2px rgba(235, 235, 237, 1);
            }
          }
        }
      }
    }



  }

  @import '../../static/css/mobile.styl'
</style>
