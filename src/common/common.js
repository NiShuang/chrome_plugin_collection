import { Events, EventMessage, sendEvent } from './event'

function addContextMenu(contextMenu) {
    const message = new EventMessage(Events.CONTEXT_MENU_CREATE, contextMenu);
    sendEvent(message);
}

export {
    addContextMenu
}