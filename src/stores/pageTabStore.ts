import { useLocalStore } from 'mobx-react-lite';
import useMenuStoreHooks from './menuStore';

function usePageTabStoreHooks() {
  const menuStore = useMenuStoreHooks();
  const pageTabStore = useLocalStore<any>(() => ({
    pageTabArr: [],
    activeKey: [],
    setActiveKey(key: string) {
      pageTabStore.activeKey = key;
      pageTabStore.getMenusActive(menuStore.menus.slice(), key);
    },
    addPageTab(pageTab: any) {
      let arr = pageTabStore.pageTabArr.slice();
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].url == pageTab.url) {
          return;
        }
      }
      arr.push(pageTab);
      pageTabStore.pageTabArr = arr;
    },
    removePageTab(newArr: any) {
      pageTabStore.pageTabArr = newArr;
    },
    getMenusActive(menuArr: any, key: string) {
      let length = menuArr.length;
      let oldKey = menuStore.openKey.slice()[0];
      for (let i = 0; i < length; i++) {
        if (
          oldKey != menuStore.openKey.slice()[0] &&
          menuArr[i].children.length
        ) {
          return;
        }
        if (menuArr[i].children.length) {
          this.forChildren(menuArr[i].children, key, i, length);
          continue;
        }
        if (menuArr[i].url == key) {
          menuStore.setOpenKey(menuArr[i].key);
          break;
        }
        menuStore.setOpenKey('');
      }
    },
    forChildren(
      childrenArr: any,
      key: string,
      index: number,
      parentLength: number
    ) {
      let length = childrenArr.length;
      for (let i = 0; i < length; i++) {
        if (childrenArr[i].url == key) {
          menuStore.setOpenKey(childrenArr[i].key);

          break;
        }
        if (index === parentLength - 1 && i === length - 1) {
          menuStore.setOpenKey('');
        }
      }
    },
  }));
  return pageTabStore;
}

export default usePageTabStoreHooks;
