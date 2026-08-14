const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// Página principal
app.use(express.static(path.join(__dirname, "public")));

// LOGIN
app.post("/api/login", async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Enter a password."
        });
    }

    const passwordCorrect = await bcrypt.compare(
        password,
        process.env.BLOODLINE_PASSWORD_HASH
    );

    if (!passwordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Incorrect password."
        });
    }

    req.session.authenticated = true;

    res.json({
        success: true
    });
});

// Comprobar sesión
app.get("/api/session", (req, res) => {
    res.json({
        authenticated: req.session.authenticated === true
    });
});

// LOGOUT
app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            success: true
        });
    });
});

// Middleware para páginas privadas
function requireAuth(req, res, next) {
    if (req.session.authenticated !== true) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Access Denied</title>
                <style>
                    body {
                        background:#080808;
                        color:white;
                        font-family:Arial;
                        text-align:center;
                        padding-top:120px;
                    }

                    h1 {
                        color:#ffd43b;
                    }
                </style>
            </head>

            <body>
                <h1>ACCESS DENIED</h1>
                <p>You need Bloodline authorization.</p>
            </body>
            </html>
        `);
    }

    next();
}

// PRIVATE
app.get("/private", requireAuth, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Bloodline - Private</title>
            <style>
                body {
                    background:#080808;
                    color:#fff;
                    font-family:Arial;
                    text-align:center;
                    padding-top:100px;
                }

                h1 {
                    color:#ffd43b;
                }

                a {
                    color:#ffd43b;
                    text-decoration:none;
                }
            </style>
        </head>

        <body>
            <h1>BLOODLINE PRIVATE</h1>
            <p>Authorized access granted.</p>
            <a href="/">← BACK</a>
        </body>
        </html>
    `);
});

// PROJECTS
app.get("/projects", requireAuth, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bloodline - Projects</title>
        </head>

        <body style="
            background:#080808;
            color:white;
            font-family:Arial;
            text-align:center;
            padding-top:100px;
        ">

            <h1 style="color:#ffd43b;">
                BLOODLINE PROJECTS
            </h1>

            <p>Private projects area.</p>

            <a href="/" style="color:#ffd43b;">
                ← BACK
            </a>

        </body>
        </html>
    `);
});

// MEDIA
app.get("/media", requireAuth, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bloodline - Media</title>
        </head>

        <body style="
            background:#080808;
            color:white;
            font-family:Arial;
            text-align:center;
            padding-top:100px;
        ">

            <h1 style="color:#ffd43b;">
                BLOODLINE MEDIA
            </h1>

            <p>Private media area.</p>

            <a href="/" style="color:#ffd43b;">
                ← BACK
            </a>

        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Bloodline running on http://localhost:${PORT}`);
});