// =========================
// SHOW LOGIN
// =========================

function showLogin() {

    document
        .getElementById("loginSection")
        .classList.remove("hidden");

    document
        .getElementById("registerSection")
        .classList.add("hidden");
}


// =========================
// SHOW REGISTER
// =========================

function showRegister() {

    document
        .getElementById("registerSection")
        .classList.remove("hidden");

    document
        .getElementById("loginSection")
        .classList.add("hidden");
}


// =========================
// REGISTER
// =========================

async function register() {

    const username =
        document.getElementById("registerUsername").value.trim();

    const password =
        document.getElementById("registerPassword").value.trim();


    if (username === "" || password === "") {

        document.getElementById("registerMessage").innerText =
            "Please enter username and password";

        return;
    }


    try {

        const response = await fetch("/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });


        const data = await response.json();


        console.log("REGISTER:", data);


        if (response.ok) {

            document.getElementById("registerMessage").innerText =
                "Registration successful! Please login.";

            document.getElementById("registerUsername").value = "";
            document.getElementById("registerPassword").value = "";

        } else {

            document.getElementById("registerMessage").innerText =
                data.detail || "Registration failed";
        }

    } catch (error) {

        console.error(error);

        document.getElementById("registerMessage").innerText =
            "Server error";
    }
}


// =========================
// LOGIN
// =========================

async function login() {

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value.trim();


    if (username === "" || password === "") {

        document.getElementById("loginMessage").innerText =
            "Please enter username and password";

        return;
    }


    try {

        const response = await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });


        const data = await response.json();


        console.log("LOGIN RESPONSE:", data);


        if (response.ok) {

            console.log("USER ID:", data.user_id);


            // Save user information
            localStorage.setItem(
                "user_id",
                String(data.user_id)
            );

            localStorage.setItem(
                "username",
                data.username
            );


            // Hide login
            document
                .getElementById("loginSection")
                .classList.add("hidden");


            // Hide register
            document
                .getElementById("registerSection")
                .classList.add("hidden");


            // Show todo
            document
                .getElementById("todoSection")
                .classList.remove("hidden");


            // Load todos
            loadTodos();

        } else {

            document.getElementById("loginMessage").innerText =
                data.detail || "Login failed";
        }

    } catch (error) {

        console.error(error);

        document.getElementById("loginMessage").innerText =
            "Server error";
    }
}


// =========================
// ADD TODO
// =========================

async function addTodo() {

    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();


    const userId =
        localStorage.getItem("user_id");


    console.log("ADD TODO USER ID:", userId);


    if (!userId) {

        alert("User ID not found. Please login again.");

        return;
    }


    if (title === "" || description === "") {

        document.getElementById("todoMessage").innerText =
            "Please enter title and description";

        return;
    }


    try {

        // VERY IMPORTANT
        // user_id is sent in URL

        const url =
            "/todo?user_id=" + encodeURIComponent(userId);


        console.log("POST URL:", url);


        const response = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: title,

                description: description,

                completed: false

            })

        });


        const data = await response.json();


        console.log("ADD TODO RESPONSE:", data);


        if (response.ok) {

            document.getElementById("todoMessage").innerText =
                "Todo added successfully";


            document.getElementById("title").value = "";

            document.getElementById("description").value = "";


            loadTodos();

        } else {

            document.getElementById("todoMessage").innerText =
                data.detail || "Failed to add todo";
        }

    } catch (error) {

        console.error(error);

        document.getElementById("todoMessage").innerText =
            "Server error";
    }
}


// =========================
// LOAD TODOS
// =========================

