
self.addEventListener("install", (event) => {
  console.log("SW: install", event);

  setTimeout(() => {
    console.log('test notification')
    self.registration.showNotification("Hello from SW", {
      body: 'This is a notification from the service worker',
    });
  }, 10000)
});