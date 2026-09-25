// ======================================================
// 602ZR Frontend
// app.js
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const GAS_URL =
    "https://script.google.com/macros/s/AKfycbzsK_1UuEvMOhHWfuLrOyjFwAiCaev3o-nc4JgTZ4We0aXDt8C5fT1dxAzeUIzOb_1z/exec";


const REPO_NAME =
    "602zr.com";


// ======================================================
// GitHub Pages Path
// ======================================================

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

        path =
            "/" + path;

    }


    return (
        BASE_PATH +
        path
    );

}



// ======================================================
// HOME LINKS
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
            "進入 602ZR 玩家聊天平台",

        url:
            siteURL("/chat/")

    }

];



// ======================================================
// STATE
// ======================================================

let pendingRegisterEmail =
    "";


let registerVerificationToken =
    "";


let pendingLoginUsername =
    "";


let currentUser =
    null;



// ======================================================
// START
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async function () {


        renderNavigation();


        setupAuthUI();


        renderLoggedOut();


        await restoreSession();


    }

);



// ======================================================
// NAVIGATION
// ======================================================

function renderNavigation() {


    const container =
        document.getElementById(
            "home-links"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    SITE_LINKS.forEach(

        function (item) {


            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "menu-card";


            link.href =
                item.url;


            if (
                item.external
            ) {


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


            }


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "menu-title";


            title.textContent =
                item.title;



            const description =
                document.createElement(
                    "div"
                );


            description.className =
                "menu-description";


            description.textContent =
                item.description;



            link.appendChild(
                title
            );


            link.appendChild(
                description
            );


            container.appendChild(
                link
            );


        }

    );

}



// ======================================================
// API
// ======================================================

async function api(
    action,
    data = {}
) {


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

                        action:
                            action,

                        ...data

                    })

            }

        );


    if (
        !response.ok
    ) {


        throw new Error(
            "無法連線至伺服器"
        );


    }


    let result;


    try {


        result =
            await response.json();


    }

    catch {


        throw new Error(
            "伺服器回傳格式錯誤"
        );


    }


    return result;

}



// ======================================================
// AUTH UI
// ======================================================

function setupAuthUI() {


    const modal =
        document.getElementById(
            "auth-modal"
        );


    if (!modal) {

        return;

    }



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

        function (event) {


            if (
                event.target ===
                modal
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

            function () {


                switchTab(
                    "login"
                );


            }

        );



    document
        .getElementById(
            "register-tab"
        )
        .addEventListener(

            "click",

            function () {


                switchTab(
                    "register"
                );


            }

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
            "register-send-code"
        )
        .addEventListener(

            "click",

            sendRegisterVerificationCode

        );



    document
        .getElementById(
            "register-resend-code"
        )
        .addEventListener(

            "click",

            sendRegisterVerificationCode

        );



    document
        .getElementById(
            "register-verify-code"
        )
        .addEventListener(

            "click",

            verifyRegisterCode

        );



    document
        .getElementById(
            "register-back-email"
        )
        .addEventListener(

            "click",

            resetRegister

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
            "register-code"
        )
        .addEventListener(

            "input",

            function () {


                this.value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            6
                        );


            }

        );



    document
        .getElementById(
            "login-password"
        )
        .addEventListener(

            "keydown",

            function (event) {


                if (
                    event.key ===
                    "Enter"
                ) {


                    login();


                }


            }

        );



    document
        .getElementById(
            "register-code"
        )
        .addEventListener(

            "keydown",

            function (event) {


                if (
                    event.key ===
                    "Enter"
                ) {


                    verifyRegisterCode();


                }


            }

        );

}



// ======================================================
// LOGGED OUT
// ======================================================

function renderLoggedOut() {


    currentUser =
        null;


    const area =
        document.getElementById(
            "auth-area"
        );


    if (!area) {

        return;

    }


    area.innerHTML =
        "";



    const loginButton =
        document.createElement(
            "button"
        );


    loginButton.className =
        "auth-button primary";


    loginButton.type =
        "button";


    loginButton.textContent =
        "登入";


    loginButton.addEventListener(

        "click",

        function () {


            openAuthModal(
                "login"
            );


        }

    );



    const registerButton =
        document.createElement(
            "button"
        );


    registerButton.className =
        "auth-button";


    registerButton.type =
        "button";


    registerButton.textContent =
        "註冊";


    registerButton.addEventListener(

        "click",

        function () {


            openAuthModal(
                "register"
            );


        }

    );



    area.appendChild(
        loginButton
    );


    area.appendChild(
        registerButton
    );

}



