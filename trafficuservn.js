.custom-button-${CONTAINER_ID} {
            background: linear-gradient(180deg, #F94D4C 0%, #E00706 100%) !important;
            border: 2px solid #fff;
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 7px;
            padding: 5px 5px;
            margin: 5px;
            min-width: 130px;
            line-height: 20px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            z-index: 0;
            user-select: none;
            transition: none;
            position: relative;
            overflow: hidden;
        }
        
        /* HIỆU ỨNG ÁNH SÁNG CHẠY NGANG QUA (SHIMMER EFFECT) */
        .custom-button-${CONTAINER_ID}::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 50%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.4),
                transparent
            );
            transform: skewX(-20deg);
            animation: shimmer-${CONTAINER_ID} 2.5s infinite;
        }

        @keyframes shimmer-${CONTAINER_ID} {
            0% {
                left: -150%;
            }
            20% {
                left: 150%;
            }
            100% {
                left: 150%;
            }
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
        #copy-alert-${CONTAINER_ID} {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #E00706;
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
            color: #ffffff;
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
            background: linear-gradient(180deg, #F94D4C 0%, #E00706 100%) !important;
        }
