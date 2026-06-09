import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "@fontsource/rubik-glitch";
import "@fontsource/butcherman";
import "@fontsource/rubik-wet-paint";
import "@fontsource/jim-nightshade";

const csvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRI_9Fjhk6xaWi4uESJlJWcVuf_ojIfU93JKNeNL6F0CbQB4oEgHjarl8TrkU2FvnYI3OFiy5Rr7uH_/pub?gid=114858707&single=true&output=csv";
  const standingsUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRI_9Fjhk6xaWi4uESJlJWcVuf_ojIfU93JKNeNL6F0CbQB4oEgHjarl8TrkU2FvnYI3OFiy5Rr7uH_/pub?gid=0&single=true&output=csv";
  const fixturesUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRI_9Fjhk6xaWi4uESJlJWcVuf_ojIfU93JKNeNL6F0CbQB4oEgHjarl8TrkU2FvnYI3OFiy5Rr7uH_/pub?gid=1112620147&single=true&output=csv";

const columnHelper = createColumnHelper();

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
const [managerName, setManagerName] = useState("");
const [fantasyTeamName, setFantasyTeamName] = useState("");
const [creatingProfile, setCreatingProfile] = useState(false);
const [showAdminPanel, setShowAdminPanel] = useState(false);
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false);
const [showFantasyPage, setShowFantasyPage] = useState(false);
const [competitionName, setCompetitionName] = useState("");
const [competitionType, setCompetitionType] = useState("worldcup");
const [competitions, setCompetitions] = useState([]);
const [selectedCompetition, setSelectedCompetition] = useState(null);

const [uploadedPlayers, setUploadedPlayers] = useState([]);
const [uploadedFixtures, setUploadedFixtures] = useState([]);
const [manualMatchNo, setManualMatchNo] = useState("");
const [manualRound, setManualRound] = useState("");
const [manualDate, setManualDate] = useState("");
const [manualTime, setManualTime] = useState("");
const [manualTeamA, setManualTeamA] = useState("");
const [manualTeamB, setManualTeamB] = useState("");
const [fixtureCountries, setFixtureCountries] = useState([]);

const [fantasyPlayers, setFantasyPlayers] = useState([]);
const [selectedFantasyPlayers, setSelectedFantasyPlayers] = useState([]);

const [savedFantasyTeam, setSavedFantasyTeam] = useState(null);
const [isEditingFantasyTeam, setIsEditingFantasyTeam] = useState(false);
const [fantasyLeaderboard, setFantasyLeaderboard] = useState([]);
const [leaderboardLoading, setLeaderboardLoading] = useState(false);
const [expandedFantasyTeam, setExpandedFantasyTeam] = useState(null);
const [captainId, setCaptainId] = useState("");
const [viceCaptainId, setViceCaptainId] = useState("");

// Fantasy performance update states
const [transferHistory, setTransferHistory] = useState([]);
const [performanceData, setPerformanceData] = useState([]);

const [selectedPerformancePlayer, setSelectedPerformancePlayer] =
  useState("");

const [goals, setGoals] = useState(0);
const [assists, setAssists] = useState(0);

const [cleanSheet, setCleanSheet] =
  useState(false);

const [yellowCard, setYellowCard] =
  useState(false);

const [redCard, setRedCard] =
  useState(false);

const [manOfMatch, setManOfMatch] =
  useState(false);

const [fantasyPositionFilter, setFantasyPositionFilter] = useState("ALL");

const [fantasyCountryFilter, setFantasyCountryFilter] = useState("ALL");

const [teamCreationDeadline, setTeamCreationDeadline] = useState("");
const [transferWindowOpen, setTransferWindowOpen] = useState(false);
const [freeTransfers, setFreeTransfers] = useState(3);
const [transferPenaltyBase, setTransferPenaltyBase] = useState(4);

const [showManageUsers, setShowManageUsers] = useState(false);

const [userSearch, setUserSearch] = useState("");
const [roleFilter, setRoleFilter] = useState("all");

const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [standingsData, setStandingsData] = useState([]);
  const [fixturesData, setFixturesData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAward, setSelectedAward] =
  useState("goldenBoot");

  const particlesInit = async (main) => {
    await loadSlim(main);
  };
  
  const loadSiteSettings = async () => {
  try {
    const settingsSnap = await getDoc(
      doc(db, "siteSettings", "main")
    );

    if (settingsSnap.exists()) {
      setMaintenanceMode(
        settingsSnap.data().maintenanceMode || false
      );
    }

    setSiteSettingsLoaded(true);
  } catch (error) {
    console.error("Site Settings Error:", error);
    setSiteSettingsLoaded(true);
  }
};
  
  const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    const loggedUser = result.user;

    setUser(loggedUser);

    const userRef = doc(
      db,
      "users",
      loggedUser.uid
    );

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setProfile(userSnap.data());
    } else {
      setCreatingProfile(true);
    }

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );
  }
};

const handleCreateProfile = async () => {
  if (!user) return;

  const cleanManagerName = managerName.trim();
  const cleanFantasyTeamName = fantasyTeamName.trim();

  if (!cleanManagerName || !cleanFantasyTeamName) {
    alert("Please enter both Manager Name and Fantasy Team Name.");
    return;
  }

  const managerNameKey = cleanManagerName
    .toLowerCase()
    .replace(/\s+/g, "");

  const fantasyTeamNameKey = cleanFantasyTeamName
    .toLowerCase()
    .replace(/\s+/g, "");

  try {
    const managerQuery = query(
      collection(db, "users"),
      where("managerNameKey", "==", managerNameKey)
    );

    const managerSnap = await getDocs(managerQuery);

    if (!managerSnap.empty) {
      alert("This Manager Name is already taken.");
      return;
    }

    const teamQuery = query(
      collection(db, "users"),
      where("fantasyTeamNameKey", "==", fantasyTeamNameKey)
    );

    const teamSnap = await getDocs(teamQuery);

    if (!teamSnap.empty) {
      alert("This Fantasy Team Name is already taken.");
      return;
    }

    const newProfile = {
      uid: user.uid,
      email: user.email,
      googleName: user.displayName || "",
      managerName: cleanManagerName,
      managerNameKey,
      fantasyTeamName: cleanFantasyTeamName,
      fantasyTeamNameKey,
      role: "player",
      totalPoints: 0,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), newProfile);

    setProfile(newProfile);
    setCreatingProfile(false);

    alert("Manager Profile created successfully!");
  } catch (error) {
    console.error("Profile Creation Error:", error);
    alert("Something went wrong while creating profile.");
  }
};

const handleCreateCompetition = async () => {
  const cleanName = competitionName.trim();

  if (!cleanName) {
    alert("Please enter competition name.");
    return;
  }

  try {
    const competitionId = cleanName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const newCompetition = {
      id: competitionId,
      name: cleanName,
      type: competitionType,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    };

    await setDoc(
      doc(db, "competitions", competitionId),
      newCompetition
    );

    alert("Competition created successfully!");

    setCompetitionName("");
    setCompetitionType("worldcup");

    fetchCompetitions();
  } catch (error) {
    console.error("Competition Creation Error:", error);
    alert("Something went wrong while creating competition.");
  }
};

const handleSaveSiteSettings = async () => {
  try {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        maintenanceMode: maintenanceMode,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    alert("Site status updated successfully.");
  } catch (error) {
    console.error("Site Settings Save Error:", error);
    alert("Failed to update site status.");
  }
};

const fetchCompetitions = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "competitions")
    );

    const competitionList = querySnapshot.docs.map(
      (docItem) => docItem.data()
    );

    setCompetitions(competitionList);
  } catch (error) {
    console.error("Fetch Competitions Error:", error);
  }
};

const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users")
    );

    const userList = querySnapshot.docs.map(
      (docItem) => docItem.data()
    );

    setUsers(userList);
  } catch (error) {
    console.error("Fetch Users Error:", error);
  }
};

const updateUserRole = async (targetUserId, newRole) => {
  try {
    await updateDoc(doc(db, "users", targetUserId), {
      role: newRole,
    });

    alert("User role updated successfully.");

    fetchUsers();
  } catch (error) {
    console.error("Role Update Error:", error);
    alert("Something went wrong while updating role.");
  }
};

const handlePlayerCsvUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const cleanedPlayers = results.data.map((row, index) => {
        const cleanedRow = {};

        Object.keys(row).forEach((key) => {
          cleanedRow[key.trim()] = row[key];
        });

        return {
          id: `${selectedCompetition.id}-player-${index + 1}`,
          name: cleanedRow.Player?.trim(),
          country: cleanedRow.Country?.trim(),
          position: cleanedRow.Position?.trim()?.toUpperCase(),
        };
      });

      setUploadedPlayers(cleanedPlayers);
    },
  });
};

const handleFixtureCsvUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      const cleanedFixtures = results.data.map((row, index) => {
        const cleanedRow = {};

        Object.keys(row).forEach((key) => {
          cleanedRow[key.trim()] = row[key];
        });

        return {
          id: `${selectedCompetition.id}-fixture-${index + 1}`,
          matchNo: Number(cleanedRow.MatchNo),
          round: cleanedRow.Round?.trim(),
          date: cleanedRow.Date?.trim(),
          time: cleanedRow.Time?.trim(),
          teamA: cleanedRow.TeamA?.trim(),
          teamB: cleanedRow.TeamB?.trim(),
        };
      });

      setUploadedFixtures(cleanedFixtures);
    },
  });
};

