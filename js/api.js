// Central API client for Peak Holdings.
window.PeakAPI = (() => {
  const BASE_URL = "https://peak-holdings-api.investmentreal95.workers.dev/api";
  async function request(path, body, token) {
    const response = await fetch(BASE_URL + path, {
      method: body ? "POST" : "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: "Bearer " + token } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({ error: "Unexpected server response." }));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }
  return { request, get: path => request(path), post: (path, body, token) => request(path, body, token) };
})();
