<template>
    <div id="footer">
        <div class="container">
            <div class="copyright fl">
                <div class="logo-and-copyright">
                    <div class="logo">
                        <lfl-icon icon="lfl" class="lfl"></lfl-icon>
                        <lfl-icon icon="hls" class="hls"></lfl-icon>
                    </div>
                    <div class="split"></div>
                    <div class="lpl">
                        <lfl-icon icon="lpl" class="lpl-logo"></lfl-icon>
                        <div class="info">
                            <p>LOL Pro League &trade;</p>
                            <p>正版授权</p>
                        </div>
                    </div>
                </div>
                <p>© 2017 Score. All Rights Reserved <span class="icp">沪ICP备14044347号-8</span></p>
                <p>Shanghai Houhan Information Technolony Co.,Ltd.</p>
            </div>
            <div class="code-img">
                <img src="/static/image/code-img.png"/>
                <p>扫码下载App</p>
            </div>
            <div class="contact fr">
                <img class="logo" @click="count++" src="/static/image/score_logo.png"/>
                <div class="info">
                    <h2>Let's work together</h2>
                    <p>#1802 Block 3 No.695 Rd.Lingshi, Shanghai, China</p>
                    <p>Call : 021.62522414 </p>
                    <p>Email : <a href="mailto:info@famulei.com">info@famulei.com</a></p>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
</template>

<script>
    export default {

    }
</script>

<style lang="stylus">
    #footer {
        margin-top 95px
        height 280px
        background: #FFFFFF;
        border: 1px solid #E7EDF1;

        .copyright {
            padding-top 85px

            .icp {
                margin-left 10px
            }

            .logo-and-copyright {
                height 48px
                margin-bottom 20px

                .logo {
                    height 38px

                    .icon {
                        display inline-block
                        vertical-align middle

                        &.lfl {
                            height 42px
                            width 42px
                        }

                        &.hls {
                            width 90px
                            height 20px
                        }
                    }
                }

                > * {
                    vertical-align middle
                    display inline-block
                }

                .lpl-logo {
                    width 40px
                    height 40px
                    margin-right 10px
                }

                .split {
                    height 28px
                    width 1px
                    background-color rgba(25, 26, 29, 0.2)
                    margin 6px 22px
                }

                .lpl {
                    color #373A41
                    font-weight bold

                    > * {
                        display inline-block
                        vertical-align middle
                    }

                    p {
                        line-height 20px
                        font-size 14px
                    }

                }
            }

            > p {
                margin-top 6px
                font-weight bold
                font-size: 12px;
                color: #A5A8B2;
                height 16px
                line-height 16px

                a {
                    color #000
                }
            }
        }

        .contact {
            padding-top 96px

            .logo {
                margin-top 6px
                height 83px
                float right
                margin-left 25px
            }

            h2 {
                height 21px
                line-height 21px
                font-size 16px
                color: #373A41;
            }

            .info {
                float left
                text-align right
            }

            p {
                margin-top 10px
                font-size: 12px;
                color: #A5A8B2;
                height 16px
                line-height 16px

                a {
                    color #000
                }

                + p {
                    margin-top 5px
                }
            }
        }

        .code-img {
            width 100px
            height 125px
            left 50%
            margin-left -50px
            margin-top 80px
            background: #F5F6F9;
            border-radius: 2px;
            position absolute
            padding 5px

            img {
                width 90px
                height 90px
            }

            p {
                font-size: 12px;
                color: #A5A8B2;
                margin-top 2px
                height 16px
                line-height 16px
                text-align center
            }
        }

    }

    @media screen and (max-width: 1024px) {
        [data-page=mall] {
            #footer {
                display none;
            }
        }
        [data-page=mall-detail] {
            #footer {
                display none;
            }
        }
    }
</style>
