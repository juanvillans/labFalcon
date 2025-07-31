import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import Latidos from "../assets/latidos.png";

const PrintableContent = React.memo(React.forwardRef((props, ref) => {
  console.log("PrintableContent rendered with props:", props);
  return (
    <div ref={ref} className="w-full" >
      <header style={{marginBlock: "50px !important", marginBottom: "50px !important"}} className="my-2 relative flex justify-center items-center py-4">
        <img src={SecretrariaLogo} alt="" className="absolute left-4 w-16" />

        <div className="text-center">
          <p>Secretaria de Salud de Falcón.</p>
          <p>Laboratorio.</p>
        </div>

        <img src={Latidos} alt="" className="absolute right-4 w-24" />
      </header>
      <p>Nombres y apellidos: {props.data.patient.first_name + " " + props.data.patient.last_name}</p>
      <p>C.I: {props.data.patient.ci}</p>
      <p>Fecha de Nacimiento: {props.data.patient.date_birth}</p>
      <p>Sexo: {props.data.patient.sex}</p>
      {
        Object.entries(props.data.tests).map(([key, value]) => (
          <div key={key}>
            <h1 className="font-semibold uppercase text-lg text-center">{value.testTypeName}</h1>

            <table className="mt-2 mb-4">
              <thead
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact", // Firefox support
                }}
                className="bg-gray-200 w-full text-black"
              >
                <tr className="py-1">
                  <th className="px-3">Prueba</th>
                  <th className="px-3">Resultado</th>
                  <th className="px-3">Rango de Referencia</th>
                </tr>
                </thead>
                <tbody>
                  {Object.keys(value.testValues).map((key) => (
                    <tr key={key} className="py-5">
                      <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                        {value.testValues[key].label}
                      </td>
                      <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                        {value.testValues[key].value}{" "}
                        {value.testValues[key].unit ? (
                          <span className="text-sm">
                            {" "}
                            {value.testValues[key].unit}
                          </span>
                        ) : null}
                      </td>
                      <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                        {value.testValues[key].reference_range?.min || ""} -{" "}
                        {value.testValues[key].reference_range?.max || ""}
                        {value.testValues[key].unit ? (
                          <span className="text-sm">
                            {" "}
                            {value.testValues[key].unit}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           
          ))
      }
     </div>
  );
}));

const PrintPage = React.memo(function PrintPage(data) {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Examen-Medico",
    pageStyle: `
      @page {
        margin: 20mm;
      }
      body {
        font-family: Arial, sans-serif;
        color: black;
      }
    `,
  });

  return (
    <div>
      <div className="hidden">
        <PrintableContent
          data={data.data}
          ref={componentRef}
          className="hidden"
        />
      </div>
      <button onClick={handlePrint} title="Imprimir">
        <Icon
          icon="material-symbols:print-rounded"
          className="w-6 h-6 text-color2 mt-3.5 ml-2"
        />
      </button>
    </div>
  );
});

export default PrintPage;
