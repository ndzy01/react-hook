// import { createContext } from 'react';
// import { decorate, observable, computed } from 'mobx';

// export class MenuStore {
//   menus = [];
//   openKey: string[] = [];

import { useLocalStore } from 'mobx-react-lite';

function useMenuStoreHooks() {
  const menuStore = useLocalStore<any>(() => ({
    menus: [],
    openKey: [],
    setOpenKey(key: string) {
      menuStore.openKey = key ? [key] : [];
    },
    saveMenus(menus: any) {
      menuStore.menus = menus;
    },
  }));
  return menuStore;
}
export default useMenuStoreHooks;
