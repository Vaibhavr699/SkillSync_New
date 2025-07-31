import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body, html {
    font-family: 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif';
    line-height: 1.5;
    background-color: ${({ theme }) => theme.palette.background.default};
    color: ${({ theme }) => theme.palette.text.primary};
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  .MuiDataGrid-root {
    border: none !important;
  }

  .MuiDataGrid-columnHeaders {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }

  .MuiDataGrid-cell {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider} !important;
  }
`;