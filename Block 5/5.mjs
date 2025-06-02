import express, { json, urlencoded } from "express";
import { serve, setup } from "swagger-ui-express";
import session from "express-session";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import bcrypt, { hash as _hash } from "bcrypt";
import { configDotenv } from "dotenv";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = await fs.readFile("./swagger.json", "utf-8");
const swaggerDocument = JSON.parse(data);

configDotenv();

const app = express();
const port = 3000;

const saltRounds = 10;

const hash = await _hash(process.env.PASSWORD, saltRounds);

app.use(json());
app.use(urlencoded());

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/swagger-ui", serve, setup(swaggerDocument));

const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    port: "3307",
    database: "users",
});

try {
    const [results] = await connection.execute("SELECT * FROM users");

    if (!results) {
        connection.execute("INSERT INTO users (email, password) VALUES (?, ?)", [
            process.env.EMAIL,
            hash,
        ]);
    }

} catch (err) {
    console.log(err);
}


let isbn = 0;
let lendId = 0;

let books = {};
let lends = {};
let activeLends = [];

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

function isActivelyLent(isbn) {
    return activeLends.find((lend) => lend.isbn == isbn);
}

function countCustomerLends(customer_id) {
    return activeLends.reduce((sum, lend) => {
        return parseInt(lend.customer_id) == customer_id ? sum + 1 : sum;
    }, 1);
}

function lendBook({ customer_id, isbn }) {
    if (customer_id == undefined || isbn == undefined) {
        throw new Error("Requires both 'customer_id' and 'isbn'");
    }

    if (!checkISBN(isbn)) {
        throw new Error("Cannot lend book. The requested isbn doesn't exist");
    }

    if (isActivelyLent(isbn)) {
        throw new Error("Cannot lend book as it has already been lent");
    }

    if (countCustomerLends(customer_id) > 3) {
        throw new Error("Customer cannot lend more than 3 books at a time");
    }

    const borrowed_at = new Date();

    lends[lendId] = { customer_id, isbn, borrowed_at, returned_at: null };
    activeLends.push({ isbn, lendId, customer_id });

    lendId++;

    return lends[lendId - 1]; // return lending information
}

function authCheck(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.sendStatus(401);
    }
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
            res.status(201).json(newBook);
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
    res.status(201).json(books[isbn]);
});

app.get("/lends", authCheck, (req, res) => {
    res.json(lends);
});

app.get("/lends/:id", authCheck, (req, res) => {
    const { id } = req.params;

    res.json(lends[id]);
});

app.post("/lends", authCheck, (req, res) => {
    const body = req.body;

    try {
        const newLend = lendBook(body);
        res.json(newLend);
    } catch (error) {
        console.error(error);
        res.status(422).json({ error: error.message });
    }
});

app.delete("/lends/:id", authCheck, (req, res) => {
    const { id } = req.params;
    const isbn = lends[id].isbn;

    if (!isActivelyLent(isbn)) {
        res.status(422).json({ error: "This book has already been returned." });
        return;
    }

    activeLends = activeLends.filter((lend) => !(lend.isbn == isbn && lend.lendId == id));

    lends[id].returned_at = new Date();

    res.sendStatus(200);
});

app.get("/login", (req, res) => {
    res.sendFile(join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        res.status(401).send("Both email and password are required");
        return;
    }

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    const correctPassword = await bcrypt.compare(password, rows[0].password)

    if (rows && correctPassword) {
        req.session.authenticated = true;
        res.status(201).send("Login successfull");
    } else {
        res.status(401).send("Invalid credetials");
    }
});

app.get("/verify", (req, res) => {
    if (req.session.authenticated) {
        res.send("You are logged in");
    } else {
        res.send("You are NOT logged in");
    }
});

app.delete("/logout", (req, res) => {
    req.session.authenticated = false;

    res.sendStatus(204);
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
