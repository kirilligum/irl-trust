import logo from "./logo.svg";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Landing from "./components/Landing/Landing";
import Lender from "./components/Lender/Lender";

import "./App.css";
import Borrower from "./components/Borrower/Borrower";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/borrow" element={<Borrower />} />
        <Route path="/borrow">
          <Route path=":id" element={<Borrower />} />
        </Route>
        <Route path="/lend" element={<Lender />} />
        <Route path="/lend">
          <Route path=":id" element={<Lender />} />
        </Route>
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;
