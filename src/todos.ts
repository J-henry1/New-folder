export class User {
    id: number = 1;
    email: string = '';
    password: string = '';
    name: string = '';
    
    constructor(email: string, password: string, name: string) {
        this.email = email;
        this.password = password;
        this.name = name;
    }
}//end user class

export class SharedTodoList_Out{
    id: number = 0;
    title: string = ''; 
    email: string = '';
    name: string = '';

    constructor(id: number, title: string, email: string, name: string){
        this.id = id;
        this.title = title;
        this.email = email;
        this.name = name;
    }

}//end class for shared todo list users

export class Completed_By_User{
    email: string = '';
    name: string = '';

    constructor(email:string, name: string){
        this.email = email;
        this.name = name;
    }
}

export class TodoItems {
    id: number = 0;
    task: string = '';
    completed_date: Date = new Date();
    completed: boolean = false;
    created_at: Date = new Date();
    updated_at: Date = new Date();
    due_date: Date = new Date();
    list_id: number = 0;
    completed_by_user: Completed_By_User;

    constructor(task: string, completed: boolean, completed_date: Date, created_at: Date, updated_at: Date, due_date: Date, list_id: number, completed_by_user: Completed_By_User) {
        this.task = task;
        this.completed = completed;
        this.created_at = new Date();
        this.updated_at = new Date();
        this.due_date = new Date();
        this.list_id = list_id;
        this.completed_by_user = completed_by_user;
        // this.id = 0;
    }
}//end TodoItems   
export class Todo {
    id: number = 0;
    title: string = '';
    created_at: Date = new Date();
    created_by: number = 0;
    public_list: boolean = true;
    list_items: TodoItems[] = []; // Array of TodoItems
    shared_with: SharedTodoList_Out[] = []; // Array of Users to Share

    constructor(title: string, list_items: TodoItems[], public_list: boolean, shared_with: SharedTodoList_Out[], created_by: number) {
        this.title = title;
        this.list_items = list_items;
        this.created_at = new Date();
        this.created_by = created_by;
        this.public_list = public_list;
        this.shared_with = shared_with;
    }
}