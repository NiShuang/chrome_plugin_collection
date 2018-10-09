import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class TaobaoDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.JD_SERVICE, this.test)
    ];
  }

  test() {
    if($("#main-container").attr("src") != "/waiterPerson/sales/initList" ||
       $("#main-container").contents().find(".tab-container li").eq(3).attr("class") != "active") 
    {
      alert("请选择 客服个人工作数据->销售绩效->24小时->选择客服->按日查看->快捷时间：最近30天->查询");
      return;
    }

    let records = [];
    let timestamp = new Date().getTime();

    $("#main-container").contents().find("tbody.data-container > tr").each((index, item) => {
      // 前两行为总值和均值，忽略
      if (index > 1) {
        records.push({
          "event": "jd_service_data",
          timestamp,
          "data": {
            "date": $(item).find("td.date > a").text(),
            "advisory_count":
              isNaN($(item).children("td.beforeOrderCusNum").text()) ?
                0 :
                Number($(item).children("td.beforeOrderCusNum").text()),
            "pay_count":
              isNaN($(item).children("td.twentyFourNotCanceledOrderCusNum").text()) ?
                0 :
                Number($(item).children("td.twentyFourNotCanceledOrderCusNum").text()),
            "shop": "jd",
          }
        })
      }
    });

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