<template>
  <div id="mall">
    <div class="goods-menu container-mall"
         :class="{'show-more': isDownMenu, 'show-mm': isDownMenu && goods.typeList.length > 17}">
      <div class="title fix-bold-font head">
        <div class="left"><span class="text1"></span><span class="text2" @click="navHandle(0)">兑换商城</span></div>
        <div class="right-nav">
          <div class="nav-item left" :class="{active: leftNav.curr == 3}" @click="navHandle(3)">
            <lfl-icon :icon="leftNav.list[3].icon"></lfl-icon>
            <span class="name">{{leftNav.list[3].label}}</span>
          </div>
          <div class="nav-item left" :class="{active: leftNav.curr == 2}" @click="navHandle(2)">
            <lfl-icon :icon="leftNav.list[2].icon"></lfl-icon>
            <span class="name">{{leftNav.list[2].label}}</span>
          </div>
          <div class="nav-item right" :class="{active: leftNav.curr == 1}" @click="navHandle(1)">
            <lfl-icon :icon="leftNav.list[1].icon"></lfl-icon>
            <span class="name">{{leftNav.list[1].label}}</span>
          </div>

        </div>
      </div>
      <div class="left-list">
        <div class="goods-item" @click="selectRecommendGoods()" :class="{'active': selectGoods.curr==999 }">
          <div class="inner-wrap">
            <div class="icon-wrap recommend">
              <img src="/static/image/recommend_icon.png" class="default-menu-pic"/>
            </div>
            <div class="title">推荐商品</div>
          </div>
        </div>
        <div class="goods-item" v-for="(item, index) in goods.typeList" :key="item.id"
             @click="selectTypeGoods(item, index)" :class="{active: selectGoods.curr==item.id}">
          <div class="inner-wrap">
            <div class="icon-wrap">
              <img :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_245,w_245,limit_0' :'/static/image/shopmall.png'" class="default-menu-pic" :class="{'menu-icon': item.image_url != ''}"/>
            </div>
            <div class="title">{{ item.category_name | formatMenuTitle }}</div>
          </div>
        </div>
      </div>
      <div class="more" v-show="goods.typeList.length > 99" @click="downMenuHandle()">
        <div class="icon-wrap">
          <lfl-icon :icon="'more'" class="more-icon"></lfl-icon>
        </div>
        <div class="title">更多</div>
      </div>
    </div>
    <div id="mall-wrap" class="container-mall">
      <div class="main">
        <div class="body" :class="{addr:leftNav.curr == 2}">
          <!--兑换-->
          <div class="exchange-page" v-show="leftNav.curr == 0 && goodsCount" v-loading="loading"
               element-loading-text="拼命加载中">
            <div class="top">
              <span class="key">{{ goods.type | formatMenuTitle }}</span>
              <div class="select" v-show="typeGoodsList.length > 0 &&this.goods.type!='推荐商品'">
                <div v-for="(item, index) in goods.sortMenu" @click="goodsSortHandle(index)">
                  <span>{{ item.name }}</span>
                  <lfl-icon :icon="'sort'" class="" :class="{'show': index != goods.sortIndex}"></lfl-icon>
                  <lfl-icon :icon="'sort-desc'"
                            :class="{'show': index == goods.sortIndex, 'desc': goods.selectParams.order_by == 'desc'}"></lfl-icon>
                </div>
              </div>
            </div>
            <ul class="goods-list" >
              <li class="goods-wrap" v-for="(item,index) in filterTypeGoodsList" :key="index" @click="mallDetailLink(item.action_id)">
                <div class="goods">
                  <div class="goods-pic-wrap">
                    <img class="default-pic" :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_245,w_245,limit_0' : '/static/image/default-goods-pic.jpg'"/>
                    <div class="goods-lable">
                      <img class="lable-pic" src="/static/image/entity.png" v-if="item.type == 2"/>
                      <img class="lable-pic" src="/static/image/_xuni.png" v-else/>
                    </div>
                    <section v-if="item.action_type_id == 2">
                      <div class="miaosha beg-over" v-if="item.start_time*1000>Date.now()">
                        <img src="/static/image/miaosha.png">
                        <span class="text"> {{moment(item.start_time * 1000).format("MM月DD日 HH:mm")}} 开抢</span>
                      </div>
                      <div class="miaosha pro"
                           v-else-if="item.exchange_times>0&&item.start_time*1000<Date.now()&&item.end_time*1000>Date.now()">
                        <img src="/static/image/miaosha-small.png"/>
                        <span class="text">秒杀进行中</span>
                      </div>
                      <div class="miaosha beg-over" v-else-if="item.exchange_times<=0">
                        <img src="/static/image/miaosha.png">
                        <span class="text">秒杀已结束</span>
                      </div>
                      <div class="miaosha-mask" v-else="item.exchange_times<=0">已抢光</div>
                    </section>
                    <section v-else-if="item.action_type_id == 3">
                      <div class="auction beg-over" v-if="item.start_time*1000>Date.now()">
                        <span class="text"><span>未开始</span><span>{{moment(item.start_time * 1000).format("MM月DD日 HH:mm")}} 开始</span></span>
                      </div>
                      <div class="auction pro"
                                 v-else-if="item.start_time*1000<Date.now()&&item.end_time*1000>Date.now()">
                      <span class="text"><span>进行中</span><span>{{moment(item.end_time * 1000).format("MM月DD日 HH:mm")}} 结束</span></span>
                    </div>
                    </section>
                  </div>
                  <ul class="goods-cont">
                    <li class="category"><span>{{ item.category_name | formatMenuTitle }}</span>
                      <span v-if="item.action_type_id==2"
                            :class="{miaoshaStart:item.exchange_times>0&&item.start_time*1000<Date.now()&&item.end_time*1000>Date.now()}">限量秒杀</span>
                      <span v-else-if="item.action_type_id==3"
                            class="jingpai">竞拍</span>
                    </li>
                    <li class="goods-title">{{ item.goods_name}}</li>
                    <li class="valid-time auctionStorage" v-if="item.action_type_id==3">
                      <span v-if="item.start_time*1000<Date.now()&&item.end_time*1000>Date.now()">{{item.now_price == 0 ? '起拍价' : '当前价'}}</span>
                      <span v-else="item.start_time*1000<Date.now() || item.now_price == 0">起拍价</span>
                    </li>
                    <li class="valid-time"
                        v-else
                        :class="{'miaoshaStorage':item.action_type_id==2}">
                      <span>剩余:</span>
                      <span>{{item.exchange_times}}件</span>
                    </li>
                    <li class="price-wrap">
                      <section v-if="item.action_type_id==3">
                        <span class="price" style="color:rgba(15,142,252,1)"
                              v-if="item.e_type == '1'">{{item.start_time*1000 < Date.now() && item.end_time*1000 > Date.now() ? ( item.now_price == 0 ? item.starting_price : item.now_price) : item.starting_price}}</span>
                        <span class="price" v-else>{{item.start_time*1000 < Date.now() && item.end_time*1000 > Date.now() ? ( item.now_price == 0 ? item.starting_price : item.now_price) : item.starting_price}}</span>
                      </section>
                      <section v-else>
                        <span class="price" style="color:rgba(15,142,252,1)"
                              v-if="item.e_type == '1'">{{item.price}}</span>
                        <span class="price" v-text="item.price" v-else></span>
                      </section>

                      <lfl-icon :icon="'diamond'" class="zuanshi" v-if="item.e_type == '1'"></lfl-icon>
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                      <span v-show="item.action_type_id==2">原价
                                        <span class="original-price">{{item.original_price}}</span></span>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
            <div class="pagination">
              <el-pagination layout="prev, pager, next" :total="typeGoodsList.length"
                             :current-page.sync="goods.currPageIndex" :page-size="goods.limit"
                             @current-change="goodsCurrentChangeHandle"></el-pagination>
            </div>
          </div>
          <!--兑换记录-->
          <div class="record-page" v-show="leftNav.curr == 1 && member.info && recordCount" v-loading="loading"
               element-loading-text="拼命加载中">
            <div class="top exchange">
              <span class="key">兑换记录</span>
              <a :href="fmlUrl('/direct_messages?youId=-1',member)" target="_blank" class="manager_message_btn"><img
                      src="/static/image/customer-service.png"/><span>联系客服</span></a>
            </div>
            <div class="record-list">
              <div class="record-thead">
                <ul>
                  <li :class="col.class" v-for="(col,index) in exchangeRecord.column" :key="index"><span>{{col.label}}</span></li>
                </ul>
              </div>
              <div class="record-tbody">
                <ul v-for="(item,index) in filterExchangeRecord" :key="index">
                  <li class="info" @click="mallDetailLink(item.action_id)">
                    <div class="avatar">
                      <img :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_40,w_40,limit_0' : '/static/image/avatar.jpg'">
                    </div>
                    <div class="pic">
                      <lfl-icon :icon="'entity-exchange'" class="entity-exchange"
                                v-if="item.good_type == 2"></lfl-icon>
                      <lfl-icon :icon="'virtual-exchange'" class="virtual-exchange" v-else></lfl-icon>
                    </div>
                    <p>{{item.goods_name}}</p>
                  </li>
                  <li class="sort" >
                    <p>
                      {{item.category_name | formatMenuTitle}}
                    </p>
                  </li>
                  <li class="price" >
                    <p>
                      <!--<span class="change-price" v-if="item.e_type == '1'"-->
                            <!--v-text="item.price"></span>-->
                      <!--<span class="change-price" v-text="item.price" v-else></span>-->
                      <span :class="{'zuanshi' : item.e_type == '1'}">{{item.price}}</span>
                      <lfl-icon :icon="'diamond'" class="zuanshi" v-if="item.e_type == '1'"></lfl-icon>
                      <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                    </p>
                    <p>{{item.add_time}}</p>
                  </li>
                  <li class="order" >
                    <p :class="{'cur' : item.order_status == 2 }">{{item.status}}</p>
                  </li>
                  <li class="message">
                    <p :class="{'cur' : !item.member_message }" @click="messageHandle(item)">{{!item.member_message ? '留言' : '查看留言'}}</p>
                  </li>
                </ul>
              </div>
            </div>
            <div class="record-tbody-h5">
              <ul class="detail" v-for="(item, index) in filterExchangeRecord" :key="index" >
                <li>
                  <div class="goods-head">
                    <p class="text-status"><span></span>{{item.status}}</p>
                    <p class="time">{{item.add_time}}</p>
                  </div>
                  <div class="goods">
                    <div class="goods-pic-wrap" @click="mallDetailLink(item.action_id)">
                      <img :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_150,w_150,limit_0' : '/static/image/avatar.jpg'">
                    </div>
                    <ul class="goods-desc">
                      <li class="name" @click="mallDetailLink(item.action_id)">{{item.goods_name}}</li>
                      <li class="category" @click="mallDetailLink(item.action_id)">
                        <lfl-icon :icon="'entity-exchange'" class="entity-exchange" v-if="item.type == 2"></lfl-icon>
                        <lfl-icon :icon="'virtual-exchange'" class="virtual-exchange" v-else></lfl-icon>
                        <span>{{item.category_name | formatMenuTitle}}</span>
                      </li>
                      <li class="price-wrap">
                  <span class="price" style="color:rgba(15,142,252,1);" v-if="item.e_type == '1'"
                        v-text="item.price"></span>
                        <span class="price" v-text="item.price" v-else></span>
                        <lfl-icon :icon="'diamond'" class="zuanshi" v-if="item.e_type == '1'"></lfl-icon>
                        <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                      </li>
                    </ul>
                    <p class="message-btn" :class="{'cur' : !item.member_message }" @click="messageHandle(item)">{{!item.member_message ? '留言' : '查看留言'}}</p>
                  </div>
                </li>
              </ul>
            </div>
            <div class="pagination">
              <el-pagination layout="prev, pager, next" :total="exchangeRecord.count"
                             :current-page.sync="exchangeRecord.currPageIndex" :page-size="exchangeRecord.params.limit"
                             @current-change="recordCurrentChangeHandle"></el-pagination>
            </div>
          </div>
          <!--收货地址-->
          <div class="address-page" v-show="leftNav.curr == 2 && member.info" v-loading="loading"
               element-loading-text="拼命加载中">
            <div class="top">
              <span class="key">兑换地址</span>
            </div>
            <VuePerfectScrollbar class="scrollbar" @ps-scroll-y="mallScrollEvent" @ps-y-reach-end="$emit('scrollDown')">
              <div class="add-list">
                <div class="address-card" v-for="(item, index) in myAddrList" :key="index">
                  <ul class="add-box">
                    <li class="username">
                      <lfl-icon :icon="'user'"></lfl-icon>
                      <span v-text="item.name"></span>
                    </li>
                    <li class="address">
                      <lfl-icon :icon="'user-address'"></lfl-icon>
                      <span>{{ item.addr_name }} {{ item.addr}}</span>
                    </li>
                    <li class="telphone">
                      <lfl-icon :icon="'telphone'"></lfl-icon>
                      <span v-text="item.mobile"></span>
                    </li>
                    <li class="setup">
                      <el-button type="primary" class="set" v-if="item.def_addr == 0" @click="setDefAddr(index)">设置默认
                      </el-button>
                      <el-button type="primary" class="default-addr" v-else>默认地址</el-button>
                      <el-button type="primary" class="mod" @click="modAddressHandle({item:item,index:index})">修改
                      </el-button>
                      <span class="del" @click="delAddressHandle(index)">删除</span>
                    </li>
                  </ul>
                </div>
                <div class="add-wrap" :plain="true" @click="addressHandle()">
                  <div class="add-full">
                    <span class="add1"></span>
                    <span class="add2"></span>
                  </div>
                  <div class="text">新增收货地址</div>
                </div>
              </div>
            </VuePerfectScrollbar>
          </div>
          <!--我的竞拍-->
          <div class="auction-page" v-show="leftNav.curr == 3 && member.info" v-loading="loading" element-loading-text="拼命加载中">
            <div class="top">
              <span class="key">{{ auctionList.title | formatMenuTitle }}</span>
              <div class="tabs">
                <ul>
                  <li :class="{'active': auctionList.params.type == index}"
                          v-for="(item, index) in auctionList.type"
                          @click="myAuctionTabs(index)">
                    <p>{{item}}</p>
                    <div class="bj"></div>
                  </li>
                </ul>
              </div>
            </div>
            <ul class="goods-list" >
              <li class="goods-wrap" v-for="(item,index) in filterTypeAuctionList" :key="index" @click="mallDetailLink(item.action_id)">
                <div class="goods">
                  <div class="goods-pic-wrap">
                    <img class="default-pic" :src="item.image_url ? item.image_url + '?x-oss-process=image/resize,m_fill,h_245,w_245,limit_0' : '/static/image/default-goods-pic.jpg'"/>
                    <div class="goods-lable">
                      <p :class="{'in': parseInt(item.my_price) < parseInt(item.now_price)}" v-if="auctionList.params.type == 0">
                        {{ parseInt(item.my_price) < parseInt(item.now_price) ? '被超越' : '领先' }}
                      </p>
                      <p :class="{'in': parseInt(item.my_price) < parseInt(item.now_price)}" v-else>
                        {{ parseInt(item.my_price) < parseInt(item.now_price) ? '未拍中' : '已拍中' }}
                      </p>
                    </div>
                    <div class="auction-time" :class="{'in': parseInt(item.my_price) < parseInt(item.now_price)}" >
                      <span class="text" v-if="auctionList.params.type == 0">
                        <span>距结束</span>
                        <span><span class="num">{{item.time_count ? item.time_count.days : '0'}}</span>天</span>
                        <span><span class="num">{{item.time_count ? item.time_count.hours : '00'}}</span>时</span>
                        <span><span class="num">{{item.time_count ? item.time_count.minutes : '00'}}</span>分</span>
                        <span><span class="num">{{item.time_count ? item.time_count.seconds : '00'}}</span>秒</span>
                      </span>

                      <span class="text" v-else>已于 {{moment(item.end_time * 1000).format("MM月DD日 HH:mm")}} 结束</span>
                    </div>
                  </div>
                  <ul class="goods-cont">
                    <li class="category">
                      <img src="/static/image/xuni_detail.png" alt="" v-if="item.goods_type == 1">
                      <img src="/static/image/entity_detail.png" alt="" v-if="item.goods_type == 2">
                      <span>{{ item.category_name | formatMenuTitle }}</span>
                    </li>
                    <li class="goods-title">{{ item.goods_name}}</li>
                    <li class="auction-price-wrap">
                      <div class="wrap">
                        <p class="title">我的出价</p>
                        <div class="price" :class="{'blue': item.e_type == '1'}">
                          <span>{{item.my_price}}</span>
                          <lfl-icon :icon="'diamond'" class="zuanshi" v-if="item.e_type == '1'"></lfl-icon>
                          <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                        </div>
                      </div>
                      <div class="wrap" v-if="parseInt(item.my_price) < parseInt(item.now_price)">
                        <p class="title">{{item.auction_status == 1 ? '成交价' : '当前价'}}</p>
                        <div class="price" :class="{'blue': item.e_type == '1'}">
                          <span>{{item.now_price}}</span>
                          <lfl-icon :icon="'diamond'" class="zuanshi" v-if="item.e_type == '1'"></lfl-icon>
                          <lfl-icon :icon="'fruit'" v-else></lfl-icon>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
            <div class="pagination" v-if="auctionsCount">
              <el-pagination layout="prev, pager, next" :total="auctionList.count"
                             :current-page.sync="auctionList.currPageIndex" :page-size="auctionList.params.limit"
                             @current-change="auctionCurrentChangeHandle"></el-pagination>
            </div>
          </div>
          <!-- <lfl-null :text="leftNav.curr == 0 ? '暂无商品' : '暂无数据'"  v-show="(!goodsCount || !member.info) || (!recordCount || !member.info)"></lfl-null> -->
          <lfl-null :text="'暂无商品'" v-show="(!goodsCount)&&leftNav.curr == 0"></lfl-null>
          <lfl-null :text="''" v-show="(!recordCount)&&leftNav.curr == 1"></lfl-null>
          <lfl-null :text="''" v-show="(!member.info)&&leftNav.curr == 2"></lfl-null>
          <lfl-null :text="''" v-show="auctionList.list.length == 0 && leftNav.curr == 3"></lfl-null>
        </div>
      </div>
      <!--留言弹窗-->
      <el-dialog :title="message.title" :visible.sync="dialogMessageVisible" class="message-dialog">
        <div class="message-dialog-main">
          <el-input
                  type="textarea"
                  :rows="8"
                  placeholder="请输入留言"
                  :readonly="message.title == '我的留言'"
                  resize="none"
                  @compositionstart.native="start"
                  @keyup.native="input"
                  @compositionend.native="end"
                  v-model="message.messageText"
                  id="inn"
          >
          </el-input>
          <p class="message-bottom" v-show="message.title == '留言'">
            <el-button @click="sendMessage()" type="primary" class="message-btn"
                       :disabled="message.messageText.length<=0" :class="{active:message.messageText.length>0}">回复
            </el-button>
            <el-button @click="messageCancel()" type="primary" class="message-cancel">取消</el-button>
            <span class="message-limit" :class="{red: message.messageNum >=message.messageLimit}">{{message.messageNum}}/{{message.messageLimit}}</span>
          </p>
        </div>
      </el-dialog>
    </div>
    <lfl-footer></lfl-footer>
  </div>
