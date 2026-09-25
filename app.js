// ======================================================
// 602ZR Website
// app.js
// GitHub Pages compatible version
// ======================================================


// ======================================================
// 1. 基本設定
// ======================================================

// GitHub Repository 名稱
const REPO_NAME = "602zr.com";

// Google OAuth Client ID
// 建立 Google OAuth 後，把下面換成你的 Client ID
const GOOGLE_CLIENT_ID =
    "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";


// ======================================================
// 2. 自動判斷網站根目錄
// ======================================================
//
// GitHub Pages：
// https://602g.github.io/602zr.com/
//
// 未來自訂網域：
// https://602zr.com/
//
// 這樣不用重新修改所有連結。
// ======================================================

const IS_GITHUB_PAGES =
    window.location.hostname.endsWith("github.io");

const BASE_PATH =
    IS_GITHUB_PAGES
        ? `/${REPO_NAME}`
        : "";


// ======================================================
// 3. 建立網站網址
// ======================================================

function siteURL(path = "/") {

    if (!path.startsWith("/")) {
        path = "/" + path;
    }

    return BASE_PATH + path;
}


// ======================================================
// 4. 首頁功能
// ======================================================

const SITE_LINKS = [

    {
        title: "⚔️ 對戰模擬",
        description: "進入 Pokémon TCG 對戰模擬",
        url: siteURL("/game/")
    },

    {
        title: "🃏 牌組編輯",
        description: "建立、修改與管理你的牌組",
        url: siteURL("/deck/")
    },

    {
        title: "🔴 PTCG 訓練家網站臺灣",
        description: "前往 Pokémon Card Game 台灣官方網站",
        url: "https://asia.pokemon-card.com/tw/",
        external: true
    },

    {
        title: "🏆 最新賽事",
        description: "查看最新比賽與活動資訊",
        url: siteURL("/contest/")
    },

    {
        title: "💬 聊天平台",
        description: "進入 602ZR 玩家聊天平台",
        url: siteURL("/chat/")
    }

];


// ======================================================
// 5. 網頁載入
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderNavigation();

        restoreUser();

        waitForGoogleAPI();

        setupHomeLinks();

    }
);


// ======================================================
// 6. 首頁 Logo / Home Link
// ======================================================

function setupHomeLinks() {

    document
        .querySelectorAll("[data-home-link]")
        .forEach(link => {

            link.href = siteURL("/");

        });

}


// ======================================================
// 7. 建立首頁功能選單
// ======================================================

function renderNavigation() {

    const container =
        document.getElementById("home-links");

    // 如果目前不是首頁就停止
    if (!container) {
        return;
    }

    container.innerHTML = "";


    SITE_LINKS.forEach(item => {

        const link =
            document.createElement("a");

        link.className =
            "menu-card";

        link.href =
            item.url;


        if (item.external) {

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

        }


        const title =
            document.createElement("div");

        title.className =
            "menu-title";

        title.textContent =
            item.title;


        const description =
            document.createElement("div");

        description.className =
            "menu-description";

        description.textContent =
            item.description;


        link.appendChild(title);

        link.appendChild(description);

        container.appendChild(link);

    });

}


// ======================================================
// 8. 等待 Google Login API
// ======================================================

function waitForGoogleAPI() {

    // 如果頁面沒有登入區域，就不需要一直檢查
    const authArea =
        document.getElementById("auth-area");

    if (!authArea) {
        return;
    }


    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        initializeGoogleLogin();

        return;

    }


    setTimeout(
        waitForGoogleAPI,
        250
    );

}


// ======================================================
// 9. 初始化 Google Login
// ======================================================

function initializeGoogleLogin() {

    if (
        !GOOGLE_CLIENT_ID ||
        GOOGLE_CLIENT_ID.startsWith(
            "YOUR_GOOGLE_CLIENT_ID"
        )
    ) {

        console.warn(
            "尚未設定 Google OAuth Client ID"
        );

        showGoogleSetupMessage();

        return;

    }


    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin,

        auto_select:
            false,

        cancel_on_tap_outside:
            true

    });


    renderLoginArea();

}


// ======================================================
// 10. Google Login 成功
// ======================================================

function handleGoogleLogin(response) {

    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "Google 登入失敗"
        );

        return;

    }


    const payload =
        decodeJWT(
            response.credential
        );


    if (!payload) {

        alert(
            "無法讀取 Google 帳號資料"
        );

        return;

    }


    const user = {

        id:
            payload.sub || "",

        name:
            payload.name || "",

        email:
            payload.email || "",

        picture:
            payload.picture || ""

    };


    saveUser(user);

    renderUser(user);

}


// ======================================================
// 11. Decode Google JWT
// ======================================================

