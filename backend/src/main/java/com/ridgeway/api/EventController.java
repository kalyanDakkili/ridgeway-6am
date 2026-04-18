package com.ridgeway.api;

import com.ridgeway.data.SeedDataLoader;
import com.ridgeway.model.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class EventController {

    @Autowired
    private SeedDataLoader seedData;

    @GetMapping("/events")
    public List<Event> getAllEvents() {
        return seedData.getAllEvents();
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable String id) {
        return seedData.getEventById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/events/{id}/status")
    public ResponseEntity<Event> updateStatus(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        String status = body.get("status");
        seedData.updateEventStatus(id, status);
        return seedData.getEventById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/drone/waypoints")
    public List<Map<String, Object>> getDroneWaypoints() {
        return seedData.getDroneWaypoints();
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "ok",
            "service", "Ridgeway 6:10 AM Intelligence Platform",
            "version", "1.0.0"
        );
    }
}
