import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import CreateTicket from "./components/CreateTicket";
import TicketsList from "./components/TicketsList";

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", width: "100vw", overflowX: "hidden" }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">Ticket Manager</Link>
            <div className="navbar-nav">
              <Link to="/" className="nav-link">Crear Entrada</Link>
              <Link to="/tickets" className="nav-link">Ver Entradas</Link>
            </div>
          </div>
        </nav>
        <div className="container-fluid d-flex justify-content-center" style={{ flex: 1, width: "100vw" }}>
          <Routes>
            <Route path="/" element={<CreateTicket />} />
            <Route path="/tickets" element={<TicketsList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