function decodeJWT(token) {

    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }


        let base64 =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        while (
            base64.length % 4
        ) {

            base64 += "=";

        }


        const json =
            decodeURIComponent(

                atob(base64)
                    .split("")
                    .map(character => {

                        return (
                            "%" +
                            (
                                "00" +
                                character
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2)
                        );

                    })
                    .join("")

            );


        return JSON.parse(json);

    }

    catch (error) {

        console.error(
            "JWT Decode Error:",
            error
        );

        return null;

    }

}


// ======================================================
// 12. 儲存使用者
// ======================================================

function saveUser(user) {

    try {

        localStorage.setItem(
            "602zr_user",
            JSON.stringify(user)
        );

    }

    catch (error) {

        console.error(
            "無法儲存使用者資料",
            error
        );

    }

}


// ======================================================
// 13. 取得目前使用者
// ======================================================

function getCurrentUser() {

    const saved =
        localStorage.getItem(
            "602zr_user"
        );


    if (!saved) {
        return null;
    }


    try {

        return JSON.parse(saved);

    }

    catch {

        localStorage.removeItem(
            "602zr_user"
        );

        return null;

    }

}


// ======================================================
// 14. 恢復登入顯示
// ======================================================

function restoreUser() {

    const user =
        getCurrentUser();


    if (user) {

        renderUser(user);

    }

}


// ======================================================
// 15. 顯示 Google Login Button
// ======================================================

function renderLoginArea() {

    const area =
        document.getElementById(
            "auth-area"
        );


    if (!area) {
        return;
    }


    const user =
        getCurrentUser();


    if (user) {

        renderUser(user);

        return;

    }


    area.innerHTML = "";


    const button =
        document.createElement("div");

    button.id =
        "google-login-button";

    area.appendChild(button);


    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        google.accounts.id.renderButton(

            button,

            {

                theme:
                    "outline",

                size:
                    "large",

                shape:
                    "pill",

                type:
                    "standard",

                text:
                    "signin_with"

            }

        );

    }

}


// ======================================================
// 16. 尚未設定 Google Client ID
// ======================================================

function showGoogleSetupMessage() {

    const area =
        document.getElementById(
            "auth-area"
        );


    if (!area) {
        return;
    }


    const user =
        getCurrentUser();


    if (user) {

        renderUser(user);

        return;

    }


    area.innerHTML = `
        <span class="google-not-configured">
            Google 登入尚未設定
        </span>
    `;

}


// ======================================================
// 17. 顯示登入使用者
// ======================================================

function renderUser(user) {

    const area =
        document.getElementById(
            "auth-area"
        );


    if (!area) {
        return;
    }


    area.innerHTML = "";


    const accountBox =
        document.createElement("div");

    accountBox.className =
        "account-box";


    // 頭像
    if (user.picture) {

        const avatar =
            document.createElement("img");

        avatar.className =
            "account-avatar";

        avatar.src =
            user.picture;

        avatar.alt =
            "Google Account";

        avatar.referrerPolicy =
            "no-referrer";

        accountBox.appendChild(
            avatar
        );

    }


    // 使用者資料
    const information =
        document.createElement("div");

    information.className =
        "account-info";


    const name =
        document.createElement("div");

    name.className =
        "account-name";

    name.textContent =
        user.name || "Google 使用者";


    const email =
        document.createElement("div");

    email.className =
        "account-email";

    email.textContent =
        user.email || "";


    information.appendChild(
        name
    );

    information.appendChild(
        email
    );


    // 登出
    const logoutButton =
        document.createElement(
            "button"
        );

    logoutButton.className =
        "logout-button";

    logoutButton.textContent =
        "登出";

    logoutButton.addEventListener(
        "click",
        logout
    );


    accountBox.appendChild(
        information
    );

    accountBox.appendChild(
        logoutButton
    );


    area.appendChild(
        accountBox
    );

}


// ======================================================
// 18. 登出
// ======================================================

function logout() {

    localStorage.removeItem(
        "602zr_user"
    );


    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        google.accounts.id.disableAutoSelect();

    }


    renderLoginArea();

}


// ======================================================
// 19. 判斷是否已登入
// ======================================================

function isLoggedIn() {

    return (
        getCurrentUser() !== null
    );

}


// ======================================================
// 20. 必須登入才能使用
// ======================================================
//
// 未來例如牌組編輯器可以：
//
// if (!ZR602.requireLogin()) {
//     return;
// }
//
// ======================================================

function requireLogin() {

    if (
        isLoggedIn()
    ) {

        return true;

    }


    alert(
        "請先使用 Google 帳號登入 602ZR"
    );


    window.location.href =
        siteURL("/");


    return false;

}


// ======================================================
// 21. 提供其他頁面 JavaScript 使用
// ======================================================

window.ZR602 = {

    getCurrentUser:
        getCurrentUser,

    isLoggedIn:
        isLoggedIn,

    requireLogin:
        requireLogin,

    logout:
        logout,

    siteURL:
        siteURL,

    basePath:
        BASE_PATH

};=