</template>

<script>
  import ElButton from "../../node_modules/element-ui/packages/button/src/button.vue";
  import moment from 'moment';

  export default {
    components: {ElButton},
    data() {
      return {
        exchangeTableVisible: false,
        dialogTableVisible: false,
        dialogMessageVisible: false,
        popSwitch: false,
        loading: false,
        popLoading: false,
        isMask: false,
        dialogShow: false,
        isDownMenu: false,
        comstart: 0,
        leftNav: {
          curr: '',
          list: [
            {type: 'exchange', icon: 'exchange', label: '兑换'},
            {type: 'exchange-record', icon: 'exchange-record', label: '兑换记录'},
            {type: 'shipping-address', icon: 'shipping-address', label: '兑换地址'},
            {type: 'mall_auction', icon: 'mall_auction', label: '我的竞拍'}
          ]
        },
        message: {
          title: '',
          order_sn: '',
          messageText: '',
          messageLimit: 300,
          inputLock: false,
          maxMessage: false,
          messageNum: 0,
          disabled: true
        },
        goods: {
          sortMenu: [
            {name: '上架时间', index: 0, order_by: ''},
            {name: '兑换价格', index: 1, order_by: ''},
            {name: '剩余数量', index: 2, order_by: ''}
          ],
          sortIndex: 0,
          clickNum: 0,
          limit: 12,
          currPageIndex: 1,
          pageBeginIndex: 0,   // 当前页第一条数据索引
          type: '推荐商品',
          popExChangeAddr: false,
          radio: '',
          selectParams: {
            'category_id': 0,
            'order_key': 'add_time',
            'order_by': 'desc'
          },
          typeList: [],
          typeGoodsList: []
        },
        selectGoods: {
          curr: ''
        },
        auctionList: {
          count: 0, // 我的竞拍总数
          title: '我的竞拍',
          type: ['进行中', '已结束'],
          currPageIndex: 1,
          pageBeginIndex: 0,   // 当前页第一条数据索引
          list: [],
          params: {
            type: 0,
            page: 1,
            limit: 12
          }
        },
        exchangeRecord: {
          url: '/services/exchangeGoods/exchange_list.php',
          count: 0,
          currPageIndex: 1,
          pageBeginIndex: 0,
          column: [
            {label: '商品信息', filed: 'time', class: 'info'},
            {label: '商品类别', filed: 'number', class: 'sort'},
            {label: '兑换时间/价格', filed: 'title', class: 'price'},
            {label: '兑换状态', filed: 'order_id', class: 'order'},
            {label: '留言', filed: '', class: 'message'}
          ],
          params: {
            page: 1,
            limit: 12
          },
          list: []
        },
        address: {
          data: {
            list: []
          }
        },
        scrollSettings: {},
        scrollTop: 0,
        scrollTimeout: null,
      };
    },
    computed: {
      // 定时器
      timeOut: {
        set (val) {
          this.$store.state.timeout.compileTimeout = val;
        },
        get() {
          return this.$store.state.timeout.compileTimeout;
        }
      },
      member() {
        return this.$store.state.member;
      },
      goodsCount() {
        return this.goods.typeGoodsList.length > 0;
      },
      recordCount() {
        return this.exchangeRecord.list.length > 0;
      },
      auctionsCount() {
        return this.auctionList.count > 0;
      },
      addrCount() {
        return this.myAddrList.length > 0;
      },
      // 筛选商品列表
      typeGoodsList() {
        return this.goods.typeGoodsList;
      },
      // 分页分类商品列表
      filterTypeGoodsList() {
        return this.typeGoodsList.slice(this.goods.pageBeginIndex, this.goods.pageBeginIndex + this.goods.limit);
      },
      // 分页分类竞拍列表
      filterTypeAuctionList() {
        return this.auctionList.list;
      },
      // 分页兑换记录列表
      filterExchangeRecord() {
        return this.exchangeRecord.list;
      },
      myAddrList() {

        if (this.$store.state.address.length > 0) {
          this.address.data.list = this.$store.state.address;
        }
        return this.address.data.list;

      }
    },
    methods: {
      // 登陆判断
      isLogin() {
        if (!this.member.info) {
          this.$root.hub.$emit('showLogin');
        }
      },

      // 二级导航
      navHandle(index) {
        if (index == 0) {
          this.selectGoods.curr = 999;
        }
        this.isMask = false;
        this.leftNav.curr = index;

        switch (index) {
          case 0:
            this.getExchangeGoodsList();
            break;
          case 1:
            this.selectGoods.curr = '';
            this.getExchangeRecordList(true);
            break;
          case 2:
            this.selectGoods.curr = '';
            this.getShoppingAddressList();
            break;
          case 3:
            this.selectGoods.curr = '';
            this.getMyAuctionList();
            break;
        }
      },

      // 下拉菜单
      downMenuHandle() {
        this.goods.typeList.length > 8 ? this.isDownMenu = !this.isDownMenu : this.isDownMenu = false;
      },

      // 我的竞拍切换
      myAuctionTabs (type){
        this.auctionList.params.type = type;
        this.getMyAuctionList();
      },

      // 我的竞拍
      getMyAuctionList () {
        this.isLogin();
        if (!this.member.info) return;
        this.loading = true;
        this.api('/services/exchangeGoods/my_auction_list.php', this.auctionList.params).then(req => {
          var _this = this; // 绑定this
          _this.leftNav.curr = 3;
          if (req.code == 200) {
            var newArr = [];
            var arr = req.data.list;
            for (var i = 0; i < arr.length; i++) {
              newArr.push(arr[i]);
            }

            _this.auctionList.currPageIndex = _this.auctionList.params.page;
            _this.auctionList.list = newArr;
            _this.auctionList.count = req.data.count;

            if (_this.auctionList.params.type == 0 && _this.auctionList.list.length > 0){
              _this.getListIng();
            }
          }
          this.loading = false;
        }).catch(err => {
          this.leftNav.curr = 0;
        });
      },

      // 定时器
      getListIng() {
        if ( this.leftNav.curr == 3) {
          let _this = this;
          let  new_arr = [];
          for (var i=0; i<this.auctionList.list.length; i++) {
            var Time = this.auctionList.list[i].end_time * 1000;
            var nowTime = Date.now();
            if (Time - nowTime > 1000 ) {
              var time_count = {};
              var newDate;
              var duration;
              var nowTime = Date.now();
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

              // 倒计时为0时 刷新列表
              if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
                _this.getMyAuctionList ()
              } else {
                time_count.days = _days;
                time_count.hours = _hours;
                time_count.minutes = _minutes;
                time_count.seconds = _seconds;
                _this.auctionList.list[i].time_count = time_count;
              }
            }
            new_arr.push(this.auctionList.list[i]);
          }
          this.auctionList.list = new_arr;
          this.timeOut = setTimeout(() => {
            _this.getListIng();
          }, 1000);
        } else {
          this.timeOut = '';
        }
      },

      // 商城商品
      getExchangeGoodsList() {
        this.loading = true;
        this.goods.type = '推荐商品';

        this.axios.get(this.doJson).then(req => {
          if (req.data.code == 200) {
            this.goods.currPageIndex = 1;
            this.goods.typeList = req.data.data.category_list;
            this.goods.typeGoodsList = req.data.data.goods_list;
          }
          this.loading = false;
        });
      },

      // 推荐列表
      selectRecommendGoods() {
        this.selectGoods.curr = 999;
        this.goods.type = '推荐';
        this.isDownMenu = false;
        this.leftNav.curr = 0;
        this.getExchangeGoodsList();
      },

      // 商品分类查询
      selectTypeGoods(item, index) {
        this.goods.type = item.category_name;
        this.selectGoods.curr = item.id;
        this.loading = true;
        this.goods.selectParams.category_id = item.id;
        this.api('/services/exchangeGoods/action_list.php', this.goods.selectParams).then(req => {
          this.leftNav.curr = 0;
          if (req.code == 200) {
            this.goods.currPageIndex = 1;
            this.goods.typeGoodsList = req.data.action_list;
          }
          this.loading = false;
        }).catch(err => {
          this.leftNav.curr = 0;
        });
      },

      // 商品排序
      goodsSortHandle(index) {
        //if(this.goods.type=="推荐商品") return
        // if(this.goods.type=="推荐商品"){
        // this.goods.selectParams.category_id=-1
        // }
        if (this.typeGoodsList.length < 2) return;
        if (this.goods.sortIndex != index) this.goods.selectParams.order_by = 'asc';
        this.loading = true;
        this.goods.sortIndex = index;
        if (index == 0) this.goods.selectParams.order_key = 'add_time';
        if (index == 1) this.goods.selectParams.order_key = 'price';
        if (index == 2) this.goods.selectParams.order_key = 'exchange_times';
        this.goods.selectParams.order_by == 'asc' ? this.goods.selectParams.order_by = 'desc' : this.goods.selectParams.order_by = 'asc';
        this.api('/services/exchangeGoods/action_list.php', this.goods.selectParams).then(req => {
          if (req.code == 200) {
            this.goods.currPageIndex = 1;
            this.goods.typeGoodsList = req.data.action_list;
          }
          this.loading = false;
        });
      },

      // 跳转详情页
      mallDetailLink (action_id){
        this.$router.push ({
          name:'mall-detail',
          params:{id:'detail'},
          query:{id: action_id}
        });
      },

      // 选择商品分页开始位置
      goodsCurrentChangeHandle(val) {
        this.goods.pageBeginIndex = (Number(val) - 1) * Number(this.goods.limit);

        var vueScrollBar = document.getElementById("scrollbar");
        if (window.screen.availWidth < 1024) {
          vueScrollBar.scrollTop = 0;
        }
        else {
          vueScrollBar.scrollTop = 240;
        }
      },

      // 弹出兑换记录留言
      messageHandle(message_data) {
        if (!message_data.member_message) {
          //未留言
          this.message.title = '留言';
          this.message.messageText = '';
          this.message.messageNum = 0;
        } else {
          //已留言
          this.message.title = '查看留言';
          this.message.messageText = message_data.member_message;
        }
        this.message.order_sn = message_data.order_sn;
        this.popLoading = true;
        this.dialogMessageVisible = true;
      },

      //留言板限制字数
      msgLimit(STR, maxlen) {
        var L = 0, i = 0, stop = false, str = '';
        while (!stop) {
          var charCode = STR.charCodeAt(i);
          L += charCode >= 0 && charCode <= 128 ? 1 : 3;
          if (L > maxlen) {
            stop = true;
          } else {
            str += STR.charAt(i);
            i++;
          }
        }
        return str;
      },

      //倒计数
      start() {
        this.message.inputLock = true;
      },

      end() {
        this.message.inputLock = false;
        this.message.messageNum = 0;
        var charCode = -1;
        for (var i = 0; i < this.message.messageText.length; i++) {
          charCode = this.message.messageText.charCodeAt(i);
          this.message.messageNum += charCode >= 0 && charCode <= 128 ? 1 : 3;
        }
        if (this.message.messageNum >= this.message.messageLimit) {
          this.message.messageText = this.msgLimit(this.message.messageText, this.message.messageLimit);
        }
      },

      input() {
        if (!this.message.inputLock) {
          this.message.messageNum = 0;
          var charCode = -1;
          for (var i = 0; i < this.message.messageText.length; i++) {
            charCode = this.message.messageText.charCodeAt(i);
            this.message.messageNum += charCode >= 0 && charCode <= 128 ? 1 : 3;
          }
          if (this.message.messageNum >= this.message.messageLimit) {
            this.message.messageText = this.msgLimit(this.message.messageText, this.message.messageLimit);
            this.message.messageNum = this.message.messageLimit;
          }
        }
      },

      // 兑换记录
      getExchangeRecordList(arg) {
        this.isLogin();
        if (!this.member.info) return;
        this.loading = true;

        // 参数存在，跳转第一页
        if (arg) {
          this.exchangeRecord.currPageIndex = 1;
        }

        this.api(this.exchangeRecord.url, this.exchangeRecord.params).then(req => {
          if (req.code == 200) {
            this.exchangeRecord.list = req.data.list;
            this.exchangeRecord.count = req.data.count;
            this.exchangeRecord.currPageIndex = this.exchangeRecord.params.page;
          }
          this.loading = false;
        });
      },

      //提交留言
      sendMessage() {
        this.loading = true;
        this.api('/services/exchangeGoods/send_member_message.php', {
          order_sn: this.message.order_sn,
          message: this.message.messageText
        }).then(req => {
          if (req.code == 200) {
            this.dialogMessageVisible = false;
            this.message.messageText = '';
            this.message.messageNum = 0;
            this.getExchangeRecordList();
            this.$message.success(req.message);
          }
          this.loading = false;
        });
      },

      // 留言弹窗取消
      messageCancel() {
        this.dialogMessageVisible = false;
      },

      // 查看兑换的商品
      lookExchangeGoods(obj) {
        this.popExchangeGoodsHandle(obj);
        this.dialogTableVisible = true;
      },

      // 选择兑换记录分页开始位置
      recordCurrentChangeHandle(val) {
        this.exchangeRecord.pageBeginIndex = (Number(val) - 1) * Number(this.exchangeRecord.params.limit);
        this.exchangeRecord.params.page = val;
        this.getExchangeRecordList();
      },

      // 选择我的竞拍记录分页开始位置
      auctionCurrentChangeHandle(val) {
        this.auctionList.pageBeginIndex = (Number(val) - 1) * Number(this.auctionList.params.limit);
        this.auctionList.params.page = val;
        this.getMyAuctionList();
      },

      // 获取收货地址列表
      getShoppingAddressList() {
        this.isLogin();
        if (!this.member.info) return;
        this.loading = true;
        this.api('/services/userCenter/my_address_list.php', {limit: 50}).then(req => {
          if (req.code == 200) {
            this.address.data = req.data;
          }
          this.loading = false;
        });
      },

      // 弹出添加地址表单
      addressHandle() {
        this.$root.hub.$emit('showAddress');
      },

      // 修改收货地址
      modAddressHandle(detail) {
        this.$root.hub.$emit('modAddress', detail);
      },

      // 删除收货地址
      delAddressHandle(index) {
        let item = this.address.data.list[index];
        this.api('/services/userCenter/my_address_del.php', {addr_id: item.addr_id}).then(req => {
          if (req.code == 200) {
            this.address.data.list.splice(index, 1);
            this.$message.success('地址删除成功！');
          }
        });
      },

      // 设置默认地址
      setDefAddr(index) {
        let item = this.address.data.list[index];
        this.api('/services/userCenter/my_address_setdefault.php', {addr_id: item.addr_id}).then(req => {
          if (req.code == 200) {
            this.address.data.list.forEach(item => {
              item.def_addr = 0;
            });
            item.def_addr = 1;
            this.$message.success('默认地址设置成功！');
          }
        });
      },

      // 关闭商品兑换弹窗，调用地址添加弹框
      popGoodsClose() {
        this.isMask = false;
        if (this.popSwitch == false) return;
        setTimeout(() => {
          this.exchangeTableVisible = true;
        }, 400);
      },

      mallScrollEvent(event) {
        if (this.scrollTimeout) return;
        this.scrollTimeout = setTimeout(() => {
          this.scrollTop = event.target.scrollTop;
          this.scrollTimeout = null;
        }, 50);
      }
    },
    created() {
      this.getExchangeGoodsList();
      if (this.$route.query.nav) {
        this.leftNav.curr = this.$route.query.nav;
        if (this.leftNav.curr == 3) {
          this.selectGoods.curr == '';
          this.getMyAuctionList();
        } else if (this.leftNav.curr == 1) {
          this.selectGoods.curr == '';
          this.getExchangeRecordList();
        }
      } else {
        this.selectGoods.curr = 999;
      }

      if ( this.timeOut ) {
        clearTimeout(this.timeOut);
      }
      this.getListIng();
    },

    mounted() {
        document.title = '兑换商城';
    },
    watch: {
      '$store.state.member.info'() {

        this.getShoppingAddressList();
        this.getExchangeGoodsList();
      },
    },
    filters: {
      formatTitle(value) {
        if (!value) return '';
        return "[" + value.trim().toString() + "]";
      },
      formatGoodsType(value) {
        if (value == 2) {
          return '实物商品';
        } else {
          return '虚拟商品';
        }
      },
      formatMenuTitle(value) {
        if (!value) return '';
        return value.trim().slice(0, 4);
      }
    }
  };
