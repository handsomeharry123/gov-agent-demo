import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { DemoScenarioProvider } from './hooks/useDemoScenario';
import { DemoSettingsProvider } from './hooks/useDemoSettings';
import { simpleTheme } from './theme/themeConfig';
import router from './router';

function App() {
  return (
    <ConfigProvider theme={simpleTheme}>
      <AuthProvider>
        <DemoSettingsProvider>
          <DemoScenarioProvider>
            <RouterProvider router={router} />
          </DemoScenarioProvider>
        </DemoSettingsProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
