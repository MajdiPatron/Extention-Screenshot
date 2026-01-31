document.addEventListener('DOMContentLoaded', () => {
  const btnCapture = document.getElementById('captureVisibleArea');
  const btnSelected = document.getElementById('captureSelectedArea');
  const btnTimed = document.getElementById('captureTimed');

  const mainView = document.getElementById('main-view');
  const previewView = document.getElementById('preview-view');
  const imgPreview = document.getElementById('screenshotPreview');
  const statusDiv = document.getElementById('status');
  const btnDownload = document.getElementById('downloadBtn');
  const btnBack = document.getElementById('backBtn');

  let currentScreenshotUrl = null;

  // Check for restricted URLs
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://') || activeTab.url.startsWith('about:') || activeTab.url.startsWith('file://'))) {
      showStatus('Cannot capture system pages', 'error');
      [btnCapture, btnSelected, btnTimed].forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      });
    }
  });

  // --- Capture Page ---
  btnCapture.addEventListener('click', () => {
    captureVisible();
  });

  // --- Capture Selection ---
  btnSelected.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'CAPTURE_SELECTED_INIT' });
    window.close();
  });

  // --- Timed Capture ---
  btnTimed.addEventListener('click', () => {
    let count = 3;
    const originalText = btnTimed.innerHTML;

    // Disable all buttons
    [btnCapture, btnSelected, btnTimed].forEach(b => b.classList.add('loading'));

    // Initial State
    updateTimerBtn(btnTimed, count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        updateTimerBtn(btnTimed, count);
      } else {
        clearInterval(interval);
        btnTimed.innerHTML = originalText;
        [btnCapture, btnSelected, btnTimed].forEach(b => b.classList.remove('loading'));
        captureVisible();
      }
    }, 1000);
  });

  function updateTimerBtn(btn, num) {
    btn.innerHTML = `<span class="btn-icon">⏱️</span> ${num}...`;
  }

  function captureVisible() {
    showStatus('Capturing...', 'normal');
    chrome.runtime.sendMessage({ action: 'CAPTURE_VISIBLE' }, (response) => {
      if (response && response.dataUrl) {
        showPreview(response.dataUrl);
      } else {
        const err = response && response.error ? response.error : 'Unknown error';
        showStatus('Capture failed: ' + err, 'error');
      }
    });
  }

  // --- Preview & Download ---
  function showPreview(url) {
    currentScreenshotUrl = url;
    imgPreview.src = url;
    // Update visuals to show it's clickable
    imgPreview.title = "Click to enlarge (Full Screen Preview)";

    mainView.classList.add('hidden');
    previewView.classList.remove('hidden');
    showStatus('', 'normal');
  }

  // Click on preview to open big modal
  imgPreview.addEventListener('click', () => {
    if (!currentScreenshotUrl) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        // Send visual feedback before closing
        showStatus('Opening full preview...', 'normal');

        // Inject content script if needed (robustness)
        chrome.scripting.insertCSS({ target: { tabId: activeTab.id }, files: ['content.css'] }, () => {
          chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ['content.js'] }, () => {
            chrome.tabs.sendMessage(activeTab.id, {
              action: 'SHOW_PREVIEW',
              dataUrl: currentScreenshotUrl
            });
            setTimeout(() => window.close(), 100); // Close popup
          });
        });
      }
    });
  });

  btnDownload.addEventListener('click', () => {
    if (currentScreenshotUrl) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      chrome.downloads.download({
        url: currentScreenshotUrl,
        filename: filename
      });
      showStatus('Saved!', 'success');
    }
  });

  btnBack.addEventListener('click', () => {
    previewView.classList.add('hidden');
    mainView.classList.remove('hidden');
    currentScreenshotUrl = null;
    showStatus('', 'normal');
  });

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = 'status ' + type;
    statusDiv.style.opacity = msg ? 1 : 0;
  }
});
