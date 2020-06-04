import _ from 'lodash';
import React, { ReactNode, useState, useContext } from 'react';
import './menu.scss';
import { useObserver } from 'mobx-react-lite';
import { RouteProps, withRouter } from 'react-router';
import { Button, Menu } from 'antd';
import { PicLeftOutlined } from '@ant-design/icons';

import usePageTabStoreHooks from '../stores/pageTabStore';
import useMenuStoreHooks from '../stores/menuStore';
import menuBaseData from './menu.json';

const SubMenu = Menu.SubMenu;

interface IMenuItem {
  key?: string;
  name: string;
  url?: string;
  menuIcon?: string | ReactNode;
  children?: IMenuItem[];
  type?: number;
}

let menus_: any = [];
function MenuNdzy(props: any) {
  const menuStore = useMenuStoreHooks();
  const pageTabStore = usePageTabStoreHooks();
  const [menus, setMenus] = useState<any>();
  const [firstMenuName, setFirstMenuName] = useState<any>();
  const [secondMenu, setSecondMenu] = useState<any>();
  const [firstMenuNameMenuIcon, setFirstMenuNameMenuIcon] = useState<any>();
  const [hoverMenuIcon, setHoverMenuIcon] = useState<any>();
  const [selectedKeys, setSelectedKeys] = useState<any>();

  const setLogo = (url: string) => {
    let link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  };
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
  const getMenu = () => {
    setLogo(menuBaseData.data[0] && menuBaseData.data[0].favicon);
    menus_ =
      menuBaseData.data[0].children &&
      menuBaseData.data[0].children.filter((item: any) => !item.type);
    recursionMenus(menus, (item: IMenuItem) => {
      item.key = _.uniqueId('menu_');
      return true;
    });
    if (menus.length) {
      // setFirstTab(menus[0]);
    }
    setMenus(menus_);
    setFirstMenuName(menus_.length ? menus_[0].name : null);
    setSecondMenu(menus_.length ? menus_[0].children : []);
    menuStore.saveMenus(secondMenu);
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

  // 设置第一个tab
  const setFirstTab = (menu: any) => {
    if (menu.children.length) {
      setFirstTab(menu.children[0]);
    } else {
      pageTabStore.addPageTab(menu);
      pageTabStore.setActiveKey(menu.url);
      props.history.push(menu.url);
    }
  };
  const firstMenuClick = (e: any): void => {
    menus.map((item: any) => {
      if (item.key == e.key) {
        // setMenus(menus_);
        setFirstMenuName(item.name);
        setSecondMenu(item.children);
        setFirstMenuNameMenuIcon(item.menuIcon);
        menuStore.saveMenus(item.children);
      }
    });
  };
  const secondMenuClick = (e: any) => {
    if (
      e.key == menuStore.openKey.slice()[0] &&
      props.location.pathname == pageTabStore.activeKey
    ) {
      return;
    }
    let menu = findMenuByKey(e.key);
    if (menu && menu.url) {
      props.history.push(menu.url);
      pageTabStore.addPageTab(menu);
      pageTabStore.setActiveKey(menu.url);
    }
  };
  const onOpenChange = (openKeys: any) => {
    let menuFisrt: any[] = [];
    menuFisrt = menus.map((item: any) => {
      return item.key;
    });
    if (menuFisrt.indexOf(openKeys[openKeys.length - 1]) > -1) {
      openKeys.forEach((item: any, index: any) => {
        if (index !== openKeys.length - 1 && menuFisrt.indexOf(item) > -1) {
          openKeys.splice(index, 1);
        }
      });
    }
  };
  const buildMenu = (items: IMenuItem[]) => {
    if (items && items.length > 0) {
      let res = [];
      for (const item of items) {
        if (item.type == 0) {
          if (
            item.children &&
            item.children.length &&
            item.children.length > 1
          ) {
            res.push(
              <SubMenu key={item.key} title={buildMenuTitle(item)}>
                {buildMenu(item.children)}
              </SubMenu>
            );
          } else if (item.children && item.children.length == 1) {
            res.push(
              <Menu.Item key={item.children[0].key}>
                {item.children[0].name}
              </Menu.Item>
            );
          } else {
            res.push(
              <Menu.Item key={item.key}>
                <span className="second-menu-text">{item.name}</span>
              </Menu.Item>
            );
          }
        }
      }
      return res;
    }
    return null;
  };
  const handleEnter = (menu: any) => {
    setHoverMenuIcon(menu.menuIcon);
  };
  const handleOut = (menu: any) => {
    setHoverMenuIcon('');
  };

  const buildMenuTitle = (menu: IMenuItem): ReactNode => {
    let icon = null;
    let left = null;
    let shadow = null;

    if (menu.menuIcon && menu.menuIcon != '#' && _.isString(menu.menuIcon)) {
      icon = (
        <img
          src="http://www.ndzy01.com:3889/uploads/2020-6-2-17-47-8-32x32.ico"
          width="30"
          height="30"
        />
      );
    }
    if (menu.menuIcon == firstMenuNameMenuIcon) {
      left = <div className="left-border"></div>;
      shadow = <div className="left-shadow"></div>;
    }
    return (
      <div
        className="menu-title"
        onMouseLeave={() => handleOut(menu)}
        onMouseEnter={() => handleEnter(menu)}
      >
        {icon}
        {left}
        {shadow}
        <div
          className="name menu-name-item"
          style={{ marginTop: icon ? '0px' : 0 }}
        >
          {menu.name}
        </div>
      </div>
    );
  };

  const setOpenAndSelectMenu = () => {
    let path = props.location.pathname;
    let openKeys: string[] = [];
    let selectedKeys: string[] = [];
    let recursionMenus = (items: IMenuItem[], parents: string[]): void => {
      for (const item of items) {
        if (item.url && item.url == path) {
          selectedKeys.push(item.key as string);
          openKeys = [...parents];
        } else {
          if (item.children) {
            parents.push(item.key as string);
            recursionMenus(item.children, parents);
            parents.pop();
          }
        }
      }
    };
    recursionMenus(menus, []);
    return {
      selectedKeys: selectedKeys,
      openKeys: openKeys,
    };
  };
  selectedKeys(setOpenAndSelectMenu().selectedKeys)
  selectedKeys(setOpenAndSelectMenu().openKeys)
  getMenu();
  return (
    <div className="expansion">
      <div className="app-menu">
        <div className="menu-list">
          <div
            className="first-menu-parent"
            style={{ height: document.body.clientHeight - 5 + 'px' }}
          >
            <div className="logo">
              我是logo
              {/* TODO:logo */}
              {/* <img src={imgs.logo} width="50" height="50" /> */}
            </div>

            <Menu className="first-menu" onClick={firstMenuClick}>
              {menus.map((item: any) => (
                <Menu.Item key={item.key}>{buildMenuTitle(item)}</Menu.Item>
              ))}
            </Menu>
          </div>
          {/* TODO */}
          <div style={{ textAlign: 'center', width: '121px' }}>
            <p
              style={{
                border: '1px solid rgb(243,243,243)',
                margin: 0,
                // height: "51px",
                // lineHeight: "51px",
                borderStyle: 'none solid solid none',
                fontSize: '16px',
                color: '#333333',
                fontWeight: 500,
              }}
            >
              {firstMenuName}
            </p>

            <Menu
              className="second-menu"
              defaultSelectedKeys={selectedKeys}
              selectedKeys={menuStore.openKey.slice()}
              onOpenChange={onOpenChange}
              mode="inline"
              onClick={secondMenuClick}
            >
              {buildMenu(secondMenu)}
            </Menu>
          </div>
          {/* TODO */}
        </div>
      </div>
    </div>
  );
}

export default MenuNdzy;

// import _ from 'lodash';
// import React, { Component, ReactNode } from 'react';
// import './AppMenu.scss';
// import { Menu, Icon } from 'antd';
// import { PicLeftOutlined } from '@ant-design/icons';
// import { RouteComponentProps, withRouter } from 'react-router';
// import baseApi from '../../../api/baseApi';
// import { observer } from 'mobx-react';
// import store from '../../../stores/appStore';
// import pageTabStore from '../../../stores/pageTabStore';
// import menuStore from '../../../stores/menuStore';
// const SubMenu = Menu.SubMenu;
// let menus: any = [];

// const MyIcon = Icon.createFromIconfontCN({
//   scriptUrl: (window as any).ICO_URL,
// });
// const imgs: any = {
//   'general-report': require('../../../assets/icon/general-report.png'),
//   'general-report_active': require('../../../assets/icon/general-report_active.png'),
//   'special-report': require('../../../assets/icon/special-report.png'),
//   'special-report_active': require('../../../assets/icon/special-report_active.png'),
//   audit: require('../../../assets/icon/audit.png'),
//   audit_active: require('../../../assets/icon/audit_active.png'),
//   'basic-data': require('../../../assets/icon/basic-data.png'),
//   'basic-data_active': require('../../../assets/icon/basic-data_active.png'),
//   'report-view': require('../../../assets/icon/report-view.png'),
//   'report-view_active': require('../../../assets/icon/report-view_active.png'),
//   system: require('../../../assets/icon/system.png'),
//   system_active: require('../../../assets/icon/system_active.png'),
//   zhishiku: require('../../../assets/icon/zhishiku.png'),
//   zhishiku_active: require('../../../assets/icon/zhishiku_active.png'),
//   logo: require('../../../assets/img/logo.png'),
// };

// // TODO 展开 收起
// // const SwitchIcon = Icon.createFromIconfontCN({
// //   scriptUrl: "//at.alicdn.com/t/font_1472378_1qilf7uo1uqh.js",
// // });

// @observer
// class AppMenu extends Component<RouteComponentProps, any> {
//   constructor(props: RouteComponentProps) {
//     super(props);
//     this.firstMenuClick = this.firstMenuClick.bind(this);

//     this.getMenu();

//     this.state = {
//       secondMenu: [],
//       ...this.setOpenAndSelectMenu(),
//     };
//   }

//   public componentWillReceiveProps(nextProps: RouteComponentProps) {
//     if (this.props.location.pathname != nextProps.location.pathname) {
//       this.setState({
//         ...this.setOpenAndSelectMenu(),
//       });
//     }
//   }
// TODO:    qqqqq
//   private setLogo(url: string) {
//     let link = document.createElement('link');
//     link.type = 'image/x-icon';
//     link.rel = 'shortcut icon';
//     link.href = url;
//     document.getElementsByTagName('head')[0].appendChild(link);
//   }

//   private getMenu() {
//     baseApi.queryUserMenuForTree({ prefix: 'water-laboratory' }).then((res) => {
//       this.setLogo(res.data.data[0] && res.data.data[0].favicon);
//       menus =
//         res.data.data[0].children &&
//         res.data.data[0].children.filter((item: any) => !item.type);
//       this.recursionMenus(menus, (item: IMenuItem) => {
//         item.key = _.uniqueId('menu_');
//         return true;
//       });
//       if (menus.length) {
//         this.setFirstTab(menus[0]);
//       }
//       this.setState(
//         {
//           menus,
//           firstMenuName: menus.length ? menus[0].name : null,
//           secondMenu: menus.length ? menus[0].children : [],
//         },
//         () => {
//           menuStore.saveMenus(this.state.secondMenu);
//         }
//       );
//     });
//   }

//   private recursionMenus = (
//     items: IMenuItem[],
//     action: (item: IMenuItem) => boolean
//   ): void => {
//     for (const item of items) {
//       if (!action(item)) {
//         return;
//       }
//       if (item.children) {
//         this.recursionMenus(item.children, action);
//       }
//     }
//   };

//   private findMenuByKey = (key: string): IMenuItem | null => {
//     let result: IMenuItem | null = null;
//     this.recursionMenus(menus, (item: IMenuItem) => {
//       if (item.key && item.key == key) {
//         result = item;
//         return false;
//       }
//       return true;
//     });
//     return result;
//   };

//   public render() {
//     const { firstMenuName, secondMenu } = this.state;
//     return (
//       <div className={store.isExpansion ? 'expansion' : 'collapse'}>
//         <div className="app-menu">
//           <div className="menu-list">
//             <div
//               className="first-menu-parent"
//               style={{ height: document.body.clientHeight - 5 + 'px' }}
//             >
//               <div className="logo">
//                 <img src={imgs.logo} width="50" height="50" />
//               </div>
//               {/* TODO 展开收起 */}
//               {/* {store.isExpansion ? (
//                 <Tooltip title="收起">
//                       <span
//                     onClick={() => {
//                       console.log(store.isExpansion);
//                       store.isExpansion = !store.isExpansion;
//                       console.log(store.isExpansion);
//                     }}
//                   >
//                     <SwitchIcon
//                       style={{ fontSize: 18, backgroundColor: "#666666" }}
//                       type="icon-zhankai"
//                     ></SwitchIcon>
//                   </span>

//                 </Tooltip>
//               ) : (
//                 <Tooltip title="展开">
//                    <span
//                     onClick={() => {
//                       console.log(store.isExpansion);
//                       store.isExpansion = !store.isExpansion;
//                       console.log(store.isExpansion);
//                     }}
//                   >
//                     <SwitchIcon
//                       style={{ fontSize: 18, backgroundColor: "#666666" }}
//                       type="icon-shouqi"
//                     ></SwitchIcon>
//                   </span>
//                 </Tooltip>
//               )} */}

//               <Menu className="first-menu" onClick={this.firstMenuClick}>
//                 {menus.map((item: any) => (
//                   <Menu.Item key={item.key}>
//                     {this.buildMenuTitle(item)}
//                   </Menu.Item>
//                 ))}
//               </Menu>
//             </div>
//             {/* TODO */}
//             <div style={{ textAlign: 'center', width: '121px' }}>
//               <p
//                 style={{
//                   border: '1px solid rgb(243,243,243)',
//                   margin: 0,
//                   // height: "51px",
//                   // lineHeight: "51px",
//                   borderStyle: 'none solid solid none',
//                   fontSize: '16px',
//                   color: '#333333',
//                   fontWeight: 500,
//                 }}
//               >
//                 {firstMenuName}
//               </p>

//               <Menu
//                 className="second-menu"
//                 defaultSelectedKeys={this.state.selectedKeys}
//                 selectedKeys={menuStore.openKey.slice()}
//                 onOpenChange={this.onOpenChange}
//                 mode="inline"
//                 onClick={this.secondMenuClick.bind(this)}
//               >
//                 {this.buildMenu(secondMenu)}
//               </Menu>
//             </div>
//             {/* TODO */}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 设置第一个tab
//   private setFirstTab(menu: any) {
//     if (menu.children.length) {
//       this.setFirstTab(menu.children[0]);
//     } else {
//       pageTabStore.addPageTab(menu);
//       pageTabStore.setActiveKey(menu.url);
//       this.props.history.push(menu.url);
//     }
//   }

//   protected firstMenuClick(e: any): void {
//     menus.map((item: any) => {
//       if (item.key == e.key) {
//         this.setState({
//           secondMenu: item.children,
//           firstMenuName: item.name,
//           firstMenuNameMenuIcon: item.menuIcon,
//         });
//         menuStore.saveMenus(item.children);
//       }
//     });
//   }

//   private secondMenuClick(e: any) {
//     if (
//       e.key == menuStore.openKey.slice()[0] &&
//       this.props.location.pathname == pageTabStore.activeKey
//     ) {
//       return;
//     }
//     let menu = this.findMenuByKey(e.key);
//     if (menu && menu.url) {
//       this.props.history.push(menu.url);
//       pageTabStore.addPageTab(menu);
//       pageTabStore.setActiveKey(menu.url);
//     }
//   }

//   private onOpenChange(openKeys: any) {
//     let menuFisrt: any[] = [];
//     menuFisrt = menus.map((item: any) => {
//       return item.key;
//     });
//     if (menuFisrt.indexOf(openKeys[openKeys.length - 1]) > -1) {
//       openKeys.forEach((item: any, index: any) => {
//         if (index !== openKeys.length - 1 && menuFisrt.indexOf(item) > -1) {
//           openKeys.splice(index, 1);
//         }
//       });
//     }
//   }
// TODO:

//   private buildMenu(items: IMenuItem[]) {
//     if (items && items.length > 0) {
//       let res = [];
//       for (const item of items) {
//         if (item.type == 0) {
//           if (
//             item.children &&
//             item.children.length &&
//             item.children.length > 1
//           ) {
//             res.push(
//               <SubMenu key={item.key} title={this.buildMenuTitle(item)}>
//                 {this.buildMenu(item.children)}
//               </SubMenu>
//             );
//           } else if (item.children && item.children.length == 1) {
//             res.push(
//               <Menu.Item key={item.children[0].key}>
//                 {item.children[0].name}
//               </Menu.Item>
//             );
//           } else {
//             res.push(
//               <Menu.Item key={item.key}>
//                 <span className="second-menu-text">{item.name}</span>
//               </Menu.Item>
//             );
//           }
//         }
//       }
//       return res;
//     }
//     return null;
//   }
// TODO:

//   private handleEnter(menu: any) {
//     this.setState({
//       hoverMenuIcon: menu.menuIcon,
//     });
//   }
//   private handleOut(menu: any) {
//     this.setState({
//       hoverMenuIcon: '',
//     });
//   }

//   private buildMenuTitle(menu: IMenuItem): ReactNode {
//     let icon = null;
//     let left = null;
//     let shadow = null;
//     const { firstMenuNameMenuIcon, hoverMenuIcon } = this.state;
//     if (menu.menuIcon && menu.menuIcon != '#' && _.isString(menu.menuIcon)) {
//       icon = (
//         <img
//           src={
//             imgs[
//               firstMenuNameMenuIcon == menu.menuIcon ||
//               hoverMenuIcon == menu.menuIcon
//                 ? menu.menuIcon + '_active'
//                 : menu.menuIcon
//             ]
//           }
//           width="30"
//           height="30"
//         />
//       ); // <MyIcon type={"icon-shebeiguanli_" + menu.menuIcon} />;
//     }
//     if (menu.menuIcon == firstMenuNameMenuIcon) {
//       left = <div className="left-border"></div>;
//       shadow = <div className="left-shadow"></div>;
//     }
//     return (
//       <div
//         className="menu-title"
//         onMouseLeave={() => this.handleOut(menu)}
//         onMouseEnter={() => this.handleEnter(menu)}
//       >
//         {icon}
//         {left}
//         {shadow}
//         <div
//           className="name menu-name-item"
//           style={{ marginTop: icon ? '0px' : 0 }}
//         >
//           {menu.name}
//         </div>
//       </div>
//     );
//   }

//   private setOpenAndSelectMenu() {
//     let path = this.props.location.pathname;
//     let openKeys: string[] = [];
//     let selectedKeys: string[] = [];
//     let recursionMenus = (items: IMenuItem[], parents: string[]): void => {
//       for (const item of items) {
//         if (item.url && item.url == path) {
//           selectedKeys.push(item.key as string);
//           openKeys = [...parents];
//         } else {
//           if (item.children) {
//             parents.push(item.key as string);
//             recursionMenus(item.children, parents);
//             parents.pop();
//           }
//         }
//       }
//     };
//     recursionMenus(menus, []);
//     return {
//       selectedKeys: selectedKeys,
//       openKeys: openKeys,
//     };
//   }
// }

// export interface IMenuItem {
//   key?: string;
//   name: string;
//   url?: string;
//   menuIcon?: string | ReactNode;
//   children?: IMenuItem[];
//   type?: number;
// }

// export default withRouter(AppMenu);
