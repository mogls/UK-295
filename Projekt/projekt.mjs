import express, { json, urlencoded } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
const PORT = 3000;

app.use(json());
app.use(urlencoded());
app.use(cookieParser());

/* 
id: {
id: ...
title: ...
description: ...
}
*/

const tasks = {};

let taskId = 1;

function createTask(title, description) {
    tasks[taskId] = { id: taskId, title, description };
    taskId++;
    return tasks[taskId - 1];
}

function idExists(id) {
    return Object.keys(tasks).includes(id);
}

function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Invalid or exepired token!" });
        return;
    }
}

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/tasks", verifyToken, (req, res) => {
    if (Object.keys(tasks).length > 0) {
        res.json(tasks);
    } else {
        res.status(400).json({ error: "There are no tasks at the moment" });
    }
});

app.get("/tasks/:id", verifyToken, (req, res) => {
    const { id } = req.params;

    if (!idExists(id)) {
        res.status(422).json({ error: `There is no task with id=${id}` });
        return;
    }

    res.json(tasks[id]);
});

app.post("/tasks", verifyToken, (req, res) => {
    const { title, description } = req.body || {};

    if (!title || !description) {
        res.status(422).json({ error: "Both title and description are required to create a task" });
        return;
    }

    const newTask = createTask(title, description);

    console.log("created task with id=", newTask.id);

    res.status(201).json(newTask);
});

app.patch("/tasks/:id", verifyToken, (req, res) => {
    const { title, description } = req.body || {};
    const { id } = req.params;

    const update = {};

    if (!idExists(id)) {
        res.status(422).json({ error: `There is no task with id=${id}` });
        return;
    }

    if (title === undefined && description === undefined) {
        res.status(422).json({
            error: "Cannot update object with nothing. Provide at least one of: title, description",
        });
        return;
    }

    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;

    tasks[id] = { ...tasks[id], ...update };

    console.log("Updated task with id=", id);

    res.status(200).json(tasks[id]);
});

app.delete("/tasks/:id", verifyToken, (req, res) => {
    const { id } = req.params;

    if (!idExists(id)) {
        res.status(422).json({ error: `There is no task with id=${id}` });
        return;
    }

    delete tasks[id];

    console.log("Deleted task with id=", id);

    res.status(200).json({ message: `Task with id=${id} deleted successfully` });
});

app.post("/login", (req, res) => {
    const { user, password } = req.body || {};

    if (!user || !password) {
        res.status(422).json({ error: "Both user and password are required" });
        return;
    }

    if (String(user).toLowerCase().match(/^\S+@\S+\.\S+$/) && password === process.env.PASSWORD) {
        const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        console.log("User logged in");

        res.status(200).json({ message: "Successfully logged in" });
        return;
    }

    res.status(401).json({ error: "Invalid credentials" });
});

app.get("/verify", verifyToken, (req, res) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = req.user.exp;
    const timeRemaining = exp - now;

    const h = Math.floor(timeRemaining / 3600);
    const m = Math.floor((timeRemaining % 3600) / 60);
    const s = timeRemaining % 60;

    res.json({ message: `Your token expires in ${h}h:${m}m:${s}s` });
});

app.delete("/logout", verifyToken, (req, res) => {
    res.clearCookie("token");

    console.log("User logged out");

    res.json({ message: "Logged out" });
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
