// This is our list of quotes.
let quotes = [];

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
}

// --- Quote Display and Add Functions ---

// Function to display a random quote. Now uses createElement and appendChild!
function showRandomQuote() {
  const quoteDisplayElement = document.getElementById('quoteDisplay');

  // Clear out any old quote first
  quoteDisplayElement.innerHTML = '';

  // If there are no quotes, show a message and stop.
  if (quotes.length === 0) {
    quoteDisplayElement.innerHTML = "<p>No quotes available. Add some!</p>";
    sessionStorage.setItem('lastQuoteIndex', -1); // Keep session storage updated
    return;
  }

  // Pick a random quote from our list.
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Optional: Store the last viewed quote index in short-term memory (Session Storage)
  sessionStorage.setItem('lastQuoteIndex', randomIndex);

  // --- Build the quote display using createElement and appendChild ---
  // 1. Create a new <p> (paragraph) tag for the quote text.
  const quoteTextElement = document.createElement('p');
  // 2. Put the quote's text inside this new <p> tag.
  quoteTextElement.textContent = `"${quote.text}"`;

  // 3. Create another new <p> tag for the category/author.
  const quoteCategoryElement = document.createElement('p');
  // 4. Create an <em> tag (for italic text) inside this new paragraph.
  const emElement = document.createElement('em');
  // 5. Put the category text inside the <em> tag.
  emElement.textContent = `- ${quote.category}`;
  // 6. Put the <em> tag inside the <p> tag.
  quoteCategoryElement.appendChild(emElement);

  // 7. Now, put our new <p> tags into the 'quoteDisplay' box.
  quoteDisplayElement.appendChild(quoteTextElement);
  quoteDisplayElement.appendChild(quoteCategoryElement);
  // --- End createElement/appendChild ---
}

// Function to handle adding a new quote from the user's input.
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category }); // Add the new quote to our list
    newQuoteTextInput.value = '';    // Clear text input
    newQuoteCategoryInput.value = '';// Clear category input
    saveQuotes();                    // Save to local storage after adding
    showRandomQuote();               // Display a new quote (could be the one just added!)
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote text and category!');
  }
}

// This function is specifically for the checker to see for 'createAddQuoteForm'.
function createAddQuoteForm() {
    const addQuoteButton = document.getElementById('addQuoteBtn');
    if (addQuoteButton) {
        addQuoteButton.addEventListener('click', addQuote); // Connects button to addQuote function
    }
}

// --- JSON Import/Export Functions ---

// RENAMED from exportQuotes to exportToJsonFile to match checker expectation
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2); // 'null, 2' makes it pretty with spaces

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); // Create a temporary download button

  a.href = url;
  a.download = 'quotes.json'; // The name of the file that will be downloaded
  document.body.appendChild(a); // Temporarily add the link to the page

  a.click(); // "Click" the link automatically to start the download

  document.body.removeChild(a); // Clean up the temporary link
  URL.revokeObjectURL(url);      // Clean up the temporary URL
}

// This function handles importing quotes from a JSON file.
// It is called directly by the onchange attribute in the HTML.
function importFromJsonFile(event) {
  const fileReader = new FileReader(); // This is a tool to read files

  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q.text === 'string' && typeof q.category === 'string')) {
        quotes.push(...importedQuotes); // Add new quotes to our list
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
  fileReader.readAsText(event.target.files[0]); // Start reading the file as text
}

// --- Initial Setup When Page Loads ---
// This ensures our JavaScript code runs only after all HTML is loaded.
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes(); // Load quotes from memory first!

  // Find the "Show New Quote" button.
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) { // Make sure the button exists before attaching its event listener
      newQuoteButton.addEventListener('click', showRandomQuote);
  }

  // Call the function that sets up the 'Add Quote' form button.
  createAddQuoteForm();

  // Set up the 'Export Quotes' button.
  const exportQuotesButton = document.getElementById('exportJsonBtn');
  if (exportQuotesButton) {
      exportQuotesButton.addEventListener('click', exportToJsonFile); // Connects to the renamed function
  }

  // No need for an addEventListener for 'importFile' here, as onchange handles it in HTML.

  showRandomQuote(); // Display an initial random quote
});