import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

// Layouts
import BasicLayout from './layouts/BasicLayout';

// Pages - Auth
import Login from './pages/portal/Login';

// Pages - 招小慧（政务综合智能体 Demo 唯一业务模块）
import HomePage from './pages/home';
import AutoTaskForm from './pages/home/AutoTaskForm';
import AutoTaskTemplateList from './pages/home/AutoTaskTemplateList';
import RoleBasedRedirect from './components/RoleBasedRedirect';

/**
 * 政务综合智能体 Demo · PC 端极简路由
 *
 * 仅保留两条链路：
 *   1. 登录：/login（账号密码 / 手机验证码）
 *   2. 招小慧：/app/home/overview（对话 + KPI + 快捷指令 + 工作台侧栏）
 *
 * 其余历史模块（数据大屏、需求管理、立项、接入中心、评测沙盒、台账、
 * 资源、态势感知、安全治理、数据资产、审计、用户中心、环境、系统配置、
 * 门户官网/注册页）均已下线；历史链接统一重定向，保证旧地址不白屏。
 */
const routes: RouteObject[] = [
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
          // 招小慧页内第二层功能栏（连接器 / 技能 / 自动化任务）由 HomePage 承载
          { path: 'connector', element: <HomePage /> },
          { path: 'skill', element: <HomePage /> },
          { path: 'skill/manage', element: <HomePage /> },
          { path: 'auto-tasks', element: <HomePage /> },
          { path: 'auto-tasks/templates', element: <AutoTaskTemplateList /> },
          { path: 'auto-tasks/new', element: <AutoTaskForm /> },
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
