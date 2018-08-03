const Events = {
    CONTEXT_MENU_CREATE: "CONTEXT_MENU_CREATE",
    CONTEXT_MENU_ONCLICK: "CONTEXT_MENU_ONCLICK"
};

function listenEvent(listener) {
    chrome.extension.onMessage.addListener(
        function (request, sender, sendResponse) {
            const response = listener(request, sender);
            sendResponse(response);
        }
    );
}

function sendEvent(eventMessage, callback) {
    chrome.extension.sendMessage(eventMessage, callback);
}

class EventMessage {
    constructor(eventName, data) {
        this.eventName = eventName;
        this.data = data;
    }
}

export {
    listenEvent,
    sendEvent,
    EventMessage,
    Events
}