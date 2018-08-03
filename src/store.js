import BasePluginComponent from './common/BasePluginComponent'
import { ContextMenus, ContextMenuConfig } from './common/context-menu'
// import MainPanel from './store/MainPanel'

class StoreDataCollector extends BasePluginComponent {

    // getMainPanel() {
    //     return MainPanel;
    // }

    getContextMenuConfig() {
        return [
            new ContextMenuConfig(ContextMenus.STORE_DATA, this.test)
        ];
    }

    test() {
        const src = $('.header-brand>img').attr('src');
        alert(src);
    }
}

new StoreDataCollector().start();