// ======================================================
// LOGGED IN
// ======================================================

function renderLoggedIn(
    user
) {


    currentUser =
        user;


    const area =
        document.getElementById(
            "auth-area"
        );


    if (!area) {

        return;

    }


    area.innerHTML =
        "";



    const box =
        document.createElement(
            "div"
        );


    box.className =
        "user-box";



    const info =
        document.createElement(
            "div"
        );


    info.className =
        "user-info";



    const name =
        document.createElement(
            "div"
        );


    name.className =
        "user-name";


    name.textContent =
        user.username || "";



    const email =
        document.createElement(
            "div"
        );


    email.className =
        "user-email";


    email.textContent =
        user.email || "";



    info.appendChild(
        name
    );


    info.appendChild(
        email
    );



    const logoutButton =
        document.createElement(
            "button"
        );


    logoutButton.className =
        "auth-button";


    logoutButton.type =
        "button";


    logoutButton.textContent =
        "登出";


    logoutButton.addEventListener(

        "click",

        logout

    );



    box.appendChild(
        info
    );


    box.appendChild(
        logoutButton
    );


    area.appendChild(
        box
    );

}



// ======================================================
// MODAL
// ======================================================

function openAuthModal(
    tab
) {


    const modal =
        document.getElementById(
            "auth-modal"
        );


    modal.classList.remove(
        "hidden"
    );


    switchTab(
        tab
    );

}



function closeAuthModal() {


    document
        .getElementById(
            "auth-modal"
        )
        .classList
        .add(
            "hidden"
        );

}



