export const debounce = (callback, wait = 200) => {
  let timeoutId;

  const debounced = function(...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(context, args), wait);
  };

  // Add a cancellation method to the debounced function
  debounced.cancel = function() {
    clearTimeout(timeoutId);
  };

  return debounced;
};
