package com.ridgeway.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BriefingReport {
    private String generatedAt;
    private String overallRisk; // LOW, MEDIUM, HIGH
    private String executiveSummary;
    private List<BriefingItem> items;
    private List<String> followUpActions;
    private List<String> droneFindings;
    private boolean approved;
    private String approvedBy;

    public static class BriefingItem {
        private String eventId;
        private String time;
        private String description;
        private String classification; // HARMLESS, MONITOR, ESCALATE
        private String reasoning;
        private boolean overriddenByHuman;
        private String humanNote;

        public BriefingItem() {}

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getClassification() { return classification; }
        public void setClassification(String classification) { this.classification = classification; }
        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }
        public boolean isOverriddenByHuman() { return overriddenByHuman; }
        public void setOverriddenByHuman(boolean overriddenByHuman) { this.overriddenByHuman = overriddenByHuman; }
        public String getHumanNote() { return humanNote; }
        public void setHumanNote(String humanNote) { this.humanNote = humanNote; }
    }

    public BriefingReport() {}

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
    public String getOverallRisk() { return overallRisk; }
    public void setOverallRisk(String overallRisk) { this.overallRisk = overallRisk; }
    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    public List<BriefingItem> getItems() { return items; }
    public void setItems(List<BriefingItem> items) { this.items = items; }
    public List<String> getFollowUpActions() { return followUpActions; }
    public void setFollowUpActions(List<String> followUpActions) { this.followUpActions = followUpActions; }
    public List<String> getDroneFindings() { return droneFindings; }
    public void setDroneFindings(List<String> droneFindings) { this.droneFindings = droneFindings; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
}
