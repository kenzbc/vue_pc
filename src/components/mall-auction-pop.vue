<template>
  <div class="mall-auction-pop">
    <el-dialog :visible.sync="comebackData.action_pop" :class="{'set-width': popInfo.status == 1}" @close="closeDialog">
      <div class="pop-container">
        <div class="success" v-if="popInfo.status == 5">
          <p>
            <lfl-icon :icon="'queren'"></lfl-icon>
          </p>
        </div>
        <div class="title"
             :class="{'left': popInfo.status == 4}"
             v-if="popInfo.status != 1">{{popInfo.info.title}}</div>
        <div class="content">
          <div v-if="popInfo.status == 1" class="max-price">
            确定以一口价
            <span :class="{'zuanshi' : popInfo.info.e_type == '1'}">{{popInfo.info.max_price}}</span>
            <span>
              <!--<lfl-icon :icon="'diamond'" class="zuanshi"-->
                        <!--v-if="popInfo.info.e_type == '1'"></lfl-icon>-->
              <img v-if="popInfo.info.e_type == '1'" src="/static/image/diamond-orange.png" alt="钻石icon">
              <lfl-icon :icon="'fruit'" v-else></lfl-icon>
            </span>
            拍得该商品吗

          </div>
          <!--竞价-->
          <div class="bid-price" v-if="popInfo.status == 2">
            <label class="minus" :class="{'out': bid.change == 1}" @click="bidPrice(popInfo.info.change_price, '-')"></label>
            <label class="price">
              <input type="text" v-model="popInfo.info.change_price" @blur="inputFunc()">
              <span>
                <!--<lfl-icon :icon="'diamond'" class="zuanshi"-->
                          <!--v-if="popInfo.info.e_type == '1'"></lfl-icon>-->
                <img v-if="popInfo.info.e_type == '1'" src="/static/image/diamond-orange.png" alt="钻石icon">
                <lfl-icon :icon="'fruit'" v-else></lfl-icon>
              </span>
            </label>
            <label class="plus" :class="{'out': bid.change == 2}" @click="bidPrice(popInfo.info.change_price, '+')"></label>
          </div>
          <div v-if="popInfo.status == 3" >
            <section v-if="popInfo.info.auction_end_time">
              <p>竞拍结束时间延长至 {{moment(popInfo.info.auction_end_time * 1000).format("HH:mm")}}</p>
            </section>
          </div>
          <div v-if="popInfo.status == 5">
            <section v-if="popInfo.info.goods_type == 2">
              <p>请您核对您的收获地址是否正确</p>
              <p>（若不正确，请及时联系客服处理）</p>
              <p>并耐心等待收货</p>
            </section>
            <section v-else>
              <p>请在“兑换记录”中联系客服</p>
              <p>确定具体的发放方式与时间</p>
            </section>
          </div>
          <div v-if="popInfo.status == 4 && popInfo.clocksStatus">
            <el-checkbox-group v-model="popInfo.clocksStatus" @change="handleCheckedClocksChange">
              <el-checkbox v-for="item in checkbox_list" :label="item.status" :key="item.status">{{item.text}}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!--一口价按钮-->
        <div class="btn" v-if="popInfo.status == 1">
          <p class="one"
             v-for="(item, index) in popInfo.info.btn_text"
             @click="maxPrice(index, popInfo.status, popInfo.info.max_price, popInfo.address_id)"
             :class="{'active' : index == 1}">{{item}}</p>
        </div>

        <!--其他按钮-->
        <div class="btn" v-else>
          <p v-for="(item, index) in popInfo.info.btn_text"
             @click="btnSubmit(popInfo.status, popInfo.address_id, popInfo.info.max_price)"
             :class="{'tips':popInfo.status == 3 || popInfo.status == 4 || popInfo.status == 5 , 'bid' : popInfo.status == 2 , 'is-disabled': popInfo.status == 1 }">{{item}}</p>
        </div>
        <p class="refresh" v-if="popInfo.status == 2"><span>{{refresh_time}}</span> 秒后刷新价格</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    props: {
      isShow:true,
      data: {
        type: Object,
        default: function () {
          return {

          };
        },
      },
      loading: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        default: ''
      },
    },
    data() {
      return {
        bid:{
          status: 1,   // 更新价格
          change: 1,   // 1:不能再减   2:不能再加
          price: 0,    // 变更前价格
        },
        checkbox_list: [
          {
            status: 0,
            text: '竞拍开始时'
          },
          {
            status: 1,
            text: '竞拍结束前30分钟'
          },
          {
            status: 2,
            text: '我的出价被超越时'
          }
        ],
        remind_start_time: 0,
        remind_end_time: 0,
        remind_for_overtaken: 0,
        refresh_time: 30,
        comebackData:{
          address_id: 0,
          price: 0,
          action_pop: true,
        },
        t: '',
        checkbox: false, // 是否选择过提醒条件
        checkboxChangeValue: [], // 多选结果
      };
    },
    mounted() {
      this.countDown(this.refresh_time);
    },
    computed: {
      member() {
        return this.$store.state.member;
      },
      popInfo(){
        return this.data;
      }
    },
    watch: {
      // popInfo: {
      //   handler(newValue, oldValue){
      //     if (newValue.status == 2) {
      //       this.countDown(this.refresh_time);
      //     }
      //   },
      //   deep: true
      // }
    },
    methods: {
      // 定时器
      countDown(Time) {
        if (Time >= 0) {
          var _this = this;
          _this.refresh_time = Time --;

          _this.t = setTimeout(function () {
            // 判断是否刷新
            if (Time == 0) {
              _this.comebackData.refresh = true;
              _this.closeDialog (true);
            } else if (_this.popInfo.status == 2) {
              _this.countDown(Time);
            }
          }, 1000);
        }
      },

      // 提醒
      handleCheckedClocksChange(value) {
        // 是否触发api
        this.checkbox = true;
        var changeValue = value.join('');
        changeValue.indexOf("0") != -1 ? this.remind_start_time = 1 : this.remind_start_time = 0; // 是否选择 竞拍开始时
        changeValue.indexOf("1") != -1 ? this.remind_end_time = 1 : this.remind_end_time = 0; // 是否选择 竞拍结束前30分钟
        changeValue.indexOf("2") != -1 ? this.remind_for_overtaken = 1 : this.remind_for_overtaken = 0; // 是否选择 我的出价被超越时
      },

      // 提醒API
      getRemindMeApi(){
        // 第一次 点击提醒确定
        if (this.checkbox == false) {
          this.handleCheckedClocksChange(this.popInfo.clocksStatus)
        }
        var params = {
          action_id: this.popInfo.action_id,
          remind_start_time: this.remind_start_time,
          remind_end_time: this.remind_end_time,
          remind_for_overtaken: this.remind_for_overtaken,
        };

        var _this = this;
        this.api('/services/exchangeGoods/remind_me.php', params).then(res => {
          if (res.code == 200) {
            _this.$message.success('设置成功');
            _this.closeDialog (true)
          } else {
            this.$message.error(req.message);
          }
        });
      },

      // 按钮交互
      btnSubmit (status, address_id, max_price) {
        // status  1: 一口价弹窗   2: 竞价弹窗   3: 提示弹窗  4: 提醒  5:竞拍成功
        if (status == 5) {
          this.$router.push ({
            name:'mall',
            query: {nav: 1}
          });
        } else if (status == 3) {
          // this.closeDialog ();
          this.popInfo.info.auction_end_time ? this.closeDialog (true) : this.closeDialog ();
        } else if (status == 4) {
          this.getRemindMeApi()
        } else if (status == 1) {
          this.comebackData.price = this.popInfo.info.max_price;
          this.comebackData.address_id = address_id;
          this.closeDialog (true);
        } else  {
          this.comebackData.price = this.popInfo.info.change_price;
          this.comebackData.address_id = address_id;
          this.closeDialog (true);
        }
      },

      // 关闭
      closeDialog (is_ok){
        // is_ok  是否有交互
        // 关闭消除数据
        this.bid.change = 1;
        if (is_ok) {
          this.comebackData.status = this.popInfo.status;
          // 判断是否是-我的竞价
          if (this.comebackData.status == 2) {
            // this.refresh_time = 30;
            // 清除定时器
            clearTimeout(this.t);
            // 重启定时器
            this.countDown(this.refresh_time);
            this.$emit( "closeDialog" , true );
          }
          this.$emit( "comebackData" , this.comebackData );
        } else {
          this.comebackData.is_ok = false; // 返回控制弹窗
          this.$emit( "comebackData" , this.comebackData );
        }

      },

      // 加减按钮
      bidPrice(price, to){
        if (to == '-') {
          if ( parseInt(price) < parseInt(this.popInfo.info.price)  ){
            this.bid.change = 1;
            return false;
          } else {
            this.popInfo.info.change_price = parseInt(price) - 1;
            if (this.popInfo.info.change_price > parseInt(this.popInfo.info.price)){
              this.bid.change = 0
            } else {
              this.popInfo.info.change_price = parseInt(this.popInfo.info.price);
              this.bid.change = 1;
            }
          }
        } else {
          if ( parseInt(this.popInfo.info.max_price) - parseInt(price) >= 0 ) {
            this.popInfo.info.change_price = parseInt(price) + 1;
            if (parseInt(this.popInfo.info.max_price) > this.popInfo.info.change_price){
              this.bid.change = 0
            } else {
              this.popInfo.info.change_price = parseInt(this.popInfo.info.max_price);
              this.bid.change = 2
            }
          } else {
            if (!this.popInfo.info.max_price || this.popInfo.info.max_price == 0) {
              this.popInfo.info.change_price = parseInt(price) + 1;
              this.bid.change = 0;
            } else {
              this.bid.change = 2;
              return
            }
          }
        }
      },

      // 一口价确定按钮
      maxPrice(index, status, max_price, address_id){
        if (index == 0) {
          this.popInfo.loading = false;
          this.closeDialog ();
        } else {
          this.btnSubmit(status, address_id, max_price);
          // this.postExchange({action_id: this.popInfo.action_id, price: max_price});
        }
      },

      // 监听价格输入框
      inputFunc () {
        var price = this.popInfo.info.change_price;
        if (parseInt(price) <= parseInt(this.popInfo.info.price)) {
          this.$message.warning('您的出价小于当前价，请重新出价！');
          this.popInfo.info.change_price = parseInt(this.popInfo.info.price);
          this.bid.change = 1;
        } else if (this.popInfo.info.max_price != 0 && parseInt(price) >= parseInt(this.popInfo.info.max_price)) {
          this.$message.warning('您的出价大于一口价，请重新出价！');
          this.popInfo.info.change_price = parseInt(this.popInfo.info.max_price);
          this.bid.change = 2;
        } else {
          this.popInfo.info.change_price = parseInt(price);
          this.bid.change = 0;
        }
      }
    }
  };
