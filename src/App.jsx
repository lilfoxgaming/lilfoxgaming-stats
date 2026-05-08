import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const csvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRI_9Fjhk6xaWi4uESJlJWcVuf_ojIfU93JKNeNL6F0CbQB4oEgHjarl8TrkU2FvnYI3OFiy5Rr7uH_/pub?gid=114858707&single=true&output=csv";

const columnHelper = createColumnHelper();

function App() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("individual");

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            const cleanedData = results.data.map((row) => {
              const cleanedRow = {};

              Object.keys(row).forEach((key) => {
                cleanedRow[key.trim()] = row[key];
              });

              return cleanedRow;
            });

            setData(cleanedData);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("CSV Fetch Error:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((player) =>
      player.Player?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const topPlayers = [...data]
    .sort((a, b) => Number(b.P) - Number(a.P))
    .slice(0, 3);

  const columns = [
    columnHelper.accessor("#", {
  header: "#",
  size: 40,
}),
    columnHelper.accessor("Player", { header: "Player" }),
    columnHelper.accessor("Team", { header: "Team" }),
    columnHelper.accessor("M", {
  header: "M",
  size: 45,
}),
    columnHelper.accessor("W", { header: "W" }),
    columnHelper.accessor("D", { header: "D" }),
    columnHelper.accessor("L", { header: "L" }),
    columnHelper.accessor("GF", { header: "GF" }),
    columnHelper.accessor("GA", {
  header: "GA",
  size: 45,
}),
    columnHelper.accessor("GD", {
  header: "GD",
  size: 45,
}),
    columnHelper.accessor("CS", {
  header: "CS",
  size: 45,
}),
    columnHelper.accessor("P", { header: "P" }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
        "radial-gradient(circle at top, #3a2b00 0%, #050505 60%)",
        color: "white",
        padding: window.innerWidth < 768 ? "6px" : "20px",
        fontFamily: "'Orbitron', sans-serif",
        fontFamily: "'Anton SC', sans-serif",
        overflow: "hidden",
        position: "relative",
        textShadow:
        "0 0 8px rgba(255,215,0,0.9), 0 0 25px rgba(255,215,0,0.5)",
        letterSpacing: "4px",
        fontWeight: "700",
        color: "#FFD700",
        WebkitTextStroke: "1px rgba(255,255,255,0.12)",
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: "#ff0000",
            },
            links: {
              color: "#ff0000",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
            },
            number: {
              value: 40,
            },
            opacity: {
              value: 0.3,
            },
            size: {
              value: { min: 1, max: 4 },
            },
          },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <motion.img
            src="/war.png"
            alt="WAR Logo"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            style={{
              width: "90px",
              filter: "drop-shadow(0 0 15px red)",
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              textAlign: "center",
              fontSize: window.innerWidth < 768 ? "2.4rem" : "4rem",
              lineHeight: window.innerWidth < 768 ? "1.2" : "1",
              fontWeight: "900",
              color: "#FFD700",
              letterSpacing: window.innerWidth < 768 ? "2px" : "4px",
              textShadow:
                "0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000",
              margin: "0",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            WARLORDZ WAR 52
          </motion.h1>
        </div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: "center",
            color: "#ddd",
            marginBottom: "5px",
            fontSize: "1.5rem",
          }}
        >
          Individual Performance
        </motion.h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          <img
            src="/fox.png"
            alt="LilFoxGaming"
            style={{
              width: "40px",
              filter: "drop-shadow(0 0 10px rgba(255,0,0,0.45))",
              
            }}
          />

          <p
            style={{
              color: "#888",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Powered by LilFoxGaming
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "individual", label: "Individual Performance" },
            { id: "standings", label: "Standings" },
            { id: "awards", label: "Awards" },
            { id: "fixtures", label: "Fixtures" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border:
                  activeTab === tab.id
                    ? "2px solid #FFD700"
                    : "1px solid #444",
                background:
                  activeTab === tab.id
                    ? "rgba(255,215,0,0.18)"
                    : "rgba(255,255,255,0.03)",
                color: activeTab === tab.id ? "#ff4d4d" : "#ccc",
                cursor: "pointer",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: "bold",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top Players */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: window.innerWidth < 768 ? "6px" : "20px",
            paddingLeft: window.innerWidth < 768 ? "6px" : "0",
            paddingRight: window.innerWidth < 768 ? "6px" : "0",
            boxSizing: "border-box",
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: "10px",
          }}
        >
          {topPlayers.map((player, index) => {
            const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: "rgba(255,215,0,0.05)",
                  backdropFilter: "blur(12px)",
                  border: `2px solid ${colors[index]}`,
                  borderRadius: "20px",
                  padding: window.innerWidth < 768 ? "12px" : "20px",
                  width: window.innerWidth < 768 ? "104px" : "220px",
                  minWidth: window.innerWidth < 768 ? "104px" : "220px",
                  textAlign: "center",
                  boxShadow: `0 0 25px ${colors[index]}`,
                }}
              >
                <h2 style={{ color: colors[index], fontSize: "2rem" }}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </h2>

                <h3>{player.Player}</h3>

                <p style={{ color: "#bbb" }}>
                  Team: {player.Team}
                </p>

                <p
                  style={{
                    color: colors[index],
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {player.P} PTS
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <input
            type="text"
            placeholder="Search Player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "14px",
              width: "320px",
              borderRadius: "14px",
              border: "1px solid #FFD700",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Content */}
        {activeTab !== "individual" ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#888",
              fontSize: "1.5rem",
            }}
          >
            {activeTab.toUpperCase()} COMING SOON
          </div>
        ) : loading ? (
          <h2 style={{ textAlign: "center" }}>Loading...</h2>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          width: header.column.columnDef.size,
                          padding: "16px",
                          background: "rgba(255,215,0,0.12)",
                          color: "#FFD700",
                          cursor: "pointer",
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(255,215,0,0.08)",
                    }}
                    style={{
                      background:
                        index % 2 === 0
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.01)",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          width: cell.column.columnDef.size,
                          padding: "14px",
                          textAlign: "center",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;