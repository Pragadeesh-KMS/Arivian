let currentNotification: (() => void) | null = null;

export const setCurrentNotification = (closeFunction: (() => void) | null) => {
  if (currentNotification) {
    currentNotification();
  }
  currentNotification = closeFunction;
};

export const clearCurrentNotification = () => {
  currentNotification = null;
};