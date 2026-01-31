(function () {
    if (window.proScreenshotLoaded) return;
    window.proScreenshotLoaded = true;

    // Receiver for background messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'INIT_SELECTION') {
            initSelection();
        }
        if (request.action === 'SHOW_PREVIEW') {
            showPreviewModal(request.dataUrl);
        }
    });

    function showPreviewModal(dataUrl) {
        if (document.getElementById('pro-screenshot-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'pro-screenshot-modal-overlay';

        const modal = document.createElement('div');
        modal.id = 'pro-screenshot-modal';

        const img = document.createElement('img');
        img.id = 'pro-screenshot-preview-img';
        img.src = dataUrl;

        const actions = document.createElement('div');
        actions.className = 'pro-screenshot-actions';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'pro-screenshot-btn pro-screenshot-btn-secondary';
        btnCancel.textContent = 'Discard';
        btnCancel.onclick = close;

        const btnSave = document.createElement('button');
        btnSave.className = 'pro-screenshot-btn pro-screenshot-btn-primary';
        btnSave.innerHTML = '💾 Save Screenshot';
        btnSave.onclick = () => {
            // Send message to background to download (most reliable method)
            chrome.runtime.sendMessage({
                action: 'DOWNLOAD_ITEM',
                url: dataUrl
            });
            close();
        };

        actions.appendChild(btnCancel);
        actions.appendChild(btnSave);

        modal.appendChild(img);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.documentElement.appendChild(overlay);

        function close() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    }

    function initSelection() {
        if (document.getElementById('pro-screenshot-overlay-container')) return;

        // Force cursor
        document.body.classList.add('pro-screenshot-active');

        const container = document.createElement('div');
        container.id = 'pro-screenshot-overlay-container';

        const dimmer = document.createElement('div');
        dimmer.id = 'pro-screenshot-dimmer';

        const selectionBox = document.createElement('div');
        selectionBox.id = 'pro-screenshot-selection';

        const helper = document.createElement('div');
        helper.id = 'pro-screenshot-helper';
        helper.innerHTML = '<span>➕</span> Drag to select area';

        container.appendChild(dimmer);
        container.appendChild(selectionBox);
        container.appendChild(helper);
        document.documentElement.appendChild(container);

        let startX, startY;
        let isSelecting = false;

        const onMouseDown = (e) => {
            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.display = 'block';
        };

        const onMouseMove = (e) => {
            if (!isSelecting) return;
            const currentX = e.clientX;
            const currentY = e.clientY;

            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const left = Math.min(currentX, startX);
            const top = Math.min(currentY, startY);

            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
        };

        const onMouseUp = (e) => {
            if (!isSelecting) return;
            isSelecting = false;

            const rect = selectionBox.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Cleanup
            if (document.documentElement.contains(container)) document.documentElement.removeChild(container);
            document.body.classList.remove('pro-screenshot-active');
            window.removeEventListener('keydown', onKeyDown);

            if (rect.width > 5 && rect.height > 5) {
                chrome.runtime.sendMessage({
                    action: 'AREA_SELECTED',
                    area: {
                        x: rect.left * dpr,
                        y: rect.top * dpr,
                        width: rect.width * dpr,
                        height: rect.height * dpr
                    }
                });
            }
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (document.documentElement.contains(container)) document.documentElement.removeChild(container);
                document.body.classList.remove('pro-screenshot-active');
                window.removeEventListener('keydown', onKeyDown);
            }
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keydown', onKeyDown);
    }
})();
