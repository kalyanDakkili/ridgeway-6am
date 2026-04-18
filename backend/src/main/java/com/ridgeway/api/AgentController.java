package com.ridgeway.api;

import com.ridgeway.agent.AgentService;
import com.ridgeway.model.AgentStep;
import com.ridgeway.model.BriefingReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class AgentController {

    @Autowired
    private AgentService agentService;

    /** Stream investigation steps via SSE. Sends a DONE step at the end. */
    @GetMapping(value = "/investigate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<AgentStep> investigate() {
        return agentService.runInvestigation();
    }

    /** Fetch the generated briefing after investigation. */
    @GetMapping("/briefing")
    public ResponseEntity<BriefingReport> getBriefing() {
        BriefingReport b = agentService.getLastBriefing();
        return b != null ? ResponseEntity.ok(b) : ResponseEntity.noContent().build();
    }

    /** Maya approves the briefing for the morning review. */
    @PostMapping("/briefing/approve")
    public ResponseEntity<BriefingReport> approveBriefing(@RequestBody ApproveRequest req) {
        BriefingReport b = agentService.getLastBriefing();
        if (b == null) return ResponseEntity.notFound().build();
        b.setApproved(true);
        b.setApprovedBy(req.approvedBy != null ? req.approvedBy : "Maya");
        return ResponseEntity.ok(b);
    }

    /** Maya overrides a classification or adds a note to a specific event. */
    @PatchMapping("/briefing/item/{eventId}")
    public ResponseEntity<BriefingReport> updateItem(
            @PathVariable String eventId,
            @RequestBody ItemUpdateRequest req) {
        BriefingReport b = agentService.getLastBriefing();
        if (b == null) return ResponseEntity.notFound().build();
        b.getItems().stream()
            .filter(i -> eventId.equals(i.getEventId()))
            .findFirst()
            .ifPresent(item -> {
                if (req.classification != null) {
                    item.setClassification(req.classification);
                    item.setOverriddenByHuman(true);
                }
                if (req.humanNote != null) item.setHumanNote(req.humanNote);
            });
        agentService.updateBriefing(b);
        return ResponseEntity.ok(b);
    }

    /** Retrieve all agent steps from the last run. */
    @GetMapping("/steps")
    public List<AgentStep> getSteps() {
        return agentService.getLastRunSteps();
    }

    // DTOs
    public static class ApproveRequest { public String approvedBy; }
    public static class ItemUpdateRequest { public String classification; public String humanNote; }
}