async function loadTodos() {

    const userId =
        localStorage.getItem("user_id");


    console.log("LOAD TODO USER ID:", userId);


    if (!userId) {

        console.log("User ID not found");

        return;
    }


    try {

        // VERY IMPORTANT
        // user_id is sent in URL

        const url =
            "/todo?user_id=" + encodeURIComponent(userId);


        console.log("GET URL:", url);


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log("GET TODO RESPONSE:", data);


        const todoList =
            document.getElementById("todoList");


        todoList.innerHTML = "";


        if (!response.ok) {

            todoList.innerHTML =
                "<p>" +
                (data.detail || "Failed to load todos") +
                "</p>";

            return;
        }


        if (data.length === 0) {

            todoList.innerHTML =
                "<p>No todos found.</p>";

            return;
        }


        data.forEach(function(todo) {

            const div =
                document.createElement("div");


            div.className =
                "todo-item";


            const status =
                todo.completed
                    ? "✅ Completed"
                    : "⏳ Pending";


            div.innerHTML = `

                <h4>${todo.title}</h4>

                <p>${todo.description}</p>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>

                <div class="todo-buttons">

                    <button
                        class="complete"
                        onclick="completeTodo(${todo.id})">
                        Complete
                    </button>

                    <button
                        class="edit"
                        onclick="editTodo(${todo.id})">
                        Edit
                    </button>

                    <button
                        class="delete"
                        onclick="deleteTodo(${todo.id})">
                        Delete
                    </button>

                </div>
            `;


            todoList.appendChild(div);

        });


    } catch (error) {

        console.error(error);

        document.getElementById("todoList").innerHTML =
            "<p>Unable to load todos.</p>";
    }
}


// =========================
// COMPLETE TODO
// =========================

async function completeTodo(id) {

    const userId =
        localStorage.getItem("user_id");


    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                "/todo/" +
                id +
                "?user_id=" +
                encodeURIComponent(userId)
            );


        const todo =
            await response.json();


        if (!response.ok) {

            alert(
                todo.detail ||
                "Todo not found"
            );

            return;
        }


        const updateResponse =
            await fetch(
                "/todo/" +
                id +
                "?user_id=" +
                encodeURIComponent(userId),
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        title: todo.title,

                        description: todo.description,

                        completed: true

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (!updateResponse.ok) {

            alert(
                updateData.detail ||
                "Failed to complete todo"
            );

            return;
        }


        loadTodos();


    } catch (error) {

        console.error(error);

        alert("Server error");
    }
}


// =========================
// EDIT TODO
// =========================

async function editTodo(id) {

    const userId =
        localStorage.getItem("user_id");


    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                "/todo/" +
                id +
                "?user_id=" +
                encodeURIComponent(userId)
            );


        const todo =
            await response.json();


        if (!response.ok) {

            alert(
                todo.detail ||
                "Todo not found"
            );

            return;
        }


        const newTitle =
            prompt(
                "Enter new title:",
                todo.title
            );


        if (newTitle === null) {
            return;
        }


        const newDescription =
            prompt(
                "Enter new description:",
                todo.description
            );


        if (newDescription === null) {
            return;
        }


        const updateResponse =
            await fetch(
                "/todo/" +
                id +
                "?user_id=" +
                encodeURIComponent(userId),
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        title: newTitle,

                        description: newDescription,

                        completed: todo.completed

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (!updateResponse.ok) {

            alert(
                updateData.detail ||
                "Failed to update todo"
            );

            return;
        }


        loadTodos();


    } catch (error) {

        console.error(error);

        alert("Server error");
    }
}


// =========================
// DELETE TODO
// =========================

async function deleteTodo(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this todo?"
        );


    if (!confirmDelete) {
        return;
    }


    const userId =
        localStorage.getItem("user_id");


    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                "/todo/" +
                id +
                "?user_id=" +
                encodeURIComponent(userId),
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete todo"
            );

            return;
        }


        loadTodos();


    } catch (error) {

        console.error(error);

        alert("Server error");
    }
}


// =========================
// LOGOUT
// =========================

function logout() {

    localStorage.removeItem("user_id");

    localStorage.removeItem("username");


    document
        .getElementById("todoSection")
        .classList.add("hidden");


    document
        .getElementById("loginSection")
        .classList.remove("hidden");


    document.getElementById(
        "loginUsername"
    ).value = "";


    document.getElementById(
        "loginPassword"
    ).value = "";
}