const handleSavePlayersToDatabase = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  if (uploadedPlayers.length === 0) {
    alert("Please upload players first.");
    return;
  }

  try {
    const batch = writeBatch(db);

    uploadedPlayers.forEach((player) => {
      const playerRef = doc(
        db,
        "competitions",
        selectedCompetition.id,
        "players",
        player.id
      );

      batch.set(playerRef, {
        ...player,
        competitionId: selectedCompetition.id,
        createdAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    alert("Players saved to database successfully!");
  } catch (error) {
    console.error("Save Players Error:", error);
    alert("Something went wrong while saving players.");
  }
};

const handleSaveFixturesToDatabase = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  if (uploadedFixtures.length === 0) {
    alert("Please upload fixtures first.");
    return;
  }

  try {
    const batch = writeBatch(db);

    uploadedFixtures.forEach((fixture) => {
      const fixtureRef = doc(
        db,
        "competitions",
        selectedCompetition.id,
        "fixtures",
        fixture.id
      );

      batch.set(fixtureRef, {
        ...fixture,
        competitionId: selectedCompetition.id,
        status: "upcoming",
        scoreA: null,
        scoreB: null,
        createdAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    alert("Fixtures saved to database successfully!");
  } catch (error) {
    console.error("Save Fixtures Error:", error);
    alert("Something went wrong while saving fixtures.");
  }
};

const loadFixtureCountries = async () => {

  if (!selectedCompetition) return;


  try {

    const snapshot = await getDocs(
      collection(
        db,
        "competitions",
        selectedCompetition.id,
        "players"
      )
    );


    const countries = [
      ...new Set(
        snapshot.docs.map(
          (doc) =>
            doc.data().country
        )
      ),
    ].sort();


    setFixtureCountries(countries);


  } catch (error) {

    console.error(
      "Country Load Error:",
      error
    );

  }

};

const handleSaveManualFixture = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  if (
    !manualMatchNo ||
    !manualRound ||
    !manualDate ||
    !manualTime ||
    !manualTeamA ||
    !manualTeamB
  ) {
    alert("Please fill all fixture details.");
    return;
  }

  try {
    const fixtureId = `fixture-${manualMatchNo}`;

    await setDoc(
      doc(
        db,
        "competitions",
        selectedCompetition.id,
        "fixtures",
        fixtureId
      ),
      {
        id: fixtureId,
        competitionId: selectedCompetition.id,
        matchNo: Number(manualMatchNo),
        round: manualRound.trim(),
        date: manualDate,
        time: manualTime,
        teamA: manualTeamA.trim(),
        teamB: manualTeamB.trim(),
        status: "upcoming",
        scoreA: null,
        scoreB: null,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    alert("Fixture saved successfully!");

    setManualMatchNo("");
    setManualRound("");
    setManualDate("");
    setManualTime("");
    setManualTeamA("");
    setManualTeamB("");
  } catch (error) {
    console.error("Manual Fixture Error:", error);
    alert("Something went wrong while saving fixture.");
  }
};

const handleLoadSavedFantasyTeam = async () => {
  if (!user) {
    return;
  }

  try {
    const teamDoc = await getDoc(
      doc(
        db,
        "competitions",
        "fifa-world-cup-2026-fantasy-game",
        "fantasyTeams",
        user.uid
      )
    );

    if (teamDoc.exists()) {
      const teamData = teamDoc.data();

      setSavedFantasyTeam(teamData);

      setSelectedFantasyPlayers(
        teamData.players || []
      );
      setCaptainId(teamData.captainId || "");
      setViceCaptainId(teamData.viceCaptainId || "");
    }

    await handleLoadFantasyPlayers();

  } catch (error) {

    console.error(
      "Load Fantasy Team Error:",
      error
    );

  }
};

const handleLoadFantasyPlayers = async () => {
  
  try {
    const querySnapshot = await getDocs(
      collection(
  db,
  "competitions",
  "fifa-world-cup-2026-fantasy-game",
  "players"
)
    );

    const playersList = querySnapshot.docs.map((docItem) =>
      docItem.data()
    );

    setFantasyPlayers(playersList);


// Load deadline

const competitionDoc = await getDoc(
  doc(
    db,
    "competitions",
    "fifa-world-cup-2026-fantasy-game"
  )
);

if (competitionDoc.exists()) {

  const settings =
    competitionDoc.data().fantasySettings;

  if (settings?.teamCreationDeadline) {
    setTeamCreationDeadline(
      settings.teamCreationDeadline
    );
  }

  if (settings?.transferWindowOpen !== undefined) {
  setTransferWindowOpen(settings.transferWindowOpen);
  if (settings?.freeTransfers !== undefined) {
  setFreeTransfers(settings.freeTransfers);
}

if (settings?.transferPenaltyBase !== undefined) {
  setTransferPenaltyBase(settings.transferPenaltyBase);
}
}

}


alert("Players loaded successfully!");
  } catch (error) {
    console.error("Load Fantasy Players Error:", error);
    alert("Something went wrong while loading players.");
  }
};

const handleToggleFantasyPlayer = (player) => {
  const alreadySelected = selectedFantasyPlayers.some(
    (selectedPlayer) => selectedPlayer.id === player.id
  );

  if (alreadySelected) {
    const updatedPlayers = selectedFantasyPlayers.filter(
      (selectedPlayer) => selectedPlayer.id !== player.id
    );

    setSelectedFantasyPlayers(updatedPlayers);
  } else {
    setSelectedFantasyPlayers([
      ...selectedFantasyPlayers,
      player,
    ]);
  }
};

const handleSaveFantasyDeadline = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  if (!teamCreationDeadline) {
    alert("Please select deadline.");
    return;
  }

  try {
    await setDoc(
      doc(
        db,
        "competitions",
        selectedCompetition.id
      ),
      {
        fantasySettings: {
          teamCreationDeadline:
            teamCreationDeadline,
        },
      },
      { merge: true }
    );

    alert("Fantasy deadline saved successfully!");

  } catch (error) {

    console.error(
      "Save Deadline Error:",
      error
    );

    alert(
      "Something went wrong while saving deadline."
    );
  }
};

const loadTransferHistory = async () => {

  if (!selectedCompetition) return;


  try {

    const snapshot = await getDocs(
      collection(
        db,
        "competitions",
        selectedCompetition.id,
        "transferHistory"
      )
    );


    const history =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));


    history.sort(
      (a,b)=>
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );


    setTransferHistory(history);


  } catch(error) {

    console.error(
      "Transfer History Error:",
      error
    );

  }

};

const handleSaveTransferWindow = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  try {
    await setDoc(
      doc(db, "competitions", selectedCompetition.id),
      {
        fantasySettings: {
  transferWindowOpen: transferWindowOpen,
  freeTransfers: Number(freeTransfers),
  transferPenaltyBase: Number(transferPenaltyBase),
},
      },
      { merge: true }
    );

    alert("Transfer window updated successfully!");
  } catch (error) {
    console.error("Transfer Window Error:", error);
    alert("Something went wrong while updating transfer window.");
  }
};

const calculatePlayerPoints = (player, stats) => {
  let points = 0;

  // Played match
  points += 1;

  // Goals by position
  if (player.position === "GK") {
    points += Number(stats.goals || 0) * 10;
  } else if (player.position === "DEF") {
    points += Number(stats.goals || 0) * 7;
  } else if (player.position === "MID") {
    points += Number(stats.goals || 0) * 6;
  } else if (player.position === "FWD") {
    points += Number(stats.goals || 0) * 5;
  }

  // Assists
  points += Number(stats.assists || 0) * 3;

  // Clean sheet
  if (stats.cleanSheet) {
    if (player.position === "GK") {
      points += 5;
    } else if (player.position === "DEF") {
      points += 4;
    } else if (player.position === "MID") {
      points += 2;
    }
  }

  // Cards
  if (stats.yellowCard) {
    points -= 1;
  }

  if (stats.redCard) {
    points -= 3;
  }

  // Man of the Match
  if (stats.manOfMatch) {
    points += 5;
  }

  return points;
};

const handlePerformanceCsvUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      const cleanedPerformance = results.data.map(
        (row, index) => {
          const cleanedRow = {};

          Object.keys(row).forEach((key) => {
            cleanedRow[key.trim()] = row[key];
          });

          return {
            id: `performance-${index + 1}`,
            matchNo: Number(cleanedRow.MatchNo),
            player: cleanedRow.Player?.trim(),
            goals: Number(cleanedRow.Goals) || 0,
            assists: Number(cleanedRow.Assists) || 0,
            cleanSheet:
              cleanedRow.CleanSheet?.toLowerCase() ===
              "yes",
            yellowCard:
              cleanedRow.YellowCard?.toLowerCase() ===
              "yes",
            redCard:
              cleanedRow.RedCard?.toLowerCase() === "yes",
            manOfMatch:
              cleanedRow.MOTM?.toLowerCase() === "yes",
          };
        }
      );

      setPerformanceData(cleanedPerformance);
    },
  });
};

const updateFantasyTeamPoints = async () => {
  try {
    const scoresSnapshot = await getDocs(
      collection(
        db,
        "competitions",
        selectedCompetition.id,
        "playerScores"
      )
    );


    const scores = {};

    scoresSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      scores[data.playerId] =
        data.totalPoints || 0;
    });


    const teamsSnapshot = await getDocs(
      collection(
        db,
        "competitions",
        selectedCompetition.id,
        "fantasyTeams"
      )
    );


    const batch = writeBatch(db);


    teamsSnapshot.docs.forEach((teamDoc) => {
      const team = teamDoc.data();

      let total = 0;


      (team.players || []).forEach(
        (player) => {

          let points =
            scores[player.id] || 0;


          if (
            player.id === team.captainId
          ) {
            points = points * 2;
          }


          if (
            player.id ===
            team.viceCaptainId
          ) {
            points = points * 1.5;
          }


          total += points;

        }
      );

      total =
total -
(team.transferPenalty || 0);


      batch.update(
        teamDoc.ref,
        {
          totalPoints: total,
          lastUpdated:
            new Date().toISOString(),
        }
      );

    });


    await batch.commit();

await loadFantasyLeaderboard();


} catch (error) {

    console.error(
      "Fantasy points update error:",
      error
    );

  }
};

const loadFantasyLeaderboard = async () => {

  setLeaderboardLoading(true);

  try {

    const scoresSnapshot = await getDocs(
      collection(
        db,
        "competitions",
        "fifa-world-cup-2026-fantasy-game",
        "playerScores"
      )
    );


    const scores = {};

    scoresSnapshot.docs.forEach((doc) => {

      const data = doc.data();

      scores[data.playerId] =
        data.totalPoints || 0;

    });


    const teamsSnapshot = await getDocs(
      collection(
        db,
        "competitions",
        "fifa-world-cup-2026-fantasy-game",
        "fantasyTeams"
      )
    );


    const teams =
      teamsSnapshot.docs.map((doc) => {

        const team = doc.data();


        const players =
          (team.players || []).map(
            (player) => {

              let points =
                scores[player.id] || 0;


              if (
                player.id === team.captainId
              ) {
                points = points * 2;
              }


              if (
                player.id ===
                team.viceCaptainId
              ) {
                points = points * 1.5;
              }


              return {
                ...player,
                fantasyPoints: points,
              };

            }
          );


        return {
          id: doc.id,
          ...team,
          players,
        };

      });


    teams.sort(
      (a,b)=>
      (b.totalPoints || 0) -
      (a.totalPoints || 0)
    );


    setFantasyLeaderboard(teams);


  } catch(error) {

    console.error(
      "Leaderboard load error:",
      error
    );

  }


  setLeaderboardLoading(false);

};

