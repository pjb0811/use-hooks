import createStorageHook from './create-storage-hook';

const useSessionStorage = createStorageHook(
  () => sessionStorage,
  'sessionStorage',
);

export default useSessionStorage;
