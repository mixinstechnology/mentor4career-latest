let showGlobalLoader: () => void = () => {};
let hideGlobalLoader: () => void = () => {};

export const setGlobalLoaderFunctions = (show: () => void, hide: () => void) => {
  showGlobalLoader = show;
  hideGlobalLoader = hide;
};

export const getGlobalLoader = () => ({
  show: showGlobalLoader,
  hide: hideGlobalLoader,
});
