// ======================================================
// 602ZR
// app.js
// ======================================================


// ======================================================
// GAS Backend
// ======================================================

const GAS_URL =
    "PASTE_YOUR_GAS_WEB_APP_URL_HERE";


// ======================================================
// GitHub Pages
// ======================================================

const REPO_NAME =
    "602zr.com";


const IS_GITHUB_PAGES =
    window.location.hostname.endsWith(
        "github.io"
    );


const BASE_PATH =
    IS_GITHUB_PAGES
        ? "/" + REPO_NAME
        : "";


function siteURL(path = "/") {

    if (!path.startsWith("/")) {
        path = "/" + path;
    }

    return BASE_PATH + path;

}


// ======================================================
// 首頁
// ======================================================

const SITE_LINKS = [

    {
        title:
            "⚔️ 對戰模擬",

        description:
            "進入 Pokémon TCG 對戰模擬",

        url:
            siteURL("/game/")
    },

    {
        title:
            "🃏 牌組編輯",

        description:
            "建立、修改與管理你的牌組",

        url:
            siteURL("/deck/")
    },

    {
        title:
            "🔴 PTCG 訓練家網站臺灣",

        description:
            "前往 Pokémon Card Game 台灣官方網站",

        url:
            "https://asia.pokemon-card.com/tw/",

        external:
            true
    },

    {
        title:
            "🏆 最新賽事",

        description:
            "查看最新賽事資訊",

        url:
            siteURL("/contest/")
    },

    {
        title:
            "💬 聊天平台",

        description:
            "進入 602ZR 玩家聊天室",

        url:
            siteURL("/chat/")
    }

];


// ======================================================
// State
// ======================================================

let pendingRegisterEmail = "";

let pendingLoginUsername = "";

let currentUser = null;


// ======================================================
// Start
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        renderNavigation();

        setupAuthUI();

        renderLoggedOut();

        await restoreSession();

    }
);


// ======================================================
// 首頁 Menu
// ======================================================

function renderNavigation() {

    const container =
        document.getElementById(
            "home-links"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    SITE_LINKS.forEach(item => {

        const a =
            document.createElement("a");

        a.className =
            "menu-card";

        a.href =
            item.url;


        if (item.external) {

            a.target =
                "_blank";

            a.rel =
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


        a.appendChild(title);

        a.appendChild(description);

        container.appendChild(a);

    });

}


// ======================================================
// API
// ======================================================

async function api(action, data = {}) {

    if (
        !GAS_URL ||
        GAS_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        throw new Error(
            "尚未設定 GAS 後端網址"
        );

    }


    const response =
        await fetch(

            GAS_URL,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify({

                        action,
                        ...data

                    })

            }

        );


    if (!response.ok) {

        throw new Error(
            "伺服器連線失敗"
        );

    }


    return await response.json();

}


// ======================================================
// Auth UI
// ======================================================

function setupAuthUI() {

    const modal =
        document.getElementById(
            "auth-modal"
        );


    document
        .getElementById(
            "close-auth"
        )
        .addEventListener(
            "click",
            closeAuthModal
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeAuthModal();

            }

        }
    );


    document
        .getElementById(
            "login-tab"
        )
        .addEventListener(
            "click",
            () => switchTab("login")
        );


    document
        .getElementById(
            "register-tab"
        )
        .addEventListener(
            "click",
            () => switchTab("register")
        );


    document
        .getElementById(
            "login-check-account"
        )
        .addEventListener(
            "click",
            checkLoginAccount
        );


    document
        .getElementById(
            "login-submit"
        )
        .addEventListener(
            "click",
            login
        );


    document
        .getElementById(
            "login-back"
        )
        .addEventListener(
            "click",
            resetLogin
        );


    document
        .getElementById(
            "register-check-email"
        )
        .addEventListener(
            "click",
            checkRegisterEmail
        );


    document
        .getElementById(
            "register-submit"
        )
        .addEventListener(
            "click",
            register
        );


    document
        .getElementById(
            "register-back"
        )
        .addEventListener(
            "click",
            resetRegister
        );

}


// ======================================================
// Logged Out UI
// ======================================================

