

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const signupForm =
        document.getElementById("signupForm");

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const password =
        document.getElementById("password");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const terms =
        document.getElementById("terms");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const confirmToggle =
        document.getElementById("confirmToggle");

    const signupBtn =
        document.getElementById("signupBtn");

    const signupBtnText =
        document.getElementById("signupBtnText");

    const statusMessage =
        document.getElementById("statusMessage");

    const strengthProgress =
        document.getElementById("strengthProgress");

    const strengthText =
        document.getElementById("strengthText");

    const roleButtons =
        document.querySelectorAll(".role-btn");


    let selectedRole = "student";


    /* =====================================================
       ROLE SELECTOR
    ===================================================== */

    roleButtons.forEach(function(button) {

        button.addEventListener("click", function() {

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
       PASSWORD TOGGLE
    ===================================================== */

    function setupPasswordToggle(button, input) {

        button.addEventListener("click", function() {

            const visible =
                input.type === "text";

            input.type =
                visible ? "password" : "text";


            const icon =
                this.querySelector("i");


            if (visible) {

                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");

                this.setAttribute(
                    "aria-label",
                    "Show password"
                );

            } else {

                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");

                this.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }

        });

    }


    setupPasswordToggle(
        passwordToggle,
        password
    );


    setupPasswordToggle(
        confirmToggle,
        confirmPassword
    );


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    password.addEventListener(
        "input",
        function() {

            const value =
                password.value;

            let score = 0;


            if (value.length >= 8)
                score++;


            if (/[A-Z]/.test(value))
                score++;


            if (/[a-z]/.test(value))
                score++;


            if (/[0-9]/.test(value))
                score++;


            if (/[^A-Za-z0-9]/.test(value))
                score++;


            const width =
                (score / 5) * 100;


            strengthProgress.style.width =
                width + "%";


            if (!value) {

                strengthText.textContent =
                    "Use at least 8 characters.";

            }
            else if (score <= 2) {

                strengthText.textContent =
                    "Weak password";

            }
            else if (score <= 3) {

                strengthText.textContent =
                    "Medium password";

            }
            else if (score === 4) {

                strengthText.textContent =
                    "Strong password";

            }
            else {

                strengthText.textContent =
                    "Very strong password";

            }

        }
    );


    /* =====================================================
       ERROR FUNCTIONS
    ===================================================== */

    function setError(
        id,
        message
    ) {

        const element =
            document.getElementById(
                id + "Error"
            );

        if (element) {
            element.textContent =
                message;
        }

    }


    function clearErrors() {

        setError("fullName", "");
        setError("email", "");
        setError("password", "");
        setError("confirmPassword", "");
        setError("terms", "");

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

    function validEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(value);

    }


    /* =====================================================
       SIGNUP
    ===================================================== */

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            clearErrors();
            clearStatus();


            const name =
                fullName.value.trim();

            const emailValue =
                email.value.trim();

            const passwordValue =
                password.value;

            const confirmValue =
                confirmPassword.value;


            let valid = true;


            /* Name */

            if (name.length < 2) {

                setError(
                    "fullName",
                    "Please enter your full name."
                );

                valid = false;

            }


            /* Email */

            if (!emailValue) {

                setError(
                    "email",
                    "Please enter your email address."
                );

                valid = false;

            }
            else if (!validEmail(emailValue)) {

                setError(
                    "email",
                    "Please enter a valid email address."
                );

                valid = false;

            }


            /* Password */

            if (passwordValue.length < 8) {

                setError(
                    "password",
                    "Password must contain at least 8 characters."
                );

                valid = false;

            }


            /* Confirm */

            if (!confirmValue) {

                setError(
                    "confirmPassword",
                    "Please confirm your password."
                );

                valid = false;

            }
            else if (
                passwordValue !== confirmValue
            ) {

                setError(
                    "confirmPassword",
                    "Passwords do not match."
                );

                valid = false;

            }


            /* Terms */

            if (!terms.checked) {

                setError(
                    "terms",
                    "Please accept the Terms & Conditions."
                );

                valid = false;

            }


            if (!valid) {
                return;
            }


            /* Loading */

            signupBtn.classList.add("loading");

            signupBtnText.textContent =
                "Creating account...";


            /*
             * =================================================
             * PRODUCTION BACKEND
             * =================================================
             *
             * Connect this form to the EduNexus backend.
             *
             * Example:
             *
             * const response = await fetch(
             *     "/api/auth/register",
             *     {
             *         method: "POST",
             *         headers: {
             *             "Content-Type":
             *                 "application/json"
             *         },
             *         body: JSON.stringify({
             *             name,
             *             email: emailValue,
             *             password: passwordValue,
             *             role: selectedRole
             *         })
             *     }
             * );
             *
             * Password must be hashed on the server.
             *
             * NEVER save the password in:
             * localStorage
             * sessionStorage
             * cookies from JavaScript
             */


            try {

                const data = await window.EduNexusAPI.signup(
                    name, emailValue, passwordValue
                );

                showStatus(
                    "success",
                    "fa-circle-check",
                    `Account created successfully. Welcome, ${data.user.name}!`
                );

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);
                
            } catch (error) {

                console.error("EduNexus Signup Error:", error);

                showStatus(
                    "error",
                    "fa-circle-exclamation",
                    error?.message || "Signup failed. Please try again."
                );

            }
            finally {

                signupBtn.classList.remove(
                    "loading"
                );

                signupBtnText.textContent =
                    "Create Account";

            }

        }
    );


    /* =====================================================
       LIVE ERROR CLEARING
    ===================================================== */

    fullName.addEventListener(
        "input",
        function() {

            setError("fullName", "");
            clearStatus();

        }
    );


    email.addEventListener(
        "input",
        function() {

            setError("email", "");
            clearStatus();

        }
    );


    password.addEventListener(
        "input",
        function() {

            setError("password", "");
            clearStatus();

        }
    );


    confirmPassword.addEventListener(
        "input",
        function() {

            setError("confirmPassword", "");
            clearStatus();

        }
    );


    terms.addEventListener(
        "change",
        function() {

            setError("terms", "");
            clearStatus();

        }
    );

