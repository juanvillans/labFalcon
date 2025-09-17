import React, { useEffect, useState } from "react";
import { examsAPI } from "../../services/api";
import { Pie, ResponsivePie } from "@nivo/pie";
import { Icon } from "@iconify/react";
import FormField from "../../components/forms/FormField";

const PieChart = ({ data }) => (
  <ResponsivePie
    data={data}
    innerRadius={0.5}
    margin={{ top: 30, right: 80, bottom: 50, left: 80 }}
    padAngle={0.6}
    cornerRadius={2}
    activeOuterRadiusOffset={8}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#333333"
    arcLinkLabelsThickness={2}
    arcLinkLabelsColor={{ from: "color" }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{
      from: "color",
      modifiers: [["darker", 4]],
    }}
  />
);

export default function HomePage() {
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("this_week");

  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await examsAPI.getChartData(selectedPeriod);
        setChartData(res.data);
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      }
    }

    fetchChartData();
  }, [selectedPeriod]);

  
  return (
    <>
      <title>Dashboard - LabFalcón</title>
      <div>
        <h1 className="text-lg md:text-2xl font-bold mb-4 ">Dashboard</h1>
        <FormField
          name={"sex"}
          type={"select"}
          className={"w-fit"}
          value={selectedPeriod}
          options={[
            { value: "today", label: "Hoy" },
            { value: "this_week", label: "Esta semana" },
            { value: "this_month", label: "Este mes" },
            { value: "this_year", label: "Este año" },
          ]}
          onChange={(e) => {

            setSelectedPeriod(e.target.value);
          }}
        />
        

        {chartData && (
          <div className="md:grid space-y-4 grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 mt-4">
            <div className="rounded-md p-4 md:p-7 neuphormism hover:shadow-none flex flex-col justify-between ">
              <p>Total Exámenes realizados</p>
              <b className=" text-gray-500 mt-auto text-right w-full ml-auto   flex justify-end items-end">
                <Icon
                  icon="hugeicons:labs"
                  className=" text-6xl block mb-2 text-color3"
                />
                <span
                  className={
                    chartData?.total.total > 999 ? "text-6xl" : `text-9xl`
                  }
                >
                  {chartData?.total.total}
                </span>
              </b>
            </div>

            <div className="rounded-md p-4 md:p-7 neuphormism hover:shadow-none flex flex-col justify-between ">
              <p>Total Pacientes atendidos</p>
              <b className=" text-gray-500 mt-auto text-right w-full ml-auto   flex justify-end items-end">
                <Icon
                  icon="mdi:patient-outline"
                  className=" text-6xl block mb-2 text-color3"
                />
                <span
                  className={
                    chartData?.analyses.total_patients > 999
                      ? "text-6xl"
                      : `text-9xl`
                  }
                >
                  {chartData?.analyses.total_patients}
                </span>
              </b>
            </div>

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Estado de examenes</p>
              <PieChart data={[
                  {
                    id: "validados",
                    label: "Validados",
                    value: chartData?.total.validated,
                  },
                  {
                    id: "Sin validar",
                    label: "Sin Validar",
                    value: chartData?.total.not_validated,
                  },
                ]}
              />
              
            </div>

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Tipo de exámenes realizados</p>
              <PieChart data={chartData?.perType} />
             
            </div>

            <div className="rounded-md p-4 md:p-7 min-h-[300px] relative col-span-2 neuphormism hover:shadow-none">
              <p>Mensaje de resultados validados</p>
              <PieChart data={[
                  {
                    id: "Enviado",
                    label: "Enviado",
                    value: chartData?.analyses.message_sent,
                  },
                  {
                    id: "No enviado",
                    label: "No Enviado",
                    value: chartData?.analyses.message_not_sent,
                  },
                  {
                    id: "Leído",
                    label: "Leído",
                    value: chartData?.analyses.message_read,
                  },

                  ]}
              />
            </div>


        
          </div>
        )}
      </div>
    </>
  );
}
