import { theme as antdTheme, type ThemeConfig } from 'antd';

/** 主题风格标识：简约风（默认，浅色）/ 科技风（深色霓虹） */
export type ThemeKey = 'simple' | 'tech';

const sharedComponents: ThemeConfig['components'] = {
  Button: { borderRadius: 6 },
  Card: { borderRadius: 8 },
  Input: { borderRadius: 6 },
  Select: { borderRadius: 6 },
  Table: { borderRadius: 6 },
  Modal: { borderRadius: 8 },
  Menu: { borderRadius: 6 },
};

const sharedToken: ThemeConfig['token'] = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 14,
  borderRadius: 6,
  sizeStep: 4,
  sizeUnit: 4,
  wireframe: false,
};

/** 简约风：浅色政务红主题（默认） */
export const simpleTheme: ThemeConfig = {
  token: {
    ...sharedToken,
    // Brand colors —— 政务红主色
    colorPrimary: '#D45B70',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#D45B70',
    colorLink: '#C84D65',
    colorLinkHover: '#B73E56',
    // Neutral colors
    colorTextBase: '#202936',
    colorBgBase: '#FFFFFF',
  },
  components: sharedComponents,
};

/** 科技风：深色 + 霓虹青，对齐《智能体管理平台-深色科技风》参考稿 */
export const techTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...sharedToken,
    // Brand colors —— 政务红主色（深色底霓虹红）
    colorPrimary: '#e03c4b',
    colorSuccess: '#34d399',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    colorInfo: '#e03c4b',
    colorLink: '#e03c4b',
    colorLinkHover: '#ff7875',
    // Neutral colors —— 深蓝底 + 高亮文字（对齐 --bg-0 / --text-0）
    colorTextBase: '#e8f1ff',
    colorText: '#e8f1ff',
    colorTextSecondary: '#9fb3d1',
    colorTextTertiary: '#5b6f92',
    colorTextQuaternary: '#41527a',
    colorBgBase: '#070b16',
    colorBgLayout: '#070b16',
    colorBgContainer: '#111a32',
    colorBgElevated: '#0f1830',
    colorBgSpotlight: '#0f1830',
    colorBorder: 'rgba(56, 189, 248, 0.22)',
    colorBorderSecondary: 'rgba(56, 189, 248, 0.12)',
    colorFillSecondary: 'rgba(56, 189, 248, 0.10)',
    colorFillTertiary: 'rgba(56, 189, 248, 0.06)',
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary: '0 6px 20px rgba(0, 0, 0, 0.40)',
  },
  components: {
    ...sharedComponents,
    Layout: {
      headerBg: 'rgba(15, 24, 48, 0.85)',
      siderBg: 'rgba(9, 14, 28, 0.92)',
      bodyBg: '#070b16',
      headerColor: '#e8f1ff',
    },
    Menu: {
      borderRadius: 10,
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: '#9fb3d1',
      darkItemHoverColor: '#e8f1ff',
      darkItemHoverBg: 'rgba(248, 113, 113, 0.08)',
      darkItemSelectedBg: 'rgba(224, 60, 75, 0.16)',
      darkItemSelectedColor: '#ffffff',
    },
    Card: {
      borderRadius: 14,
      colorBgContainer: 'rgba(17, 26, 50, 0.72)',
      colorBorderSecondary: 'rgba(56, 189, 248, 0.16)',
    },
    Table: {
      borderRadius: 8,
      colorBgContainer: 'transparent',
      headerBg: 'rgba(7, 11, 22, 0.55)',
      headerColor: '#5b6f92',
      rowHoverBg: 'rgba(224, 60, 75, 0.06)',
      borderColor: 'rgba(56, 189, 248, 0.10)',
    },
    Modal: {
      borderRadius: 12,
      contentBg: '#0f1830',
      headerBg: '#0f1830',
    },
    Segmented: {
      trackBg: 'rgba(7, 11, 22, 0.6)',
      itemSelectedBg: 'rgba(224, 60, 75, 0.18)',
      itemSelectedColor: '#ff7875',
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 9,
      colorBgContainer: 'rgba(7, 11, 22, 0.6)',
      activeBorderColor: '#e03c4b',
      hoverBorderColor: 'rgba(56, 189, 248, 0.45)',
    },
    Select: {
      borderRadius: 9,
      colorBgContainer: 'rgba(7, 11, 22, 0.6)',
    },
    Tabs: {
      itemColor: '#9fb3d1',
      itemSelectedColor: '#ff7875',
      itemHoverColor: '#e8f1ff',
      inkBarColor: '#e03c4b',
    },
  },
};

export const getTheme = (key: ThemeKey): ThemeConfig =>
  key === 'tech' ? techTheme : simpleTheme;

export const THEME_LABELS: Record<ThemeKey, string> = {
  simple: '简约风',
  tech: '科技风',
};

export default simpleTheme;
