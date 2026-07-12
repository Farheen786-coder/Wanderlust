
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

(() => {
    const themeStorageKey = "wanderlust-theme";
    const themeToggle = document.getElementById("themeToggle");
    const moonIconHtml = `
        <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7.5 7.5 0 0 0 9.8 9.8Z"></path>
        </svg>
    `;
    const sunIconHtml = `
        <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
            <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <line x1="12" y1="1.5" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="22.5"></line>
                <line x1="1.5" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="22.5" y2="12"></line>
                <line x1="4.2" y1="4.2" x2="6" y2="6"></line>
                <line x1="18" y1="18" x2="19.8" y2="19.8"></line>
                <line x1="4.2" y1="19.8" x2="6" y2="18"></line>
                <line x1="18" y1="6" x2="19.8" y2="4.2"></line>
            </g>
        </svg>
    `;

    const applyTheme = (theme) => {
        const isDark = theme === "dark";

        if (isDark) {
            document.body.setAttribute("data-theme", "dark");
            document.documentElement.setAttribute("data-theme", "dark");
            document.body.setAttribute("data-bs-theme", "dark");
            document.documentElement.setAttribute("data-bs-theme", "dark");
            document.documentElement.style.colorScheme = "dark";
            localStorage.setItem(themeStorageKey, "dark");
        } else {
            document.body.removeAttribute("data-theme");
            document.documentElement.removeAttribute("data-theme");
            document.body.setAttribute("data-bs-theme", "light");
            document.documentElement.setAttribute("data-bs-theme", "light");
            document.documentElement.style.colorScheme = "light";
            localStorage.setItem(themeStorageKey, "light");
        }

        if (themeToggle) {
            themeToggle.innerHTML = isDark
                ? `${sunIconHtml}<span class="theme-toggle-text">Change to Light Mode</span>`
                : moonIconHtml;
            themeToggle.classList.toggle("theme-toggle-active", isDark);
            themeToggle.setAttribute(
                "aria-label",
                isDark ? "Change to light mode" : "Switch to dark mode"
            );
            themeToggle.setAttribute("aria-pressed", String(isDark));
        }
    };

    applyTheme(localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light");

    themeToggle?.addEventListener("click", () => {
        const nextTheme = document.body.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        applyTheme(nextTheme);
    });
})();
