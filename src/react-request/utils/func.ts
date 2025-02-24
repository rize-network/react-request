export const debounce: (...args: any) => void = (
  func: (...args: any) => void,
  timeout = 300
) => {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};
