function parseCurrencyText(text) {
  let currencyCode = null;
  if (text.includes("$")) currencyCode = "USD";
  else if (text.includes("€")) currencyCode = "EUR";
  else if (text.includes("£")) currencyCode = "GBP";
  else if (text.includes("¥") || text.includes("￥")) currencyCode = "JPY";
  else if (text.includes("₱")) currencyCode = "PHP";

  if (!currencyCode) return null;

  const cleanNumberString = text.replace(/[^0-9.]/g, "");
  const amount = parseFloat(cleanNumberString);

  if (isNaN(amount)) return null;

  return {
    symbol: currencyCode,
    value: amount
  };
}

function removeExistingTooltip() {
  const existingTooltip = document.getElementById("currency-converter-tooltip");
  if (existingTooltip) {
    existingTooltip.remove();
  }
}

function showTooltip(x, y, text) {
  removeExistingTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = "currency-converter-tooltip";
  tooltip.innerText = text;

  Object.assign(tooltip.style, {
    position: "absolute",
    top: `${y - 40}px`,
    left: `${x}px`,
    backgroundColor: "#1e293b",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
    zIndex: "999999",
    pointerEvents: "none"
  });

  document.body.appendChild(tooltip);
}

document.addEventListener("mouseup", (event) => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    const parsedData = parseCurrencyText(selectedText);

    if (parsedData) {
      // Read saved exchange rates AND saved target currency from local storage
      chrome.storage.local.get(["exchangeRates", "targetCurrency"], (result) => {
        const exchangeRates = result.exchangeRates;
        const targetCurrency = result.targetCurrency || "PHP";

        if (!exchangeRates) {
          showTooltip(event.pageX, event.pageY, "No rates saved. Click extension icon to update!");
          return;
        }

        const sourceRateInUSD = exchangeRates[parsedData.symbol];
        const targetRateInUSD = exchangeRates[targetCurrency];

        if (sourceRateInUSD && targetRateInUSD) {
          const valueInUSD = parsedData.value / sourceRateInUSD;
          const convertedValue = (valueInUSD * targetRateInUSD).toFixed(2);

          const message = `${parsedData.value} ${parsedData.symbol} ≈ ${convertedValue} ${targetCurrency}`;
          showTooltip(event.pageX, event.pageY, message);
        } else {
          showTooltip(event.pageX, event.pageY, "Currency rate not available");
        }
      });
    }
  }
});

document.addEventListener("mousedown", () => {
  if (!window.getSelection().toString()) {
    removeExistingTooltip();
  }
});
