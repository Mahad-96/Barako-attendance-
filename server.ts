import express from "express";
import path from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to persist ERP state
const STATE_FILE_PATH = path.join(process.cwd(), "data.json");

// Define TypeScript structures for ERP State
interface Passenger {
  sn: number;
  name: string;
  phone: string;
  seatNo: number;
  destination: string;
  time: string;
  busNo: string;
  attendance: "Pending" | "Present" | "Absent";
  ticketNo: string;
  gender: string;
  age: string;
  paymentStatus: "Paid" | "Pending" | "Cancelled";
  paymentMethod: string;
}

interface Trip {
  tripId: string;
  routeFrom: string;
  routeTo: string;
  busNo: string;
  driverName: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  capacity: number;
  bookedSeats: number;
  status: "ON TIME" | "DELAYED" | "DEPARTED" | "CANCELLED";
  attendanceLocked: boolean;
  attendanceOverridden: boolean;
}

interface Bus {
  busNo: string;
  plateNo: string;
  model: string;
  capacity: number;
  driverName: string;
  status: "Active" | "Maintenance" | "Fueling" | "Out of Service";
  fuelLevel: number; // percentage
  nextMaintenance: string;
}

interface Driver {
  name: string;
  phone: string;
  licenseNo: string;
  experience: string;
  assignedBus: string;
  assignedRoute: string;
  availability: "Active" | "Off Duty" | "On Trip";
  rating: number;
}

