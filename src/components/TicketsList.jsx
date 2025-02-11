import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import QRScanner from "./QRScanner";

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const templateUrl = "/plantillaQR.jpg";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_tickets`);
      
      if (!response.ok) {
        throw new Error("Error al obtener los tickets");
      }
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
    console.log("Descargando PDF para el ticket:", ticket);
  
    if (!ticket.qr_code) {
      console.error("El valor del QR es undefined. Verifica el backend.");
      return;
    }
  
    const doc = new jsPDF("p", "px", [595, 842]); // A4 en píxeles
    const template = new Image();
    template.src = templateUrl;
  
    template.onload = async () => {
      console.log("Plantilla cargada correctamente");
  
      doc.addImage(template, "JPEG", 0, 0, 595, 842);
  
      // Configuración del QR ajustada
      const qrSize = 150;
      const pageWidth = 595;
      const qrX = pageWidth - qrSize - 60; // Aumentado a 60px de margen derecho (más a la izquierda)
      const qrY = 50; // Aumentado a 50px de margen superior (más abajo)
  
      try {
        const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, { width: qrSize });
  
        console.log("QR generado correctamente como imagen Base64");
  
        doc.addImage(qrDataUrl, "JPEG", qrX, qrY, qrSize, qrSize);
        console.log("QR agregado al PDF");
  
        const fileName = `Entrada_${ticket.name.replace(/ /g, "_")}.pdf`;
        console.log("Guardando PDF:", fileName);
        doc.save(fileName);
      } catch (error) {
        console.error("Error al generar el QR:", error);
      }
    };
  
    template.onerror = () => {
      console.error("Error al cargar la plantilla. Verifica la ruta del archivo.");
      alert("No se pudo cargar la plantilla. Asegúrate de que la imagen está en la carpeta public.");
    };
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Lista de Entradas</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowScanner(true)}>
        Escanear QR
      </button>
      {showScanner && <QRScanner onScan={handleScan} />}
      {tickets.length === 0 ? (
        <p>No hay entradas creadas aún.</p>
      ) : (
        <table className="table">
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
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.event}</td>
                <td>{ticket.status}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadTicketPDF(ticket)}
                  >
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