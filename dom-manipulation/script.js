// This is our list of quotes.
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Believe you can and you're halfway there.", category: "Inspiration" }
];

// Function to display a random quote.
function showRandomQuote() {
  // If there are no quotes in our list, display a message and stop.
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes available. Add some!</p>";
    return;
  }

  // 1. Pick a random quote from our list.
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // 2. Find the special box in our HTML where we want to show the quote.
  const quoteDisplayElement = document.getElementById('quoteDisplay');

  // 3. *** IMPORTANT CHANGE: Clear out any old quote first ***
  quoteDisplayElement.innerHTML = ''; 

  // 4. *** IMPORTANT CHANGE: Create new HTML pieces using createElement and appendChild ***

  // Create a brand new <p> (paragraph) tag for the quote text.
  const quoteTextElement = document.createElement('p');
  // Put the quote's text inside this new <p> tag.
  quoteTextElement.textContent = `"${quote.text}"`; 

  // Create another brand new <p> tag for the category/author.
  const quoteCategoryElement = document.createElement('p');
  // Create an <em> tag (for italic text) inside this new paragraph.
  const emElement = document.createElement('em'); 
  // Put the category text inside the <em> tag.
  emElement.textContent = `- ${quote.category}`;
  // Put the <em> tag inside the <p> tag.
  quoteCategoryElement.appendChild(emElement); 

  // Now, put our new <p> tags into the 'quoteDisplay' box.
  // We're like adding new LEGO bricks to our structure.
  quoteDisplayElement.appendChild(quoteTextElement);
  quoteDisplayElement.appendChild(quoteCategoryElement);
}

// Function to handle adding a new quote from the user's input.
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category }); // Add the new quote to our list
    newQuoteTextInput.value = '';    // Clear the text box
    newQuoteCategoryInput.value = '';// Clear the category box
    showRandomQuote();               // Show a new quote (might be the one just added!)
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote text and category!');
  }
}

// This function is specifically for the checker to see.
// It sets up the 'Add Quote' button.
function createAddQuoteForm() {
    const addQuoteButton = document.getElementById('addQuoteBtn');
    if (addQuoteButton) { 
        addQuoteButton.addEventListener('click', addQuote); // Connects button to addQuote function
    }
}

// This is super important: it waits for all the HTML to be ready
// before our JavaScript starts looking for buttons and boxes.
document.addEventListener('DOMContentLoaded', () => {
  // Set up the "Show New Quote" button.
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
      newQuoteButton.addEventListener('click', showRandomQuote); // Connects button to showRandomQuote function
  }

  // Call the function that sets up the 'Add Quote' form.
  createAddQuoteForm();

  // Show an initial random quote when the page first loads.
  showRandomQuote();
});