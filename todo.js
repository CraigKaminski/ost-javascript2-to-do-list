// To do list application with Search (from the Strings lab)
// You can use this code as your starting point, or continue with
// your own code.
//
function Todo(id, task, who, dueDate, latitude, longitude) {
    this.id = id;
    this.task = task;
    this.who = who;
    this.dueDate = dueDate;
    this.done = false;
    this.latitude = latitude;
    this.longitude = longitude;
}

var todos = new Array();
// Added map variable to hold a reference to the Google map.
var map = null;

function init() {
    var submitButton = document.getElementById("submit");
    submitButton.onclick = getFormData;

    // get the search term and call the click handler
    var searchButton = document.getElementById("searchButton");
    searchButton.onclick = searchTodos;

    getTodoItems();
}

function addTodosToPage() {
    var ul = document.getElementById("todoList");
    var listFragment = document.createDocumentFragment();
    for (var i = 0; i < todos.length; i++) {
        var todoItem = todos[i];
        var li = createNewTodo(todoItem);
        listFragment.appendChild(li);
    }
    ul.appendChild(listFragment);
}

function addTodoToPage(todoItem) {
    var ul = document.getElementById("todoList");
    var li = createNewTodo(todoItem);
    ul.appendChild(li);
    document.forms[0].reset();
}

function createNewTodo(todoItem) {
    var li = document.createElement("li");
    li.setAttribute("id", todoItem.id);

    // Added span element to contain the location.
    // The element will be displayed if location
    // coordinates are obtained.
    var spanLocation = document.createElement("span");
    spanLocation.setAttribute("class", "location");
    if (todoItem.latitude == null || todoItem.longitude == null) {
        spanLocation.style.display = "none";
    }
    else {
        spanLocation.innerHTML =
            "(" + todoItem.latitude + ", " + todoItem.longitude + ") ";
    }

    var spanTodo = document.createElement("span");
    spanTodo.innerHTML =
        todoItem.who + " needs to " + todoItem.task + " by "
            + todoItem.dueDate + " (" + daysFromNow(todoItem.dueDate) + ")";

    var spanDone = document.createElement("span");
    if (!todoItem.done) {
        spanDone.setAttribute("class", "notDone");
        spanDone.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }
    else {
        spanDone.setAttribute("class", "done");
        spanDone.innerHTML = "&nbsp;&#10004;&nbsp;";
    }

    // add the click handler to update the done state
    spanDone.onclick = updateDone;

    // add the delete link
    var spanDelete = document.createElement("span");
    spanDelete.setAttribute("class", "delete");
    spanDelete.innerHTML = "&nbsp;&#10007;&nbsp;";

    // add the click handler to delete
    spanDelete.onclick = deleteItem;

    li.appendChild(spanDone);
    li.appendChild(spanLocation);
    li.appendChild(spanTodo);
    li.appendChild(spanDelete);

    return li;
}

function getFormData() {
    var task = document.getElementById("task").value;
    if (checkInputText(task, "Please enter a task")) return;

    var who = document.getElementById("who").value;
    if (checkInputText(who, "Please enter a person to do the task")) return;

    var date = document.getElementById("dueDate").value;
    if (checkInputText(date, "Please enter a due date")) return;

    // Allow date to be added with hyphens or dashes.
    date = date.replace("-", "/");
    // Try to parse date and if the parse fails, alert the user.
    try {
        if (isNaN(Date.parse(date))) {
            throw new Error("Date format error. Please enter the date in the format MM/DD/YYYY, YYYY/MM/DD, or January 1, 2012");
        }
        else {
            date = (new Date(Date.parse(date))).toDateString();
        }
    }
    catch (ex) {
        alert(ex.message);
        return;
    }

    var id = (new Date()).getTime();
    var todoItem = new Todo(id, task, who, date, null, null);
    todos.push(todoItem);
    addTodoToPage(todoItem);
    getLocation();
    saveTodoItem(todoItem);

    // hide search results
    hideSearchResults();
}

function checkInputText(value, msg) {
    if (value == null || value == "") {
        alert(msg);
        return true;
    }
    return false;
}

