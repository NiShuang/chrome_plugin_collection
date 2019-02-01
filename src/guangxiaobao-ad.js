import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.GUANGXIAOBAO_AD, this.test)
    ];
  }

  onFailToHandle() {
    return;
  }

  collect = (currentList) => {
    // 数据为空无需采集
    if ($(".table-section tbody tr").length === 1) {
      return;
    }

    // 数据格式
    const record = {
      "event": "gxb_ad_data",
      "data": {
        "platform": "gxb",  // 写死。固定不变
        "account": "Insta360",  // 推广计划,左上角有
        "date": "2018-07-07",
        "campaign_name": "微博Daily Content-长板女孩",
        "order": 2,
        "amount": 100.2
      },
      "timestamp": "1234567890123"
    }

    const postForm = {
      "app": "chrome_plugin",
      "records": []
    }

    const account = $(".monitor-select-wrapper input").attr("value");

    const colMap = {};
    $(".table-section thead th").each((i, v) => {
      switch($(v).children("em").text()) {
        case "流量发生日期": {
          colMap["date"] = i;
          break;
        }
        case "成交订单数": {
          colMap["order"] = i;
        }
        case "成交金额": {
          colMap["amount"] = i;
        }
        default : break;
      }
    })

    // 数据采集
    const dataCols = $(".table-section tbody tr").slice(1);
    dataCols.each((i, v) => {
      let record = {
        "event": "gxb_ad_data",
        "data": {
          "platform": "gxb",  // 写死。固定不变
          "account": account,  // 推广计划,左上角有
          "date": $(v).children("td").eq(colMap["date"]).children("span").first().text(),
          "campaign_name": $(currentList).text(),
          "order": Number($(v).children("td").eq(colMap["order"]).children("span").first().text().replace(/,/g, '')),
          "amount": Number($(v).children("td").eq(colMap["amount"]).children("span").first().text().replace(/,/g, ''))
        },
        "timestamp": new Date().getTime()
      }
      postForm.records.push(record);
    })

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

  test = () => {
    // 路径判断
    if (!$(".g-page-title > a").eq(2) || $(".g-page-title > a").eq(2).text() !== "趋势分析") {
      alert("请选择正确路径：推广计划 -> 选择 Insta360 -> 行为分析 -> 成交");
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

new BaiduDataCollector().start();