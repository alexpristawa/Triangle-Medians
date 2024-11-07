HTMLElement.prototype.getY = function(relative = undefined) {
    if(relative !== undefined) {
        return this.getBoundingClientRect().top - relative.getBoundingClientRect().top;
    }
    return this.getBoundingClientRect().top;
}

HTMLElement.prototype.getX = function(relative = undefined) {
    if(relative !== undefined) {
        return this.getBoundingClientRect().left - relative.getBoundingClientRect().left;
    }
    return this.getBoundingClientRect().left;
}

HTMLElement.prototype.getYB = function(relative = undefined) {
    if(relative !== undefined) {
        return relative.getBoundingClientRect().bottom - this.getBoundingClientRect().bottom;
    }
    return this.getBoundingClientRect().bottom;
}