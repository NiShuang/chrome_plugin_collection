import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'

class BaiduDataCollector extends BasePluginComponent {

    getContextMenuConfig() {
        return [
            new ContextMenuConfig(ContextMenus.BAIDU, this.test)
        ];
    }

    test() {
        alert('同步百度');
    }
}

new BaiduDataCollector().start();