import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import SecretrariaLogo from "../assets/secretaria_logo.png";
import Latidos from "../assets/latidos.png";
import FuturisticButton from "./FuturisticButton";
import firmaDigital from "../assets/firmaDigital.png";
import QRCode from "react-qr-code";
import { examResultsAPI } from "../services/api";

const PrintableContent = forwardRef((props, ref) => {
  console.log({props})
  if (!'patient' in props.data) {
    return <div className="flex justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  </div>
  } else {
    return (
      <div
        ref={ref}
        className="w-full mx-auto bg-white border relative"
        style={{ padding: "10mm", width: "210mm", height: "297mm" }}
      >
        <header
          style={{
            marginBlock: "50px !important",
            marginBottom: "50px !important",
          }}
          className="my-2 relative flex justify-center items-center py-4"
        >
          <img src={SecretrariaLogo} alt="" className="absolute left-4 w-16" />
  
          <div className="text-center font-bold">
            <p>Secretaria de Salud de Falcón.</p>
            <p>Laboratorio.</p>
          </div>
  
          <img src={Latidos} alt="" className="absolute right-4 w-24" />
        </header>
        <table className="text-left w-full text-xs border-collapse mb-5">
          <thead>
            <tr className="py-1 text-gray-700">
              <th className="px-2">Paciente</th>
              <th className="px-2">C.I</th>
              <th className="px-2">Edad</th>
              <th className="px-2">Sexo</th>
              <th className="px-2">Registrado</th>
              <th className="px-2">Cód</th>
            </tr>
          </thead>
          <tbody>
            <tr className="py-1">
              <td className="px-2">
                {props.data?.patient?.first_name +
                  " " +
                  props.data?.patient?.last_name}
              </td>
              <td className="px-2">{props.data?.patient?.ci}</td>
              <td className="px-2">{props.data?.age}</td>
              <td className="px-2">{props.data?.patient?.sex[0]}</td>
              <td className="px-2">
                {props.data?.created_date?.replace(/-/g, "/")} -{" "}
                {props.data?.created_time}
              </td>
              <td className="px-2">{props.data?.id}</td>
            </tr>
          </tbody>
        </table>
        {/* <p>
          Nombres y apellidos:{" "}
          {props.data?.patient?.first_name + " " + props.data?.patient?.last_name}
        </p>
        <p>C.I: {props.data?.patient?.ci}</p>
        <p>Fecha de Nacimiento: {props.data?.patient?.date_birth}</p>
        <p>Sexo: {props.data?.patient?.sex}</p> */}
        {Object.entries(props?.data?.tests).map(([examination_type_id, exam]) => (
          <div key={examination_type_id} className="mb-7 border rounded-xl pb-0">
            <h1
              style={{
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact", // Firefox support
              }}
              className="pt-1  font-semibold uppercase text-lg bg-gray-50 text-center text-gray-800 rounded-t-xl"
            >
              <span className="text-gray-300 mx-1">--</span> {exam.testTypeName}{" "}
              <span className="text-gray-300 mx-1">--</span>
            </h1>
            {exam.method ? (
              <p
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact", // Firefox support
                }}
                className="bg-gray-50 text-center text-sm px-2 py-0.5 "
              >
                {" "}
                {exam.method}
              </p>
            ) : (
              ""
            )}
            {/* <p className="text-center text-gray-200">|</p>  */}
  
            <table className="mb-1 text-sm w-full text-left">
              <thead
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact", // Firefox support
                }}
                className="bg-gray-50 w-full text-gray-700"
              >
                <tr className="py-1">
                  <th className="px-3 w-1/3">Prueba</th>
                  <th className="px-3 w-1/3">Resultado</th>
                  <th className="px-3 w-1/3">Rango de Referencia</th>
                </tr>
              </thead>
              <tbody>
                {props.examinationTypes[examination_type_id-1].tests.map(({name}, i) => {
                  const testValObj = exam.testValues[name];
                  if (testValObj.value.trim() === "") {
                    return <></>;
                  } else {
                    return (
                      <React.Fragment key={`fragment-${i}-${examination_type_id}`}> {/* <-- ¡Añadir la clave aquí! */}
  
                        {i === 0 && examination_type_id == 7 && (
                          <tr className="flex justify-between items-center col-span-2">
                            <td colSpan={3} className="text-md font-bold text-gray-700 ml-2">
                              Examen Físico
                            </td>
                          </tr>
                        )}
                        {i === 5 && examination_type_id == 7 && (
                          <tr className="flex justify-between items-center mt-4 col-span-2">
                            <td colSpan={3} className="text-md font-bold text-gray-700 ml-2">
                              Examen Microscópico
                            </td>
                          </tr>
                        )}
                        {i === 13 && examination_type_id == 7 && (
                          <tr className="flex justify-between items-center mt-4 col-span-2">
                            <td colSpan={3} className="text-md font-bold text-gray-700 ml-2">
                              Examen Químico
                            </td>
                          </tr>
                        )}
                        <tr key={name+"_test"+"_"+examination_type_id} className="py-5">
                          <td
                            style={{
                              paddingInline: "12px",
                              paddingBlock: "1.5px",
                            }}
                            className="w-1/3"
                          >
                            {testValObj.label}
                          </td>
                          <td
                            style={{
                              paddingInline: "12px",
                              paddingBlock: "1.5px",
                            }}
                            className="w-1/3"
                          >
                            {testValObj.value}{" "}
                            {testValObj.unit ? (
                              <span className="text-sm">
                                {" "}
                                {testValObj.unit}
                              </span>
                            ) : null}
                          </td>
                          <td
                            style={{
                              paddingInline: "12px",
                              paddingBlock: "1.5px",
                            }}
                            className="w-1/3"
                          >
                            {testValObj.reference_range?.min || ""} -{" "}
                            {testValObj.reference_range?.max || ""}
                            {testValObj.unit ? (
                              <span className="text-sm">
                                {" "}
                                {testValObj.unit}
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  }
                })}
              </tbody>
            </table>
  
            {exam.observation ? (
              <p className="text-sm px-2 mt-2 pb-1">
                <b>Observación:</b> {exam.observation}
              </p>
            ) : (
              ""
            )}
          </div>
        ))}
        {props.data.all_validated && (
          <div className="absolute bottom-10 left-10 right-10 flex justify-between">
            <div style={{ width: "min-content" }}>
              <QRCode
                size={106}
                value={`${window.location.origin}/results/${props.token}`}
              />
              <p className="text-xs text-center mt-2 pr-1">Validar resultados</p>
            </div>
            <img
              draggable={false}
              className="w-28 min-w-[132px] h-max"
              src={firmaDigital}
              alt=""
            />
          </div>
        )}
      </div>
    );

  }
});

const PrintPage = (props) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Examen-${props.data?.patient?.first_name}-${props.data?.patient?.last_name}-${props.data?.patient?.ci}-${props.data.created_date}`,
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
          {props.data.all_validated && (
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
          )}
        </div>
      )}

      <div className={props.isHidden ? "hidden" : ""}>
        {props.data && (
          <PrintableContent
            examinationTypes={props.examinationTypes}
            data={props.data}
            ref={componentRef}
            token={props.token}
            className=""
            size="A4"
          />
        )}
      
      </div>
    </div>
  );
};

export default PrintPage;
