package com.ridgeway.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ridgeway.model.AgentStep;
import com.ridgeway.model.BriefingReport;
import com.ridgeway.tools.ToolRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.util.*;

@Service
public class AgentService {

    @Autowired
    private AnthropicClient anthropicClient;

    @Autowired
    private ToolRegistry toolRegistry;

    private final ObjectMapper mapper = new ObjectMapper();

    private volatile BriefingReport lastBriefing = null;
    private final List<AgentStep> lastRunSteps = Collections.synchronizedList(new ArrayList<>());

    private static final String SYSTEM_PROMPT = """
        You are ARIA (Automated Ridgeway Intelligence Assistant), the overnight AI analyst for Ridgeway Site.

        It is 6:10 AM. Maya (operations lead) needs to understand everything that happened last night before Nisha (site head) arrives at 8:00 AM for the morning review.

        YOUR MISSION:
        1. Systematically investigate ALL overnight events using every available tool
        2. Cross-reference events — look for patterns and connections (e.g. badge fails near Block C + open door found by drone)
        3. Be honest about uncertainty — never make confident claims without evidence
        4. Distinguish noise from genuine concerns
        5. Generate a complete, structured morning briefing after thorough investigation

        INVESTIGATION ORDER (follow this):
        1. Call get_fence_alerts — check Gate 3 alert (wind? sensor fault?)
        2. Call get_badge_swipes — check all badge failures (hardware fault? suspicious?)
        3. Call get_vehicle_movements — trace the unknown vehicle (entry + exit)
        4. Call get_drone_patrol_log — what did the drone actually observe?
        5. Call generate_briefing — with EVERY event classified and full context

        CLASSIFICATION GUIDE:
        - HARMLESS: Explainable, low risk, no action needed
        - MONITOR: Ambiguous or worth watching, low urgency
        - ESCALATE: Requires immediate attention or leadership awareness

        IMPORTANT:
        - You MUST call generate_briefing at the end with ALL 8 events classified
        - Surface uncertainty honestly (e.g. "camera was offline so we can't confirm")
        - Connect related events (the badge fails at Block C + the open door found by drone are likely connected)
        - Keep reasoning concise but evidence-based
        """;

    public Flux<AgentStep> runInvestigation() {
        return Flux.create(sink -> {
            try {
                lastRunSteps.clear();
                runAgentLoop(sink);
                // Send explicit DONE event so frontend knows stream is complete
                AgentStep done = new AgentStep();
                done.setStepType("DONE");
                sink.next(done);
                sink.complete();
            } catch (Exception e) {
                AgentStep err = AgentStep.error("Investigation failed: " + e.getMessage());
                emit(sink, err);
                AgentStep done = new AgentStep();
                done.setStepType("DONE");
                sink.next(done);
                sink.complete();
            }
        });
    }

    private void runAgentLoop(FluxSink<AgentStep> sink) throws Exception {
        List<Map<String, Object>> messages = new ArrayList<>();
        List<Map<String, Object>> tools = toolRegistry.getToolDefinitions();

        messages.add(Map.of(
            "role", "user",
            "content", "It is 6:10 AM at Ridgeway Site. Please investigate all overnight events and prepare the complete morning briefing for Maya. Use every available tool systematically."
        ));

        emit(sink, AgentStep.thinking("Starting overnight investigation for Ridgeway Site — 8 signals to analyse..."));

        int maxIterations = 12;
        int iteration = 0;

        while (iteration < maxIterations) {
            iteration++;

            JsonNode response = anthropicClient.sendMessage(messages, tools, SYSTEM_PROMPT);
            String stopReason = response.path("stop_reason").asText();
            JsonNode content = response.path("content");

            // Build assistant message
            List<Object> assistantContent = new ArrayList<>();
            for (JsonNode block : content) {
                assistantContent.add(mapper.convertValue(block, Map.class));
            }
            messages.add(Map.of("role", "assistant", "content", assistantContent));

            List<Map<String, Object>> toolResults = new ArrayList<>();

            for (JsonNode block : content) {
                String blockType = block.path("type").asText();

                if ("text".equals(blockType)) {
                    String text = block.path("text").asText().trim();
                    if (!text.isBlank()) {
                        emit(sink, AgentStep.thinking(text));
                    }
                } else if ("tool_use".equals(blockType)) {
                    String toolName = block.path("name").asText();
                    String toolUseId = block.path("id").asText();
                    Map<String, Object> toolInput = mapper.convertValue(block.path("input"), Map.class);

                    emit(sink, AgentStep.toolCall(toolName, toolInput));

                    Object result = toolRegistry.executeTool(toolName, toolInput);

                    // If briefing generated, build the BriefingReport object
                    if ("generate_briefing".equals(toolName)) {
                        lastBriefing = buildBriefingFromInput(toolInput);
                    }

                    emit(sink, AgentStep.toolResult(toolName, result));

                    toolResults.add(Map.of(
                        "type", "tool_result",
                        "tool_use_id", toolUseId,
                        "content", mapper.writeValueAsString(result)
                    ));
                }
            }

            if (!toolResults.isEmpty()) {
                messages.add(Map.of("role", "user", "content", toolResults));
            }

            if ("end_turn".equals(stopReason) && toolResults.isEmpty()) {
                emit(sink, AgentStep.conclusion("Investigation complete. Morning briefing ready for Maya's review."));
                break;
            }
        }
    }

