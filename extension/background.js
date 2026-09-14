console.log("BACKGROUND SCRIPT LOADED");

browser.webRequest.onCompleted.addListener(
  async (details) => {
    const url = new URL(details.url);
    const parts = url.pathname.split("/");

    if (parts[1] !== "problems" || parts[3] !== "submit") {
      return;
    }

    const slug = parts[2];
    console.log("SUBMISSION COMPLETED:", slug);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const response = await fetch(
        "http://localhost:5000/api/progress/extension",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug,
          }),
        }
      );

      const data = await response.json();

      console.log("SYNC RESULT:", data);
    } catch (error) {
      console.error("SYNC FAILED:", error);
    }
  },
  {
    urls: ["https://leetcode.com/problems/*/submit/"]
  }
);