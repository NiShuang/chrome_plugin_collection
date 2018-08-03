const ContextMenus = {
    STORE_DATA: { key: 'a', title: "同步【官方商城】数据" },
    BAIDU: { key: 'b', title: "同步【百度】数据" },
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