import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Tabs, Typography, message } from 'antd';
import { LockOutlined, QrcodeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import './login.css';

const { Title, Text } = Typography;
const OFFICIAL_LOGIN = 'https://zwdtuser.sh.gov.cn/uc/login/login.jsp';

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleLogin = async (values: { account: string; password: string }) => {
    setLoading(true);
    try {
      if (await login(values.account.trim(), values.password)) {
        message.success('登录成功');
        navigate('/app/home/overview', { replace: true });
      } else {
        message.error('账号或密码错误，请重新输入');
      }
    } catch {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  const [method, setMethod] = useState('account');
  const [resident, setResident] = useState('mainland');
  const [notice, setNotice] = useState('');

  return <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #123D80 0%, #2468D8 45%, #4083E8 100%)', padding: '60px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
    <Card style={{ width: 440, maxWidth: '100%', borderRadius: 12 }} styles={{ body: { padding: 40 } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/gov-logo.svg" alt="浦易达" style={{ width: 116, height: 56, marginBottom: 12 }} />
        <Title level={2} style={{ marginBottom: 8 }}>用户登录</Title>
        <Text type="secondary">浦易达</Text>
        <div style={{ marginTop: 12 }}><a href="/website/pud">浦易达官网入口 →</a></div>
      </div>
      <Form form={form} layout="vertical" size="large" onFinish={handleLogin}>
        <div className="login-official-fields">
          <Tabs activeKey={method} onChange={setMethod} centered items={[{ key: 'qr', label: '扫码登录' }, { key: 'account', label: '账号密码登录' }]} />
          {method === 'account' ? <>
            <Form.Item name="account" rules={[{ required: true, whitespace: true, message: '请输入手机号码或证件号码' }]}>
              <Input aria-label="个人账号" autoComplete="username" placeholder={resident === 'mainland' ? '手机号码 / 身份证号' : '注册账号 / 证件号码'} addonBefore={<Select aria-label="居民类型" value={resident} onChange={value => { setResident(value); form.resetFields(['account']); }} popupMatchSelectWidth={220} options={[{ value: 'mainland', label: '大陆居民' }, { value: 'other', label: '其他证件' }]} />} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入登录密码' }]}>
              <Input.Password aria-label="登录密码" prefix={<LockOutlined />} autoComplete="current-password" placeholder="请输入登录密码" />
            </Form.Item>
            <div className="login-account-help"><button type="button" onClick={() => setNotice('注册账号')}>没有账号？去注册</button><button type="button" onClick={() => setNotice('找回密码')}>忘记密码？</button></div>
          </> : <div className="login-scan-guide">
            <QrcodeOutlined aria-hidden="true" />
            <strong>使用随申办扫码登录</strong>
            <p>前往一网通办官方认证页<br />使用随申办 App 或小程序扫码</p>
          </div>}
          <div className="login-other-methods"><span>其他快捷登录</span><Space wrap><button type="button" onClick={() => setNotice('国家政务服务平台登录')}><SafetyCertificateOutlined /> 国家政务服务平台</button><button type="button" onClick={() => setNotice('其他登录方式')}>其他方式 ›</button></Space></div>
        </div>
        <Button type="primary" block loading={loading} htmlType={method === 'account' ? 'submit' : 'button'} onClick={method === 'qr' ? () => setNotice('扫码登录') : undefined}>{method === 'account' ? '登录' : '前往扫码登录'}</Button>
      </Form>
    </Card>
    <Modal title={notice} open={!!notice} onCancel={() => setNotice('')} footer={<><Button onClick={() => setNotice('')}>取消</Button><Button type="primary" href={OFFICIAL_LOGIN} target="_blank" rel="noopener noreferrer" onClick={() => { form.resetFields(['password']); setNotice(''); }}>打开官方认证页</Button></>}>
      <p>将在新窗口打开上海一网通办官方认证页，请在官方页面完成{notice}。</p>
      <Alert type="info" showIcon message="当前为演示环境，尚未接入统一身份认证回调。官网认证结果暂不能自动返回本工作台；本页输入的信息不会发送至官网。" />
    </Modal>
  </div>;
}
