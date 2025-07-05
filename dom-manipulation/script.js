// This is our list of quotes. It's like a secret list inside the machine!
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Believe you can and you're halfway there.", category: "Inspiration" }
];

// This function shows a random quote
function showRandomQuote() {
  // Pick a random number
  const randomIndex = Math.floor(Math.random() * quotes.length);
  // Get the quote from our secret list using that random number
  const quote = quotes[randomIndex];
  // Find the special box in our HTML where we want to show the quote
  const quoteDisplay = document.getElementById('quoteDisplay');
  // Put the quote's text and category into that box
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>- ${quote.category}</em></p>`;
}

// This function lets us add new quotes
function addQuote() {
  // Find the boxes where the user typed the new quote and category
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');

  // Get what the user typed (trim gets rid of extra spaces)
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  // Check if they actually typed something (not empty)
  if (text && category) {
    // Add the new quote to our secret list
    quotes.push({ text, category });
    // Clear the boxes so they can type another one
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    // Show a new random quote, maybe even the one they just added!
    showRandomQuote();
    alert('Quote added successfully!'); // A little pop-up message!
  } else {
    alert('Please enter both quote text and category!'); // Tell them if they forgot something
  }
}

// This part makes the "Show New Quote" button work when you click it
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// This makes sure a random quote shows up as soon as the page loads!
showRandomQuote();