</script>

<style lang="stylus">
  .mall-auction-pop {
    width 100%

    .el-dialog__wrapper {

      &.set-width {
        .el-dialog {
          width 360px
        }
      }

      .el-dialog {
        width 310px

        .el-dialog__header {
          border-bottom 0
          height 20px
          line-height 20px
          padding 0

          .el-dialog__headerbtn {
            margin-top 0
          }
          .el-dialog__close {
            position absolute
            top 10px
            right 10px
            color #D2D4D9
            margin-top 0
          }
        }

        .el-dialog__body {
          padding 0
          margin 0

          .pop-container {
            text-align center
            padding 0 20px

            .success {
              p {
                width 50px
                height 50px
                margin 0 auto
                border-radius 50%
                background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)
                position relative

                svg {
                  position absolute
                  top 50%
                  left 50%
                  width 26px
                  height 26px
                  fill #fff
                  transform translate(-50%, -50%)
                }
              }
            }

            .title {
              font-size 18px
              font-weight bold

              &.left {
                font-size 17px
                text-align left
                padding-left 12px
              }
            }
            .content {
              // padding 6px 20px
              margin 20px 0 8px



              .max-price {
                font-size 16px
                color #2D2F33

                span {
                  color #FF6942

                  &.zuanshi {
                    color #ff6942
                  }
                  svg {
                    fill #ff6942
                    margin-bottom -2px
                  }
                  img {
                    width 18px
                    height 18px
                    margin-bottom -3px
                    display inline-block
                  }
                }

              }
              .bid-price {
                display flex
                justify-content center

                label {
                  display block
                }

                .plus, .minus {
                  width 28px
                  height 28px
                  line-height 28px
                  text-align center

                  border-radius 50%
                  margin 4px 0
                  position relative
                  cursor pointer
                  background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)


                  &:before {
                    width 12px
                    height 3px
                    border-radius 6px
                    background #fff
                    opacity .75
                    content ""
                    position absolute
                    display block
                    z-index 1
                    left 50%
                    top 50%
                    transform translate(-50%, -50%)
                    transition-duration .3s
                  }

                  &.out {
                    cursor not-allowed
                    background #D2D4D9
                  }
                }

                .plus {

                  &:after {
                    width 3px
                    height 12px
                    border-radius 6px
                    background #fff
                    opacity .75
                    content ""
                    position absolute
                    display block
                    z-index 1
                    left 50%
                    top 50%
                    transform translate(-50%, -50%)
                    transition-duration .3s
                  }
                }

                .price {
                  margin 0 8px
                  line-height 34px
                  overflow hidden
                  width 172px

                  input {
                    padding 3px
                    line-height 28px
                    width calc(100% - 36px)
                    border 1px solid #F0F1F2
                    border-top-left-radius 18px
                    border-bottom-left-radius 18px
                    float left
                    text-align center
                    color #FF6942
                    font-size 24px
                    font-weight bold
                  }
                  span {
                    display block
                    float left
                    width 36px
                    height 36px
                    line-height 34px
                    border 1px solid #F0F1F2
                    border-left 0
                    border-top-right-radius 18px
                    border-bottom-right-radius 18px

                    svg {
                      width 24px
                      height 24px
                      margin-bottom -6px
                    }
                    img {
                      width 28px
                      height 28px
                      margin-bottom -8px
                      margin-right 4px
                    }
                  }

                }

                .minus {

                }
              }

              .el-checkbox-group {
                display block
                text-align left

                .el-checkbox {
                  display block
                  font-size 14px
                  line-height 36px
                  margin 0 0 4px 0
                  border-radius 20px
                  padding-left 12px

                  &.active {
                    background #F5F6F7
                  }

                  .el-checkbox__input {
                    .el-checkbox__inner {
                      width 16px
                      height 16px
                      border 2px solid #A8ABB3
                      border-radius 50%
                      &:after {
                        width 16px
                        height 16px
                        top 0
                        left 0
                        transform translate(0)
                        border 0
                      }
                    }

                    &.is-checked {
                      .el-checkbox__inner {
                        border 0
                        background #FF4C38

                        &:after {
                          background url('/static/image/select-active.png')no-repeat
                          background-size 100% 100%
                        }
                      }

                    }
                  }
                }
              }
            }
            .btn {
              display flex
              justify-content center
              padding 16px 0

              p {
                border-radius 20px
                width 100%
                cursor pointer

                &.one {
                  height 34px
                  line-height 32px
                  border 1px solid #EBEBED
                  width calc((90% - 16px)/2)
                }

                &.active {
                  color #fff
                  background #FF6942
                  border 1px solid #FF6942
                }

                &:nth-of-type(2) {
                  margin-left 16px
                }

                &.tips {
                  font-size 14px
                  height 36px
                  color #fff
                  line-height 36px
                  background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)
                }
                &.bid {
                  font-size 16px
                  height 40px
                  color #fff
                  line-height 40px
                  background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%)
                }
                &.is-disabled {
                  background #D2D4D9
                  cursor not-allowed
                }
              }
            }
            .refresh {
              font-size 12px
              color #A8ABB3
              margin-bottom 16px

              span {
                color #FF6942
              }
            }
          }
          .el-button {
            line-height 40px
            border-radius 20px
            background #fff
            color #656973
            border 0

            &.double {
              height 34px
              line-height 32px
              border 1px solid #EBEBED
              width calc((100% - 16px)/2)

              &.active {
                color #fff
                background #FF6942
              }
            }
            &.in {
              color #fff
              width 100%
              height 40px
              line-height 40px
              margin-left 0
              background linear-gradient(90deg,rgba(255,82,82,1) 0%,rgba(255,114,71,1) 100%);
            }
          }
        }
      }
    }
  }
</style>