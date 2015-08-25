// This function was moved from todo.js and the logic to determine
// if localStorage is supoorted was removed since Modernizr is
// making the determination for us.
function getTodoItems() {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.substring(0, 4) == "todo") {
            var item = localStorage.getItem(key);
            var todoItem = JSON.parse(item);
            todos.push(todoItem);
        }
    }
    addTodosToPage();
}

// This function was moved from todo.js and the logic to determine
// if localStorage is supoorted was removed since Modernizr is
// making the determination for us.
function saveTodoItem(todoItem) {
    var key = "todo" + todoItem.id;
    var item = JSON.stringify(todoItem);
    localStorage.setItem(key, item);
}

// The removal of items from localStorage was just a couple of
// lines in todo.js, but since we're using Modernizr to ensure
// compatibility with browsers that don't support localStorage
// it was necessary move this code to a function.
function removeTodoItem(id) {
    var key = "todo" + id;
    localStorage.removeItem(key);
}