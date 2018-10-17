import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class TaobaoDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.JD_COMMERCE, this.test)
    ];
  }

  test() {
    let records = [];
    let timestamp = new Date().getTime();
    // let reg = /\d{4}\-\d{1,2}\-\d{1,2}/g;

    if (!window.location.href.includes("reportLists")) {
      alert("请选择 报表->报表分析->我的报表->【数据采集报表】预览");
      return ;
    }

    if ($(".pinning-body tr").length === 0){
      alert("请打开预览进行数据采集");
      return;
    }

    // 判断数据所在列，京东交易抓取访客数(visitor), 成交客户数(buyer), 商品关注人数(collect_count), 加购商品件数(cart_count)
    let dataInColumn = {
      visitor: -1,
      buyer: -1,
      collect_count: -1,
      cart_count: -1
    }

    // normal-header有两个，取第二个
    $("div.normal-header").eq(1).find("th").each((index, item) => {
      switch ($(item).find("span.ng-binding").text()) {
        case "访客数-全部渠道": {
          dataInColumn.visitor = index;
          break;
        }
        case "成交客户数-全部渠道": {
          dataInColumn.buyer = index;
          break;
        }
        case "商品关注人数": {
          dataInColumn.collect_count = index;
          break;
        }
        case "加购商品件数-全部渠道": {
          dataInColumn.cart_count = index;
          break;
        }
        default:
          break;
      }
    });

    if (dataInColumn.buyer === -1 || dataInColumn.visitor === -1 || 
        dataInColumn.collect_count === -1 || dataInColumn.cart_count === -1) 
    {
      alert("请勾选正确的数据：访客数,成交客户数,商品关注人数,加购商品件数");
      return;
    }

    $(".pinning-body tr").each((index, item) => {
      // normal-body这个网站有两个，需要取后面一个
      let dataRow = $(".normal-body").eq(1).find("tr").eq(index);
      records.push({
        "event": "jd_commerce_data",
        timestamp,
        "data": {
          "date": $(item).find("span.cell-content-normal").text(),
          "visitor": 
            Number($(dataRow).find("td").eq(dataInColumn.visitor).find("span.cell-content-normal").text().replace(/,/g, "")),
          "buyer": 
            Number($(dataRow).find("td").eq(dataInColumn.buyer).find("span.cell-content-normal").text().replace(/,/g, "")),
          "cart_count": 
            Number($(dataRow).find("td").eq(dataInColumn.cart_count).find("span.cell-content-normal").text().replace(/,/g, "")),
          "collect_count": 
            Number($(dataRow).find("td").eq(dataInColumn.collect_count).find("span.cell-content-normal").text().replace(/,/g, "")),
          "shop": "jd"
        }
      });
    })

    console.log(records,dataInColumn);

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