// 라이트 모드
const lightColors = {
  primary: "#007AFF",
  secondary: "#28a745",
  text: "#1C1C1E",
  background: "#FFFFFF",
  grey: "#8E8E93",
  error: "#FF3B30",
  borderColor: "#E5E5EA",
  secondaryTextColor: "#8E8E93",
  inputBackground: "#F2F2F7",
};

// 다크 모드
const darkColors = {
  primary: "#0A84FF",
  secondary: "#30D158",
  text: "#FFFFFF",
  background: "#1C1C1E",
  grey: "#8E8E93",
  error: "#FF453A",
  borderColor: "#3A3A3C",
  secondaryTextColor: "#8E8E93",
  inputBackground: "#2C2C2E",
};

// 공용 값들
const fontSizes = {
  title: "24px",
  subtitle: "20px",
  body: "16px",
  caption: "12px",
};

const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
};

// 4px 기반의 공용 간격 ( margin, padding )
const spacings = {
  xxsmall: "4px",
  xsmall: "8px",
  small: "12px",
  medium: "16px",
  large: "24px",
  xlarge: "32px",
  xxlarge: "48px",
};

// 공용 테두리 둥글기
const borderRadius = {
  small: "4px",
  medium: "8px",
  large: "16px",
  circle: "50%",
};

// lightTheme과 darkTheme을 각각 export
export const lightTheme = {
  colors: lightColors,
  fontSizes,
  fontWeights,
  spacings,
  borderRadius,
};

export const darkTheme = {
  colors: darkColors,
  fontSizes,
  fontWeights,
  spacings,
  borderRadius,
};
