package com.ridgeway.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AgentStep {
    private String stepType; // THINKING, TOOL_CALL, TOOL_RESULT, CONCLUSION, ERROR
    private String toolName;
    private Object toolInput;
    private Object toolResult;
    private String message;
    private long timestamp;

    public AgentStep() {
        this.timestamp = System.currentTimeMillis();
    }

    public static AgentStep thinking(String message) {
        AgentStep s = new AgentStep();
        s.stepType = "THINKING";
        s.message = message;
        return s;
    }

    public static AgentStep toolCall(String toolName, Object input) {
        AgentStep s = new AgentStep();
        s.stepType = "TOOL_CALL";
        s.toolName = toolName;
        s.toolInput = input;
        return s;
    }

    public static AgentStep toolResult(String toolName, Object result) {
        AgentStep s = new AgentStep();
        s.stepType = "TOOL_RESULT";
        s.toolName = toolName;
        s.toolResult = result;
        return s;
    }

    public static AgentStep conclusion(String message) {
        AgentStep s = new AgentStep();
        s.stepType = "CONCLUSION";
        s.message = message;
        return s;
    }

    public static AgentStep error(String message) {
        AgentStep s = new AgentStep();
        s.stepType = "ERROR";
        s.message = message;
        return s;
    }

    public String getStepType() { return stepType; }
    public void setStepType(String stepType) { this.stepType = stepType; }
    public String getToolName() { return toolName; }
    public void setToolName(String toolName) { this.toolName = toolName; }
    public Object getToolInput() { return toolInput; }
    public void setToolInput(Object toolInput) { this.toolInput = toolInput; }
    public Object getToolResult() { return toolResult; }
    public void setToolResult(Object toolResult) { this.toolResult = toolResult; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