    @SuppressWarnings("unchecked")
    private BriefingReport buildBriefingFromInput(Map<String, Object> input) {
        BriefingReport report = new BriefingReport();
        report.setGeneratedAt("6:10 AM");
        report.setOverallRisk((String) input.getOrDefault("overall_risk", "MEDIUM"));
        report.setExecutiveSummary((String) input.getOrDefault("executive_summary", ""));
        report.setApproved(false);

        Object fu = input.get("follow_up_actions");
        if (fu instanceof List) report.setFollowUpActions((List<String>) fu);

        Object df = input.get("drone_findings");
        if (df instanceof List) report.setDroneFindings((List<String>) df);

        List<BriefingReport.BriefingItem> items = new ArrayList<>();
        Object classifications = input.get("event_classifications");

        // Claude sometimes returns classifications as a JSON string instead of a parsed array.
        // Parse it here if needed.
        List<?> classificationList = null;
        if (classifications instanceof List) {
            classificationList = (List<?>) classifications;
        } else if (classifications instanceof String) {
            try {
                JsonNode node = mapper.readTree((String) classifications);
                if (node.isArray()) {
                    classificationList = mapper.convertValue(node, List.class);
                }
            } catch (Exception e) {
                // ignore parse errors — items will remain empty
            }
        }

        if (classificationList != null) {
            for (Object c : classificationList) {
                if (c instanceof Map<?, ?>) {
                    Map<String, Object> m = (Map<String, Object>) c;
                    BriefingReport.BriefingItem item = new BriefingReport.BriefingItem();
                    item.setEventId(str(m.get("event_id")));
                    item.setClassification(normalizeClassification(str(m.get("classification"))));
                    item.setReasoning(str(m.get("reasoning")));
                    item.setDescription(str(m.getOrDefault("description", "")));
                    item.setTime(str(m.getOrDefault("time", "")));
                    items.add(item);
                }
            }
        }
        report.setItems(items);
        return report;
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }

    /** Normalise any variant the model might return to HARMLESS / MONITOR / ESCALATE */
    private String normalizeClassification(String raw) {
        if (raw == null) return "MONITOR";
        String upper = raw.trim().toUpperCase();
        if (upper.contains("HARMLESS") || upper.contains("LOW") || upper.contains("CLEAR")) return "HARMLESS";
        if (upper.contains("ESCALATE") || upper.contains("HIGH") || upper.contains("CRITICAL")) return "ESCALATE";
        return "MONITOR";
    }

    private void emit(FluxSink<AgentStep> sink, AgentStep step) {
        lastRunSteps.add(step);
        sink.next(step);
    }

    public BriefingReport getLastBriefing() { return lastBriefing; }
    public List<AgentStep> getLastRunSteps() { return Collections.unmodifiableList(lastRunSteps); }
    public void updateBriefing(BriefingReport updated) { this.lastBriefing = updated; }
}