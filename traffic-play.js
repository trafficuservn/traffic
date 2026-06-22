(function() {
    const CONTAINER_ID = 'trafficuser';
    const PASS_CODE = '724@289';
    let seconds = 70;
    let interval;
    let counting = false;
    let isPausedByScroll = false; 
    let incognitoChecked = false; 
    let scrollTimeout; 
    const SCROLL_STOP_DELAY = 10000; 
    const SCROLL_ALERT_MESSAGE = 'Vui lòng thực hiện thao tác cuộn để tiếp tục đếm ngược thời gian.';
    const REF_DOMAIN_LIST = ["google.com","google.ad","google.ae","google.com.af","google.com.ag","google.com.ai","google.al","google.am","google.co.ao","google.com.ar","google.as","google.at","google.com.au","google.az","google.ba","google.com.bd","google.be","google.bf","google.bg","google.com.bh","google.bi","google.bj","google.com.bn","google.com.bo","google.com.br","google.bs","google.bt","google.co.bw","google.by","google.com.bz","google.ca","google.cd","google.cf","google.cg","google.ch","google.ci","google.co.ck","google.cl","google.cm","google.cn","google.com.co","google.co.cr","google.com.cu","google.cv","google.com.cy","google.cz","google.de","google.dj","google.dk","google.dm","google.com.do","google.dz","google.com.ec","google.ee","google.com.eg","google.es","google.com.et","google.fi","google.com.fj","google.fm","google.fr","google.ga","google.ge","google.gg","google.com.gh","google.com.gi","google.gl","google.gm","google.gr","google.com.gt","google.gy","google.com.hk","google.hn","google.hr","google.ht","google.hu","google.co.id","google.ie","google.co.il","google.im","google.co.in","google.iq","google.is","google.it","google.je","google.com.jm","google.jo","google.co.jp","google.co.ke","google.com.kh","google.ki","google.kg","google.co.kr","google.com.kw","google.kz","google.la","google.com.lb","google.li","google.lk","google.co.ls","google.lt","google.lu","google.lv","google.com.ly","google.co.ma","google.md","google.me","google.mg","google.mk","google.ml","google.com.mm","google.mn","google.ms","google.com.mt","google.mu","google.mv","google.mw","google.com.mx","google.com.my","google.co.mz","google.com.na","google.com.ng","google.com.ni","google.ne","google.nl","google.no","google.com.np","google.nr","google.nu","google.co.nz","google.com.om","google.com.pa","google.com.pe","google.com.pg","google.com.ph","google.com.pk","google.pl","google.pn","google.com.pr","google.ps","google.pt","google.com.py","google.com.qa","google.ro","google.ru","google.rw","google.com.sa","google.com.sb","google.sc","google.se","google.com.sg","google.sh","google.si","google.sk","google.com.sl","google.sn","google.so","google.sm","google.sr","google.st","google.com.sv","google.td","google.tg","google.co.th","google.com.tj","google.tl","google.tm","google.tn","google.to","google.com.tr","google.tt","google.com.tw","google.co.tz","google.com.ua","google.co.ug","google.co.uk","google.com.uy","google.co.uz","google.com.vc","google.co.ve","google.vg","google.co.vi","google.com.vn","google.vu","google.ws","google.rs","google.co.za","google.co.zm","google.co.zw","google.cat"];
    const PRIVATE_MODE_MESSAGE = 'Vui lòng tắt chế độ Ẩn danh để tiếp tục. Xin cảm ơn.';
    const BASE_COLOR = '#EE2F2E'; 
    const HOVER_COLOR = '#EE2F2E'; 
    const ACTIVE_COLOR = '#EE2F2E'; 
    const READY_COLOR = '#128BE0'; 
    function copyToClipboard(text, alertElement) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alertElement.style.display = 'block';
                setTimeout(() => { alertElement.style.display = 'none'; }, 1500);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alertElement.style.display = 'block';
                setTimeout(() => { alertElement.style.display = 'none'; }, 1500);
            } catch (err) {
                alert("Không thể sao chép. Trình duyệt không hỗ trợ.");
            }
            document.body.removeChild(textArea);
        }
    }
    function checkGoogleReferrer() {
        const referrer = document.referrer;
        if (!referrer) return false;
        const refURL = new URL(referrer);
        const refHostname = refURL.hostname.replace(/^www\./, '');
        for (const domain of REF_DOMAIN_LIST) {
            if (refHostname === domain) return true;
        }
        return false;
    }
    if (!checkGoogleReferrer()) return;
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error(`Không tìm thấy container có ID: ${CONTAINER_ID}`);
        return;
    }
    const style = document.createElement('style');
    style.textContent = `
        .custom-button-${CONTAINER_ID} {
            box-sizing: border-box !important;
            background: ${BASE_COLOR} !important;
            border: 2px solid rgba(255,255,255,0.15) !important;
            color: #fff !important;
            border-radius: 50% !important;
            
            /* Kích thước vòng tròn đỏ */
            width: 54px !important;
            height: 54px !important;
            max-width: 54px !important;
            max-height: 54px !important;
            flex-shrink: 0 !important;
            
            margin: 5px !important;
            padding: 0 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            z-index: 0 !important;
            user-select: none !important;
            transition: all 0.2s ease !important;
            position: relative !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25) !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            line-height: 1 !important;
        }
        
        /* ĐÃ CHỈNH: Phóng to tam giác lên gần sát viền tròn (từ 16px lên 32px) */
        .custom-button-${CONTAINER_ID} svg {
            box-sizing: border-box !important;
            width: 32px !important;
            height: 32px !important;
            fill: #ffffff !important;
            /* Dịch chuyển nhẹ sang phải một chút để cân tâm quang học chuẩn nhất khi phóng to */
            transform: translateX(3px) !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .custom-button-${CONTAINER_ID}.finished-state {
            border-radius: 6px !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
        }
        .custom-button-${CONTAINER_ID}.alert-state {
            border-radius: 6px !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
        }
        .custom-button-${CONTAINER_ID}.disabled-state {
            cursor: not-allowed !important;
        }
        .custom-button-${CONTAINER_ID} span {
            box-sizing: border-box !important;
            color: #fff !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        #copy-alert-${CONTAINER_ID} {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: ${BASE_COLOR} !important;
            color: white !important;
            padding: 8px 15px !important;
            border-radius: 5px !important;
            display: none !important;
            z-index: 9999 !important;
            font-weight: bold !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        #scroll-alert-${CONTAINER_ID} {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            padding: 15px 25px !important;
            background: rgba(255, 0, 0, 0.95) !important;
            color: yellow !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            border-radius: 10px !important;
            text-align: center !important;
            line-height: 1.5 !important;
            z-index: 9998 !important;
            display: none !important;
            animation: border-pulse 1s infinite alternate !important; 
        }
        @keyframes border-pulse {
            0% { box-shadow: 0 0 0px rgba(255, 255, 255, 0), 0 0 5px rgba(255, 0, 0, 0.8); }
            50% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 0, 0, 0.9); }
            100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 0, 0, 1); }
        }
        .custom-button-${CONTAINER_ID}.paused-state {
            background: ${BASE_COLOR} !important;
        }
    `;
    document.head.appendChild(style);
    const buttonId = `get-code-btn-${CONTAINER_ID}`;
    const textId = `button-text-${CONTAINER_ID}`;
    const scrollAlertId = `scroll-alert-${CONTAINER_ID}`; 
    
    container.innerHTML = `
        <span id="${buttonId}" class="custom-button-${CONTAINER_ID}">
            <span id="${textId}">
                <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </span>
        </span>
    `;
    const alertHtml = `<div id="copy-alert-${CONTAINER_ID}">Đã sao chép mã!</div>`;
    const scrollAlertHtml = `<div id="${scrollAlertId}">${SCROLL_ALERT_MESSAGE}</div>`;
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    document.body.insertAdjacentHTML('beforeend', scrollAlertHtml); 
    const btn = document.getElementById(buttonId);
    const btnText = document.getElementById(textId);
    const alertElement = document.getElementById(`copy-alert-${CONTAINER_ID}`);
    const scrollAlertElement = document.getElementById(scrollAlertId);
    function copyCodeHandler() {
        copyToClipboard(PASS_CODE, alertElement);
    }
    function updateCountdown() {
        if (seconds > 0) {
            btnText.textContent = seconds;
            seconds--;
        } else {
            clearInterval(interval);
            interval = null;
            counting = false;
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = null; 
            scrollAlertElement.style.display = 'none';
            isPausedByScroll = false; 
            incognitoChecked = false; 
            btn.style.background = BASE_COLOR; 
            btn.classList.remove('disabled-state');
            btn.classList.remove('paused-state'); 
            
            btn.classList.add('finished-state'); 
            btn.style.cursor = 'pointer';
            btnText.innerHTML = `Mã KM: ${PASS_CODE} <img src="https://rawcdn.githack.com/traffic-user/trafficuser/a8e8df5d0a88e46884763fd2e2fc415ce1d9f0f0/icon-copy.png" alt="Copy" style="height: 14px !important; margin: -5px 0 0 3px !important; vertical-align: middle; display: inline-block; width:auto !important;">`;
            btn.removeEventListener('click', checkIncognitoAndStart);
            btn.addEventListener('click', copyCodeHandler);
            restoreInteractionListeners(BASE_COLOR); 
        }
    }
    function pauseCountdown() {
        if (!counting || isPausedByScroll || seconds <= 0 || interval === null) return;
        clearInterval(interval);
        interval = null;
        isPausedByScroll = true;
        btn.classList.add('paused-state');
    }
    function resumeCountdown() {
        if (!counting || !isPausedByScroll || seconds <= 0 || interval !== null) return;
        btnText.textContent = seconds; 
        interval = setInterval(updateCountdown, 1000);
        isPausedByScroll = false;
        btn.classList.remove('paused-state');
    }
    function startCountdown() {
        if (counting || seconds <= 0) return; 
        counting = true;
        incognitoChecked = true;
        btn.style.background = BASE_COLOR;
        btn.classList.add('disabled-state');
        btn.style.cursor = 'not-allowed';
        removeInteractionListeners();
        btn.removeEventListener('click', checkIncognitoAndStart); 
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
        window.addEventListener('scroll', handleScroll);
        setScrollStopTimeout();
    }
    function showScrollAlert() {
        if (counting && seconds > 0 && !isPausedByScroll) {
            scrollAlertElement.style.display = 'block';
            pauseCountdown(); 
        }
    }
    function hideScrollAlert() {
        scrollAlertElement.style.display = 'none';
        resumeCountdown(); 
    }
    function setScrollStopTimeout() {
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        scrollTimeout = setTimeout(showScrollAlert, SCROLL_STOP_DELAY);
    }
    function handleScroll() {
        if (!counting || seconds <= 0) return;
        hideScrollAlert();
        setScrollStopTimeout();
    }
    function interactionListeners(enable, baseColor = BASE_COLOR) {
        function handleMouseEnter() { if (!counting && !isPausedByScroll) btn.style.background = HOVER_COLOR; }
        function handleMouseLeave() { if (!counting && !isPausedByScroll) btn.style.background = baseColor; }
        function handleMouseDown() { if (!counting && !isPausedByScroll) btn.style.background = ACTIVE_COLOR; }
        function handleMouseUp() { if (!counting && !isPausedByScroll) btn.style.background = HOVER_COLOR; }
        if(enable) {
            btn.addEventListener('mouseenter', handleMouseEnter);
            btn.addEventListener('mouseleave', handleMouseLeave);
            btn.addEventListener('mousedown', handleMouseDown);
            btn.addEventListener('mouseup', handleMouseUp);
        } else {
            btn.removeEventListener('mouseenter', handleMouseEnter);
            btn.removeEventListener('mouseleave', handleMouseLeave);
            btn.removeEventListener('mousedown', handleMouseDown);
            btn.removeEventListener('mouseup', handleMouseUp);
        }
    }
    function removeInteractionListeners() { interactionListeners(false); }
    function restoreInteractionListeners(baseColor = BASE_COLOR) {
        if (!counting) {
            interactionListeners(false);
            interactionListeners(true, baseColor);
        }
    }
    function handleVisibilityChange() {
        if (document.hidden) {
            if (interval) { clearInterval(interval); interval = null; }
            if (scrollTimeout) { clearTimeout(scrollTimeout); scrollTimeout = null; }
            hideScrollAlert(); 
        } else {
            if (interval === null && seconds > 0 && !isPausedByScroll && counting) { 
                btn.style.background = BASE_COLOR;
                updateCountdown();
                interval = setInterval(updateCountdown, 1000);
            }
            if (counting && seconds > 0) { setScrollStopTimeout(); }
            if (seconds === 0 && !counting) {
                 btn.style.background = BASE_COLOR; 
                 restoreInteractionListeners(BASE_COLOR); 
            }
        }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    function checkIncognitoAndStart() {
        if (incognitoChecked && counting) return;
        removeInteractionListeners();
        detectIncognito().then((result) => {
            if (result.isPrivate) {
                if (interval) clearInterval(interval);
                interval = null; 
                if (scrollTimeout) clearTimeout(scrollTimeout);
                scrollTimeout = null;
                window.removeEventListener('scroll', handleScroll);
                hideScrollAlert(); 
                counting = false;
                isPausedByScroll = false; 
                incognitoChecked = false; 
                btn.style.background = BASE_COLOR;
                btn.classList.add('disabled-state');
                btn.classList.remove('paused-state');
                btn.style.cursor = 'default';
                
                btn.classList.add('alert-state'); 
                btnText.textContent = PRIVATE_MODE_MESSAGE; 
                setTimeout(() => {
                    btn.style.background = BASE_COLOR;
                    btn.classList.remove('disabled-state');
                    btn.classList.remove('alert-state'); 
                    btn.style.cursor = 'pointer';
                    btnText.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                    restoreInteractionListeners(BASE_COLOR);
                }, 5000);
            } else {
                incognitoChecked = true; 
                startCountdown();
            }
        });
    }
    btn.addEventListener('click', checkIncognitoAndStart);
    restoreInteractionListeners(BASE_COLOR);
    const detectIncognito = function () {
		return new Promise(function (resolve, reject) {
			var browserName = "Unknown";
			function __callback(isPrivate) { resolve({ isPrivate: isPrivate, browserName: browserName }); }
			function identifyChromium() {
				var ua = navigator.userAgent;
				if (ua.match(/Chrome/)) {
					if (navigator.brave !== undefined) return "Brave";
					else if (ua.match(/Edg/)) return "Edge";
					else if (ua.match(/OPR/)) return "Opera";
					return "Chrome";
				} else return "Chromium";
			}
			function assertEvalToString(value) { return value === eval.toString().length; }
			function isSafari() { var v = navigator.vendor; return (v !== undefined && v.indexOf("Apple") === 0 && assertEvalToString(37)); }
			function isChrome() { var v = navigator.vendor; return (v !== undefined && v.indexOf("Google") === 0 && assertEvalToString(33)); }
			function isFirefox() { return (document.documentElement !== undefined && document.documentElement.style.MozAppearance !== undefined && assertEvalToString(37)); }
			function isMSIE() { return (navigator.msSaveBlob !== undefined && assertEvalToString(39)); }
			function newSafariTest() {
				var tmp_name = String(Math.random());
				try {
					var db = window.indexedDB.open(tmp_name, 1);
					db.onupgradeneeded = function (i) {
						var _a, _b;
						var res = (_a = i.target) === null || _a === void 0 ? void 0 : _a.result;
						try {
							res.createObjectStore("test", { autoIncrement: true }).put(new Blob);
							__callback(false);
						} catch (e) {
							var message = e;
							if (e instanceof Error) message = (_b = e.message) !== null && _b !== void 0 ? _b : e;
							if (typeof message !== 'string') return __callback(false);
							var matchesExpectedError = /BlobURLs are not yet supported/.test(message);
							return __callback(matchesExpectedError);
						} finally {
							res.close();
							window.indexedDB.deleteDatabase(tmp_name);
						}
					};
				} catch (e) { return __callback(false); }
			}
			function oldSafariTest() {
				var openDB = window.openDatabase; var storage = window.localStorage;
				try { openDB(null, null, null, null); } catch (e) { return __callback(true); }
				try { storage.setItem("test", "1"); storage.removeItem("test"); } catch (e) { return __callback(true); }
				return __callback(false);
			}
			function safariPrivateTest() { if (navigator.maxTouchPoints !== undefined) newSafariTest(); else oldSafariTest(); }
			function getQuotaLimit() { var w = window; if (w.performance !== undefined && w.performance.memory !== undefined && w.performance.memory.jsHeapSizeLimit !== undefined) return performance.memory.jsHeapSizeLimit; return 1073741824; }
			function storageQuotaChromePrivateTest() {
				navigator.webkitTemporaryStorage.queryUsageAndQuota(function (_, quota) {
					var quotaInMib = Math.round(quota / (1024 * 1024));
					var quotaLimitInMib = Math.round(getQuotaLimit() / (1024 * 1024)) * 2;
					__callback(quotaInMib < quotaLimitInMib);
				}, function (e) { reject(new Error("detectIncognito somehow failed: " + e.message)); });
			}
			function oldChromePrivateTest() { var fs = window.webkitRequestFileSystem; var success = function () { __callback(false); }; var error = function () { __callback(true); }; fs(0, 1, success, error); }
			function chromePrivateTest() { if (self.Promise !== undefined && self.Promise.allSettled !== undefined) storageQuotaChromePrivateTest(); else oldChromePrivateTest(); }
			function firefoxPrivateTest() { __callback(navigator.serviceWorker === undefined); }
			function msiePrivateTest() { __callback(window.indexedDB === undefined); }
			function main() {
				if (isSafari()) { browserName = 'Safari'; safariPrivateTest(); }
				else if (isChrome()) { browserName = identifyChromium(); chromePrivateTest(); }
				else if (isFirefox()) { browserName = "Firefox"; firefoxPrivateTest(); }
				else if (isMSIE()) { browserName = "Internet Explorer"; msiePrivateTest(); }
				else __callback(false);
			}
			main();
		});
	};
})();
