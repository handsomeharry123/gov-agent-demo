import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

// Layouts
import BasicLayout from './layouts/BasicLayout';

// Pages - Auth
import Login from './pages/portal/Login';
import OfficialWebsite from './pages/portal/OfficialWebsite';
import PolicyAssistant from './pages/portal/PolicyAssistant';
import PolicyRetrieval from './pages/portal/PolicyRetrieval';

// Pages - 招小慧（政务综合智能体 Demo 唯一业务模块）
import HomePage from './pages/home';


import RoleBasedRedirect from './components/RoleBasedRedirect';

/** 双入口：浦易达官网 /website/pud；原招小慧工作台 /app/home/overview。 */
const routes: RouteObject[] = [
  { path: '/website/pud/policyretrieval', element: <PolicyRetrieval /> },
  { path: '/website/pud', element: <OfficialWebsite /> },
  { path: '/website/pud/policyAI/*', element: <PolicyAssistant /> },
  { path: '/website', element: <Navigate to="/website/pud" replace /> },
  // 登录页独立渲染（无门户框架）
  { path: '/login', element: <Login /> },
  // 根路径 → 登录
  { path: '/', element: <Navigate to="/login" replace /> },

  // 平台路由（BasicLayout 保护）
  {
    path: '/app',
    element: <BasicLayout />,
    children: [
      // 默认落地页：登录后进入招小慧
      { index: true, element: <RoleBasedRedirect /> },
      {
        path: 'home',
        children: [
          // 招小慧对话主页面（模块唯一一级入口）
          { index: true, element: <Navigate to="/app/home/overview" replace /> },
          { path: 'overview', element: <HomePage /> },
          { path: 'ai', element: <HomePage /> },
          // 招小慧页内第二层功能栏（连接器 / 技能 / 自动化任务）由 HomePage 承载
          { path: 'connector', element: <Navigate to="/app/home/ai" replace /> },
          { path: 'skill', element: <HomePage /> },
          { path: 'skill/manage', element: <HomePage /> },
          { path: 'knowledge', element: <HomePage /> },
          { path: 'auto-tasks', element: <Navigate to="/app/home/ai" replace /> },
          { path: 'auto-tasks/templates', element: <Navigate to="/app/home/ai" replace /> },
          { path: 'auto-tasks/new', element: <Navigate to="/app/home/ai" replace /> },
        ],
      },
      // 已下线模块的历史地址统一回到招小慧
      { path: '*', element: <Navigate to="/app/home/overview" replace /> },
    ],
  },

  // Catch all - redirect to login
  { path: '*', element: <Navigate to="/login" replace /> },
];

const router = createBrowserRouter(routes);

export default router;
