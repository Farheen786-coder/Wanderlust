(() => {
    const form = document.getElementById("bookingForm");
    const button = document.getElementById("bookingSubmitBtn");
    const messageBox = document.getElementById("bookingMessage");
    const config = window.bookingConfig;

    if (!form || !button || !config) {
        return;
    }

    const setMessage = (message, isError = false) => {
        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;
        messageBox.className = isError ? "text-danger mt-2" : "text-success mt-2";
    };

    button.addEventListener("click", async (event) => {
        event.preventDefault();
        setMessage("");

        const formData = new FormData(form);
        const checkIn = formData.get("checkIn");
        const checkOut = formData.get("checkOut");

        if (!checkIn || !checkOut) {
            setMessage("Please select both dates", true);
            return;
        }

        try {
            button.disabled = true;
            button.textContent = "Processing...";

            const response = await fetch(`/bookings/${config.listingId}/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    booking: {
                        checkIn,
                        checkOut,
                    },
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.message || "Unable to start checkout");
            }

            if (payload.url) {
                window.location.href = payload.url;
                return;
            }

            throw new Error("Stripe checkout URL was not returned");
        } catch (error) {
            setMessage(error.message, true);
        } finally {
            button.disabled = false;
            button.textContent = "Book now";
        }
    });
})();
