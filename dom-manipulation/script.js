// Our main list of quotes.
let quotes = [];
let selectedCategory = 'all';

// --- Helper for Notifications ---
// This function will display messages to the user in the notification area.
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    if (notificationArea) {
        notificationArea.textContent = message;
        // Optionally change color for different types of messages
        notificationArea.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'blue');
        setTimeout(() => {
            notificationArea.textContent = ''; // Clear message after 5 seconds
        }, 5000);
    }
}

// --- Memory (Web Storage) Functions ---
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if memory is empty
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Motivation" },
      { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
      { text: "Stay hungry, stay foolish.", category: "Motivation" },
      { text: "Believe you can and you're halfway there.", category: "Inspiration" }
    ];
  }

  const storedFilter = localStorage.getItem('selectedCategory');
  if (storedFilter) {
    selectedCategory = storedFilter;
  }
}

// --- Quote Display and Add Functions ---
function showRandomQuote() {
  const quoteDisplayElement = document.getElementById('quoteDisplay');

  const filteredQuotes = quotes.filter(quote => {
    return selectedCategory === 'all' || quote.category === selectedCategory;
  });

  if (filteredQuotes.length === 0) {
    quoteDisplayElement.innerHTML = "<p>No quotes available for this category. Add some!</p>";
    sessionStorage.setItem('lastQuoteIndex', -1);
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  sessionStorage.setItem('lastQuoteIndex', randomIndex);

  quoteDisplayElement.innerHTML = ''; 

  const quoteTextElement = document.createElement('p');
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  const emElement = document.createElement('em');
  emElement.textContent = `- ${quote.category}`;
  quoteCategoryElement.appendChild(emElement);

  quoteDisplayElement.appendChild(quoteTextElement);
  quoteDisplayElement.appendChild(quoteCategoryElement);
}

function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    saveQuotes();
    populateCategories();
    filterQuotes(); 

    alert('Quote added successfully!');
    postLocalQuotesToServer(); // *** NEW: Send new quote to the pretend server (simulated) ***
  } else {
    alert('Please enter both quote text and category!');
  }
}

function createAddQuoteForm() {
    const addQuoteButton = document.getElementById('addQuoteBtn');
    if (addQuoteButton) {
        addQuoteButton.addEventListener('click', addQuote);
    }
}

// --- Function to display ALL filtered quotes ---
function displayFilteredQuotes() {
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    quoteDisplayElement.innerHTML = ''; // Clear existing content

    const filteredQuotes = quotes.filter(quote => {
        return selectedCategory === 'all' || quote.category === selectedCategory;
    });

    if (filteredQuotes.length === 0) {
        quoteDisplayElement.innerHTML = "<p>No quotes available for this category. Add some!</p>";
        return;
    }

    filteredQuotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = `"${quote.text}"`;

        const quoteCategoryElement = document.createElement('p');
        const emElement = document.createElement('em');
        emElement.textContent = `- ${quote.category}`;
        quoteCategoryElement.appendChild(emElement);

        quoteDisplayElement.appendChild(quoteTextElement);
        quoteDisplayElement.appendChild(quoteCategoryElement);
    });
}


// --- Category Filtering Logic ---
function populateCategories() {
  const categoryFilterDropdown = document.getElementById('categoryFilter');
  categoryFilterDropdown.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  categoryFilterDropdown.appendChild(allOption);

  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  uniqueCategories.sort();

  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  categoryFilterDropdown.value = selectedCategory;
}

function filterQuotes() {
  const categoryFilterDropdown = document.getElementById('categoryFilter');
  selectedCategory = categoryFilterDropdown.value;

  localStorage.setItem('selectedCategory', selectedCategory);

  displayFilteredQuotes(); 
}


// --- JSON Import/Export Functions ---
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q.text === 'string' && typeof q.category === 'string')) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes(); // Re-apply filter after import to update display.
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON file format. Please upload a file with an array of quote objects (text, category).');
      }
    } catch (e) {
      alert('Error parsing JSON file: ' + e.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Server Interaction Functions ---
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Our pretend server for practice

// Function to get new quotes from the pretend server.
async function fetchQuotesFromServer() {
    showNotification('Checking for updates from server...', 'info');
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) { // If the server didn't respond well
            throw new Error(`Server error! Status: ${response.status}`);
        }
        const serverPosts = await response.json(); // Get the data from the server

        // Turn the server's data (posts) into our quote format.
        // We'll use the 'title' as quote text and 'body' as category, or a general category.
        const serverQuotes = serverPosts.slice(0, 5).map(post => ({ // Just take first 5 for simplicity
            text: post.title,
            category: `Server-${post.userId}` // Example category from server data
        }));
        return serverQuotes;
    } catch (error) {
        showNotification(`Failed to get server updates: ${error.message}`, 'error');
        console.error("Error fetching server quotes:", error);
        return []; // Return an empty list if there's an error
    }
}

