/* =========================================================
   EduNexus by Neeraj Pal
   Main Website JavaScript
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       PRELOADER
       ===================================================== */

    const preloader = document.getElementById("preloader");

    function hidePreloader() {
        if (!preloader) return;

        preloader.classList.add("hidden");

        // Completely remove it after animation
        setTimeout(function () {
            preloader.style.display = "none";
        }, 500);
    }

    // Hide after everything on the page has loaded
    window.addEventListener("load", function () {
        setTimeout(hidePreloader, 300);
    });

    // Safety fallback so loading can never remain forever
    setTimeout(hidePreloader, 3000);


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navbarMenu = document.getElementById("navbarMenu");

    if (mobileMenuBtn && navbarMenu) {

        mobileMenuBtn.addEventListener("click", function () {

            navbarMenu.classList.toggle("open");

            const isOpen = navbarMenu.classList.contains("open");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            // Change hamburger icon
            const icon = mobileMenuBtn.querySelector("i");

            if (icon) {
                if (isOpen) {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");
                } else {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            }
        });


        /* Close mobile menu after clicking a link */

        const navLinks = navbarMenu.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navbarMenu.classList.remove("open");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                const icon = mobileMenuBtn.querySelector("i");

                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            });

        });
    }


    /* =====================================================
       BACK TO TOP BUTTON
       ===================================================== */

    const backToTop = document.getElementById("backToTop");

    if (backToTop) {

        function updateBackToTop() {

            if (window.scrollY > 500) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }
        }

        window.addEventListener(
            "scroll",
            updateBackToTop,
            { passive: true }
        );

        updateBackToTop();


        backToTop.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });
    }


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* =====================================================
       IMAGE ERROR HANDLING
       ===================================================== */

    const images = document.querySelectorAll("img");

    images.forEach(function (image) {

        image.addEventListener("error", function () {

            // Prevent infinite error loops
            if (image.dataset.errorHandled === "true") {
                return;
            }

            image.dataset.errorHandled = "true";

            /*
             * For the main logo/banner, the HTML already
             * contains fallback sections.
             */
            if (image.classList.contains("main-logo")) {
                image.style.display = "none";
            }

            if (image.classList.contains("hero-banner-image")) {
                image.style.display = "none";

                const fallback =
                    image.closest(".hero-banner-link")
                    ?.querySelector(".banner-fallback");

                if (fallback) {
                    fallback.style.display = "flex";
                }
            }

        });

    });


    /* =====================================================
       SMOOTH INTERNAL LINKS
       ===================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#" ||
                targetId.length < 2
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       ESC KEY - CLOSE MOBILE MENU
       ===================================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (navbarMenu && navbarMenu.classList.contains("open")) {

                navbarMenu.classList.remove("open");

                if (mobileMenuBtn) {
                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    const icon =
                        mobileMenuBtn.querySelector("i");

                    if (icon) {
                        icon.classList.remove("fa-xmark");
                        icon.classList.add("fa-bars");
                    }
                }
            }
        }

    });


    /* =====================================================
       CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "%cEduNexus by Neeraj Pal",
        "font-size:18px;font-weight:bold;"
    );

    console.log(
        "Website initialized successfully."
    );

});