(function () {
    "use strict";

    const API_BASE = window.EDUNEXUS_API_BASE || "/api";

    const statusBox = document.getElementById("status");
    const uploadForm = document.getElementById("uploadForm");
    const uploadBtn = document.getElementById("uploadBtn");
    const filesList = document.getElementById("filesList");
    const logoutBtn = document.getElementById("logoutBtn");

    const classLevelInput = document.getElementById("classLevel");
    const subjectInput = document.getElementById("subject");
    const chapterInput = document.getElementById("chapter");
    const titleInput = document.getElementById("title");
    const contentTypeInput = document.getElementById("contentType");

    const token = localStorage.getItem("edunexusToken");
    const savedUser = JSON.parse(
        localStorage.getItem("edunexusUser") || "null"
    );

    const subjects = {
        "6": [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science"
        ],
        "7": [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science"
        ],
        "8": [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science"
        ],
        "9": [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science"
        ],
        "10": [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science"
        ],
        "11": [
            "Physics",
            "Chemistry",
            "Mathematics",
            "Biology",
            "English",
            "Computer Science",
            "Economics",
            "Accountancy",
            "Business Studies"
        ],
        "12": [
            "Physics",
            "Chemistry",
            "Mathematics",
            "Biology",
            "English",
            "Computer Science",
            "Economics",
            "Accountancy",
            "Business Studies"
        ]
    };

    function showStatus(type, message) {
        statusBox.className = "status show " + type;
        statusBox.textContent = message;
    }

    function logout() {
        localStorage.removeItem("edunexusToken");
        localStorage.removeItem("edunexusUser");
        window.location.href = "login.html";
    }

    async function verifyAdmin() {
        if (!token || !savedUser) {
            window.location.href = "login.html";
            return false;
        }

        try {
            const response = await fetch(
                API_BASE + "/auth/me",
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            if (!response.ok) {
                logout();
                return false;
            }

            const data = await response.json();

            if (!data.user || data.user.role !== "admin") {
                showStatus(
                    "error",
                    "Access denied. Only administrators can open this dashboard."
                );

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1500);

                return false;
            }

            return true;

        } catch (error) {
            showStatus(
                "error",
                "Unable to verify administrator account."
            );

            return false;
        }
    }

    function updateSubjects() {
        const selectedClass = classLevelInput.value;

        subjectInput.innerHTML = "";

        if (!selectedClass || !subjects[selectedClass]) {
            subjectInput.disabled = true;

            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Select Class First";

            subjectInput.appendChild(option);
            return;
        }

        subjectInput.disabled = false;

        const firstOption = document.createElement("option");
        firstOption.value = "";
        firstOption.textContent = "Select Subject";
        subjectInput.appendChild(firstOption);

        subjects[selectedClass].forEach(function (subject) {
            const option = document.createElement("option");

            option.value = subject;
            option.textContent = subject;

            subjectInput.appendChild(option);
        });
    }

    function formatSize(bytes) {
        if (!bytes) return "0 Bytes";

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        return (
            (bytes / Math.pow(1024, index)).toFixed(
                index === 0 ? 0 : 2
            ) +
            " " +
            units[index]
        );
    }

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function formatContentType(type) {
        const names = {
            pdf: "PDF",
            notes: "Notes",
            mindmap: "Mind Map",
            assignment: "Assignment",
            "question-paper": "Question Paper",
            ebook: "E-Book",
            other: "Other"
        };

        return names[type] || type || "Other";
    }

    async function loadFiles() {
        try {
            const response = await fetch(
                API_BASE + "/files"
            );

            if (!response.ok) {
                throw new Error("Unable to load files.");
            }

            const files = await response.json();

            if (!files.length) {
                filesList.innerHTML = `
                    <div class="empty-state">
                        No files uploaded yet.
                    </div>
                `;
                return;
            }

            filesList.innerHTML = files.map(function (file) {
                const date = file.createdAt
                    ? new Date(file.createdAt).toLocaleString()
                    : "";

                const location = [
                    file.classLevel
                        ? "Class " + file.classLevel
                        : "",
                    file.subject || "",
                    formatContentType(file.contentType)
                ].filter(Boolean).join(" • ");

                return `
                    <div class="file-item">

                        <div class="file-info">

                            <div class="file-name">
                                ${escapeHTML(
                                    file.title || file.originalName
                                )}
                            </div>

                            <div class="file-meta">
                                ${escapeHTML(location)}
                            </div>

                            ${
                                file.chapter
                                    ? `<div class="file-meta">
                                        Chapter: ${escapeHTML(file.chapter)}
                                       </div>`
                                    : ""
                            }

                            <div class="file-meta">
                                ${escapeHTML(file.originalName)}
                                •
                                ${formatSize(file.size)}
                                •
                                ${escapeHTML(date)}
                            </div>

                            ${
                                file.description
                                    ? `<div class="file-meta">
                                        ${escapeHTML(file.description)}
                                       </div>`
                                    : ""
                            }

                        </div>

                        <div class="file-actions">

                            <a
                                href="${escapeHTML(file.filePath)}"
                                target="_blank"
                                rel="noopener"
                            >
                                Open
                            </a>

                            <button
                                type="button"
                                class="delete-btn"
                                data-id="${escapeHTML(file._id)}"
                                data-name="${escapeHTML(
                                    file.title || file.originalName
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;
            }).join("");

            document.querySelectorAll(".delete-btn")
                .forEach(function (button) {

                    button.addEventListener(
                        "click",
                        function () {
                            deleteFile(
                                this.dataset.id,
                                this.dataset.name
                            );
                        }
                    );

                });

        } catch (error) {
            filesList.innerHTML = `
                <div class="empty-state">
                    Unable to load uploaded files.
                </div>
            `;
        }
    }

    async function uploadFile(event) {
        event.preventDefault();

        const fileInput = document.getElementById("file");
        const category = document.getElementById("category").value;
        const description =
            document.getElementById("description").value.trim();

        const classLevel = classLevelInput.value;
        const subject = subjectInput.value;
        const chapter = chapterInput.value.trim();
        const title = titleInput.value.trim();
        const contentType = contentTypeInput.value;

        if (!classLevel) {
            showStatus("error", "Please select a class.");
            return;
        }

        if (!subject) {
            showStatus("error", "Please select a subject.");
            return;
        }

        if (!title) {
            showStatus("error", "Please enter a title.");
            return;
        }

        if (!fileInput.files.length) {
            showStatus("error", "Please select a file.");
            return;
        }

        const formData = new FormData();

        formData.append("file", fileInput.files[0]);
        formData.append("classLevel", classLevel);
        formData.append("subject", subject);
        formData.append("chapter", chapter);
        formData.append("title", title);
        formData.append("contentType", contentType);
        formData.append("category", category);
        formData.append("description", description);

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Uploading...";

        try {
            const response = await fetch(
                API_BASE + "/files/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + token
                    },
                    body: formData
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "File upload failed."
                );
            }

            showStatus(
                "success",
                "File uploaded successfully to Class " +
                classLevel +
                " → " +
                subject +
                " → " +
                formatContentType(contentType) +
                "."
            );

            uploadForm.reset();
            updateSubjects();

            await loadFiles();

        } catch (error) {
            showStatus(
                "error",
                error.message || "File upload failed."
            );

        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload File";
        }
    }

    async function deleteFile(id, name) {
        const confirmed = window.confirm(
            'Delete "' + name + '" permanently?'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                API_BASE +
                "/files/" +
                encodeURIComponent(id),
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Delete failed."
                );
            }

            showStatus(
                "success",
                "File deleted successfully."
            );

            await loadFiles();

        } catch (error) {
            showStatus(
                "error",
                error.message || "Unable to delete file."
            );
        }
    }

    classLevelInput.addEventListener(
        "change",
        updateSubjects
    );

    logoutBtn.addEventListener(
        "click",
        logout
    );

    uploadForm.addEventListener(
        "submit",
        uploadFile
    );

    updateSubjects();

    (async function init() {
        const isAdmin = await verifyAdmin();

        if (isAdmin) {
            await loadFiles();
        }
    })();

})();
