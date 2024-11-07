HTMLElement.prototype.fadeOut = function(ms = 500, remove = true) {
    // Set the transition duration to the provided duration (or default to 500ms)
    this.style.transition = `opacity ${ms}ms`;
    
    // Start the fade out
    this.style.opacity = 1;
    setTimeout(() => {
        this.style.opacity = 0;
    });

    // Remove the element from the DOM after the fade out completes
    setTimeout(() => {
        this.style.display = "none";
        if(remove) {
            this.remove();
        }
    }, ms);
}

HTMLElement.prototype.fadeIn = function(ms = 500, display = false) {
    if(display != false) {
        this.style.display = display;
    }
    this.style.transition = `opacity ${ms}ms`;
    setTimeout(() => {
        this.style.opacity = 1;
    });
}