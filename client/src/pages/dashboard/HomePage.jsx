import React, { useEffect, useState } from "react";
import { examsAPI } from "../../services/api";

export default function HomePage() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await examsAPI.getChartData("this_month");
        setChartData(res.data);
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      }
    }

    fetchChartData();
  }, []);

  console.log({ chartData });
  return (
    <>
      <title>Dashboard - LabFalcón</title>
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="grid grid-cols-4 min-h-36 gap-4 mt-4">
          <div className="rounded-md p-7 neuphormism flex flex-col justify-between ">
            <p>Total Exámenes realizados</p>
            <b className="text-4xl mt-auto text-right w-full ml-auto block ">
              {chartData?.total.total}
            </b>
          </div>
          
          <div className="rounded-md p-7 neuphormism flex flex-col justify-between ">
            <p>Total Pacientes atendidos</p>
            <b className="text-4xl mt-auto text-right w-full ml-auto block ">
              {chartData?.totalPatients}
            </b>
          </div>

          <div className="rounded-md p-7 neuphormism flex flex-col justify-between ">
            <p>Exámenes validados</p>
            <b className="text-4xl mt-auto text-right w-full ml-auto block ">
              {chartData?.total.validated}
            </b>
          </div>
          <div className="rounded-md p-7 neuphormism flex flex-col justify-between ">
            <p>Exámenes no validados</p>
            <b className="text-4xl mt-auto text-right w-full ml-auto block ">
              {chartData?.total.not_validated}
            </b>
          </div>
        </div>
      </div>
    </>
  );
}
