import React from 'react';
import './App.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.orange.dark.css';
import GuestsList from './components/GuestsList';

const App = () => {
  return (
    <div className="App">
      <GuestsList />
    </div>
  );
}

export default App;
