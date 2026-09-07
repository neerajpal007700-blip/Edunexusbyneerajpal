

        /* =====================================================
           ELEMENTS
        ===================================================== */

        const loginForm =
            document.getElementById("loginForm");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const passwordToggle =
            document.getElementById("passwordToggle");

        const rememberInput =
            document.getElementById("remember");

        const loginBtn =
            document.getElementById("loginBtn");

        const loginBtnText =
            document.getElementById("loginBtnText");

        const statusMessage =
            document.getElementById("statusMessage");

        const forgotPassword =
            document.getElementById("forgotPassword");

        const roleButtons =
            document.querySelectorAll(".role-btn");




        let selectedRole = "student";


        /* =====================================================
           ROLE SELECTION
        ===================================================== */

        console.log("ROLE DEBUG: buttons found =", roleButtons.length);

        roleButtons.forEach(function(button) {

            console.log("ROLE DEBUG: attaching =", button.dataset.role);

            button.addEventListener("click", function() {

                console.log("ROLE DEBUG: clicked =", this.dataset.role);

                roleButtons.forEach(function(btn) {

                    btn.classList.remove("active");

                });


                this.classList.add("active");


                selectedRole =
                    this.dataset.role;


                clearStatus();

            });

        });


        /* =====================================================
           PASSWORD SHOW / HIDE
        ===================================================== */

        passwordToggle.addEventListener(
            "click",
            function() {

                const isPassword =
                    passwordInput.type === "password";


                passwordInput.type =
                    isPassword
                        ? "text"
                        : "password";


                const icon =
                    this.querySelector("i");


                if (isPassword) {

                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");

                    this.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    icon.classList.remove("fa-eye-slash");
                    icon.classList.add("fa-eye");

                    this.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );


        /* =====================================================
           LOAD REMEMBERED EMAIL
        ===================================================== */

        const savedEmail =
            localStorage.getItem("edunexusRememberEmail");


        if (savedEmail) {

            emailInput.value =
                savedEmail;

            rememberInput.checked =
                true;

        }


        /* =====================================================
           ERROR HELPERS
        ===================================================== */

        function setError(
            elementId,
            message
        ) {

            const element =
                document.getElementById(
                    elementId + "Error"
                );


            if (element) {

                element.textContent =
                    message;

            }

        }


        function clearErrors() {

            setError("email", "");
            setError("password", "");

        }


        function clearStatus() {

            statusMessage.className =
                "status-message";

            statusMessage.innerHTML =
                "";

        }


        function showStatus(
            type,
            icon,
            message
        ) {

            statusMessage.className =
                "status-message show " + type;


            statusMessage.innerHTML =
                `
                    <i class="fas ${icon}"></i>
                    <span>${message}</span>
                `;

        }


        /* =====================================================
           EMAIL VALIDATION
        ===================================================== */

        function isValidEmail(email) {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);

        }


        /* =====================================================
           LOGIN SUBMIT
        ===================================================== */

        loginForm.addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                clearErrors();
                clearStatus();


                const email =
                    emailInput.value.trim();


                const password =
                    passwordInput.value;


                let valid = true;


                /* Email */

                if (!email) {

                    setError(
                        "email",
                        "Please enter your email address."
                    );

                    valid = false;

                }
                else if (!isValidEmail(email)) {

                    setError(
                        "email",
                        "Please enter a valid email address."
                    );

                    valid = false;

                }


                /* Password */

                if (!password) {

                    setError(
                        "password",
                        "Please enter your password."
                    );

                    valid = false;

                }
                else if (password.length < 6) {

                    setError(
                        "password",
                        "Password must contain at least 6 characters."
                    );

                    valid = false;

                }


                if (!valid) {
                    return;
                }


                /* Remember email only */

                if (rememberInput.checked) {

                    localStorage.setItem(
                        "edunexusRememberEmail",
                        email
                    );

                }
                else {

                    localStorage.removeItem(
                        "edunexusRememberEmail"
                    );

                }


                /* Loading */

                loginBtn.classList.add("loading");

                loginBtnText.textContent =
                    "Signing in...";


                /*
                 * =================================================
                 * BACKEND AUTHENTICATION
                 * =================================================
                 *
                 * Production version should send credentials
                 * to the EduNexus authentication API.
                 *
                 * Example:
                 *
                 * const response = await fetch(
                 *     "/api/auth/login",
                 *     {
                 *         method: "POST",
                 *         headers: {
                 *             "Content-Type": "application/json"
                 *         },
                 *         body: JSON.stringify({
                 *             email,
                 *             password,
                 *             role: selectedRole
                 *         })
                 *     }
                 * );
                 *
                 * Never store the password in localStorage.
                 */


                try {

                    console.log("LOGIN: sending request", email);
                    console.log("LOGIN: API available", !!window.EduNexusAPI);

                    const data = await window.EduNexusAPI.login(email, password);

                    console.log("LOGIN: success", data);
                    showStatus("success", "fa-circle-check", `Welcome back, ${data.user.name}!`);
                    setTimeout(() => { window.location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html"; }, 700);


                }
                catch (error) {

                    const msg = error?.message || "Unable to connect to the login service. Please try again.";

                    showStatus(
                        "error",
                        "fa-circle-exclamation",
                        msg
                    );

                }
                finally {

                    loginBtn.classList.remove(
                        "loading"
                    );

                    loginBtnText.textContent =
                        "Sign In";

                }

            }
        );


        /* =====================================================
           FORGOT PASSWORD
        ===================================================== */

        forgotPassword.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                showStatus(
                    "error",
                    "fa-circle-info",
                    "Password recovery will be available after the authentication backend is connected."
                );

            }
        );


        /* =====================================================
           CLEAR FIELD ERROR WHILE TYPING
        ===================================================== */

        emailInput.addEventListener(
            "input",
            function() {

                setError("email", "");
                clearStatus();

            }
        );


        passwordInput.addEventListener(
            "input",
            function() {

                setError("password", "");
                clearStatus();

            }
        );


