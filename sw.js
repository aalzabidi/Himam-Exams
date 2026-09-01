// Service Worker - حاسبة همم
// يمكّن تثبيت التطبيق على الجوال (PWA)

const CACHE_NAME = 'himam-calc-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './himam_icon_192.png',
  './himam_icon_512.png'
];

// التثبيت: تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

// التفعيل: حذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// الجلب: الشبكة أولاً، ثم الكاش عند انقطاع الاتصال
// (لا نخزّن طلبات Apps Script API إطلاقاً حتى تبقى البيانات محدّثة)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // تجاهل طلبات الـ API (Apps Script) - اذهب دائماً للشبكة
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('googleusercontent.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // خزّن نسخة من الملفات الثابتة فقط
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
