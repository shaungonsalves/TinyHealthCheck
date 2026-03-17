import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider, useConfig } from './context/ConfigContext';

const Root = () => {
  const { loading, error } = useConfig();

  if (loading) return <div>Loading configuration...</div>;
  if (error) return <div>Error loading configuration: {error}</div>;

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <Root />
    </ConfigProvider>
  </React.StrictMode>
);