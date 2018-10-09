import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class TaobaoDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.TMALL_SERVICE, this.test)
    ];
  }

  test() {
    if (!window.location.href.includes("customkpi")) {
      alert("请选择 一目了然->自定义报表->数据采集->按日查看->快捷时间：最近30天->查询");
      return;
    }
    let records = [];
    let timestamp = new Date().getTime();

    // 判断数据所在列，天猫客服抓取询单人数(advisory_count), 询单->次日付款人数(pay_count)
    let dataInColumn = {
      advisory_count: -1,
      pay_count: -1
    }
    $("table#myTable > thead th").each((index, item) => {
      switch ($(item).children("span").text()) {
        case "询单人数": {
          dataInColumn.advisory_count = index;
          break;
        }
        case "询单->次日付款人数": {
          dataInColumn.pay_count = index;
          break;
        }
        default:
          break;
      }
    });

    if (dataInColumn.advisory_count === -1 || dataInColumn.pay_count === -1) {
      alert("请勾选正确的数据：询单人数和询单->次日付款人数");
      return;
    }

    $("table#myTable > tbody > tr").each((index, item) => {
      // 第一行数据延迟统计，不需要采集
      if (index > 0) {
        records.push({
          "event": "tmall_service_data",
          timestamp,
          "data": {
            "date": $(item).children().eq(0).attr("title"),
            "advisory_count":
              isNaN($(item).children().eq(dataInColumn.advisory_count).text()) ?
                0 :
                Number($(item).children().eq(dataInColumn.advisory_count).text()),
            "pay_count":
              isNaN($(item).children().eq(dataInColumn.pay_count).text()) ?
                0 :
                Number($(item).children().eq(dataInColumn.pay_count).text()),
            "shop": "tmall"
          }
        })
      }
    });

    console.log(records);

    let postData = {
      "app": "chrome_plugin",
      "records": JSON.stringify(records)
    }

    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      data: postData,

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

new TaobaoDataCollector().start();