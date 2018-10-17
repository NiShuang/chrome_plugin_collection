import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class TaobaoDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.TAMLL_COMMERCE, this.test)
    ];
  }

  test() {
    let theads = $(".preview-table-container .oui-table-wrapper .preview-table .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-content .ant-table-scroll .ant-table-body table>thead tr th");
    let theadsArr = [];
    let dataCount = $(".preview-table-container .oui-table-wrapper .preview-table .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-content .ant-table-scroll .ant-table-body table>tbody tr.ant-table-row-level-0").length;
    
    if(dataCount == 0) {
      alert("请选择 取数->我的报表->个人报表【数据采集报表】->预览");
      return;
    }
    if($(".profile > div").eq(2).children(".value").text() != "自然日") {
      alert("时间周期请选择按日查看");
      return ;
    }
    let timestamp = new Date().getTime();

    let dataInColumn = {
      date: -1,
      visitor: -1,
      buyer: -1,
      collect_count: -1,
      cart_count: -1
    }

    // 数据源
    let dataSrc = {};
    theads.each((index, thead) => {
      let headStr = $(thead).find("span").text();
      theadsArr.push(headStr);

      // let tcolumn = $(".preview-table-container .oui-table-wrapper .preview-table .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-content .ant-table-scroll .ant-table-body table>tbody tr.oui-table-row-tree-node-"+index+" td");

      switch (headStr) {
        case "统计日期": {
          // let date = [];
          // tcolumn.each((index, data) => {
          //   date.push($(data).text());
          // });
          // dataSrc["date"] = date;
          dataInColumn.date = index;
          break;
        }
        case "访客数": {
          // let visitor = [];
          // tcolumn.each((index, data) => {
          //   visitor.push($(data).text());
          // });
          // dataSrc["visitor"] = visitor;
          dataInColumn.visitor = index;
          break;
        }
        case "支付买家数": {
          // let buyer = [];
          // tcolumn.each((index, data) => {
          //   buyer.push($(data).text());
          // });
          // dataSrc["buyer"] = buyer;
          dataInColumn.buyer = index;
          break;
        }
        case "商品收藏买家数": {
          // let collect_count = [];
          // tcolumn.each((index, data) => {
          //   collect_count.push($(data).text());
          // });
          // dataSrc["collect_count"] = collect_count;
          dataInColumn.collect_count = index;
          break;
        }
        case "加购件数": {
          // let cart_count = [];
          // tcolumn.each((index, data) => {
          //   cart_count.push($(data).text());
          // });
          // dataSrc["cart_count"] = cart_count;
          dataInColumn.cart_count = index;
          break;
        }
        default:
          break;
      }
    });

    // if(!theadsArr.includes("访客数") || !theadsArr.includes("支付买家数") || !theadsArr.includes("商品收藏买家数") || !theadsArr.includes("加购件数")) {
    //   alert("请勾选正确的数据（访客数，支付买家数，商品收藏买家数，加购件数）");
    //   return;
    // }
    if (dataInColumn.buyer === -1 || dataInColumn.visitor === -1 || 
      dataInColumn.collect_count === -1 || dataInColumn.cart_count === -1) 
  {
    alert("请勾选正确的数据（访客数，支付买家数，商品收藏买家数，加购件数）");
    return;
  }

    let records = [];
    console.log(dataCount)
    for(let i=1; i<dataCount+1; i++) {
      let dataRow = $(".preview-table-container .oui-table-wrapper .preview-table .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-content .ant-table-scroll .ant-table-body table>tbody tr.oui-table-row-tree-node-"+i);
      records.push({
        "event": "tmall_commerce_data",
        timestamp,
        "data": {
          // "date": dataSrc.date[i],
          // "visitor": Number(dataSrc.visitor[i].replace(/,/g, "")),
          // "buyer": Number(dataSrc.buyer[i].replace(/,/g, "")),
          // "cart_count": Number(dataSrc.cart_count[i].replace(/,/g, "")),
          // "collect_count": Number(dataSrc.collect_count[i].replace(/,/g, "")),
          "date": $(dataRow).find("td").eq(dataInColumn.date).text(),
          "visitor": $(dataRow).find("td").eq(dataInColumn.visitor).text().replace(/,/g, ""),
          "buyer": $(dataRow).find("td").eq(dataInColumn.buyer).text().replace(/,/g, ""),
          "collect_count": $(dataRow).find("td").eq(dataInColumn.collect_count).text().replace(/,/g, ""),
          "cart_count": $(dataRow).find("td").eq(dataInColumn.cart_count).text().replace(/,/g, ""),
          "shop": "tmall"
        }
      });
    }

    console.log(records);

    let postData = {
      "app":"chrome_plugin",
      "records": JSON.stringify(records)
    }

    $.ajax({
      url: "https://openapi.insta360.com/data_collection/v1/collect",
      method: "POST",
      data: postData,
      success: function() {
        alert("数据抓取成功");
      },
      error: function() {
        alert("数据抓取失败，请稍后重试");
      }
    });
    
    console.log(postData);
  }

}

new TaobaoDataCollector().start();