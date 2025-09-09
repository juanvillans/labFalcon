import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import Latidos from "../assets/latidos.png";
import FuturisticButton from "./FuturisticButton";
import firmaDigital from "../assets/firmaDigital.png";

const PrintableContent = React.memo(
  React.forwardRef((props, ref) => {
    return (
      <div
        ref={ref}
        className="w-full mx-auto bg-white border"
        style={{ padding: "20mm", width: "210mm", height: "297mm" }}
      >
        <header
          style={{
            marginBlock: "50px !important",
            marginBottom: "50px !important",
          }}
          className="my-2 relative flex justify-center items-center py-4"
        >
          <img src={SecretrariaLogo} alt="" className="absolute left-4 w-16" />

          <div className="text-center">
            <p>Secretaria de Salud de Falcón.</p>
            <p>Laboratorio.</p>
          </div>

          <img src={Latidos} alt="" className="absolute right-4 w-24" />
        </header>
        <p>
          Nombres y apellidos:{" "}
          {props.data.patient.first_name + " " + props.data.patient.last_name}
        </p>
        <p>C.I: {props.data.patient.ci}</p>
        <p>Fecha de Nacimiento: {props.data.patient.date_birth}</p>
        <p>Sexo: {props.data.patient.sex}</p>
        {Object.entries(props.data.tests).map(([key, value]) => (
          <div key={key}>
            <h1 className="font-semibold uppercase text-lg text-center">
              {value.testTypeName}
            </h1>

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
                {Object.keys(value.testValues).map((key) => {
                  if (value.testValues[key].value.trim() === "") {
                    return <></>;
                  } else {
                    return (
                    <tr key={key} className="py-5">
                      <td
                        style={{ paddingInline: "12px", paddingBlock: "5px" }}
                      >
                        {value.testValues[key].label}
                      </td>
                      <td
                        style={{ paddingInline: "12px", paddingBlock: "5px" }}
                      >
                        {value.testValues[key].value}{" "}
                        {value.testValues[key].unit ? (
                          <span className="text-sm">
                            {" "}
                            {value.testValues[key].unit}
                          </span>
                        ) : null}
                      </td>
                      <td
                        style={{ paddingInline: "12px", paddingBlock: "5px" }}
                      >
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
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        ))}
            <div className="flex justify-between">
                <div>
                  Qr
                </div>
            <img className="w-28" src={firmaDigital} alt="" />
            </div>
      </div>
    );
  })
);

const PrintPage = React.memo(function PrintPage(props) {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Examen-${props.data.patient.first_name}-${props.data.patient.last_name}-${props.data.patient.ci}-${props.data.created_date}`,
    pageStyle: `
      @page {
        margin: 20mm;
        size: A4;

      }
      body {
        font-family: Arial, sans-serif;
        color: black;
      }
    `,
  });

  return (
    <div>
      {props.isHidden ? (
        <button onClick={handlePrint} title="Imprimir">
          <Icon
            icon="material-symbols:print-rounded"
            className="w-6 h-6 text-gray-500  ml-2"
          />
        </button>
      ) : (
        <div className="flex justify-center mb-4">
          <FuturisticButton
            onClick={handlePrint}
            title="Imprimir"
            className="flex gap-2 text-xl mx-auto py-1 px-2 "
          >
            <Icon
              icon="material-symbols:download-rounded"
              className="w-6 h-6 text-gray-700  mr-3 inline "
            />
            <span>Descargar / Imprimir</span>
          </FuturisticButton>
        </div>
      )}

      <div className={props.isHidden ? "hidden" : ""}>
        <PrintableContent
          data={props.data}
          ref={componentRef}
          className=""
          size="A4"
        />
      </div>
    </div>
  );
});

export default PrintPage;