const handleSavePerformance = async () => {
  if (!selectedCompetition) {
    alert("No competition selected.");
    return;
  }

  if (performanceData.length === 0) {
    alert("No performance data found.");
    return;
  }

  try {

    const playersSnapshot = await getDocs(
      collection(
        db,
        "competitions",
        selectedCompetition.id,
        "players"
      )
    );


    const allPlayers =
      playersSnapshot.docs.map((doc) =>
        doc.data()
      );


    const batch = writeBatch(db);


    performanceData.forEach((record) => {
  const matchedPlayer = allPlayers.find(
    (player) =>
      player.name?.toLowerCase() ===
      record.player?.toLowerCase()
  );

  if (!matchedPlayer) {
    console.warn(
      "Player not found:",
      record.player
    );
    return;
  }

  const points = calculatePlayerPoints(
    matchedPlayer,
    record
  );

  const performanceRef = doc(
    db,
    "competitions",
    selectedCompetition.id,
    "matchPerformance",
    `${record.matchNo}_${record.player}`
  );

  batch.set(performanceRef, {
    ...record,
    playerId: matchedPlayer.id,
    position: matchedPlayer.position,
    points,
  });

  const playerScoreRef = doc(
    db,
    "competitions",
    selectedCompetition.id,
    "playerScores",
    matchedPlayer.id
  );

  batch.set(
    playerScoreRef,
    {
      playerId: matchedPlayer.id,
      playerName: matchedPlayer.name,
      country: matchedPlayer.country,
      position: matchedPlayer.position,
      totalPoints: points,
      lastUpdated: new Date().toISOString(),
    },
    { merge: true }
  );
});


    setTimeout(() => {
  updateFantasyTeamPoints();
}, 1000);

alert(
  "Performance saved successfully and fantasy points updated!"
);


  } catch (error) {

    console.error(
      "Save Performance Error:",
      error
    );

    alert(
      "Error saving performance."
    );

  }
};

const handleSaveFantasyTeam = async () => {
  if (!user || !profile) {
    alert("Please login first.");
    return;
  }

  if (teamCreationDeadline) {

  const now = new Date();

  const deadline =
    new Date(teamCreationDeadline);


  if (
  now > deadline &&
  !transferWindowOpen &&
  !savedFantasyTeam
) {

  alert(
    "Team creation deadline is over and transfer window is closed."
  );

  return;
}

}

  if (selectedFantasyPlayers.length !== 15) {
  alert("Please select exactly 15 players.");
  return;
}

const gkCount = selectedFantasyPlayers.filter(
  (player) => player.position === "GK"
).length;

const defCount = selectedFantasyPlayers.filter(
  (player) => player.position === "DEF"
).length;

const midCount = selectedFantasyPlayers.filter(
  (player) => player.position === "MID"
).length;

const fwdCount = selectedFantasyPlayers.filter(
  (player) => player.position === "FWD"
).length;

if (gkCount < 2) {
  alert("Please select minimum 2 Goalkeepers.");
  return;
}

if (defCount < 3) {
  alert("Please select minimum 3 Defenders.");
  return;
}

if (midCount < 3) {
  alert("Please select minimum 3 Midfielders.");
  return;
}

if (fwdCount < 3) {
  alert("Please select minimum 3 Forwards.");
  return;
}

if (!captainId) {
  alert("Please select a Captain.");
  return;
}


if (!viceCaptainId) {
  alert("Please select a Vice Captain.");
  return;
}


if (captainId === viceCaptainId) {
  alert(
    "Captain and Vice Captain cannot be same player."
  );
  return;
}

let currentTransferCount = 0;

let previousTransfersMade =
  savedFantasyTeam?.transfersMade || 0;

let previousTransferPenalty =
  savedFantasyTeam?.transferPenalty || 0;

let transfersMade = previousTransfersMade;
let transferPenalty = previousTransferPenalty;


if (savedFantasyTeam && transferWindowOpen) {

  const oldIds =
    savedFantasyTeam.players.map(
      (p) => p.id
    );


  const newIds =
    selectedFantasyPlayers.map(
      (p) => p.id
    );


  currentTransferCount =
    newIds.filter(
      (id) => !oldIds.includes(id)
    ).length;


  for (
    let i = 1;
    i <= currentTransferCount;
    i++
  ) {

    const transferNumber =
      previousTransfersMade + i;


    if (
      transferNumber > Number(freeTransfers)
    ) {

      const extraTransferNumber =
        transferNumber -
        Number(freeTransfers);


      transferPenalty +=
        Number(transferPenaltyBase) *
        Math.pow(
          2,
          extraTransferNumber - 1
        );

    }

  }


  transfersMade =
    previousTransfersMade +
    currentTransferCount;

}

if (savedFantasyTeam && transferWindowOpen) {
  const confirmTransfer = window.confirm(
  `Transfer Summary:\n\n` +
  `Previous Transfers: ${previousTransfersMade}\n` +
  `Current Changes: ${currentTransferCount}\n` +
  `Total Transfers: ${transfersMade}\n` +
  `Free Transfers: ${freeTransfers}\n` +
  `Total Penalty: -${transferPenalty} points\n\n` +
  `Do you want to continue?`
);

  if (!confirmTransfer) {
    return;
  }
}

let updatedTotalPoints =
  savedFantasyTeam?.totalPoints || 0;

if (savedFantasyTeam && transferWindowOpen) {
  updatedTotalPoints =
  updatedTotalPoints -
  (transferPenalty - previousTransferPenalty);
}

  try {
    await setDoc(
      doc(
  db,
  "competitions",
  "fifa-world-cup-2026-fantasy-game",
  "fantasyTeams",
  user.uid
),



      {
        userId: user.uid,

        managerName: profile.managerName,
        fantasyTeamName: profile.fantasyTeamName,

        players: selectedFantasyPlayers,
        captainId: captainId,
        viceCaptainId: viceCaptainId,

        transfersMade: transfersMade,
        transferPenalty: transferPenalty,

        totalPoints: updatedTotalPoints,

        createdAt: new Date().toISOString(),
      }
    );

    if (
  savedFantasyTeam &&
  transferWindowOpen &&
  currentTransferCount > 0
) {
  const oldPlayers = savedFantasyTeam.players || [];
  const newPlayers = selectedFantasyPlayers || [];

  const removedPlayers = oldPlayers.filter(
    (oldPlayer) =>
      !newPlayers.some(
        (newPlayer) => newPlayer.id === oldPlayer.id
      )
  );

  const addedPlayers = newPlayers.filter(
    (newPlayer) =>
      !oldPlayers.some(
        (oldPlayer) => oldPlayer.id === newPlayer.id
      )
  );

  await addDoc(
    collection(
      db,
      "competitions",
      "fifa-world-cup-2026-fantasy-game",
      "transferHistory"
    ),
    {
      userId: user.uid,
      managerName: profile.managerName,
      fantasyTeamName: profile.fantasyTeamName,

      removedPlayers,
      addedPlayers,

      currentTransferCount,
      previousTransfersMade,
      totalTransfersMade: transfersMade,

      penaltyThisSave:
        transferPenalty - previousTransferPenalty,

      totalTransferPenalty: transferPenalty,

      createdAt: new Date().toISOString(),
    }
  );
}

    alert("Fantasy Team created successfully!");
    setSavedFantasyTeam({
  managerName: profile.managerName,
  fantasyTeamName: profile.fantasyTeamName,
  players: selectedFantasyPlayers,
  captainId: captainId,
  viceCaptainId: viceCaptainId,
  transfersMade: transfersMade,
  transferPenalty: transferPenalty,
  totalPoints: updatedTotalPoints,
});
setIsEditingFantasyTeam(false);
  } catch (error) {
    console.error(
      "Save Fantasy Team Error:",
      error
    );

    alert(
      "Something went wrong while saving fantasy team."
    );
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
  } catch (error) {
    console.error("Logout Error:", error);
  }
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
    async function fetchStandings() {
  try {
    const response = await fetch(standingsUrl);
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

        setStandingsData(cleanedData);
      },
    });
  } catch (error) {
    console.error("Standings Fetch Error:", error);
  }
}
async function fetchFixtures() {
  try {
    const response = await fetch(fixturesUrl);
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

        setFixturesData(cleanedData);
      },
    });
  } catch (error) {
    console.error("Fixtures Fetch Error:", error);
  }
}

    loadSiteSettings();
    fetchData();
    fetchStandings();
    fetchFixtures();
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

  const groupedFixtures = fixturesData.reduce(
  (acc, match) => {
    const matchday = match.Matchday;

    if (!acc[matchday]) {
      acc[matchday] = [];
    }

    acc[matchday].push(match);

    return acc;
  },
  {}
);  

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

  const biggestWinMatch = [...fixturesData]
  .filter(
    (match) =>
      match["H Score"] !== "" &&
      match["A Score"] !== ""
  )
  .sort(
    (a, b) =>
      Math.abs(
        Number(b["H Score"]) -
        Number(b["A Score"])
      ) -
      Math.abs(
        Number(a["H Score"]) -
        Number(a["A Score"])
      )
  )[0];

  const nextMatchday = fixturesData.find(
  (match) =>
    match["H Score"] === "" &&
    match["A Score"] === ""
);

const nextMatchdayFixtures = fixturesData.filter(
  (match) =>
    match.Matchday === nextMatchday?.Matchday &&
    match["H Score"] === "" &&
    match["A Score"] === ""
);

const totalTeams = standingsData.length;

const totalMatchesPlayed = fixturesData.filter(
  (match) =>
    match["H Score"] !== "" &&
    match["A Score"] !== ""
).length;

const totalGoals = fixturesData.reduce(
  (sum, match) =>
    sum +
    (Number(match["H Score"]) || 0) +
    (Number(match["A Score"]) || 0),
  0
);

const totalCleanSheets = data.reduce(
  (sum, player) => sum + (Number(player.CS) || 0),
  0
);

const selectedPositionCounts = {
  GK: selectedFantasyPlayers.filter(
    (player) => player.position === "GK"
  ).length,

  DEF: selectedFantasyPlayers.filter(
    (player) => player.position === "DEF"
  ).length,

  MID: selectedFantasyPlayers.filter(
    (player) => player.position === "MID"
  ).length,

  FWD: selectedFantasyPlayers.filter(
    (player) => player.position === "FWD"
  ).length,
};

