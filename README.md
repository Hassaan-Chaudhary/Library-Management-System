# Library Management System

## Description

A small, static web application built for a Software Engineering university
assignment. It allows a small library to manage its book records: adding,
editing, deleting, searching, filtering, issuing and returning books. All
data is stored in the browser's LocalStorage, so records remain saved even
after the page is refreshed or the browser is closed and reopened.

## Features

- Dashboard showing Total Books, Available Books, Issued Books and Total
  Categories, updated automatically after every change.
- Add Book form with validation (empty fields, duplicate Book ID, invalid
  publication year).
- Book Records table with columns for ID, Title, Author, Category, Year,
  Status, Borrower and Actions.
- Edit Book — loads an existing book into the form and updates it without
  creating a duplicate.
- Delete Book — asks for confirmation before removing a book.
- Issue Book — records a borrower's name and marks the book as Issued.
- Return Book — clears the borrower and marks the book as Available again.
- Search by Book ID, Title, Author or Category, combined with Status and
  Category filters.
- Toast notifications for success/error messages instead of browser alerts.
- Responsive layout that works on desktop, tablet and mobile screens.
- Five sample books are created automatically the first time the app is
  opened, so the table is never empty on first load.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks or libraries)
- Browser LocalStorage
- Git and GitHub
- GitHub Actions (Continuous Integration)
- GitHub Pages (Deployment)

## How to Run Locally

1. Clone or download this repository.
2. Open the project folder in a code editor (e.g. VS Code).
3. Open `index.html` directly in a browser, or use an extension such as
   VS Code's "Live Server" for the best experience.
4. No build step, installation or server is required — this is a fully
   static application.

## LocalStorage

The application stores all book records under a single LocalStorage key,
`libraryBooks`, as a JSON string. Data is loaded when the page opens and
saved again after every add, edit, delete, issue or return action. If no
data is found (first visit), five sample books are created automatically.

## Testing

A simple test script is included at `tests/test.js`. It does not use any
testing framework — it is plain Node.js so it stays easy to read and
explain. It checks that:

- `index.html`, `css/style.css` and `js/app.js` exist.
- `js/app.js` defines the core functions the app relies on.
- `index.html` correctly links the CSS and JavaScript files.

Run it locally with: