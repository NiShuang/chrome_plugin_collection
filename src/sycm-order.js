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

      let parts = dateRange.split("|");
      let startDate = parts[0];
      let endDate = parts[1];
      let startStr = startDate.replace(/-/g, '/');
      let endStr = endDate.replace(/-/g, '/');

      let start = new Date(startStr);
      let end = new Date(endStr);
      let days = parseInt(( end- start)/ (1000 * 60 * 60 * 24));

      let timestamp = new Date().getTime();

      for (var j = 0; j < days; j ++) {
        start.setDate(start.getDate() + 1);
        let date = start;
        var year = date.getFullYear(); 
        var month =(date.getMonth() + 1).toString(); 
        var day = (date.getDate()).toString();  
        if (month.length == 1) { 
            month = "0" + month; 
        } 
        if (day.length == 1) { 
            day = "0" + day; 
        }
        let dateStr = year + "-" + month + "-" + day;
        console.log(dateStr);
        let api = "https://sycm.taobao.com/flow/v3/media/report/list/unit.json";
        let params = {
          dateType: "day",
          dateRange: dateStr + "|" + dateStr,
          pageSize: 100,
          page: 1,
          indexCode: "paySuccCnt,paySuccAmt",
          planId: planId,
          isAlldays: false
        }

        $.ajax({
          url: api,
          method: "GET",
          contentType: 'application/json;charset=utf-8',
          data: params,
          success: function(res) {
            console.log(res);
            let data = res.data.data;
            let records = [];
            for(let i=0; i<data.length; i++) {
              let item = data[i];
              records.push({
                "event": "sycm_order_data",
                timestamp,
                "data": {
                  "date": item.statDate.value,
                  "payCount": item.paySuccCnt.value,
                  "payAmount": item.paySuccAmt.value,
                  "planId": planId,
                  "planName": planName,
                  "unitId": item.unitId.value,
                  "unitName": item.name.value
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
                console.log(planName + " " + dateStr + " " + "成交数据抓取成功");
              },
              error: function() {
                alert("数据抓取失败，请稍后重试");
              }
            }); 
            console.log(postData);
          }
        });
      }
      alert(planName + " " + dateRange + " " + "成交数据抓取中");
  }
}

new SycmDataCollector().start();