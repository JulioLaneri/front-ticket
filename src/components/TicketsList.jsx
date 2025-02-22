import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import QRScanner from "./QRScanner";

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' para más recientes primero
  const templateUrl = "/plantillaQR.jpg";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_tickets`);
      if (!response.ok) throw new Error("Error al obtener los tickets");
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredTickets = tickets
    .filter((ticket) =>
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });

  return (
    <div className="container mt-5">
      <h2>Lista de Entradas</h2>
      <div className="d-flex mb-3">
        <button className="btn btn-primary me-2" onClick={() => setShowScanner(true)}>
          Escanear QR
        </button>
        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="btn btn-secondary ms-2"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Ordenar por {sortOrder === "asc" ? "más recientes" : "más antiguos"}
        </button>
      </div>

      {showScanner && (
        <div className="d-flex justify-content-center mb-3">
          <QRScanner onScan={() => setShowScanner(false)} />
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <p>No hay entradas creadas aún.</p>
      ) : (
        <table className="table table-striped table-bordered" style={{ tableLayout: "fixed", textAlign: "left" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Evento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.event}</td>
                <td>
                  <button className={`btn btn-sm ${ticket.status === "activo" ? "btn-outline-success" : "btn-outline-danger"}`}>
                    {ticket.status}
                  </button>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => console.log("Descargar PDF")}>Descargar PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TicketsList;
