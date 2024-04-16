import express from 'express';
import { Todo, TodoItems, User, SharedTodoList_Out, Completed_By_User } from './todos';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

   
const app = express();
app.use(express.json());
const key = "MyKey";

let todos: Todo[] = [];
let todoItems: TodoItems[] = [];
let users: User[] = [];
let sharedTodoList_Out: SharedTodoList_Out[] = [];
let completed_By_User: Completed_By_User;

//hashes password input by user - completed
function hashMyPassword(password: string){
    const salt = bcrypt.genSaltSync(2);
    return bcrypt.hashSync(password, salt);
}//end hash password function

//validates that existing email does not exist/exists (boolean return) - completed
function findMatchingEmail(inputEmail: string, storedEmails: User[]){
    for (let i = 0; i < storedEmails.length; i++) {
        if (storedEmails[i].email === inputEmail) {
            return true;
        }
    }
    return false; 
}// end function to find matching email/username

//map token to existing userID by returning userID in this function - completed
function validateTokenUser(token: string, users: User[]) {
    let parsedToken = token.split(' ')[1];
            
    if (jwt.verify(parsedToken, key)) {
        let tokenEmail = jwt.verify(parsedToken, key) as {email: {email: string}};
        let destructuredEmail = tokenEmail.email as string | Object;
       
        for (let i = 0; i < users.length; i++) {
            console.log("Token, email", destructuredEmail);
            console.log("User index email", users[i].email);
            if (users[i].email === destructuredEmail) {
                return users[i].id; 
            }
        }
    }
    return -100;
}

//creates new user - completed
app.post('/user/', (req,res) => {
    
    let id = users.length +1;
    let email = req.body.email;
    let password = req.body.password
    let name = req.body.name;
    let newUser= {id:id,email:email, password:password, name:name};
    //check if email entered already exists
    let matchingEmail = findMatchingEmail(email, users);

    if(email == undefined || password == undefined || name == undefined){
        res.status(400).send({message: "Object properties undefined"});
    }//end if statement
    else if(matchingEmail == true){
        res.status(400).send({status: 400, message: "Email already exists"});
    }//end else if statement
    else{
        users.push({id:id, email:email, password: hashMyPassword(password), name:name});
        console.log(users)
        res.status(201).send({id: newUser.id, email: newUser.email, name: newUser.name}); 
    }//end else statement
})//end create user

//login for user - generates a auth token with email as parameter - COMPLETED
app.post('/user/login', (req, res) => {

    let username ="";
    let password ="";

    if (req.headers["authorization"]) {
        let userInfo = req.headers["authorization"].split(" ")[1]; //Base 64 Encoded
        let decodedUserInfo = atob(userInfo);
        username = decodedUserInfo.split(":")[0];
        password = decodedUserInfo.split(":")[1];
      }

    if(username == undefined || password == undefined){
        res.status(401).send({message: "Object properties undefined"});
        return;
    }//end if statement 
    else{
        for(let i = 0; i < users.length; i++){
            if(users[i].email == username){
                if(bcrypt.compareSync(password, users[i].password)){
                    const token = jwt.sign({email: users[i].email}, key);
                    console.log(token);
                    res.status(200).send({token: token});
                    return;
                }//end if statement
                else{
                    res.status(401).send({message: "Invalid Login Credentials"});
                    return;
                }//end else statement
            }//end if statement
        }//end for loop
        res.status(401).send({message: "Invalid Login Credentials"});
    }//end else statement
})//end user login post

//allows update to user information - COMPLETED
app.patch('/user/', (req,res)=>{
    // have to set the req.headers as string because of typescript validation that it is not []
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    if(!token){
        res.status(401).send({message: "No Token", status: 401});
        return;
    }//end if statement to check if token exists
    else{
        try{
            let parsedToken = token.split(' ')[1];
            
            if(jwt.verify(parsedToken, key)){
                
                let tokenEmail = jwt.verify(parsedToken, key) as {email:{email: string}};
                let destructuredEmail = tokenEmail.email as string | Object;
                

                for(let i = 0; i < users.length; i++){
                 
                    if(users[i].email == destructuredEmail){
                        //create new user object with properties of existing user data
                        let newUser = {...users[i]};
                        
                        //logically check if request body is valid. if yes, set newUser properties = to request body property
                        if(req.body.email){
                            newUser.email = req.body.email;
                        }
                        if(req.body.password){
                            newUser.password = hashMyPassword(req.body.password);
                        }
                        if(req.body.name){
                            newUser.name = req.body.name;
                        }

                        let emailExists = findMatchingEmail(newUser.email, users);
                        console.log("Email Exists: ", emailExists);

                        //we are checking is email is not matching to a current users email 
                        //OR if current email matching the newUser email then update new User
                        if(emailExists == false || newUser.email == users[i].email){
                            users[i] = newUser;
                            res.status(200).send({id: users[i].id, email: users[i].email, name: users[i].name});
                            return;
                        }//end if statement
                        else{
                            res.status(400).send({status: 400, message: "Email already exists"});
                            return;
                        }//end else statement
                        
                    }//end if statement
            }//end forloop
                }//end check for jwt to be valid
            return res.status(401).send({message: "Token is not authorized for this user"});
        }//end try statement
        catch(e){
            res.status(401).send({message: "Unauthorized"});
            return;
        }//end catch jwt not valid
    }//end else - token does exist
})//end update user

