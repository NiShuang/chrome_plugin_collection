import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class DataCollector extends BasePluginComponent {
  
  constructor() {
    super();
    this.test = this.test.bind(this);
  }
 
  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.GUANGXIAOBAO_ORDER, this.test)
    ];
  }

  onFailToHandle() {
    return;
  }

  collect = (currentList) => {
    // 数据为空无需采集
    if ($(".table-section tbody tr.order-name").length < 1) {
      return;
    }

    // 数据格式
    const record = {
      "event": "gxb_order_data",
      "data": {
        "platform": "gxb",  // 写死。固定不变
        "account": "Insta360",  // 推广计划,左上角有
        "campaign_name": "",
        "order_id": "",
        "create_time": "",
        "deal_time": "",
        "amount": 0
      },
      "timestamp": ""
    }

    const postForm = {
      "app": "chrome_plugin",
      "records": []
    }

    const account = $(".monitor-select-wrapper input").attr("value");

    // 数据采集
    const dataCols = $(".table-section tbody tr.order-name");
    dataCols.each((i, v) => {
      let record = {
        "event": "gxb_order_data",
        "data": {
          "platform": "gxb",  // 写死。固定不变
          "account": account,  // 推广计划,左上角有
          "campaign_name": $(currentList).text(),
          "order_id": $(v).children("td").first().children("span").first().text(),
          "create_time": $(v).children("td").eq(2).children("p").eq(0).children("span").eq(1).text(),
          "deal_time": $(v).children("td").eq(2).children("p").eq(1).children("span").eq(1).text(),
          "amount": Number($(v).children("td").eq(3).children("span").first().children("span").first().text())
        },
        "timestamp": new Date().getTime()
      }
      postForm.records.push(record);
    })

    // 控制台测试
    console.log(postForm.records);

    // 提交数据
    postForm.records = JSON.stringify(postForm.records);
    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      data: postForm,
      success: function () {
        console.log("当前页抓取成功")
      },
      error: function () {
        console.log("当前页抓取失败")
      }
    });

    const next = $(".control-item.c-front.disable").first();
    if (next === undefined) {
      $(".control-item.c-front").first().click();
      setTimeout(() => {
        this.collect(currentList);
      }, 1000);
    }
  }

  test = () => {
    // 路径判断
    if (!$(".g-page-title > a").eq(2) || $(".g-page-title > a").eq(2).text() !== "订单分析") {
      alert("请选择正确路径：推广计划 -> 选择 Insta360 -> 行为分析 -> 成交 -> 订单");
      return;
    }

    // 收集数据
    const liArray = $(".scroll-view").eq(1).find(".li");

    const run = (i) => {
      if (i >= liArray.length) {
        alert("数据抓取完毕");
        return
      }
      const li = $(liArray[i]).children(".text");
      li.click();
      setTimeout(() => {
        this.collect(li);
        run(i + 1);
      }, 1000);
    };
    run(1);

  }

}

new DataCollector().start();