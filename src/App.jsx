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
  const [selectedAward, setSelectedAward] =
  useState("goldenBoot");

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
  const maxMatches = Math.max(
  ...data.map((player) => Number(player.M) || 0)
);

const minimumMatchesRequired = Math.ceil(
  maxMatches * 0.75
);

const eligiblePlayers = data.filter(
  (player) =>
    Number(player.M) >= minimumMatchesRequired
);

  const topPlayers = [...eligiblePlayers]
    .sort((a, b) => Number(b.P) - Number(a.P))
    .slice(0, 3);

  const awardsData = {
  goldenBoot: [...eligiblePlayers]
    .sort((a, b) => Number(b.GF) - Number(a.GF))
    .slice(0, 5),

  goldenGlove: [...eligiblePlayers]
    .sort((a, b) => Number(b.CS) - Number(a.CS))
    .slice(0, 5),

  leastBeaten: [...eligiblePlayers]
    .sort((a, b) => Number(a.L) - Number(b.L))
    .slice(0, 5),

  bestDefender: [...eligiblePlayers]
    .sort((a, b) => Number(a.GA) - Number(b.GA))
    .slice(0, 5),

  goalsPerMatch: [...eligiblePlayers]
    .sort(
      (a, b) =>
        Number(b.GF) / Number(b.M) -
        Number(a.GF) / Number(a.M)
    )
    .slice(0, 5),

  mvp: [...eligiblePlayers]
    .sort((a, b) => Number(b.P) - Number(a.P))
    .slice(0, 5),
};

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
        overflow: "hidden",
        position: "relative",
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
              filter: "drop-shadow(0 0 10px rgba(255,0,0,0.5))",
              
            }}
          />

          <p
            style={{
              color: "#888",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Powered by YouTube/lilfoxgaming
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
        {activeTab === "individual" && (
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
        )}

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
        {activeTab === "awards" ? (
  <div
    style={{
      marginTop: "30px",
    }}
  >
    {/* Award Selector */}
    <div
      style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "15px",
        marginBottom: "25px",
      }}
    >
      {[
        { id: "goldenBoot", label: "⚽ Golden Boot" },
        { id: "goldenGlove", label: "🧤 Golden Glove" },
        { id: "leastBeaten", label: "🛡 Least Beaten" },
        { id: "bestDefender", label: "🔒 Best Defender" },
        { id: "goalsPerMatch", label: "🎯 Goals/Match" },
        { id: "mvp", label: "👑 MVP" },
      ].map((award) => (
        <button
          key={award.id}
          onClick={() => setSelectedAward(award.id)}
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            border:
              selectedAward === award.id
                ? "2px solid #FFD700"
                : "1px solid #444",
            background:
              selectedAward === award.id
                ? "rgba(255,215,0,0.18)"
                : "rgba(255,255,255,0.04)",
            color:
              selectedAward === award.id
                ? "#FFD700"
                : "#ccc",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: "bold",
          }}
        >
          {award.label}
        </button>
      ))}
    </div>

    {/* Featured Winner */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  style={{
    background: "rgba(255,215,0,0.06)",
    border: "2px solid #FFD700",
    borderRadius: "24px",
    padding: "25px",
    textAlign: "center",
    marginBottom: "30px",
    boxShadow: "0 0 25px rgba(255,215,0,0.3)",
    backdropFilter: "blur(12px)",
  }}
>
  <h2
    style={{
      fontSize: "3rem",
      marginBottom: "10px",
    }}
  >
    🏆
  </h2>

  <h1
    style={{
      color: "#FFD700",
      fontSize:
        window.innerWidth < 768 ? "2rem" : "3rem",
      marginBottom: "10px",
      fontFamily: "'Anton SC', sans-serif",
      letterSpacing: "2px",
    }}
  >
    {awardsData[selectedAward][0]?.Player}
  </h1>

  <p
    style={{
      color: "#bbb",
      fontSize: "1.1rem",
      marginBottom: "10px",
    }}
  >
    Team: {awardsData[selectedAward][0]?.Team}
  </p>

  <h2
    style={{
      color: "#fff",
      fontSize: "1.8rem",
    }}
  >
    {selectedAward === "goldenBoot" &&
      `${awardsData[selectedAward][0]?.GF} Goals`}

    {selectedAward === "goldenGlove" &&
      `${awardsData[selectedAward][0]?.CS} Clean Sheets`}

    {selectedAward === "leastBeaten" &&
      `${awardsData[selectedAward][0]?.L} Losses`}

    {selectedAward === "bestDefender" &&
      `${awardsData[selectedAward][0]?.GA} Goals Against`}

    {selectedAward === "goalsPerMatch" &&
      `${(
        Number(
          awardsData[selectedAward][0]?.GF
        ) /
        Number(
          awardsData[selectedAward][0]?.M
        )
      ).toFixed(2)} Goals/Match`}

    {selectedAward === "mvp" &&
      `${awardsData[selectedAward][0]?.P} Points`}
  </h2>
</motion.div>
  </div>
) : activeTab !== "individual" ? (
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