const visibleFantasyPlayers =
  fantasyPlayers.filter((player) => {

    const positionMatch =
      fantasyPositionFilter === "ALL" ||
      player.position === fantasyPositionFilter;


    const countryMatch =
      fantasyCountryFilter === "ALL" ||
      player.country === fantasyCountryFilter;


    return positionMatch && countryMatch;

  });

  const fantasyCountries = [
  "ALL",
  ...new Set(
    fantasyPlayers
      .map((player) => player.country)
      .filter(Boolean)
  ),
];

const filteredUsers = users.filter((appUser) => {
  const searchText = userSearch.toLowerCase();

  const matchesSearch =
    appUser.managerName?.toLowerCase().includes(searchText) ||
    appUser.fantasyTeamName?.toLowerCase().includes(searchText) ||
    appUser.email?.toLowerCase().includes(searchText);

  const matchesRole =
    roleFilter === "all" || appUser.role === roleFilter;

  return matchesSearch && matchesRole;
});

  const cellStyle = {
  padding: "14px",
  textAlign: "center",
  borderBottom:
    "1px solid rgba(255,255,255,0.08)",
};

if (
  siteSettingsLoaded &&
  maintenanceMode &&
  profile?.role !== "superadmin" &&
  profile?.role !== "admin"
) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #3a2b00 0%, #050505 65%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "25px",
        fontFamily: "Arial, Calibri, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "550px",
          padding: "30px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,215,0,0.35)",
        }}
      >
        <p style={{ color: "#aaa" }}>
          Please check back later.
        </p>
      </div>
    </div>
  );
}

if (showFantasyPage) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #3a2b00 0%, #050505 60%)",
        color: "white",
        padding: window.innerWidth < 768 ? "10px" : "20px",
        fontFamily: "Arial, Calibri, sans-serif",
      }}
    >
      <button
        onClick={() => setShowFantasyPage(false)}
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          background: "rgba(255,215,0,0.15)",
          color: "#FFD700",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ← Back
      </button>

      <h1
  style={{
    color: "#FFD700",
    fontSize: window.innerWidth < 768 ? "1.6rem" : "2.2rem",
    
  }}
>
        ⚽ FIFA World Cup 2026 Fantasy
      </h1>

      {profile && (
  <div
    style={{
      marginTop: "15px",
      marginBottom: "20px",
      padding: "15px",
      borderRadius: "15px",
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.25)",
    }}
  >
    <h3 style={{ color:"#FFD700" }}>
      👤 Logged in Manager
    </h3>

    <p>
      Manager: {profile.managerName}
    </p>

    <p>
      Fantasy Team: {profile.fantasyTeamName}
    </p>
  </div>
)}

      <p style={{ color: "#bbb" }}>
        Build your 15 player dream squad.
      </p>

      <div
  style={{
    marginTop: "20px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color:"#FFD700" }}>
    📘 Fantasy Rules
  </h2>

  <p style={{ color:"#bbb" }}>
    Build a squad of 15 players.
  </p>

  <p>
    🧤 GK minimum 2 | 🛡 DEF minimum 3 | 🎯 MID minimum 3 | ⚡ FWD minimum 3
  </p>

  <h3 style={{ color:"#FFD700" }}>
    Captain Bonus
  </h3>

  <p>
    ⭐ Captain gets x2 points
  </p>

  <p>
    💫 Vice Captain gets x1.5 points
  </p>

  <h3 style={{ color:"#FFD700" }}>
    Points System
  </h3>

  <p>Played: +1</p>
  <p>Goal: GK +10 | DEF +7 | MID +6 | FWD +5</p>
  <p>Assist: +3</p>
  <p>Clean Sheet: GK +5 | DEF +4 | MID +2</p>
  <p>Yellow Card: -1 | Red Card: -3</p>
  <p>MOTM: +5</p>

  <h3 style={{ color:"#FFD700" }}>
    Transfers
  </h3>

  <p>
    Transfers are allowed only when admin opens the transfer window.
  </p>

  <p>
    Extra transfers after the free limit will receive progressive point deductions.
  </p>
</div>

      <div
  style={{
    marginTop: "20px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>

<h2 style={{ color: "#FFD700" }}>
🏆 Fantasy Leaderboard
</h2>


<button
onClick={loadFantasyLeaderboard}
style={{
padding:"10px 16px",
borderRadius:"10px",
background:"#FFD700",
fontWeight:"bold",
cursor:"pointer",
width: window.innerWidth < 768 ? "100%" : "auto",
}}
>
Refresh Leaderboard
</button>


{leaderboardLoading && (
<p>Loading...</p>
)}


{fantasyLeaderboard.map(
(team,index)=>(
<div
key={team.id}
style={{
marginTop:"12px",
padding:"12px",
borderRadius:"12px",
background:
index===0
?"rgba(255,215,0,0.20)"
:"rgba(255,255,255,0.05)"
}}
>

<h3>
#{index+1} 🏆 {team.fantasyTeamName}
</h3>

<p>
Manager: {team.managerName}
</p>

<h2 style={{color:"#FFD700"}}>
{team.totalPoints || 0} pts
</h2>

{teamCreationDeadline &&
new Date() < new Date(teamCreationDeadline) ? (

  <p style={{ color:"#ff7777", fontWeight:"bold" }}>
    🔒 Squad hidden until deadline
  </p>

) : (

  <>
    <button
      onClick={() =>
        setExpandedFantasyTeam(
          expandedFantasyTeam === team.id
            ? null
            : team.id
        )
      }
      style={{
        padding:"8px 12px",
        borderRadius:"10px",
        background:"rgba(255,215,0,0.15)",
        color:"#FFD700",
        border:"1px solid #FFD700"
      }}
    >
      View Squad
    </button>

    {expandedFantasyTeam === team.id && (
      <div style={{ marginTop:"15px" }}>
        {team.players.map((player)=>(
          <p key={player.id}>
            {team.captainId === player.id
              ? "⭐ "
              : team.viceCaptainId === player.id
              ? "💫 "
              : "✅ "}

            {player.name}

            {" - "}

            <span style={{ color:"#FFD700" }}>
              {player.fantasyPoints} pts
            </span>
          </p>
        ))}
      </div>
    )}
  </>

)}

</div>
)
)}

</div>

      {teamCreationDeadline && (
  <div
    style={{
      marginTop: "15px",
      marginBottom: "20px",
      padding: "15px",
      borderRadius: "15px",
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.25)",
    }}
  >
    <h3 style={{ color: "#FFD700" }}>
      ⏳ Team Creation Deadline
    </h3>

    <p style={{ color: "#ddd" }}>
      {new Date(
        teamCreationDeadline
      ).toLocaleString()}
    </p>

    <h3
      style={{
        color:
          new Date() >
          new Date(teamCreationDeadline)
            ? "#ff5555"
            : "#55ff88",
      }}
    >
      {new Date() >
      new Date(teamCreationDeadline)
        ? "🔒 Team Creation Closed"
        : "🟢 Team Creation Open"}
    </h3>
  </div>
)}

{savedFantasyTeam && (
  <div
    style={{
      marginTop: "20px",
      marginBottom: "25px",
      padding: "20px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,215,0,0.2)",
    }}
  >
    <h2 style={{ color: "#FFD700" }}>
      🏆 My Fantasy Team
    </h2>

    <p style={{ color: "#bbb" }}>
      Manager: {savedFantasyTeam.managerName}
    </p>

    <p style={{ color: "#bbb" }}>
      Team: {savedFantasyTeam.fantasyTeamName}
    </p>

    {["GK", "DEF", "MID", "FWD"].map(
      (position) => (
        <div
          key={position}
          style={{ marginTop: "15px" }}
        >
          <h3 style={{ color: "#FFD700" }}>
            {position === "GK" &&
              "🧤 Goalkeepers"}
            {position === "DEF" &&
              "🛡 Defenders"}
            {position === "MID" &&
              "🎯 Midfielders"}
            {position === "FWD" &&
              "⚡ Forwards"}
          </h3>

          {(savedFantasyTeam.players || [])
            .filter(
              (player) =>
                player.position === position
            )
            .map((player) => (
              <p
                key={player.id}
                style={{ color: "#bbb" }}
              >
                {savedFantasyTeam.captainId === player.id
  ? "⭐ "
  : savedFantasyTeam.viceCaptainId === player.id
  ? "💫 "
  : "✅ "}

{player.name}

{savedFantasyTeam.captainId === player.id
  ? " (C)"
  : savedFantasyTeam.viceCaptainId === player.id
  ? " (VC)"
  : ""}
              </p>
            ))}
        </div>
      )
    )}

{teamCreationDeadline &&
(new Date() < new Date(teamCreationDeadline) || transferWindowOpen) ? (

  <button
    onClick={() => {
      setIsEditingFantasyTeam(true);
      handleLoadFantasyPlayers();
    }}
    style={{
      marginTop: "20px",
      padding: "12px 20px",
      borderRadius: "12px",
      background: "#FFD700",
      color: "black",
      fontWeight: "bold",
      cursor: "pointer",
      width: window.innerWidth < 768 ? "100%" : "auto",
    }}
  >
    ✏️ Edit Team
  </button>

) : (

  <p
    style={{
      marginTop: "20px",
      color: "#ff7777",
      fontWeight: "bold",
    }}
  >
    🔒 Team Locked - Transfer Window Closed
  </p>

)}

  </div>
)}

{!savedFantasyTeam &&
teamCreationDeadline &&
new Date() > new Date(teamCreationDeadline) && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      borderRadius: "18px",
      background: "rgba(255,0,0,0.08)",
      border: "1px solid rgba(255,0,0,0.3)",
    }}
  >
    <h2 style={{ color: "#ff7777" }}>
      🔒 Team Creation Closed
    </h2>

    <p style={{ color: "#ddd" }}>
      The deadline is over. New fantasy teams cannot be created now.
    </p>

    <p style={{ color: "#bbb" }}>
      You can still view the leaderboard and follow the tournament.
    </p>
  </div>
)}

      {!savedFantasyTeam &&
(!teamCreationDeadline ||
new Date() < new Date(teamCreationDeadline)) && (
      <button
        onClick={handleLoadFantasyPlayers}
        style={{
          padding: "12px 18px",
          borderRadius: "12px",
          background: "#FFD700",
          color: "black",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Load Players
      </button>
      )}

{fantasyPlayers.length > 0 &&
(!savedFantasyTeam || isEditingFantasyTeam) && (
  <div style={{ marginTop: "25px" }}>

    <h2 style={{ color: "#FFD700" }}>
      Select Your Squad
    </h2>

<div style={{ marginBottom: "20px" }}>
  <label
    style={{
      color: "#FFD700",
      fontWeight: "bold",
      display: "block",
      marginBottom: "8px",
    }}
  >
    🌍 Filter by Country
  </label>

  <select
    value={fantasyCountryFilter}
    onChange={(e) =>
      setFantasyCountryFilter(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "10px",
      width: "100%",
      maxWidth: "320px",
    }}
  >
    {fantasyCountries.map((country) => (
      <option key={country} value={country}>
        {country === "ALL" ? "All Countries" : country}
      </option>
    ))}
  </select>
</div>

    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px",
      }}
    >
      {["ALL", "GK", "DEF", "MID", "FWD"].map(
        (position) => (
          <button
            key={position}
            onClick={() =>
              setFantasyPositionFilter(position)
            }
            style={{
              padding: "8px 14px",
              borderRadius: "10px",

              border:
                fantasyPositionFilter === position
                  ? "2px solid #FFD700"
                  : "1px solid #555",

              background:
                fantasyPositionFilter === position
                  ? "rgba(255,215,0,0.2)"
                  : "rgba(255,255,255,0.05)",

              color: "white",
              cursor: "pointer",
            }}
          >
            {position}
          </button>
        )
      )}
    </div>


    {visibleFantasyPlayers.map((player) => {

      const selected =
        selectedFantasyPlayers.some(
          (p) => p.id === player.id
        );

      return (
        <div
          key={player.id}
          onClick={() =>
            handleToggleFantasyPlayer(player)
          }
          style={{
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "12px",
            wordBreak: "break-word",
            lineHeight: "1.5",

            background: selected
              ? "rgba(255,215,0,0.2)"
              : "rgba(255,255,255,0.05)",

            border: selected
              ? "1px solid #FFD700"
              : "1px solid #333",

            cursor: "pointer",
          }}
        >
          {selected ? "✅ " : ""}
          {player.name}
          {" - "}
          {player.country}
          {" - "}
          {player.position}
        </div>
      );
    })}


    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        borderRadius: "12px",
        background: "rgba(255,215,0,0.08)",
      }}
    >
      <h3 style={{ color: "#FFD700" }}>
        Squad {selectedFantasyPlayers.length}/15
      </h3>

      <p>
        GK {selectedPositionCounts.GK}/2 min |
        DEF {selectedPositionCounts.DEF}/3 min |
        MID {selectedPositionCounts.MID}/3 min |
        FWD {selectedPositionCounts.FWD}/3 min
      </p>

