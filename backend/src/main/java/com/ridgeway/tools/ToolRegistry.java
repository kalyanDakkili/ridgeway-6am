package com.ridgeway.tools;

import com.ridgeway.data.SeedDataLoader;
import com.ridgeway.model.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ToolRegistry {

    @Autowired
    private SeedDataLoader seedData;

    // ── MCP-style Tool Definitions sent to Claude ──────────────────────────
    public List<Map<String, Object>> getToolDefinitions() {
        return List.of(
            buildTool("get_fence_alerts",
                "Retrieve fence perimeter alert events. Returns sensor data, wind conditions, camera status, and false-positive history.",
                Map.of(
                    "zone", prop("string", "Zone name e.g. 'Gate 3', 'North Perimeter', or 'all'"),
                    "time_range", prop("string", "Time range e.g. '00:00-06:00' or 'all'")
                ),
                List.of("zone")
            ),
            buildTool("get_badge_swipes",
                "Retrieve failed or suspicious badge swipe events. Returns employee context, attempt counts, hardware fault history, and supervisor notes.",
                Map.of(
                    "access_point", prop("string", "Access point ID e.g. 'AP-07', 'Block C', or 'all'"),
                    "include_successful", propBool("Whether to include successful swipes for context")
                ),
                List.of("access_point")
            ),
            buildTool("get_vehicle_movements",
                "Retrieve vehicle entry and exit logs. Flags unregistered vehicles, restricted-zone access, and guard actions.",
                Map.of(
                    "zone", prop("string", "Zone to query e.g. 'Storage Yard B', 'Main Gate', or 'all'"),
                    "time_range", prop("string", "Time range or 'all'")
                ),
                List.of("zone")
            ),
            buildTool("get_drone_patrol_log",
                "Retrieve the drone patrol log with waypoints, timestamps, and on-site observations. Use patrol_id PAT-2024-047 for last night.",
                Map.of(
                    "patrol_id", prop("string", "Patrol ID — use PAT-2024-047"),
                    "include_waypoints", propBool("Include waypoint-by-waypoint detail")
                ),
                List.of("patrol_id")
            ),
            buildTool("generate_briefing",
                "Generate the structured morning briefing after completing all investigation steps. Call ONLY after using all relevant data-gathering tools.",
                Map.of(
                    "event_classifications", Map.of(
                        "type", "array",
                        "description", "Array of {event_id, classification, reasoning, description, time} objects for every event",
                        "items", Map.of("type", "object")
                    ),
                    "overall_risk", prop("string", "Overall site risk: LOW, MEDIUM, or HIGH"),
                    "executive_summary", prop("string", "2-3 sentence plain-English summary for Nisha (site head)"),
                    "follow_up_actions", Map.of("type", "array", "description", "Prioritised follow-up actions", "items", Map.of("type", "string")),
                    "drone_findings", Map.of("type", "array", "description", "Key drone patrol findings", "items", Map.of("type", "string"))
                ),
                List.of("event_classifications", "overall_risk", "executive_summary")
            )
        );
    }

    // ── Tool Execution ───────────────────────────────────────────────────────
    public Object executeTool(String name, Map<String, Object> input) {
        return switch (name) {
            case "get_fence_alerts"     -> getFenceAlerts(input);
            case "get_badge_swipes"     -> getBadgeSwipes(input);
            case "get_vehicle_movements"-> getVehicleMovements(input);
            case "get_drone_patrol_log" -> getDronePatrolLog(input);
            case "generate_briefing"    -> confirmBriefing(input);
            default                     -> Map.of("error", "Unknown tool: " + name);
        };
    }

    private Object getFenceAlerts(Map<String, Object> input) {
        String zone = (String) input.getOrDefault("zone", "all");
        List<Event> evts = seedData.getEventsByType("FENCE_ALERT");
        if (!"all".equalsIgnoreCase(zone)) {
            evts = evts.stream()
                .filter(e -> e.getLocation().toLowerCase().contains(zone.toLowerCase())
                          || e.getZone().toLowerCase().contains(zone.toLowerCase()))
                .toList();
        }
        return Map.of(
            "tool", "get_fence_alerts",
            "query_zone", zone,
            "total_alerts", evts.size(),
            "events", evts,
            "environmental_context", Map.of(
                "wind_speed_kmh", 12,
                "false_positive_threshold_kmh", 15,
                "camera_gate3_status", "OFFLINE — maintenance window 23:00–03:00",
                "sensor_FENCE-N-07_history", "2 false positives in last 30 days"
            )
        );
    }

    private Object getBadgeSwipes(Map<String, Object> input) {
        List<Event> evts = seedData.getEventsByType("BADGE_SWIPE_FAIL");
        return Map.of(
            "tool", "get_badge_swipes",
            "total_failures", evts.size(),
            "events", evts,
            "employee_context", Map.of(
                "EMP-441", Map.of(
                    "name", "Arjun Mehta",
                    "role", "Maintenance Technician",
                    "shift", "Night 22:00–06:00",
                    "clearance", "Block C — AUTHORISED",
                    "badge_issue", "IT Ticket TKT-882 open — intermittent fault reported last week",
                    "total_failed_tonight", 5
                ),
                "EMP-209", Map.of(
                    "name", "Priya Nair",
                    "role", "Quality Inspector",
                    "shift", "Night 22:00–06:00",
                    "clearance", "Block C — AUTHORISED",
                    "badge_issue", "None on file",
                    "resolution", "Entered via alternate route AP-08"
                )
            ),
            "supervisor_handoff", "Raghav (night supervisor): 'Please check Block C before leadership asks.' — left at end of shift."
        );
    }

    private Object getVehicleMovements(Map<String, Object> input) {
        List<Event> evts = new ArrayList<>();
        evts.addAll(seedData.getEventsByType("VEHICLE_PATH"));
        evts.addAll(seedData.getEventsByType("VEHICLE_EXIT"));
        evts.sort(Comparator.comparing(Event::getTime));
        return Map.of(
            "tool", "get_vehicle_movements",
            "total_movements", evts.size(),
            "events", evts,
            "policy_context", Map.of(
                "yard_b_policy", "Authorised contractors and scheduled deliveries only. No deliveries on record for 00:00–06:00.",
                "guard_note", "SEC-112 waved vehicle through Main Gate at 04:50. Guard reported vehicle 'appeared to be a contractor' but could not verify registration.",
                "cctv_service_road_4", "Under scheduled maintenance — no footage available for entry event at 01:31."
            )
        );
    }

    private Object getDronePatrolLog(Map<String, Object> input) {
        boolean wps = Boolean.TRUE.equals(input.getOrDefault("include_waypoints", Boolean.TRUE));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("tool", "get_drone_patrol_log");
        result.put("patrol_id", "PAT-2024-047");
        result.put("drone_id", "DRONE-01");
        result.put("launch_time", "02:45 AM");
        result.put("return_time", "03:23 AM");
        result.put("route", "ALPHA");
        result.put("zones_covered", List.of("Gate 3 Perimeter", "Block C", "Access Point 7", "Storage Yard B"));
        result.put("critical_findings", List.of(
            "Block C east side door DOOR-C-E2 found OPEN at 03:10 AM — rated secured access. No personnel in camera frame.",
            "Gate 3 perimeter showed no physical breach — consistent with wind disturbance on sensor."
        ));
        result.put("clear_findings", List.of(
            "Storage Yard B clear at 03:20 AM — vehicle from EVT-002 had already departed.",
            "Access Point 7 area clear at 03:15 AM — no activity."
        ));
        if (wps) result.put("waypoints", seedData.getDroneWaypoints());
        return result;
    }

    private Object confirmBriefing(Map<String, Object> input) {
        return Map.of(
            "status", "BRIEFING_GENERATED",
            "message", "Morning briefing compiled. Ready for Maya's review.",
            "data_received", true
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private Map<String, Object> buildTool(String name, String description,
                                           Map<String, Object> properties,
                                           List<String> required) {
        return Map.of(
            "name", name,
            "description", description,
            "input_schema", Map.of(
                "type", "object",
                "properties", properties,
                "required", required
            )
        );
    }

    private Map<String, Object> prop(String type, String desc) {
        return Map.of("type", type, "description", desc);
    }

    private Map<String, Object> propBool(String desc) {
        return Map.of("type", "boolean", "description", desc);
    }
}