//post todo list item - validates that authentication exists and maps created by to that auth token - COMPLETED
app.post('/todo', (req, res) => {

    let title: string = req.body.title;

    let created_at = new Date();

    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    let public_list = req.body.public_list

    let id = todos.length +1;

    let list_items :TodoItems[]=[];

    let shared_list: SharedTodoList_Out[] = [];

    if(!token){
        res.status(401).send({ status: 401, message: "No Token"});
        return;
    }//end if statement to check if token exists
    else if(public_list == undefined || title == undefined){
        console.log("Here", public_list, title)
        return res.status(400).send({status: 400, message: "Missing properties"})
    }
    else{
        try{
            let parsedToken = token.split(' ')[1];

            if(jwt.verify(parsedToken, key)){

                let tokenEmail = jwt.verify(parsedToken, key) as {email:{email: string}};
                let destructuredEmail = tokenEmail.email as string | Object;

                for(let i = 0; i<users.length; i++){
                    if(users[i].email == destructuredEmail){
                        let created_by =  users[i].id;
                        let newTodo: Todo = {id:id,title:title,created_at:created_at, created_by: created_by, public_list:public_list, list_items:list_items, shared_with:shared_list};
                        todos.push(newTodo);
                        return res.status(201).send(newTodo);
                    }//end if statement
                }
            }
            return res.status(401).send({message: "Token is not authorized for this user"});
        }//end try statement
        catch(e){
            return res.status(401).send({message: "Unauthorized"});
        }//end catch jwt not valid
    }//end else - token does exist
    
})//end todo list post

//allows sharing of list by created by owner - COMPLETED
app.post('/todo/:list_id/share', (req, res) => {
    try {
        let list_id = req.params.list_id;
        let email = req.body.email;
        let name = req.body.name;
        let userExists = false;

        // Verify that editing user is owner of record
        let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

        if(token == undefined){
            return res.status(401).send({status: 401, message: "No Token"});
        }

        if (!token) {
            res.status(401).send({status: 401, message: "No Token"});
            return;
        } else {
            let parsedToken = token.split(' ')[1];
            if (jwt.verify(parsedToken, key)) {
                let tokenEmail = jwt.verify(parsedToken, key) as {email: {email: string}};
                let destructuredEmail = tokenEmail.email as string | Object; 
                // Find user in user list to extract user id
                let created_by;
                for (let j = 0; j < users.length; j++) {
                    if (users[j].email == destructuredEmail) {
                        created_by = users[j].id;
                        userExists = true;
                        break; // Exit loop once user is found
                    }
                }
                if (!userExists) {
                    res.status(404).send({status: 404, message: "User not found"});
                    return;
                }

                // Verify that user sharing list is authorized as "created by" user
                let listFound = false;
                for (let i = 0; i < todos.length; i++) {
                    if (todos[i].id == parseInt(list_id) && todos[i].created_by == created_by) {
                        let token_user_id = validateTokenUser(token, users);
                        let newSharedUser: SharedTodoList_Out = {id:token_user_id, title: todos[i].title, email: email, name: name};
                        todos[i].shared_with.push(newSharedUser);
                        listFound = true;
                        res.status(201).send(todos[i]);
                        return;
                    }
                }
                if (!listFound) {
                    res.status(403).send({status: 403, message: "List not found or user is not authorized to share this list"});
                }
            } else {
                res.status(401).send({message: "Invalid Token"});
            }
        }
    } catch(error) {
        res.status(401).send({message: "Failed to send"});
    }
});