{["GK", "DEF", "MID", "FWD"].map(
  (position) => (
    <div
      key={position}
      style={{
        marginTop: "15px",
      }}
    >
      <h3 style={{ color: "#FFD700" }}>
        {position === "GK" && "🧤 Goalkeepers"}
        {position === "DEF" && "🛡 Defenders"}
        {position === "MID" && "🎯 Midfielders"}
        {position === "FWD" && "⚡ Forwards"}
      </h3>

      {selectedFantasyPlayers
        .filter(
          (player) =>
            player.position === position
        )
        .map((player) => (
          <p
            key={player.id}
            style={{
              color: "#bbb",
              marginLeft: "10px",
            }}
          >
            ✅ {player.name}
          </p>
        ))}
    </div>
  )
)}

{selectedFantasyPlayers.length > 0 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      borderRadius: "12px",
      background: "rgba(255,215,0,0.08)",
    }}
  >
    <h3 style={{ color: "#FFD700" }}>
      ⭐ Select Captain
    </h3>

    <select
      value={captainId}
      onChange={(e) =>
        setCaptainId(e.target.value)
      }
      style={{
        padding: "10px",
        borderRadius: "10px",
        width: "100%",
      }}
    >
      <option value="">
        Select Captain
      </option>

      {selectedFantasyPlayers.map(
        (player) => (
          <option
            key={player.id}
            value={player.id}
          >
            {player.name}
          </option>
        )
      )}
    </select>


    <h3
      style={{
        color: "#FFD700",
        marginTop: "20px",
      }}
    >
      💫 Select Vice Captain
    </h3>

    <select
      value={viceCaptainId}
      onChange={(e) =>
        setViceCaptainId(e.target.value)
      }
      style={{
        padding: "10px",
        borderRadius: "10px",
        width: "100%",
      }}
    >
      <option value="">
        Select Vice Captain
      </option>

      {selectedFantasyPlayers.map(
        (player) => (
          <option
            key={player.id}
            value={player.id}
          >
            {player.name}
          </option>
        )
      )}
    </select>

  </div>
)}

    </div>


    <button
      onClick={handleSaveFantasyTeam}
      style={{
        marginTop: "20px",
        padding: "12px 20px",
        borderRadius: "12px",
        background: "#FFD700",
        color: "black",
        fontWeight: "bold",
        width: window.innerWidth < 768 ? "100%" : "auto",
      }}
    >
      Save Fantasy Team
    </button>

  </div>
)}

    </div>
  );
}

if (
  showAdminPanel &&
  (profile?.role === "superadmin" ||
    profile?.role === "admin")
) {
    if (showManageUsers) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #3a2b00 0%, #050505 60%)",
          color: "white",
          padding: "20px",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <button
          onClick={() => setShowManageUsers(false)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #FFD700",
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "25px",
          }}
        >
          ← Back to Admin Panel
        </button>

        <h1 style={{ color: "#FFD700" }}>
          👥 Manage Users
        </h1>

        <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  }}
>
  <input
    type="text"
    placeholder="Search manager, team, or email..."
    value={userSearch}
    onChange={(e) => setUserSearch(e.target.value)}
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #FFD700",
      minWidth: "250px",
      flex: 1,
    }}
  />

  <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #FFD700",
    }}
  >
    <option value="all">All Roles</option>
    <option value="superadmin">Super Admin</option>
    <option value="admin">Admin</option>
    <option value="player">Player</option>
  </select>
</div>

