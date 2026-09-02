document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("currency-select");
  const saveBtn = document.getElementById("save-btn");
  const updateRatesBtn = document.getElementById("update-rates-btn");
  const status = document.getElementById("status");
  const lastUpdated = document.getElementById("last-updated");

  // Load saved currency preference and last update time on open
  chrome.storage.local.get(["targetCurrency", "lastUpdatedTime", "exchangeRates"], (result) => {
    if (result.targetCurrency) {
      select.value = result.targetCurrency;
    }
    if (result.lastUpdatedTime) {
      lastUpdated.innerText = `Last Updated: ${result.lastUpdatedTime}`;
    }
    // If no rates exist at all (first time install), fetch them automatically
    if (!result.exchangeRates) {
      fetchAndSaveRates();
    }
  });

  // Save selected currency
  saveBtn.addEventListener("click", () => {
    const chosenCurrency = select.value;
    chrome.storage.local.set({ targetCurrency: chosenCurrency }, () => {
      showStatus("Saved Preference!");
    });
  });

  // Manual Update Rates Button Click
  updateRatesBtn.addEventListener("click", () => {
    fetchAndSaveRates();
  });

  // Function to call API and save to storage
  async function fetchAndSaveRates() {
    lastUpdated.innerText = "Fetching new rates...";
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();

      if (data && data.rates) {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Save rates AND timestamp into chrome storage
        chrome.storage.local.set({ 
          exchangeRates: data.rates,
          lastUpdatedTime: timeString
        }, () => {
          lastUpdated.innerText = `Last Updated: ${timeString}`;
          showStatus("Rates Updated!");
        });
      }
    } catch (error) {
      console.error(error);
      lastUpdated.innerText = "Failed to fetch rates";
    }
  }

  function showStatus(msg) {
    status.innerText = msg;
    setTimeout(() => {
      status.innerText = "";
    }, 1500);
  }
});
