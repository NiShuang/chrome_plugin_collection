import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class SycmDataCollector extends BasePluginComponent {

  getContextMenuConfig() {
    return [
      new ContextMenuConfig(ContextMenus.SYCM_ORDER, this.test),
    ];
  }

  onFailToHandle() {
    return;
  }

  test() {
    // 页面判断
      if (!window.location.href.includes("flow/outplan/monitor")) {
        alert("请选择 流量->媒介监控->选择一个计划的投放报告->选择统计时间段");
        return;
      }
      let planId = null;
      let dateRange = null;
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == 'planId')
            {
              planId = pair[1];
            }
            if(pair[0] == 'dateRange')
            {
              dateRange = decodeURI(pair[1]);
            }
      }
      if (planId == null) {
        alert("请选择一个计划的投放报告");
        return;
      }
      if (dateRange == null) {
        alert("请选择统计时间");
        return;
      }
      console.log(dateRange);
      let planName = $(".ant-select-selection-selected-value").eq(0).text();

      let api = "https://sycm.taobao.com/flow/v3/media/report/chain/overview/trend.json";
      let params = {
          dateType: "range",
          dateRange: dateRange,
          indexCode: "paySuccCnt,paySuccAmt",
          planId: planId,
          isAlldays: false
      }
      let timestamp = new Date().getTime();
      $.ajax({
          url: api,
          method: "GET",
          contentType: 'application/json;charset=utf-8',
          data: params,
          success: function(res) {
            let data = res.data;
            let statDate = data.statDate;
            let paySuccCnt = data.paySuccCnt;
            let paySuccAmt = data.paySuccAmt;
            let records = [];
            for(let i=0; i<statDate.length; i++) {
              records.push({
                "event": "sycm_order_data",
                timestamp,
                "data": {
                  "date": statDate[i],
                  "payCount": paySuccCnt[i],
                  "payAmount": paySuccAmt[i],
                  "planId": planId,
                  "planName": planName
                }
              });
            }
        
            let postData = {
              "app":"chrome_plugin",
              "records": records
            }
        
            $.ajax({
              url: "https://openapi.insta360.com/data_collection/v1/collect",
              method: "POST",
              contentType: 'application/json;charset=utf-8',
              data: JSON.stringify(postData),
              success: function() {
                alert(planName + " " + dateRange + " " + "成交数据抓取成功");
              },
              error: function() {
                alert("数据抓取失败，请稍后重试");
              }
            }); 
            console.log(postData);
          }
      });
  }
}

new SycmDataCollector().start();