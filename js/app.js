/* ==========================================================================
   LIBRARY MANAGEMENT SYSTEM — APPLICATION LOGIC
   Software Engineering, Assignment 01
   ========================================================================== */

// The LocalStorage key where all book data is saved as a JSON string.
const STORAGE_KEY = 'libraryBooks';

// The in-memory array of book objects. This is what the app actually
// works with; LocalStorage is just where it gets saved for next time.
let books = [];

// Tracks which book is currently being edited. null means "Add" mode.
let editingId = null;

// Tracks which book the Issue modal is currently open for.
let issuingId = null;

/* --------------------------------------------------------------------------
   APP STARTUP
   -------------------------------------------------------------------------- */

// Wait for the HTML to fully load before touching any elements.
document.addEventListener('DOMContentLoaded', init);

function init() {
  const storedBooks = loadBooks();

  if (storedBooks === null) {
    // First time opening the app — no data in LocalStorage yet.
    books = getSampleBooks();
    saveBooks();
  } else {
    books = storedBooks;
  }

  populateCategoryFilter();
  renderBooks();
  updateDashboard();
  attachEventListeners();
}

/* --------------------------------------------------------------------------
   LOCALSTORAGE FUNCTIONS
   These are the ONLY two functions that talk to LocalStorage directly.
   Everything else works with the `books` array in memory.
   -------------------------------------------------------------------------- */