function renderLoggedOut() {

    const area =
        document.getElementById(
            "auth-area"
        );


    area.innerHTML = "";


    const login =
        document.createElement(
            "button"
        );

    login.className =
        "auth-button primary";

    login.textContent =
        "登入";


    login.addEventListener(
        "click",
        () => {

            openAuthModal(
                "login"
            );

        }
    );


    const register =
        document.createElement(
            "button"
        );

    register.className =
        "auth-button";

    register.textContent =
        "註冊";


    register.addEventListener(
        "click",
        () => {

            openAuthModal(
                "register"
            );

        }
    );


    area.appendChild(login);

    area.appendChild(register);

}


// ======================================================
// Logged In UI
// ======================================================

function renderLoggedIn(user) {

    currentUser =
        user;


    const area =
        document.getElementById(
            "auth-area"
        );


    area.innerHTML = "";


    const box =
        document.createElement("div");

    box.className =
        "user-box";


    const info =
        document.createElement("div");


    const name =
        document.createElement("div");

    name.className =
        "user-name";

    name.textContent =
        user.username;


    const email =
        document.createElement("div");

    email.className =
        "user-email";

    email.textContent =
        user.email || "";


    info.appendChild(name);

    info.appendChild(email);


    const logoutButton =
        document.createElement(
            "button"
        );

    logoutButton.className =
        "auth-button";

    logoutButton.textContent =
        "登出";


    logoutButton.addEventListener(
        "click",
        logout
    );


    box.appendChild(info);

    box.appendChild(logoutButton);

    area.appendChild(box);

}


// ======================================================
// Modal
// ======================================================

function openAuthModal(tab) {

    document
        .getElementById(
            "auth-modal"
        )
        .classList
        .remove("hidden");


    switchTab(tab);

}


function closeAuthModal() {

    document
        .getElementById(
            "auth-modal"
        )
        .classList
        .add("hidden");

}


