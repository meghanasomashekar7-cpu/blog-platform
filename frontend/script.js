const API_URL = "http://localhost:5000/api";

// Load all blog posts
async function loadPosts() {
    const postsContainer = document.getElementById("postsContainer");

    if (!postsContainer) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts`);

        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No blog posts available.</p>";
            return;
        }

        postsContainer.innerHTML = "";

        posts.forEach((post) => {
            const postElement = document.createElement("div");

            postElement.className = "post-card";

            postElement.innerHTML = `
                <h3>${post.title}</h3>

                <p>${post.content}</p>

                <small>
                    By ${post.author ? post.author.name : "Unknown Author"}
                </small>

                <br><br>

                <button onclick="viewPost('${post._id}')">
                    Read More
                </button>
            `;

            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error("Error loading posts:", error);

        postsContainer.innerHTML =
            "<p>Unable to connect to the server.</p>";
    }
}

// Open individual post
function viewPost(postId) {
    window.location.href = `post.html?id=${postId}`;
}

// Load posts when page opens
loadPosts();

// Register user
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("registerMessage");

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = "Registration successful! You can now login.";

                registerForm.reset();
            } else {
                message.textContent = data.message || "Registration failed.";
            }

        } catch (error) {
            console.error(error);

            message.textContent = "Unable to connect to the server.";
        }
    });
}

// Login user
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {

                // Save login information
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                message.textContent = "Login successful!";

                // Go to home page
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);

            } else {
                message.textContent =
                    data.message || "Login failed.";
            }

        } catch (error) {
            console.error(error);

            message.textContent =
                "Unable to connect to the server.";
        }
    });
}

// ===============================
// BLOG POST + COMMENTS
// ===============================

const postContainer = document.getElementById("postContainer");
const commentsContainer = document.getElementById("commentsContainer");
const commentForm = document.getElementById("commentForm");


// Get post ID from URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");


// Load individual post
async function loadSinglePost() {

    if (!postContainer || !postId) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/posts/${postId}`);

        const post = await response.json();

        if (!response.ok) {
            postContainer.innerHTML = "<p>Post not found.</p>";
            return;
        }

        postContainer.innerHTML = `
    <h2>${post.title}</h2>

    <p>
        By ${post.author ? post.author.name : "Unknown Author"}
    </p>

    <hr>

    <p>${post.content}</p>
`;

const postActions = document.getElementById("postActions");

if (postActions) {

    const currentUser = JSON.parse(
        localStorage.getItem("user")
    );

    if (
        currentUser &&
        post.author &&
        currentUser.id === post.author._id
    ) {

        postActions.innerHTML = `
            <button onclick="editPost('${post._id}')">
                Edit Post
            </button>

            <button onclick="deletePost('${post._id}')">
                Delete Post
            </button>
        `;
    }
}

    } catch (error) {

        console.error(error);

        postContainer.innerHTML =
            "<p>Unable to load the post.</p>";
    }
}


// Load comments
async function loadComments() {

    if (!commentsContainer || !postId) {
        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/comments/${postId}`);

        const comments = await response.json();

        if (!response.ok) {
            commentsContainer.innerHTML =
                "<p>Unable to load comments.</p>";
            return;
        }

        if (comments.length === 0) {

            commentsContainer.innerHTML =
                "<p>No comments yet. Be the first to comment!</p>";

            return;
        }

        commentsContainer.innerHTML = "";

        comments.forEach((comment) => {

            const commentElement =
                document.createElement("div");

            commentElement.className = "comment-card";

            commentElement.innerHTML = `
                <p>${comment.content}</p>

                <small>
                    By ${comment.author
                        ? comment.author.name
                        : "Unknown User"}
                </small>

                <br>
                <button onclick="deleteComment('${comment._id}')">
                    Delete
                </button>
            `;

            commentsContainer.appendChild(commentElement);
        });

    } catch (error) {

        console.error(error);

        commentsContainer.innerHTML =
            "<p>Unable to connect to the server.</p>";
    }
}


// Add comment
if (commentForm) {

    commentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token = localStorage.getItem("token");

        const content =
            document.getElementById("commentContent").value;

        const message =
            document.getElementById("commentMessage");


        if (!token) {

            message.textContent =
                "Please login before commenting.";

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        content: content,
                        postId: postId
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                message.textContent =
                    "Comment added successfully!";

                commentForm.reset();

                loadComments();

            } else {

                message.textContent =
                    data.message || "Failed to add comment.";
            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";
        }

    });
}


// Delete comment
async function deleteComment(commentId) {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login first.");

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/comments/${commentId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (response.ok) {

            alert("Comment deleted successfully!");

            loadComments();

        } else {

            alert(data.message || "Unable to delete comment.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");
    }
}


// Load post and comments
loadSinglePost();
loadComments();

// ===============================
// CREATE BLOG POST
// ===============================

const createPostForm = document.getElementById("createPostForm");

if (createPostForm) {

    createPostForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = document.getElementById("postTitle").value;
        const content = document.getElementById("postContent").value;

        const message = document.getElementById("postMessage");

        const token = localStorage.getItem("token");

        // Check login
        if (!token) {
            message.textContent = "Please login before creating a post.";
            return;
        }

        try {

            const response = await fetch(`${API_URL}/posts`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: title,
                    content: content
                })
            });

            const data = await response.json();

            if (response.ok) {

                message.textContent = "Post published successfully!";

                createPostForm.reset();

                // Go to home page after 1 second
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);

            } else {

                message.textContent =
                    data.message || "Failed to publish post.";
            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";
        }
    });
}

// ===============================
// EDIT BLOG POST
// ===============================

const editPostForm = document.getElementById("editPostForm");

if (editPostForm) {

    // Get post ID from URL
    const editUrlParams = new URLSearchParams(window.location.search);
    const editPostId = editUrlParams.get("id");

    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const editMessage = document.getElementById("editMessage");


    // Load existing post
    async function loadPostForEditing() {

        if (!editPostId) {
            editMessage.textContent = "Post ID is missing.";
            return;
        }

        try {

            const response =
                await fetch(`${API_URL}/posts/${editPostId}`);

            const post = await response.json();

            if (!response.ok) {
                editMessage.textContent =
                    post.message || "Unable to load post.";
                return;
            }

            editTitle.value = post.title;
            editContent.value = post.content;

        } catch (error) {

            console.error(error);

            editMessage.textContent =
                "Unable to connect to the server.";
        }
    }


    // Update post
    editPostForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            editMessage.textContent =
                "Please login before editing a post.";
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/posts/${editPostId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title: editTitle.value,
                        content: editContent.value
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                editMessage.textContent =
                    "Post updated successfully!";

                setTimeout(() => {
                    window.location.href =
                        `post.html?id=${editPostId}`;
                }, 1000);

            } else {

                editMessage.textContent =
                    data.message || "Failed to update post.";
            }

        } catch (error) {

            console.error(error);

            editMessage.textContent =
                "Unable to connect to the server.";
        }
    });


    // Load the post
    loadPostForEditing();
}

// Open edit page
function editPost(postId) {
    window.location.href = `edit-post.html?id=${postId}`;
}


// Delete blog post
async function deletePost(postId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Post deleted successfully!");

            window.location.href = "index.html";

        } else {

            alert(data.message || "Unable to delete post.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully!");

    window.location.href = "login.html";
}