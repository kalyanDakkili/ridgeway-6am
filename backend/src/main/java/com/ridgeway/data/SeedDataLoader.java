package com.ridgeway.data;

import com.ridgeway.model.Event;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SeedDataLoader {

    private final List<Event> events = new ArrayList<>();
    private final List<Map<String, Object>> droneWaypoints = new ArrayList<>();

    public SeedDataLoader() {
        loadEvents();
        loadDroneWaypoints();
    }

    private void loadEvents() {
        events.add(new Event(
            "EVT-001", "01:14 AM", "FENCE_ALERT", "North Perimeter", "Gate 3 — North Perimeter Fence",
            "Motion sensor triggered on north perimeter fence near Gate 3. No camera confirmation available (camera offline). Wind speed recorded at 12 km/h. Sensor FENCE-N-07 has 2 prior false positives this month.",
            "MEDIUM",
            Map.of("sensor_id", "FENCE-N-07", "duration_seconds", 8, "wind_speed_kmh", 12, "camera_status", "OFFLINE", "prior_false_positives", 2),
            51.505, -0.09
        ));

        events.add(new Event(
            "EVT-002", "01:31 AM", "VEHICLE_PATH", "Restricted Storage Yard B", "Storage Yard B — Restricted Zone",
            "Unregistered vehicle detected entering restricted Storage Yard B via service road 4. No access authorization on file. No scheduled deliveries between 00:00–06:00. CCTV on service road 4 under maintenance.",
            "HIGH",
            Map.of("vehicle_plate", "UNKNOWN", "entry_point", "Service Road 4", "authorization", "NONE", "registration_status", "UNREGISTERED", "cctv_status", "UNDER_MAINTENANCE"),
            51.506, -0.088
        ));

        events.add(new Event(
            "EVT-003", "02:05 AM", "BADGE_SWIPE_FAIL", "Access Control", "Access Point 7 — Block C Entry",
            "Employee EMP-441 (Arjun Mehta, Maintenance Tech) failed badge authentication. 3 consecutive failed attempts. Badge reported intermittent fault last week (IT Ticket TKT-882). Night shift, Block C authorized.",
            "HIGH",
            Map.of("employee_id", "EMP-441", "employee_name", "Arjun Mehta", "attempts", 3, "access_point", "AP-07", "shift", "NIGHT", "badge_ticket", "TKT-882"),
            51.504, -0.091
        ));

        events.add(new Event(
            "EVT-004", "02:07 AM", "BADGE_SWIPE_FAIL", "Access Control", "Access Point 7 — Block C Entry",
            "Employee EMP-209 (Priya Nair, Quality Inspector) failed badge authentication. Single failed attempt. Successfully entered via alternate route minutes later.",
            "LOW",
            Map.of("employee_id", "EMP-209", "employee_name", "Priya Nair", "attempts", 1, "access_point", "AP-07", "shift", "NIGHT", "resolution", "Used alternate route"),
            51.504, -0.091
        ));

        events.add(new Event(
            "EVT-005", "02:09 AM", "BADGE_SWIPE_FAIL", "Access Control", "Access Point 7 — Block C Entry",
            "EMP-441 (Arjun Mehta) attempted again — 2 more failed badge swipes within 4 minutes of prior attempts. Total: 5 failed attempts tonight. Raghav left note: 'Please check Block C before leadership asks.'",
            "HIGH",
            Map.of("employee_id", "EMP-441", "employee_name", "Arjun Mehta", "attempts", 2, "total_attempts_tonight", 5, "access_point", "AP-07", "supervisor_note", "Check Block C — Raghav"),
            51.504, -0.091
        ));

        events.add(new Event(
            "EVT-006", "02:45 AM", "DRONE_PATROL", "Full Perimeter", "Patrol Route Alpha — Launch",
            "Scheduled night patrol drone DRONE-01 launched. Route covers Gate 3 perimeter, Block C, Access Point 7, Storage Yard B. Estimated flight duration 38 minutes.",
            "LOW",
            Map.of("drone_id", "DRONE-01", "patrol_id", "PAT-2024-047", "route", "ALPHA", "duration_minutes", 38, "scheduled", true),
            51.505, -0.089
        ));

        events.add(new Event(
            "EVT-007", "03:10 AM", "DRONE_OBSERVATION", "Block C", "Block C — East Side Door (DOOR-C-E2)",
            "Drone camera observed open east side door DOOR-C-E2 on Block C. Door is rated secured access. No personnel visible in frame at time of flyover. Confidence 91%. Follow-up required.",
            "HIGH",
            Map.of("drone_id", "DRONE-01", "observation_type", "OPEN_DOOR", "door_id", "DOOR-C-E2", "personnel_detected", false, "confidence", 0.91, "patrol_id", "PAT-2024-047"),
            51.5045, -0.0905
        ));

        events.add(new Event(
            "EVT-008", "04:50 AM", "VEHICLE_EXIT", "Main Gate", "Main Gate — Outbound Vehicle",
            "Vehicle matching description from EVT-002 logged exiting through main gate. Plate still unregistered. Security guard SEC-112 waved vehicle through without full verification. Timeline: entered 01:31, exited 04:50 — 3h19m on site.",
            "MEDIUM",
            Map.of("vehicle_plate", "UNKNOWN", "exit_point", "Main Gate", "guard_on_duty", "SEC-112", "action_taken", "WAVED_THROUGH", "linked_event", "EVT-002", "time_on_site_minutes", 199),
            51.507, -0.087
        ));
    }

    private void loadDroneWaypoints() {
        droneWaypoints.add(Map.of("lat", 51.505, "lng", -0.089, "time", "02:45 AM", "label", "Launch Pad", "observation", "Nominal launch. All systems operational. Beginning Route Alpha."));
        droneWaypoints.add(Map.of("lat", 51.505, "lng", -0.09, "time", "02:51 AM", "label", "Gate 3 Perimeter", "observation", "Fence perimeter scanned. No physical breach detected. Possible wind disturbance near sensor FENCE-N-07. Area secure."));
        droneWaypoints.add(Map.of("lat", 51.5045, "lng", -0.0905, "time", "03:10 AM", "label", "Block C — East Door", "observation", "⚠ ALERT: East side door DOOR-C-E2 found open. Rated secured access. No personnel visible in frame. Flagged for follow-up."));
        droneWaypoints.add(Map.of("lat", 51.504, "lng", -0.091, "time", "03:15 AM", "label", "Access Point 7", "observation", "Area clear at time of flyover. No active movement detected around access control panel."));
        droneWaypoints.add(Map.of("lat", 51.506, "lng", -0.088, "time", "03:20 AM", "label", "Storage Yard B", "observation", "Yard scanned — no vehicles present. Gate appears closed and secure. Vehicle from EVT-002 had departed prior to patrol."));
        droneWaypoints.add(Map.of("lat", 51.505, "lng", -0.089, "time", "03:23 AM", "label", "Return to Base", "observation", "Patrol complete. Full route covered in 38 minutes. Report generated. One critical observation flagged."));
    }

    public List<Event> getAllEvents() {
        return Collections.unmodifiableList(events);
    }

    public Optional<Event> getEventById(String id) {
        return events.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    public List<Event> getEventsByType(String type) {
        return events.stream().filter(e -> e.getType().equals(type)).toList();
    }

    public List<Event> getEventsByZone(String zone) {
        return events.stream().filter(e -> e.getZone().toLowerCase().contains(zone.toLowerCase())).toList();
    }

    public List<Map<String, Object>> getDroneWaypoints() {
        return Collections.unmodifiableList(droneWaypoints);
    }

    public void updateEventStatus(String id, String status) {
        events.stream().filter(e -> e.getId().equals(id)).findFirst().ifPresent(e -> e.setStatus(status));
    }
}