// Function to send our quotes to the pretend server (this is just a simulation!).
async function postLocalQuotesToServer() {
    // We'll only send the latest quote added locally for simplicity.
    if (quotes.length === 0) return;
    const lastQuote = quotes[quotes.length - 1];

    try {
        // showNotification('Sending local data to server (simulated)...', 'info'); // Uncomment if you want this alert
        const response = await fetch(SERVER_URL, {
            method: 'POST', // This means we're sending data
            headers: {
                'Content-Type': 'application/json', // We're sending JSON data
            },
            body: JSON.stringify({ // Turn our quote into JSON text to send
                title: lastQuote.text,
                body: lastQuote.category,
                userId: 1, // A dummy user ID for the pretend server
            }),
        });
        if (!response.ok) {
            throw new Error(`Server error sending data! Status: ${response.status}`);
        }
        const result = await response.json(); // Get the server's response
        // showNotification('Local data sent to server (simulated)!', 'success'); // Uncomment if you want this alert
        console.log("Simulated server post response:", result);
    } catch (error) {
        // showNotification(`Failed to send local data: ${error.message}`, 'error'); // Uncomment if you want this alert
        console.error("Error sending local quotes:", error);
    }
}

// Function to sync our quotes with the server.
// This is where conflict resolution happens: server's data wins!
async function syncQuotes() {
    showNotification('Syncing data...', 'info');
    const serverQuotes = await fetchQuotesFromServer(); // Get latest quotes from server

    const combinedQuotes = [...quotes]; // Start with all our local quotes

    serverQuotes.forEach(serverQ => {
        // Check if this server quote already exists in our local list (by matching text).
        const localIndex = combinedQuotes.findIndex(localQ => localQ.text === serverQ.text);

        if (localIndex > -1) {
            // Conflict: The server has a quote with the same text as one of ours.
            // Our rule: Server's data takes precedence! We replace our local one.
            if (JSON.stringify(combinedQuotes[localIndex]) !== JSON.stringify(serverQ)) {
                combinedQuotes[localIndex] = serverQ; // Overwrite local with server's version
                showNotification(`Conflict resolved: Server version of "${serverQ.text}" applied.`, 'info');
            }
        } else {
            // New quote from server: It's not in our local list, so we add it.
            combinedQuotes.push(serverQ);
            showNotification(`New quote from server added: "${serverQ.text}"`, 'info');
        }
    });

    // Update our main quotes list with the combined, resolved list.
    quotes = combinedQuotes;
    saveQuotes(); // Save this new list to local storage
    populateCategories(); // Update the categories dropdown
    filterQuotes(); // Re-display quotes based on the current filter

    showNotification('Sync completed!', 'success');
}


// --- Initial Setup When Page Loads ---
// This ensures our JavaScript code runs only after all HTML is loaded.
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();        // 1. Load quotes AND last filter from memory
  populateCategories(); // 2. Fill the dropdown with categories (after loading quotes)

  // 3. Set up the "Show New Quote" button.
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
      newQuoteButton.addEventListener('click', showRandomQuote);
  }

  // 4. Set up the 'Add Quote' form button.
  createAddQuoteForm();

  // 5. Set up the 'Export Quotes' button.
  const exportQuotesButton = document.getElementById('exportJsonBtn');
  if (exportQuotesButton) {
      exportQuotesButton.addEventListener('click', exportToJsonFile);
  }

  // 6. Set up the 'Sync Now' button.
  const syncNowButton = document.getElementById('syncNowBtn');
  if (syncNowButton) {
      syncNowButton.addEventListener('click', syncQuotes);
  }

  // The 'Import Quotes' file input has its onchange directly in HTML now.

  // 7. Display all quotes based on the loaded filter when the page loads.
  filterQuotes(); // Call filterQuotes here to apply the loaded filter and display quotes

  // 8. Set up periodic sync. The machine will check the server every 30 seconds.
  //    (You can change 30000 to a bigger number like 60000 for 1 minute, or smaller for faster testing).
  setInterval(syncQuotes, 30000); 
});