import { useState } from "react";
import { AlertTriangle, Phone, MapPin, CheckCircle, XCircle, Navigation, Star } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { sendSOS, getNearbyHospitals } from "@/lib/api";

const EMERGENCY_NUMBER = '112'; // National emergency number

interface Hospital {
  name: string; address: string; rating: number | null;
  lat: number; lng: number; open: boolean | null; phone: string | null;
}

const EmergencySOS = () => {
  const { profile } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  async function handleSOS() {
    setStatus("sending");
    try {
      const position = await new Promise<GeolocationCoordinates | null>((res) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition((p) => res(p.coords), () => res(null), { timeout: 5000 })
          : res(null)
      );

      const { data } = await sendSOS({
        user_id: profile?.id,
        name: profile?.name,
        phone: profile?.phone,
        latitude: position?.latitude,
        longitude: position?.longitude,
      });

      if (data?.trial) {
        setMsg(data.message || "SOS logged. SMS could not be sent — emergency contact number is not verified on Twilio trial account.");
      } else {
        setMsg(`SOS alert sent to your emergency contact.`);
      }
      setStatus("sent");

      // Fetch nearby hospitals — use GPS if available, else IP-based location
      setHospitalsLoading(true);
      try {
        let lat = position?.latitude;
        let lng = position?.longitude;

        // Fallback: get approximate location from IP
        if (!lat || !lng) {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipData = await ipRes.json();
          lat = ipData.latitude;
          lng = ipData.longitude;
        }

        if (lat && lng) {
          setCoords({ lat, lng });
          const { data: hospData } = await getNearbyHospitals(lat, lng);
          setHospitals(hospData || []);
        }
      } catch {}
      setHospitalsLoading(false);

    } catch (err: any) {
      const data = err?.response?.data;
      setMsg(data?.error || "Failed to send SOS. Please call emergency services directly.");
      setStatus("error");
    }
  }

  const activated = status === "sent";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in flex flex-col items-center pt-4">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground w-full">Emergency SOS</h1>

        {/* Emergency contact card */}
        <div className="clay-card p-4 w-full space-y-3">
          <div className="flex items-center gap-4">
            <div className="clay-card p-3 rounded-full bg-primary/10">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-body">Your emergency contact</p>
              <p className="font-heading font-bold text-foreground text-lg">
                {profile?.emergency_contact || "Not set — add one in your profile"}
              </p>
            </div>
            {profile?.emergency_contact && (
              <a href={`tel:${profile.emergency_contact}`} className="clay-btn px-4 py-2 rounded-xl text-sm font-body font-bold">Call</a>
            )}
          </div>
        </div>

        {/* SOS Button */}
        <div className="relative">
          {(status === "sending" || activated) && (
            <>
              <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
              <span className="absolute inset-[-15px] rounded-full bg-destructive/15 animate-ping" style={{ animationDelay: "0.3s" }} />
            </>
          )}
          <button
            onClick={status === "idle" || status === "error" ? handleSOS : () => setStatus("idle")}
            disabled={status === "sending"}
            className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center gap-3 font-heading font-extrabold text-2xl md:text-3xl transition-all duration-300 ${
              activated ? "bg-success text-white scale-110 shadow-[0_0_60px_hsl(160,50%,45%,0.5)]"
              : status === "sending" ? "bg-destructive text-white scale-105 opacity-80"
              : "clay-btn-danger rounded-full"
            }`}>
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16" />
            {status === "sending" ? "SENDING..." : activated ? "SENT ✓" : status === "error" ? "RETRY" : "SOS"}
          </button>
        </div>

        {/* Status message */}
        {(status === "sent" || status === "error") && (
          <div className={`clay-card p-5 w-full text-center animate-fade-in ${status === "sent" ? "bg-success/5 border border-success/20" : "bg-destructive/5 border border-destructive/20"}`}>
            <div className="flex justify-center mb-2">
              {status === "sent" ? <CheckCircle className="w-8 h-8 text-success" /> : <XCircle className="w-8 h-8 text-destructive" />}
            </div>
            <p className={`font-heading text-lg font-bold ${status === "sent" ? "text-success" : "text-destructive"}`}>
              {status === "sent" ? "Emergency Alert Sent!" : "Failed to Send"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground font-body">{msg}</p>
            {status === "sent" && (
              <button onClick={() => setStatus("idle")} className="mt-3 text-xs text-muted-foreground font-body underline">Send again</button>
            )}
          </div>
        )}

        {/* Nearby Hospitals — shown after SOS sent */}
        {(activated || hospitalsLoading) && (
          <div className="clay-card p-5 w-full animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-destructive" />
              <h2 className="font-heading font-bold text-foreground text-lg">Nearby Hospitals</h2>
              {coords && (
                <a href={`https://www.google.com/maps/search/hospital/@${coords.lat},${coords.lng},14z`}
                  target="_blank" rel="noreferrer"
                  className="ml-auto clay-btn px-3 py-1.5 text-xs font-body font-bold rounded-xl flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Open Maps
                </a>
              )}
            </div>

            {hospitalsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="clay-card p-4 animate-pulse bg-muted/30 h-16 rounded-xl" />
                ))}
              </div>
            )}

            {!hospitalsLoading && hospitals.length === 0 && (
              <p className="text-sm text-muted-foreground font-body text-center py-4">
                No hospitals found nearby. Use the Maps button above.
              </p>
            )}

            <div className="space-y-3">
              {hospitals.map((h, i) => (
                <div key={i} className="clay-card p-4 flex items-start gap-3">
                  <div className="clay-card w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 font-heading font-bold text-destructive text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-foreground text-sm truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">{h.address}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {h.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-warning font-body font-semibold">
                          <Star className="w-3 h-3 fill-warning" /> {h.rating}
                        </span>
                      )}
                      {h.open !== null && (
                        <span className={`text-xs font-body font-semibold px-1.5 py-0.5 rounded-full ${h.open ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {h.open ? "Open" : "Closed"}
                        </span>
                      )}
                      {h.phone && (
                        <a href={`tel:${h.phone}`} className="text-xs text-primary font-body underline">{h.phone}</a>
                      )}
                    </div>
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                    target="_blank" rel="noreferrer"
                    className="clay-btn px-3 py-2 rounded-xl text-xs font-body font-bold flex-shrink-0 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Go
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick call */}
        <div className="clay-card p-5 w-full">
          <h3 className="font-heading font-bold text-foreground mb-3">Quick Call</h3>
          <div className="grid grid-cols-3 gap-3">
            {[["Ambulance", "112"], ["Police", "100"], ["Emergency", EMERGENCY_NUMBER]].map(([label, num]) => (
              <a key={label} href={`tel:${num}`} className="clay-card p-3 text-center hover:scale-105 transition-transform">
                <p className="font-heading font-bold text-destructive text-sm">{num}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmergencySOS;