function switchTab(
    tab
) {


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



    if (
        tab ===
        "login"
    ) {


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
// SEND EMAIL CODE
// ======================================================

async function sendRegisterVerificationCode() {


    let email =
        pendingRegisterEmail;


    if (!email) {


        email =
            document
                .getElementById(
                    "register-email"
                )
                .value
                .trim();


    }


    if (!email) {


        setStatus(

            "register-status",

            "請輸入 Email。",

            "error"

        );


        return;

    }



    setStatus(

        "register-status",

        "正在寄送驗證碼...",

        ""

    );



    setButtonDisabled(
        "register-send-code",
        true
    );


    setButtonDisabled(
        "register-resend-code",
        true
    );



    try {


        const result =
            await api(

                "sendVerificationCode",

                {

                    email:
                        email

                }

            );



        if (
            !result.ok
        ) {


            setStatus(

                "register-status",

                result.message ||
                    "無法寄送驗證碼。",

                "error"

            );


            return;

        }



        pendingRegisterEmail =
            email;



        document
            .getElementById(
                "register-email-code-preview"
            )
            .textContent =
            "驗證碼已寄送至：" +
            email;



        document
            .getElementById(
                "register-step-1"
            )
            .classList
            .add(
                "hidden"
            );



        document
            .getElementById(
                "register-step-2"
            )
            .classList
            .remove(
                "hidden"
            );



        setStatus(

            "register-status",

            "驗證碼已寄出，請檢查 Email。",

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

    finally {


        setButtonDisabled(
            "register-send-code",
            false
        );


        setButtonDisabled(
            "register-resend-code",
            false
        );


    }

}



// ======================================================
// VERIFY EMAIL CODE
// ======================================================

async function verifyRegisterCode() {


    const code =
        document
            .getElementById(
                "register-code"
            )
            .value
            .trim();



    if (
        !/^\d{6}$/.test(
            code
        )
    ) {


        setStatus(

            "register-status",

            "請輸入完整的 6 位數驗證碼。",

            "error"

        );


        return;

    }



    if (
        !pendingRegisterEmail
    ) {


        setStatus(

            "register-status",

            "請重新輸入 Email。",

            "error"

        );


        resetRegister();


        return;

    }



    setStatus(

        "register-status",

        "正在驗證...",

        ""

    );


    setButtonDisabled(
        "register-verify-code",
        true
    );



    try {


        const result =
            await api(

                "verifyEmailCode",

                {

                    email:
                        pendingRegisterEmail,

                    code:
                        code

                }

            );



        if (
            !result.ok
        ) {


            setStatus(

                "register-status",

                result.message ||
                    "驗證失敗。",

                "error"

            );


            return;

        }



        if (
            !result.verificationToken
        ) {


            throw new Error(
                "伺服器沒有回傳驗證 Token"
            );


        }



        registerVerificationToken =
            result.verificationToken;



        document
            .getElementById(
                "register-email-preview"
            )
            .textContent =
            "✓ Email 已驗證：" +
            pendingRegisterEmail;



        document
            .getElementById(
                "register-step-2"
            )
            .classList
            .add(
                "hidden"
            );



        document
            .getElementById(
                "register-step-3"
            )
            .classList
            .remove(
                "hidden"
            );



        setStatus(

            "register-status",

            "Email 驗證成功，請設定帳號與密碼。",

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

    finally {


        setButtonDisabled(
            "register-verify-code",
            false
        );


    }

}



// ======================================================
// REGISTER
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



    if (
        !registerVerificationToken
    ) {


        setStatus(

            "register-status",

            "請先完成 Email 驗證。",

            "error"

        );


        return;

    }



    if (
        !/^[A-Za-z0-9_]{3,24}$/.test(
            username
        )
    ) {


        setStatus(

            "register-status",

            "帳號需為 3–24 個英文字母、數字或底線。",

            "error"

        );


        return;

    }



    if (
        password.length <
        8
    ) {


        setStatus(

            "register-status",

            "密碼至少需要 8 個字元。",

            "error"

        );


        return;

    }



    if (
        password !==
        confirm
    ) {


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


    setButtonDisabled(
        "register-submit",
        true
    );



    try {


        const result =
            await api(

                "register",

                {

                    email:
                        pendingRegisterEmail,

                    username:
                        username,

                    password:
                        password,

                    verificationToken:
                        registerVerificationToken

                }

            );



        if (
            !result.ok
        ) {


            setStatus(

                "register-status",

                result.message ||
                    "帳號建立失敗。",

                "error"

            );


            return;

        }



        const newUsername =
            username;



        setStatus(

            "register-status",

            "帳號建立成功，請登入。",

            "success"

        );



        setTimeout(

            function () {


                resetRegister();


                switchTab(
                    "login"
                );


                document
                    .getElementById(
                        "login-username"
                    )
                    .value =
                    newUsername;


            },

            700

        );


    }

    catch (error) {


        setStatus(

            "register-status",

            error.message,

            "error"

        );


    }

    finally {


        setButtonDisabled(
            "register-submit",
            false
        );


    }

}



// ======================================================
// CHECK LOGIN USERNAME
// ======================================================

async function checkLoginAccount() {


    const username =
        document
            .getElementById(
                "login-username"
            )
            .value
            .trim();



    if (
        !username
    ) {


        setStatus(

            "login-status",

            "請輸入帳號。",

            "error"

        );


        return;

    }



    setStatus(

        "login-status",

        "正在確認帳號...",

        ""

    );


    setButtonDisabled(
        "login-check-account",
        true
    );



    try {


        const result =
            await api(

                "checkUsername",

                {

                    username:
                        username

                }

            );



        if (
            !result.ok
        ) {


            setStatus(

                "login-status",

                result.message ||
                    "無法確認帳號。",

                "error"

            );


            return;

        }



        if (
            !result.exists
        ) {


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
            "帳號：" +
            username;



        document
            .getElementById(
                "login-step-1"
            )
            .classList
            .add(
                "hidden"
            );



        document
            .getElementById(
                "login-step-2"
            )
            .classList
            .remove(
                "hidden"
            );



        setStatus(

            "login-status",

            "",

            ""

        );



        document
            .getElementById(
                "login-password"
            )
            .focus();


    }

    catch (error) {


        setStatus(

            "login-status",

            error.message,

            "error"

        );


    }

    finally {


        setButtonDisabled(
            "login-check-account",
            false
        );


    }

}



// ======================================================
// LOGIN
// ======================================================

async function login() {


    const password =
        document
            .getElementById(
                "login-password"
            )
            .value;



    if (
        !pendingLoginUsername
    ) {


        setStatus(

            "login-status",

            "請先輸入帳號。",

            "error"

        );


        return;

    }



    if (
        !password
    ) {


        setStatus(

            "login-status",

            "請輸入密碼。",

            "error"

        );


        return;

    }



    setStatus(

        "login-status",

        "正在登入...",

        ""

    );


    setButtonDisabled(
        "login-submit",
        true
    );



    try {


        const result =
            await api(

                "login",

                {

                    username:
                        pendingLoginUsername,

                    password:
                        password

                }

            );



        if (
            !result.ok
        ) {


            setStatus(

                "login-status",

                result.message ||
                    "登入失敗。",

                "error"

            );


            return;

        }



        if (
            !result.token ||
            !result.user
        ) {


            throw new Error(
                "登入回應資料不完整"
            );


        }



        localStorage.setItem(

            "602zr_session",

            result.token

        );



        renderLoggedIn(
            result.user
        );



        setStatus(

            "login-status",

            "登入成功。",

            "success"

        );



        setTimeout(

            function () {


                closeAuthModal();


                resetLogin();


            },

            450

        );


    }

    catch (error) {


        setStatus(

            "login-status",

            error.message,

            "error"

        );


    }

    finally {


        setButtonDisabled(
            "login-submit",
            false
        );


    }

}



// ======================================================
// RESTORE SESSION
// ======================================================

async function restoreSession() {


    const token =
        localStorage.getItem(
            "602zr_session"
        );


    if (
        !token
    ) {


        return;

    }



    try {


        const result =
            await api(

                "session",

                {

                    token:
                        token

                }

            );



        if (
            !result.ok ||
            !result.user
        ) {


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

    catch (error) {


        console.warn(
            "Session 暫時無法驗證：",
            error
        );


    }

}



// ======================================================
// LOGOUT
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



    if (
        !token
    ) {


        return;

    }



    try {


        await api(

            "logout",

            {

                token:
                    token

            }

        );


    }

    catch (error) {


        console.warn(
            "遠端登出失敗，但本機已登出。",
            error
        );


    }

}



// ======================================================
// RESET LOGIN
// ======================================================

function resetLogin() {


    pendingLoginUsername =
        "";


    document
        .getElementById(
            "login-step-1"
        )
        .classList
        .remove(
            "hidden"
        );


    document
        .getElementById(
            "login-step-2"
        )
        .classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "login-password"
        )
        .value =
        "";


    setStatus(

        "login-status",

        "",

        ""

    );

}



// ======================================================
// RESET REGISTER
// ======================================================

function resetRegister() {


    pendingRegisterEmail =
        "";


    registerVerificationToken =
        "";


    document
        .getElementById(
            "register-step-1"
        )
        .classList
        .remove(
            "hidden"
        );


    document
        .getElementById(
            "register-step-2"
        )
        .classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "register-step-3"
        )
        .classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "register-email"
        )
        .value =
        "";


    document
        .getElementById(
            "register-code"
        )
        .value =
        "";


    document
        .getElementById(
            "register-username"
        )
        .value =
        "";


    document
        .getElementById(
            "register-password"
        )
        .value =
        "";


    document
        .getElementById(
            "register-password-confirm"
        )
        .value =
        "";


    setStatus(

        "register-status",

        "",

        ""

    );

}



// ======================================================
// STATUS
// ======================================================

function setStatus(
    id,
    message,
    type
) {


    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        "form-status";


    if (
        type
    ) {


        element.classList.add(
            type
        );


    }

}



// ======================================================
// BUTTON STATE
// ======================================================

function setButtonDisabled(
    id,
    disabled
) {


    const button =
        document.getElementById(
            id
        );


    if (
        button
    ) {


        button.disabled =
            disabled;


    }

}



// ======================================================
// GLOBAL API
// ======================================================

window.ZR602 = {


    siteURL:
        siteURL,


    getCurrentUser:
        function () {


            return currentUser;


        },


    isLoggedIn:
        function () {


            return (
                currentUser !== null
            );


        },


    requireLogin:
        function () {


            if (
                currentUser
            ) {


                return true;


            }


            openAuthModal(
                "login"
            );


            return false;


        }


};
