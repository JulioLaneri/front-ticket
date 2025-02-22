import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import QRScanner from "./QRScanner";

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
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


  const handleScan = async (qrCodeData) => {
    setShowScanner(false);
    console.log("Código QR escaneado:", qrCodeData);
    try {
      const response = await fetch(`${API_BASE_URL}/scan_ticket/${qrCodeData}`);
      const data = await response.json();
      if (response.ok) {
        alert(`Ticket validado: ${data.message}`);
        fetchTickets();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al validar el ticket:", error);
      alert("Error al validar el ticket. Inténtalo de nuevo.");
    }
  };

  const downloadTicketPDF = async (ticket) => {
    if (!ticket.qr_code) {
      console.error("El valor del QR es undefined. Verifica el backend.");
      return;
    }
    
    const doc = new jsPDF("p", "px", [595, 842]);
    const template = new Image();
    template.src = templateUrl;
    
    template.onload = async () => {
      doc.addImage(template, "JPEG", 0, 0, 595, 842);
      
      const qrSize = 150;
      const qrX = 535 - qrSize;
      const qrY = 50;
      
      try {
        const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, { width: qrSize });
        doc.addImage(qrDataUrl, "JPEG", qrX, qrY, qrSize, qrSize);
        const fileName = `Entrada_${ticket.name.replace(/ /g, "_")}.pdf`;
        doc.save(fileName);
      } catch (error) {
        console.error("Error al generar el QR:", error);
      }
    };
    
    template.onerror = () => {
      console.error("Error al cargar la plantilla.");
      alert("No se pudo cargar la plantilla.");
    };
  };

  const filteredTickets = tickets
    .filter((ticket) =>
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));

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
          <QRScanner onScan={handleScan} />
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <p>No hay entradas creadas aún.</p>
      ) : (
        <table className="table table-striped table-bordered" style={{ tableLayout: "fixed", textAlign: "left" }}>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>ID</th>
              <th style={{ width: "20%" }}>Nombre</th>
              <th style={{ width: "30%" }}>Email</th>
              <th style={{ width: "20%" }}>Evento</th>
              <th style={{ width: "10%" }}>Estado</th>
              <th style={{ width: "15%" }}>Acciones</th>
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
                  <button className={`btn btn-sm ${ticket.status === "active" ? "btn-outline-success" : "btn-outlsine-danger"}`}>
                    {ticket.status}
                  </button>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => downloadTicketPDF(ticket)}>
                    Descargar PDF
                  </button>
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
