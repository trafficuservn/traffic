(function() {
    // Cấu hình chung
    const CONTAINER_ID = 'TrafficUser';
    const PASS_CODE = '123@789';

    let seconds = 30;
    let interval;
    let counting = false;
    let isPausedByScroll = false; 
    let incognitoChecked = false; 
    let scrollTimeout; 
    const SCROLL_STOP_DELAY = 10000; 
    const SCROLL_ALERT_MESSAGE = 'Vui lòng thực hiện thao tác cuộn để tiếp tục đếm ngược thời gian.';
    const REF_DOMAIN_LIST = ["google.com","google.ad","google.ae","google.com.af","google.com.ag","google.com.ai","google.al","google.am","google.co.ao","google.com.ar","google.as","google.at","google.com.au","google.az","google.ba","google.com.bd","google.be","google.bf","google.bg","google.com.bh","google.bi","google.bj","google.com.bn","google.com.bo","google.com.br","google.bs","google.bt","google.co.bw","google.by","google.com.bz","google.ca","google.cd","google.cf","google.cg","google.ch","google.ci","google.co.ck","google.cl","google.cm","google.cn","google.com.co","google.co.cr","google.com.cu","google.cv","google.com.cy","google.cz","google.de","google.dj","google.dk","google.dm","google.com.do","google.dz","google.com.ec","google.ee","google.com.eg","google.es","google.com.et","google.fi","google.com.fj","google.fm","google.fr","google.ga","google.ge","google.gg","google.com.gh","google.com.gi","google.gl","google.gm","google.gr","google.com.gt","google.gy","google.com.hk","google.hn","google.hr","google.ht","google.hu","google.co.id","google.ie","google.co.il","google.im","google.co.in","google.iq","google.is","google.it","google.je","google.com.jm","google.jo","google.co.jp","google.co.ke","google.com.kh","google.ki","google.kg","google.co.kr","google.com.kw","google.kz","google.la","google.com.lb","google.li","google.lk","google.co.ls","google.lt","google.lu","google.lv","google.com.ly","google.co.ma","google.md","google.me","google.mg","google.mk","google.ml","google.com.mm","google.mn","google.ms","google.com.mt","google.mu","google.mv","google.mw","google.com.mx","google.com.my","google.co.mz","google.com.na","google.com.ng","google.com.ni","google.ne","google.nl","google.no","google.com.np","google.nr","google.nu","google.co.nz","google.com.om","google.com.pa","google.com.pe","google.com.pg","google.com.ph","google.com.pk","google.pl","google.pn","google.com.pr","google.ps","google.pt","google.com.py","google.com.qa","google.ro","google.ru","google.rw","google.com.sa","google.com.sb","google.sc","google.se","google.com.sg","google.sh","google.si","google.sk","google.com.sl","google.sn","google.so","google.sm","google.sr","google.st","google.com.sv","google.td","google.tg","google.co.th","google.com.tj","google.tl","google.tm","google.tn","google.to","google.com.tr","google.tt","google.com.tw","google.co.tz","google.com.ua","google.co.ug","google.co.uk","google.com.uy","google.co.uz","google.com.vc","google.co.ve","google.vg","google.co.vi","google.com.vn","google.vu","google.ws","google.rs","google.co.za","google.co.zm","google.co.zw","google.cat"];
    const PRIVATE_MODE_MESSAGE = 'Vui lòng tắt chế độ Ẩn danh để tiếp tục. Xin cảm ơn.';
    const BASE_COLOR = '#ed1c24'; 
    const HOVER_COLOR = '#c40b11'; 
    const ACTIVE_COLOR = '#9a070d'; 
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
            background: ${BASE_COLOR};
            border: 2px solid #fff;
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 7px;
            padding: 5px 10px;
            margin: 5px;
            min-width: 130px;
            line-height: 20px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            z-index: 10;
            user-select: none;
            transition: none;
        }
        .custom-button-${CONTAINER_ID}.disabled-state {
            cursor: not-allowed;
        }
        .custom-button-${CONTAINER_ID} img {
            height: 25px;
            margin-right: 5px;
            display: inline-block;
            width: auto;
        }
        .custom-button-${CONTAINER_ID} span {
            color: #fff;
            font-weight: 700;
        }
        /* Styles cho thông báo copy */
        #copy-alert-${CONTAINER_ID} {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${BASE_COLOR};
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            display: none;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

       
        #scroll-alert-${CONTAINER_ID} {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 25px;
            background: rgba(255, 0, 0, 0.95); 
            color: yellow;
            font-weight: 700;
            font-size: 16px;
            border-radius: 10px;
            text-align: center;
            line-height: 1.5;
            z-index: 9998;
            display: none;
    
            animation: border-pulse 1s infinite alternate; 
        }
        
        @keyframes border-pulse {
            0% { 
                box-shadow: 0 0 0px rgba(255, 255, 255, 0), 0 0 5px rgba(255, 0, 0, 0.8);
            }
            50% { 
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 0, 0, 0.9); 
            }
            100% { 
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 0, 0, 1);
            }
        }
        
        .custom-button-${CONTAINER_ID}.paused-state {
            background: ${BASE_COLOR};
        }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const buttonId = `get-code-btn-${CONTAINER_ID}`;
    const textId = `button-text-${CONTAINER_ID}`;
    const scrollAlertId = `scroll-alert-${CONTAINER_ID}`; 

    container.innerHTML = `
        <span id="${buttonId}" class="custom-button-${CONTAINER_ID}">
            <img src="https://raw.githubusercontent.com/traffic-user/trafficuser/aa6fed9f460578b2b8fc49bd0587753063f8006e/icon-nut-64.png" alt="icon">
            <span id="${textId}">LẤY MÃ</span>
        </span>
    `;

    const alertHtml = `<div id="copy-alert-${CONTAINER_ID}">Đã sao chép mã!</div>`;
    const scrollAlertHtml = `<div id="${scrollAlertId}">${SCROLL_ALERT_MESSAGE}</div>`;

    document.body.insertAdjacentHTML('beforeend', alertHtml);
    document.body.insertAdjacentHTML('beforeend', scrollAlertHtml); // Chèn thông báo cuộn

    const btn = document.getElementById(buttonId);
    const btnText = document.getElementById(textId);
    const alertElement = document.getElementById(`copy-alert-${CONTAINER_ID}`);
    const scrollAlertElement = document.getElementById(scrollAlertId);


    function copyCodeHandler() {
        copyToClipboard(PASS_CODE, alertElement);
    }

    function updateCountdown() {
        if (seconds > 0) {
            btnText.textContent = `Lấy mã sau ${seconds}s`;
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
            btn.style.cursor = 'pointer';

            btnText.innerHTML = `Mã KM: ${PASS_CODE} <img src="https://raw.githubusercontent.com/traffic-user/trafficuser/refs/heads/main/icon-copy.png" alt="Copy" style="height: 14px !important; margin: -5px 0 0 3px !important; vertical-align: middle; display: inline-block; width:auto !important;">`;

            
            btn.removeEventListener('click', checkIncognitoAndStart);
            btn.addEventListener('click', copyCodeHandler);

            
            restoreInteractionListeners(BASE_COLOR); // <<< SỬA: Dùng READY_COLOR
        }
    }
    
    
    function pauseCountdown() {
        if (!counting || isPausedByScroll || seconds <= 0 || interval === null) return; // Thêm interval check
        
        clearInterval(interval);
        interval = null; 
        isPausedByScroll = true;
        btn.classList.add('paused-state');
    }
    
    function resumeCountdown() {
        
        if (!counting || !isPausedByScroll || seconds <= 0 || interval !== null) return;
        
        
        btnText.textContent = `Lấy mã sau ${seconds}s`; 
        
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
        function handleMouseEnter() {
            if (!counting && !isPausedByScroll) btn.style.background = HOVER_COLOR;
        }
        function handleMouseLeave() {
            if (!counting && !isPausedByScroll) btn.style.background = baseColor;
        }
        function handleMouseDown() {
            if (!counting && !isPausedByScroll) btn.style.background = ACTIVE_COLOR;
        }
        function handleMouseUp() {
            if (!counting && !isPausedByScroll) btn.style.background = HOVER_COLOR;
        }

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

    function removeInteractionListeners() {
        interactionListeners(false);
    }

    function restoreInteractionListeners(baseColor = BASE_COLOR) {
        if (!counting) {
            interactionListeners(false);
            interactionListeners(true, baseColor);
        }
    }

    
    function handleVisibilityChange() {
        if (document.hidden) {
            
            if (interval) {
                clearInterval(interval);
                interval = null; 
            }
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
                scrollTimeout = null; 
            }
            hideScrollAlert(); 
        } else {
            
            if (interval === null && seconds > 0 && !isPausedByScroll && counting) { 
                btn.style.background = BASE_COLOR;
                updateCountdown();
                interval = setInterval(updateCountdown, 1000);
            }
            
            if (counting && seconds > 0) {
                 setScrollStopTimeout(); 
            }


            if (seconds === 0 && !counting) {
                 btn.style.background = BASE_COLOR; 
                 restoreInteractionListeners(BASE_COLOR); 
            }
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // -----------------------------------------------------------------

    
    function checkIncognitoAndStart() {
        
        if (incognitoChecked && counting) {
            return;
        }

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
                btnText.textContent = PRIVATE_MODE_MESSAGE;

                
                // btn.removeEventListener('click', checkIncognitoAndStart); 

                setTimeout(() => {
                    // Đưa nút về trạng thái ban đầu sau 5 giây
                    btn.style.background = BASE_COLOR;
                    btn.classList.remove('disabled-state');
                    btn.style.cursor = 'pointer';
                    btnText.textContent = 'LẤY MÃ';
                    
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
			function __callback(isPrivate) {
				resolve({
					isPrivate: isPrivate,
					browserName: browserName
				});
			}
			function identifyChromium() {
				var ua = navigator.userAgent;
				if (ua.match(/Chrome/)) {
					if (navigator.brave !== undefined) {
						return "Brave";
					}
					else if (ua.match(/Edg/)) {
						return "Edge";
					}
					else if (ua.match(/OPR/)) {
						return "Opera";
					}
					return "Chrome";
				}
				else {
					return "Chromium";
				}
			}
			function assertEvalToString(value) {
				return value === eval.toString().length;
			}
			function isSafari() {
				var v = navigator.vendor;
				return (v !== undefined && v.indexOf("Apple") === 0 && assertEvalToString(37));
			}
			function isChrome() {
				var v = navigator.vendor;
				return (v !== undefined && v.indexOf("Google") === 0 && assertEvalToString(33));
			}
			function isFirefox() {
				return (document.documentElement !== undefined &&
					document.documentElement.style.MozAppearance !== undefined &&
					assertEvalToString(37));
			}
			function isMSIE() {
				return (navigator.msSaveBlob !== undefined && assertEvalToString(39));
			}
			/**
			 * Safari (Safari for iOS & macOS)
			 **/
			function newSafariTest() {
				var tmp_name = String(Math.random());
				try {
					var db = window.indexedDB.open(tmp_name, 1);
					db.onupgradeneeded = function (i) {
						var _a, _b;
						var res = (_a = i.target) === null || _a === void 0 ? void 0 : _a.result;
						try {
							res.createObjectStore("test", {
								autoIncrement: true
							}).put(new Blob);
							__callback(false);
						}
						catch (e) {
							var message = e;
							if (e instanceof Error) {
							    message = (_b = e.message) !== null && _b !== void 0 ? _b : e;
							}
							if (typeof message !== 'string') {
							    return __callback(false);
							}
							var matchesExpectedError = /BlobURLs are not yet supported/.test(message);
							return __callback(matchesExpectedError);
						}
						finally {
							res.close();
							window.indexedDB.deleteDatabase(tmp_name);
						}
					};
				}
				catch (e) {
					return __callback(false);
				}
			}
			function oldSafariTest() {
				var openDB = window.openDatabase;
				var storage = window.localStorage;
				try {
					openDB(null, null, null, null);
				}
				catch (e) {
					return __callback(true);
				}
				try {
					storage.setItem("test", "1");
					storage.removeItem("test");
				}
				catch (e) {
					return __callback(true);
				}
				return __callback(false);
			}
			function safariPrivateTest() {
				if (navigator.maxTouchPoints !== undefined) {
					newSafariTest();
				}
				else {
					oldSafariTest();
				}
			}
			/**
			 * Chrome
			 **/
			function getQuotaLimit() {
				var w = window;
				if (w.performance !== undefined &&
					w.performance.memory !== undefined &&
					w.performance.memory.jsHeapSizeLimit !== undefined) {
				return performance.memory.jsHeapSizeLimit;
				}
				return 1073741824;
			}
			// >= 76
			function storageQuotaChromePrivateTest() {
				navigator.webkitTemporaryStorage.queryUsageAndQuota(function (_, quota) {
					var quotaInMib = Math.round(quota / (1024 * 1024));
					var quotaLimitInMib = Math.round(getQuotaLimit() / (1024 * 1024)) * 2;
					__callback(quotaInMib < quotaLimitInMib);
				}, function (e) {
					reject(new Error("detectIncognito somehow failed to query storage quota: " + e.message));
				});
			}
			// 50 to 75
			function oldChromePrivateTest() {
				var fs = window.webkitRequestFileSystem;
				var success = function () {
					__callback(false);
				};
				var error = function () {
					__callback(true);
				};
				fs(0, 1, success, error);
			}
			function chromePrivateTest() {
				if (self.Promise !== undefined && self.Promise.allSettled !== undefined) {
					storageQuotaChromePrivateTest();
				}
				else {
					oldChromePrivateTest();
				}
			}
			/**
			 * Firefox
			 **/
			function firefoxPrivateTest() {
				__callback(navigator.serviceWorker === undefined);
			}
			/**
			 * MSIE
			 **/
			function msiePrivateTest() {
				__callback(window.indexedDB === undefined);
			}
			function main() {
				if (isSafari()) {
					browserName = 'Safari';
					safariPrivateTest();
				}
				else if (isChrome()) {
					browserName = identifyChromium();
					chromePrivateTest();
				}
				else if (isFirefox()) {
					browserName = "Firefox";
					firefoxPrivateTest();
				}
				else if (isMSIE()) {
					browserName = "Internet Explorer";
					msiePrivateTest();
				}
				else {
					// Fallback
					__callback(false);
				}
			}
			main();
		});
	};
    // *** Kết thúc Hàm detectIncognito ***
})();
