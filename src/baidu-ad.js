import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

    getContextMenuConfig() {
        return [
            new ContextMenuConfig(ContextMenus.BAIDU_AD, this.test)
        ];
    }

    test() {
        // record模板
        const record = {
            "event": "baidu_ad_data",
            "data": {
                "platform": "baidu",  // 写死。固定不变
                "account": null,
                "date": null,
                "campaign_id": null,
                "campaign_name": null,
                "campaign_type": "search",   // 写死，固定不变
                "spend": null,
                "impression": null,
                "click": null,
            },
            "timestamp": ""
        }

        const colMap = {};
        const postData = {
            "app": "chrome_plugin",
            "records": []
        }

        // URL判断
        if (!window.location.href.includes("fengchao.baidu.com")) {
            alert("请进入搜索推广再采集数据");
            return;
        }

        // 路径判断, 正确路径: 推广报告 -> 基础报告 -> 单元报告
        if (!window.location.hash.includes("/dataCenter/index~report=unitReport")) {
            alert("请选择 推广报告 -> 基础报告 -> 单元报告");
            return;
        }

        // 条件筛选, 正确条件: 推广设备：全部，时间单位：分日，投放网络：全部，购买方式：全部，单元筛选：全部 
        if ($("#module-dataCenter-commonSubModule-filterWidget-filters-device > .dc-common-filterWidget-category-item-selected").text().trim() !== "全部") {
            alert("推广设备请选择全部");
            console.log($("#module-dataCenter-commonSubModule-filterWidget-filters-device > .dc-common-filterWidget-category-item-selected").text());
            return;
        }
        if ($("#module-dataCenter-commonSubModule-filterWidget-filters-timedim > .dc-common-filterWidget-category-item-selected").text().trim() !== "分日") {
            alert("时间单位请选择分日");
            return;
        }
        if ($("#module-dataCenter-commonSubModule-filterWidget-filters-platform > .dc-common-filterWidget-category-item-selected").text().trim() !== "全部") {
            alert("投放网络请选择全部");
            return;
        }
        if ($("#module-dataCenter-commonSubModule-filterWidget-filters-targetingType > .dc-common-filterWidget-category-item-selected").text().trim() !== "全部") {
            alert("购买方式请选择全部");
            return;
        }
        if ($("#module-dataCenter-commonSubModule-filterWidget-filters-material > .dc-common-filterWidget-material-item-selected").text().trim() !== "全部") {
            alert("单元筛选请选择全部");
            return;
        }

        // 数据完整性判断, 数据包括: 时间、推广单元、推广单元id（在元素属性里）、展现、点击、消费、账号名
        var cols = 0;
        $(".ui-table-head th").each((i, v) => {
            switch ($(v).children(".ui-table-hcell-text").text().trim()) {
                case "时间": {
                    colMap[i] = "date";
                    cols++;
                    break
                }
                case "推广单元": {
                    colMap[i] = "campaign_name";
                    cols++;
                    break
                }
                case "账户": {
                    colMap[i] = "account";
                    cols++;
                    break
                }
                case "展现": {
                    colMap[i] = "impression";
                    cols++;
                    break
                }
                case "点击": {
                    colMap[i] = "click";
                    cols++;
                    break
                }
                case "消费": {
                    colMap[i] = "spend";
                    cols++;
                    break
                }
                default: break
            }
        })
        if (cols !== 6) {
            alert("请点击自定义列添加完整的数据, 包括: 时间，推广单元，展现，点击，消费，账户");
            return;
        }

        // 数据采集
        $(".ui-table-row tr").each((i, v) => {
            let record = {
                "event": "baidu_ad_data",
                "data": {
                    "platform": "baidu",
                    "campaign_type": "search",
                },
                "timestamp": new Date().getTime()
            };
            $(v).children("td").each((i, v) => {
                if (colMap[i] && colMap[i] === "campaign_name") {
                    record.data[colMap[i]] = $(v).find(".dc-report-table-item").children("a").attr("title");
                    record.data["campaign_id"] = Number($(v).find(".dc-report-table-item").children("a").attr("expand").slice(9));
                } else if (colMap[i] && (colMap[i] === "spend" || colMap[i] === "impression" || colMap[i] === "click")) {
                    record.data[colMap[i]] = Number($(v).find(".dc-report-table-item").children("span").attr("title"));
                } else if (colMap[i]) {
                    record.data[colMap[i]] = $(v).find(".dc-report-table-item").children("span").attr("title");
                }
            })
            postData.records.push(record);
        })

        // 控制台测试
        console.log(postData.records);

        // 提交数据
        postData.records = JSON.stringify(postData.records);
        $.ajax({
            url: "https://openapi.insta360.com/data_collection/v1/collect",
            method: "POST",
            data: postData,
            success: function () {
                if ($(".ui-pager-item-extend").length === 2 ||
                    ($(".ui-pager-item-extend").length === 1 && $(".ui-pager-item-extend").text() === "下一页")) {
                    alert("当前页数据抓取成功, 请点击下一页继续抓取");
                } else {
                    alert("数据抓取完成");
                }
            },
            error: function () {
                alert("数据抓取失败，请稍后重试");
            }
        });
    }
}

new BaiduDataCollector().start();