let randomNumber = (min, max) => {
    return Math.floor(Math.random()*(max-min)+min);
}

Array.prototype.numericInsert = function(element, key = false) {
    // Find the correct position for the new element
    let i = 0;
    if(!key) { //Array of numbers
        while (i < this.length && this[i] < element) {
            i++;
        }
    } else { //Array of objects
        while (i < this.length && this[key] < element[key]) {
            i++;
        }
    }

    // Insert the element at the found position
    this.splice(i, 0, element);
};

Array.prototype.indexOfObjectValue = function(key, value) {
    for(let i = 0; i < this.length; i++) {
        if(this[i][key] == value) {
            return i;
        }
    }
    return -1;
}