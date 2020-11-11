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
                "plan": null,
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
        var postData = {
            "app": "chrome_plugin",
            "records": []
        }
        // URL判断
        if (!window.location.href.includes("fengchao.baidu.com")) {
            alert("请进入搜索推广再采集数据");
            return;
        }

        if (!window.location.href.toLowerCase().includes("adgroup")) {
            alert("请选择 数据报告 -> 推广报告 -> 单元报告");
            return;
        }

        // 条件筛选, 时间单位：分日，细分： 无
        if (!$(".one-select-selection-selected-value").attr("title").includes("分日")) {
            alert("时间单位请选择分日");
            return;
        }
        const split = $(".report-sdk-table-split-container > span > span").text().trim() 
        if (split.length > 0) {
            alert("细分请选择无");
            return;
        }

        // 数据完整性判断, 数据包括: 日期、推广计划、推广单元、展现、点击、消费
        var cols = 0;
        $(".one-table-thead:last tr th").each((i, v) => {
            switch ($(v).find("span div div:first div").text().trim()) {
                case "日期": {
                    colMap[i] = "date";
                    cols++;
                    break
                }
                case "推广计划": {
                    colMap[i] = "plan";
                    cols++;
                    break
                }
                case "推广单元": {
                    colMap[i] = "campaign_name";
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
            alert("请点击自定义列添加完整的数据, 包括: 日期，推广计划，推广单元，展现，点击，消费");
            return;
        }

        // 数据采集
        const accuont = $(".one-ui-pro-nav-profile-content-name").text();
        const trs = $(".one-table-tbody:last tr");
        trs.each((i, v) => {
            if (i < trs.length - 1) {
                let record = {
                    "event": "baidu_ad_data",
                    "data": {
                        "platform": "baidu",
                        "campaign_type": "search",
                        "campaign_id": "",
                        "account": accuont
                    },
                    "timestamp": new Date().getTime()
                };
                $(v).children("td").each((i, v) => {
                    if (colMap[i] && (colMap[i] === "spend" || colMap[i] === "impression" || colMap[i] === "click")) {
                        record.data[colMap[i]] = Number($(v).find("div span").text().replace(",", ""));
                    } else if (colMap[i]) {
                        record.data[colMap[i]] = $(v).find("span").text();
                    }
                })
                postData.records.push(record);
            }
        })

        // 控制台测试
        console.log(postData.records);

        // 提交数据
        $.ajax({
            url: "https://openapi.insta360.com/data_collection/v1/collect",
            method: "POST",
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            success: function () {
                if (!$("input:last").prop("disabled")) {
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