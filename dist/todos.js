"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = exports.TodoItems = exports.Completed_By_User = exports.SharedTodoList_Out = exports.User = void 0;
class User {
    id = 1;
    email = '';
    password = '';
    name = '';
    constructor(email, password, name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }
} //end user class
exports.User = User;
class SharedTodoList_Out {
    id = 0;
    title = '';
    email = '';
    name = '';
    constructor(id, title, email, name) {
        this.id = id;
        this.title = title;
        this.email = email;
        this.name = name;
    }
} //end class for shared todo list users
exports.SharedTodoList_Out = SharedTodoList_Out;
class Completed_By_User {
    email = '';
    name = '';
    constructor(email, name) {
        this.email = email;
        this.name = name;
    }
}
exports.Completed_By_User = Completed_By_User;
class TodoItems {
    id = 0;
    task = '';
    completed_date = new Date();
    completed = false;
    created_at = new Date();
    updated_at = new Date();
    due_date = new Date();
    list_id = 0;
    completed_by_user;
    constructor(task, completed, completed_date, created_at, updated_at, due_date, list_id, completed_by_user) {
        this.task = task;
        this.completed = completed;
        this.created_at = new Date();
        this.updated_at = new Date();
        this.due_date = new Date();
        this.list_id = list_id;
        this.completed_by_user = completed_by_user;
        // this.id = 0;
    }
} //end TodoItems   
exports.TodoItems = TodoItems;
class Todo {
    id = 0;
    title = '';
    created_at = new Date();
    created_by = 0;
    public_list = true;
    list_items = []; // Array of TodoItems
    shared_with = []; // Array of Users to Share
    constructor(title, list_items, public_list, shared_with, created_by) {
        this.title = title;
        this.list_items = list_items;
        this.created_at = new Date();
        this.created_by = created_by;
        this.public_list = public_list;
        this.shared_with = shared_with;
    }
}
exports.Todo = Todo;
