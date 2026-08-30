document.getElementById('extractBtn').addEventListener('click', async () => {
  // Get the current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Make sure we are on Spotify
  if (tab.url.includes("open.spotify.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractAndDownloadLinks,
    });
  } else {
    alert("Please open a Spotify web player page first.");
  }
});

// This function runs INSIDE the Spotify webpage
function extractAndDownloadLinks() {
  // Find all anchor tags that link to a track or album
  const linkElements = document.querySelectorAll('a[href^="/track/"], a[href^="/album/"]');
  
  // Extract the href and prepend the base Spotify URL
  let links = Array.from(linkElements).map(a => 'https://open.spotify.com' + a.getAttribute('href'));
  
  // Remove duplicates
  links = [...new Set(links)];

  if (links.length === 0) {
    alert("No songs or albums found on this page.");
    return;
  }

  // Create a text file in memory
  const blob = new Blob([links.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary hidden link to trigger the download
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = 'spotify_links.txt';
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  
  // Clean up
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}