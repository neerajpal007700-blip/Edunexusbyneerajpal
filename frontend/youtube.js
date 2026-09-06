/* =========================================================
   EduNexus by Neeraj Pal
   YouTube Latest Videos
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const videoGrid = document.getElementById("youtubeVideoGrid");

    if (!videoGrid) {
        return;
    }

    /*
     * Backend API endpoint.
     *
     * IMPORTANT:
     * YouTube API key frontend me nahi rakhi jayegi.
     * Backend YouTube Data API se videos fetch karega.
     */
    const API_URL = "/api/youtube/latest";


    /* =====================================================
       HELPERS
       ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getYouTubeVideoId(video) {

        if (!video) {
            return "";
        }

        if (video.videoId) {
            return video.videoId;
        }

        if (video.id && typeof video.id === "string") {
            return video.id;
        }

        if (
            video.id &&
            typeof video.id === "object" &&
            video.id.videoId
        ) {
            return video.id.videoId;
        }

        return "";
    }


    function getThumbnail(video, videoId) {

        if (video.thumbnail) {
            return video.thumbnail;
        }

        if (video.thumbnailUrl) {
            return video.thumbnailUrl;
        }

        if (video.thumbnails) {

            if (video.thumbnails.high) {
                return video.thumbnails.high.url;
            }

            if (video.thumbnails.medium) {
                return video.thumbnails.medium.url;
            }

            if (video.thumbnails.default) {
                return video.thumbnails.default.url;
            }
        }

        if (videoId) {
            return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
        }

        return "";
    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    /* =====================================================
       LOADING STATE
       ===================================================== */

    function showLoading() {

        videoGrid.innerHTML = `
            <article class="youtube-loading-card">
                <div class="youtube-loading-image"></div>

                <div class="youtube-loading-content">
                    <span></span>
                    <span></span>
                    <span class="short"></span>
                </div>
            </article>

            <article class="youtube-loading-card">
                <div class="youtube-loading-image"></div>

                <div class="youtube-loading-content">
                    <span></span>
                    <span></span>
                    <span class="short"></span>
                </div>
            </article>

            <article class="youtube-loading-card">
                <div class="youtube-loading-image"></div>

                <div class="youtube-loading-content">
                    <span></span>
                    <span></span>
                    <span class="short"></span>
                </div>
            </article>
        `;
    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function showEmptyState() {

        videoGrid.innerHTML = `
            <div class="youtube-empty-state">
                <div class="youtube-empty-icon">
                    <i class="fa-brands fa-youtube"></i>
                </div>

                <h3>Latest Videos Coming Soon</h3>

                <p>
                    EduNexus YouTube videos will appear here
                    automatically when the video service is connected.
                </p>

                <a
                    href="https://youtube.com/@edunexusbyneeraj"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    <i class="fa-brands fa-youtube"></i>
                    Visit YouTube Channel
                </a>
            </div>
        `;
    }


    /* =====================================================
       ERROR STATE
       ===================================================== */

    function showErrorState() {

        videoGrid.innerHTML = `
            <div class="youtube-empty-state">
                <div class="youtube-empty-icon">
                    <i class="fa-solid fa-video-slash"></i>
                </div>

                <h3>Videos Couldn't Be Loaded</h3>

                <p>
                    Please visit the official EduNexus YouTube
                    channel to watch the latest educational videos.
                </p>

                <a
                    href="https://youtube.com/@edunexusbyneeraj"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    <i class="fa-brands fa-youtube"></i>
                    Open YouTube
                </a>

                <button
                    type="button"
                    class="btn btn-outline youtube-retry-btn"
                    id="youtubeRetryBtn"
                >
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>
            </div>
        `;

        const retryButton =
            document.getElementById("youtubeRetryBtn");

        if (retryButton) {
            retryButton.addEventListener(
                "click",
                loadLatestVideos
            );
        }
    }


    /* =====================================================
       RENDER VIDEOS
       ===================================================== */

    function renderVideos(videos) {

        if (!Array.isArray(videos) || videos.length === 0) {
            showEmptyState();
            return;
        }

        const validVideos = videos.filter(function (video) {

            return getYouTubeVideoId(video);

        });

        if (validVideos.length === 0) {
            showEmptyState();
            return;
        }


        videoGrid.innerHTML = validVideos
            .slice(0, 6)
            .map(function (video) {

                const videoId =
                    getYouTubeVideoId(video);

                const title =
                    video.title ||
                    video.name ||
                    "EduNexus Educational Video";

                const description =
                    video.description ||
                    "";

                const thumbnail =
                    getThumbnail(video, videoId);

                const publishedAt =
                    video.publishedAt ||
                    video.published ||
                    video.date ||
                    "";

                const dateText =
                    formatDate(publishedAt);


                return `
                    <article class="youtube-video-card">

                        <a
                            href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="youtube-thumbnail-link"
                            aria-label="Watch ${escapeHTML(title)}"
                        >

                            <div class="youtube-thumbnail">

                                <img
                                    src="${escapeHTML(thumbnail)}"
                                    alt="${escapeHTML(title)}"
                                    loading="lazy"
                                    onerror="this.src='https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg'"
                                >

                                <span class="youtube-play-button">
                                    <i class="fa-solid fa-play"></i>
                                </span>

                            </div>

                        </a>


                        <div class="youtube-video-content">

                            ${
                                dateText
                                    ? `
                                        <div class="youtube-video-date">
                                            <i class="fa-regular fa-calendar"></i>
                                            ${escapeHTML(dateText)}
                                        </div>
                                      `
                                    : ""
                            }

                            <h3>
                                ${escapeHTML(title)}
                            </h3>

                            ${
                                description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                description.length > 120
                                                    ? description.substring(0, 120) + "..."
                                                    : description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                            <a
                                href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="youtube-watch-btn"
                            >
                                <i class="fa-brands fa-youtube"></i>
                                Watch Video
                            </a>

                        </div>

                    </article>
                `;

            })
            .join("");
    }


    /* =====================================================
       FETCH LATEST VIDEOS
       ===================================================== */

    async function loadLatestVideos() {

        showLoading();

        try {

            const controller =
                new AbortController();

            const timeout =
                setTimeout(function () {
                    controller.abort();
                }, 8000);


            const response =
                await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    signal: controller.signal,
                    cache: "no-store"
                });


            clearTimeout(timeout);


            if (!response.ok) {
                throw new Error(
                    `YouTube API returned ${response.status}`
                );
            }


            const data =
                await response.json();


            /*
             * Backend can return either:
             *
             * { videos: [...] }
             *
             * or directly:
             *
             * [...]
             */

            const videos =
                Array.isArray(data)
                    ? data
                    : data.videos;


            renderVideos(videos);

        } catch (error) {

            console.warn(
                "EduNexus YouTube videos could not be loaded:",
                error
            );

            /*
             * During frontend development backend may not
             * exist yet. Website will remain functional.
             */
            showErrorState();
        }
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadLatestVideos();

});