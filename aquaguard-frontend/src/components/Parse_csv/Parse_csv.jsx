import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GitHubCsvParser = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState({ from: "", to: "" });
  const [isValidTimeFrame, setIsValidTimeFrame] = useState(false);
  const [stats, setStats] = useState({
    maxTemperature: null,
    minTemperature: null,
    maxPressure: null,
    minPressure: null,
    maxWaterFlow: null,
    minWaterFlow: null,
  });
  const [stats2, setStats2] = useState({
    predictedTemperature: null,
    predictedPressure: null,
    predictedWaterFlow: null,
  });
  const [anomalies, setAnomalies] = useState({
    peakConsumption: [],
    pressureDrops: [],
    temperatureAnomalies: [],
  });

  // const personalAccessToken = "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";
  // const csvUrl = `https://api.github.com/repos/Ashaz4994/AGGLOMERATION/contents/Data/Readings.csv?ref=main`;

  const csvUrl = 'https://raw.githubusercontent.com/Ashaz4994/AGGLOMERATION/main/Data/Readings.csv';


  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  // const fetchCsv = async () => {
  //   try {
  //     const response = await fetch(csvUrl, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `token ${personalAccessToken}`,
  //         Accept: "application/vnd.github.v3.raw",
  //       },
  //       cache: "no-store",
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const rawCsvData = await response.text();

  //     return new Promise((resolve, reject) => {
  //       Papa.parse(rawCsvData, {
  //         header: true,
  //         skipEmptyLines: true,
  //         complete: (results) => {
  //           if (results.errors.length > 0) {
  //             reject(new Error("CSV parsing failed"));
  //           } else {
  //             resolve(results.data);
  //           }
  //         },
  //         error: (error) => {
  //           reject(error);
  //         },
  //       });
  //     });
  //   } catch (error) {
  //     showError(`Failed to fetch or parse CSV: ${error.message}`);
  //     throw error;
  //   }
  // };
  const fetchCsv = async () => {
      try {
        const response = await fetch(csvUrl, {
          method: "GET",
          cache: "no-store", // optional, prevents caching
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawCsvData = await response.text();

        return new Promise((resolve, reject) => {
          Papa.parse(rawCsvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error("CSV parsing failed"));
              } else {
                resolve(results.data);
              }
            },
            error: (error) => {
              reject(error);
            },
          });
        });
      } catch (error) {
        showError(`Failed to fetch or parse CSV: ${error.message}`);
        throw error;
      }
    };


  const handleUpdate = async () => {
    try {
      const newData = await fetchCsv();
      setData(newData);

      const slicedData = newData.slice(-60); // Default to last 60 data points
      updateStats(slicedData);
      detectAnomalies(slicedData);
      setFilteredData(slicedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    if (!isValidTimeFrame) {
      handleUpdate();
      const intervalId = setInterval(handleUpdate, 5000);
      return () => clearInterval(intervalId);
    }
  }, [isValidTimeFrame]);

  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    }
    if (modifier.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleFilter = () => {
    const { from, to } = timeRange;

    if (!from && !to) {
      setFilteredData(data.slice(-60));
      setIsValidTimeFrame(false);
      return;
    }

    const from24 = from ? convertTo24HourFormat(from) : null;
    const to24 = to ? convertTo24HourFormat(to) : null;

    if (from24 && to24 && from24 > to24) {
      showError("Invalid time range: 'From' time must be before 'To' time");
      setIsValidTimeFrame(false);
      return;
    }

    const filtered = data.filter((item) => {
      const time = item["Timestamp"].split(" ")[1].slice(0, 5);
      if (from24 && to24) return time >= from24 && time <= to24;
      if (from24) return time >= from24;
      if (to24) return time <= to24;
      return false;
    });

    setFilteredData(filtered);
    if (filtered.length) {
      updateStats(filtered);
      detectAnomalies(filtered);
      setIsValidTimeFrame(true);
      setError(null);
    } else {
      setIsValidTimeFrame(false);
      showError("No data available for the selected time range");
    }
  };

  const updateStats = (dataSubset) => {
    if (!dataSubset || dataSubset.length === 0) return;

    const temperatures = dataSubset.map((item) =>
      parseFloat(item["Temperature (°C)"])
    );
    const pressures = dataSubset.map((item) =>
      parseFloat(item["Pressure (bar)"])
    );
    const waterFlows = dataSubset.map((item) =>
      parseFloat(item["Water Flow (L/min)"])
    );

    setStats({
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      maxPressure: Math.max(...pressures),
      minPressure: Math.min(...pressures),
      maxWaterFlow: Math.max(...waterFlows),
      minWaterFlow: Math.min(...waterFlows),
    });
  };

  const detectAnomalies = (dataSubset) => {
    if (!dataSubset || dataSubset.length === 0) return;

    const peakConsumption = [];
    const pressureDrops = [];
    const temperatureAnomalies = [];
    let m_t = 0,
      m_p = 0,
      m_w = 0;
    let beta = 0.9;
    let second_last = 0;
    dataSubset.forEach((item, index) => {
      const waterFlow = parseFloat(item["Water Flow (L/min)"]);
      const pressure = parseFloat(item["Pressure (bar)"]);
      const temperature = parseFloat(item["Temperature (°C)"]);
      const timestamp = item["Timestamp"];
      m_t = beta * temperature + m_t * (1 - beta);
      m_p = beta * pressure + m_p * (1 - beta);
      m_w = beta * waterFlow + m_w * (1 - beta);

      if (second_last && (waterFlow - second_last) / second_last > 0.1) {
        peakConsumption.push({ timestamp, value: waterFlow });
      }

      if (index > 0) {
        const prevPressure = parseFloat(
          dataSubset[index - 1]["Pressure (bar)"]
        );
        if (pressure < prevPressure - 0.5 || pressure > prevPressure + 0.5) {
          pressureDrops.push({ timestamp, value: pressure });
        }
      }

      if (temperature < 15 || temperature > 50) {
        temperatureAnomalies.push({ timestamp, value: temperature });
      }
      second_last = waterFlow;
    });
    setStats2({
      predictedTemperature: m_t,
      predictedPressure: m_p,
      predictedWaterFlow: m_w,
    });
    setAnomalies({ peakConsumption, pressureDrops, temperatureAnomalies });
  };

  const timestamps = filteredData.map(
    (item) => item["Timestamp"].split(" ")[1]
  );
  const temperatures = filteredData.map((item) =>
    parseFloat(item["Temperature (°C)"])
  );
  const pressures = filteredData.map((item) =>
    parseFloat(item["Pressure (bar)"])
  );
  const waterFlows = filteredData.map((item) =>
    parseFloat(item["Water Flow (L/min)"])
  );

  const barChartData = {
    labels: timestamps,
    datasets: [
      {
        label: `Temperature (°C) Max: ${stats.maxTemperature}, Min: ${stats.minTemperature}`,
        data: temperatures,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: timestamps,
    datasets: [
      {
        label: `Pressure (bar) Max: ${stats.maxPressure}, Min: ${stats.minPressure}`,
        data: pressures,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
      {
        label: `Water Flow (L/min) Max: ${stats.maxWaterFlow}, Min: ${stats.minWaterFlow}`,
        data: waterFlows,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sensor Data Visualization",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Values",
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Sensor Data</h1>
      {lastUpdated && (
        <p className="text-sm text-gray-600 text-center mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-4 mb-4">
        <div>
          <label htmlFor="from" className="block mb-2 text-sm font-medium">
            From:
          </label>
          <input
            type="text"
            id="from"
            placeholder="e.g., 2:00 PM"
            value={timeRange.from}
            onChange={(e) =>
              setTimeRange({ ...timeRange, from: e.target.value })
            }
            className="border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="to" className="block mb-2 text-sm font-medium">
            To:
          </label>
          <input
            type="text"
            id="to"
            placeholder="e.g., 3:00 PM"
            value={timeRange.to}
            onChange={(e) => setTimeRange({ ...timeRange, to: e.target.value })}
            className="border border-gray-300 rounded p-2"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-blue-500 text-white rounded p-2 mt-6"
        >
          Filter
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Existing Stats */}
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-center">{key}</h3>
            <p className="text-center text-lg">{value ?? "N/A"}</p>
          </div>
        ))}
       </div>
        {/* Predicted Stats */}
        <p className="m-auto font-bold mb-10 text-2xl">Prediction For next Minute</p>
        <div class="flex justify-between ml-96 mr-96 mb-10">
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="font-semibold text-center">Predicted Temperature</h3>
          <p className="text-center text-lg">
            {stats2.predictedTemperature !== null
              ? `${stats2.predictedTemperature.toFixed(2)} °C`
              : "Calculating..."}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="font-semibold text-center">Predicted Pressure</h3>
          <p className="text-center text-lg">
            {stats2.predictedPressure !== null
              ? `${stats2.predictedPressure.toFixed(2)} bar`
              : "Calculating..."}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="font-semibold text-center">Predicted Water Flow</h3>
          <p className="text-center text-lg">
            {stats2.predictedWaterFlow !== null
              ? `${stats2.predictedWaterFlow.toFixed(2)} L/min`
              : "Calculating..."}
          </p>
        </div>
        </div>
      

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-center">
          Temperature Bar Chart
        </h2>
        <Bar data={barChartData} options={options} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-center">
          Pressure and Water Flow Line Chart
        </h2>
        <Line data={lineChartData} options={options} />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-center">Anomalies</h2>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Peak Consumption</h3>
          {anomalies.peakConsumption.length > 0 ? (
            <ul className="list-disc ml-4">
              {anomalies.peakConsumption.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {item.timestamp}, <span className="font-medium">Value:</span>{" "}
                  {item.value} L/min
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No peak consumption anomalies detected.
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow mt-4">
          <h3 className="text-lg font-semibold mb-2">Pressure Drops</h3>
          {anomalies.pressureDrops.length > 0 ? (
            <ul className="list-disc ml-4">
              {anomalies.pressureDrops.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {item.timestamp}, <span className="font-medium">Value:</span>{" "}
                  {item.value} bar
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No pressure drop anomalies detected.
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow mt-4">
          <h3 className="text-lg font-semibold mb-2">Temperature Anomalies</h3>
          {anomalies.temperatureAnomalies.length > 0 ? (
            <ul className="list-disc ml-4">
              {anomalies.temperatureAnomalies.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {item.timestamp}, <span className="font-medium">Value:</span>{" "}
                  {item.value} °C
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No temperature anomalies detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubCsvParser;
