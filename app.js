// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
        updateStatus('Service worker registered successfully!');
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
        updateStatus('Service worker registration failed.');
      });
  });
}

// Update status message
function updateStatus(message) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
  }
}

// Check if app is running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA');
}

