from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

# bson is Binary Json for efficient data handling for mongodb
from bson import ObjectId, json_util


# creating new instance of flask app
app = Flask(__name__)

# Connecting to MongoDB
client: MongoClient = MongoClient("mongodb://localhost:27017/")    # MongoClient is a class from PyMongo Library, and it is a python driver for mongodb
db = client["flaskTodo_db"]                   # client object now can be access database and collections
todos = db["todos"]


@app.route("/")                     # when initial render of app it renders the index.html file 
def hello_world():
    return render_template("index.html")


# Api to Get all Todos from Mongodb
@app.route("/api/todos", methods=["GET"])
def get_todos():
    try:
        all_todos = todos.find().sort("_id", -1)        # sort is used to sorting the documents by its id, -1 means newest to oldest and 1 means vice versa
        if not (all_todos):
            return {"message": "todos not found"}
        return json_util.dumps(all_todos), 200
        # json_util to serialize MongoDB documents
    except Exception as e:
        return jsonify({"error": e}), 500


# API to add a new todo
@app.route("/api/todos", methods=["POST"])
def add_todo():
    try:
        task = request.json
        if task:
            new_todo = task
            todos.insert_one(new_todo)                # insert_one method inserts a single object into the database.
            return jsonify({"message": "Todo added successfully!"}), 201           # jsonify converts Python dictionaries into JSON.
    except Exception:
        return jsonify({"error": "Task is required"}), 400


# API to Edit an existing todo's Task by providing Task id and updating Task
@app.route("/api/editTodo/<id>", methods=["PUT"])
def edit_todo(id):
    try:
        task = request.json["task"]
        updated_at = request.json["updated_at"]
        todo = todos.find_one({"_id": ObjectId(id)})
        if todo:
            todos.update_one(
                {"_id": ObjectId(id)},
                # update_one matches the provided id with existing document id in database
                {
                    "$set": {"task": task, "updated_at": updated_at}
                    # $set is an update operator that use to update the field with new value
                },
            )
            return jsonify({"message": "Todo Updated successfully!"}), 201
        else:
            return jsonify({"error": "Task not found by given id"}), 400
    except Exception:
        return jsonify({"error": "Task is required"}), 400


# API to update a todo's completion status
@app.route("/api/todos/<id>", methods=["PUT"])
def update_todo(id):
    try:
        TodoStatus = request.json["completed"]
        updatedAt = request.json["updatedAt"]
        todo = todos.find_one({"_id": ObjectId(id)})
        if todo:
            todos.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"completed": TodoStatus, "updated_at": updatedAt}},
                # here updating the completed status and updated time using $set update operator
            )
            return jsonify({"message": "Todo updated successfully!"})
        else:
            return jsonify({"message": "Todo not Found"})
    except Exception:
        return jsonify({"error": "Todo not found"}), 404


# API to delete a todo
@app.route("/api/todos/<id>", methods=["DELETE"])
def delete_todo(id):
    try:
        result = todos.delete_one({"_id": ObjectId(id)})   #deleted_one is used to delete a single document that matches a query
        #delete_one method returns a result object that contains information about the delete operation, including a property called deleted_count.
        if result.deleted_count > 0:                         
            return jsonify({"message": "Todo deleted successfully!"})
        else:
            return jsonify({"message": "Todo not found"})
    except Exception:
        return jsonify({"error": "Todo not found"}), 404


# It runs on port 5000
# debug=True is used to automatically reload the server when you make changes to the code
if __name__ == "__main__":                     # this block ensures that the app runs only when the app.py file is run directly and not when imported
    app.run(debug=True, port=5000)
