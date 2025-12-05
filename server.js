const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

const DIST_DIR = path.join(__dirname, 'dist');

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
}

const DATA_FILE = path.join(__dirname, 'posts.json');

// Helper function to read posts from the file
function readPosts() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write posts to the file
function writePosts(posts) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// Get all posts
app.get('/api/posts', (req, res) => {
    const posts = readPosts();
    res.json(posts);
});

// Add a new post
app.post('/api/posts', (req, res) => {
    const posts = readPosts();
    const nextId = posts.length ? posts[posts.length - 1].id + 1 : 1;

    const newPost = {
        id: nextId,
        author: req.body.author || 'anonymous',
        content: req.body.content || '',
        imageUrl: req.body.imageUrl || '',
        date: req.body.date || new Date().toISOString(),
        replies: Array.isArray(req.body.replies) ? req.body.replies : []
    };

    posts.push(newPost);
    writePosts(posts);
    res.status(201).json(newPost);
});

app.post('/api/posts/:id/replies', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const posts = readPosts();
    const post = posts.find((entry) => entry.id === postId);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const reply = {
        author: req.body.author || 'anonymous',
        content: req.body.content || '',
        date: new Date().toISOString()
    };

    if (!Array.isArray(post.replies)) {
        post.replies = [];
    }

    post.replies.push(reply);
    writePosts(posts);
    res.status(201).json(reply);
});

// Update an existing post
app.put('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const updatedPost = req.body;
    let posts = readPosts();

    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
        posts[postIndex] = { ...posts[postIndex], ...updatedPost };
        writePosts(posts);
        res.json(posts[postIndex]);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

app.get(/^(?!\/api).*/, (req, res, next) => {
    if (!fs.existsSync(DIST_DIR)) {
        return res.status(200).send('Build the client (`npm run build`) before serving.');
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});