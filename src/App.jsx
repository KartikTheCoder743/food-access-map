// src/App.jsx
import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import "./App.css";

/**
 * Reads the API key from env (VITE_GOOGLE_MAPS_API_KEY) with a fallback
 * (you can remove fallback if you want env-only).
 */
const GOOGLE_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyA3b9-jBbpxbx61w-OHrzLBLIWyG7AY_L8";

const libraries = ["places"];
const centerDefault = { lat: 33.4484, lng: -112.074 }; // Phoenix
const mapContainerStyle = { width: "100%", height: "100%" };

// Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_KEY,
    libraries,
  });

  // --------------------------
  // MARKERS (keep your originals)
  // --------------------------
  const [markers, setMarkers] = useState([
    { id: 1, name: "St. Mary’s Food Bank", position: { lat: 33.479, lng: -112.123 }, category: "Food Bank", status: "Open", url: "https://firstfoodbank.org", accessibility: { wheelchairAccessible: true, parking: "Available", ramps: true } },
    { id: 2, name: "Phoenix Rescue Mission", position: { lat: 33.423, lng: -112.112 }, category: "Homeless Shelter", status: "Open", url: "https://phxmission.org", accessibility: { wheelchairAccessible: true, parking: "Limited" } },
    { id: 3, name: "Andre House", position: { lat: 33.4423, lng: -112.0839 }, category: "Soup Kitchen", status: "Closed", url: "https://andrehouse.org", accessibility: { wheelchairAccessible: false, parking: "Street only" } },
    { id: 4, name: "Desert Mission Food Bank", position: { lat: 33.5794, lng: -112.0622 }, category: "Food Pantry", status: "Open", url: "https://desertmission.org", accessibility: { wheelchairAccessible: true, parking: "Available" } },
    { id: 5, name: "UMOM New Day Centers", position: { lat: 33.4645, lng: -112.0294 }, category: "Homeless Shelter", status: "Open", url: "https://umom.org", accessibility: { wheelchairAccessible: true, parking: "Available" } },
    { id: 6, name: "Matthew’s Crossing Food Bank", position: { lat: 33.3775, lng: -111.8291 }, category: "Food Pantry", status: "Open", url: "https://matthewscrossing.org", accessibility: { wheelchairAccessible: true, parking: "Available" } },
    { id: 7, name: "ICNA Relief Food Pantry", position: { lat: 33.4609, lng: -112.0516 }, category: "Food Pantry", status: "Open", url: "https://icnarelief.org", accessibility: { wheelchairAccessible: true, parking: "Limited" } },
    { id: 8, name: "Justa Center", position: { lat: 33.4505, lng: -112.0844 }, category: "Homeless Shelter", status: "Closed", url: "https://justacenter.org", accessibility: { wheelchairAccessible: false, parking: "Street" } },
    { id: 9, name: "Native Health Phoenix", position: { lat: 33.4917, lng: -112.0722 }, category: "Food Pantry", status: "Open", url: "https://nativehealthphoenix.org", accessibility: { wheelchairAccessible: true } },
    { id: 10, name: "Esperança", position: { lat: 33.4855, lng: -112.0918 }, category: "Food Pantry", status: "Open", url: "https://esperanca.org", accessibility: { wheelchairAccessible: true } },
    { id: 11, name: "Phoenix Day", position: { lat: 33.4469, lng: -112.0727 }, category: "Food Pantry", status: "Closed", url: "https://phoenixday.org", accessibility: { wheelchairAccessible: false } },
    { id: 12, name: "Salvation Army - Phoenix", position: { lat: 33.4646, lng: -112.0645 }, category: "Soup Kitchen", status: "Open", url: "https://salvationarmyusa.org", accessibility: { wheelchairAccessible: true } },
    { id: 13, name: "Chandler Food Bank", position: { lat: 33.3062, lng: -111.8413 }, category: "Food Bank", status: "Open", url: "https://chandlerfoodbank.org", accessibility: { wheelchairAccessible: true } },
    { id: 14, name: "Mesa Community Food Pantry", position: { lat: 33.4152, lng: -111.8315 }, category: "Food Pantry", status: "Open", url: "https://mesacommunityfoodpantry.org", accessibility: { wheelchairAccessible: true } },
    { id: 15, name: "Chandler Homeless Shelter", position: { lat: 33.2973, lng: -111.8396 }, category: "Homeless Shelter", status: "Open", url: "https://azcend.org", accessibility: { wheelchairAccessible: true } },
    { id: 16, name: "Mesa Soup Kitchen", position: { lat: 33.4246, lng: -111.8349 }, category: "Soup Kitchen", status: "Closed", url: "https://mesasoupkitchen.org", accessibility: { wheelchairAccessible: false } },
    { id: 17, name: "East Valley Food Pantry", position: { lat: 33.4143, lng: -111.8233 }, category: "Food Pantry", status: "Open", url: "https://eastvalleyfoodpantry.org", accessibility: { wheelchairAccessible: true } },
    { id: 18, name: "Chandler Limited Capacity Food Bank", position: { lat: 33.3078, lng: -111.8485 }, category: "Food Bank", status: "Limited Capacity", url: "https://chandlerlimitedcapacity.org", accessibility: { wheelchairAccessible: true } },
    { id: 19, name: "Scottsdale Meals Center", position: { lat: 33.4942, lng: -111.9261 }, category: "Soup Kitchen", status: "Open", url: "https://scottsdalemeals.org", accessibility: { wheelchairAccessible: true } },
    { id: 20, name: "Glendale Hope Kitchen", position: { lat: 33.5383, lng: -112.1855 }, category: "Soup Kitchen", status: "Open", url: "https://glendalehope.org", accessibility: { wheelchairAccessible: true } },
    { id: 21, name: "Peoria Meals Center", position: { lat: 33.5792, lng: -112.237 }, category: "Soup Kitchen", status: "Open", url: "https://peoriameals.org", accessibility: { wheelchairAccessible: true } },
    { id: 22, name: "Tolleson Community Pantry", position: { lat: 33.4493, lng: -112.2574 }, category: "Food Pantry", status: "Open", url: "https://tollesonpantry.org", accessibility: { wheelchairAccessible: true } },
    { id: 23, name: "West Valley Food Bank", position: { lat: 33.5797, lng: -112.2895 }, category: "Food Bank", status: "Open", url: "https://westvalleyfoodbank.org", accessibility: { wheelchairAccessible: true } },
    { id: 24, name: "Goodyear Community Meals", position: { lat: 33.4354, lng: -112.3582 }, category: "Soup Kitchen", status: "Open", url: "https://goodyearmeals.org", accessibility: { wheelchairAccessible: true } },
    { id: 25, name: "Glendale Emergency Shelter", position: { lat: 33.5402, lng: -112.181 }, category: "Homeless Shelter", status: "Open", url: "https://glendaleshelter.org", accessibility: { wheelchairAccessible: true } },
    { id: 26, name: "Tempe Feed the Hungry", position: { lat: 33.4149, lng: -111.9433 }, category: "Soup Kitchen", status: "Open", url: "https://feedtempe.org", accessibility: { wheelchairAccessible: true } },
    { id: 27, name: "Apache Junction Food Bank", position: { lat: 33.415, lng: -111.5485 }, category: "Food Bank", status: "Open", url: "https://ajfoodbank.org", accessibility: { wheelchairAccessible: true } },
    { id: 28, name: "Lutheran Social Services Mesa", position: { lat: 33.418, lng: -111.831 }, category: "Food Pantry", status: "Open", url: "https://lss-sw.org", accessibility: { wheelchairAccessible: true } },
    { id: 29, name: "St. Matthew’s Outreach", position: { lat: 33.468, lng: -112.093 }, category: "Food Pantry", status: "Open", url: "https://stmatthewaz.org", accessibility: { wheelchairAccessible: true } },
    { id: 30, name: "House of Refuge", position: { lat: 33.382, lng: -111.7067 }, category: "Homeless Shelter", status: "Open", url: "https://houseofrefuge.org", accessibility: { wheelchairAccessible: true } },
    { id: 31, name: "La Mesita Family Homeless Shelter", position: { lat: 33.4178, lng: -111.8409 }, category: "Homeless Shelter", status: "Open", url: "https://azcend.org", accessibility: { wheelchairAccessible: true } },
    { id: 32, name: "Mesa Family Shelter", position: { lat: 33.419, lng: -111.832 }, category: "Homeless Shelter", status: "Open", url: "https://mesafamilyshelter.org", accessibility: { wheelchairAccessible: true } },
    { id: 33, name: "Ocotillo Food Bank", position: { lat: 33.2600, lng: -111.8755 }, category: "Food Bank", status: "Open", url: "https://ocotillofoodbank.org", accessibility: { wheelchairAccessible: true } },
    { id: 34, name: "Gilbert Community Food Pantry", position: { lat: 33.3528, lng: -111.7890 }, category: "Food Pantry", status: "Open", url: "https://gilbertfoodpantry.org", accessibility: { wheelchairAccessible: true } },
    { id: 35, name: "Heritage Soup Kitchen", position: { lat: 33.3539, lng: -111.7897 }, category: "Soup Kitchen", status: "Open", url: "https://heritagesoup.org", accessibility: { wheelchairAccessible: true } },
    { id: 36, name: "Gilbert Homeless Outreach Center", position: { lat: 33.3715, lng: -111.8005 }, category: "Homeless Shelter", status: "Open", url: "https://gilberthomelessoutreach.org", accessibility: { wheelchairAccessible: true } },
    { id: 37, name: "Southeast Valley Food Bank", position: { lat: 33.3322, lng: -111.7800 }, category: "Food Bank", status: "Closed", url: "https://sevalleyfoodbank.org", accessibility: { wheelchairAccessible: false } },
    { id: 38, name: "Gilbert Family Resource Center", position: { lat: 33.3660, lng: -111.7875 }, category: "Food Pantry", status: "Open", url: "https://gilbertfamilyresource.org", accessibility: { wheelchairAccessible: true } },
    { id: 39, name: "Sun Lakes Community Pantry", position: { lat: 33.2145, lng: -111.8612 }, category: "Food Pantry", status: "Open", url: "https://sunlakespantry.org", accessibility: { wheelchairAccessible: true } },
    { id: 40, name: "Chandler Community Pantry", position: { lat: 33.3045, lng: -111.8517 }, category: "Food Pantry", status: "Open", url: "https://chandlercommunitypantry.org", accessibility: { wheelchairAccessible: true } },
  ]);

  // --------------------------
  // STATE
  // --------------------------
  const [tab, setTab] = useState(0); // 0 = Assistant, 1 = Map
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMarker, setNewMarker] = useState({
    name: "",
    lat: "",
    lng: "",
    category: "",
    status: "Open",
    url: "",
    accessibility: {
      wheelchairAccessible: false,
      parking: "",
      ramps: false,
      serviceAnimals: false,
      other: "",
    },
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hey! I’m FeedMap Assistant. Try: 'nearest pantry', 'open shelters', 'food banks in Chandler', or 'directions to UMOM'.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const mapRef = useRef(null);
  const userLocationRef = useRef(null);

  // --------------------------
  // MAP HANDLERS
  // --------------------------
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setNewMarker((prev) => ({ ...prev, lat, lng }));
    setDialogOpen(true);
  }, []);

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        userLocationRef.current = { lat, lng };
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(13);
        }
      },
      () => alert("Location access denied.")
    );
  };

  const handleSubmitMarker = (ev) => {
    ev.preventDefault();
    const id = Date.now();
    const marker = {
      id,
      name: newMarker.name || "Unnamed Resource",
      position: {
        lat: parseFloat(newMarker.lat),
        lng: parseFloat(newMarker.lng),
      },
      category: newMarker.category || "Food Pantry",
      status: newMarker.status || "Open",
      url: newMarker.url || "",
      accessibility: newMarker.accessibility || {},
    };
    setMarkers((prev) => [...prev, marker]);
    setDialogOpen(false);
    setNewMarker({
      name: "",
      lat: "",
      lng: "",
      category: "",
      status: "Open",
      url: "",
      accessibility: {
        wheelchairAccessible: false,
        parking: "",
        ramps: false,
        serviceAnimals: false,
        other: "",
      },
    });
  };

  // --------------------------
  // FILTERED MARKERS
  // --------------------------
  const filteredMarkers = useMemo(() => {
    return markers.filter(
      (m) =>
        (filterCategory === "" || m.category === filterCategory) &&
        (filterStatus === "" || m.status === filterStatus)
    );
  }, [markers, filterCategory, filterStatus]);

  // --------------------------
  // SMARTER LOCAL CHAT
  // --------------------------
  const byCityHint = (m) => {
    // very rough keyword check for common east/west valley place words
    const name = m.name.toLowerCase();
    const lat = m.position.lat;
    const lng = m.position.lng;
    // quick bounding checks (super rough; just to make it feel smart)
    const inChandler =
      lat >= 33.2 && lat <= 33.4 && lng >= -111.95 && lng <= -111.75;
    const inMesa =
      lat >= 33.35 && lat <= 33.5 && lng >= -111.9 && lng <= -111.55;
    const inPhoenix =
      lat >= 33.35 && lat <= 33.7 && lng >= -112.3 && lng <= -111.95;
    const inGilbert =
      lat >= 33.25 && lat <= 33.45 && lng >= -111.9 && lng <= -111.65;
    return { inChandler, inMesa, inPhoenix, inGilbert, name };
  };

  const replyTo = (text) => {
    const t = text.toLowerCase().trim();

    // directions to <name>
    if (t.startsWith("directions to ")) {
      const q = t.replace("directions to ", "").trim();
      const found = markers.find((m) =>
        m.name.toLowerCase().includes(q)
      );
      if (!found) return "I couldn't find that place. Try a more exact name.";
      const url = `https://www.google.com/maps/dir/?api=1&destination=${found.position.lat},${found.position.lng}`;
      return `Directions to ${found.name}: ${url}`;
    }

    // nearest [category]
    if (t.includes("nearest") || t.includes("closest")) {
      const user = userLocationRef.current || centerDefault;
      const wantPantry = t.includes("pantry");
      const wantBank = t.includes("bank");
      const wantShelter = t.includes("shelter");
      const wantKitchen = t.includes("kitchen") || t.includes("meals");

      let pool = markers;
      if (wantPantry) pool = pool.filter((m) => m.category === "Food Pantry");
      else if (wantBank) pool = pool.filter((m) => m.category === "Food Bank");
      else if (wantShelter) pool = pool.filter((m) => m.category.includes("Shelter"));
      else if (wantKitchen) pool = pool.filter((m) => m.category === "Soup Kitchen");

      if (pool.length === 0) return "No matching resources found.";
      const distances = pool.map((m) => ({
        ...m,
        distanceKm: haversineDistance(
          user.lat,
          user.lng,
          m.position.lat,
          m.position.lng
        ),
      }));
      distances.sort((a, b) => a.distanceKm - b.distanceKm);
      const best = distances[0];
      return `Nearest ${best.category.toLowerCase()}: ${best.name} — ${best.distanceKm.toFixed(
        2
      )} km away. Directions: https://www.google.com/maps/dir/?api=1&destination=${best.position.lat},${best.position.lng}`;
    }

    // list open
    if (t.includes("open")) {
      const list = markers.filter(
        (m) => (m.status || "").toLowerCase() === "open"
      );
      if (!list.length) return "No open resources in the list.";
      const lines = list
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} (${m.category}) — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Open now:\n${lines}${list.length > 12 ? `\n…and ${list.length - 12} more.` : ""}`;
    }

    // by category (pantry/bank/shelter/kitchen)
    if (t.includes("food pantry") || t.includes("pantry")) {
      const list = markers.filter((m) => m.category === "Food Pantry");
      if (!list.length) return "No food pantries found.";
      const lines = list
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Food pantries:\n${lines}${list.length > 12 ? `\n…and ${list.length - 12} more.` : ""}`;
    }
    if (t.includes("food bank") || t.includes("bank")) {
      const list = markers.filter((m) => m.category === "Food Bank");
      if (!list.length) return "No food banks found.";
      const lines = list
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Food banks:\n${lines}${list.length > 12 ? `\n…and ${list.length - 12} more.` : ""}`;
    }
    if (t.includes("shelter")) {
      const list = markers.filter((m) => m.category.includes("Shelter"));
      if (!list.length) return "No shelters found.";
      const lines = list
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Shelters:\n${lines}${list.length > 12 ? `\n…and ${list.length - 12} more.` : ""}`;
    }
    if (t.includes("soup kitchen") || t.includes("kitchen") || t.includes("meals")) {
      const list = markers.filter((m) => m.category === "Soup Kitchen");
      if (!list.length) return "No soup kitchens found.";
      const lines = list
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Soup kitchens:\n${lines}${list.length > 12 ? `\n…and ${list.length - 12} more.` : ""}`;
    }

    // by city word
    if (t.includes("chandler") || t.includes("phoenix") || t.includes("mesa") || t.includes("gilbert")) {
      const pool = markers.filter((m) => {
        const { inChandler, inMesa, inPhoenix, inGilbert } = byCityHint(m);
        if (t.includes("chandler")) return inChandler;
        if (t.includes("phoenix")) return inPhoenix;
        if (t.includes("mesa")) return inMesa;
        if (t.includes("gilbert")) return inGilbert;
        return false;
      });
      if (!pool.length) return "No matches for that city keyword.";
      const lines = pool
        .slice(0, 12)
        .map(
          (m) =>
            `• ${m.name} (${m.category}) — https://www.google.com/maps/search/?api=1&query=${m.position.lat},${m.position.lng}`
        )
        .join("\n");
      return `Matches:\n${lines}${pool.length > 12 ? `\n…and ${pool.length - 12} more.` : ""}`;
    }

    // help
    if (t === "help" || t.includes("how") || t.includes("what can")) {
      return "Try: 'nearest pantry', 'open shelters', 'food banks', 'soup kitchens', 'in Chandler', or 'directions to UMOM'.";
    }

    // fallback search by name
    const found = markers.find((m) => m.name.toLowerCase().includes(t));
    if (found) {
      return `Found: ${found.name} (${found.category}). Directions: https://www.google.com/maps/dir/?api=1&destination=${found.position.lat},${found.position.lng}`;
    }

    return "I didn't catch that. Try 'nearest pantry', 'open shelters', or 'directions to UMOM'.";
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setMessages((m) => [...m, { sender: "user", text: userText }]);
    const bot = replyTo(userText);
    // quick "thinking" delay
    setTimeout(() => {
      setMessages((m) => [...m, { sender: "bot", text: bot }]);
    }, 250);
    setChatInput("");
  };

  // --------------------------
  // RENDER
  // --------------------------
  if (loadError)
    return <div style={{ padding: 20 }}>Error loading Google Maps</div>;
  if (!isLoaded)
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    // The page can scroll if content grows (esp. Assistant tab)
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Top App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,245,245,0.8))",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          color: "#222",
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Food Access Map — Phoenix Area
          </Typography>
          <Chip label={`${markers.length} resources`} sx={{ ml: 1 }} />
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            size="small"
            placeholder="Search by name…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = e.target.value.toLowerCase().trim();
                if (!q) return;
                const found = markers.find((m) =>
                  m.name.toLowerCase().includes(q)
                );
                if (found && mapRef.current) {
                  setTab(1);
                  mapRef.current.panTo(found.position);
                  mapRef.current.setZoom(14);
                } else {
                  alert("No matching resource found.");
                }
              }
            }}
            sx={{
              width: { xs: 180, sm: 260 },
              bgcolor: "rgba(255,255,255,0.95)",
              borderRadius: 1,
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
          <Tooltip title="Center map on my location">
            <span>
              <Button
                variant="contained"
                startIcon={<MyLocationIcon />}
                onClick={() => {
                  setTab(1);
                  locateUser();
                }}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                My Location
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Add a resource">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddLocationAltIcon />}
              onClick={() => {
                setTab(1);
                setDialogOpen(true);
              }}
            >
              Add Resource
            </Button>
          </Tooltip>
        </Toolbar>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          textColor="inherit"
          indicatorColor="primary"
          sx={{ mt: 0.5 }}
        >
          <Tab icon={<SmartToyIcon />} iconPosition="start" label="Assistant" />
          <Tab icon={<MapIcon />} iconPosition="start" label="Map" />
        </Tabs>
      </AppBar>

      {/* Assistant Tab (full-page grows; page scrolls) */}
      {tab === 0 && (
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 3, maxWidth: 1200, mx: "auto" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            FeedMap Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ask for help like: <b>nearest pantry</b>, <b>open shelters</b>,{" "}
            <b>food banks in Chandler</b>, <b>directions to UMOM</b>.
          </Typography>

          {/* Conversation grows; no fixed height. The page will scroll naturally. */}
          <Card sx={{ p: 2, boxShadow: 2 }}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  my: 1,
                  textAlign: m.sender === "user" ? "right" : "left",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: 1.25,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor:
                      m.sender === "user"
                        ? "rgba(25,118,210,0.12)"
                        : "rgba(0,0,0,0.05)",
                  }}
                >
                  <b>{m.sender === "user" ? "You" : "Bot"}:</b> {m.text}
                </Typography>
              </Box>
            ))}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 2 }}
            >
              <TextField
                fullWidth
                size="medium"
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              />
              <Button variant="contained" onClick={handleChatSend} startIcon={<ChatIcon />}>
                Send
              </Button>
            </Stack>

            {/* Quick suggestion chips */}
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {[
                "nearest pantry",
                "open shelters",
                "food banks",
                "soup kitchens",
                "in Chandler",
                "directions to UMOM",
              ].map((s, i) => (
                <Chip
                  key={i}
                  label={s}
                  onClick={() => {
                    setChatInput(s);
                    setTimeout(() => handleChatSend(), 50);
                  }}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Card>
        </Box>
      )}

      {/* Map Tab */}
      {tab === 1 && (
        <Box
          sx={{
            position: "relative",
            px: 0,
            // On small screens, allow the page to scroll so nothing is cut off
            minHeight: "70vh",
          }}
        >
          {/* Right floating control card (position absolute over the map) */}
          <Card
            sx={{
              position: "absolute",
              top: { xs: 88, sm: 96 },
              right: 16,
              zIndex: 1200,
              width: 320,
              borderRadius: 2,
              boxShadow: 4,
              bgcolor: "rgba(255,255,255,0.98)",
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Food Pantry">Food Pantry</MenuItem>
                    <MenuItem value="Food Bank">Food Bank</MenuItem>
                    <MenuItem value="Soup Kitchen">Soup Kitchen</MenuItem>
                    <MenuItem value="Homeless Shelter">Homeless Shelter</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                    <MenuItem value="Limited Capacity">Limited Capacity</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFilterCategory("");
                    setFilterStatus("");
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setZoom(11);
                      mapRef.current.panTo(centerDefault);
                    }
                  }}
                >
                  Reset View
                </Button>
              </Stack>

              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Tip: Click the map to drop a marker and open the add dialog.
              </Typography>
            </CardContent>
          </Card>

          {/* Map container height adapts to screen with room to scroll if needed */}
          <Box
            sx={{
              width: "100%",
              height: {
                xs: "70vh", // smaller on tiny screens so the page scrolls
                sm: "78vh",
                md: "82vh",
              },
              mt: 0,
            }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={centerDefault}
              zoom={11}
              onLoad={onMapLoad}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {filteredMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={{
                    url:
                      marker.category === "Food Pantry"
                        ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        : marker.category === "Food Bank"
                        ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        : marker.category === "Soup Kitchen"
                        ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                  }}
                  onClick={() => setSelected(marker)}
                />
              ))}

              {selected && (
                <InfoWindow
                  position={selected.position}
                  onCloseClick={() => setSelected(null)}
                >
                  <Box sx={{ minWidth: 260 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6">{selected.name}</Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.position.lat},${selected.position.lng}`;
                          window.open(url, "_blank");
                        }}
                      >
                        Directions
                      </Button>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <b>Type:</b> {selected.category}
                    </Typography>
                    <Typography variant="body2">
                      <b>Status:</b>{" "}
                      <span
                        style={{
                          color:
                            selected.status === "Open"
                              ? "green"
                              : selected.status === "Closed"
                              ? "red"
                              : "orange",
                        }}
                      >
                        {selected.status}
                      </span>
                    </Typography>
                    {selected.url && (
                      <Typography variant="body2">
                        <a href={selected.url} target="_blank" rel="noreferrer">
                          Website
                        </a>
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2">Accessibility</Typography>
                    <Typography variant="body2">
                      Wheelchair:{" "}
                      {selected.accessibility?.wheelchairAccessible ? "Yes" : "No"}
                    </Typography>
                    <Typography variant="body2">
                      Parking: {selected.accessibility?.parking || "N/A"}
                    </Typography>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </Box>

          {/* Add Resource Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add a New Resource</DialogTitle>
            <DialogContent>
              <Box
                component="form"
                onSubmit={handleSubmitMarker}
                sx={{ display: "grid", gap: 1 }}
              >
                <TextField
                  label="Name"
                  value={newMarker.name}
                  onChange={(e) =>
                    setNewMarker((p) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                  required
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Latitude"
                    type="number"
                    value={newMarker.lat}
                    onChange={(e) =>
                      setNewMarker((p) => ({ ...p, lat: e.target.value }))
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Longitude"
                    type="number"
                    value={newMarker.lng}
                    onChange={(e) =>
                      setNewMarker((p) => ({ ...p, lng: e.target.value }))
                    }
                    fullWidth
                    required
                  />
                </Stack>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newMarker.category}
                    label="Category"
                    onChange={(e) =>
                      setNewMarker((p) => ({ ...p, category: e.target.value }))
                    }
                    required
                  >
                    <MenuItem value="Food Pantry">Food Pantry</MenuItem>
                    <MenuItem value="Food Bank">Food Bank</MenuItem>
                    <MenuItem value="Soup Kitchen">Soup Kitchen</MenuItem>
                    <MenuItem value="Homeless Shelter">Homeless Shelter</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newMarker.status}
                    label="Status"
                    onChange={(e) =>
                      setNewMarker((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                    <MenuItem value="Limited Capacity">Limited Capacity</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Website (optional)"
                  value={newMarker.url || ""}
                  onChange={(e) =>
                    setNewMarker((p) => ({ ...p, url: e.target.value }))
                  }
                />
                <Divider />
                <Typography variant="subtitle2">Accessibility (optional)</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Wheelchair</InputLabel>
                    <Select
                      value={
                        newMarker.accessibility.wheelchairAccessible
                          ? "yes"
                          : "no"
                      }
                      label="Wheelchair"
                      onChange={(e) =>
                        setNewMarker((p) => ({
                          ...p,
                          accessibility: {
                            ...p.accessibility,
                            wheelchairAccessible: e.target.value === "yes",
                          },
                        }))
                      }
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    placeholder="Parking notes"
                    value={newMarker.accessibility.parking}
                    onChange={(e) =>
                      setNewMarker((p) => ({
                        ...p,
                        accessibility: {
                          ...p.accessibility,
                          parking: e.target.value,
                        },
                      }))
                    }
                    fullWidth
                  />
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} startIcon={<CloseIcon />}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitMarker}
                startIcon={<AddLocationAltIcon />}
              >
                Add Resource
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
