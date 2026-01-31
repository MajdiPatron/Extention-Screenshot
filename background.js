// Background Service Worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Capture Page (Visible)
    if (request.action === 'CAPTURE_VISIBLE') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error('Capture failed:', chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ dataUrl: dataUrl });
            }
        });
        return true; // Keep message channel open
    }

    // Initialize Selection
    if (request.action === 'CAPTURE_SELECTED_INIT') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) return;

            // Ensure script is injected
            chrome.scripting.insertCSS({
                target: { tabId: activeTab.id },
                files: ['content.css']
            }, () => {
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Injection failed:', chrome.runtime.lastError);
                    } else {
                        chrome.tabs.sendMessage(activeTab.id, { action: 'INIT_SELECTION' });
                    }
                });
            });
        });
    }

    // Process Selected Area
    if (request.action === 'AREA_SELECTED') {
        const { area } = request;
        const windowId = sender.tab ? sender.tab.windowId : null;
        const tabId = sender.tab ? sender.tab.id : null;

        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError || !dataUrl) {
                console.error('Capture failed for selection:', chrome.runtime.lastError);
                return;
            }

            cropImage(dataUrl, area, (croppedDataUrl) => {
                // Send back to content script for preview instead of auto-download
                if (tabId) {
                    chrome.tabs.sendMessage(tabId, {
                        action: 'SHOW_PREVIEW',
                        dataUrl: croppedDataUrl
                    });
                }
            });
        });
    }

    // Handle Download Request from Content Script
    if (request.action === 'DOWNLOAD_ITEM') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.png`;
        chrome.downloads.download({
            url: request.url,
            filename: filename
        });
    }
});

function cropImage(dataUrl, area, callback) {
    fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => createImageBitmap(blob))
        .then(imageBitmap => {
            const canvas = new OffscreenCanvas(area.width, area.height);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(imageBitmap,
                area.x, area.y, area.width, area.height,
                0, 0, area.width, area.height
            );
            return canvas.convertToBlob({ type: 'image/png' });
        })
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result);
            reader.readAsDataURL(blob);
        })
        .catch(err => console.error('Crop failed', err));
}
