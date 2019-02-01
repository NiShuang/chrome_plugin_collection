import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class DataCollector extends BasePluginComponent {

  constructor() {
    super();
    this.test = this.test.bind(this);
  }

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.AMAZON_AD, this.test)
    ];
  }

  onFailToHandle() {
    return;
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

  formateDate(dateStr) {
    let formDate = dateStr.split("-").map(v => v.length === 1 ? `0${v}` : v).join("-");
    return formDate;
  }

  test() {
    const timestamp = new Date().getTime();

    // 欧洲亚马逊是一个选择器，美亚和日亚直接选择国家
    let country = $("#sc-mkt-picker-switcher-select").length ?
      $("#sc-mkt-picker-switcher-select").find("option:selected").text().trim()
      : $(".sc-mkt-picker-switcher-txt").text().trim();

    // 账号前缀
    let countName = $('.sc-mkt-picker-switcher-txt').text();
    
    const postData = {
      "app": "chrome_plugin",
      "records": [
        {
          "event": "amazon_ad_data",
          "data": {
            "date": null, //（时间区间的起始日期）
            "cost": null, // 花费
            "revenue": null, // 总成交金额/订单金额
            "impressions": null, // 展现量
            "clicks": null, // 点击量
            "orders": null, // 总成交笔数/总订单行
            "shop": `${countName}-${country}`,
            "currency": null,
          },
          "timestamp": timestamp
        }
      ]
    };

    

    // 页面判断
    if (!window.location.pathname.includes("cm/campaigns")) {
      alert("请选择正确路径 广告 -> 广告活动");
      return;
    }

    // 日期判断
    const weekMilliSeconds = 604800000;
    var dateSection;
    var fromDate;
    var toDate;
    var dateText = $("[data-e2e-id='dateRangeFilter'] div button").text()
    if (dateText === "日期范围 - 最近 7 天") {
      if (new Date().getDay() !== 1) {
        alert("请选择 指定日期区间（必须为周一到周日, 7天）");
        return;
      } else {
        postData.records[0].data.date = this.getLastWeekMonday();
      }
    } else {
      dateSection = dateText.split("-").slice(1);
      if (dateSection.length === 1) {
        console.log(dateSection.length);
        alert("请选择 指定日期区间（必须为周一到周日, 7天）");
        return;
      }
      fromDate = new Date(dateSection[0].trim().replace(/年|月/g, "-").replace(/日/, ''));
      toDate = new Date(dateSection[1].trim().replace(/年|月/g, "-").replace(/日/, ''));
      if (fromDate.getDay() !== 1 || toDate.getDay() !== 0 ||
        toDate.getTime() - fromDate.getTime() > weekMilliSeconds) {
        console.log(fromDate, toDate);
        alert("请选择 指定日期区间（必须为周一到周日, 7天）");
        return;
      } else {
        postData.records[0].data.date = this.formateDate(dateSection[0].trim().
          replace(/年|月/g, "-").replace(/日/, ''));
      }
    }

    $(".Grid__row__1jUwn > div").each((i, v) => {
      switch ($(v).find(".KPI__kpiTitleContainer__3YbXd").text()) {
        case "曝光量": {
          let impressions = $(v).children("p").children("span").children("span").text().
            replace(/,/g, '');
          postData.records[0].data.impressions =
            isNaN(Number.parseInt(impressions)) ? 0 : Number.parseInt(impressions);
          break;
        }
        case "点击次数": {
          let clicks = $(v).children("p").children("span").children("span").text().
            replace(/,/g, '');
          postData.records[0].data.clicks =
            isNaN(Number.parseInt(clicks)) ? 0 : Number.parseInt(clicks);
          break;
        }
        case "花费": {
          let currency = $(v).children("p").children("span").text().slice(0, 1);
          let cost = $(v).children("p").children("span").text().slice(1).
            replace(/,/g, '');
          postData.records[0].data.currency = currency === '-' ? '' : currency;
          postData.records[0].data.cost =
            isNaN(Number.parseInt(cost)) ? 0 : Number.parseFloat(cost);
          break;
        }
        case "订单": {
          let orders = $(v).children("p").children("span").children("span").text().
            replace(/,/g, '');
          postData.records[0].data.orders =
            isNaN(Number.parseInt(orders)) ? 0 : Number.parseInt(orders);
          break;
        }
        case "销售额": {
          let currency = $(v).children("p").children("span").text().slice(0, 1);
          let revenue = $(v).children("p").children("span").text().slice(1).
            replace(/,/g, '');
          postData.records[0].data.currency = currency === '-' ? '' : currency;
          postData.records[0].data.revenue =
            isNaN(Number.parseInt(revenue)) ? 0 : Number.parseFloat(revenue);
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
            alert("数据缺少花费，请删除不必要的数据，并添加指标'花费'");
            return true;
          case "revenue":
            alert("数据缺少销售额，请删除不必要的数据，并添加指标'销售额'");
            return true;
          case "impressions":
            alert("数据缺少曝光量，请删除不必要的数据，并添加指标'曝光量'");
            return true;
          case "clicks":
            alert("数据缺少点击次数，请删除不必要的数据，并添加指标'点击次数'");
            return true;
          case "orders":
            alert("数据缺少订单，请删除不必要的数据，并添加指标'订单'");
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

new DataCollector().start();