app.delete('/todo/:list_id/share', (req, res)=>{
    let list_id = req.params.list_id;
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    if(token == undefined){
        return res.status(401).send({status: 401, message: "No Token"});
    }
    else{
        try{
            let token_user_id = validateTokenUser(token, users);
            for(let i = 0; i < todos.length; i++){
                if(todos[i].id == parseInt(list_id ) && todos[i].created_by == token_user_id){
                    todos[i].shared_with.splice(0, todos[i].shared_with.length);
                    return res.status(204).send({status: 204, message: "Successfully deleted shared users"});
                }
            }
            return res.status(403).send({status: 403, message: "List not found"});
        }
        catch(error){
            res.status(500).send({status: 500, message: "Failed to delete shared user"});
        }
    
    }

})

//deletes a shared user from list by email parameter - COMPLETED
app.delete('/todo/:list_id/share/:shared_email', (req, res)=>{

    let list_id = req.params.list_id;
    let shared_user_email = req.params.shared_email;
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    try{
        if(token){
            let created_by = validateTokenUser(token, users)

            for(let i = 0; i < todos.length; i++){
                //check that user deleting shared list is owner of the list
                if(todos[i].created_by == created_by){
                    for(let k = 0; k < todos[i].shared_with.length; k++){
                        if(todos[i].shared_with[k].email == shared_user_email){
                            todos[i].shared_with.splice(k,1);
                            return res.status(204).send({message:"Successfully removed shared user"});
                        }//end check for shared email matching input parameter (email)
                    }//end loop through shared with array
                }//end if statement to check if user/token match
            }//end loop through todos list
            return res.status(404).send({status: 404, message:"Shared user not found"});
        }//end token check
        else{
            res.status(401).send({status: 401, message: "No Token"});
        }
    }//end try statement
    catch(error){
        return res.status(401).send({status: 401, message: "Unable to delete user"});
    }//end catch

})//end delete user on shared list

//post todo item to a todo list item by todo ID - COMPLETED
app.post('/todo/:list_id/item', (req, res)=> {

    
    let task = req.body.task;
    let created_at = new Date();    
    let updated_at = new Date();
    let due_date = new Date();
    let list_id:number = parseInt(req.params.list_id);
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    let completed_date = new Date();

    
    if(token == undefined){
        return res.status(401).send({status: 401, message: "No Token"});
    }
    if(!task){
        return res.status(400).send({status: 400, message: "Task is required"});
    }

    try{
        if(token){
            let token_user_id = validateTokenUser(token, users);
            let name = "";
            let email = "";
            for(let user of users){
                if(token_user_id == user.id){
                    name = user.name;
                    email = user.email;
                }
            }
            //look for todo list by id
            for(let i = 0; i < todos.length; i++){
                //check for owner of todo item = to token user 
                if((todos[i].id == list_id) && (todos[i].created_by == token_user_id)){
                        let id = todos[i].list_items.length + 1;
                        let newTodoItem: TodoItems = {id:id,task:task,completed:false,completed_date: completed_date, created_at:created_at,updated_at:updated_at,list_id: list_id,due_date:due_date,completed_by_user:{email: email, name: name}};
                        todos[i].list_items.push(newTodoItem);
                        console.log(todos[i].created_by);
                        console.log(token_user_id);
                        return res.status(201).send(newTodoItem);
                 }//end check for todo list by id
            }//end for loop through todo list;
        }
        return res.status(403).send({status: 403, message: "Unauthorized"});
    }
    catch(error){
        return res.status(500).send({message: "Failure occured"});
    }
});//end post todo item to a todo list by todo ID


app.patch('/todo/:list_id/item/:item_id', (req, res) => {
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    let list_id = req.params.list_id;
    let item_id = req.params.item_id;

    let task = req.body.task;
    let completed = req.body.completed;

    try{
        if(token == undefined){
            return res.status(401).send({status: 401, message: "No Token"});
        }
        else{
            let token_user_id = validateTokenUser(token, users);
            for(let i = 0; i < todos.length; i++){
                if(todos[i].id == parseInt(list_id)){
                    if(todos[i].created_by == token_user_id){
                        for(let j = 0; j < todos[i].list_items.length; j++){
                            if(todos[i].list_items[j].id == parseInt(item_id)){
                                if(req.body.task){
                                    todos[i].list_items[j].task = task;
                                }
                                if(req.body.completed){
                                    todos[i].list_items[j].completed = completed;
                                }
                                return res.status(204).send(todos[i].list_items[j]);
                            }

                        }
                    }
                }
                else{
                    return res.status(401).send({status: 401, message: "Parent list not found"});
                }
            }

            }
            
    
        }

    catch(error){
        res.status(500).send({status: 500, message: "Failure occured"});
    }
})   

