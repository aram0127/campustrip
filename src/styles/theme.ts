// 라이트 모드
const lightColors = {
  primary: '#007AFF',
  secondary: '#28a745',
  text: '#1C1C1E',
  background: '#FFFFFF',
  grey: '#8E8E93',
  error: '#FF3B30',
  borderColor: '#E5E5EA',
  secondaryTextColor: '#8E8E93', 
  inputBackground: '#F2F2F7', 
};

// 다크 모드
const darkColors = {
  primary: '#0A84FF',
  secondary: '#30D158',
  text: '#FFFFFF',
  background: '#1C1C1E',
  grey: '#8E8E93',
  error: '#FF453A',
  borderColor: '#3A3A3C',
  secondaryTextColor: '#8E8E93',
  inputBackground: '#2C2C2E', 
};

const fontSizes = {
  title: '24px',
  subtitle: '20px',
  body: '16px',
  caption: '12px',
};

// lightTheme과 darkTheme을 각각 export
export const lightTheme = {
  colors: lightColors,
  fontSizes,
};

export const darkTheme = {
  colors: darkColors,
  fontSizes,
};