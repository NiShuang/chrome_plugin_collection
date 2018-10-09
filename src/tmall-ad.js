import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

  constructor() {
    super();
    this.test = this.test.bind(this);
  }

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.TMALL_AD, this.test)
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

  test() {
    const timestamp = new Date().getTime();
    const postData = {
      "app": "chrome_plugin",
      "records": [
        {
          "event": "tmall_ad_data",
          "data": {
            "date": null, //（时间区间的起始日期）
            "cost": null, // 花费
            "revenue": null, // 总成交金额/订单金额
            "impressions": null, // 展现量
            "clicks": null, // 点击量
            "orders": null, // 总成交笔数/总订单行
            "shop": "tmall",
            "currency": ""
          },
          "timestamp": timestamp
        }
      ]
    };

    // 页面判断
    if (!window.location.hash.includes("!/report/bpreport/index")) {
      alert("请选择 报表->直通车报表->转化周期：15天累计数据->选择上周(周一至周日)（或者自己指定日期区间，必须为周一到周日）");
      return;
    }

    if ($(".dropdown-text").first().text() !== "转化周期:15天累计数据") {
      alert("请选择 转化周期：15天累计数据");
      return;
    }

    // 日期判断
    if ($(".btn.time-sel.fr > span").text().trim() === "上周（周一至周日）") {
      postData.records[0].data.date = this.getLastWeekMonday();
    } else if ($(".btn.time-sel.fr > span").text().trim() === "上周（周日至周六）") {
      alert("请选择 上周(周一至周日)（或者自己指定日期区间，必须为周一到周日）");
      return;
    } else if ($(".btn.time-sel.fr > span").text().trim() === "过去7天") {
      if (new Date().getDay() !== 1) {
        alert("请选择 上周(周一至周日)（或者自己指定日期区间，必须为周一到周日）");
        return;
      } else {
        postData.records[0].data.date = this.getLastWeekMonday();
      }
    } else {
      let dateSection = $(".btn.time-sel.fr > span").text().split("至");
      if (dateSection.length !== 2) {
        alert("请选择 上周(周一至周日)（或者自己指定日期区间，必须为周一到周日）");
        return;
      }
      let dateFrom = new Date(dateSection[0].trim());
      let dateTo = new Date(dateSection[1].trim())
      if (dateSection.length === 1 || dateFrom.getDay() !== 1 ||
        dateTo.getDate() - dateFrom.getDate() !== 6) {
        alert("请选择 上周(周一至周日)（或者自己指定日期区间，必须为周一到周日）");
        return;
      }
      postData.records[0].data.date = $(".btn.time-sel.fr > span").text().split("至")[0].trim();
    }


    $(".infos-lists td").each((i, v) => {
      switch ($(v).children("span").text()) {
        case "花费": {
          let cost = $(v).children("p.text").text().trim().replace(/￥|,/g, '');
          postData.records[0].data.cost = Number.parseFloat(cost);
          break;
        }
        case "总成交金额": {
          let revenue = $(v).children("p.text").text().trim().replace(/￥|,/g, '');
          postData.records[0].data.revenue = Number.parseFloat(revenue);
          break;
        }
        case "展现量": {
          let impressions = $(v).children("p.text").text().trim().replace(/,/g, '');
          postData.records[0].data.impressions = Number.parseInt(impressions);
          break;
        }
        case "点击量": {
          let clicks = $(v).children("p.text").text().trim().replace(/,/g, '');
          postData.records[0].data.clicks = Number.parseInt(clicks);
          break;
        }
        case "总成交笔数": {
          let orders = $(v).children("p.text").text().trim().replace(/,/g, '');
          postData.records[0].data.orders = Number.parseInt(orders);
          break;
        }
        default:
          break;
      }
    });

    // 判断数据是否完整
    var flag = Object.keys(postData.records[0].data).find(key => {
      console.log(key, postData.records[0].data[key]);
      if (postData.records[0].data[key] === null) {
        switch (key) {
          case "cost":
            alert("数据缺少花费，请在设置中添加'花费'选项");
            return true;
          case "revenue":
            alert("数据缺少总成交金额，请在设置中添加'总成交金额'选项");
            return true;
          case "impressions":
            alert("数据缺少展现量，请在设置中添加'展现量'选项");
            return true;
          case "clicks":
            alert("数据缺少点击量，请在设置中添加'点击量'选项");
            return true;
          case "orders":
            alert("数据缺少总成交笔数，请在设置中添加'总成交笔数'选项");
            return true;
          default:
            break;
        }
      }
    })

    if (flag) {
      return;
    }

    postData.records = JSON.stringify(postData.records);

    // 提交数据
    console.log(postData.records);
    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      data: postData,
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