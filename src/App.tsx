import React, { FC, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Button } from 'antd';
import './App.css';
import useSetState from './components/useSetState';
import useMenuStoreHooks from './stores/menuStore';
// import MenuNdzy from './menu/Menu';

function Test() {
  const store = useMenuStoreHooks();
  return useObserver(() => (
    <div>
      <span>{store.menus}</span>
    </div>
  ));
}

function Test01() {
  const [state, setState] = useSetState<{ name: string; age: number }>({
    name: '张一',
    age: 1,
  });

  const incrementAge = () => {
    setState((prev) => ({ age: prev.age + 1 }));
  };

  return (
    <div onClick={incrementAge}>
      {state.name}: {state.age}
    </div>
  );
}

const App: FC = () => (
  <div className="App">
    <Test></Test>
    <Test01 />
    {/* <MenuNdzy /> */}
  </div>
);

export default App;
