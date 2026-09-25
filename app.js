// =====================================================
// 602ZR 共用 JavaScript
// app.js
// =====================================================

// 將這裡換成你在 Google Cloud Console 建立的 OAuth Client ID
const GOOGLE_CLIENT_ID =
    "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";


// =====================================================
// 網站連結
// =====================================================

const SITE_LINKS = [
    {
        title: "⚔️ 對戰模擬",
        description: "進入 Pokémon TCG 對戰模擬",
        url: "/game"
    },
    {
        title: "🃏 牌組編輯",
        description: "建立、修改與管理牌組",
        url: "/deck"
    },
    {
        title: "🔴 PTCG 訓練家網站臺灣",
        description: "前往寶可夢集換式卡牌遊戲官方網站",
        url: "https://asia.pokemon-card.com/tw/",
        external: true
    },
    {
        title: "🏆 最新賽事",
        description: "查看最新賽事資訊",
        url: "/contest"
    },
    {
        title: "💬 聊天平台",
        description: "進入 602ZR 玩家聊天室",
        url: "/chat"
    }
];


// =====================================================
// 初始化
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    renderNavigation();

    restoreUser();

    waitForGoogleAPI();

});


// =====================================================
// 建立首頁按鈕
// =====================================================

function renderNavigation() {

    const container = document.getElementById("home-links");

    // 子頁面沒有 home-links 就不執行
    if (!container) return;

    container.innerHTML = "";

    SITE_LINKS.forEach(item => {

        const link = document.createElement("a");

        link.className = "menu-card";
        link.href = item.url;

        if (item.external) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }

        link.innerHTML = `
            <div class="menu-title">
                ${item.title}
            </div>

            <div class="menu-description">
                ${item.description}
            </div>
        `;

        container.appendChild(link);

    });

}


// =====================================================
// 等待 Google API 載入
// =====================================================

function waitForGoogleAPI() {

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        initializeGoogleLogin();

        return;
    }

    setTimeout(waitForGoogleAPI, 200);

}


// =====================================================
// Google Login 初始化
// =====================================================

function initializeGoogleLogin() {

    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin,

        auto_select: false,

        cancel_on_tap_outside: true

    });

    renderLoginArea();

}


// =====================================================
// Google 登入完成
// =====================================================

async function handleGoogleLogin(response) {

    if (!response.credential) {
        console.error("Google 登入失敗");
        return;
    }


    /*
        response.credential 是 Google ID Token

        正式網站：
        建議傳到 Server 驗證 Token。

        以下先解析使用者資料，
        讓純前端版本也能運作。
    */

    const payload = decodeJWT(response.credential);

    if (!payload) {

        alert("Google 帳號資料讀取失敗");

        return;
    }


    const user = {

        id: payload.sub,

        name: payload.name,

        email: payload.email,

        picture: payload.picture

    };


    /*
        儲存顯示資料

        因為 domain/game
        domain/deck
        domain/chat

        都屬於同一個 origin，
        所以 localStorage 可以共同取得。
    */

    localStorage.setItem(
        "602zr_user",
        JSON.stringify(user)
    );


    /*
        正式版可以把 Google credential
        送到 Server：

        await fetch("/api/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                credential: response.credential
            })
        });

    */


    renderUser(user);

}


// =====================================================
// JWT Decode
// =====================================================

function decodeJWT(token) {

    try {

        const base64Url = token.split(".")[1];

        const base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        const jsonPayload = decodeURIComponent(

            atob(base64)
                .split("")
                .map(c => {

                    return "%" +
                        ("00" +
                            c.charCodeAt(0)
                                .toString(16)
                        ).slice(-2);

                })
                .join("")

        );


        return JSON.parse(jsonPayload);

    }

    catch (error) {

        console.error(
            "JWT decode error:",
            error
        );

        return null;

    }

}


// =====================================================
// 恢復登入狀態
// =====================================================

function restoreUser() {

    const saved =
        localStorage.getItem("602zr_user");

    if (!saved) {

        renderLoginArea();

        return;
    }


    try {

        const user =
            JSON.parse(saved);

        renderUser(user);

    }

    catch {

        localStorage.removeItem(
            "602zr_user"
        );

    }

}


// =====================================================
// 顯示 Google Login
// =====================================================

function renderLoginArea() {

    const area =
        document.getElementById("auth-area");

    if (!area) return;


    // 如果已登入，不重新顯示登入按鈕
    const saved =
        localStorage.getItem("602zr_user");

    if (saved) {

        renderUser(
            JSON.parse(saved)
        );

        return;
    }


    area.innerHTML = `
        <div id="google-login-button"></div>
    `;


    if (
        !window.google ||
        !google.accounts
    ) return;


    google.accounts.id.renderButton(

        document.getElementById(
            "google-login-button"
        ),

        {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "signin_with"
        }

    );

}


// =====================================================
// 顯示登入帳號
// =====================================================

function renderUser(user) {

    const area =
        document.getElementById("auth-area");

    if (!area) return;


    area.innerHTML = `

        <div class="account-box">

            <img
                src="${escapeHTML(user.picture)}"
                class="account-avatar"
                alt="Google Account"
            >

            <div class="account-info">

                <div class="account-name">
                    ${escapeHTML(user.name)}
                </div>

                <div class="account-email">
                    ${escapeHTML(user.email)}
                </div>

            </div>

            <button
                id="logout-button"
                class="logout-button"
            >
                登出
            </button>

        </div>

    `;


    document
        .getElementById("logout-button")
        .addEventListener(
            "click",
            logout
        );

}


// =====================================================
// 登出
// =====================================================

function logout() {

    localStorage.removeItem(
        "602zr_user"
    );


    if (
        window.google &&
        google.accounts
    ) {

        google.accounts.id.disableAutoSelect();

    }


    renderLoginArea();

}


// =====================================================
// 取得目前使用者
//
// 其他 JS 可以：
//
// const user = getCurrentUser();
//
// =====================================================

function getCurrentUser() {

    const saved =
        localStorage.getItem("602zr_user");

    if (!saved)
        return null;


    try {

        return JSON.parse(saved);

    }

    catch {

        return null;

    }

}


// =====================================================
// 是否登入
// =====================================================

function isLoggedIn() {

    return getCurrentUser() !== null;

}


// =====================================================
// HTML 防注入
// =====================================================

function escapeHTML(value) {

    if (!value)
        return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// 提供給其他 JS 使用
// =====================================================

window.ZR602 = {

    getCurrentUser,

    isLoggedIn,

    logout

};
