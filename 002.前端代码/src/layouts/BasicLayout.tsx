import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Space, message, Typography, Layout } from 'antd';
import { DesktopOutlined, LogoutOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { governmentBlue } from '../theme/brand';

const { Text } = Typography;
const { Header, Content } = Layout;
type DemoViewport = 'pc' | 'mobile';
const VIEWPORT_STORAGE_KEY = 'gov-agent-demo-viewport';

/**
 * 政务综合智能体 Demo · 极简框架
 *
 * 仅保留「招小慧」一个业务模块：
 *   - 不渲染一级侧边栏菜单，整屏直接展示招小慧模块
 *   - 顶部品牌栏（Logo + 平台名）+ 右上角用户区（退出登录）
 */
const BasicLayout = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [demoViewport, setDemoViewport] = useState<DemoViewport>(() => {
    const saved = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (saved === 'mobile' || saved === 'pc') return saved;
    return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'pc';
  });

  useEffect(() => {
    document.body.dataset.demoViewport = demoViewport;
    localStorage.setItem(VIEWPORT_STORAGE_KEY, demoViewport);
    window.dispatchEvent(new CustomEvent('demo-viewport-change', { detail: demoViewport }));
    return () => {
      delete document.body.dataset.demoViewport;
    };
  }, [demoViewport]);

  const userMenuItems: MenuProps['items'] = [
    { key: 'official-website', label: '浦易达官网' },
    {
      key: 'switch-viewport',
      icon: demoViewport === 'pc' ? <MobileOutlined /> : <DesktopOutlined />,
      label: demoViewport === 'pc' ? '切换移动端' : '切换 PC 端',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      style: { color: governmentBlue.primary },
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'official-website') { navigate('/website/pud'); return; }
    if (key === 'switch-viewport') {
      setDemoViewport((current) => (current === 'pc' ? 'mobile' : 'pc'));
      message.success(demoViewport === 'pc' ? '已切换至移动端 Demo' : '已切换至 PC 端 Demo');
      return;
    }
    if (key === 'logout') {
      logout();
      message.success('已退出登录');
      navigate('/login');
    }
  };

  return (
    <Layout className="app-demo-layout" style={{ minHeight: '100vh' }}>
      <Header
        className="app-demo-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          background: 'rgba(255, 255, 255, 0.94)',
          borderBottom: '1px solid #ECEFF3',
          boxShadow: '0 1px 10px rgba(31, 41, 55, 0.025)',
        }}
      >
        <Link
          to="/app/home/overview"
          aria-label="浦易达首页"
          className="app-demo-brand"
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, textDecoration: 'none' }}
        >
          <img
            src="/gov-logo.svg"
            alt="浦易达"
            className="app-demo-brand-logo"
          />
        </Link>
        <Space className="app-demo-account" size={16} align="center">
          <div
            className="app-demo-user-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 16,
              background: governmentBlue.surface,
              border: `1px solid ${governmentBlue.border}`,
              cursor: 'default',
            }}
          >
            <UserOutlined style={{ color: governmentBlue.primary }} />
            <Text style={{ fontSize: 13, color: governmentBlue.primary, fontWeight: 500 }}>
              {currentUser?.name ?? '-'}
            </Text>
          </div>
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button type="button" className="app-demo-account-trigger" aria-label="打开账户菜单">
              <Avatar
                className="app-demo-user-avatar"
                style={{
                  background: governmentBlue.primary,
                  boxShadow: '0 5px 14px rgba(36, 104, 216, 0.16)',
                }}
                icon={<UserOutlined />}
              />
            </button>
          </Dropdown>
        </Space>
      </Header>
      <Content
        className="app-demo-content"
        style={{
          background: '#F5F7FA',
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default BasicLayout;