function updateDone(e) {
    var span = e.target;
    var id = span.parentElement.id;
    var item;
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            item = todos[i];
            break;
        }
    }
    if (item.done == false) {
        item.done = true;
        span.setAttribute("class", "done");
        span.innerHTML = "&nbsp;&#10004;&nbsp;";
    }
    else if (item.done == true) {
        item.done = false;
        span.setAttribute("class", "notDone");
        span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }

    // Replaced code to update done state of todo item in
    // localStorage with a function so we could use Modernizr
    // to support browers without localStorage.
    saveTodoItem(item);
}

// This function is used to update the location information
// in the array of todos, the location span element, and
// local storage
function updateLocation(id, latitude, longitude) {
    var item;
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            item = todos[i];
            break;
        }
    }

    item.latitude = latitude;
    item.longitude = longitude;

    var spanLocation = document.getElementById(id).querySelector(".location");
    spanLocation.innerHTML = "(" + item.latitude + ", " + item.longitude + ") ";
    spanLocation.style.display = "inline";

    saveTodoItem(item);
}

function deleteItem(e) {
    var span = e.target;
    var id = span.parentElement.id;

    // find and remove the item in localStorage
    removeTodoItem(id);

    // find and remove the item in the array
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            todos.splice(i, 1);
            break;
        }
    }

    // find and remove the item in the page
    var li = e.target.parentElement;
    var ul = document.getElementById("todoList");
    ul.removeChild(li);

    // hide search results
    hideSearchResults();
}

// Search
function searchTodos() {
    // new search, so clear previous results
    clearSearchResultsList();
    // get the text to search for
    var searchTerm = document.getElementById("searchTerm").value;
    var count = 0;
    // check all the todos in the list
    for (var i = 0; i < todos.length; i++) {
        var todoItem = todos[i];
        // make a regular expression to match the search term, regardless of case
        var re = new RegExp(searchTerm, "i");
        // try matching the expression with the task and the who from the to do item
        // in this case, we don't need the match results array; we just need to know
        // it exists for this to do item. If there is no match results, then the
        // result of match is null, so the "if" test will fail.
        if (todoItem.task.match(re) || todoItem.who.match(re)) {
            // if we find a match, add the to do item to the search results
            addSearchResultToPage(todoItem);
            // keep a count of the number of items we match
            count++;
        }
    }
    // if we don't match any items, display "no results" in the search results list
    if (count == 0) {
        var ul = document.getElementById("searchResultsList");
        var li = document.createElement("li");
        li.innerHTML = "No results!";
        ul.appendChild(li);
    }
    // show the search results
    showSearchResults();
}

// add a search result to the search results list in the page
function addSearchResultToPage(todoItem) {
    var ul = document.getElementById("searchResultsList");
    var li = document.createElement("li");
    li.innerHTML =
        todoItem.who + " needs to " + todoItem.task + " by " + todoItem.dueDate;
    ul.appendChild(li);
}

// clear the previous search results by removing all the children of the "searchResultsList" ul element
function clearSearchResultsList() {
    var ul = document.getElementById("searchResultsList");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}

// This is just a nifty trick to show/hide the search results, so we don't show anything
// unless the user's just searched. Extra credit! :-)
function hideSearchResults() {
    var div = document.getElementById("searchResults");
    div.style.display = "none";
    clearSearchResultsList();
}

function showSearchResults() {
    var div = document.getElementById("searchResults");
    div.style.display = "block";
    document.forms[0].reset();
}

// This calculates how many days until a task is supposed
// to be done or how many days a task is overdue.
function daysFromNow(dueDate) {
    // Get the current time and date
    var now = new Date();
    // Get milliseconds from 1-1-1970 to due date
    var due = Date.parse(dueDate);
    // find milliseconds between now and due date
    var diff = due - now.getTime();
    // convert milliseconds to days
    var days = diff / 1000 / 60 / 60 / 24;

    if (days > 0) {
        return Math.ceil(days) + " days";
    } else if (days > -1 && days <= 0) {
        return "today";
    } else {
        return "OVERDUE by " + Math.abs(Math.ceil(days)) + " days";
    }
}