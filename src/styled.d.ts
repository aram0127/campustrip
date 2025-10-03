import 'styled-components';
import { lightTheme } from './styles/theme';

// lightTheme 객체의 타입을 추론
type Theme = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}