</script>

<style lang="stylus">

  body {
    background: rgba(252, 252, 253, 1);
  }
  img {
    border 0
    display block
  }
  ul, li {
    list-style none
  }

  .container-mall {
    width 1020px
    margin 0 auto
    padding 0 15px
  }

  #mall {


    .head {
      display flex
      background: rgba(252, 252, 253, 1);
      padding-bottom 17px
      justify-content space-between
      overflow hidden
      .left {
        float left
        .text1 {
          width 4px
          height 16px
          background: rgba(13, 141, 252, 1);
          display inline-block
          margin-right 10px
        }
        .text2 {
          font-size: 20px;
          font-weight: bold;
          color: rgba(45, 47, 51, 1);
          line-height: 28px;
          display inline-block
          cursor pointer
        }
      }
      .right-nav {
        line-height 28px
        font-size: 14px;
        color: #656973;
        cursor pointer

        .nav-item {
          margin-right 16px
        }

        .icon {
          width 18px
          height 18px
          margin: 0 5px;
        }
        .active {
          background: #F5F6F7;
          border-radius: 6px;
        }
        .left {
          display flex
          align-items center
        }
        .right {
          display flex
          align-items center
        }
      }
    }
    .el-loading-mask {
      background-color #fff
    }
    .default-menu-pic {
      width 100%
      display block
    }
    .goods-menu {
      background rgba(255, 255, 255, 1)
      box-shadow 0 4px 14px -6px rgba(10,39,102,0.06)
      border-radius 6px
      margin-top 24px
      -webkit-transition: height .5s;
      -moz-transition: height .5s;
      -ms-transition: height .5s;
      -o-transition: height .5s;
      transition: height .5s;
      overflow: hidden;

      &.show-more {
        height 4.259259rem
        &.show-mm {
          height 6.574074rem
        }
      }
      .left-list {
        width: 100%
        background: #fff;
        box-shadow: 0 4px 14px -6px rgba(10,39,102,0.06);
        border-radius: 6px;
        padding 0 12px
        overflow hidden
        .goods-item {
          float left
          padding 0 18px
          cursor: pointer;
          -webkit-transition: opacity 0.25s ease-in;
          -moz-transition: opacity 0.25s ease-in;
          -ms-transition: opacity 0.25s ease-in;
          -o-transition: opacity 0.25s ease-in;
          transition: opacity 0.25s ease-in;

          &:hover {
            background: rgba(247, 248, 250, 1);
          }
          .inner-wrap {
            width 48px
            height 72px
          }
          .icon-wrap {
            width 36px
            height 36px
            margin 15px auto 6px
            overflow hidden
            border-radius 50%
            .menu-icon {
              width 100%
            }
            .recommend-icon {
              color #FFF
            }
          }

          .title {
            font-size: 12px;
            color: #2D2F33;
            line-height: 17px;
            text-align: center;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space:nowrap
            &.hot {
              color #ef8924
            }
          }

          &.active {
            .inner-wrap {
              border-bottom: 3px solid #0D8DFC;
            }
          }
        }
      }
      .more {
        width 1.481481rem
        height 1.574074rem
        float right
        cursor: pointer;

        > .icon-wrap {
          width 1.074074rem
          height 1.074074rem
          border-radius 50%
          background #E5E7E9
          margin 0 auto
          text-align center
        }
        .more-icon {
          color #fff
          font-size 0.592593rem
          margin-top 0.277778rem
        }
        .title {
          text-align center
          margin 0.148148rem auto 0
          font-size 0.259259rem
          max-width 1.481481rem
          white-space nowrap
          overflow hidden
          text-overflow ellipsis
        }
        &:hover .goods-menu {
          height 100%
        }
      }
    }
  }

  #mall-wrap {
    margin-top 26px
    overflow hidden
    border-radius 6px
    .default-pic {
      width 100%
      height 100%
      border-top-left-radius 6px
      border-top-right-radius 6px
    }

    .main {
      .body {
        .top {
          span {
            display inline-block
            vertical-align middle
          }
          .select {
            display inline-block
            vertical-align middle
            text-align center
            float right
            div {
              cursor pointer
              vertical-align middle
              display inline-block
              font-weight 400
              width 110px
              line-height 30px
              border-radius 24px
              margin-left 10px
              border 1px solid rgba(235,235,237,1)

              &:hover {
                background #f7f8fa
              }
              span {
                font-size 14px
                color #656973

                &:hover {
                  color #626262
                }
              }
              .icon {
                font-size 10px
                vertical-align middle
                display none
                &.curr {
                  display inline-block
                }
                &.show {
                  display inline-block
                }
                &.desc {
                  -webkit-transform: rotateX(180deg)
                  -moz-transform: rotateX(180deg)
                  -ms-transform: rotateX(180deg)
                  -o-transform: rotateX(180deg)
                  transform: rotateX(180deg)
                }
              }
            }
          }
          .key, .val {
            color #0c9dfc
          }
          .key {
            display: inline-block;
            font-size: 17px;
            font-weight: bold;
            color: #2D2F33;
            line-height: 32px;
          }
          &.exchange {
            display flex
            align-items center
            justify-content space-between
          }
          .val {
            font-size 0.407407rem
            font-family TradeGothicLT
            font-weight bold
            padding-right 0.111111rem
          }
          .manager_message_btn {
            color #656973
            float right
            display flex
            align-items center
            justify-content space-between
            font-size: 14px;
            line-height: 24px;
            > img {
              display inline-block
              margin-right 8px
            }
          }
        }

        .goods-list {
          padding-top 14px
          .goods-wrap {
            width calc((100% - 54px)/4)
            cursor: pointer;
            margin-right: 18px;
            margin-bottom: 18px;
            background: #fff;
            box-shadow: 0 6px 16px -4px rgba(10,39,102,0.09);
            border-radius: 4px;
            float left

            &:nth-of-type(4n) {
              margin-right 0
            }


            &:hover {
              -webkit-box-shadow 0 6px 20px -4px rgba(10, 39, 102, 0.15);
              -moz-box-shadow 0 6px 20px -4px rgba(10, 39, 102, 0.15);
              box-shadow 0 6px 20px -4px rgba(10, 39, 102, 0.15);
            }

            .goods {
              margin 0 auto
              -webkit-transition: box-shadow .5s
              -moz-transition: box-shadow .5s
              -ms-transition: box-shadow .5s
              -o-transition: box-shadow .5s
              transition: box-shadow .5s

              .goods-pic-wrap {
                width: 100%
                position relative
                overflow: hidden;
                .goods-lable {
                  position absolute
                  top: 0
                  left: 0
                  z-index: 999
                  .lable-pic {
                    width 43px
                    height 22px
                  }
                }
                .miaosha {
                  position absolute
                  bottom 0
                  width 100%
                  font-size: 14px;
                  line-height: 26px;
                  font-weight: 600;
                  color: #fff;

                  img {
                    display block
                    float left
                  }

                  &.beg-over {
                    background: linear-gradient(90deg, rgba(87, 81, 255, 1) 0%, rgba(162, 69, 255, 1) 100%);
                  }
                  &.pro {
                    background: linear-gradient(135deg, rgba(250, 62, 87, 1) 0%, rgba(250, 75, 151, 1) 100%);
                  }
                  .text {
                    display block
                    margin-left 60px

                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap
                  }
                }
                .auction {
                  position absolute
                  bottom 0
                  width: 100%;
                  font-size: 14px;
                  font-weight: 600;
                  color: #fff;
                  height: 26px;
                  line-height: 14px;
                  padding 6px 0
                  &.beg-over {
                    background: linear-gradient(90deg, #FF5252 0%, #FF7247 100%);
                  }
                  &.pro {
                    background: linear-gradient(135deg, #FF5252 0%, #FF7247 100%);
                  }
                  .text {
                    display inline-block
                    >span {
                      display block
                      &:first-child {
                        padding 0 10px
                        float left
                        border-right 1px solid #fff
                      }
                      &:last-child {
                        margin-left 60px
                        padding 0 10px
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      }
                    }
                  }
                }
                .miaosha-mask {
                  position: absolute
                  width: 100%
                  height: calc(100% - 26px);
                  left: 0
                  top: 0
                  background: rgba(0, 0, 0, 0.4);
                  display flex
                  justify-content center
                  align-items center
                  font-size: 0.37037rem;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 1);
                  border-radius: 0.074074rem 0.074074rem 0rem 0rem;
                }
              }
              .goods-cont {
                margin 10px 12px

                box-sizing border-box
                .goods-title {
                  margin 6px 0 4px
                  font-size 16px
                  font-weight bold
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
                .category {

                  > span {
                    line-height: 22px;
                    text-align: center;
                    display: inline-block;
                    border-radius: 8px;
                    font-size: 12px;
                    color: rgba(129, 136, 153, 1);
                    padding: 0 6px;
                    box-sizing: border-box;
                  }
                  > span:nth-child(1) {
                    background: rgba(242, 244, 247, 1);
                  }
                  > span:nth-child(2) {
                    border: 1px solid rgba(140, 54, 245, 1);
                    font-size: 12px;
                    font-weight: blod;
                    color: rgba(140, 54, 245, 1);
                    line-height: 20px;
                    &.miaoshaStart {
                      color: rgba(250, 68, 117, 1);
                      border: 1px solid rgba(250, 68, 117, 1);
                    }
                    &.jingpai {
                      color: #FF6942;
                      border: 1px solid #FF6942;
                    }
                  }
                }
                .valid-time {
                  font-size: 12px;
                  color: #A8ABB3;
                  margin-bottom: 13px;
                  &.miaoshaStorage {
                    color: rgba(250, 110, 138, 1);
                  }
                  &.auctionStorage {
                    padding-top:10px
                    margin-bottom: 3px;
                  }
                  > span:nth-child(1) {
                    margin-right: 0.11111rem;
                  }
                }
                .price-wrap {
                  display flex
                  align-items center
                  line-height 24px
                  font-size: 22px;
                  font-weight: bold;
                  color: rgba(168, 171, 179, 1);
                  margin-bottom: 13px;
                  >span {
                    font-size 11px
                  }
                  .original-price {
                    font-size 11px
                    text-decoration: line-through
                    font-weight normal
                  }
                  .price {
                    font-size: 22px;
                    font-family: D-DINExp-Bold;
                    font-weight: bold;
                    color: rgba(255, 136, 99, 1);
                    line-height: 24px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    margin-right: 4px;
                  }
                  .icon {
                    width 20px
                    height 20px
                    margin-right: 10px
                  }
                }

              }
            }
          }
          .goods-wrap:nth-child(1) {
            .goods-pic-wrap {
              > img {
              }
            }
          }
        }

        .auction-page {
          .top {
            overflow hidden
            .key {
              float left
              padding-right 24px
              line-height 21px
              position  relative

              &:before {
                content ""
                position absolute
                z-index -1
                right 0
                top 50%
                width 1px
                height 14px
                background #EBEBED
                transform translate(0, -50%)
              }
            }
            .tabs {
              float left

              ul {
                overflow hidden

                li {
                  float left
                  font-size 15px
                  line-height 21px
                  color #656973
                  padding 0 4px 8px
                  margin-left 20px
                  margin-right 0
                  cursor pointer
                }

                // tabs
                .active {
                  color #2D2F33
                  font-weight bold
                  position relative

                  .bj {
                    position absolute
                    height 2px
                    width 34px
                    background #FF6942
                    bottom 0
                    left 50%
                    transform translate(-50%, 0)
                  }
                }
              }

            }
          }

          .goods-list {
            .goods-wrap {
              .goods {
                .goods-pic-wrap {
                  .goods-lable {
                    p {
                      font-weight bold
                      font-size 14px
                      color #fff
                      padding 0 8px
                      line-height 22px
                      border-top-left-radius 6px
                      border-bottom-right-radius 6px
                      background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)

                      &.in {
                        background linear-gradient(270deg,rgba(88,92,102,1) 0%,rgba(63,67,77,1) 100%)
                      }
                    }
                  }
                  .auction-time {
                    position absolute
                    bottom 0
                    left 0
                    right 0

                    width 100%
                    text-align center
                    display flex
                    height 26px
                    background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)

                    >.text {
                      display block
                      color #fff
                      font-size 12px
                      line-height 26px
                      margin 0 auto

                      span {
                        line-height 26px
                      }
                      .num {
                        width 22px
                        height 26px
                        line-height 24px
                        display inline-block
                        vertical-align middle
                        text-align center
                        font-size 16px
                        padding-right 3px
                        font-family D-DINExp-Bold
                      }
                    }

                    // 被超越
                    &.in {
                      background linear-gradient(270deg,rgba(88,92,102,1) 0%,rgba(63,67,77,1) 100%)
                    }
                  }
                }
                .goods-cont {
                  .category {
                    overflow hidden
                    img {
                      width 36px
                      height 20px
                      float left
                      margin-right 6px
                    }
                    > span {
                      border 0
                      float left
                    }
                    > span:nth-child(2) {
                      color #818899
                      border 0
                      background #f2f4f7
                    }
                  }
                  .auction-price-wrap {
                    margin 10px 0
                    overflow hidden

                    .wrap {
                      float left
                      width calc((100% - 10px)/2)
                      .title {
                        font-size 12px
                        color #666666
                      }

                      &:nth-of-type(2n){
                        margin-left 10px
                      }

                      .price {
                        font-size 16px
                        font-weight bold
                        color #FF6942

                        &.blue {
                          color #0D8DFC
                        }
                        svg {
                          margin-bottom -2px
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        .address-page {
          .scrollbar {
            margin-top 14px
            min-height 475px
            .ps-scrollbar-x-rail {
              display: none;
            }
          }
          .add-list {
            overflow hidden

            >div {
              background #fff
              border-radius 6px
              width calc((100% - 28px)/3)
              margin-right 14px
              margin-bottom 14px
              height 220px
              float left
              display flex
              flex-direction column
              align-items center
              justify-content center
              cursor pointer
              box-shadow 0 6px 16px -4px rgba(10,39,102,0.09)

              &:nth-child(3n) {
                margin-right 0
              }

              .add-box {
                width 100%
                margin 6px 0 14px

                >li{
                  padding 12px 22px
                  font-size 14px
                  font-weight 400
                  color #2D2F33
                  line-height 22px
                  border-bottom 1px solid #F0F1F2

                  .icon {
                    margin 3px 10px 0 0
                    float left
                  }
                  >span {
                    display block
                    margin-left 26px
                  }
                  &.telphone,&.setup {
                    border-bottom none
                  }
                  &.address {
                    span {
                      height 44px
                      // overflow:hidden;
                      // text-overflow:ellipsis;
                      // white-space:nowrap
                    }
                  }
                  &.username {
                    span {
                      font-size 16px
                      font-weight bold
                    }
                  }
                  // 按钮样式
                  &.setup {
                    display flex
                    justify-content space-between

                    .el-button {
                      line-height 30px
                      padding 0
                      margin 0
                      border-radius 24px
                      border 1px solid #0D8DFC
                      background #fff

                      &:hover {
                        box-shadow 0 6px 20px -4px rgba(10, 39, 102, 0.15);
                      }

                      span {
                        color #0D8DFC
                        padding 0 25px
                      }
                    }
                    .default-addr {
                      background: rgba(13, 141, 252, 1);
                      display inline-block

                      span {
                        color #fff
                      }
                    }

                    .del {
                      font-size: 14px;
                      color: rgba(168, 171, 179, 1);
                      line-height: 36px;
                      cursor pointer
                    }
                  }
                }
              }
              &.add-wrap {
                .add-full {
                  width 64px
                  height 64px
                  border 1px solid #F0F1F2
                  border-radius 50%
                  position relative
                  /*margin-bottom 0.35185rem;*/
                  .add1, .add2 {
                    width: 28px;
                    height: 6px;
                    background: #EBEBED;
                    border-radius: 2px;
                    position absolute
                    left 0
                    top 0
                    right 0
                    bottom 0
                    margin auto
                  }
                  .add2 {
                    width: 6px;
                    height: 28px;
                  }
                }
                .text {
                  font-size: 14px;
                  font-weight: 400;
                  color: #A8ABB3;
                  line-height: 20px;
                  margin-top: 19px;
                }
              }
            }
          }
        }
        .pagination {
          clear both
          text-align center
          height 26px
          line-height 26px
          .el-pagination {
            padding 0

            button {
              border none
              margin 0 0.185185rem
              background: none;
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

            .el-icon-arrow-right:before　 {
              content '下一页'
            }

            .el-pager {
              li {
                color: #586077;
                width 26px
                height 26px
                padding 0
                font-size 14px
                margin 0 5px
                border: none
                background: none;
                &.number {
                  &.active {
                    background: #0D8DFC;
                    border-radius 50%
                    color #fff
                  }
                }
              }
            }
          }
        }
        .btn {
          background #0C9DFC
          border 0.018519rem solid #0497F8
          box-shadow 0 0.037037rem 0.074074rem 0 rgba(12, 157, 252, .4)
          border-radius 0.074074rem
        }
      }


      // 兑换记录
      .record-list {
        width 100%
        margin 14px 0 30px

        >div {
          ul {
            width 100%
            box-shadow 0 4px 14px -6px rgba(10,39,102,0.06)
            margin-bottom 10px
            overflow hidden

            >li {
              float left
              text-align center
              font-size 14px
              color #656973
              vertical-align middle

              svg {
                margin-bottom -3px
              }

              &.info {
                text-align left
                width calc(100% - 580px)
              }
              &.sort,&.message {
                width 90px
              }
              &.message {

              }
              &.price {
                width 120px

              }
              &.order {
                width 280px

                overflow hidden
                text-overflow ellipsis
                white-space: nowrap
              }

            }
          }
          &.record-thead {
            ul {
              line-height 36px
              .info {
                span {
                  padding-left 22px
                }
              }
            }
          }
          &.record-tbody {
            ul {
              line-height 36px
              padding 10px 0

              // 个人信息
              .info {
                display flex
                color #373A41
                cursor pointer

                .avatar {
                  width 40px
                  height 40px
                  margin-left 12px
                  overflow hidden

                  img {
                    width 100%
                  }
                }
                .pic {
                  svg {
                    display block
                    width 35px
                    height 20px
                    margin 10px 6px 10px 12px
                  }
                }

                >p {
                  width calc(100% - 93px)
                  line-height 40px

                  overflow hidden
                  text-overflow ellipsis
                  white-space: nowrap
                }
              }
              // 类别
              .sort {
                p {
                  background #F2F4F7
                  border 8px
                  width 64px
                  line-height 22px
                  margin 9px auto
                  font-size 12px
                }
              }
              .order {
                p {
                  color #373A41

                  overflow hidden
                  text-overflow ellipsis
                  white-space: nowrap

                  &.cur {
                    color #FF5C69
                  }
                }
              }
              // 价格
              .price {
                p {
                  span {
                    color #FF8863
                    font-size 18px

                    &.zuanshi {
                      color #0D8DFC
                    }
                  }
                  &:first-child {
                    line-height 20px
                    margin-bottom 3px
                  }
                  &:last-child {
                    line-height 16px
                    color #A5A8B2
                    font-size 12px
                  }
                  svg {
                    width 20px
                    height 20px
                  }
                }
              }
              .message {
                p {
                  width 80px
                  line-height 30px
                  color #0D8DFC
                  border 1px solid #0D8DFC
                  margin 4px auto
                  border-radius 17px
                  cursor pointer

                  &.cur {
                    color #fff
                    background #0D8DFC
                  }
                }
              }
            }
          }
        }

      }
      .record-tbody-h5 {
        display none
      }
    }

    .el-dialog__wrapper {
      .el-dialog__body {
        padding 0
      }
      &.pop-goods {
        .el-loading-mask {
          background rgba(255, 255, 255, 1)
        }
        .el-dialog {
          width 600px
          height 410px
          top: 5% !important;
          .el-dialog__header {
            border-bottom: none;
            background: #fff;
            height: 0;
            .el-dialog__headerbtn {
              width: 0.37037rem;
            }
            .el-dialog__close {
              color: #FFF;
              width: 0.37037rem;
              height: 0.37037rem;
              background: lightgrey;
              line-height: 0.37037rem;
              text-align: center;
            }
          }
          .goods-details {
            .mask {
              position absolute
              top 0
              left 0
              bottom 0
              right 0
              background #FFF
              &.hide-mask {
                display none
              }
            }

            .goods {
              width 100%
              height 11.666667rem
              .goods-pic {
                width: 8.888889rem
                height: 8.888889rem
                position relative
                background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.0) 50%, rgba(0, 0, 0, 0.1) 100%);
                z-index: -2;
                .detail-pic {
                  display block
                  width 8.888889rem
                  height 8.888889rem
                  position absolute
                  left 0
                  top 0
                  bottom 0
                  right 0
                  margin auto
                  z-index -2
                }
                .miaosha {
                  font-size: 0.296296rem;
                  font-weight: 600;
                  display block
                  position absolute
                  bottom 0
                  width: 100%;
                  display flex
                  align-items center
                  font-weight: 600;
                  color: rgba(255, 255, 255, 1);
                  line-height: 0.666667rem;
                  &.miaosha-beg-over {
                    background: linear-gradient(90deg, rgba(87, 81, 255, 1) 0%, rgba(162, 69, 255, 1) 100%);
                  }
                  &.miaosha-pro {
                    background: linear-gradient(135deg, rgba(250, 62, 87, 1) 0%, rgba(250, 75, 151, 1) 100%);
                  }
                  .text {
                    display inline-block
                    margin-left 0.259259rem
                  }
                }
              }
              .goods-cont {
                height 2.61111rem
                padding 0.185185rem 0 0 0.259259rem
                color #373A41
                width: 8.62963rem;
                background: white;
                .type {
                  font-size 0.259259rem
                  color #A5A8B2
                }
                .name {
                  height: 0.462963rem;
                  margin 0.166667rem 0rem
                  overflow hidden
                  text-overflow ellipsis
                  white-space nowrap
                  font-size: 0.333333rem;
                  font-weight: 600;
                  color: rgba(45, 47, 51, 1);
                  line-height: 0.462963rem;
                }
                .valid-time {
                  font-size: 0.222222rem;
                  font-weight: 400;
                  color: rgba(168, 171, 179, 1);
                  line-height: 0.314815rem;
                }
                .property {
                  height 0.407407rem
                  line-height 0.407407rem
                  margin-top 0.074074rem

                  .lable-pic {
                    height 0.407407rem
                    float left
                    margin-right 0.148148rem
                  }
                  .category {
                    display: inline-block;
                    line-height: 0.44377rem;
                    height: 0.44377rem;
                    background: #f2f4f7;
                    border-radius: 0.148148rem;
                    font-size: 0.222222rem;
                    font-weight: 600;
                    color: #818899;
                    padding: 0rem 0.111111rem;
                  }
                }
                .price-wrap {
                  height 0.666667rem
                  line-height 0.666667rem
                  margin-top 0.148148rem
                  display flex
                  align-items center
                  justify-content space-between
                  .price {
                    font-size: 0.518519rem;
                    font-family: D-DINExp-Bold;
                    font-weight: bold;
                    color: rgba(255, 136, 99, 1);
                    padding-right 0.148148rem
                  }
                  .original-price {
                    height: 0.666667rem;
                    font-size: 0.203704rem;
                    font-weight: 600;
                    color: rgba(168, 171, 179, 1);
                    line-height: 0.666667rem;
                    display inline-block
                  }
                  .left {
                    display flex
                    align-items center
                  }
                  .right {
                    display inline-block
                    margin-right 0.185185rem
                    font-size: 0.259259rem;
                    font-family: PingFangSC-Semibold;
                    font-weight: 600;
                    color: rgba(137, 73, 255, 1);
                    line-height: 0.37037rem;
                    .block {
                      text-align: center
                      width: 0.481481rem;
                      height: 0.407407rem;
                      background: rgba(137, 73, 255, 1);
                      box-shadow: 0rem 0.111111rem 0.166667rem -0.037037rem rgba(59, 0, 134, 0.06);
                      border-radius: 0.055556rem;
                      width: 0.481481rem;
                      height: 0.37037rem;
                      display inline-block
                      font-size: 0.296296rem;
                      font-family: D-DINExp-Bold;
                      font-weight: bold;
                      color: rgba(255, 255, 255, 1);
                      line-height: 0.37037rem;
                    }
                  }
                  .icon {
                    width 0.407407rem
                    height 0.407407rem
                  }
                  .now-exchange-btn {
                    width: 2.037037rem;
                    height: 0.592593rem;
                    background: rgba(13, 141, 252, 1);
                    border-radius: 0.444444rem;
                    border: none;
                    font-size: 0.259259rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 1);
                    line-height: 0.34037rem;
                    font-family: "Microsoft YaHei", "TradeGothicLT-Bold", "PingFang SC", 'Source Han Sans CN', sans-serif;
                    padding 0
                    transition-duration: 0s
                    margin-right: 0.185185rem
                    &.miaosha-detail {
                      background: linear-gradient(90deg, rgba(255, 76, 106, 1) 0%, rgba(255, 107, 137, 1) 100%);
                    }
                    &.miaosha-over {
                      background: rgba(210, 212, 217, 1);
                    }
                  }
                }

              }
            }
            .explain {
              width 100%
              font-size 0.240741rem
              color #373A41
              height 1.5rem
              background #FAFBFD
              border-radius 0.037037rem
              padding 0.2385185rem 0.37037rem;
              .text1 {
                display: inline-block
                width: 0.074074rem;
                height: 0.222222rem;
                background: rgba(13, 141, 252, 1);
                margin-right 0.185185rem
              }
              .text2 {
                display: inline-block
                margin-bottom: 0.111111rem
                height: 0.388889rem;
                font-size: 0.277778rem;
                font-family: PingFangSC-Semibold;
                font-weight: 600;
                color: rgba(45, 47, 51, 1);
                line-height: 0.388889rem;
              }
              .span3 {
                font-size: 0.259259rem;
                font-weight: 400;
                color: rgba(45, 47, 51, 1);
              }
            }

            .tips {
              padding 0.222222rem 0.407407rem
              background: rgba(252, 250, 245, 1);
              .span {
                font-size: 0.259259rem;
                font-weight: 600;
                color: rgba(255, 136, 99, 1);
                line-height: 0.37037rem;
              }
              .div {
                margin-top: 0.148148rem
                font-size: 0.259259rem;
                font-weight: 400;
                color: rgba(115, 115, 115, 1);
                line-height: 0.407407rem;
              }
            }

          }
        }
      }
      &.message-dialog {
        .el-dialog {
          width 600px
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.03);
          border-radius: 4px;
          transform: translate(-50%, 30%);

          .el-dialog__header {
            height: 46px;
            background: #0D8DFC;
            border-radius: 4px 4px 0 0;
            line-height 46px
            border-bottom none
            text-align center

            .el-dialog__title {
              font-size: 18px;
              font-weight: bold;
              color: #fff;
            }
            .el-dialog__headerbtn {
              width auto
              height auto
              margin-top 14px

              .el-dialog__close {
                font-size 12px
                color #fff;
              }
            }
          }
          .el-dialog__body {
            padding 20px
          }
          .el-textarea {
            border 1px solid #EBEBED
            border-radius 4px

            .el-textarea__inner {
              font-size: 16px;
              font-weight: normal;
              color: #2D2F33;
              border none
              outline none
              padding: 10px 14px;
              -webkit-appearance: none;
              font-family: "Microsoft YaHei", "PingFangSC-Regular", "TradeGothicLT-Bold", 'Source Han Sans CN', sans-serif;
              &:hover {
                border-color #0D8DFC
              }
              &:focus {
                border-color #0D8DFC
              }
            }
          }
          .message-bottom {
            margin-top 16px
            line-height 28px
            font-size 13px
            color #D2D4D9

            button {
              font-size: 13px
              font-weight: normal;
              color: #fff;
              line-height: 28px;
              width: 70px;
              border-radius: 20px;
              text-align center
              background #fff
              border 1px solid #EBEBED
              height 28px
              padding 0

              &:hover {
                box-shadow 0 4px 10px -4px rgba(10, 39, 102, 0.15);
              }

              span {
                display block
              }
            }
            .message-btn {
              color #fff
              background #D2D4D9
              &.active {
                background: #0D8DFC;
              }
            }
            .message-cancel {
              color: #656973;
            }
            .message-limit {
              display inline-block
              float right
            }
            .red {
              color red
            }
          }

        }
      }

    }
  }

  @import '../../static/css/mobile.styl'

</style>
