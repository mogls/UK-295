const express = require("express");
const uuidv4 = require("uuid").v4;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());

let isbn = 0;
let lendId = 0;

let books = {};
let lends = {};
let returnedLends = [];

function addBook({ title, year, author }) {
    if (!title || !year || !author) {
        throw new Error("Requires all 'title', 'year', and 'author'");
    }

    books[isbn] = { title, year, author, isbn };

    isbn++;

    return books[isbn - 1]; // return added book
}

function checkISBN(isbn) {
    // console.log(isbn);
    return books.hasOwnProperty(isbn);
}

function lendBook({ customer_id, isbn }) {
    if (!customer_id || !isbn) {
        throw new Error("Requires both 'customer_id' and 'isbn'");
    }

    if (!checkISBN(isbn)) {
        throw new Error("Cannot lend book. The requested isbn doesn't exist");
    }

    const borrowed_at = new Date();

    lends[lendId] = { customer_id, isbn, borrowed_at, returned_at: null };

    lendId++;

    return lends[lendId - 1]; // return lending information
}

function checkReturningLendId(id) {
    return returnedLends.includes(id);
}

function checkLendId(id) {
    return lends.hasOwnProperty(id);
}

addBook({ title: "Be what may", year: 2002, author: "Heather Brown" });
lendBook({ customer_id: 0, isbn: 0 });

app.get("/", (req, res) => {
    res.redirect("/books");
});

app.get("/books", (req, res) => {
    res.json(books);
});

app.get("/books/:isbn", (req, res) => {
    const { isbn } = req.params;

    if (!checkISBN(isbn)) {
        res.status(400).json({ error: "This isbn doesn't exist" });
        return;
    }

    res.json(books[isbn]);
});

app.post("/books", (req, res) => {
    const body = req.body;

    try {
        const newBook = addBook(body);

        if (newBook) {
            res.status(200).json(newBook);
        }
    } catch (err) {
        console.error(err);
        res.status(422).json({ error: err });
    }
});

app.put("/books/:isbn", (req, res) => {
    const { title, year, author } = req.body;
    const { isbn } = req.params;

    if (!checkISBN(isbn)) {
        res.status(400).json({ error: "This isbn doesn't exist" });
        return;
    }

    if (!title || !year || !author) {
        res.status(422).json({ error: "Requires all 'title', 'year', and 'author'" });
        return;
    }

    books[isbn] = { ...books[isbn], title, year, author };
    res.status(200).json(books[isbn]);
});

app.delete("/books/:isbn", (req, res) => {
    const { isbn } = req.params;

    if (!checkISBN(isbn)) {
        res.status(400).json({ error: "This isbn doesn't exist" });
        return;
    }

    delete books[isbn];

    res.sendStatus(200);
});

app.patch("/books/:isbn", (req, res) => {
    const { isbn } = req.params;
    const body = req.body;

    if (!checkISBN(isbn)) {
        res.status(400).json({ error: "This isbn doesn't exist" });
        return;
    }

    books[isbn] = { ...books[isbn], ...body };
    res.status(200).json(books[isbn]);
});

app.get("/lends", (req, res) => {
    res.json(lends);
});

app.get("/lends/:id", (req, res) => {
    const { id } = req.params;

    res.json(lends[id]);
});

app.post("/lends", (req, res) => {
    const body = req.body;

    try {
        const newLend = lendBook(body);
        res.json(newLend);
    } catch (error) {
        res.status(422).json({ error });
    }
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
