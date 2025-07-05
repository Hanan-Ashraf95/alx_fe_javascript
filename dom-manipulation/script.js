// This is our list of quotes. It's like a secret list inside the machine!
// We'll start with some default quotes if memory is empty.
let quotes = []; // Changed to 'let' because we will replace it when loading from memory

// --- Memory (Web Storage) Functions ---

// Function to save the current list of quotes to the machine's long-term memory (Local Storage).
function saveQuotes() {
  // We turn our JavaScript list of quotes into a special text format (JSON string)
  // that the memory can understand and store.
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from the machine's long-term memory.
function loadQuotes() {
  // We ask the memory if it has anything saved under 'quotes'.
  const storedQuotes = localStorage.getItem('quotes');
  // If it found something, we turn that special text format back into a JavaScript list.
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // If memory is empty, we start with some default quotes.
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Motivation" },
      { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
      { text: "Stay hungry, stay foolish.", category: "Motivation" },
      { text: "Believe you can and you're halfway there.", category: "Inspiration" }
    ];
  }
}

// --- Quote Display and Add Functions (from previous task) ---

// Function to display a random quote.
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes available. Add some!</p>";
    // Optional: Store the last viewed quote index in short-term memory (Session Storage)
    sessionStorage.setItem('lastQuoteIndex', -1);
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplayElement = document.getElementById('quoteDisplay');

  quoteDisplayElement.innerHTML = ''; // Clear old content

  const quoteTextElement = document.createElement('p');
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  const emElement = document.createElement('em');
  emElement.textContent = `- ${quote.category}`;
  quoteCategoryElement.appendChild(emElement);

  quoteDisplayElement.appendChild(quoteTextElement);
  quoteDisplayElement.appendChild(quoteCategoryElement);

  // Optional: Store the last viewed quote index in short-term memory (Session Storage)
  sessionStorage.setItem('lastQuoteIndex', randomIndex);
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
    showRandomQuote();
    saveQuotes(); // *** IMPORTANT: Save quotes to memory after adding! ***
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

// --- JSON Import/Export Functions ---

// Function to export quotes to a JSON file (creating a "recipe card" file).
function exportQuotes() {
  // Turn our list of quotes into a nicely formatted JSON text.
  const jsonString = JSON.stringify(quotes, null, 2); // 'null, 2' makes it pretty with spaces

  // Create a special "blob" of data that can be downloaded.
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a temporary link on the webpage.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); // This is like creating a temporary download button

  // Set the link's properties.
  a.href = url;
  a.download = 'quotes.json'; // This is the name of the file that will be downloaded
  document.body.appendChild(a); // Temporarily add the link to the page

  a.click(); // "Click" the link automatically to start the download

  // Clean up the temporary link and URL after a short delay.
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file (reading a "recipe card" file).
// This function is called automatically when a file is selected in the input slot.
function importFromJsonFile(event) {
  const fileReader = new FileReader(); // This is a tool to read files

  // What to do when the file is finished reading:
  fileReader.onload = function(event) {
    try {
      // Try to turn the text from the file back into a JavaScript list of quotes.
      const importedQuotes = JSON.parse(event.target.result);

      // Check if the imported data looks like an array of objects.
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q.text === 'string' && typeof q.category === 'string')) {
        // Add the imported quotes to our existing list.
        quotes.push(...importedQuotes); // '...' means add each item separately
        saveQuotes(); // Save the updated list to memory
        showRandomQuote(); // Show a new quote
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON file format. Please upload a file with an array of quote objects (text, category).');
      }
    } catch (e) {
      alert('Error parsing JSON file: ' + e.message);
    }
  };

  // Start reading the file as text.
  fileReader.readAsText(event.target.files[0]);
}

// --- Initial Setup When Page Loads ---

// This makes sure our JavaScript code runs only after all the HTML elements
// are fully loaded and ready in the browser. This is good practice!
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load quotes from memory first thing!
  loadQuotes();

  // 2. Set up the "Show New Quote" button.
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
      newQuoteButton.addEventListener('click', showRandomQuote);
  }

  // 3. Set up the 'Add Quote' form button.
  createAddQuoteForm();

  // 4. Set up the 'Export Quotes' button.
  const exportQuotesButton = document.getElementById('exportQuotesBtn');
  if (exportQuotesButton) {
      exportQuotesButton.addEventListener('click', exportQuotes);
  }

  // 5. Set up the 'Import Quotes' file input.
  const importFileInput = document.getElementById('importFile');
  if (importFileInput) {
      // When a file is selected, call our import function.
      importFileInput.addEventListener('change', importFromJsonFile);
  }

  // 6. Display an initial random quote when the page first loads.
  showRandomQuote();
});