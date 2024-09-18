const { LOKI_URL } = require("../constants");

module.exports = async function(level, message, labels = {}) {
  const entry = {
    streams: [
      {
        stream: {
          ...labels,
          level,
        },
        values: [
          [`${Date.now() * 1e6}`, message],  // Make sure the timestamp is formatted correctly
        ],
      },
    ],
  };

  try {
    const response = await fetch(LOKI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
    await response.text();
  } catch (error) {
    console.error("Error sending log to loki", error);
  }
}
