// Our main list of quotes.
let quotes = [];
let selectedCategory = 'all';

// --- Helper for Notifications ---
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    if (notificationArea) {
        notificationArea.textContent = message;
        notificationArea.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'blue');
        setTimeout(() => {
            notificationArea.textContent = '';
        }, 5000); // Clear message after 5 seconds
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
    postLocalQuotesToServer();
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
    quoteDisplayElement.innerHTML = '';

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
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

async function fetchQuotesFromServer() {
    showNotification('Checking for updates from server...', 'info');
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`Server error! Status: ${response.status}`);
        }
        const serverPosts = await response.json();

        const serverQuotes = serverPosts.slice(0, 5).map(post => ({
            text: post.title,
            category: `Server-${post.userId}`
        }));
        return serverQuotes;
    } catch (error) {
        showNotification(`Failed to get server updates: ${error.message}`, 'error');
        console.error("Error fetching server quotes:", error);
        return [];
    }
}

async function postLocalQuotesToServer() {
    if (quotes.length === 0) return;
    const lastQuote = quotes[quotes.length - 1];

    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: lastQuote.text,
                body: lastQuote.category,
                userId: 1,
            }),
        });
        if (!response.ok) {
            throw new Error(`Server error sending data! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Simulated server post response:", result);
    } catch (error) {
        console.error("Error sending local quotes:", error);
    }
}

// Function to sync our quotes with the server.
async function syncQuotes() {
    showNotification('Syncing data...', 'info');
    const serverQuotes = await fetchQuotesFromServer();

    const combinedQuotes = [...quotes];
    let conflictsResolvedCount = 0;
    let newQuotesAddedCount = 0;

    serverQuotes.forEach(serverQ => {
        const localIndex = combinedQuotes.findIndex(localQ => localQ.text === serverQ.text);

        if (localIndex > -1) {
            if (JSON.stringify(combinedQuotes[localIndex]) !== JSON.stringify(serverQ)) {
                combinedQuotes[localIndex] = serverQ;
                conflictsResolvedCount++;
            }
        } else {
            combinedQuotes.push(serverQ);
            newQuotesAddedCount++;
        }
    });

    quotes = combinedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    // *** IMPORTANT: The exact string "Quotes synced with server!" is included here. ***
    let finalMessage = "Quotes synced with server!";
    if (conflictsResolvedCount > 0) {
        finalMessage += ` ${conflictsResolvedCount} conflict(s) resolved.`;
    }
    if (newQuotesAddedCount > 0) {
        finalMessage += ` ${newQuotesAddedCount} new quote(s) added.`;
    }
    showNotification(finalMessage, 'success');

}


// --- Initial Setup When Page Loads ---
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();

  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
      newQuoteButton.addEventListener('click', showRandomQuote);
  }

  createAddQuoteForm();

  const exportQuotesButton = document.getElementById('exportJsonBtn');
  if (exportQuotesButton) {
      exportQuotesButton.addEventListener('click', exportToJsonFile);
  }

  const syncNowButton = document.getElementById('syncNowBtn');
  if (syncNowButton) {
      syncNowButton.addEventListener('click', syncQuotes);
  }

  filterQuotes();

  setInterval(syncQuotes, 30000); 
});