/* 放在 602ZR 網站，供 /deck 與 /game 共用。不建立新登入系統。 */
(function(){'use strict';
function token(){try{var value=localStorage.getItem('602zr_session');return typeof value==='string'?value:'';}catch(e){return '';}}
function googleOrigin(origin){return origin==='https://script.google.com'||/^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/.test(origin);}
function nonce(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),function(x){return x.toString(16).padStart(2,'0');}).join('');}
function mount(options){
 if(!options||typeof options.gasUrl!=='string'||!options.gasUrl.trim())throw Error('缺少 GAS 網址：請以 gasUrl 傳入正式 /exec 網址。');
 var frame=typeof options.iframe==='string'?document.querySelector(options.iframe):options.iframe;
 if(!frame)throw Error('找不到 GAS iframe。');
 var url;try{url=new URL(options.gasUrl.trim());}catch(e){throw Error('GAS 網址格式不正確，請檢查 gasUrl 設定。');}if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname))throw Error('請設定 GAS 正式 /exec 網址。');
 var secret=nonce(),peer=null,last=token();url.searchParams.set('zrNonce',secret);url.searchParams.set('page',options.page||'game');var chosen=new URLSearchParams(window.location.search).get('deck');if(chosen&&/^[A-Za-z0-9_-]{1,100}$/.test(chosen))url.searchParams.set('deck',chosen);
 function send(){if(peer)peer.source.postMessage({type:'ZR602_AUTH',nonce:secret,token:token()},peer.origin);}
 function receive(e){var d=e.data;if(peer&&e.source===peer.source&&e.origin===peer.origin&&d&&d.type==='ZR602_NAVIGATE'&&d.nonce===secret&&d.page==='game'&&/^[A-Za-z0-9_-]{1,100}$/.test(String(d.deckId||''))){var target=new URL('../game/',window.location.href);target.searchParams.set('deck',d.deckId);window.location.assign(target.href);return;}if(!googleOrigin(e.origin)||!d||d.type!=='ZR602_READY'||d.nonce!==secret||!e.source)return;
 // GAS 有內外兩層 iframe，內層 source 不等於 frame.contentWindow；來源+每個 frame 的 nonce 共同配對。
 peer={source:e.source,origin:e.origin};send();}
 function check(){var current=token();if(current!==last){last=current;send();}}
 window.addEventListener('message',receive);window.addEventListener('storage',check);window.addEventListener('focus',check);
 var interval=setInterval(check,1000);frame.src=url.href;
 return {refresh:send,destroy:function(){clearInterval(interval);window.removeEventListener('message',receive);window.removeEventListener('storage',check);window.removeEventListener('focus',check);peer=null;}};
}
window.ZR602GasBridge=Object.freeze({mount:mount});
})();