function switchTab(tab) {

    const loginTab =
        document.getElementById(
            "login-tab"
        );

    const registerTab =
        document.getElementById(
            "register-tab"
        );


    const loginPanel =
        document.getElementById(
            "login-panel"
        );

    const registerPanel =
        document.getElementById(
            "register-panel"
        );


    if (tab === "login") {

        loginTab.classList.add(
            "active"
        );

        registerTab.classList.remove(
            "active"
        );

        loginPanel.classList.remove(
            "hidden"
        );

        registerPanel.classList.add(
            "hidden"
        );

    }

    else {

        registerTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );

        registerPanel.classList.remove(
            "hidden"
        );

        loginPanel.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// Register Step 1
// ======================================================

async function checkRegisterEmail() {

    const email =
        document
            .getElementById(
                "register-email"
            )
            .value
            .trim();


    setStatus(
        "register-status",
        "正在檢查 Email...",
        ""
    );


    try {

        const result =
            await api(

                "checkEmail",

                {
                    email
                }

            );


        if (!result.ok) {

            setStatus(
                "register-status",
                result.message,
                "error"
            );

            return;

        }


        if (!result.available) {

            setStatus(
                "register-status",
                "此 Email 已經綁定其他帳號。",
                "error"
            );

            return;

        }


        pendingRegisterEmail =
            email;


        document
            .getElementById(
                "register-email-preview"
            )
            .textContent =
            "Email：" + email;


        document
            .getElementById(
                "register-step-1"
            )
            .classList
            .add("hidden");


        document
            .getElementById(
                "register-step-2"
            )
            .classList
            .remove("hidden");


        setStatus(
            "register-status",
            "Email 可以使用。",
            "success"
        );

    }

    catch (error) {

        setStatus(
            "register-status",
            error.message,
            "error"
        );

    }

}


// ======================================================
// Register
// ======================================================

async function register() {

    const username =
        document
            .getElementById(
                "register-username"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "register-password"
            )
            .value;


    const confirm =
        document
            .getElementById(
                "register-password-confirm"
            )
            .value;


    if (password !== confirm) {

        setStatus(
            "register-status",
            "兩次輸入的密碼不同。",
            "error"
        );

        return;

    }


    setStatus(
        "register-status",
        "正在建立帳號...",
        ""
    );


    try {

        const result =
            await api(

                "register",

                {

                    email:
                        pendingRegisterEmail,

                    username,

                    password

                }

            );


        if (!result.ok) {

            setStatus(
                "register-status",
                result.message,
                "error"
            );

            return;

        }


        setStatus(
            "register-status",
            "帳號建立成功，請登入。",
            "success"
        );


        setTimeout(
            () => {

                resetRegister();

                switchTab(
                    "login"
                );


                document
                    .getElementById(
                        "login-username"
                    )
                    .value =
                    username;

            },

            800
        );

    }

    catch (error) {

        setStatus(
            "register-status",
            error.message,
            "error"
        );

    }

}


// ======================================================
// Login Step 1
// ======================================================

async function checkLoginAccount() {

    const username =
        document
            .getElementById(
                "login-username"
            )
            .value
            .trim();


    setStatus(
        "login-status",
        "正在確認帳號...",
        ""
    );


    try {

        const result =
            await api(

                "checkUsername",

                {
                    username
                }

            );


        if (!result.ok) {

            setStatus(
                "login-status",
                result.message,
                "error"
            );

            return;

        }


        if (!result.exists) {

            setStatus(
                "login-status",
                "找不到此帳號。",
                "error"
            );

            return;

        }


        pendingLoginUsername =
            username;


        document
            .getElementById(
                "login-account-preview"
            )
            .textContent =
            "帳號：" + username;


        document
            .getElementById(
                "login-step-1"
            )
            .classList
            .add("hidden");


        document
            .getElementById(
                "login-step-2"
            )
            .classList
            .remove("hidden");


        setStatus(
            "login-status",
            "",
            ""
        );

    }

    catch (error) {

        setStatus(
            "login-status",
            error.message,
            "error"
        );

    }

}


// ======================================================
// Login
// ======================================================

async function login() {

    const password =
        document
            .getElementById(
                "login-password"
            )
            .value;


    setStatus(
        "login-status",
        "正在登入...",
        ""
    );


    try {

        const result =
            await api(

                "login",

                {

                    username:
                        pendingLoginUsername,

                    password

                }

            );


        if (!result.ok) {

            setStatus(
                "login-status",
                result.message,
                "error"
            );

            return;

        }


        localStorage.setItem(
            "602zr_session",
            result.token
        );


        currentUser =
            result.user;


        renderLoggedIn(
            result.user
        );


        setStatus(
            "login-status",
            "登入成功。",
            "success"
        );


        setTimeout(
            closeAuthModal,
            500
        );

    }

    catch (error) {

        setStatus(
            "login-status",
            error.message,
            "error"
        );

    }

}


// ======================================================
// Restore Session
// ======================================================

async function restoreSession() {

    const token =
        localStorage.getItem(
            "602zr_session"
        );


    if (!token) {
        return;
    }


    try {

        const result =
            await api(

                "session",

                {
                    token
                }

            );


        if (!result.ok) {

            localStorage.removeItem(
                "602zr_session"
            );

            renderLoggedOut();

            return;

        }


        renderLoggedIn(
            result.user
        );

    }

    catch {

        // 網路暫時失敗時
        // 不主動刪除 Session

    }

}


// ======================================================
// Logout
// ======================================================

async function logout() {

    const token =
        localStorage.getItem(
            "602zr_session"
        );


    localStorage.removeItem(
        "602zr_session"
    );


    currentUser =
        null;


    renderLoggedOut();


    if (!token) {
        return;
    }


    try {

        await api(

            "logout",

            {
                token
            }

        );

    }

    catch {

        // 本機已完成登出

    }

}


// ======================================================
// Reset
// ======================================================

function resetLogin() {

    pendingLoginUsername = "";


    document
        .getElementById(
            "login-step-1"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "login-step-2"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "login-password"
        )
        .value = "";


    setStatus(
        "login-status",
        "",
        ""
    );

}


function resetRegister() {

    pendingRegisterEmail = "";


    document
        .getElementById(
            "register-step-1"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "register-step-2"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "register-username"
        )
        .value = "";


    document
        .getElementById(
            "register-password"
        )
        .value = "";


    document
        .getElementById(
            "register-password-confirm"
        )
        .value = "";


    setStatus(
        "register-status",
        "",
        ""
    );

}


// ======================================================
// Status
// ======================================================

function setStatus(
    id,
    message,
    type
) {

    const element =
        document.getElementById(id);


    element.textContent =
        message;


    element.className =
        "form-status";


    if (type) {

        element.classList.add(
            type
        );

    }

}


// ======================================================
// Other Pages
// ======================================================

window.ZR602 = {

    siteURL,

    getCurrentUser() {

        return currentUser;

    },

    isLoggedIn() {

        return currentUser !== null;

    }

};
