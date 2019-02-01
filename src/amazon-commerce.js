import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.AMAZON_COMMERCE, this.test)
    ];
  }

  onFailToHandle() {
    return;
  }

  test() {
    // 查看是否在正确的页面使用插件
    if (!$("#reportTitle").text().includes("父商品详情页")) {
      alert("请选择 数据报告->业务报告->父商品详情页面上的销售量与访问量->选择日期（起始日期和结束日期必须为同一天）");
      return;
    }

    // 查看勾选天数是否为一天
    let fromDate = $("#datePicker > #fromDate2").val();
    let toDate = $("#datePicker > #toDate2").val();
    if (fromDate != toDate) {
      alert("只能勾选一天进行数据采集");
      return;
    }

    let records = [];
    let timestamp = new Date().getTime();

    let visitor = 0, buyer = 0;

    // 欧洲亚马逊是一个选择器，美亚和日亚直接选择国家
    let country = $("#sc-mkt-picker-switcher-select").length ?
      $("#sc-mkt-picker-switcher-select").find("option:selected").text().trim()
      : $(".sc-mkt-picker-switcher-txt").text().trim();

    // 账号前缀
    let countName = $('.sc-mkt-picker-switcher-txt').text();

    $("table#dataTable > tbody > tr").each((index, item) => {
      let visitorAll = Number($(item).children("td._AR_SC_MA_Sessions_25920").text().replace(/\,/g, ''));
      let visitorPer = (Number($(item).find("td._AR_SC_MA_BuyBoxPercentage_25956 > nobr").text().replace(/\%$/, '')) / 100).toFixed(4);

      // console.log(visitorAll, visitorPer, (visitorAll * Number(visitorPer)).toFixed(0));
      // 如果购买按钮赢得率为0，但是又有订购商品数，则访客数应该为订购商品数
      if (Number(visitorPer) === 0) {
        visitor += Number($(item).children("td._AR_SC_MA_UnitsOrdered_40590").text().replace(/\,/g, ''));
      } else {
        visitor += Number((visitorAll * Number(visitorPer)).toFixed(0));
      }
      buyer += Number($(item).children("td._AR_SC_MA_UnitsOrdered_40590").text().replace(/\,/g, ''));
    })

    records.push({
      "event": "amazon_commerce_data",
      timestamp,
      "data": {
        "date": fromDate,
        visitor,
        buyer,
        "shop": `${countName}-${country}`,
      }
    });

    console.log(records);

    let postData = {
      "app": "chrome_plugin",
      "records": records
    }

    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      data: JSON.stringify(postData),
      contentType: 'application/json;charset=utf-8',
      success: function () {
        alert("数据抓取成功");
      },
      error: function () {
        alert("数据抓取失败，请稍后重试")
      }
    });

    console.log(postData);
  }
}

new BaiduDataCollector().start();