{filteredUsers.map((appUser) => (
          <div
            key={appUser.uid}
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "15px",
              background: "rgba(255,255,255,0.05)",
              border:
                "1px solid rgba(255,215,0,0.2)",
            }}
          >
            <h3>
              {appUser.managerName}
            </h3>

            <p style={{ color: "#bbb" }}>
              Team: {appUser.fantasyTeamName}
            </p>

            <p style={{ color: "#FFD700" }}>
              Role: {appUser.role}
            </p>

            {appUser.role !== "superadmin" && (
              <>
                {appUser.role === "player" ? (
                  <button
                    onClick={() =>
                      updateUserRole(
                        appUser.uid,
                        "admin"
                      )
                    }
                  >
                    Make Admin
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      updateUserRole(
                        appUser.uid,
                        "player"
                      )
                    }
                  >
                    Remove Admin
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #3a2b00 0%, #050505 60%)",
        color: "white",
        padding: "20px",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <button
        onClick={() => setShowAdminPanel(false)}
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #FFD700",
          background: "rgba(255,215,0,0.15)",
          color: "#FFD700",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        ← Back to Site
      </button>

      <h1 style={{ color: "#FFD700" }}>
        👑 Super Admin Panel
      </h1>

      {selectedCompetition && (
  <div
    style={{
      marginBottom: "30px",
      padding: "20px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,215,0,0.2)",
    }}
  >
    <button
      onClick={() => setSelectedCompetition(null)}
      style={{
        padding: "8px 14px",
        borderRadius: "10px",
        border: "1px solid #FFD700",
        background: "rgba(255,215,0,0.12)",
        color: "#FFD700",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "15px",
      }}
    >
      ← Back to Admin Panel
    </button>

    <h2 style={{ color: "#FFD700" }}>
      Managing: {selectedCompetition.name}
    </h2>

   <div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
    fontFamily: "Arial, Calibri, sans-serif",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    👥 Player Database Upload
  </h2>

  <p style={{ color: "#bbb" }}>
    Upload CSV with columns: Player, Country, Position
  </p>

  <input
    type="file"
    accept=".csv"
    onChange={handlePlayerCsvUpload}
    style={{
      marginTop: "10px",
      color: "white",
    }}
  />

  {uploadedPlayers.length > 0 && (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ color: "#FFD700" }}>
        Preview: {uploadedPlayers.length} Players
      </h3>

      {uploadedPlayers.slice(0, 5).map((player) => (
        <p
          key={player.id}
          style={{
            color: "#bbb",
            margin: "6px 0",
          }}
        >
          {player.name} - {player.country} - {player.position}
        </p>
      ))}

      {uploadedPlayers.length > 5 && (
        <p style={{ color: "#888" }}>
          + {uploadedPlayers.length - 5} more players
        </p>
      )}

      <button
  onClick={handleSavePlayersToDatabase}
  style={{
    marginTop: "15px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #FFD700",
    background: "#FFD700",
    color: "black",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Save Players to Database
</button>

    </div>
  )}
</div>

<div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    📅 Fixture Upload
  </h2>

  <p style={{ color: "#bbb" }}>
    Upload CSV with columns: MatchNo, Round, Date, Time, TeamA, TeamB
  </p>

  <input
    type="file"
    accept=".csv"
    onChange={handleFixtureCsvUpload}
    style={{
      marginTop: "10px",
      color: "white",
    }}
  />

  {uploadedFixtures.length > 0 && (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ color: "#FFD700" }}>
        Preview: {uploadedFixtures.length} Fixtures
      </h3>

      {uploadedFixtures.slice(0, 5).map((fixture) => (
        <p
          key={fixture.id}
          style={{
            color: "#bbb",
            margin: "6px 0",
          }}
        >
          Match {fixture.matchNo}: {fixture.teamA} vs {fixture.teamB}
        </p>
      ))}

      {uploadedFixtures.length > 5 && (
        <p style={{ color: "#888" }}>
          + {uploadedFixtures.length - 5} more fixtures
        </p>
      )}

      <button
        onClick={handleSaveFixturesToDatabase}
        style={{
          marginTop: "15px",
          padding: "12px 18px",
          borderRadius: "12px",
          border: "1px solid #FFD700",
          background: "#FFD700",
          color: "black",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Save Fixtures to Database
      </button>
    </div>
  )}
</div>

<div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    ➕ Add Fixture Manually
  </h2>

<button
  onClick={loadFixtureCountries}
  style={{
    padding:"10px 15px",
    borderRadius:"10px",
    background:"#FFD700",
    fontWeight:"bold",
    marginBottom:"15px"
  }}
>
  Load Countries
</button>

  <input
    type="number"
    placeholder="Match No"
    value={manualMatchNo}
    onChange={(e) => setManualMatchNo(e.target.value)}
    style={{
      width: "90%",
      padding: "10px",
      borderRadius: "10px",
      marginBottom: "10px",
    }}
  />

  <input
    type="text"
    placeholder="Round"
    value={manualRound}
    onChange={(e) => setManualRound(e.target.value)}
    style={{
      width: "90%",
      padding: "10px",
      borderRadius: "10px",
      marginBottom: "10px",
    }}
  />

  <input
    type="date"
    value={manualDate}
    onChange={(e) => setManualDate(e.target.value)}
    style={{
      width: "90%",
      padding: "10px",
      borderRadius: "10px",
      marginBottom: "10px",
    }}
  />

  <input
    type="time"
    value={manualTime}
    onChange={(e) => setManualTime(e.target.value)}
    style={{
      width: "90%",
      padding: "10px",
      borderRadius: "10px",
      marginBottom: "10px",
    }}
  />

  <select
  value={manualTeamA}
  onChange={(e) =>
    setManualTeamA(e.target.value)
  }
  style={{
    width: "90%",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
  }}
>

  <option value="">
    Select Team A
  </option>

  {fixtureCountries.map(
    (country) => (
      <option
        key={country}
        value={country}
      >
        {country}
      </option>
    )
  )}

</select>

  <select
value={manualTeamB}
onChange={(e)=>setManualTeamB(e.target.value)}
style={{
width:"90%",
padding:"10px",
borderRadius:"10px",
marginBottom:"10px"
}}
>

<option value="">
Select Team B
</option>

{fixtureCountries.map(
(country)=>(
<option
key={country}
value={country}
>
{country}
</option>
)
)}

</select>

  <br />

  <button
    onClick={handleSaveManualFixture}
    style={{
      marginTop: "10px",
      padding: "12px 18px",
      borderRadius: "12px",
      border: "1px solid #FFD700",
      background: "#FFD700",
      color: "black",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Save Fixture
  </button>
</div>

<div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    ⚙️ Fantasy Settings
  </h2>

  <p style={{ color: "#bbb" }}>
    Set fantasy team creation deadline
  </p>

  <input
    type="datetime-local"
    value={teamCreationDeadline}
    onChange={(e) =>
      setTeamCreationDeadline(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "10px",
      marginTop: "10px",
    }}
  />

  <br />

  <button
    onClick={handleSaveFantasyDeadline}
    style={{
      marginTop: "15px",
      padding: "12px 18px",
      borderRadius: "12px",
      border: "1px solid #FFD700",
      background: "#FFD700",
      color: "black",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Save Deadline
  </button>
</div>

<div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    🔄 Transfer Window
  </h2>

  <label style={{ color: "#bbb" }}>
    <input
      type="checkbox"
      checked={transferWindowOpen}
      onChange={(e) =>
        setTransferWindowOpen(e.target.checked)
      }
      style={{ marginRight: "10px" }}
    />
    Transfer Window Open
  </label>

  <div style={{ marginTop: "15px" }}>

<p style={{ color:"#bbb" }}>
Free Transfers
</p>

<input
type="number"
value={freeTransfers}
onChange={(e)=>
setFreeTransfers(e.target.value)
}
style={{
padding:"10px",
borderRadius:"10px"
}}
/>


<p style={{ color:"#bbb" }}>
Base Penalty Per Extra Transfer
</p>

<input
type="number"
value={transferPenaltyBase}
onChange={(e)=>
setTransferPenaltyBase(e.target.value)
}
style={{
padding:"10px",
borderRadius:"10px"
}}
/>

</div>

  <br />

  <button
    onClick={handleSaveTransferWindow}
    style={{
      marginTop: "15px",
      padding: "12px 18px",
      borderRadius: "12px",
      border: "1px solid #FFD700",
      background: "#FFD700",
      color: "black",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Save Transfer Window
  </button>
</div>

<div
style={{
marginTop:"20px",
marginBottom:"25px",
padding:"20px",
borderRadius:"18px",
background:"rgba(255,255,255,0.05)",
border:"1px solid rgba(255,215,0,0.2)",
}}
>

<h2 style={{color:"#FFD700"}}>
📜 Transfer History
</h2>


<button
onClick={loadTransferHistory}
style={{
padding:"10px 15px",
borderRadius:"10px",
background:"#FFD700",
fontWeight:"bold"
}}
>
Load History
</button>


{transferHistory.map((item)=>(

<div
key={item.id}
style={{
marginTop:"15px",
padding:"15px",
borderRadius:"12px",
background:"rgba(255,255,255,0.05)"
}}
>

<h3>
{item.fantasyTeamName}
</h3>

<p>
Manager: {item.managerName}
</p>


<h4 style={{color:"#ff7777"}}>
OUT
</h4>

{item.removedPlayers.map(
(player)=>(
<p key={player.id}>
❌ {player.name}
</p>
)
)}


<h4 style={{color:"#77ff77"}}>
IN
</h4>

{item.addedPlayers.map(
(player)=>(
<p key={player.id}>
✅ {player.name}
</p>
)
)}


<p style={{color:"#FFD700"}}>
Penalty: -{item.penaltyThisSave} pts
</p>

<p style={{color:"#aaa"}}>
{new Date(
item.createdAt
).toLocaleString()}
</p>

</div>

))}

</div>

<div
  style={{
    marginTop: "20px",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    📊 Player Performance Upload
  </h2>

  <p style={{ color: "#bbb" }}>
    Upload CSV with columns: MatchNo, Player, Goals, Assists, CleanSheet, YellowCard, RedCard, MOTM
  </p>

  <input
    type="file"
    accept=".csv"
    onChange={handlePerformanceCsvUpload}
    style={{
      marginTop: "10px",
      color: "white",
    }}
  />

  {performanceData.length > 0 && (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ color: "#FFD700" }}>
        Preview: {performanceData.length} Records
      </h3>

      {performanceData.slice(0, 5).map((record) => (
        <p
          key={record.id}
          style={{
            color: "#bbb",
            margin: "6px 0",
          }}
        >
          Match {record.matchNo}: {record.player} - Goals: {record.goals}, Assists: {record.assists}
        </p>
      ))}

      {performanceData.length > 5 && (
        <p style={{ color: "#888" }}>
          + {performanceData.length - 5} more records
        </p>
      )}

      <button
        onClick={handleSavePerformance}
        style={{
          marginTop: "15px",
          padding: "12px 18px",
          borderRadius: "12px",
          border: "1px solid #FFD700",
          background: "#FFD700",
          color: "black",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Save Performance
      </button>
    </div>
  )}
</div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          window.innerWidth < 768
            ? "1fr"
            : "1fr 1fr",
        gap: "15px",
        marginTop: "20px",
      }}
    >
      {[
        "👥 Player Database",
        "⚽ Matches",
        "🗳 Polls",
        "🔄 Transfers",
        "📊 Leaderboard",
        "⚙️ Settings",
      ].map((item) => (
        <div
          key={item}
          style={{
            padding: "18px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,215,0,0.15)",
            color: "#FFD700",
            fontWeight: "bold",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>
)}

      <p style={{ color: "#bbb" }}>
        LilFox Fantasy Engine control center.
      </p>

      <div
  style={{
    marginTop: "20px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
    fontFamily: "Arial, Calibri, sans-serif",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    🚦 Site Status
  </h2>

  <label style={{ color: "#bbb" }}>
    <input
      type="checkbox"
      checked={maintenanceMode}
      onChange={(e) =>
        setMaintenanceMode(e.target.checked)
      }
      style={{ marginRight: "10px" }}
    />
    Maintenance Mode ON
  </label>

  <br />

  <button
    onClick={handleSaveSiteSettings}
    style={{
      marginTop: "15px",
      padding: "12px 18px",
      borderRadius: "12px",
      border: "1px solid #FFD700",
      background: "#FFD700",
      color: "black",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Save Site Status
  </button>
</div>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns:
            window.innerWidth < 768
              ? "1fr"
              : "1fr 1fr",
          gap: "20px",
        }}
      >
        <div
  style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: "18px",
    padding: "20px",
  }}
>
 <h2 style={{ color: "#FFD700" }}>
  🏆 Competitions
</h2>


{profile?.role === "superadmin" && (
  <>
    <input
      type="text"
      placeholder="Competition Name"
      value={competitionName}
      onChange={(e) =>
        setCompetitionName(e.target.value)
      }
      style={{
        width: "90%",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "12px",
      }}
    />


    <select
      value={competitionType}
      onChange={(e) =>
        setCompetitionType(e.target.value)
      }
      style={{
        width: "95%",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "12px",
      }}
    >
      <option value="worldcup">
        World Cup Fantasy
      </option>

      <option value="war">
        WAR Fantasy
      </option>
    </select>


    <button
      onClick={handleCreateCompetition}
      style={{
        padding: "12px 18px",
        borderRadius: "12px",
        background: "#FFD700",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      + Create Competition
    </button>
  </>
)}


<div
  style={{
    marginTop: "20px",
  }}
>
  <h3 style={{ color: "#FFD700" }}>
    Existing Competitions
  </h3>

  {competitions.length === 0 ? (
    <p style={{ color: "#bbb" }}>
      No competitions created yet.
    </p>
  ) : (
    competitions.map((competition) => (
      <div
        key={competition.id}
        style={{
          marginTop: "12px",
          padding: "12px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,215,0,0.15)",
        }}
      >
        <h4
          style={{
            color: "white",
            margin: "0 0 6px 0",
          }}
        >
          {competition.name}
        </h4>

        <p
          style={{
            color: "#bbb",
            margin: 0,
            fontSize: "0.9rem",
          }}
        >
          Type: {competition.type} | Status: {competition.status}
        </p>
        <button
  onClick={() => setSelectedCompetition(competition)}
  style={{
    marginTop: "10px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #FFD700",
    background: "rgba(255,215,0,0.15)",
    color: "#FFD700",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Manage
</button>
      </div>
    ))
  )}
</div>

</div>

        <div
  style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: "18px",
    padding: "20px",
  }}
>
  <h2 style={{ color: "#FFD700" }}>
    👥 Users & Admins
  </h2>

  <p style={{ color: "#bbb" }}>
    Total Users: {users.length}
  </p>

  <p style={{ color: "#bbb" }}>
    Admins: {users.filter((u) => u.role === "admin").length}
  </p>

  <p style={{ color: "#bbb" }}>
    Players: {users.filter((u) => u.role === "player").length}
  </p>

  {profile?.role === "superadmin" && (

<button
  onClick={() => {
    fetchUsers();
    setShowManageUsers(true);
  }}
  style={{
    marginTop: "10px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #FFD700",
    background: "rgba(255,215,0,0.15)",
    color: "#FFD700",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Manage Users
</button>

)}
</div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <h2 style={{ color: "#FFD700" }}>
            🗳 Polls
          </h2>
          <p style={{ color: "#bbb" }}>
            Create prediction polls with deadlines.
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <h2 style={{ color: "#FFD700" }}>
            🔄 Transfers
          </h2>
          <p style={{ color: "#bbb" }}>
            Open and close transfer windows.
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
        "radial-gradient(circle at top, #3a2b00 0%, #050505 60%)",
        color: "white",
        padding: window.innerWidth < 768 ? "6px" : "20px",
        fontFamily: "'Orbitron', sans-serif",
        overflowX: "hidden",
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
      {/* LOGIN AREA */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  }}
>
  {user ? (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}
  >

    {(profile?.role === "superadmin" ||
  profile?.role === "admin") && (
  <>
    <span
      style={{
        color: "#FFD700",
        fontWeight: "bold",
        border: "1px solid #FFD700",
        borderRadius: "10px",
        fontSize: window.innerWidth < 768 ? "0.75rem" : "1rem",
        padding: window.innerWidth < 768 ? "6px 8px" : "8px 12px",
      }}
    >
      👑 SUPER ADMIN
    </span>

    <button
      onClick={() => {
  fetchCompetitions();
  fetchUsers();
  setShowAdminPanel(true);
}}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #ff4d4d",
        background: "rgba(255,0,0,0.15)",
        color: "#ff4d4d",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Admin Panel
    </button>
  </>
)}

    <button
      onClick={handleLogout}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #FFD700",
        background: "rgba(255,215,0,0.15)",
        color: "#FFD700",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Logout
    </button>

  </div>
) : (
    <button
      onClick={handleGoogleLogin}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #FFD700",
        background: "rgba(255,215,0,0.15)",
        color: "#FFD700",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Login with Google
    </button>
  )}
</div>

{/* CREATE MANAGER PROFILE */}
{creatingProfile && (
  <div
    style={{
      maxWidth: "400px",
      margin: "20px auto",
      padding: "25px",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "20px",
      border: "1px solid rgba(255,215,0,0.3)",
      textAlign: "center",
    }}
  >
    <h2 style={{ color: "#FFD700" }}>
      Create Manager Profile
    </h2>

    <input
      type="text"
      placeholder="Manager Name"
      value={managerName}
      onChange={(e) =>
        setManagerName(e.target.value)
      }
      style={{
        width: "90%",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "10px",
      }}
    />

    <input
      type="text"
      placeholder="Fantasy Team Name"
      value={fantasyTeamName}
      onChange={(e) =>
        setFantasyTeamName(e.target.value)
      }
      style={{
        width: "90%",
        padding: "12px",
        marginBottom: "20px",
        borderRadius: "10px",
      }}
    />

    <button
      onClick={handleCreateProfile}
      style={{
        padding: "12px 20px",
        borderRadius: "12px",
        background: "#FFD700",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Create Profile
    </button>
  </div>
)}

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
              width:
              window.innerWidth < 768
              ? "70px"
              : "90px",
              filter: "drop-shadow(0 0 12px rgba(0,0,0,0.9))",
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
            color: "#aa9304",
            letterSpacing: window.innerWidth < 768 ? "1px" : "2px",
            textShadow:
            "0 0 10px #070707, 0 0 20px #0e0d0d, 0 0 40px #010101",
            margin: "0",
            fontFamily:"'Rubik Wet Paint', sans-serif",
            }}
>
  WARLORDZ ESPORTS
</motion.h1>
        </div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{
  opacity: 1,
  y: 0,
  textShadow: [
    "0 0 10px #0f0e0e, 0 0 20px #121111, 0 0 40px #141313",
    "0 0 15px #FFD700, 0 0 30px #FFD700, 0 0 60px #060606",
    "0 0 10px #070707, 0 0 20px #0a0909, 0 0 40px #0b0b0b",
  ],
}}
          transition={{ delay: 0.5 }}
          style={{
  textAlign: "center",
  color: "#fb0505b1",
  marginBottom: "8px",
  fontSize: window.innerWidth < 768 ? "1rem" : "1.6rem",
  letterSpacing: "2px",
  fontWeight: "bold",
  textShadow:
    "0 0 8px rgba(255,215,0,0.7), 0 0 18px rgba(255,215,0,0.5)",
    fontFamily: "'Jim Nightshade', cursive",
}}
        >
          ...Legends Are Made Here...
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
        {activeTab !== "dashboard" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {[
           
            { id: "standings", label: "Table" },
            { id: "awards", label: "Awards" },
            { id: "individual", label: "Stats" },
            { id: "fixtures", label: "Fixtures" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:
  window.innerWidth < 768
    ? "10px 12px"
    : "12px 20px",
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
                fontSize:
  window.innerWidth < 768
    ? "0.85rem"
    : "1rem",
whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )}

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
        {activeTab === "individual" && (
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <input
            type="text"
            placeholder="Search Player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "14px",
              width:
              window.innerWidth < 768
              ? "92%"
              : "320px",
              borderRadius: "14px",
              border: "1px solid #FFD700",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </div>
        )}

{activeTab !== "dashboard" && (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <button
      onClick={() => setActiveTab("dashboard")}
      style={{
        padding: "10px 18px",
        borderRadius: "12px",
        border: "1px solid #FFD700",
        background: "rgba(255,215,0,0.1)",
        color: "#FFD700",
        cursor: "pointer",
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: "bold",
        boxShadow: "0 0 12px rgba(255,215,0,0.15)",
      }}
    >
      ← Dashboard
    </button>
  </div>
)}

        {/* Content */}
        {activeTab === "dashboard" ? (
  <div
    style={{
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 768
      ? "1fr"
      : "1fr 1fr",
  gap: "20px",
  alignItems: "stretch",
}}
  >

    {/* FANTASY WORLD CUP CARD */}
<motion.div
  whileHover={{ scale: 1.02 }}
  onClick={() => {
  if (user) {
    handleLoadSavedFantasyTeam();
    setShowFantasyPage(true);
  } else {
    alert("Please login to participate in Fantasy.");
  }
}}
  style={{
    gridColumn:
      window.innerWidth < 768
        ? "span 1"
        : "span 2",
    background: "rgba(255,215,0,0.08)",
    border: "2px solid rgba(255,215,0,0.4)",
    borderRadius: "20px",
    padding: "25px",
    cursor: "pointer",
    textAlign: "center",
    backdropFilter: "blur(12px)",

    fontFamily:
      "Arial, Calibri, sans-serif",
  }}
>
  <h1
  style={{
    color: "#FFD700",
    marginBottom: "10px",
    fontSize:
      window.innerWidth < 768
        ? "1.7rem"
        : "2rem",
    lineHeight: "1.2",
  }}
>
  ⚽ FIFA World Cup 2026 Fantasy
</h1>

  <p
    style={{
      color: "#bbb",
      fontSize: "1.1rem",
    }}
  >
    {user
  ? "Create your 15 player dream squad"
  : "🔒 Login to participate"}
  </p>
</motion.div>

{/* WAR 52 DASHBOARD TITLE */}
<div
  style={{
    gridColumn:
      window.innerWidth < 768
        ? "span 1"
        : "span 2",
    textAlign: "center",
    marginTop: "10px",
    marginBottom: "5px",
  }}
>
  <h1
    style={{
      color: "#FFD700",
      fontFamily: "'Orbitron', sans-serif",
      letterSpacing: "2px",
    }}
  >
    Dashboard
  </h1>
</div>

        {/* HERO STATS STRIP */}
    <div
      style={{
        gridColumn:
          window.innerWidth < 768
            ? "span 1"
            : "span 2",
        display: "grid",
        gridTemplateColumns:
          window.innerWidth < 768
            ? "1fr 1fr"
            : "repeat(4, 1fr)",
        gap: "15px",
      }}
    >
      {[
        {
          label: "Teams",
          value: totalTeams,
          icon: "🛡",
        },
        {
          label: "Matches",
          value: totalMatchesPlayed,
          icon: "⚔",
        },
        {
          label: "Goals",
          value: totalGoals,
          icon: "⚽",
        },
        {
          label: "Clean Sheets",
          value: totalCleanSheets,
          icon: "🧤",
        },
      ].map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03 }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(255,215,0,0.2)",
            borderRadius: "18px",
            padding: "18px",
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              fontSize: "1.8rem",
              marginBottom: "8px",
            }}
          >
            {stat.icon}
          </div>

          <h1
            style={{
              color: "#FFD700",
              margin: 0,
              fontSize:
                window.innerWidth < 768
                  ? "1.8rem"
                  : "2.4rem",
            }}
          >
            {stat.value}
          </h1>

          <p
            style={{
              color: "#bbb",
              marginTop: "6px",
              fontSize: "0.95rem",
              fontFamily: "'Jim Nightshade', cursive",
            }}
          >
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>

    {/* LEAGUE LEADER CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setActiveTab("standings")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        🏆 League Leader
      </h2>

      <h1
        style={{
          fontSize:
            window.innerWidth < 768
              ? "2rem"
              : "3rem",
          marginBottom: "10px",
          color: "white",
          fontFamily: "'Jim Nightshade', cursive",
        }}
      >
        {standingsData[0]?.["Team Name"]}
      </h1>

      <p
        style={{
          color: "#bbb",
          fontSize: "1.2rem",
        }}
      >
        {standingsData[0]?.P} Points
      </p>
    </motion.div>
    {/* GOLDEN BOOT LEADER CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setActiveTab("awards")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        ⚽ Golden Boot Leader
      </h2>

      <h1
        style={{
          fontSize:
            window.innerWidth < 768
              ? "2rem"
              : "3rem",
          marginBottom: "10px",
          color: "white",
          fontFamily: "'Jim Nightshade', cursive",
        }}
      >
        {awardsData.goldenBoot[0]?.Player}
      </h1>

      <p
        style={{
          color: "#bbb",
          fontSize: "1.2rem",
        }}
      >
        {awardsData.goldenBoot[0]?.GF} Goals
      </p>
    </motion.div>

    {/* MVP LEADER CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setActiveTab("awards")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        👑 MVP Leader
      </h2>

      <h1
        style={{
          fontSize:
            window.innerWidth < 768
              ? "2rem"
              : "3rem",
          marginBottom: "10px",
          color: "white",
          fontFamily: "'Jim Nightshade', cursive",
        }}
      >
        {awardsData.mvp[0]?.Player}
      </h1>

      <p
        style={{
          color: "#bbb",
          fontSize: "1.2rem",
        }}
      >
        {awardsData.mvp[0]?.P} Points
      </p>
    </motion.div>

            {/* BIGGEST WIN CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setActiveTab("fixtures")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        🔥 Biggest Win
      </h2>

      {biggestWinMatch ? (
        <>
          <h1
            style={{
              fontSize:
                window.innerWidth < 768
                  ? "1.4rem"
                  : "2.2rem",
              marginBottom: "10px",
              color: "white",
              fontFamily: "'Jim Nightshade', cursive",
            }}
          >
            {biggestWinMatch.Home} {biggestWinMatch["H Score"]} -{" "}
            {biggestWinMatch["A Score"]} {biggestWinMatch.Away}
          </h1>

          <p style={{ color: "#bbb", fontSize: "1.1rem" }}>
            Matchday {biggestWinMatch.Matchday} • Margin:{" "}
            {Math.abs(
              Number(biggestWinMatch["H Score"]) -
                Number(biggestWinMatch["A Score"])
            )}
          </p>
        </>
      ) : (
        <p style={{ color: "#bbb", fontSize: "1.1rem" }}>
          No completed matches yet.
        </p>
      )}
    </motion.div>

        {/* NEXT MATCHDAY CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setActiveTab("fixtures")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        🕒 Next Matchday
      </h2>

      {nextMatchday ? (
        <>
          <h1
            style={{
              fontSize:
                window.innerWidth < 768
                  ? "2rem"
                  : "3rem",
              marginBottom: "10px",
              color: "white",
              fontFamily: "'Jim Nightshade', cursive",
            }}
          >
            {nextMatchday.Matchday}
          </h1>

          <p
            style={{
              color: "#bbb",
              fontSize: "1.1rem",
            }}
          >
            {nextMatchdayFixtures.length} Fixtures Scheduled
          </p>
        </>
      ) : (
        <p
          style={{
            color: "#bbb",
            fontSize: "1.1rem",
          }}
        >
          All fixtures completed.
        </p>
      )}
    </motion.div>

        {/* PREVIOUS SEASONS CARD */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => alert("Previous Seasons will be available from WAR 53 onwards.")}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "10px",
        }}
      >
        📜 Previous Seasons
      </h2>

      <h1
        style={{
          fontSize:
            window.innerWidth < 768
              ? "2rem"
              : "3rem",
          marginBottom: "10px",
          color: "white",
          fontFamily: "'Jim Nightshade', cursive",
        }}
      >
        Archives
      </h1>

      <p
        style={{
          color: "#bbb",
          fontSize: "1.1rem",
        }}
      >
        Previous season records will be available from WAR 53 onwards.
      </p>
    </motion.div>

  </div>
) : activeTab === "awards" ? (
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
        { id: "goldenBoot", label: "⚽" },
        { id: "goldenGlove", label: "🧤" },
        { id: "leastBeaten", label: "🛡" },
        { id: "bestDefender", label: "🔒" },
        { id: "goalsPerMatch", label: "🎯" },
        { id: "mvp", label: "👑" },
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
    <h2
  style={{
    textAlign: "center",
    color: "#FFD700",
    marginBottom: "20px",
    letterSpacing: "2px",
    textShadow:
      "0 0 10px rgba(0,0,0,0.8)",
  }}
>
  {selectedAward === "goldenBoot"
    ? "⚽Golden Boot⚽"
    : selectedAward === "goldenGlove"
    ? "🧤Golden Glove🧤"
    : selectedAward === "leastBeaten"
    ? "🛡Least Beaten🛡"
    : selectedAward === "bestDefender"
    ? "🔒Best Defender🔒"
    : selectedAward === "goalsPerMatch"
    ? "🎯Goals Per Match🎯"
    : "👑Most Valuable Player👑"}
</h2>

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
{/* Top 5 Leaderboard */}

<div
  style={{
    overflowX: "auto",
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      background: "rgba(255,255,255,0.04)",
      borderRadius: "16px",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
    }}
  >
    <thead>
      <tr>
        <th
          style={{
            padding: "16px",
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
          }}
        >
          Rank
        </th>

        <th
          style={{
            padding: "16px",
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
          }}
        >
          Player
        </th>

        <th
          style={{
            padding: "16px",
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
          }}
        >
          Team
        </th>

        <th
          style={{
            padding: "16px",
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
          }}
        >
          Stat
        </th>
      </tr>
    </thead>

    <tbody>
      {awardsData[selectedAward].map(
        (player, index) => (
          <motion.tr
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
            }}
            style={{
              background:
                index % 2 === 0
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.01)",
            }}
          >
            <td
              style={{
                padding: "14px",
                textAlign: "center",
                color:
                  index === 0
                    ? "#FFD700"
                    : "#ddd",
                fontWeight: "bold",
              }}
            >
              {index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : `#${index + 1}`}
            </td>

            <td
              style={{
                padding: "14px",
                textAlign: "center",
              }}
            >
              {player.Player}
            </td>

            <td
              style={{
                padding: "14px",
                textAlign: "center",
                color: "#bbb",
              }}
            >
              {player.Team}
            </td>

            <td
              style={{
                padding: "14px",
                textAlign: "center",
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              {selectedAward === "goldenBoot" &&
                player.GF}

              {selectedAward ===
                "goldenGlove" &&
                player.CS}

              {selectedAward ===
                "leastBeaten" &&
                player.L}

              {selectedAward ===
                "bestDefender" &&
                player.GA}

              {selectedAward ===
                "goalsPerMatch" &&
                (
                  Number(player.GF) /
                  Number(player.M)
                ).toFixed(2)}

              {selectedAward === "mvp" &&
                player.P}
            </td>
          </motion.tr>
        )
      )}
    </tbody>
  </table>
</div>
  </div>
  ) : activeTab === "standings" ? (
  <div
    style={{
      overflowX: "auto",
    }}
  >
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
        <tr>
          {[
            "Position",
            "Team Name",
            "M",
            "W",
            "D",
            "L",
            "GF",
            "GA",
            "GD",
            "P",
            "Form",
          ].map((header) => (
            <th
              key={header}
              style={{
                padding: "14px",
                background: "rgba(255,215,0,0.12)",
                color: "#FFD700",
                textAlign: "center",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {standingsData.map((team, index) => (
          <motion.tr
            key={index}
            whileHover={{
              backgroundColor:
                "rgba(255,215,0,0.08)",
            }}
            style={{
              background:
                index % 2 === 0
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.01)",
            }}
          >
            <td style={cellStyle}>
              {team.Position}
            </td>

            <td style={cellStyle}>
              {team["Team Name"]}
            </td>

            <td style={cellStyle}>{team.M}</td>
            <td style={cellStyle}>{team.W}</td>
            <td style={cellStyle}>{team.D}</td>
            <td style={cellStyle}>{team.L}</td>
            <td style={cellStyle}>{team.GF}</td>
            <td style={cellStyle}>{team.GA}</td>
            <td style={cellStyle}>{team.GD}</td>

            <td
              style={{
                ...cellStyle,
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              {team.P}
            </td>

            <td style={cellStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                {team.Form?.split("").map(
                  (result, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        background:
                          result === "W"
                            ? "#16a34a"
                            : result === "D"
                            ? "#f59e0b"
                            : "#dc2626",
                        color: "white",
                      }}
                    >
                      {result}
                    </span>
                  )
                )}
              </div>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
  ) : activeTab === "fixtures" ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "30px",
    }}
  >
    {Object.entries(groupedFixtures).map(
      ([matchday, matches]) => (
        <div
          key={matchday}
          style={{
            background:
              "rgba(255,255,255,0.04)",
            borderRadius: "20px",
            padding: "20px",
            backdropFilter: "blur(12px)",
            border:
              "1px solid rgba(255,215,0,0.15)",
          }}
        >
          <h2
            style={{
              color: "#FFD700",
              marginBottom: "20px",
              textAlign: "center",
              letterSpacing: "2px",
            }}
          >
            MATCHDAY {matchday}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {matches.map((match, index) => {
              const homeScore =
                match["H Score"]

              const awayScore =
                match["A Score"]

              const completed =
                homeScore !== "" &&
                awayScore !== "";

              const homeWon =
                Number(homeScore) >
                Number(awayScore);

              const awayWon =
                Number(awayScore) >
                Number(homeScore);

              return (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.01,
                  }}
                  style={{
                    background:
                      "rgba(255,255,255,0.03)",
                    borderRadius: "16px",
                    padding:
                    window.innerWidth < 768
                    ? "14px"
                    : "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    flexWrap: "nowrap",
                    border: completed
                      ? "1px solid rgba(255,215,0,0.2)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: homeWon
                        ? "bold"
                        : "normal",
                      color: homeWon
                        ? "#FFD700"
                        : "white",
                    }}
                  >
                    {match["Home"]}
                  </div>

                  <div
                    style={{
                      minWidth:
                      window.innerWidth < 768
                      ? "80px"
                      : "120px",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#FFD700",
                    }}
                  >
                    {completed ? (
  <>
    <span
      style={{
        color: homeWon
          ? "#22c55e"
          : "white",
      }}
    >
      {homeScore}
    </span>

    <span
      style={{
        margin: "0 8px",
        color: "white",
      }}
    >
      -
    </span>

    <span
      style={{
        color: awayWon
          ? "#22c55e"
          : "white",
      }}
    >
      {awayScore}
    </span>
  </>
) : (
  "VS"
)}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: awayWon
                        ? "bold"
                        : "normal",
                      color: awayWon
                        ? "#FFD700"
                        : "white",
                    }}
                  >
                    {match["Away"]}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )
    )}
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