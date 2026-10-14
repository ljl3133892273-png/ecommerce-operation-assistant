from dataclasses import dataclass

from app.agents.definitions import AgentPolicyError, require_tool_permission
from app.agents.registry import AGENT_REGISTRY, TOOL_REGISTRY
from app.models import AgentRiskLevel, UserRole


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool
    requires_approval: bool
    risk_level: AgentRiskLevel
    reason: str


def authorize_tool(
        *,
        agent_key: str,
        tool_key: str,
        workspace_role: UserRole
) -> PolicyDecision:
    """授权校验工,依据Agent白名单、Workspace角色与R0-R3风险返回确定性决策"""

    agent = AGENT_REGISTRY.get(agent_key)
    tool = TOOL_REGISTRY.get(tool_key)
    if agent is None:
        raise AgentPolicyError(f"Agent is not registered: {agent_key}")
    if tool is None:
        raise AgentPolicyError(f"Tool is not registered: {tool_key}")
    if tool_key not in agent.tool_allowlist:
        raise AgentPolicyError(f"Agent {agent_key} is not allowed to use tool {tool_key}")
    if workspace_role == UserRole.VIEWER and tool.risk_level != AgentRiskLevel.R0:
        return PolicyDecision(False, False, tool.risk_level, "Viewer 只能执行只读分析")
    if tool.owner_only and workspace_role != UserRole.OWNER:
        return PolicyDecision(False, False, tool.risk_level, "该高风险动作仅 Workspace Owner 可执行")
    requires_approval = tool.risk_level in {AgentRiskLevel.R2, AgentRiskLevel.R3}
    return PolicyDecision(True, requires_approval, tool.risk_level, "策略校验通过")