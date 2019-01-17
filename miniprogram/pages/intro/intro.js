// miniprogram/pages/intro/intro.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    introInfo:null,
    likeNum:0,
    gapNum:0,//距离升级差距的升级包数量
    phone:'',
    introId:'',

    showPayDialog:false,//控制付款对话框
    showShareDialog: false,//控制对话框显示的开关
    sendMailDialog: false,// 发送邮件弹框显示开关
    grade:[
      { name: '普通', auth: '查看简历' },
      { name: '精英', auth: '一次人工帮助优化简历的服务' },
      { name: '天才', auth: '平台帮助加推简历50次' },
      { name: '名宿', auth: '平台帮助内top500强' },
    ],
    gradeIndex:0,
    buyLikeNum:10,//购买的升级包个数
    email:'',// 发送简历的邮箱
    needAd:false,// 是否弹出广告
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    wx.request({
      url: 'https://www.kklei.com/need_ad',
      header: app.globalData.header,
      success: (result) => {
        _this.setData({
          needAd : result.data.obj
        })
      }
    })
    /**接收参数 */
    this.setData({
      introId: options.introId
    })

    try {
      const phone = wx.getStorageSync('phone')
      const otherInfo = wx.getStorageSync('introInfo')
      
      this.setData({
        introInfo: { phone: phone, ...otherInfo}
      })
      this.getIntro()
     
    } catch (e) {
      // Do something when catch error
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    
    if (options.from === 'button') {
      // 来自页面内转发按钮
      console.log(options.target)
    }
    return {
      //## 此为转发页面所显示的标题
      title: '点击助我简历升级', 
      //## 此为转发页面的描述性文字
      desc: '江湖救急，还请贵人伸手相助啊!',
      //## 此为转发给微信好友或微信群后，对方点击后进入的页面链接，可以根据自己的需求添加参数
      path: "pages/mine/mine?introId=" + options.target.dataset.id +"&redirec_url=/pages/share/share",
      imageUrl: 'https://www.kklei.com/logo.jpg',
      //## 转发操作成功后的回调函数，用于对发起者的提示语句或其他逻辑处理
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        });
      },
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'none',
        });
      }
    }
    
  },
  /**
   * 根据id查询简历
   */
  getIntro:function(){
    wx.showLoading({
      title: '加载中',
    })
    let _this = this;
    wx.request({
      url: 'https://www.kklei.com/intro_info',
      data:{
        id: _this.data.introId
      },
      header: app.globalData.header,
      success: (result) => {
        //console.log(result)
        _this.setData({
          phone: result.data.obj.phone,
          introInfo: JSON.parse(result.data.obj.introInfo),
          likeNum: result.data.obj.likeNum,
        })
        let grade = 0
        if (_this.data.likeNum<10){
          grade=0
        } else if (_this.data.likeNum >= 10 && _this.data.likeNum < 50) {
          grade = 1
        } else if (_this.data.likeNum >= 50 && _this.data.likeNum < 100) {
          grade = 2
        } else if (_this.data.likeNum >= 100) {
          grade = 3
        }
        if(grade<3){
          _this.setData({
            showShareDialog: true,
            gradeIndex: grade,
          })
        }else{
          _this.setData({
            showShareDialog: false,
            gradeIndex: grade,
          })
        }
        _this.countGap();
        wx.hideLoading()
      },
      fail: (err)=>{

        wx.showToast({
          title: '加载失败',
          icon: 'none',
        });
      }
    })
  },

  /**
   * 根据id删除简历
   */
  deleteIntro:function(){
    let _this = this;
    wx.request({
      url: 'https://www.kklei.com/delete_intro',
      data: {
        id: _this.data.introId
      },
      header: app.globalData.header,
      success: (result) => {
        wx.navigateTo({
          url: '../../pages/mine/mine',
        })
      }
    })
  },
  /**
   * 修改简历
   */
  editIntro:function(){
    wx.navigateTo({
      url: '../../pages/add/add?introId=' + this.data.introId,
    })
  },
  /**
   * 分享加速
   */
  shareIntro:function(){

  },

  /**
   * 关闭对话框
   */
  closeShareDialog:function(){
    this.setData({
      showShareDialog:false,
    })
  },

  /**
   * 显示支付弹框
   */
  showPayDialogFun:function(){
    this.setData({
      showPayDialog: true,
    })
  },
  /**
   * 关闭支付话框
   */
  closePayDialog: function () {
    this.setData({
      showPayDialog: false,
    })
  },

  /**
   * 显示发送邮件弹框
   */
  showSendMail: function () {
    this.setData({
      sendMailDialog:true
    })
  },
  /**
   * 关闭发送邮件弹框
   */
  closeSendMail: function () {
    this.setData({
      sendMailDialog: false,
    })
  },

  /**
   * 减少购买的升级包个数
   */
  minusBuyNum:function(){
    if(this.data.buyLikeNum>0){
      this.setData({
        buyLikeNum: this.data.buyLikeNum - 1
      })
    }
  },
  /**
   * 增加购买的升级包个数
   */
  addBuyNum: function () {
    this.setData({
      buyLikeNum: this.data.buyLikeNum + 1
    })
  },
  /**
   * 计算距离上一级的差距
   */
  countGap:function(){
    let gap = 0;
    if (this.data.likeNum<10){
      gap = 10 - this.data.likeNum
    } else if (this.data.likeNum < 50){
      gap = 50 - this.data.likeNum
    } else if (this.data.likeNum < 100) {
      gap = 100 - this.data.likeNum
    }
    this.setData({
      gapNum:gap,
    })
  },

  /**
   * 跳转到简历预览页面
   */
  goToDetail:function(){
    wx.navigateTo({
      url: '/pages/introDetail/introDetail?introId=' + this.data.introId + '&needAd=' + this.data.needAd,
    })
  },


  /**
   * 发送邮件
   */
  sendmail:function(){
    let _this = this;
    
    this.setData({
      sendMailDialog: false,
    })
    wx.showLoading({
      title: '发送中',
    })
    wx.request({
      url: 'https://www.kklei.com/send_mail',
      data: {
        id: _this.data.introId,
        email: _this.data.email,
      },
      header: app.globalData.header,
      success: (result) => {
        wx.showToast({
          title: '邮件发送成功',
        });
      },
      fail: function () {
        wx.showToast({
          title: '发送失败失败',
          icon: 'none',
        });

      }
    })
  },

  /** 绑定输入的信息 */
  bindInputByKey: function (e) {
    let key = e.currentTarget.dataset.key // 对应字段
    this.setData({
      [key]: e.detail.value,
    })
  },
 
})