// patch to do list item - allows you to edit existing to do list etem
app.patch('/todo/:list_id', (req, res) => {
    //get list id
    let list_Id = req.params.list_id;
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    //send new title of todo list item
    let title = req.body.title;
    let status = req.body.public_list

    if(token == undefined){
        return res.status(401).send({status: 401, message: "Forbidden"});
    }
    try{
        let token_user_id = validateTokenUser(token, users);
        for(let i = 0; i < todos.length; i++){
            if(todos[i].id == parseInt(list_Id)){
                if(todos[i].created_by == token_user_id){
                    let updatedTodo = {...todos[i]};

                    if(req.body.title){
                        updatedTodo.title = title; 
                    }
                    if(req.body.public_list){
                        updatedTodo.public_list = req.body.public_list;
                    }

                    todos[i] = updatedTodo;
                    return res.status(204).send(updatedTodo); 

                }//end created by
            }
        }
        return res.status(404).send({status:404,message: "Forbidden"});
    }
    catch{
        return res.status(404).send({status: 404, message: "Unauthorized"});
    }
})//end todo patch

// script is looking for an item by ID ; however, this route is only valid when you actually pass an ID here.. Very confused. 
app.get('/todo/:list_id/item/', (req, res) => {
    
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string

    if(token == undefined){
        return res.status(404).send({status: 404, message: "Forbidden"});
    }
    else{
        return res.status(400).send({ status: 400, message: "Item ID is missing" });
    }
    
    
});

//get list item by id - COMPLETED
app.get('/todo/:list_id/item/:item_id', (req,res)=>{
    //get the list/item id from url params
    let list_id = req.params.list_id;
    let item_id = req.params.item_id;
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    
    if(!item_id){
        return res.status(400).send({status: 400, message: "Bad Request"});
    }

    if(token == undefined){
        return res.status(403).send({status: 403, message: "Forbidden"});
    }

    try{
        let parsedToken = token.split(' ')[1];
        if(token){
            let token_user_id = validateTokenUser(token, users);

            for(let i = 0; i < todos.length; i++){
                if((parseInt(list_id) == todos[i].id) && (todos[i].created_by == token_user_id || todos[i].public_list == true)){
                    for(let j = 0; j < todos[i].list_items.length; j++){
                        if(todos[i].list_items[j].id == parseInt(item_id)){
                            console.log("List is public or requester created todo")
                            return res.status(200).send(todos[i].list_items[j]);
                        }
                    }
                }
                else{
                    let tokenEmail = jwt.verify(parsedToken, key) as {email: {email: string}};
                    let destructuredEmail = tokenEmail.email as string | Object;
                    
                    for(let j = 0; j < todos[i].shared_with.length; j++){
                        if(todos[i].shared_with[j].email == destructuredEmail){
                            return res.status(200).send(todos[i].list_items[j]);
                        }
                    }
                }
                
            }//end loop through todos
            return res.status(404).send({status: 404, message: "No Lists Found"});
        }
        return res.status(404).send({status: 404, message: "Unauthorized"});

    }
    catch(error){
        res.status(500).send({message: "Failure occured"});
    }
})//end get list item by id



//get todo items by todo list ID - COMPLETED
app.get('/todo/:list_id/items', (req, res) => {

    //set list id = to the list id requested
    let list_id = req.params.list_id;
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    if(token == undefined){
        return res.status(404).send({status: 404, message: "No Token"});
    }    
    try{
        let parsedToken = token.split(' ')[1];
        let token_user_id = validateTokenUser(token, users)
        if(token){
            for(let i = 0; i < todos.length; i++){
                if((todos[i].id == parseInt(list_id)) && ((todos[i].created_by == token_user_id || todos[i].public_list == true))){
                    return res.status(200).send(todos[i].list_items);
                }
                else{
                    let tokenEmail = jwt.verify(parsedToken, key) as {email: {email: string}};
                    let destructuredEmail = tokenEmail.email as string | Object;
                    for(let j = 0; j < todos[i].shared_with.length; j++){
                        if(todos[i].shared_with[j].email === destructuredEmail){
                           return res.status(200).send(todos[i].list_items);
                        }//end check for shared list email = to authentication token email
                    }
                }
            }//end for loop through todos
        }//end token check
        return res.status(404).send({status: 404, message: "Unauthorized"});
    }
    catch(error){
        res.status(500).send({status: 404, message: "Failure occured"});
    }
});//end get todo items by todo list ID


