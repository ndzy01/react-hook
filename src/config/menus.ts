import _ from 'lodash';
import { ReactNode } from 'react';
let menus: any = [];

const recursionMenus = (
  items: IMenuItem[],
  action: (item: IMenuItem) => boolean
): void => {
  for (const item of items) {
    if (!action(item)) {
      return;
    }
    if (item.children) {
      recursionMenus(item.children, action);
    }
  }
};

const findMenuByKey = (key: string): IMenuItem | null => {
  let result: IMenuItem | null = null;
  recursionMenus(menus, (item: IMenuItem) => {
    if (item.key && item.key == key) {
      result = item;
      return false;
    }
    return true;
  });
  return result;
};

recursionMenus(menus, (item: IMenuItem) => {
  item.key = _.uniqueId('menu_');
  return true;
});

export interface IMenuItem {
  key?: string;
  name: string;
  path?: string;
  icon?: string | ReactNode;
  children?: IMenuItem[];
}

export { recursionMenus, findMenuByKey };

export default menus;
