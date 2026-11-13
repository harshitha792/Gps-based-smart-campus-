import library from "@/assets/library.jpg";
import cafeteria from "@/assets/cafeteria.jpg";
import lab from "@/assets/computer-lab.jpg";
import sports from "@/assets/sports.jpg";
import techfest from "@/assets/techfest.jpg";
import entrance from "@/assets/campus-entrance.jpg";

export type PlaceCategory = "Classrooms" | "Labs" | "Library" | "Cafeteria" | "Facilities";
export type Place = {
  id: string; name: string; category: PlaceCategory; block: string; hours: string;
  open: [number, number]; lat: number; lng: number; image: string; description: string;
};

export const PLACES: Place[] = [
  { id: "lib", name: "Central Library", category: "Library", block: "Academic Block", hours: "8:00 AM – 10:00 PM", open: [8, 22], lat: 13.1172, lng: 77.6341, image: library, description: "Five floors of books, journals, digital resources and silent study zones." },
  { id: "caf", name: "Food Court", category: "Cafeteria", block: "Student Centre", hours: "7:00 AM – 9:00 PM", open: [7, 21], lat: 13.1160, lng: 77.6356, image: cafeteria, description: "Multi-cuisine food court with indoor and outdoor seating." },
  { id: "lab", name: "Computer Lab", category: "Labs", block: "Block B", hours: "8:00 AM – 8:00 PM", open: [8, 20], lat: 13.1176, lng: 77.6352, image: lab, description: "240 workstations with high-speed internet and licensed software." },
  { id: "acad", name: "Academic Block A", category: "Classrooms", block: "Block A", hours: "8:00 AM – 6:00 PM", open: [8, 18], lat: 13.1168, lng: 77.6335, image: entrance, description: "Lecture halls and smart classrooms for UG programmes." },
  { id: "sports", name: "Sports Complex", category: "Facilities", block: "East Campus", hours: "6:00 AM – 9:00 PM", open: [6, 21], lat: 13.1152, lng: 77.6362, image: sports, description: "Football ground, indoor courts, gym and athletics track." },
  { id: "aud", name: "Auditorium", category: "Facilities", block: "Main Building", hours: "9:00 AM – 7:00 PM", open: [9, 19], lat: 13.1164, lng: 77.6344, image: techfest, description: "1,500-seat auditorium for events, fests and convocations." },
  { id: "hostel", name: "Hostel", category: "Facilities", block: "North Campus", hours: "Open 24 hours", open: [0, 24], lat: 13.1183, lng: 77.6338, image: entrance, description: "Residential blocks with mess, laundry and common rooms." },
];

export const isOpenNow = (p: Place, d = new Date()) => { const h = d.getHours(); return h >= p.open[0] && h < p.open[1]; };

export type CampusEvent = { id: string; title: string; date: string; time: string; venue: string; tag: string; image: string; description: string; demo?: boolean };
export const EVENTS: CampusEvent[] = [
  { id: "e1", title: "Campus Innovation Hackathon", date: "2026-11-20", time: "9:30 AM", venue: "REVA Campus", tag: "Technical", image: techfest, demo: true, description: "A 24-hour team challenge to prototype smarter campus services." },
  { id: "e2", title: "Inter-Department Sports", date: "2026-11-25", time: "8:00 AM", venue: "Sports Complex", tag: "Sports", image: sports, demo: true, description: "Football, cricket, basketball and athletics between departments." },
  { id: "e3", title: "Cultural Fest", date: "2026-12-05", time: "5:00 PM", venue: "Open Grounds", tag: "Cultural", image: entrance, demo: true, description: "Music, dance and drama performances from campus clubs." },
  { id: "e4", title: "Library Research Week", date: "2026-12-10", time: "10:00 AM", venue: "Central Library", tag: "Academic", image: library, demo: true, description: "Sessions on research databases, citation tools and publishing." },
  { id: "e5", title: "AI for Good Hackathon", date: "2026-11-28", time: "9:00 AM", venue: "Computer Lab", tag: "Technical", image: techfest, demo: true, description: "Build responsible AI prototypes for accessibility, education and community wellbeing." },
  { id: "e6", title: "Cybersecurity Hackathon", date: "2026-12-12", time: "9:00 AM", venue: "Computer Lab", tag: "Technical", image: techfest, demo: true, description: "Team-based defensive security challenges in an isolated practice environment." },
  { id: "e7", title: "Green Campus Hackathon", date: "2027-01-09", time: "9:30 AM", venue: "REVA Campus", tag: "Technical", image: techfest, demo: true, description: "Prototype solutions for energy efficiency, waste reduction and sustainable transport." },
  { id: "e8", title: "Robotics Challenge", date: "2026-12-15", time: "10:00 AM", venue: "REVA Campus", tag: "Technical", image: lab, demo: true, description: "Design, test and demonstrate robots in team obstacle-course challenges." },
  { id: "e9", title: "Startup Pitch Day", date: "2026-12-18", time: "11:00 AM", venue: "Auditorium", tag: "Academic", image: entrance, demo: true, description: "Present early-stage ideas and receive feedback from a campus mentor panel." },
  { id: "e10", title: "Research Poster Symposium", date: "2027-01-12", time: "10:00 AM", venue: "Academic Block A", tag: "Academic", image: library, demo: true, description: "Share research posters and meet collaborators across departments." },
  { id: "e11", title: "Faculty Teaching Workshop", date: "2027-01-15", time: "2:00 PM", venue: "Academic Block A", tag: "Academic", image: lab, demo: true, description: "Exchange ideas for inclusive teaching, assessment and classroom engagement." },
  { id: "e12", title: "Campus Staff Wellness Day", date: "2027-01-18", time: "8:30 AM", venue: "Sports Complex", tag: "Sports", image: sports, demo: true, description: "A campus wellbeing session with group activities for working staff." },
  { id: "e13", title: "Photography & Arts Exhibition", date: "2027-01-22", time: "11:00 AM", venue: "REVA Campus", tag: "Cultural", image: entrance, demo: true, description: "A showcase of photography, painting and creative work from the campus community." },
  { id: "e14", title: "Inter-Department Debate", date: "2027-01-25", time: "2:00 PM", venue: "Auditorium", tag: "Academic", image: library, demo: true, description: "Friendly debates on technology, sustainability and society." },
  { id: "e15", title: "Music & Open Mic Evening", date: "2027-01-29", time: "5:00 PM", venue: "Open Grounds", tag: "Cultural", image: entrance, demo: true, description: "Music, spoken word and acoustic performances from students, faculty and staff." },
];

export type Notice = { id: string; title: string; date: string; body: string };
export const NOTICES: Notice[] = [
  { id: "n1", title: "Internal Hackathon Registrations Open", date: "2026-11-12", body: "Teams of up to 4 can register on the department portal until Nov 18." },
  { id: "n2", title: "Library Timings Update", date: "2026-11-10", body: "During exams the Central Library stays open until 11:00 PM." },
  { id: "n3", title: "Exam Schedule Released", date: "2026-11-08", body: "End-semester exam timetable is now available on the student portal." },
  { id: "n4", title: "Hostel Mess Menu", date: "2026-11-06", body: "The revised weekly menu is posted on hostel notice boards." },
  { id: "n5", title: "Campus Wi‑Fi Upgrade", date: "2026-11-02", body: "Expect brief outages in Block B between 10 PM and 2 AM this week." },
];

export const fmtDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
