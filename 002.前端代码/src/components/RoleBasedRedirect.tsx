import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // 政务版 Demo：登录后统一进入「招小慧」对话页。
    navigate('/app/home/overview', { replace: true });
  }, [currentUser, navigate]);

  return null;
};

export default RoleBasedRedirect;