//get todo list by id for authenticated users - COMPLETED
app.get('/todo/:list_id', (req, res) => {
    
    //takes in params for list_id
    let list_Id = req.params.list_id;
    let parsedToken = "";
    //validate token credentials
    let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;
    if(token == undefined){
        return res.status(401).send({status: 401,message: "No Token"});
    }else{
        parsedToken = token.split(' ')[1];
    }
    

    //sets variable = users id that has matching email as token
    let created_by = validateTokenUser(token, users)
    try{
            if(token){

                for(let i = 0; i<todos.length; i++){
                    if(todos[i].id == parseInt(list_Id)){
                        if(todos[i].created_by == created_by || todos[i].public_list == true){
                            return res.send(todos[i]);
                            
                        }
                        else{
                            let tokenEmail = jwt.verify(parsedToken, key) as {email: {email: string}};
                            let destructuredEmail = tokenEmail.email as string | Object;
                            for(let j = 0; j < todos[i].shared_with.length; j++){
                                if(todos[i].shared_with[j].email === destructuredEmail){
                                   return res.send(todos[i]);
                                }//end check for shared list email = to authentication token email
                            }//end for loop
                            return res.status(400).send({message: "No List Found"});
                        }//end if statement when checking for a token
                    }//end try statement
                }//end todos for loop
                    
            }//end if statement
            else{
            res.status(404).send({status: 404, message: "No Token to Authenticate"});
            }
        }//end try
        catch(error){
            res.status(401).send({message: "Failed to send todo list by id"});
        }//end catch
})//end get todo list by id

//get all todo list items - COMPLETED
app.get('/todo/', (req, res) => {

  let token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

  if(token == undefined){
    let public_lists = [];
    for(let i = 0; i < todos.length; i++){
        if(todos[i].public_list == true){
            public_lists.push(todos[i]);          
        }
    }
    return res.status(200).send(public_lists);
  }

  let token_user_id = validateTokenUser(token, users);

  try{
        
        let authorized_list = [];
        for(let i = 0; i < todos.length; i++){
            if((todos[i].created_by === token_user_id || todos[i].public_list === true)){
                console.log(authorized_list);
                authorized_list.push(todos[i]);
            }
        }
        console.log(authorized_list);
        return res.status(200).send(authorized_list);
  }
  catch (error){
    res.status(500).send({status: 500, message: "Failure occured"})
  }
    
})//end get method

//delete to do list item by id
app.delete('/todo/:list_id/item/:item_id', (req,res) =>{

    let list_id = req.params.list_id;
    let item_id = req.params.item_id;
    const token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    if(token == undefined){
        return res.status(403).send({status: 403, message: "Forbidden"});
    }
    else{
        let token_user_id = validateTokenUser(token, users);
        for(let i=0; i < todos.length; i++){
            if((todos[i].id == parseInt(list_id)) && todos[i].created_by == token_user_id){
                for(let j = 0; j < todos[i].list_items.length; j++){
                    if(todos[i].list_items[j].id == parseInt(item_id)){
                        todos[i].list_items.splice(j, 1);
                        res.status(200).send({message: "Deleted todo item:", item_id});
                        return;
                    }//end if statement
                }//end inner forloop
                res.status(404).send({message: "Todo Item Not Found"});
                return;
            }//end if statement
            res.status(404).send({message: "Todo List Not Found"});
            return; 
        }//end outer forloop
    }

    
    

    //find the todo list by id
    for(let i=0; i < todos.length; i++){
        if(todos[i].id == parseInt(list_id)){
            for(let j = 0; j < todos[i].list_items.length; j++){
                if(todos[i].list_items[j].id == parseInt(item_id)){
                    todos[i].list_items.splice(j, 1);
                    res.status(200).send({message: "Deleted todo item:", item_id});
                    return;
                }//end if statement
            }//end inner forloop
            res.status(404).send({message: "Todo Item Not Found"});
            return;
        }//end if statement
        res.status(404).send({message: "Todo List Not Found"});
        return; 
    }//end outer forloop

});//end delete to do list item by id

app.delete('/todo/:list_id', (req, res) => {
    // Get list id to remove
    const listId = req.params.list_id;
    const token = req.headers['authorization'] as string || req.headers['Authorization'] as string;

    if(token == undefined){
        return res.status(403).send({status: 403, message: "Forbidden"});
    }

    try{
        let token_user_id = validateTokenUser(token, users);
        for(let i = 0; i < todos.length; i++){
            if(todos[i].id == parseInt(listId)){
                if(todos[i].created_by == token_user_id){
                    todos.splice(i, 1);
                    res.status(200).send({status: 200, message: "Deleted todo list:", listId});
                    return;
                }
                else{
                    res.status(401).send({status: 401, message: "Unauthorized"});
                    return;
                }
            }
        }
        res.status(404).send({message: "Todo List Not Found"});
    }
    catch(error){
        res.status(500).send({status: 500, message: "Failure occured"});
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});