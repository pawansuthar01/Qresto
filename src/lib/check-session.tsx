let nextAllowedTime = 0;
let backoffDelay = 60 * 1000; // start: 1 minute

export const checkSession = async (): Promise<boolean> => {
  const now = Date.now();

  // 🛑 If we are within cooldown time, skip calling server
  if (now < nextAllowedTime) {
    console.log(
      `⏳ Skipping session check. Next allowed at: ${new Date(
        nextAllowedTime
      ).toLocaleTimeString()}`
    );
    return true; // assume valid until next allowed check
  }

  try {
    const res = await fetch("/api/check-session", {
      credentials: "include",
    });

    // ✅ Reset timer on success
    nextAllowedTime = now + 60 * 1000; // 1 min after success
    backoffDelay = 60 * 1000; // reset to 1 min

    if (res.status === 401) {
      window.location.href = "/signin";
      return false;
    }

    const data = await res.json();
    return data.valid === true;
  } catch (err) {
    console.error(
      "🚨 Server error, delaying next check by:",
      backoffDelay / 60000,
      "min"
    );

    // ⚠️ If server failed, delay next allowed check
    nextAllowedTime = now + backoffDelay;
    backoffDelay += 2 * 60 * 1000; // +2 min each failure

    return true; // assume valid to avoid logout spam
  }
};