function loadBooks() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data === null) {
    return null; // Nothing saved yet
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Saved data was corrupted, starting fresh.', error);
    return null;
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function getSampleBooks() {
  return [
    { id: 'B001', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', year: 2008, status: 'Available', borrower: '' },
    { id: 'B002', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Database', year: 2010, status: 'Issued', borrower: 'Ali Ahmed' },
    { id: 'B003', title: 'Software Engineering: A Practitioner\'s Approach', author: 'Roger S. Pressman', category: 'Software Engineering', year: 2014, status: 'Available', borrower: '' },
    { id: 'B004', title: 'Calculus and Analytic Geometry', author: 'George B. Thomas', category: 'Mathematics', year: 2005, status: 'Available', borrower: '' },
    { id: 'B005', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', year: 1960, status: 'Issued', borrower: 'Sara Khan' }
  ];
}

/* --------------------------------------------------------------------------
   CRUD FUNCTIONS (Create, Read, Update, Delete)
   -------------------------------------------------------------------------- */

function addBook(bookData) {
  books.push(bookData);
  saveBooks();
}

function updateBook(id, updatedData) {
  const index = books.findIndex(function (b) { return b.id === id; });
  if (index === -1) return;

  // Merge the old book with the new data (keeps things simple and safe).
  books[index] = Object.assign({}, books[index], updatedData);
  saveBooks();
}

function deleteBook(id) {
  books = books.filter(function (b) { return b.id !== id; });
  saveBooks();
}

function issueBook(id, borrowerName) {
  const book = books.find(function (b) { return b.id === id; });
  if (!book) return;

  book.status = 'Issued';
  book.borrower = borrowerName;
  saveBooks();
}

function returnBook(id) {
  const book = books.find(function (b) { return b.id === id; });
  if (!book) return;

  book.status = 'Available';
  book.borrower = '';
  saveBooks();
}

/* --------------------------------------------------------------------------
   SEARCH + FILTER
   Both work together: we start with all books, then narrow down by
   search text, then narrow down further by the status/category filters.
   -------------------------------------------------------------------------- */

function getFilteredBooks() {
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const statusValue = document.getElementById('statusFilter').value;
  const categoryValue = document.getElementById('categoryFilter').value;

  return books.filter(function (book) {
    const matchesSearch =
      book.id.toLowerCase().includes(searchTerm) ||
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm);

    const matchesStatus = statusValue === 'All' || book.status === statusValue;
    const matchesCategory = categoryValue === 'All' || book.category === categoryValue;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}

/* --------------------------------------------------------------------------
   RENDERING (drawing data onto the page)
   -------------------------------------------------------------------------- */

function renderBooks() {
  const tbody = document.getElementById('booksTableBody');
  const emptyMessage = document.getElementById('emptyMessage');
  const filteredBooks = getFilteredBooks();

  tbody.innerHTML = ''; // Clear the table before redrawing it

  emptyMessage.hidden = filteredBooks.length !== 0;

  filteredBooks.forEach(function (book) {
    const row = document.createElement('tr');

    const badgeClass = book.status === 'Available' ? 'badge-available' : 'badge-issued';
    const borrowerDisplay = book.borrower
      ? book.borrower
      : '<span class="text-muted">&mdash;</span>';

    // Build the action buttons. Issue only shows for Available books,
    // Return only shows for Issued books — never both at once.
    let actionButtons =
      '<button class="btn-sm btn-edit" data-action="edit" data-id="' + book.id + '">Edit</button>' +
      '<button class="btn-sm btn-delete" data-action="delete" data-id="' + book.id + '">Delete</button>';

    if (book.status === 'Available') {
      actionButtons += '<button class="btn-sm btn-issue" data-action="issue" data-id="' + book.id + '">Issue</button>';
    } else {
      actionButtons += '<button class="btn-sm btn-return" data-action="return" data-id="' + book.id + '">Return</button>';
    }

    row.innerHTML =
      '<td class="col-id">' + book.id + '</td>' +
      '<td class="col-title">' + book.title + '</td>' +
      '<td>' + book.author + '</td>' +
      '<td>' + book.category + '</td>' +
      '<td>' + book.year + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + book.status + '</span></td>' +
      '<td>' + borrowerDisplay + '</td>' +
      '<td><div class="actions-cell">' + actionButtons + '</div></td>';

    tbody.appendChild(row);
  });
}

function updateDashboard() {
  const total = books.length;
  const available = books.filter(function (b) { return b.status === 'Available'; }).length;
  const issued = books.filter(function (b) { return b.status === 'Issued'; }).length;
  const categories = new Set(books.map(function (b) { return b.category; })).size;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAvailable').textContent = available;
  document.getElementById('statIssued').textContent = issued;
  document.getElementById('statCategories').textContent = categories;
}

function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  const currentValue = select.value;

  // Get a unique, sorted list of categories currently in use.
  const categories = [...new Set(books.map(function (b) { return b.category; }))].sort();

  select.innerHTML = '<option value="All">All Categories</option>';

  categories.forEach(function (category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // Keep the user's previous filter selection if it still exists.
  if (categories.includes(currentValue)) {
    select.value = currentValue;
  }
}

/* --------------------------------------------------------------------------
   FORM VALIDATION
   -------------------------------------------------------------------------- */

function validateForm(idBeingEdited) {
  let isValid = true;
  clearErrors();

  const id = document.getElementById('bookId').value.trim();
  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const category = document.getElementById('bookCategory').value.trim();
  const year = document.getElementById('bookYear').value.trim();

  if (id === '') {
    setError('bookId', 'errId', 'Book ID cannot be empty.');
    isValid = false;
  } else {
    const duplicate = books.find(function (b) {
      return b.id.toLowerCase() === id.toLowerCase() && b.id !== idBeingEdited;
    });
    if (duplicate) {
      setError('bookId', 'errId', 'This Book ID already exists.');
      isValid = false;
    }
  }

  if (title === '') {
    setError('bookTitle', 'errTitle', 'Book title cannot be empty.');
    isValid = false;
  }

  if (author === '') {
    setError('bookAuthor', 'errAuthor', 'Author cannot be empty.');
    isValid = false;
  }

  if (category === '') {
    setError('bookCategory', 'errCategory', 'Category cannot be empty.');
    isValid = false;
  }

  const currentYear = new Date().getFullYear();
  const yearNumber = Number(year);

  if (year === '' || isNaN(yearNumber) || yearNumber < 1000 || yearNumber > currentYear) {
    setError('bookYear', 'errYear', 'Enter a valid year between 1000 and ' + currentYear + '.');
    isValid = false;
  }

  return isValid;
}

function setError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add('invalid');
}

function clearErrors() {
  const errorIds = ['errId', 'errTitle', 'errAuthor', 'errCategory', 'errYear'];
  const inputIds = ['bookId', 'bookTitle', 'bookAuthor', 'bookCategory', 'bookYear'];

  errorIds.forEach(function (id) { document.getElementById(id).textContent = ''; });
  inputIds.forEach(function (id) { document.getElementById(id).classList.remove('invalid'); });
}

/* --------------------------------------------------------------------------
   ADD / EDIT FORM HANDLING
   -------------------------------------------------------------------------- */

function handleFormSubmit(event) {
  event.preventDefault(); // Stop the page from reloading (default form behaviour)

  const isValid = validateForm(editingId);
  if (!isValid) return;

  const bookData = {
    id: document.getElementById('bookId').value.trim(),
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    category: document.getElementById('bookCategory').value.trim(),
    year: Number(document.getElementById('bookYear').value.trim()),
    status: 'Available',
    borrower: ''
  };

  if (editingId === null) {
    // ADD mode
    addBook(bookData);
    showToast('Book added successfully.', 'success');
  } else {
    // UPDATE mode — keep the existing status and borrower, don't reset them
    const existingBook = books.find(function (b) { return b.id === editingId; });
    bookData.status = existingBook.status;
    bookData.borrower = existingBook.borrower;
    updateBook(editingId, bookData);
    showToast('Book updated successfully.', 'success');
  }

  populateCategoryFilter();
  renderBooks();
  updateDashboard();
  resetForm();
}

function startEdit(id) {
  const book = books.find(function (b) { return b.id === id; });
  if (!book) return;

  editingId = id;

  document.getElementById('bookId').value = book.id;
  document.getElementById('bookId').disabled = true; // ID should not change while editing
  document.getElementById('bookTitle').value = book.title;
  document.getElementById('bookAuthor').value = book.author;
  document.getElementById('bookCategory').value = book.category;
  document.getElementById('bookYear').value = book.year;

  document.getElementById('formTitle').textContent = 'Update Book';
  document.getElementById('submitBtn').textContent = 'Update Book';
  document.getElementById('cancelBtn').hidden = false;

  clearErrors();
  document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').disabled = false;
  document.getElementById('formTitle').textContent = 'Add Book';
  document.getElementById('submitBtn').textContent = 'Add Book';
  document.getElementById('cancelBtn').hidden = true;
  editingId = null;
  clearErrors();
}

/* --------------------------------------------------------------------------
   DELETE HANDLING
   -------------------------------------------------------------------------- */

function handleDelete(id) {
  const book = books.find(function (b) { return b.id === id; });
  if (!book) return;

  const confirmed = confirm('Are you sure you want to delete "' + book.title + '"?');
  if (!confirmed) return;

  deleteBook(id);
  populateCategoryFilter();
  renderBooks();
  updateDashboard();
  showToast('Book deleted successfully.', 'success');

  // If the deleted book was open in the edit form, reset the form.
  if (editingId === id) {
    resetForm();
  }
}

/* --------------------------------------------------------------------------
   ISSUE MODAL
   -------------------------------------------------------------------------- */

function openIssueModal(id) {
  const book = books.find(function (b) { return b.id === id; });
  if (!book) return;

  issuingId = id;
  document.getElementById('modalBookTitle').textContent = book.title;
  document.getElementById('borrowerName').value = '';
  document.getElementById('errBorrower').textContent = '';
  document.getElementById('issueModal').hidden = false;
  document.getElementById('borrowerName').focus();
}

function closeIssueModal() {
  document.getElementById('issueModal').hidden = true;
  issuingId = null;
}

function confirmIssue() {
  const borrowerName = document.getElementById('borrowerName').value.trim();

  if (borrowerName === '') {
    document.getElementById('errBorrower').textContent = 'Borrower name cannot be empty.';
    return;
  }

  issueBook(issuingId, borrowerName);
  renderBooks();
  updateDashboard();
  showToast('Book issued successfully.', 'success');
  closeIssueModal();
}

function handleReturn(id) {
  returnBook(id);
  renderBooks();
  updateDashboard();
  showToast('Book returned successfully.', 'success');
}

/* --------------------------------------------------------------------------
   TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */

function showToast(message, type) {
  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);

  // Remove the toast automatically after 3 seconds.
  setTimeout(function () {
    toast.classList.add('toast-out');
    setTimeout(function () { toast.remove(); }, 250);
  }, 3000);
}

/* --------------------------------------------------------------------------
   EVENT LISTENERS
   We use ONE click listener on the whole table (event delegation) instead
   of putting a listener on every single button. This is more efficient
   and automatically works for rows added later.
   -------------------------------------------------------------------------- */

function handleTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'edit') startEdit(id);
  else if (action === 'delete') handleDelete(id);
  else if (action === 'issue') openIssueModal(id);
  else if (action === 'return') handleReturn(id);
}

function attachEventListeners() {
  document.getElementById('bookForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
  document.getElementById('booksTableBody').addEventListener('click', handleTableClick);

  document.getElementById('searchInput').addEventListener('input', renderBooks);
  document.getElementById('statusFilter').addEventListener('change', renderBooks);
  document.getElementById('categoryFilter').addEventListener('change', renderBooks);

  document.getElementById('confirmIssueBtn').addEventListener('click', confirmIssue);
  document.getElementById('cancelIssueBtn').addEventListener('click', closeIssueModal);

  // Clicking the dark overlay (outside the modal box) also closes it.
  document.getElementById('issueModal').addEventListener('click', function (event) {
    if (event.target.id === 'issueModal') closeIssueModal();
  });
}