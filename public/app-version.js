/**
 * ملف لتعريف وإدارة إصدار التطبيق
 */

const APP_VERSION = {
  version: '1.3.0',
  buildDate: '2023-10-15',
  changelog: {
    ar: [
      'تحسين نظام الإشعارات والتذكيرات',
      'إصلاح مشكلة صلاحيات قراءة الحافظة',
      'تحسينات في واجهة المستخدم وأداء التطبيق',
      'دعم أفضل لوضع عدم الاتصال'
    ],
    en: [
      'Improved notification and reminder system',
      'Fixed clipboard reading permission issue',
      'UI improvements and app performance enhancements',
      'Better offline mode support'
    ]
  },
  // مؤشر وضع التطوير
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

// إضافة الإصدار إلى كائن النافذة
window.APP_VERSION = APP_VERSION;

// تصدير الإصدار لاستخدامه في وحدات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_VERSION;
} 