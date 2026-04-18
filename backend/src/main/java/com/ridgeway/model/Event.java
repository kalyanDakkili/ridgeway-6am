package com.ridgeway.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Event {
    private String id;
    private String time;
    private String type;
    private String zone;
    private String location;
    private String description;
    private String severity; // LOW, MEDIUM, HIGH
    private Map<String, Object> metadata;
    private double lat;
    private double lng;
    private String status; // UNREVIEWED, HARMLESS, MONITOR, ESCALATE

    public Event() {}

    public Event(String id, String time, String type, String zone, String location,
                 String description, String severity, Map<String, Object> metadata,
                 double lat, double lng) {
        this.id = id;
        this.time = time;
        this.type = type;
        this.zone = zone;
        this.location = location;
        this.description = description;
        this.severity = severity;
        this.metadata = metadata;
        this.lat = lat;
        this.lng = lng;
        this.status = "UNREVIEWED";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }
    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
