import { createContext } from 'react';

/** 嵌入容器提供本地收起行为，独立工作台继续使用原有导航状态。 */
export const WorkspaceSidebarContext = createContext<(() => void) | null>(null);
