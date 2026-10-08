import createStorageHook from './create-storage-hook';

const useLocalStorage = createStorageHook(() => localStorage, 'localStorage');

export default useLocalStorage;
