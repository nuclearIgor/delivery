import {Mapping} from "./components/Mapping";
import { ThemeProvider, CssBaseline} from "@mui/material"
import theme from "./theme";

import {SnackbarProvider} from "notistack";

function App() {
  return (
      <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} >
          <CssBaseline/>
            <Mapping/>
          </SnackbarProvider>
      </ThemeProvider>
  );
}

export default App;
