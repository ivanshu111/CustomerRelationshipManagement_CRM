import ChatbotWidget from "./components/ChatbotWidget";
import AppRoutes from "./routers/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
      <ChatbotWidget />
    </>
  );
}

export default App;
