// Our main list of quotes.
let quotes = [];
// This variable will keep track of which category is currently selected for filtering.
// *** IMPORTANT CHANGE: Renamed from 'currentCategoryFilter' to 'selectedCategory' ***
let selectedCategory = 'all';

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

  // *** IMPORTANT CHANGE: Load the last remembered filter category using the new name ***
  const storedFilter = localStorage.getItem('selectedCategory'); // Changed key name here
  if (storedFilter) {
    selectedCategory = storedFilter; // Use the new variable name
  }
}

// --- Quote Display and Add Functions ---
// This function still shows ONE random quote for the "Show New Quote" button.
function showRandomQuote() {
  const quoteDisplayElement = document.getElementById('quoteDisplay');

  const filteredQuotes = quotes.filter(quote => {
    return selectedCategory === 'all' || quote.category === selectedCategory; // Use new variable name
  });

  if (filteredQuotes.length === 0) {
    quoteDisplayElement.innerHTML = "<p>No quotes available for this category. Add some!</p>";
    sessionStorage.setItem('lastQuoteIndex', -1); // Keep session storage updated
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  sessionStorage.setItem('lastQuoteIndex', randomIndex); // Store last viewed quote in session storage

  // Clear previous content of quoteDisplay to show only this new random quote
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
    saveQuotes(); // Save to local storage after adding!
    populateCategories(); // Update categories in the dropdown if a new one was added!

    // After adding, we want to re-filter and display ALL matching quotes.
    filterQuotes(); 

    alert('Quote added successfully!');
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
    quoteDisplayElement.innerHTML = ''; // Clear existing content to show ONLY filtered quotes

    const filteredQuotes = quotes.filter(quote => {
        return selectedCategory === 'all' || quote.category === selectedCategory; // Use new variable name
    });

    if (filteredQuotes.length === 0) {
        quoteDisplayElement.innerHTML = "<p>No quotes available for this category. Add some!</p>";
        return;
    }

    // Iterate through all filtered quotes and append them simply.
    filteredQuotes.forEach(quote => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.textContent = `"${quote.text}"`;

        const quoteCategoryElement = document.createElement('p');
        const emElement = document.createElement('em');
        emElement.textContent = `- ${quote.category}`;
        quoteCategoryElement.appendChild(emElement);

        // Append directly to the display element
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

  // *** IMPORTANT CHANGE: Set the dropdown to the last remembered filter (or 'all' if none). ***
  categoryFilterDropdown.value = selectedCategory; // Use new variable name
}

function filterQuotes() {
  const categoryFilterDropdown = document.getElementById('categoryFilter');
  selectedCategory = categoryFilterDropdown.value; // Use new variable name

  // *** IMPORTANT CHANGE: Save the selected filter to local storage immediately. ***
  localStorage.setItem('selectedCategory', selectedCategory); // Changed key name here

  // Now, display ALL quotes from the *newly filtered* list.
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

  // 6. Display all quotes based on the loaded filter when the page loads.
  filterQuotes(); // Call filterQuotes here to apply the loaded filter and display quotes
});