from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson import ObjectId, json_util

app = Flask(__name__)

# Connecting to MongoDB
client: MongoClient = MongoClient("mongodb://localhost:27017/")
db = client["flaskTodo_db"]
todos = db["todos"]


@app.route("/")
def hello_world():
    return render_template("index.html")


# Api to Get all Todos from Mongodb
@app.route("/api/todos", methods=["GET"])
def get_todos():
    try:
        all_todos = list(todos.find({}).sort("_id", -1))
        if not (all_todos):
            return {"message": "todos not found"}
        # json_util to serialize MongoDB documents
        return json_util.dumps(all_todos), 200
    except Exception as e:
        return jsonify({"error": e}), 500


# API to add a new todo
@app.route("/api/todos", methods=["POST"])
def add_todo():
    task = request.json
    if task:
        new_todo = task
        todos.insert_one(new_todo)
        return jsonify({"message": "Todo added successfully!"}), 201
    return jsonify({"error": "Task is required"}), 400


# API to Edit a todo's Task
@app.route("/api/editTodo/<id>", methods=["PUT"])
def edit_todo(id):
    task = request.json["task"]
    updated_at = request.json["updated_at"]
    todo = todos.find_one({"_id": ObjectId(id)})
    if todo:
        todos.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": {"task": task, "updated_at": updated_at}}
        )
        return jsonify({"message": "Todo Updated successfully!"}), 201
    return jsonify({"error": "Task is required"}), 400


# API to update a todo's completion status
@app.route("/api/todos/<id>", methods=["PUT"])
def update_todo(id):
    TodoStatus = request.json["completed"]
    updatedAt = request.json["updatedAt"]
    print("-----------", request.json)
    todo = todos.find_one({"_id": ObjectId(id)})
    print(todo)
    if todo:
        todos.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"completed": TodoStatus, "updated_at": updatedAt}},
        )
        return jsonify({"message": "Todo updated successfully!"})
    return jsonify({"error": "Todo not found"}), 404


# API to delete a todo
@app.route("/api/todos/<id>", methods=["DELETE"])
def delete_todo(id):
    result = todos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({"message": "Todo deleted successfully!"})
    return jsonify({"error": "Todo not found"}), 404


# It runs on port 5000
# debug=True is used to automatically reload the server when you make changes to the code
if __name__ == "__main__":
    app.run(debug=True, port=5000)
