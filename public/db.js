let db;

// create new db request for "budget" database

const request =indexedDB.open("budget",1);

request.onupgradeneeded = function (event) {
    // creat object stored called "pending" and set autoIncrement to true
    const db = event.target.result;
    db.createObjectStore("pending",{ autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;
    // check if app is online before reading from db 
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
    // create transaction on the pending db with readwrite access 
    const transaction = db.transaction(["pending"], "readwrite");

    // access your pending object store 
    const store = transaction.objectStore("pending");
    // add record to your store with add method 
    store.add(record);
}

function checkDatabase() {
    // open a transaction on your pending db 
    const transaction = db.transaction(["pending"], "readwrite");
    // access the pending object store 
    const store = transaction.objectStore("pending");
    // geta ll record form tore and set to variable 
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Context-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then(() => {
            // if successful, open a transaction on your pending db 
            const transaction = db.transaction(["pending"], "readwrite");
            // access your pending object store 
            const store = transaction.objectStore("pending");
            // clear all irems in your store  
            store.clear();
        });
    
        }
    };
}
// listen for app to come back onine 
window.addEventListener("online", checkDatabase);