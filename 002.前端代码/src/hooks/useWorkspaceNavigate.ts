import { useCallback } from 'react';
import { useLocation, useNavigate, type NavigateFunction, type NavigateOptions, type To } from 'react-router-dom';

/** 二级功能跟随当前入口，避免官网工作台意外跳出官网框架。 */
export function useWorkspaceNavigate(): NavigateFunction {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inPortal = pathname.startsWith('/website/pud/policyAI');
  return useCallback(((to: To | number, options?: NavigateOptions) => {
    if (typeof to === 'number') { navigate(to); return; }
    const mapPath = (path: string) => inPortal
      ? path.replace(/^\/app\/home(?=\/|\?|$)/, '/website/pud/policyAI').replace(/^(\/website\/pud\/policyAI)\/overview(?=\?|$)/, '$1')
      : path;
    navigate(typeof to === 'string' ? mapPath(to) : { ...to, pathname: to.pathname ? mapPath(to.pathname) : to.pathname }, options);
  }) as NavigateFunction, [navigate, inPortal]);
}
