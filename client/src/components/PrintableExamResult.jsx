import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import Latidos from "../assets/latidos.png";

const PrintableContent = React.forwardRef((props, ref) => {
  console.log(props);
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
      <p>Nombres y apellidos: {props.data.first_name + " " + props.data.last_name}</p>
      <p>C.I: {props.data.ci}</p>
      <p>Fecha de Nacimiento: {props.data.date_birth}</p>
      <p>Sexo: {props.data.sex}</p>
      <h1 className="font-semibold uppercase text-lg text-center">{props.data.examination_type_name}</h1>
      <p className="text-center ">Realizada el {props.data.created_date}</p>

      <table className="mt-7">
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
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                {props.data.test_values[key].label}
              </td>
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                {props.data.test_values[key].value}{" "}
                {props.data.test_values[key].unit ? (
                  <span className="text-sm">
                    {" "}
                    {props.data.test_values[key].unit}
                  </span>
                ) : null}
              </td>
              <td style={{ paddingInline: "12px", paddingBlock: "5px" }}>
                {props.data.test_values[key].reference_range?.min || ""} -{" "}
                {props.data.test_values[key].reference_range?.max || ""}
                {props.data.test_values[key].unit ? (
                  <span className="text-sm">
                    {" "}
                    {props.data.test_values[key].unit}
                  </span>
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
