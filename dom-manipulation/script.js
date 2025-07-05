// Our main list of quotes.
let quotes = [];
// This variable will keep track of which category is currently selected for filtering.
let currentCategoryFilter = 'all'; // Starts by showing all categories

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

  // Also load the last remembered filter category
  const storedFilter = localStorage.getItem('lastCategoryFilter');
  if (storedFilter) {
    currentCategoryFilter = storedFilter;
  }
}

// --- Quote Display and Add Functions ---
// Function to display a random quote, now respecting the current filter.
function showRandomQuote() {
  const quoteDisplayElement = document.getElementById('quoteDisplay');
  quoteDisplayElement.innerHTML = ''; // Clear old content

  // First, filter the quotes based on the currentCategoryFilter.
  const filteredQuotes = quotes.filter(quote => {
    return currentCategoryFilter === 'all' || quote.category === currentCategoryFilter;
  });

  if (filteredQuotes.length === 0) {
    quoteDisplayElement.innerHTML = "<p>No quotes available for this category. Add some!</p>";
    sessionStorage.setItem('lastQuoteIndex', -1);
    return;
  }

  // Pick a random quote only from the filtered ones.
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  // Optional: Store the last viewed quote index in short-term memory (Session Storage)
  sessionStorage.setItem('lastQuoteIndex', randomIndex);

  // Build the quote display using createElement and appendChild
  const quoteTextElement = document.createElement('p');
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  const emElement = document.createElement('em');
  emElement.textContent = `- ${quote.category}`;
  quoteCategoryElement.appendChild(emElement);

  quoteDisplayElement.appendChild(quoteTextElement);
  quoteDisplayElement.appendChild(quoteCategoryElement);
}

// Function to handle adding a new quote.
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    saveQuotes(); // Save to local storage after adding!
    populateCategories(); // *** NEW: Update categories in the dropdown if a new one was added! ***
    showRandomQuote();
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote text and category!');
  }
}

// Function to set up the 'Add Quote' form button.
function createAddQuoteForm() {
    const addQuoteButton = document.getElementById('addQuoteBtn');
    if (addQuoteButton) {
        addQuoteButton.addEventListener('click', addQuote);
    }
}

// --- NEW: Category Filtering Logic ---

// Function to populate the category dropdown dynamically.
function populateCategories() {
  const categoryFilterDropdown = document.getElementById('categoryFilter');
  categoryFilterDropdown.innerHTML = ''; // Clear old options

  // Always add "All Categories" option first.
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  categoryFilterDropdown.appendChild(allOption);

  // Get all unique categories from our quotes.
  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  uniqueCategories.sort(); // Sort categories alphabetically

  // Add each unique category as an option.
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  // Set the dropdown to the last remembered filter (or 'all' if none).
  categoryFilterDropdown.value = currentCategoryFilter;
}

// Function to filter quotes based on the selected category in the dropdown.
function filterQuotes() {
  const categoryFilterDropdown = document.getElementById('categoryFilter');
  currentCategoryFilter = categoryFilterDropdown.value; // Get the selected category

  // Save the selected filter to local storage so we remember it for next time!
  localStorage.setItem('lastCategoryFilter', currentCategoryFilter);

  showRandomQuote(); // Show a random quote from the *filtered* list
}

// --- JSON Import/Export Functions ---
// (These are from the previous task, still needed!)

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
        populateCategories(); // *** NEW: Update categories after importing! ***
        showRandomQuote();
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

// --- Initial Setup When Page Loads ---
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

  // The 'Import Quotes' file input has its onchange directly in HTML now.

  // 6. Show an initial random quote (respecting the loaded filter).
  showRandomQuote();

  // 7. IMPORTANT: Make sure the filter dropdown's value is set correctly on load
  //    This happens automatically because populateCategories sets `categoryFilterDropdown.value = currentCategoryFilter;`
  //    and filterQuotes also sets `currentCategoryFilter`.
});