interface Cargo {
  trackingNo: string;
  sender: string;
  receiver: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  weight: number;
  type: string;
  price: number;
  status: "Warehouse" | "In Transit" | "Delivered";
  date: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface ERPState {
  passengers: Passenger[];
  trips: Trip[];
  buses: Bus[];
  drivers: Driver[];
  cargo: Cargo[];
  routes: string[];
  auditLogs: AuditLog[];
  currentUser: {
    username: string;
    role: "Super Admin" | "Admin" | "Office Manager" | "Customer Attendant" | "Driver" | "Customer";
    name: string;
  };
}

// Initial seed data based on handwritten manifesto and the beautiful reference dashboard!
const INITIAL_STATE: ERPState = {
  routes: [
    "Jigjiga", "Wajaale", "Dire Dawa", "Dhagaxbuur", "Qabridahar", "Qabribayah", "Fiiq", "Godey",
    "Wardheer", "Birqod", "Shilaabo", "Danood", "Moyale", "Harar", "Haramaya", "Softu", "Jarati",
    "Dolo Ado", "Mustahil", "Hargeele", "Shaygoosh", "Dhanaan", "Godcusbo", "Sadey", "Mubarak"
  ],
  trips: [
    {
      tripId: "TRP-001",
      routeFrom: "Jigjiga",
      routeTo: "Wajaale",
      busNo: "BJ-21",
      driverName: "Abdi Hassan",
      departureTime: "06:30 AM",
      arrivalTime: "08:00 AM",
      price: 450,
      capacity: 40,
      bookedSeats: 12,
      status: "ON TIME",
      attendanceLocked: true,
      attendanceOverridden: false
    },
    {
      tripId: "TRP-002",
      routeFrom: "Jigjiga",
      routeTo: "Dhagaxbuur",
      busNo: "BJ-24",
      driverName: "Mohamed Ali",
      departureTime: "07:30 AM",
      arrivalTime: "11:00 AM",
      price: 600,
      capacity: 36,
      bookedSeats: 6,
      status: "ON TIME",
      attendanceLocked: false,
      attendanceOverridden: false
    },
    {
      tripId: "TRP-003",
      routeFrom: "Jigjiga",
      routeTo: "Dire Dawa",
      busNo: "BJ-03",
      driverName: "Yusuf Aden",
      departureTime: "06:30 AM",
      arrivalTime: "09:30 AM",
      price: 500,
      capacity: 32,
      bookedSeats: 5,
      status: "DELAYED",
      attendanceLocked: false,
      attendanceOverridden: false
    },
    {
      tripId: "TRP-004",
      routeFrom: "Jigjiga",
      routeTo: "Qabribayah",
      busNo: "BJ-22",
      driverName: "Abdirahman Yusuf",
      departureTime: "09:00 AM",
      arrivalTime: "10:30 AM",
      price: 350,
      capacity: 40,
      bookedSeats: 8,
      status: "ON TIME",
      attendanceLocked: false,
      attendanceOverridden: false
    },
    {
      tripId: "TRP-005",
      routeFrom: "Jigjiga",
      routeTo: "Godey",
      busNo: "BJ-26",
      driverName: "Ibrahim K.",
      departureTime: "10:00 AM",
      arrivalTime: "04:00 PM",
      price: 850,
      capacity: 36,
      bookedSeats: 15,
      status: "ON TIME",
      attendanceLocked: false,
      attendanceOverridden: false
    }
  ],
  passengers: [
    // Wajaale List (TRP-001) - matches handwritten file
    {
      sn: 1,
      name: "Ahmed Alulan",
      phone: "0912345678",
      seatNo: 16,
      destination: "Wajaale",
      time: "06:30 AM",
      busNo: "BJ-21",
      attendance: "Present",
      ticketNo: "TKT-00101",
      gender: "Male",
      age: "34",
      paymentStatus: "Paid",
      paymentMethod: "CBE Birr"
    },
    {
      sn: 2,
      name: "Xadiis Faarax",
      phone: "0911223344",
      seatNo: 14,
      destination: "Wajaale",
      time: "07:00 AM",
      busNo: "BJ-11", // Managed via another trip / subroute
      attendance: "Absent",
      ticketNo: "TKT-00102",
      gender: "Male",
      age: "28",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    },
    {
      sn: 3,
      name: "Mustafe Yuusuf",
      phone: "0919876543",
      seatNo: 17,
      destination: "Wajaale",
      time: "07:30 AM",
      busNo: "BJ-26",
      attendance: "Present",
      ticketNo: "TKT-00103",
      gender: "Male",
      age: "42",
      paymentStatus: "Paid",
      paymentMethod: "Cash"
    },
    {
      sn: 4,
      name: "Xasan Maxamed",
      phone: "0912233445",
      seatNo: 15,
      destination: "Wajaale",
      time: "08:00 AM",
      busNo: "BJ-22",
      attendance: "Pending",
      ticketNo: "TKT-00104",
      gender: "Male",
      age: "31",
      paymentStatus: "Pending",
      paymentMethod: "HelloCash"
    },
    {
      sn: 5,
      name: "Abdi Abdir",
      phone: "0913344556",
      seatNo: 15,
      destination: "Wajaale",
      time: "08:30 AM",
      busNo: "BJ-28",
      attendance: "Present",
      ticketNo: "TKT-00105",
      gender: "Male",
      age: "45",
      paymentStatus: "Paid",
      paymentMethod: "Bank Transfer"
    },
    {
      sn: 6,
      name: "Cabdi Yan",
      phone: "0914455667",
      seatNo: 16,
      destination: "Wajaale",
      time: "09:00 AM",
      busNo: "BJ-19",
      attendance: "Present",
      ticketNo: "TKT-00106",
      gender: "Male",
      age: "22",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    },
    {
      sn: 7,
      name: "Ahmed Alulan",
      phone: "0915566778",
      seatNo: 16,
      destination: "Wajaale",
      time: "09:30 AM",
      busNo: "BJ-21",
      attendance: "Present",
      ticketNo: "TKT-00107",
      gender: "Male",
      age: "34",
      paymentStatus: "Paid",
      paymentMethod: "CBE Birr"
    },
    {
      sn: 8,
      name: "Xadiis Faarax",
      phone: "0916677889",
      seatNo: 16,
      destination: "Wajaale",
      time: "10:00 AM",
      busNo: "BJ-11",
      attendance: "Absent",
      ticketNo: "TKT-00108",
      gender: "Male",
      age: "29",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    },
    {
      sn: 9,
      name: "Cigaani Xasan",
      phone: "0917788990",
      seatNo: 16,
      destination: "Wajaale",
      time: "10:30 AM",
      busNo: "BJ-18",
      attendance: "Present",
      ticketNo: "TKT-00109",
      gender: "Male",
      age: "37",
      paymentStatus: "Paid",
      paymentMethod: "CBE Birr"
    },
    {
      sn: 10,
      name: "Xasan Maxamed",
      phone: "0918899001",
      seatNo: 16,
      destination: "Wajaale",
      time: "11:00 AM",
      busNo: "BJ-22",
      attendance: "Present",
      ticketNo: "TKT-00110",
      gender: "Male",
      age: "31",
      paymentStatus: "Paid",
      paymentMethod: "HelloCash"
    },
    {
      sn: 11,
      name: "Sahra Mohamed",
      phone: "0914455667",
      seatNo: 6,
      destination: "Wajaale",
      time: "06:30 AM",
      busNo: "BJ-21",
      attendance: "Absent",
      ticketNo: "TKT-00111",
      gender: "Female",
      age: "24",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    },
    {
      sn: 12,
      name: "Hodan Abdi",
      phone: "0918899001",
      seatNo: 10,
      destination: "Wajaale",
      time: "06:30 AM",
      busNo: "BJ-21",
      attendance: "Present",
      ticketNo: "TKT-00112",
      gender: "Female",
      age: "29",
      paymentStatus: "Paid",
      paymentMethod: "CBE Birr"
    },

    // Dhagaxbuur (TRP-002) - matches handwritten file
    {
      sn: 13,
      name: "Mwraf Abdi",
      phone: "0919900112",
      seatNo: 14,
      destination: "Dhagaxbuur",
      time: "07:30 AM",
      busNo: "BJ-24",
      attendance: "Present",
      ticketNo: "TKT-00201",
      gender: "Female",
      age: "26",
      paymentStatus: "Paid",
      paymentMethod: "Cash"
    },
    {
      sn: 14,
      name: "Maxamed Cilaahi",
      phone: "0911122233",
      seatNo: 17,
      destination: "Dhagaxbuur",
      time: "09:15 AM",
      busNo: "BJ-27",
      attendance: "Absent",
      ticketNo: "TKT-00202",
      gender: "Male",
      age: "33",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    },
    {
      sn: 15,
      name: "Cigaas",
      phone: "0912233344",
      seatNo: 15,
      destination: "Dhagaxbuur",
      time: "11:15 AM",
      busNo: "BJ-26",
      attendance: "Present",
      ticketNo: "TKT-00203",
      gender: "Male",
      age: "40",
      paymentStatus: "Paid",
      paymentMethod: "CBE Birr"
    },
    {
      sn: 16,
      name: "Nasriidin Ahmed",
      phone: "0912344321",
      seatNo: 17,
      destination: "Dhagaxbuur",
      time: "07:30 AM",
      busNo: "BJ-24",
      attendance: "Pending",
      ticketNo: "TKT-00204",
      gender: "Male",
      age: "22",
      paymentStatus: "Pending",
      paymentMethod: "Cash"
    },
    {
      sn: 17,
      name: "Hassan Doran",
      phone: "0919988776",
      seatNo: 15,
      destination: "Dhagaxbuur",
      time: "07:30 AM",
      busNo: "BJ-24",
      attendance: "Present",
      ticketNo: "TKT-00205",
      gender: "Male",
      age: "47",
      paymentStatus: "Paid",
      paymentMethod: "Bank Transfer"
    },
    {
      sn: 18,
      name: "Jubar Maxamed",
      phone: "0915544332",
      seatNo: 14,
      destination: "Dhagaxbuur",
      time: "07:30 AM",
      busNo: "BJ-24",
      attendance: "Present",
      ticketNo: "TKT-00206",
      gender: "Male",
      age: "35",
      paymentStatus: "Paid",
      paymentMethod: "Telebirr"
    }
  ],
  buses: [
    {
      busNo: "BJ-21",
      plateNo: "ET-3-A12903",
      model: "Yutong Coach F12+",
      capacity: 40,
      driverName: "Abdi Hassan",
      status: "Active",
      fuelLevel: 85,
      nextMaintenance: "2026-08-15"
    },
    {
      busNo: "BJ-11",
      plateNo: "ET-3-B98124",
      model: "Scania Touring HD",
      capacity: 36,
      driverName: "Mohamed Ali",
      status: "Active",
      fuelLevel: 92,
      nextMaintenance: "2026-07-28"
    },
    {
      busNo: "BJ-26",
      plateNo: "ET-3-A44231",
      model: "Yutong Star 2025",
      capacity: 32,
      driverName: "Yusuf Aden",
      status: "Active",
      fuelLevel: 45,
      nextMaintenance: "2026-07-12"
    },
    {
      busNo: "BJ-22",
      plateNo: "ET-3-A55812",
      model: "Volvo B11R Elite",
      capacity: 40,
      driverName: "Abdirahman Yusuf",
      status: "Active",
      fuelLevel: 70,
      nextMaintenance: "2026-09-01"
    },
    {
      busNo: "BJ-03",
      plateNo: "ET-3-B22119",
      model: "Golden Dragon Cruiser",
      capacity: 36,
      driverName: "Ibrahim K.",
      status: "Active",
      fuelLevel: 62,
      nextMaintenance: "2026-07-20"
    },
    {
      busNo: "BJ-19",
      plateNo: "ET-3-C99811",
      model: "Yutong Coach F12+",
      capacity: 40,
      driverName: "None Assigned",
      status: "Maintenance",
      fuelLevel: 12,
      nextMaintenance: "2026-07-05"
    }
  ],
  drivers: [
    {
      name: "Abdi Hassan",
      phone: "0911223344",
      licenseNo: "DL-ET98123A",
      experience: "8 Years",
      assignedBus: "BJ-21",
      assignedRoute: "Jigjiga → Wajaale",
      availability: "Active",
      rating: 4.8
    },
    {
      name: "Mohamed Ali",
      phone: "0911556677",
      licenseNo: "DL-ET44122B",
      experience: "12 Years",
      assignedBus: "BJ-11",
      assignedRoute: "Jigjiga → Dhagaxbuur",
      availability: "Active",
      rating: 4.9
    },
    {
      name: "Yusuf Aden",
      phone: "0911889900",
      licenseNo: "DL-ET33912C",
      experience: "5 Years",
      assignedBus: "BJ-26",
      assignedRoute: "Jigjiga → Dire Dawa",
      availability: "Active",
      rating: 4.5
    },
    {
      name: "Abdirahman Yusuf",
      phone: "0912233445",
      licenseNo: "DL-ET88231D",
      experience: "10 Years",
      assignedBus: "BJ-22",
      assignedRoute: "Jigjiga → Qabribayah",
      availability: "Active",
      rating: 4.7
    },
    {
      name: "Ibrahim K.",
      phone: "0913344556",
      licenseNo: "DL-ET77213E",
      experience: "6 Years",
      assignedBus: "BJ-03",
      assignedRoute: "Jigjiga → Godey",
      availability: "Active",
      rating: 4.6
    }
  ],
  cargo: [
    {
      trackingNo: "CRG-881230",
      sender: "Guled Warsame",
      receiver: "Nasra Aden",
      receiverPhone: "0912998811",
      origin: "Jigjiga",
      destination: "Wajaale",
      weight: 15.5,
      type: "Box - Electronic Spares",
      price: 350,
      status: "Warehouse",
      date: "2026-07-04"
    },
    {
      trackingNo: "CRG-881231",
      sender: "Deqo Salad",
      receiver: "Faisal Ibrahim",
      receiverPhone: "0911334455",
      origin: "Jigjiga",
      destination: "Dire Dawa",
      weight: 8.2,
      type: "Envelope - Documents",
      price: 150,
      status: "In Transit",
      date: "2026-07-04"
    },
    {
      trackingNo: "CRG-881232",
      sender: "Mohamud K.",
      receiver: "Halimo Garaad",
      receiverPhone: "0915556677",
      origin: "Jigjiga",
      destination: "Dhagaxbuur",
      weight: 45.0,
      type: "Sack - Clothes",
      price: 800,
      status: "Delivered",
      date: "2026-07-03"
    }
  ],
  auditLogs: [
    {
      id: "LOG-001",
      timestamp: "2026-07-04T08:30:00-07:00",
      user: "Ahmed Ali (Admin)",
      action: "Initialize System",
      details: "ERP core boot up and seed data loading complete."
    }
  ],
  currentUser: {
    username: "ahmed_ali",
    role: "Admin",
    name: "Ahmed Ali"
  }
};

// Lazy initialization function for State
async function getOrInitState(): Promise<ERPState> {
  try {
    await fs.access(STATE_FILE_PATH);
    const data = await fs.readFile(STATE_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // If not exists, save initial state
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(INITIAL_STATE, null, 2), "utf-8");
    return INITIAL_STATE;
  }
}

// Save state function
async function saveState(state: ERPState): Promise<void> {
  await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

// API Routes

// Retrieve entire ERP State
app.get("/api/state", async (req, res) => {
  try {
    const state = await getOrInitState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load state", details: error.message });
  }
});

// Update State
app.post("/api/state", async (req, res) => {
  try {
    const newState = req.body as ERPState;
    await saveState(newState);
    res.json({ success: true, message: "State saved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save state", details: error.message });
  }
});

// Reset State
app.post("/api/state/reset", async (req, res) => {
  try {
    await saveState(INITIAL_STATE);
    res.json({ success: true, message: "State reset to seed data successful" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reset state", details: error.message });
  }
});

// Gemini Handwritten Manifest Ingestion!
app.post("/api/gemini/analyze-manifest", async (req, res) => {
  try {
    const { image, tripId } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No manifest image provided." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured in environment variables. Please set it in Settings > Secrets."
      });
    }

    // Clean up base64 prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = "image/jpeg";

    // Initialize the GoogleGenAI client (with proper telemetry User-Agent)
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // We will instruct Gemini to transcribe the manifest and output structured JSON
    const systemInstruction = `
      You are an expert OCR and Transportation Manifest parser for Barako Transportation & Logistics.
      Your task is to analyze hand-written registers of bus passengers from clipboard sheets and transcribe them into a structured JSON array.
      Look at the columns 'S/N', 'Magaca' (Name), 'Seat' (Seat No), 'Time' (Departure Time), 'To City' (Destination), and 'Bus No'.
      Transcribe as many names as clearly legible.
      
      Generate an array of passenger objects, each containing:
      - name: exact parsed Somali/Arabic/English name (e.g. 'Mustafe Yuusuf')
      - phone: generate a realistic phone starting with '09' (e.g. 0910000000 + random digits, or extract if any)
      - seatNo: integer parsed from the Seat column
      - destination: the parsed destination (e.g. 'Wajaale', 'Dhagaxbuur', 'Dire Dawa')
      - time: the parsed time (e.g. '07:30 AM')
      - busNo: parsed bus number or corresponding 'BJ-XX' (e.g. 'BJ-26' if Bus No is 26)
      - attendance: set default to "Pending"
      - paymentStatus: set default to "Paid"
      - paymentMethod: set default to "Telebirr"
      - gender: infer 'Male' or 'Female' if possible, else 'Male'
      - age: a realistic age between 20 and 55
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: "Analyze this handwritten clipboard manifest sheet. Transcribe the passengers and output a raw JSON array of objects conforming to the system schema instructions. Do not wrap in markdown blocks, return ONLY valid parsable JSON."
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Parsed full passenger name" },
              phone: { type: Type.STRING, description: "Realistic phone number" },
              seatNo: { type: Type.INTEGER, description: "Seat number on the bus" },
              destination: { type: Type.STRING, description: "Destination city" },
              time: { type: Type.STRING, description: "Departure time" },
              busNo: { type: Type.STRING, description: "Bus identifier" },
              attendance: { type: Type.STRING, description: "Attendance state: Pending, Present or Absent" },
              paymentStatus: { type: Type.STRING, description: "Payment status: Paid or Pending" },
              paymentMethod: { type: Type.STRING, description: "Payment method" },
              gender: { type: Type.STRING, description: "Male or Female" },
              age: { type: Type.STRING, description: "Age of passenger" }
            },
            required: ["name", "seatNo", "destination", "time", "busNo"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const parsedPassengers = JSON.parse(text);

    // Save newly parsed passengers into our local State
    const state = await getOrInitState();
    
    // Assign incremental ticket numbers and add them
    let maxSn = state.passengers.length > 0 ? Math.max(...state.passengers.map(p => p.sn)) : 0;
    
    const added: Passenger[] = parsedPassengers.map((p: any, idx: number) => {
      maxSn++;
      return {
        sn: maxSn,
        name: p.name || "Unknown Passenger",
        phone: p.phone || `091${Math.floor(1000000 + Math.random() * 9000000)}`,
        seatNo: p.seatNo || (idx + 20),
        destination: p.destination || "Wajaale",
        time: p.time || "08:00 AM",
        busNo: p.busNo || "BJ-21",
        attendance: "Pending",
        ticketNo: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        gender: p.gender || "Male",
        age: p.age || "32",
        paymentStatus: p.paymentStatus || "Paid",
        paymentMethod: p.paymentMethod || "CBE Birr"
      };
    });

    // Append to passengers
    state.passengers.push(...added);

    // Record audit log
    state.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: "Ahmed Ali (Admin)",
      action: "AI Ingestion",
      details: `Successfully transcribed and imported ${added.length} passengers from handwritten clipboard manifest.`
    });

    await saveState(state);

    res.json({ success: true, count: added.length, passengers: added });
  } catch (error: any) {
    console.error("Gemini Ingestion error:", error);
    res.status(500).json({ error: "Failed to analyze manifest with Gemini", details: error.message });
  }
});

// Configure Vite middleware in Dev or Static files in Prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Barako ERP Server] running on http://localhost:${PORT}`);
  });
}

start();
