const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority = "", status = "" } = request.query;
  const getTodo = `
    SELECT
    *
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}'
    ;`;
  const todoArray = await database.all(getTodo);
  response.send(todoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId};`;
  const todo = await database.get(getTodo);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
    INSERT
    INTO
    todo ( id, todo, priority, status )
    VALUES
    ( ${id}, '${todo}', '${priority}', '${status}')
    ;`;
  await database.run(postQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId}
    ;`;
  const prevTodo = await database.get(getQuery);
  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = request.body;
  const updateTodo = `
    UPDATE
    todo
    SET
    todo ='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE
    FROM
    todo
    WHERE
    id = ${todoId};`;
  await database.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
