import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

  constructor() {
    super();
    this.test = this.test.bind(this);
  }

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.JD_AD, this.test)
    ];
  }

  getLastWeekMonday() {
    let now = new Date();

    let nowDayOfWeek = now.getDay();
    let nowDay = now.getDate();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();

    let lastWeekDay = nowDay - 6 - nowDayOfWeek;
    lastWeekDay = lastWeekDay < 10 ? `0${lastWeekDay}` : lastWeekDay;
    let lastWeekMonth = lastWeekDay < 1 ? nowMonth - 1 : nowMonth;
    lastWeekMonth = lastWeekMonth < 9 ? `0${lastWeekMonth + 1}` : `${lastWeekMonth + 1}`;
    let lastWeekYear = lastWeekMonth < 0 ? nowYear - 1 : nowYear;

    return `${lastWeekYear}-${lastWeekMonth}-${lastWeekDay}`;
  }

  formateDate(dateArr) {
    let formDateArr = dateArr.map(v => `${v.substr(0, 4)}-${v.substr(4, 2)}-${v.substr(6, 2)}`);
    return formDateArr;
  }

  test() {
    const timestamp = new Date().getTime();
    const postData = {
      "app": "chrome_plugin",
      "records": [
        {
          "event": "jd_ad_data",
          "data": {
            "date": null, //（时间区间的起始日期）
            "cost": null, // 花费
            "revenue": null, // 总成交金额/订单金额
            "impressions": null, // 展现量
            "clicks": null, // 点击量
            "orders": null, // 总成交笔数/总订单行
            "shop": "jd",
            "currency": ""
          },
          "timestamp": timestamp
        }
      ]
    };

    // 页面判断
    if (!window.location.hash.includes("/report/account")) {
      alert("请选择正确路径 数据报表 -> 账户报表");
      return;
    }

    // 条件筛选
    if ($(".checkbox-con.ml5 > input:checked").length === 1 ||
      !$(".tab-nav.tab-btn > li").eq(0).hasClass("active") ||
      $(".jad-select-btn-content").first().text() !== "15天" ||
      $(".jad-select-btn-content").eq(1).text() !== "下单口径" ||
      $(".jad-select-btn-content").eq(2).text() !== "成交订单") {
      alert("请选择 取消分日报告 -> 全部 ->  15天 ->  下单口径 -> 成交订单 -> 查询");
      return;
    }

    // 日期判断
    const weekMilliSeconds = 604800000;
    var dateSection = this.formateDate($(".fht-tbody tbody > tr").first().children("td").first().children("div").children("div").text().split("~"));
    var fromDate = new Date(dateSection[0].trim());
    var toDate = new Date(dateSection[1].trim());
    if (fromDate.getDay() !== 1 || toDate.getDay() !== 0 ||
      toDate.getTime() - fromDate.getTime() > weekMilliSeconds) {
      alert("请选择 指定日期区间（必须为周一到周日, 7天）, 并点击查询之后再进行数据采集");
      return;
    }
    postData.records[0].data.date = dateSection[0].trim();

    $(".fht-tbody thead th").each((i, v) => {
      switch (v.id) {
        case "Impressions": {
          let impressions = $(".fht-tbody tbody > tr").eq(1).children("td").eq(i - 2).
            children("div").children("div").text().replace(/,/g, '');
          postData.records[0].data.impressions = Number.parseInt(impressions);
          break;
        }
        case "Clicks": {
          let clicks = $(".fht-tbody tbody > tr").eq(1).children("td").eq(i - 2).
            children("div").children("div").text().replace(/,/g, '');
          postData.records[0].data.clicks = Number.parseInt(clicks);
          break;
        }
        case "Cost": {
          let cost = $(".fht-tbody tbody > tr").eq(1).children("td").eq(i - 2).
            children("div").children("div").text().replace(/,/g, '');
          postData.records[0].data.cost = Number.parseFloat(cost);
          break;
        }
        case "TotalOrderCnt": {
          let orders = $(".fht-tbody tbody > tr").eq(1).children("td").eq(i - 2).
            children("div").children("div").text().replace(/,/g, '');
          postData.records[0].data.orders = Number.parseInt(orders);
          break;
        }
        case "TotalOrderSum": {
          let revenue = $(".fht-tbody tbody > tr").eq(1).children("td").eq(i - 2).
            children("div").children("div").text().replace(/,/g, '');
          postData.records[0].data.revenue = Number.parseFloat(revenue);
          break;
        }
        default:
          break;
      }
    });

    // 判断数据是否完整
    var flag = Object.keys(postData.records[0].data).find(key => {
      if (postData.records[0].data[key] === null) {
        switch (key) {
          case "cost":
            alert("数据缺少总费用，请在自定义列中添加'总费用'选项");
            return true;
          case "revenue":
            alert("数据缺少总订单金额，请在自定义列中添加'总订单金额'选项");
            return true;
          case "impressions":
            alert("数据缺少展现数，请在自定义列中添加'展现数'选项");
            return true;
          case "clicks":
            alert("数据缺少点击量，请在自定义列中添加'点击量'选项");
            return true;
          case "orders":
            alert("数据缺少总订单行，请在自定义列中添加'总订单行'选项");
            return true;
          default:
            break;
        }
      }
    })

    if (flag) {
      return;
    }


    // 提交数据
    console.log(postData.records);
    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      contentType: 'application/json;charset=utf-8',
      data: JSON.stringify(postData),
      success: function () {
        alert("数据抓取成功");
      },
      error: function () {
        alert("数据抓取失败，请稍后重试");
      }
    });

  }


}

new BaiduDataCollector().start();