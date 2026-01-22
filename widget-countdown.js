(function() {
    // Cấu hình chung
    const CONTAINER_ID = 'TrafficUser';
    const PASS_CODE = '123@789';

    let seconds = 30;
    let interval;
    let counting = false;
    let isPausedByScroll = false; // Theo dõi trạng thái tạm dừng do cuộn
    let incognitoChecked = false; // <<< BIẾN MỚI: Theo dõi trạng thái đã kiểm tra ẩn danh thành công chưa

    // --- CẤU HÌNH CHO TÍNH NĂNG CUỘN CHUỘT ---
    let scrollTimeout; // Biến để lưu trữ timeout
    const SCROLL_STOP_DELAY = 10000; // 10 giây (10000ms)

    // Thông báo khi dừng cuộn 
    const SCROLL_ALERT_MESSAGE = 'Vui lòng thực hiện thao tác cuộn để tiếp tục đếm ngược thời gian.';
    // -----------------------------------------------------------------

    // Cấu hình các tính năng cũ (giữ nguyên)
    const REF_DOMAIN_LIST = ["google.com","google.ad","google.ae","google.com.af","google.com.ag","google.com.ai","google.al","google.am","google.co.ao","google.com.ar","google.as","google.at","google.com.au","google.az","google.ba","google.com.bd","google.be","google.bf","google.bg","google.com.bh","google.bi","google.bj","google.com.bn","google.com.bo","google.com.br","google.bs","google.bt","google.co.bw","google.by","google.com.bz","google.ca","google.cd","google.cf","google.cg","google.ch","google.ci","google.co.ck","google.cl","google.cm","google.cn","google.com.co","google.co.cr","google.com.cu","google.cv","google.com.cy","google.cz","google.de","google.dj","google.dk","google.dm","google.com.do","google.dz","google.com.ec","google.ee","google.com.eg","google.es","google.com.et","google.fi","google.com.fj","google.fm","google.fr","google.ga","google.ge","google.gg","google.com.gh","google.com.gi","google.gl","google.gm","google.gr","google.com.gt","google.gy","google.com.hk","google.hn","google.hr","google.ht","google.hu","google.co.id","google.ie","google.co.il","google.im","google.co.in","google.iq","google.is","google.it","google.je","google.com.jm","google.jo","google.co.jp","google.co.ke","google.com.kh","google.ki","google.kg","google.co.kr","google.com.kw","google.kz","google.la","google.com.lb","google.li","google.lk","google.co.ls","google.lt","google.lu","google.lv","google.com.ly","google.co.ma","google.md","google.me","google.mg","google.mk","google.ml","google.com.mm","google.mn","google.ms","google.com.mt","google.mu","google.mv","google.mw","google.com.mx","google.com.my","google.co.mz","google.com.na","google.com.ng","google.com.ni","google.ne","google.nl","google.no","google.com.np","google.nr","google.nu","google.co.nz","google.com.om","google.com.pa","google.com.pe","google.com.pg","google.com.ph","google.com.pk","google.pl","google.pn","google.com.pr","google.ps","google.pt","google.com.py","google.com.qa","google.ro","google.ru","google.rw","google.com.sa","google.com.sb","google.sc","google.se","google.com.sg","google.sh","google.si","google.sk","google.com.sl","google.sn","google.so","google.sm","google.sr","google.st","google.com.sv","google.td","google.tg","google.co.th","google.com.tj","google.tl","google.tm","google.tn","google.to","google.com.tr","google.tt","google.com.tw","google.co.tz","google.com.ua","google.co.ug","google.co.uk","google.com.uy","google.co.uz","google.com.vc","google.co.ve","google.vg","google.co.vi","google.com.vn","google.vu","google.ws","google.rs","google.co.za","google.co.zm","google.co.zw","google.cat"];
    const PRIVATE_MODE_MESSAGE = 'Vui lòng tắt chế độ Ẩn danh để tiếp tục. Xin cảm ơn.';
    const BASE_COLOR = '#ed1c24'; // Màu đỏ gốc
    const HOVER_COLOR = '#c40b11'; // Màu đỏ đậm khi hover
    const ACTIVE_COLOR = '#9a070d'; // Màu đỏ rất đậm khi mousedown/nhấn
    const READY_COLOR = '#128BE0'; // Màu xanh khi mã sẵn sàng

    // Hàm sao chép mã (Giữ nguyên)
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

    // Kiểm tra Referrer (Giữ nguyên)
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

    // Thoát nếu không phải từ Google Search
    if (!checkGoogleReferrer()) return;

    // 1. Tìm container và kiểm tra
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error(`Không tìm thấy container có ID: ${CONTAINER_ID}`);
        return;
    }

    // 2. CSS - Định nghĩa style cho nút và thông báo cảnh báo cuộn
    const style = document.createElement('style');
    style.textContent = `
        /* Styles cho nút chính (Màu nền được kiểm soát qua JS) */
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
            height: 15px;
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

        /* --- STYLE CHO THÔNG BÁO CUỘN ĐỘC LẬP --- */
        #scroll-alert-${CONTAINER_ID} {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 25px;
            background: rgba(255, 0, 0, 0.95); /* Tăng nhẹ độ trong suốt nền đỏ */
            color: yellow;
            font-weight: 700;
            font-size: 16px;
            border-radius: 10px;
            text-align: center;
            line-height: 1.5;
            z-index: 9998;
            display: none;
            /* TỐI ƯU HIỆU ỨNG VIỀN */
            animation: border-pulse 1s infinite alternate; 
        }
        
        /* Keyframes cho hiệu ứng viền trắng chạy bo */
        @keyframes border-pulse {
            0% { 
                /* Viền trắng mờ, sát cạnh */
                box-shadow: 0 0 0px rgba(255, 255, 255, 0), 0 0 5px rgba(255, 0, 0, 0.8);
            }
            50% { 
                /* Viền trắng sáng và sắc nét hơn, ít mờ */
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 0, 0, 0.9); 
            }
            100% { 
                /* Viền trắng mờ nhẹ, lan ra vừa phải */
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 0, 0, 1);
            }
        }
        /* --- KẾT THÚC STYLE MỚI --- */
        
        .custom-button-${CONTAINER_ID}.paused-state {
            background: ${BASE_COLOR};
        }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const buttonId = `get-code-btn-${CONTAINER_ID}`;
    const textId = `button-text-${CONTAINER_ID}`;
    const scrollAlertId = `scroll-alert-${CONTAINER_ID}`; // ID thông báo cuộn

    // Tạo nút "LẤY MÃ" ban đầu
    container.innerHTML = `
        <span id="${buttonId}" class="custom-button-${CONTAINER_ID}">
            <img src="https://trafficuser.vn/wp-content/uploads/2025/12/logo-64x.png" alt="icon">
            <span id="${textId}">LẤY MÃ</span>
        </span>
    `;

    // Thêm thông báo copy và thông báo cuộn vào body
    const alertHtml = `<div id="copy-alert-${CONTAINER_ID}">Đã sao chép mã!</div>`;
    const scrollAlertHtml = `<div id="${scrollAlertId}">${SCROLL_ALERT_MESSAGE}</div>`;

    document.body.insertAdjacentHTML('beforeend', alertHtml);
    document.body.insertAdjacentHTML('beforeend', scrollAlertHtml); // Chèn thông báo cuộn

    // 4. JS Logic
    const btn = document.getElementById(buttonId);
    const btnText = document.getElementById(textId);
    const alertElement = document.getElementById(`copy-alert-${CONTAINER_ID}`);
    const scrollAlertElement = document.getElementById(scrollAlertId);


    function copyCodeHandler() {
        copyToClipboard(PASS_CODE, alertElement);
    }

    // --- LOGIC ĐẾM NGƯỢC ---
    function updateCountdown() {
        if (seconds > 0) {
            btnText.textContent = `Lấy mã sau ${seconds}s`;
            seconds--;
        } else {
            // Kết thúc đếm ngược
            clearInterval(interval);
            interval = null; // Thêm
            counting = false;

            // Dọn dẹp listener cuộn và timeout + Ẩn thông báo cuộn
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = null; // Thêm
            scrollAlertElement.style.display = 'none';
            isPausedByScroll = false; // Đảm bảo trạng thái dừng được reset
            
            incognitoChecked = false; // Reset cờ để nếu người dùng nhấn lại sau khi hết giờ

            // Màu xanh lá cây (sẵn sàng)
            btn.style.background = BASE_COLOR; // <<< SỬA: Dùng READY_COLOR
            btn.classList.remove('disabled-state');
            btn.classList.remove('paused-state'); // Xóa trạng thái dừng
            btn.style.cursor = 'pointer';

            btnText.innerHTML = `Mã KM: ${PASS_CODE} <img src="https://trafficuser.vn/wp-content/uploads/2025/12/icon-copy.png" alt="Copy" style="height: 14px !important; margin: -5px 0 0 3px !important; vertical-align: middle; display: inline-block; width:auto !important;">`;

            // Thay thế sự kiện click
            btn.removeEventListener('click', checkIncognitoAndStart);
            btn.addEventListener('click', copyCodeHandler);

            // Khôi phục hiệu ứng hover/active cho trạng thái sẵn sàng
            restoreInteractionListeners(BASE_COLOR); // <<< SỬA: Dùng READY_COLOR
        }
    }
    
    // --- TẠM DỪNG VÀ TIẾP TỤC BỘ ĐẾM ---
    function pauseCountdown() {
        if (!counting || isPausedByScroll || seconds <= 0 || interval === null) return; // Thêm interval check
        
        clearInterval(interval);
        interval = null; // Đặt về null
        isPausedByScroll = true;
        btn.classList.add('paused-state');
    }
    
    function resumeCountdown() {
        // Chỉ chạy lại nếu đang đếm và đang bị tạm dừng do cuộn
        if (!counting || !isPausedByScroll || seconds <= 0 || interval !== null) return;
        
        // Cập nhật lại số giây trên nút ngay khi chạy tiếp
        btnText.textContent = `Lấy mã sau ${seconds}s`; 
        
        interval = setInterval(updateCountdown, 1000);
        isPausedByScroll = false;
        btn.classList.remove('paused-state');
    }

    function startCountdown() {
        // Chỉ chạy nếu chưa đếm hoặc chưa hết giờ
        if (counting || seconds <= 0) return; 
        
        counting = true;
        incognitoChecked = true; // Đánh dấu đã kiểm tra thành công

        btn.style.background = BASE_COLOR;

        btn.classList.add('disabled-state');
        btn.style.cursor = 'not-allowed';

        // Xóa listener hover
        removeInteractionListeners();
        
        // Cần xóa listener `checkIncognitoAndStart` ngay khi bắt đầu đếm
        btn.removeEventListener('click', checkIncognitoAndStart); 
        // Đảm bảo không có listener nào được gán cho nút khi đang đếm, vì nó đã disable và cursor là not-allowed.

        // Bắt đầu đếm ngược
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);

        // Bắt đầu theo dõi sự kiện cuộn
        window.addEventListener('scroll', handleScroll);
        
        // Khởi động timeout ban đầu
        setScrollStopTimeout();
    }

    // --- LOGIC Xử lý sự kiện cuộn chuột ĐỘC LẬP ---
    
    function showScrollAlert() {
        if (counting && seconds > 0 && !isPausedByScroll) { // Chỉ hiển thị nếu đang đếm và chưa bị tạm dừng
            scrollAlertElement.style.display = 'block';
            
            // TẠM DỪNG đếm ngược khi thông báo hiển thị
            pauseCountdown(); 
        }
    }
    
    function hideScrollAlert() {
        scrollAlertElement.style.display = 'none';
        
        // CHẠY LẠI đếm ngược khi thông báo ẩn (chỉ khi nó bị tạm dừng)
        resumeCountdown(); 
    }
    
    function setScrollStopTimeout() {
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        
        // Đặt timeout mới
        scrollTimeout = setTimeout(showScrollAlert, SCROLL_STOP_DELAY);
    }

    function handleScroll() {
        if (!counting || seconds <= 0) return;

        // 1. Ẩn thông báo ngay lập tức khi cuộn
        hideScrollAlert();

        // 2. Thiết lập timeout mới: nếu dừng cuộn, thông báo sẽ hiển thị lại
        setScrollStopTimeout();
    }

    // --- KẾT THÚC LOGIC ĐỘC LẬP ---

    // --- Quản lý Hiệu ứng Tương tác (Giữ nguyên) ---
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

    // --- Xử lý visibilitychange ---
    function handleVisibilityChange() {
        if (document.hidden) {
            // Khi tab ẩn, luôn dừng interval 
            if (interval) {
                clearInterval(interval);
                interval = null; // Đặt về null
            }
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
                scrollTimeout = null; // Đặt về null
            }
            hideScrollAlert(); // Ẩn thông báo khi tab bị ẩn
        } else {
            // Khi tab hiển thị lại
            // Chỉ chạy lại nếu interval đang là null (đang bị dừng) VÀ chưa hết giờ VÀ không bị dừng do cuộn
            if (interval === null && seconds > 0 && !isPausedByScroll && counting) { 
                btn.style.background = BASE_COLOR;
                updateCountdown();
                interval = setInterval(updateCountdown, 1000);
            }
            // Chỉ đặt lại timeout cuộn nếu đang đếm ngược
            if (counting && seconds > 0) {
                 setScrollStopTimeout(); // Tiếp tục kiểm tra dừng cuộn
            }


            if (seconds === 0 && !counting) {
                 btn.style.background = BASE_COLOR; // <<< SỬA: Dùng READY_COLOR
                 restoreInteractionListeners(BASE_COLOR); // <<< SỬA: Dùng READY_COLOR
            }
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // -----------------------------------------------------------------

    // --- Logic Kiểm tra Ẩn danh và Bắt đầu Đếm ngược ---
    function checkIncognitoAndStart() {
        // <<< LOGIC MỚI: Thoát nếu đã kiểm tra thành công và đang đếm
        if (incognitoChecked && counting) {
            return;
        }

        removeInteractionListeners();

        detectIncognito().then((result) => {
            if (result.isPrivate) {
                // Tình huống ẩn danh: dừng mọi thứ, hiển thị thông báo
                if (interval) clearInterval(interval);
                interval = null; // Đặt về null
                if (scrollTimeout) clearTimeout(scrollTimeout);
                scrollTimeout = null; // Đặt về null
                window.removeEventListener('scroll', handleScroll);
                hideScrollAlert(); // Ẩn thông báo

                counting = false;
                isPausedByScroll = false; // Reset cờ tạm dừng
                incognitoChecked = false; // Không đánh dấu thành công

                btn.style.background = BASE_COLOR;
                btn.classList.add('disabled-state');
                btn.classList.remove('paused-state');
                btn.style.cursor = 'default';
                btnText.textContent = PRIVATE_MODE_MESSAGE;

                // KHÔNG xóa/thêm listener click ở đây, vì setTimeout ở dưới sẽ tự làm
                // btn.removeEventListener('click', checkIncognitoAndStart); 

                setTimeout(() => {
                    // Đưa nút về trạng thái ban đầu sau 5 giây
                    btn.style.background = BASE_COLOR;
                    btn.classList.remove('disabled-state');
                    btn.style.cursor = 'pointer';
                    btnText.textContent = 'LẤY MÃ';
                    // Đảm bảo listener click ban đầu vẫn còn (đã gán ở dòng cuối)
                    restoreInteractionListeners(BASE_COLOR);
                }, 5000);

            } else {
                // Tình huống KHÔNG ẩn danh: bắt đầu đếm ngược
                incognitoChecked = true; // <<< Đánh dấu đã kiểm tra thành công
                startCountdown();
            }
        });
    }

    // Gán sự kiện click ban đầu
    btn.addEventListener('click', checkIncognitoAndStart);
    // Gán hiệu ứng tương tác ban đầu
    restoreInteractionListeners(BASE_COLOR);


    // *** Hàm detectIncognito phức tạp (Giữ nguyên) ***
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