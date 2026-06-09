// ==UserScript==
// @name         屏蔽uview-plus广告弹窗
// @namespace    https://www.f2iclo.cn/
// @version      1.0.2
// @description  屏蔽网页广告弹窗并绕过检测机制
// @author       Quirrel-zh
// @supportURL   https://github.com/Quirrel-zh/removeuviewAD/issues
// @homepage     https://github.com/Quirrel-zh/removeuviewAD
// @match        https://uview-plus.jiangruyi.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// @tag          uview-plus,广告,屏蔽,弹窗
// ==/UserScript==

(function () {
  'use strict';

  const AD_FREE_SECONDS = 43200;
  const AD_API_PATTERN = 'uiadmin.net/api/v1/wxapp/ad';

  function createAdBypassPayload() {
    const rounded = 60000 * Math.floor(Date.now() / 60000);
    return {
      code: 200,
      data: {
        ['yoip' + rounded]: true
      }
    };
  }

  // 1. 立即设置 localStorage 绕过 checkVip（adExpire3 为新版本 key）
  function setAdExpire() {
    if (!window.localStorage) return;
    const expireTime = Math.floor(Date.now() / 1000) + AD_FREE_SECONDS;
    const expireStr = expireTime.toString();
    localStorage.setItem('adExpire3', expireStr);
    localStorage.setItem('adExpire2', expireStr);
  }

  setAdExpire();

  // 2. 阻止页面被隐藏 - 拦截 style.opacity 的设置
  function protectDocumentOpacity() {
    if (document.documentElement) {
      const htmlElement = document.documentElement;

      Object.defineProperty(htmlElement.style, 'opacity', {
        set: function (value) {
          if (value === '0' || value === 0) {
            return;
          }
          this.setProperty('opacity', value);
        },
        get: function () {
          const value = this.getPropertyValue('opacity');
          return value || '1';
        },
        configurable: true
      });
    } else {
      setTimeout(protectDocumentOpacity, 0);
    }
  }

  protectDocumentOpacity();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectDocumentOpacity);
  }

  // 3. 拦截 alert，防止检测机制弹出警告
  const originalAlert = window.alert;
  window.alert = function () {
    const args = Array.from(arguments);
    if (args.some(arg => typeof arg === 'string' && arg.includes('广告屏蔽器'))) {
      return;
    }
    return originalAlert.apply(this, arguments);
  };

  // 4. 阻止旧版 MutationObserver 检测（兼容 adVip / adVip2）
  function blockDetection() {
    const OriginalMutationObserver = window.MutationObserver;
    window.MutationObserver = function (callback) {
      const wrappedCallback = function (mutations, observer) {
        const filteredMutations = mutations.filter(mutation => {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            return !addedNodes.some(node => {
              if (node.nodeType !== 1) return false;
              return node.id === 'pleasePrNotCrack' ||
                node.id?.startsWith('plsPrNotCrack') ||
                node.classList?.contains('v-modal') ||
                node.classList?.contains('el-dialog__wrapper') ||
                node.classList?.contains('uv-ad-shell') ||
                node.classList?.contains('uv-ad-panel');
            });
          }
          if (mutation.type === 'attributes') {
            const target = mutation.target;
            if (target?.classList?.contains('uv-ad-shell') ||
              target?.classList?.contains('uv-ad-panel')) {
              return false;
            }
          }
          return true;
        });
        if (filteredMutations.length > 0) {
          callback(filteredMutations, observer);
        }
      };
      return new OriginalMutationObserver(wrappedCallback);
    };
    window.MutationObserver.prototype = OriginalMutationObserver.prototype;
  }

  // 5. 移除旧版弹窗元素（新版 uv-ad-shell 依赖 localStorage 绕过，直接移除会触发自愈）
  const LEGACY_AD_SELECTORS = '.v-modal, .el-dialog__wrapper, #pleasePrNotCrack, [id^="plsPrNotCrack"]';

  function removeLegacyAdDialog() {
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeLegacyAdDialog);
      } else {
        setTimeout(removeLegacyAdDialog, 100);
      }
      return;
    }

    const observer = new MutationObserver(function () {
      document.querySelectorAll(LEGACY_AD_SELECTORS).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left > -5000) {
          el.remove();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 6. 拦截广告 API，返回免广告会员响应
  function isAdApiUrl(url) {
    return typeof url === 'string' && url.includes(AD_API_PATTERN);
  }

  function blockAdApi() {
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0];
      if (isAdApiUrl(typeof url === 'string' ? url : url?.url)) {
        const payload = createAdBypassPayload();
        setAdExpire();
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(payload),
          text: () => Promise.resolve(JSON.stringify(payload))
        });
      }
      return originalFetch.apply(this, args);
    };

    function patchAxios() {
      if (!window.axios || window.axios._adPatched) return;
      const originalPost = window.axios.post.bind(window.axios);
      window.axios.post = function (url, ...args) {
        if (isAdApiUrl(url)) {
          setAdExpire();
          return Promise.resolve({ data: createAdBypassPayload() });
        }
        return originalPost(url, ...args);
      };
      window.axios._adPatched = true;
    }

    patchAxios();
    const axiosPatchTimer = setInterval(() => {
      patchAxios();
      if (window.axios?._adPatched) {
        clearInterval(axiosPatchTimer);
      }
    }, 50);
  }

  // 7. 阻止守卫定时检测（checkDisplay / checkVip）
  function blockIntervalCheck() {
    const originalSetInterval = window.setInterval;
    window.setInterval = function (callback, delay) {
      const callbackStr = callback.toString();
      if (callbackStr.includes('checkDisplay') ||
        callbackStr.includes('checkVip') ||
        callbackStr.includes('pleasePrNotCrack') ||
        callbackStr.includes('restoreGuardNodes') ||
        callbackStr.includes('applyGuardStyles')) {
        return null;
      }
      return originalSetInterval.apply(this, arguments);
    };
  }

  // 8. 创建旧版假弹窗元素（兼容 adVip / adVip2 检测）
  function createFakeDialog() {
    if (!document.body) {
      setTimeout(createFakeDialog, 100);
      return;
    }

    if (!document.getElementById('pleasePrNotCrack')) {
      const fakeDialog = document.createElement('div');
      fakeDialog.id = 'pleasePrNotCrack';
      fakeDialog.style.cssText = 'display:none;visibility:hidden;opacity:0;position:absolute;left:-9999px;z-index:-9999';
      document.body.appendChild(fakeDialog);
    }

    if (!document.querySelector('.v-modal')) {
      const fakeModal = document.createElement('div');
      fakeModal.className = 'v-modal';
      fakeModal.style.cssText = 'display:none;visibility:visible;position:absolute;left:-9999px;z-index:2000;background:rgba(0,0,0,0.5)';
      document.body.appendChild(fakeModal);
    }

    if (!document.querySelector('.el-dialog__wrapper')) {
      const fakeWrapper = document.createElement('div');
      fakeWrapper.className = 'el-dialog__wrapper';
      fakeWrapper.style.cssText = 'display:none;visibility:visible;position:absolute;left:-9999px;z-index:2001';
      document.body.appendChild(fakeWrapper);
    }
  }

  function initProtection() {
    blockDetection();
    removeLegacyAdDialog();
    blockAdApi();
    blockIntervalCheck();
    createFakeDialog();

    // 定期续期 adExpire3，并清理旧版弹窗
    setInterval(() => {
      setAdExpire();
      if (document.body) {
        document.querySelectorAll(LEGACY_AD_SELECTORS).forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.left > -5000) {
            el.remove();
          }
        });
      }
    }, 3600000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProtection);
  } else {
    initProtection();
  }

})();
