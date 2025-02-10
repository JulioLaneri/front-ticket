import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode"; // Importar la librería qrcode
import QRScanner from "./QRScanner"; // Importar el componente QRScanner

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [showScanner, setShowScanner] = useState(false); // Estado para mostrar/ocultar el escáner
  const templateUrl = "/plantillaQR.jpg"; 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Función para obtener los tickets desde el backend
  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_tickets`);
      
      if (!response.ok) {
        throw new Error("Error al obtener los tickets");
      }
      const data = await response.json();
      setTickets(data); // Actualiza el estado con los tickets obtenidos
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función para manejar el escaneo de un QR
  const handleScan = async (qrCodeData) => {
    setShowScanner(false); // Ocultar el escáner después de escanear
    console.log("Código QR escaneado:", qrCodeData);

    // Llamar al backend para validar el ticket
    try {
      const response = await fetch(`${API_BASE_URL}/scan_ticket/${qrCodeData}`);
      const data = await response.json();
      if (response.ok) {
        alert(`Ticket validado: ${data.message}`);
        // Actualizar la lista de tickets
        fetchTickets();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al validar el ticket:", error);
      alert("Error al validar el ticket. Inténtalo de nuevo.");
    }
  };

  // Función para generar y descargar el PDF de un ticket
  const downloadTicketPDF = async (ticket) => {
    console.log("Descargando PDF para el ticket:", ticket);
  
    if (!ticket.qr_code) {
      console.error("El valor del QR es undefined. Verifica el backend.");
      return;
    }
  
    const doc = new jsPDF("p", "px", [595, 842]); // A4 en píxeles
    const template = new Image();
    template.src = templateUrl; // Ruta de la plantilla en la carpeta public
  
    // Esperar a que la imagen de la plantilla cargue antes de proceder
    template.onload = async () => {
      console.log("Plantilla cargada correctamente");
  
      // Agregar la plantilla como fondo del PDF
      doc.addImage(template, "JPEG", 0, 0, 595, 842);
  
      // Tamaño y ubicación del código QR
      const qrSize = 150;
      const qrX = (595 - qrSize) / 2;
      const qrY = 600;
  
      // Generar QR como imagen Base64
      try {
        const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, { width: qrSize });
  
        console.log("QR generado correctamente como imagen Base64");
  
        // Agregar el código QR al PDF
        doc.addImage(qrDataUrl, "JPEG", qrX, qrY, qrSize, qrSize);
        console.log("QR agregado al PDF");
  
        // Guardar el PDF con el nombre del comprador
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
  

  // Obtener los tickets cuando el componente se monta
  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Lista de Entradas</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowScanner(true)}>
        Escanear QR
      </button>
      {showScanner && <QRScanner onScan={handleScan} />} {/* Mostrar el escáner si showScanner es true */}
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