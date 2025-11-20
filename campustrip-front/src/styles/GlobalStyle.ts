import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    word-break: keep-all;
    overflow-wrap: break-word;
    overflow: hidden;
  }

  #root {
    min-height: 100%;
    height: 100%;
    width: 100%;
  }
`;

export default GlobalStyle;
