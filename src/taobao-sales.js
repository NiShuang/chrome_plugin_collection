import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class TaobaoSalesCollector extends BasePluginComponent {

  constructor() {
    super();
    this.test = this.test.bind(this);
  }

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.TAOBAO_SALES, this.test),
    ];
  }

  onFailToHandle() {
    return;
  }

  collect = () => {
    const postForm = {
      "app": "chrome_plugin",
      "records": []
    }
    const product = $("input.search-combobox-input").eq(0).attr("value").replace(/\+/g, " ");
    const items = $("#mainsrp-itemlist").find(".item");
    console.log(items.length)
    items.each((i, v) => {
      let div = $(v).children().eq(1);
      let div1 = $(div).children().eq(0);
      let div2 = $(div).children().eq(1);
      let div3 = $(div).children().eq(2);
      let payCnt = $(div1).children().eq(1).text();
      let a = $(div2).children("a").eq(0);
      let title = $(a).text().trim();
      let commodityId = $(a).attr("data-nid");
      let price = $(a).attr("trace-price");
      let shopA = $(div3).find("a").eq(0);
      let shopName = $(shopA).children("span").eq(1).text();
      let shopId = $(shopA).attr("data-userid");
      let shopLink = $(shopA).attr("href");

      let record = {
        "event": "taobao_sales",
        "data": {
          "price": Number(price),  
          "pay": payCnt,
          "title": title,
          "commodity_id": commodityId,
          "shop_name": shopName,
          "shop_id": shopId,
          "shop_link": shopLink,
          "product": product
        },
        "timestamp": new Date().getTime()
      }
      postForm.records.push(record);
    });
        // 控制台测试
    console.log(postForm.records);
    // 提交数据
    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      contentType: 'application/json;charset=utf-8',
      data: JSON.stringify(postForm),
      success: function () {
        console.log("当前页抓取成功")
      },
      error: function () {
        console.log("当前页抓取失败")
      }
    });
  }

  test() {   
    this.collect();
  }

  startCollect = () => {
    var interval = setInterval(() => {
      let items = $("#mainsrp-itemlist").find(".item");
      if (items.length > 0) {
        this.collect();
        clearInterval(interval);
      }
    }, 1000);   
  }
}

let collector = new TaobaoSalesCollector();
collector.start();
collector.startCollect();