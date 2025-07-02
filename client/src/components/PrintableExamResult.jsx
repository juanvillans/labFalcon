import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";

const PrintableContent = React.forwardRef((props, ref) => {
  console.log(props);
  return (
    <div ref={ref} className="w-full">
      <h1>Resultados del Exámen de {props.data.examination_type_name}</h1>
      <p>Paciente: {props.data.first_name + " " + props.data.last_name}</p>
      <p>C.I: {props.data.ci}</p>
      <p>Date: {props.data.created_date}</p>

      <table className="mt-4">
        <thead
          style={{
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact", // Firefox support
          }}
          className="bg-gray-200 text-black"
        >
          <tr className="py-1">
            <th className="px-3">Prueba</th>
            <th className="px-3">Resultado</th>
            <th className="px-3">Rango de Referencia</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(props.data.test_values).map((key) => (
            <tr key={key} className="py-5">
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>{props.data.test_values[key].label}</td>
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>{props.data.test_values[key].value} {props.data.test_values[key].unit ? (
                  <span className="text-sm"> {props.data.test_values[key].unit}</span>
                ) : null}</td>
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                {props.data.test_values[key].reference_range?.min || ""} -{" "}
                {props.data.test_values[key].reference_range?.max || ""}
                {props.data.test_values[key].unit ? (
                  <span className="text-sm"> {props.data.test_values[key].unit}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default function PrintPage(data) {
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
}
