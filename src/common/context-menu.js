const ContextMenus = {
    // STORE_DATA: { key: 'gfsc', title: "同步【官方商城】数据" },
    // BAIDU: { key: 'baidu', title: "同步【百度】数据" },
    TAMLL_COMMERCE: {
        key: 'tmall-commerce', title: "抓取【天猫-交易】数据"
    },
    TMALL_SERVICE: {
        key: 'tmall-service', title: "抓取【天猫-客服】数据"
    },
    TMALL_AD: {
        key: "tmall-ad", title: "抓取【天猫-广告】数据"
    },
    JD_COMMERCE: {
        key: 'jd-commerce', title: "抓取【京东-交易】数据"
    },
    JD_SERVICE: {
        key: 'jd-service', title: "抓取【京东-客服】数据"
    },
    JD_AD: {
        key: "jd-ad", title: "抓取【京东-广告】数据"
    },
    AMAZON_COMMERCE: {
        key: 'amazon-commerce', title: "抓取【亚马逊-交易】数据"
    },
    AMAZON_AD: {
        key: "amazon-ad", title: "抓取【亚马逊-广告】数据"
    },
    BAIDU_AD: {
        key: "baidu-ad", title: "抓取【百度-推广】数据"
    },
    GUANGXIAOBAO_AD: {
        key: "guangxiaobao-ad", title: "抓取【广效宝-推广】数据"
    },
    GUANGXIAOBAO_ORDER: {
        key: "guangxiaobao-order", title: "抓取【广效宝-订单】数据"
    },
    SYCM_ORDER: {
        key: "sycm-order", title: "抓取【生意参谋-成交】数据"
    }
}

function createContextMenu(params) {
    chrome.contextMenus.create({
        ...params, onclick: (info, tab) => {
            const message = new EventMessage(Events.CONTEXT_MENU_ONCLICK, params);
            chrome.tabs.sendMessage(tab.id, message);
        }
    });
}

class ContextMenuConfig {
    constructor(contextMenu, listener) {
        this.contextMenu = contextMenu;
        this.listener = listener;
    }
}

export {
    ContextMenus,
    createContextMenu,
    ContextMenuConfig
}