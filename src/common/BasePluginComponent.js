import React from 'react'
import ReactDOM from 'react-dom'
import { addContextMenu } from './common'
import { Events, listenEvent } from './event'

class BasePluginComponent {

    getContextMenuConfig() { return []; }

    getMainPanel() { return null; }

    onContextMenuClick(contextMenu) {
        const configs = this.contextMenuConfigs.filter(o => contextMenu.key === o.contextMenu.key);
        if (configs.length) {
            const config = configs[0];
            config.listener();
        }
        else {
            alert('无法响应插件操作')
        }
    }

    initListener() {
        listenEvent((eventMessage, sender) => {
            switch (eventMessage.eventName) {
                case Events.CONTEXT_MENU_ONCLICK:
                    this.onContextMenuClick(eventMessage.data);
                    break
            }
        });
    }

    initContextMenu() {
        this.contextMenuConfigs = this.getContextMenuConfig();
        this.contextMenuConfigs.forEach(config => {
            addContextMenu(config.contextMenu);
        });
    }

    showPanel() {
        const Panel = this.getMainPanel();
        if (Panel !== null) {
            $('body').append('<div id="xxx" style="position: fixed;top:200px;left:10px;z-index:99999;"></div>');
            // setTimeout(() => {
            ReactDOM.render(<div><Panel /></div>, document.getElementById('xxx'));
            // }, 500);
        }
    }

    start() {
        this.initContextMenu();
        this.initListener();
        this.showPanel();
    }
}

export default BasePluginComponent