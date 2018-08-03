import { listenEvent, Events, EventMessage } from './common/event'

const contextMenuSet = {};

function createContextMenu(contextMenu) {
    let menuId = contextMenuSet[contextMenu.key];
    if (menuId) {
        chrome.contextMenus.remove(menuId);
        contextMenuSet[contextMenu.key] = null;
    }

    menuId = chrome.contextMenus.create({
        title: contextMenu.title,
        onclick: (info, tab) => {
            const message = new EventMessage(Events.CONTEXT_MENU_ONCLICK, contextMenu);
            chrome.tabs.sendMessage(tab.id, message);
        }
    });
    contextMenuSet[contextMenu.key] = menuId;
}

function initListener() {
    listenEvent((eventMessage, sender) => {
        switch (eventMessage.eventName) {
            case Events.CONTEXT_MENU_CREATE:
                createContextMenu(eventMessage.data);
                break
        }
    });
}

// 初始化
(function () {
    initListener();
})();